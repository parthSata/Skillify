// src/routes/user.routes.js

import express from "express";
import { body, validationResult } from "express-validator";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
  getPendingTutors,
  approveTutor,
  rejectTutor,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }
  next();
};

router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password at least 6 characters"),
    body("role")
      .isIn(["admin", "tutor", "student"])
      .withMessage("Invalid role"),
    validate,
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  loginUser
);

router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/refresh-token", refreshToken);

// Admin-specific routes for user management
router
  .route("/admin/tutors/pending")
  .get(verifyJWT, authorizeRoles("admin"), getPendingTutors);
router
  .route("/admin/tutors/:tutorId/approve")
  .patch(verifyJWT, authorizeRoles("admin"), approveTutor);
router
  .route("/admin/tutors/:tutorId/reject")
  .delete(verifyJWT, authorizeRoles("admin"), rejectTutor);

export default router;
