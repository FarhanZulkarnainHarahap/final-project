import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findFirst({
    where: { userId, CartItem: { some: {} } },
    include: { CartItem: true },
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: { CartItem: true },
  });
}

export async function getCart(req: Request, res: Response) {
  try {
    const userId = (req.user as { id: string }).id;
    const cart = await getOrCreateCart(userId);

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { Product: true },
    });

    res.json({ data: items });
  } catch (err) {
    console.error("getCart:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function addToCart(req: Request, res: Response) {
  try {
    const userId = (req.user as { id: string }).id;
    const { productId, storeId, quantity = 1 } = req.body;

    if (!productId || !storeId || quantity < 1) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const storeProduct = await prisma.storeProduct.findUnique({
      where: {
        productId_storeId: { productId, storeId },
      },
      include: {
        Product: true,
      },
    });

    if (!storeProduct) {
      return res
        .status(404)
        .json({ message: "Product not found in this store" });
    }

    if (storeProduct.stock < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for requested quantity" });
    }

    const cart = await getOrCreateCart(userId);

    const existingLine = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    const line = existingLine
      ? await prisma.cartItem.update({
          where: { id: existingLine.id },
          data: {
            quantity: existingLine.quantity + quantity,
            unitPrice: storeProduct.Product.price,
          },
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            unitPrice: storeProduct.Product.price,
          },
        });

    return res.status(201).json({ data: line });
  } catch (err) {
    console.error("addToCart:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateCartItem(req: Request, res: Response) {
  try {
    const userId = (req.user as { id: string }).id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({ message: "Quantity must be ≥ 1" });
    }

    const line = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        Cart: true,
        Product: true,
      },
    });

    if (!line || line.Cart.userId !== userId) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Ambil stok dari StoreProduct berdasarkan productId dan storeId
    const storeProduct = await prisma.storeProduct.findFirst({
      where: {
        productId: line.productId,
      },
    });

    if (!storeProduct) {
      return res.status(404).json({ message: "Store product not found" });
    }

    if (storeProduct.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return res.json({ data: updated });
  } catch (err) {
    console.error("updateCartItem:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteCartItem(req: Request, res: Response) {
  try {
    const userId = (req.user as { id: string }).id;
    const { cartItemId } = req.params;

    const line = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { Cart: true },
    });
    if (!line || line.Cart.userId !== userId) {
      res.status(404).json({ message: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    res.status(204).end();
  } catch (err) {
    console.error("deleteCartItem:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
