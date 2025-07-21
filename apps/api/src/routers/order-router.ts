import express from "express";

import {
  getMyOrders,
  markOrderAsDone,
} from "../controllers/order-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/", verifyToken, getMyOrders);
router.patch("/complete", verifyToken, markOrderAsDone);
export default router;
