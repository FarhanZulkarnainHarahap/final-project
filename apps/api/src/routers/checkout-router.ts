import express from "express";
import { handleManualCheckout } from "../controllers/checkout-manual-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.post(
  "/manual",
  verifyToken,
  upload.single("paymentProof"),
  handleManualCheckout
);

export default router;
