// src/controllers/course.controller.js

import { Course } from "../models/course.model.js";
import { Category } from "../models/category.model.js";
import { Lecture } from "../models/lecture.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// Helper function to correctly process new and existing lectures for both create and update
const processLectures = async (req) => {
  const lectureFiles = req.files?.lectures || [];
  const lectureTextData = req.body.lectures || [];
  const lectureIds = [];

  // Process uploaded video files and create new Lecture documents
  if (lectureFiles && lectureFiles.length > 0) {
    for (let i = 0; i < lectureFiles.length; i++) {
      const file = lectureFiles[i];
      const videoCloudinary = await uploadInCloudinary(file.path);

      if (videoCloudinary) {
        const lectureInfo = lectureTextData[i];

        if (!lectureInfo || !lectureInfo.title) {
          console.error(`Skipping lecture at index ${i}: Incomplete data.`);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
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
  }

  // For updates, handle existing lectures separately
  const existingLectures = Object.keys(req.body)
    .filter((key) => key.startsWith("lectures[") && key.endsWith("[id]"))
    .map((key) => req.body[key]);

  return [...lectureIds, ...existingLectures];
};

// CREATE COURSE
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, price } = req.body;
  const tutor = req.user._id;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  const lectureFiles = req.files?.lectures;

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

  const lectureIds = await processLectures(req);

  const newCourse = await Course.create({
    title,
    description,
    category: categoryDocument._id,
    tutor,
    price,
    thumbnail: thumbnailCloudinary.url,
    lectures: lectureIds,
    isApproved: true,
  });

  if (!newCourse) {
    throw new ApiError(500, "Failed to create the course.");
  }

  if (lectureIds.length > 0) {
    await Lecture.updateMany(
      { _id: { $in: lectureIds } },
      { $set: { course: newCourse._id } }
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newCourse, "Course created successfully."));
});

// UPDATE COURSE
const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, category, price } = req.body;

  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, "Request body is empty.");
  }

  const courseToUpdate = await Course.findById(courseId);
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

  const lectureFiles = req.files?.lectures;
  const lectureTextData = req.body.lectures;

  const existingLectureIds = courseToUpdate.lectures.map((id) => id.toString());
  const incomingLectureIds = lectureTextData
    ? lectureTextData.filter((l) => l.id).map((l) => l.id)
    : [];

  const lecturesToDelete = existingLectureIds.filter(
    (id) => !incomingLectureIds.includes(id)
  );
  if (lecturesToDelete.length > 0) {
    await Lecture.deleteMany({ _id: { $in: lecturesToDelete } });
  }

  const newLectureIds = await processLectures(req);
  const updatedLectureIds = [...incomingLectureIds, ...newLectureIds];

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

// GET ALL COURSES - FIXED to populate lectures
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("category", "name")
    .populate("tutor", "name")
    .populate("lectures"); // Add this line to populate the lectures

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "All courses fetched successfully."));
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

export { createCourse, getAllCourses, updateCourse, deleteCourse };
