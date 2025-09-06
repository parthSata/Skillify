import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Purchase } from "../models/purchase.model.js";
import { Review } from "../models/review.model.js";
import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

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

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password.");
  }

  // FIX: Only allow admin role to login from this route
  if (user.role !== "admin") {
    throw new ApiError(
      403,
      "Access denied. This portal is for administrators only."
    );
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.VITE_NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "Admin logged in successfully."));
});

const getAdminAnalytics = asyncHandler(async (req, res) => {
  const totalCourses = await Course.countDocuments();
  const totalStudents = await User.countDocuments({ role: "student" });
  const totalTutors = await User.countDocuments({
    role: "tutor",
    isApproved: true,
  });
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
    totalTutors,
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
    averageRating:
      averageRating.length > 0 ? averageRating[0].averageRating : 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Admin dashboard stats fetched successfully.")
    );
});

const getTopCourses = asyncHandler(async (req, res) => {
  const topCourses = await Course.aggregate([
    {
      $lookup: {
        from: "purchases",
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
        from: "users",
        localField: "tutor",
        foreignField: "_id",
        as: "tutorDetails",
      },
    },
    {
      $unwind: "$tutorDetails",
    },
    {
      $lookup: {
        from: "reviews",
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
        tutor: "$tutorDetails.name",
        students: { $size: "$purchases" },
        revenue: { $sum: "$purchases.amount" },
        rating: { $avg: "$reviews.rating" },
      },
    },
    {
      $sort: { revenue: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, topCourses, "Top courses fetched successfully.")
    );
});

const getTopTutors = asyncHandler(async (req, res) => {
  const topTutors = await User.aggregate([
    {
      $match: {
        role: "tutor",
        isApproved: true,
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "tutor",
        as: "coursesTaught",
      },
    },
    {
      $unwind: {
        path: "$coursesTaught",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "purchases",
        localField: "coursesTaught._id",
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
        from: "reviews",
        localField: "_id",
        foreignField: "tutor",
        as: "reviews",
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        avatar: { $first: "$avatar" },
        courses: {
          $sum: { $cond: [{ $ifNull: ["$coursesTaught", false] }, 1, 0] },
        },
        students: { $addToSet: "$purchases.student" },
        revenue: { $sum: { $sum: "$purchases.amount" } },
        rating: { $avg: "$reviews.rating" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        avatar: 1,
        courses: 1,
        students: { $size: "$students" },
        revenue: { $ifNull: ["$revenue", 0] },
        rating: { $ifNull: ["$rating", 0] },
      },
    },
    {
      $sort: { revenue: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, topTutors, "Top tutors fetched successfully."));
});

const getRecentTransactions = asyncHandler(async (req, res) => {
  const transactions = await Purchase.aggregate([
    {
      $match: {
        status: "success",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "studentDetails",
      },
    },
    {
      $unwind: "$studentDetails",
    },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    {
      $unwind: "$courseDetails",
    },
    {
      $project: {
        _id: 1,
        student: "$studentDetails.name",
        course: "$courseDetails.title",
        amount: 1,
        date: "$createdAt",
        status: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transactions,
        "Recent transactions fetched successfully."
      )
    );
});

const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const monthlyData = await Purchase.aggregate([
    {
      $match: {
        status: "success",
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        students: { $addToSet: "$student" },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $let: {
            vars: {
              monthsInString: [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
            },
            in: { $arrayElemAt: ["$$monthsInString", "$_id.month"] },
          },
        },
        revenue: 1,
        students: { $size: "$students" },
      },
    },
    {
      $sort: {
        "_id.month": 1,
      },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedData = monthNames.map((month) => {
    const existingData = monthlyData.find((d) => d.month === month);
    return existingData || { month, revenue: 0, students: 0 };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formattedData, "Monthly revenue fetched."));
});

const getCategoryStats = asyncHandler(async (req, res) => {
  const categoryStats = await Category.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "category",
        as: "courses",
      },
    },
    {
      $unwind: { path: "$courses", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "purchases",
        localField: "courses._id",
        foreignField: "course",
        as: "purchases",
      },
    },
    {
      $unwind: { path: "$purchases", preserveNullAndEmptyArrays: true },
    },
    {
      $match: {
        $or: [
          { "purchases.status": "success" },
          { purchases: { $exists: false } },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        color: { $first: "$color" },
        coursesCount: { $addToSet: "$courses._id" },
        studentsCount: { $addToSet: "$purchases.student" },
        revenue: { $sum: "$purchases.amount" },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        color: 1,
        courses: { $size: { $ifNull: ["$coursesCount", []] } },
        students: { $size: { $ifNull: ["$studentsCount", []] } },
        revenue: { $ifNull: ["$revenue", 0] },
      },
    },
    {
      $sort: { revenue: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categoryStats,
        "Category stats fetched successfully."
      )
    );
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

const getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isApproved: false })
    .populate("student", "name avatar")
    .populate("course", "title")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, reviews, "Pending reviews fetched successfully.")
    );
});

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

const deleteReviewByAdmin = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const reviewToDelete = await Review.findByIdAndDelete(reviewId);

  if (!reviewToDelete) {
    throw new ApiError(404, "Review not found.");
  }

  if (reviewToDelete.course) {
    const course = await Course.findById(reviewToDelete.course);
    if (course) {
      const result = await Review.aggregate([
        { $match: { course: course._id, isApproved: true } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]);
      course.rating = result.length > 0 ? result[0].avgRating : 0;
      await course.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully by admin."));
});

export {
  createInitialAdmin,
  loginAdmin,
  getAdminAnalytics,
  getTopCourses,
  getTopTutors,
  getRecentTransactions,
  getMonthlyRevenue,
  getCategoryStats,
  getPendingTutors,
  getAllTutors,
  approveTutor,
  deleteUser,
  getAllStudents,
  getPendingReviews,
  approveReview,
  deleteReviewByAdmin,
};
