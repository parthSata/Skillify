import { Router } from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all category routes with Admin authorization
router.use(verifyJWT, authorizeRoles(["admin"]));

// CRUD operations for categories
router.route("/").post(createCategory).get(getAllCategories);

export default router;
