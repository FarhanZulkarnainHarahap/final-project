import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function getAllStores(_req: Request, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });
    if (!stores) {
      res.status(400).json({ message: "Stores Not Found" });
      return;
    }
    res.status(200).json({ message: "Stores fetched.", data: stores });
  } catch (error) {
    console.error("Fetch stores error:", error);
    res.status(500).json({ message: "Error fetching stores." });
  }
}

export async function getStoreById(req: Request, res: Response) {
  const { storeId } = req.params;

  if (!storeId) {
    res.status(400).json({ message: "Store ID is required." });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        StoreProduct: {
          include: { Product: true },
        },
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });

    if (!store) {
      res.status(404).json({ message: "Store not found." });
      return;
    }

    res.status(200).json({ message: `Get ${storeId} success`, data: store });
  } catch (error) {
    console.error("Get store by ID error:", error);
    res.status(500).json({ message: "Error retrieving store." });
  }
}

export async function getAllStoresForSuperAdmin(_req: Request, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      select: { id: true, name: true },
    });

    res.json({ data: stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil daftar store" });
  }
}
