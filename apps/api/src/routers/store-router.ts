import express from "express";
import {
  createStore,
  getOneStore,
  getStores,
} from "../controllers/store-controler.js";
import { roleGuard, verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, roleGuard("STORE_ADMIN", "SUPER_ADMIN"), getStores)
  .post(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), createStore);

// GET satu store
router
  .route("/:storeId")
  .get(verifyToken, roleGuard("STORE_ADMIN"), getOneStore);

export default router;
