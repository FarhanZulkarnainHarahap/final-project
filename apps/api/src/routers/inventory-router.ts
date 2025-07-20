import express from "express";
import {
  getInventoryData,
  updateStockWithJournal,
  createStockEntry,
  deleteStockEntry,
  getInventoryHistory,
  getLowStockAlerts,
} from "../controllers/inventory-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";

const router = express.Router();

// GET /api/v1/inventory - Mendapatkan data inventory (Admin only)
// POST /api/v1/inventory - Update stok dengan journal (dari struktur asli)
router
  .route("/")
  .get(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), getInventoryData)
  .post(
    verifyToken,
    roleGuard("SUPER_ADMIN", "STORE_ADMIN"),
    updateStockWithJournal
  );

// POST /api/v1/inventory/create - Create stock entry (Super Admin only)
router
  .route("/create")
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createStockEntry);

// GET /api/v1/inventory/history - Mendapatkan history perubahan inventory
router
  .route("/history")
  .get(
    verifyToken,
    roleGuard("SUPER_ADMIN", "STORE_ADMIN"),
    getInventoryHistory
  );

// GET /api/v1/inventory/low-stock - Mendapatkan alert stok rendah
router
  .route("/low-stock")
  .get(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), getLowStockAlerts);

// DELETE /api/v1/inventory/:storeId/:productId - Delete stock entry (Super Admin only)
// PENTING: Route dengan parameter harus di paling bawah agar tidak conflict
router
  .route("/:storeId/:productId")
  .delete(verifyToken, roleGuard("SUPER_ADMIN"), deleteStockEntry);

export default router;
