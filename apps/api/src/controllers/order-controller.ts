import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
    });

    res.status(200).json({ data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        Address: {
          include: {
            UserAddresses: true,
          },
        },
        OrderItem: {
          include: {
            Product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Convert to the expected structure
    const result = orders.map((order) => {
      const recipientName =
        order.Address.UserAddresses[0]?.recipient || "Unknown";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        recipientName, // added from UserAddress
        totalPrice: order.totalPrice,
        items: order.OrderItem.map((item) => ({
          name: item.Product.name,
          quantity: item.quantity,
        })),
        proofImageUrl: order.proofImageUrl || null,
        paymentStatus: order.status.toLowerCase() || "pending",
        isDone: order.isDone,
      };
    });

    console.log(orders);

    res.status(200).json({ data: result });
  } catch (err) {
    console.error("getOrders error:", err);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

export const markOrderAsDone = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id; // assuming verifyToken adds req.user

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { isDone: true },
    });

    res.json({ message: "Order marked as done", data: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark as done" });
  }
};

export const updateOrderStatusByAdmin = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body;

    const allowedStatuses = ["PENDING", "PAID", "CANCELLED"] as const;

    if (!allowedStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase(), // Only update if `status` is provided
      },
    });

    res.status(200).json({ message: "Order updated", data: updatedOrder });
  } catch (error) {
    console.error("Admin update order error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};
