import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

export async function createStore(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    console.log("Requester (yang login SUPER_ADMIN):", userId);

    const { targetUsername, name, address, city, province, postalCode } =
      req.body;

    if (
      !targetUsername ||
      !name ||
      !address ||
      !city ||
      !province ||
      !postalCode
    ) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    // Cari user STORE_ADMIN berdasarkan username
    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      res.status(404).json({ message: "Target user not found." });
      return;
    }

    if (targetUser.role !== "STORE_ADMIN") {
      res.status(400).json({
        message: "Target user must have role 'STORE_ADMIN'.",
      });
      return;
    }

    // Buat store
    const newStore = await prisma.store.create({
      data: {
        userId: userId, // ini SUPER_ADMIN
        owner: targetUser.id, // ini STORE_ADMIN
        name,
        address,
        city,
        province,
        postalCode,
      },
    });

    // Buat address
    const newAddress = await prisma.address.create({
      data: {
        storeId: newStore.id,
        recipient: newStore.name,
        address: newStore.address,
        city: newStore.city,
        province: newStore.province,
        postalCode: newStore.postalCode,
        isPrimary: false,
        userId: targetUser.id, // alamat dimiliki STORE_ADMIN
      },
    });
    if (!newAddress) {
      res.status(500).json({ message: "Error creating address for store." });
      return;
    }

    res.status(201).json({
      message: "Store and address created successfully.",
      data: { store: newStore, address: newAddress },
    });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Error creating store with address." });
  }
}

export async function getStores(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;

  try {
    const stores = await prisma.store.findMany({
      where: {
        userId: userId,
      },
      include: {
        createdBy: {
          select: {
            username: true,
            email: true,
          },
        },
        ownedBy: {
          select: {
            username: true,
            email: true,
          },
        },
        Product: true,
        ProductInventory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Stores fetched successfully",
      data: stores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stores" });
  }
}

export async function getOneStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const { storeId } = req.params;

  if (!storeId) {
    res.status(400).json({ message: "Store ID is required." });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        ownedBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        Product: true,
        ProductInventory: true,
      },
    });

    // Validasi apakah store ada dan milik user
    if (!store || store.userId !== userId) {
      res.status(404).json({ message: "Store not found or unauthorized." });
      return;
    }

    res.status(200).json({
      message: "Store fetched successfully",
      data: store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching store." });
  }
}
