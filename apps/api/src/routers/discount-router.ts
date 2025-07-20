import express from "express";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscountUsageReport,
} from "../controllers/discount-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), getDiscounts)
  .post(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), createDiscount);

router
  .route("/usage-report")
  .get(
    verifyToken,
    roleGuard("SUPER_ADMIN", "STORE_ADMIN"),
    getDiscountUsageReport
  );

router
  .route("/:id")
  .put(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), updateDiscount)
  .delete(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), deleteDiscount);

export default router;
