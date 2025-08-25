// src/controllers/review.controller.js

import { Review } from "../models/review.model.js";
import { Course } from "../models/course.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Purchase } from "../models/purchase.model.js";

// Helper function to update course rating
const updateCourseRating = async (courseId) => {
  const stats = await Review.aggregate([
    {
      $match: { course: new mongoose.Types.ObjectId(courseId) },
    },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.averageRating || 0;
  const numOfReviews = stats[0]?.numOfReviews || 0;

  await Course.findByIdAndUpdate(
    courseId,
    {
      rating: averageRating,
      numOfReviews,
    },
    { new: true }
  );
};

// POST: Add a new review for a course
const addReview = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;
  const studentId = req.user._id;

  if (!courseId || !rating) {
    throw new ApiError(400, "Course ID and rating are required.");
  }
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5.");
  }

  const existingReview = await Review.findOne({
    course: courseId,
    student: studentId,
  });

  if (existingReview) {
    throw new ApiError(
      409,
      "You have already submitted a review for this course."
    );
  }

  const newReview = await Review.create({
    course: courseId,
    student: studentId,
    rating,
    comment,
  });

  if (!newReview) {
    throw new ApiError(500, "Failed to submit review.");
  }

  await updateCourseRating(courseId);

  return res
    .status(201)
    .json(new ApiResponse(201, newReview, "Review added successfully."));
});

// GET: Get all reviews for a specific course
const getReviewsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  const totalReviews = await Review.countDocuments({ course: courseId });

  const reviews = await Review.find({ course: courseId })
    .populate("student", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reviews, totalReviews },
        "Reviews fetched successfully."
      )
    );
});

// PUT - Update a review
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const studentId = req.user._id;

  if (!rating) {
    throw new ApiError(400, "Rating is required for updating.");
  }
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5.");
  }

  const reviewToUpdate = await Review.findById(reviewId);

  if (!reviewToUpdate) {
    throw new ApiError(404, "Review not found.");
  }

  if (reviewToUpdate.student.toString() !== studentId.toString()) {
    throw new ApiError(403, "You are not authorized to update this review.");
  }

  reviewToUpdate.rating = rating;
  reviewToUpdate.comment = comment;
  await reviewToUpdate.save({ validateBeforeSave: false });

  await updateCourseRating(reviewToUpdate.course);

  return res
    .status(200)
    .json(new ApiResponse(200, reviewToUpdate, "Review updated successfully."));
});

// DELETE - Delete a review
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const studentId = req.user._id;

  const reviewToDelete = await Review.findOneAndDelete({
    _id: reviewId,
    student: studentId,
  });

  if (!reviewToDelete) {
    throw new ApiError(
      404,
      "Review not found or you are not authorized to delete it."
    );
  }

  await updateCourseRating(reviewToDelete.course);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully."));
});

const getReviewsForTutorCourses = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;

  const tutorCourses = await Course.find({ tutor: tutorId }).select("_id");
  const courseIds = tutorCourses.map((course) => course._id);

  if (courseIds.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { reviews: [], totalReviews: 0 },
          "No courses found for this tutor."
        )
      );
  }

  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  const totalReviews = await Review.countDocuments({
    course: { $in: courseIds },
  });

  const reviews = await Review.find({
    course: { $in: courseIds },
  })
    .populate("student", "name avatar")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reviews, totalReviews },
        "Tutor's course reviews fetched successfully."
      )
    );
});

const getTutorDashboardStats = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;

  const tutorCourses = await Course.find({ tutor: tutorId }).select("_id");

  if (tutorCourses.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalCourses: 0,
          totalStudents: 0,
          averageRating: 0,
          monthlyRevenue: 0,
        },
        "No courses found for this tutor."
      )
    );
  }

  const courseIds = tutorCourses.map((course) => course._id);

  const purchaseStats = await Purchase.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: "success",
      },
    },
    {
      $group: {
        _id: null,
        totalStudents: { $addToSet: "$student" },
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const reviewStats = await Review.aggregate([
    {
      $match: { course: { $in: courseIds } },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const totalStudents = purchaseStats[0]?.totalStudents?.length || 0;
  const totalRevenue = purchaseStats[0]?.totalRevenue || 0;
  const averageRating = reviewStats[0]?.averageRating || 0;

  const monthlyRevenue = totalRevenue;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalCourses: tutorCourses.length,
        totalStudents: totalStudents,
        averageRating: parseFloat(averageRating.toFixed(1)),
        monthlyRevenue: monthlyRevenue,
      },
      "Dashboard stats fetched successfully."
    )
  );
});

export {
  addReview,
  getReviewsForCourse,
  updateReview,
  deleteReview,
  getReviewsForTutorCourses,
  getTutorDashboardStats,
};
