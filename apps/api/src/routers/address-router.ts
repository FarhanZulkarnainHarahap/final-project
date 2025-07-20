import express from "express";

import { verifyToken } from "../middleware/auth-middleware.js";
import {
  getAddresses,
  getAllProvincesFromStores,
} from "../controllers/address-controller/get/get.js";
import {
  addAddress,
  setPrimaryAddress,
} from "../controllers/address-controller/create/create.js";
import { deleteAddress } from "../controllers/address-controller/delete/delete.js";
import { updateAddress } from "../controllers/address-controller/update/update.js";

const router = express.Router();

// Semua rute address di-protect oleh middleware verifyToken

// GET dan POST semua address milik user yang sedang login
router.route("/").get(verifyToken, getAddresses).post(verifyToken, addAddress);

// DELETE address berdasarkan ID milik user

router
  .route("/:id")
  .put(verifyToken, updateAddress) // ✅ Update address
  .delete(verifyToken, deleteAddress);
router.route("/provinces").get(getAllProvincesFromStores);
router.route("/:id/set-primary").put(verifyToken, setPrimaryAddress);
export default router;
