// src/routes/review.routes.js

import { Router } from "express";
import {
  addReview,
  getReviewsForCourse,
  updateReview,
  deleteReview,
  getReviewsForTutorCourses,
  getTutorDashboardStats,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:courseId").get(getReviewsForCourse);
router.route("/tutor/reviews").get(verifyJWT, getReviewsForTutorCourses);
router.route("/tutor/stats").get(verifyJWT, getTutorDashboardStats);
router.route("/").post(verifyJWT, addReview);
router
  .route("/:reviewId")
  .put(verifyJWT, updateReview)
  .delete(verifyJWT, deleteReview);

export default router;
