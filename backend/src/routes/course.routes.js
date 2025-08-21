// src/routes/course.routes.js

import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getAllApprovedCourses, // Import the new controller function
  getCourseById, // This is already created, but we will make a public route for it
} from "../controllers/course.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Protect all course routes with Admin authorization
router.use(verifyJWT, authorizeRoles(["admin", "student"]));

// Get all approved courses (for students)
router.route("/all").get(getAllApprovedCourses);

// Get a single course by ID (for students)
router.route("/:courseId").get(getCourseById);

// Use different endpoints for clarity and to prevent conflicts
router.route("/create-course").post(
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lectures", maxCount: 100 },
  ]),
  createCourse
);

router.route("/").get(getAllCourses); // Fetch all courses
// Apply multer to the update route as well to handle FormData correctly
router
  .route("/:courseId")
  .patch(
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "lectures", maxCount: 100 },
    ]),
    updateCourse
  )
  .delete(deleteCourse);

export default router;
