import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getPendingTutors,
  getAllTutors,
  approveTutor,
  deleteUser,
  getAllStudents,
  getAdminAnalytics,
  getTopCourses,
  getTopTutors,
  getPendingReviews,
  approveReview,
  deleteReviewByAdmin,
  getRecentTransactions, // Import new controller functions
  getMonthlyRevenue,
  getCategoryStats,
} from "../controllers/admin.controller.js";

const router = Router();

// Routes for Admin only, protected by JWT and role check
router.use(verifyJWT, authorizeRoles(["admin"]));

// Analytics and Dashboard routes
router.get("/analytics", getAdminAnalytics);
router.get("/top-courses", getTopCourses);
router.get("/top-tutors", getTopTutors);

// NEW ANALYTICS ROUTES
router.get("/recent-transactions", getRecentTransactions);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/category-stats", getCategoryStats);

// Tutor management routes
router.get("/tutors", getAllTutors);
router.get("/tutors/pending", getPendingTutors);
router.patch("/tutors/approve/:tutorId", approveTutor);
router.delete("/tutors/reject/:tutorId", deleteUser); // Assuming reject means delete

// Student management routes
router.get("/students", getAllStudents);

// Universal user deletion route
router.delete("/users/:userId", deleteUser);

// Review management routes for admin
router.get("/reviews/pending", getPendingReviews);
router.patch("/reviews/:reviewId/approve", approveReview);
router.delete("/reviews/:reviewId/delete", deleteReviewByAdmin); // Using a more explicit path

export default router;
