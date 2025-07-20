import express from "express";
import {
  getAllUser,
  getCurrentUser,
  getUsersByRole,
  // updateUserImage,
} from "../controllers/user-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router.route("/current-user").get(verifyToken, getCurrentUser);
/* -------------------------------------------------------------------------- */
/*                       GET ALL USER HANYA SUPER ADMIN                       */
/* -------------------------------------------------------------------------- */
router.route("/").get(getAllUser);
router.get("/users", getUsersByRole);

export default router;
