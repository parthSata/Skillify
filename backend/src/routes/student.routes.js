// src/routes/student.routes.js

import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { getEnrolledCourses } from "../controllers/user.controller.js"; // We will create this controller function

const router = Router();

// Protect all routes with student authorization
router.use(verifyJWT, authorizeRoles(["student"]));

// Define the new route for fetching enrolled courses
router.route("/my-courses").get(getEnrolledCourses);

export default router;