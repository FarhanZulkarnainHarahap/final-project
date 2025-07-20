import express from "express";
// Import authentication middleware
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";
import {
  getAllCategories,
  getCategoryById,
} from "../controllers/category-controller/get/get-category.js";
import { createCategory } from "../controllers/category-controller/create/create-category.js";
import { updateCategory } from "../controllers/category-controller/update/update-category.js";
import { deleteCategory } from "../controllers/category-controller/delete/delete-category.js";

const router = express.Router();

// Route for getting all categories and creating a new category
router
  .route("/")
  .get(getAllCategories) // Fetch all categories
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createCategory); // Only allow SUPER_ADMIN to create categories

// Route for getting, updating, or deleting a category by its ID
router
  .route("/:id")
  .get(getCategoryById) // Get category by ID
  .put(verifyToken, roleGuard("SUPER_ADMIN"), updateCategory) // Allow SUPER_ADMIN to update category
  .delete(verifyToken, roleGuard("SUPER_ADMIN"), deleteCategory); // Allow SUPER_ADMIN to delete category

export default router;
