import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.VITE_NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// A mock progress tracking mechanism for demonstration
const mockProgress = (courseId, studentId) => {
  const hash = (courseId + studentId)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const progress = (hash % 100) + 1; // Generates a number from 1 to 100
  const isCompleted = progress > 90;
  const nextLesson = isCompleted
    ? "No more lessons"
    : `Lesson ${Math.floor(progress / 10) + 1}`;
  return {
    progress,
    nextLesson,
    status: isCompleted ? "completed" : "in-progress",
  };
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (
    [name, email, password, role].some((field) => !field?.toString().trim())
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (!["admin", "tutor", "student"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }
  const existedUser = await User.findOne({ email });
  if (existedUser)
    throw new ApiError(409, "User with this email already exists");

  let avatarUrl = "";
  if (req.files && req.files.avatar && req.files.avatar[0]) {
    const cloudinaryResponse = await uploadInCloudinary(
      req.files.avatar[0].path
    );
    if (!cloudinaryResponse) throw new ApiError(500, "Avatar upload failed");
    avatarUrl = cloudinaryResponse.url;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    avatar: avatarUrl,
    isApproved: role === "tutor" ? false : true,
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

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
    .status(201)
    .json(new ApiResponse(201, safeUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(400, "Email and password required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid password");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

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
    .json(new ApiResponse(200, safeUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
  } catch (err) {
    // log if needed
  }
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password ");
  if (!user) throw new ApiError(404, "User not found");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies?.refreshToken;
  if (!tokenFromCookie) throw new ApiError(401, "No refresh token provided");

  try {
    const decoded = jwt.verify(
      tokenFromCookie,
      process.env.VITE_REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== tokenFromCookie)
      throw new ApiError(401, "Invalid refresh token");

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Token refreshed successfully"));
  } catch (error) {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  if (!studentId) {
    throw new ApiError(401, "User not authenticated.");
  }

  const student = await User.findById(studentId).populate({
    path: "enrolledCourses",
    model: "Course",
    select: "title thumbnail",
  });

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const myCourses = student.enrolledCourses.map((course) => {
    const progressData = mockProgress(
      course._id.toString(),
      studentId.toString()
    );
    return {
      _id: course._id,
      title: course.title,
      thumbnail: course.thumbnail,
      progress: progressData.progress,
      nextLesson: progressData.nextLesson,
      status: progressData.status,
    };
  });

  const completedCourses = myCourses.filter(
    (course) => course.status === "completed"
  ).length;

  const stats = {
    totalEnrolledCourses: myCourses.length,
    completedCourses: completedCourses,
    coursesInProgress: myCourses.length - completedCourses,
    totalCertificates: completedCourses, // Assuming 1 certificate per completed course
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats,
        myCourses,
      },
      "Student dashboard data fetched successfully."
    )
  );
});

const checkEnrollmentStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const student = req.user;

  const isEnrolled = await User.exists({
    _id: student._id,
    enrolledCourses: courseId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEnrolled: !!isEnrolled },
        "Enrollment status fetched successfully."
      )
    );
});

const getPendingTutors = asyncHandler(async (req, res) => {
  const pendingTutors = await User.find({
    role: "tutor",
    isApproved: false,
  }).select("-password -refreshToken");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        pendingTutors,
        "Pending tutors fetched successfully."
      )
    );
});

const approveTutor = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const tutor = await User.findByIdAndUpdate(
    tutorId,
    { isApproved: true },
    { new: true }
  );
  if (!tutor) {
    throw new ApiError(404, "Tutor not found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tutor, "Tutor approved successfully."));
});

const rejectTutor = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const tutor = await User.findByIdAndDelete(tutorId);
  if (!tutor) {
    throw new ApiError(404, "Tutor not found.");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Tutor rejected and deleted successfully.")
    );
});

export {
  checkEnrollmentStatus,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
  getPendingTutors,
  approveTutor,
  rejectTutor,
  getStudentDashboard,
};
