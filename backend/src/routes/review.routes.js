// src/routes/review.routes.js

import { Router } from "express";
import {
  addReview,
  getReviewsForCourse,
  updateReview,
  deleteReview,
  getReviewsForTutorCourses,
  getTutorDashboardStats,
  getPendingReviews,
  approveReview,
  getAdminDashboardStats, // <-- Import the function
  deleteReviewByAdmin, // <-- Import the new function
} from "../controllers/review.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:courseId").get(getReviewsForCourse);
router.route("/tutor/reviews").get(verifyJWT, getReviewsForTutorCourses);
router.route("/tutor/stats").get(verifyJWT, getTutorDashboardStats);
router.route("/").post(verifyJWT, addReview);
router
  .route("/:reviewId")
  .put(verifyJWT, updateReview)
  .delete(verifyJWT, deleteReview);

// Admin-specific routes for reviews
router
  .route("/admin/pending")
  .get(verifyJWT, authorizeRoles("admin"), getPendingReviews);
router
  .route("/admin/reviews/:reviewId/approve")
  .patch(verifyJWT, authorizeRoles("admin"), approveReview);
router
  .route("/admin/reviews/:reviewId")
  .delete(verifyJWT, authorizeRoles("admin"), deleteReviewByAdmin);

// NEW: Admin route for dashboard stats
router
  .route("/admin/stats")
  .get(verifyJWT, authorizeRoles("admin"), getAdminDashboardStats); // <-- Add this line

export default router;
