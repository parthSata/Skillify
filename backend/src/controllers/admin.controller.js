// src/controllers/admin.controller.js

import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  await tutor.save({ validateBeforeSave: false }); // Bypass password hash middleware

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
  // Mongoose find() returns an array, which is never "falsy"
  const students = await User.find({ role: "student" }).select(
    "-password -refreshToken"
  );

  // Return a success response with the (possibly empty) array of students
  return res
    .status(200)
    .json(new ApiResponse(200, students, "All students fetched successfully"));
});

const createInitialAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "Admin1709@gmail.com" });
    if (existingAdmin) {
      return;
    }

    const adminUser = new User({
      name: "Admin",
      email: "Admin1709@gmail.com",
      password: "Password1709", // The pre-save hook will hash this
      role: "admin",
      isApproved: true,
    });

    await adminUser.save();
  } catch (error) {
    console.error("Error creating initial admin user:", error);
  }
};

export {
  getPendingTutors,
  getAllTutors,
  approveTutor,
  deleteUser,
  getAllStudents,
  createInitialAdmin,
};
