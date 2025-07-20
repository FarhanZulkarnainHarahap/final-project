import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function deleteStore(req: Request, res: Response) {
  const { storeId } = req.params;

  try {
    // Get related data
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        StoreAddress: {
          include: {
            Address: true,
          },
        },
        StoreUser: true,
      },
    });

    if (!store) {
      res.status(404).json({ message: "Store tidak ditemukan." });
      return;
    }

    // Delete Address
    for (const storeAddr of store.StoreAddress) {
      for (const addr of storeAddr.Address) {
        await prisma.address.delete({ where: { id: addr.id } });
      }

      // Delete StoreAddress
      await prisma.storeAddress.delete({ where: { id: storeAddr.id } });
    }

    // Delete StoreUser
    for (const su of store.StoreUser) {
      await prisma.storeUser.delete({ where: { id: su.id } });
    }

    // Delete Store
    await prisma.store.delete({ where: { id: storeId } });

    res
      .status(200)
      .json({ message: "Store and related data deleted successfully." });
  } catch (error) {
    console.error("deleteStore:", error);
    res
      .status(500)
      .json({ message: "Failed to delete store and related data." });
  }
}
