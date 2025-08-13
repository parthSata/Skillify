import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper function to create a slug from a name
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-*|-*$/g, "");
};

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required.");
  }

  const slug = createSlug(name);

  // Check if a category with the same name or slug already exists
  const existingCategory = await Category.findOne({
    $or: [{ name: name }, { slug: slug }],
  });

  if (existingCategory) {
    throw new ApiError(
      409,
      "A category with this name or slug already exists."
    );
  }

  const newCategory = await Category.create({
    name,
    slug,
  });

  if (!newCategory) {
    throw new ApiError(500, "Failed to create the category.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newCategory, "Category created successfully."));
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully."));
});

export { createCategory, getAllCategories };
