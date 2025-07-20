import express from "express";
import {
  createProduct,
  getAllProduct,
  getProductById,
} from "../controllers/product-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProduct)
  .post(verifyToken, roleGuard("STORE_ADMIN"), createProduct);

router.route("/:id").get(getProductById);

export default router;
