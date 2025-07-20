import express from "express";

import { roleGuard, verifyToken } from "../middleware/auth-middleware.js";
import {
  getAllStores,
  getAllStoresForSuperAdmin,
  getStoreById,
} from "../controllers/store-controller/get/get-store.js";
import {
  createStore,
  createStoreProduct,
} from "../controllers/store-controller/create/create-store.js";
import { deleteStore } from "../controllers/store-controller/delete/delete-store.js";
import { updateStore } from "../controllers/store-controller/update/update-store.js";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, getAllStores)
  .post(verifyToken, roleGuard("STORE_ADMIN"), createStoreProduct);

// GET satu store
router
  .route("/super-admin")
  .get(verifyToken, getAllStores)
  .get(getAllStoresForSuperAdmin)
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createStore);
router
  .route("/super-admin/:storeId")
  .get(verifyToken, roleGuard("SUPER_ADMIN"), getStoreById);

router
  .route("/:storeId")
  .get(verifyToken, roleGuard("STORE_ADMIN"), getStoreById);
router.route("/super-admin/:storeId").delete(deleteStore).put(updateStore);

router.route("/super-admin/:editingStore.id").put(updateStore);
export default router;
