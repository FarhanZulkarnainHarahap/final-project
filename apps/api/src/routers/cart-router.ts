import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cart-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";

const router = Router();

/* every route requires an authenticated user */

router.use(verifyToken);
router.get("/index", getCart); // GET    /api/v1/cart
router.post("/", addToCart); // POST   /api/v1/cart
router.patch("/:cartItemId", updateCartItem); // PATCH  /api/v1/cart/:cartItemId
router.delete("/:cartItemId", deleteCartItem); // DELETE /api/v1/cart/:cartItemId

export default router;
