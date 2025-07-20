import express from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  loginSuccess,
  loginFailed,
  verifyEmail,
  VerifySuccess,
  loginGoogle,
} from "../controllers/auth.controller.js";

import {
  changePassword,
  resetPassword,
} from "../controllers/user-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                LOGIN GOOGLE                                */
/* -------------------------------------------------------------------------- */

// Redirect ke Google login
router.get("/login/success", loginSuccess);
router.get("/login/failed", loginFailed);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  loginGoogle
);
// Logout untuk user yang login lewat Google
router.route("/logout").delete(logout);

/* -------------------------------------------------------------------------- */
/*                                LOGIN MANUAL                                */
/* -------------------------------------------------------------------------- */
router.route("/verify-email").get(verifyEmail).get(VerifySuccess);

router.post("/register", register);
router.post("/login", login); // Logout khusus JWT

/* -------------------------------------------------------------------------- */
/*                          Reser and change Password                         */
/* -------------------------------------------------------------------------- */

router.post("/reset-password", resetPassword);

// Change password harus login
router.post("/change-password", authMiddleware, changePassword);
export default router;
