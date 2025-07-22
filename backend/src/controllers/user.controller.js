import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password, role].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  if (!["admin", "tutor", "student"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  let avatarUrl = "";
  if (req.files && req.files.profilePic && req.files.profilePic[0]) {
    const avatarLocalPath = req.files.profilePic[0].path;
    const cloudinaryResponse = await uploadInCloudinary(avatarLocalPath);
    if (!cloudinaryResponse) {
      throw new ApiError(500, "Failed to upload avatar");
    }
    avatarUrl = cloudinaryResponse.url;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    avatar: avatarUrl,
    isApproved: role === "tutor" ? false : true, // Tutors need approval
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

// Placeholder for other controller functions
const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

const searchUser = asyncHandler(async (req, res) => {
  // Implement search logic
});

const refreshToken = asyncHandler(async (req, res) => {
  // Implement refresh token logic
});

const updateProfile = asyncHandler(async (req, res) => {
  // Implement profile update logic
});

const getAllUsers = asyncHandler(async (req, res) => {
  // Implement get all users logic
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  searchUser,
  refreshToken,
  updateProfile,
  getAllUsers,
};
