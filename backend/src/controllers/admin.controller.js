// src/controllers/admin.controller.js

import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Purchase } from "../models/purchase.model.js";
import { Review } from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Helper function to create an initial admin user (kept for completeness)
const createInitialAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "Admin1709@gmail.com" });
    if (existingAdmin) {
      return;
    }

    const adminUser = new User({
      name: "Admin",
      email: "Admin1709@gmail.com",
      password: "Password1709",
      role: "admin",
      isApproved: true,
    });

    await adminUser.save();
  } catch (error) {
    console.error("Error creating initial admin user:", error);
  }
};

// GET: Get overall analytics for the admin dashboard
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const totalCourses = await Course.countDocuments();
  const totalStudents = await User.countDocuments({ role: "student" });
  const totalRevenue = await Purchase.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);
  const averageRating = await Review.aggregate([
    { $group: { _id: null, averageRating: { $avg: "$rating" } } },
  ]);

  const stats = {
    totalCourses,
    totalStudents,
    totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    averageRating: averageRating[0]?.averageRating || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Admin dashboard stats fetched successfully.")
    );
});

// GET: Get top performing courses based on total revenue
const getTopCourses = asyncHandler(async (req, res) => {
  const topCourses = await Purchase.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: "$course",
        totalRevenue: { $sum: "$amount" },
        totalPurchases: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $lookup: {
        from: "users",
        localField: "courseDetails.tutor",
        foreignField: "_id",
        as: "tutorDetails",
      },
    },
    { $unwind: "$tutorDetails" },
    {
      $project: {
        _id: "$courseDetails._id",
        title: "$courseDetails.title",
        tutorName: "$tutorDetails.name",
        totalRevenue: 1,
        totalPurchases: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, topCourses, "Top courses fetched successfully.")
    );
});

// GET: Get top performing tutors based on total revenue from their courses
const getTopTutors = asyncHandler(async (req, res) => {
  const topTutors = await Course.aggregate([
    { $group: { _id: "$tutor", courses: { $push: "$_id" } } },
    {
      $lookup: {
        from: "purchases",
        localField: "courses",
        foreignField: "course",
        as: "purchases",
      },
    },
    { $unwind: "$purchases" },
    { $match: { "purchases.status": "success" } },
    {
      $group: {
        _id: "$_id",
        totalRevenue: { $sum: "$purchases.amount" },
        totalCourses: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "tutorDetails",
      },
    },
    { $unwind: "$tutorDetails" },
    {
      $project: {
        _id: 1,
        tutorName: "$tutorDetails.name",
        avatar: "$tutorDetails.avatar",
        totalRevenue: 1,
        totalCourses: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, topTutors, "Top tutors fetched successfully."));
});

const getPendingTutors = asyncHandler(async (req, res) => {
  const tutors = await User.find({ role: "tutor", isApproved: false }).select(
    "-password -refreshToken"
  );
  if (!tutors) {
    throw new ApiError(404, "No pending tutors found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tutors, "Pending tutors fetched successfully"));
});

const getAllTutors = asyncHandler(async (req, res) => {
  const tutors = await User.find({ role: "tutor" }).select(
    "-password -refreshToken"
  );
  if (!tutors) {
    throw new ApiError(404, "No tutors found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tutors, "All tutors fetched successfully"));
});

const approveTutor = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const tutor = await User.findById(tutorId);

  if (!tutor) {
    throw new ApiError(404, "Tutor not found");
  }

  if (tutor.role !== "tutor") {
    throw new ApiError(400, "User is not a tutor");
  }

  if (tutor.isApproved) {
    throw new ApiError(400, "Tutor is already approved");
  }

  tutor.isApproved = true;
  await tutor.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, tutor, "Tutor approved successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});

const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" }).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, students, "All students fetched successfully"));
});

// NEW: GET all reviews that are pending approval
const getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate("student", "name avatar")
    .populate("course", "title")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, reviews, "Pending reviews fetched successfully.")
    );
});

// NEW: PATCH to approve a review
const approveReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { isApproved: true },
    { new: true }
  );

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review approved successfully."));
});

// NEW: Admin-specific function to delete a review
const deleteReviewByAdmin = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const reviewToDelete = await Review.findByIdAndDelete(reviewId);

  if (!reviewToDelete) {
    throw new ApiError(404, "Review not found.");
  }

  // You will need a way to update the course rating after a review is deleted
  // const updateCourseRating = async (courseId) => { ... }
  // await updateCourseRating(reviewToDelete.course);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully by admin."));
});

export {
  getPendingTutors,
  getAllTutors,
  approveTutor,
  deleteUser,
  getAllStudents,
  createInitialAdmin,
  getAdminAnalytics,
  getTopCourses,
  getTopTutors,
  getPendingReviews,
  approveReview,
  deleteReviewByAdmin,
};
