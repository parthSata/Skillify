// src/routes/admin.routes.js

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getPendingTutors,
  getAllTutors,
  approveTutor,
  deleteUser,
  getAllStudents,
} from "../controllers/admin.controller.js";

const router = Router();

// Routes for Admin only, protected by JWT and role check
router.use(verifyJWT, authorizeRoles(["admin"]));

// Tutor management routes
router.get("/tutors", getAllTutors);
router.get("/tutors/pending", getPendingTutors);
router.patch("/tutors/approve/:tutorId", approveTutor);

// Student management routes
router.get("/students", getAllStudents);

// Universal user deletion route
router.delete("/users/:userId", deleteUser);

export default router;
