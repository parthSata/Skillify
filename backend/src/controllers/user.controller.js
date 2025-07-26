import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // or VITE_NODE_ENV
  sameSite: "strict",
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
  if (req.files && req.files.profilePic && req.files.profilePic[0]) {
    const cloudinaryResponse = await uploadInCloudinary(
      req.files.profilePic[0].path
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

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
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

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
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
  const userId = req.user?._id;
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
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

    // Generate new tokens
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
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

export { registerUser, loginUser, logoutUser, getCurrentUser, refreshToken };
