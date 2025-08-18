// src/routes/course.routes.js

import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Protect all course routes with Admin authorization
router.use(verifyJWT, authorizeRoles(["admin"]));

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
