import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
} from "../controllers/address-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

// Semua rute address di-protect oleh middleware verifyToken
router.use(verifyToken);

// GET dan POST semua address milik user yang sedang login
router.route("/").get(getAddresses).post(addAddress);

// DELETE address berdasarkan ID milik user
router.route("/:id").put(updateAddress).delete(deleteAddress);

router.route("/:id/set-primary").put(setPrimaryAddress);
export default router;
