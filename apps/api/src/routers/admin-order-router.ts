import express from "express";
import {
  getOrders,
  updateOrderStatusByAdmin,
} from "../controllers/order-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/", verifyToken, roleGuard("STORE_ADMIN"), getOrders);
router.patch(
  "/update",
  verifyToken,
  roleGuard("STORE_ADMIN"),
  updateOrderStatusByAdmin
);

export default router;
