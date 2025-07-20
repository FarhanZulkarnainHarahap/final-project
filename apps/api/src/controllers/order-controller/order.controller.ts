import { Request, Response } from "express";

import { MidtransClient } from "midtrans-node-client";
import { v7 as uuid } from "uuid";
import { CustomJwtPayload } from "../types/express.js";
import prisma from "../../config/prisma-client.js";

const snap = new MidtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SANDBOX_SERVER_KEY,
});

// Create Order and initiate Midtrans transaction
export async function createOrder(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    const { addressId } = req.body;

    // Get the user's cart and items
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        CartItem: {
          include: { Product: true },
        },
      },
    });

    if (!cart || cart.CartItem.length === 0) {
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    const orderId = uuid();

    const subTotal = cart.CartItem.reduce(
      (total: number, item: { unitPrice: number; quantity: number }) =>
        total + item.unitPrice * item.quantity,
      0
    );
    const shippingTotal = 20000; // Example flat shipping cost
    const totalPrice = subTotal + shippingTotal;

    // Create the Order and OrderItems
    await prisma.order.create({
      data: {
        id: orderId,
        userId,
        orderNumber: orderId,
        status: "PENDING",
        subTotal,
        shippingTotal,
        totalPrice,
        addressId,
        OrderItem: {
          create: cart.CartItem.map(
            (item: {
              productId: string;
              unitPrice: number;
              quantity: number;
            }) => ({
              productId: item.productId,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              total: item.unitPrice * item.quantity,
            })
          ),
        },
      },
    });

    const midtransTransaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPrice,
      },
      item_details: cart.CartItem.map(
        (item: {
          productId: string;
          unitPrice: number;
          quantity: number;
          Product: { name: string };
        }) => ({
          id: item.productId,
          name: item.Product.name,
          quantity: item.quantity,
          price: item.unitPrice,
        })
      ),
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
    });

    res.status(201).json({
      message: "Order created and transaction initialized",
      data: {
        midtransTransaction,
        orderId,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
}

// Midtrans webhook or status update
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { order_id, transaction_status } = req.body;

    if (!order_id || !transaction_status) {
      res.status(400).json({ message: "Missing transaction data" });
      return;
    }

    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: "PAID" },
      });
    } else if (transaction_status === "pending") {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: "PENDING" },
      });
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: "CANCELLED" },
      });
    }

    res.status(200).json({ message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
}
