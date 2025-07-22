import express from "express";
import { body, validationResult, query } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  searchUser,
  refreshToken,
  updateProfile,
  getAllUsers,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }
  next();
};

// const signupLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 signup requests per window
//   message: "Too many signup attempts, please try again later.",
// });

router
  .route("/register")
  .post(
    // signupLimiter,
    upload.fields([{ name: "profilePic", maxCount: 1 }]),
    [
      body("name").trim().notEmpty().withMessage("Name is required"),
      body("email").isEmail().withMessage("Please provide a valid email"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
      body("role")
        .isIn(["admin", "tutor", "student"])
        .withMessage("Invalid role"),
      validate,
    ],
    registerUser
  );

router
  .route("/login")
  .post(
    [
      body("email").isEmail().withMessage("Please provide a valid email"),
      body("password").notEmpty().withMessage("Password is required"),
      validate,
    ],
    loginUser
  );

router.route("/logout").post(verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

router.get(
  "/search",
  verifyJWT,
  [
    query("username")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Username query is required"),
    validate,
  ],
  searchUser
);

router.get("/all", verifyJWT, getAllUsers);

router
  .route("/update-profile")
  .put(
    verifyJWT,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    [
      body("name").optional().trim().isLength({ min: 3 }),
      body("email").optional().isEmail(),
      body("password").optional().isLength({ min: 6 }),
      body("status").optional().trim(),
      validate,
    ],
    updateProfile
  );

router.post("/refresh-token", refreshToken);

export default router;
