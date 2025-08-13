// src/controllers/course.controller.js

import { Course } from "../models/course.model.js";
import { Category } from "../models/category.model.js";
import { Lecture } from "../models/lecture.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// Helper function to correctly process new and existing lectures
const processLectures = async (req) => {
    const lectureFiles = req.files?.lectures;
    const lectureData = req.body.lectures || [];
    const lectureIds = [];
    const newLectureFiles = [];

    // Separate new lecture files from the main form data
    for (const [key, value] of Object.entries(req.body)) {
        if (key.startsWith('lectures[') && key.includes('videoUrl')) {
            const index = key.match(/\[(\d+)\]/)[1];
            lectureData[index] = { ...lectureData[index], videoUrl: value };
        }
    }

    // Process uploaded video files first
    if (lectureFiles && lectureFiles.length > 0) {
        for (const file of lectureFiles) {
            const uploadResult = await uploadInCloudinary(file.path);
            if (uploadResult) {
                // Find corresponding lecture data from req.body
                let lectureInfo = {};
                for (const key in req.body) {
                    if (key.startsWith('lectures') && key.includes(`[${newLectureFiles.length}]`)) {
                        const fieldName = key.match(/\[(\d+)\]\[(\w+)\]/)[2];
                        lectureInfo[fieldName] = req.body[key];
                    }
                }
                
                const newLecture = await Lecture.create({
                    title: lectureInfo.title,
                    duration: lectureInfo.duration,
                    description: lectureInfo.description,
                    videoUrl: uploadResult.url,
                });
                lectureIds.push(newLecture._id);
            }
            fs.unlinkSync(file.path);
        }
    }

    // Process existing lectures to be kept
    for (const lecture of lectureData) {
        if (lecture.id) {
            lectureIds.push(lecture.id);
        }
    }

    return lectureIds;
};

// CREATE COURSE
const createCourse = asyncHandler(async (req, res) => {
    const { title, description, category, price } = req.body;
    const tutor = req.user._id;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    const lectureFiles = req.files?.lectures;

    if (!title || !category || !tutor || !thumbnailLocalPath) {
        if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
        if (lectureFiles) lectureFiles.forEach((file) => fs.unlinkSync(file.path));
        throw new ApiError(400, "Title, category, and a thumbnail are required fields.");
    }

    const categoryDocument = await Category.findById(category);
    if (!categoryDocument) {
        if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
        if (lectureFiles) lectureFiles.forEach((file) => fs.unlinkSync(file.path));
        throw new ApiError(404, "Category not found.");
    }

    const thumbnailCloudinary = await uploadInCloudinary(thumbnailLocalPath);
    if (!thumbnailCloudinary) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary.");
    }

    // Process lectures and get their ObjectIds
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

    // Link lectures to the new course
    if (lectureIds.length > 0) {
        await Lecture.updateMany({ _id: { $in: lectureIds } }, { $set: { course: newCourse._id } });
    }

    return res.status(201).json(new ApiResponse(201, newCourse, "Course created successfully."));
});

// GET ALL COURSES
const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().populate("category", "name").populate("tutor", "name");
    return res.status(200).json(new ApiResponse(200, courses, "All courses fetched successfully."));
});

// UPDATE COURSE
const updateCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { title, description, category, price } = req.body;

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

    // Process lectures for update
    const newLectureIds = await processLectures(req);

    const categoryDocument = await Category.findById(category);
    if (!categoryDocument) {
        if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
        throw new ApiError(404, "Category not found.");
    }

    // Remove old lectures not included in the update
    const oldLectures = courseToUpdate.lectures.filter(id => !newLectureIds.includes(id));
    if (oldLectures.length > 0) {
        await Lecture.deleteMany({ _id: { $in: oldLectures } });
    }
    
    // Update the course with new data
    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
            title,
            description,
            category: categoryDocument._id,
            price,
            thumbnail: thumbnailCloudinaryUrl,
            lectures: newLectureIds,
        },
        { new: true, runValidators: true }
    );

    if (!updatedCourse) {
        throw new ApiError(500, "Failed to update the course.");
    }

    // Link all lectures (old and new) to the updated course
    if (newLectureIds.length > 0) {
        await Lecture.updateMany({ _id: { $in: newLectureIds } }, { $set: { course: updatedCourse._id } });
    }

    return res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully."));
});

// DELETE COURSE
const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const courseToDelete = await Course.findById(courseId);

    if (!courseToDelete) {
        throw new ApiError(404, "Course not found or failed to delete.");
    }

    // Delete all associated lectures
    await Lecture.deleteMany({ course: courseId });

    // Delete the course itself
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
        throw new ApiError(500, "Failed to delete the course.");
    }

    return res.status(200).json(new ApiResponse(200, null, "Course deleted successfully."));
});

export { createCourse, getAllCourses, updateCourse, deleteCourse };