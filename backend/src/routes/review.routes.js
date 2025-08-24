// src/routes/review.routes.js

import { Router } from "express";
import {
  addReview,
  getReviewsForCourse,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:courseId").get(getReviewsForCourse);

router.route("/").post(verifyJWT, addReview);

// NEW: Routes for updating and deleting a review by ID
router
  .route("/:reviewId")
  .put(verifyJWT, updateReview)
  .delete(verifyJWT, deleteReview);

export default router;
