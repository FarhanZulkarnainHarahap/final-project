import express from "express";

import {
  getAllUser,
  getCurrentUser,
  getUsersByRole,
  // updateUserImage,
} from "../controllers/user-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";
import {
  createStoreAdmin,
  getStoreAdminById,
  getStoreAdmins,
  updateStoreAdmin,
} from "../controllers/store-admin-controller.js";

import {
  updateCurrentUser,
  updateUserRole,
} from "../controllers/user-controller/update/update-user.js";
import {
  confirmVerificationToken,
  sendVerificationEmail,
} from "../controllers/user-controller/update/verification.js";
import { deleteUser } from "../controllers/user-controller/delete/delete-user.js";

const router = express.Router();

router.route("/current-user").get(verifyToken, getCurrentUser);
router
  .route("/current-user")
  .get(verifyToken, getCurrentUser)
  .put(verifyToken, updateCurrentUser);
/* -------------------------------------------------------------------------- */
/*                       GET ALL USER HANYA SUPER ADMIN                       */
/* -------------------------------------------------------------------------- */
router.route("/").get(getAllUser);
router.route("/:id").put(updateUserRole).delete(verifyToken, deleteUser);

/* -------------------------------------------------------------------------- */
/*                        ROUTES UNTUK STORE ADMIN                           */
/* -------------------------------------------------------------------------- */
router.get("/store-admins", verifyToken, getStoreAdmins);
router.get("/store-admins/:id", verifyToken, getStoreAdminById);
router.post("/store-admins", verifyToken, createStoreAdmin);
router.put("/store-admins/:id", verifyToken, updateStoreAdmin);
router.delete("/:id", verifyToken, deleteUser);

router.route("/users").get(getUsersByRole);
// Kirim ulang verifikasi email (harus login)
router.route("/verify-email").post(verifyToken, sendVerificationEmail);

// Konfirmasi token dari link email → isVerified = true
router.route("/confirm-email").get(confirmVerificationToken);
export default router;
