import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getStudentDashboard,
  checkEnrollmentStatus,
} from "../controllers/user.controller.js";

const router = Router();

// Protect all student routes with JWT and student role check
router.use(verifyJWT, authorizeRoles(["student"]));

router.route("/dashboard").get(getStudentDashboard);
router.route("/my-courses").get(getStudentDashboard);

router.route("/enrollment-status/:courseId").get(checkEnrollmentStatus);

export default router;
