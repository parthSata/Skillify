import { Course } from "../models/course.model.js";
import { Category } from "../models/category.model.js";
import { Lecture } from "../models/lecture.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";
import { Purchase } from "../models/purchase.model.js";
import { Review } from "../models/review.model.js";

const processNewLectures = async (lectureFiles, lectureTextData) => {
  const lectureIds = [];
  if (!lectureFiles || lectureFiles.length === 0) {
    return [];
  }
  for (let i = 0; i < lectureFiles.length; i++) {
    const file = lectureFiles[i];
    const videoCloudinary = await uploadInCloudinary(file.path);

    if (videoCloudinary) {
      const lectureInfo = lectureTextData[i];
      if (!lectureInfo || !lectureInfo.title) {
        console.error(`Skipping lecture at index ${i}: Incomplete data.`);
        fs.unlinkSync(file.path);
        continue;
      }
      const newLecture = await Lecture.create({
        title: lectureInfo.title,
        duration: lectureInfo.duration,
        description: lectureInfo.description,
        videoUrl: videoCloudinary.url,
      });
      lectureIds.push(newLecture._id);
    } else {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }
  return lectureIds;
};

// PUBLIC: GET ALL APPROVED COURSES
const getAllApprovedCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isApproved: true })
    .populate("category", "name")
    .populate("tutor", "name")
    .populate("lectures", "title duration description videoUrl");

  if (!courses || courses.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No approved courses found."));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, courses, "Approved courses fetched successfully.")
    );
});

// CREATE COURSE
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, price } = req.body;
  const tutor = req.user._id;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  const lectureFiles = req.files?.lectures;
  const lectureTextData = req.body?.lectures || [];

  if (!title || !category || !tutor || !thumbnailLocalPath) {
    if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath))
      fs.unlinkSync(thumbnailLocalPath);
    if (lectureFiles)
      lectureFiles.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    throw new ApiError(
      400,
      "Title, category, and a thumbnail are required fields."
    );
  }

  const categoryDocument = await Category.findById(category);
  if (!categoryDocument) {
    if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath))
      fs.unlinkSync(thumbnailLocalPath);
    if (lectureFiles)
      lectureFiles.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    throw new ApiError(404, "Category not found.");
  }

  const thumbnailCloudinary = await uploadInCloudinary(thumbnailLocalPath);
  if (!thumbnailCloudinary) {
    throw new ApiError(500, "Failed to upload thumbnail to Cloudinary.");
  }

  const newLectureIds = await processNewLectures(lectureFiles, lectureTextData);

  const newCourse = await Course.create({
    title,
    description,
    category: categoryDocument._id,
    tutor,
    price,
    thumbnail: thumbnailCloudinary.url,
    lectures: newLectureIds,
    isApproved: true,
  });

  if (!newCourse) {
    throw new ApiError(500, "Failed to create the course.");
  }

  if (newLectureIds.length > 0) {
    await Lecture.updateMany(
      { _id: { $in: newLectureIds } },
      { $set: { course: newCourse._id } }
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newCourse, "Course created successfully."));
});

// ADMIN: GET ALL COURSES
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("category", "name")
    .populate("tutor", "name")
    .populate("lectures", "title duration description videoUrl");

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "All courses fetched successfully."));
});

// CORRECTED: TUTOR: GET ALL COURSES ADDED BY THEMSELVES
const getAllTutorCourses = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;

  const coursesWithStats = await Course.aggregate([
    {
      $match: {
        tutor: new mongoose.Types.ObjectId(tutorId),
      },
    },
    {
      $lookup: {
        from: Purchase.collection.name,
        localField: "_id",
        foreignField: "course",
        as: "purchases",
        pipeline: [
          {
            $match: {
              status: "success",
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: Review.collection.name,
        localField: "_id",
        foreignField: "course",
        as: "reviews",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        thumbnail: 1,
        isApproved: 1,
        price: 1,
        students: {
          $size: {
            $setIntersection: ["$purchases.student"],
          },
        },
        revenue: {
          $sum: "$purchases.amount",
        },
        rating: {
          $avg: "$reviews.rating",
        },
        description: 1,
        lectures: 1,
        tutor: 1,
        category: 1,
      },
    },
  ]);

  const formattedCourses = coursesWithStats.map((course) => ({
    ...course,
    revenue: course.revenue || 0,
    rating: parseFloat((course.rating || 0).toFixed(1)),
    students: course.students || 0,
  }));

  if (!formattedCourses || formattedCourses.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Tutor's courses fetched successfully."));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedCourses,
        "Tutor's courses fetched successfully."
      )
    );
});

// NEW: TOGGLE COURSE STATUS
const toggleCourseStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { isApproved } = req.body;
  const tutorId = req.user._id;

  if (typeof isApproved !== "boolean") {
    throw new ApiError(
      400,
      "Invalid status provided. 'isApproved' must be a boolean."
    );
  }

  const course = await Course.findOneAndUpdate(
    { _id: courseId, tutor: tutorId },
    { $set: { isApproved: isApproved } },
    { new: true }
  );

  if (!course) {
    throw new ApiError(
      404,
      "Course not found or you are not authorized to update this course."
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course status updated successfully."));
});

// UPDATE COURSE - Refactored for a clearer and more robust logic
const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, category, price } = req.body;
  const lectureFiles = req.files?.lectures;

  if (Object.keys(req.body).length === 0 && !req.files) {
    throw new ApiError(400, "Request body is empty.");
  }

  const courseToUpdate = await Course.findById(courseId).populate("lectures");
  if (!courseToUpdate) {
    throw new ApiError(404, "Course not found.");
  }

  let thumbnailCloudinaryUrl = courseToUpdate.thumbnail;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (thumbnailLocalPath) {
    const uploadResult = await uploadInCloudinary(thumbnailLocalPath);
    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload new thumbnail.");
    }
    thumbnailCloudinaryUrl = uploadResult.url;
  }

  const incomingLectures = req.body.lectures || [];
  const newLecturesTextData = incomingLectures.filter((l) => !l.id);

  const newLectureIds = await processNewLectures(
    lectureFiles,
    newLecturesTextData
  );

  const existingLectureIds = incomingLectures
    .filter((l) => l.id)
    .map((l) => new mongoose.Types.ObjectId(l.id));

  const lecturesToDelete = courseToUpdate.lectures
    .filter(
      (lecture) => !existingLectureIds.some((id) => id.equals(lecture._id))
    )
    .map((lecture) => lecture._id);

  if (lecturesToDelete.length > 0) {
    await Lecture.deleteMany({ _id: { $in: lecturesToDelete } });
  }

  const updatedLectureIds = [...existingLectureIds, ...newLectureIds];

  const categoryDocument = await Category.findById(category);
  if (!categoryDocument) {
    if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath))
      fs.unlinkSync(thumbnailLocalPath);
    throw new ApiError(404, "Category not found.");
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      title,
      description,
      category: categoryDocument._id,
      price,
      thumbnail: thumbnailCloudinaryUrl,
      lectures: updatedLectureIds,
    },
    { new: true, runValidators: true }
  );

  if (!updatedCourse) {
    throw new ApiError(500, "Failed to update the course.");
  }

  if (newLectureIds.length > 0) {
    await Lecture.updateMany(
      { _id: { $in: newLectureIds } },
      { $set: { course: updatedCourse._id } }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course updated successfully."));
});

// DELETE COURSE (unchanged)
const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const courseToDelete = await Course.findById(courseId);

  if (!courseToDelete) {
    throw new ApiError(404, "Course not found or failed to delete.");
  }

  await Lecture.deleteMany({ course: courseId });
  const deletedCourse = await Course.findByIdAndDelete(courseId);

  if (!deletedCourse) {
    throw new ApiError(500, "Failed to delete the course.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Course deleted successfully."));
});

// GET A SINGLE COURSE BY ID
const getCourseById = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId)
    .populate("category", "name")
    .populate("tutor", "name")
    .populate("lectures", "title duration description videoUrl");

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course fetched successfully."));
});

export {
  createCourse,
  getAllCourses,
  getAllTutorCourses,
  updateCourse,
  deleteCourse,
  getCourseById,
  toggleCourseStatus,
  getAllApprovedCourses,
};
