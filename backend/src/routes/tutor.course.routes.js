// src/routes/tutor.course.routes.js

import { Router } from "express";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
  getAllTutorCourses,
  toggleCourseStatus, // Import the new function
} from "../controllers/course.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Protect all tutor course routes with Tutor authorization
router.use(verifyJWT, authorizeRoles(["tutor"]));

// Tutor can create a new course and get all of their own courses
router
  .route("/")
  .post(
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "lectures", maxCount: 100 },
    ]),
    createCourse
  )
  .get(getAllTutorCourses);

router
  .route("/:courseId")
  .patch(
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "lectures", maxCount: 100 },
    ]),
    updateCourse
  )
  .delete(deleteCourse)
  .get(getCourseById);

// New route for toggling course status
router.route("/:courseId/status").patch(toggleCourseStatus);

export default router;
