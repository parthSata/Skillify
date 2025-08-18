// src/routes/category.routes.js

import { Router } from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Route to get all categories (public, no authentication required)
router.route("/").get(getAllCategories);

// Route to create a new category (protected, requires admin role)
router.use(verifyJWT, authorizeRoles(["admin"]));
router.route("/").post(createCategory);

export default router;