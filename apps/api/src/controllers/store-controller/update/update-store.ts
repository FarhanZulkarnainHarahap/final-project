import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

// Get a store by its ID along with its associated products

export async function updateStore(req: Request, res: Response) {
  const { storeId } = req.params;

  const {
    name,
    latitude,
    longtitude,
    address,
    city,
    province,
    postalCode,
    destination,
  } = req.body;

  try {
    // Update Store
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { name },
    });

    // Ambil StoreAddress dan Address yang terkait
    const existingStore = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });

    if (!existingStore || !existingStore.StoreAddress[0]) {
      res.status(404).json({ message: "Data store address tidak ditemukan" });
      return;
    }

    const storeAddressId = existingStore.StoreAddress[0].id;
    const addressId = existingStore.StoreAddress[0].Address[0]?.id;

    // Update StoreAddress
    await prisma.storeAddress.update({
      where: { id: storeAddressId },
      data: {
        latitude: parseFloat(latitude),
        longtitude: parseFloat(longtitude),
      },
    });

    // Update Address
    if (addressId) {
      await prisma.address.update({
        where: { id: addressId },
        data: {
          address,
          city,
          province,
          postalCode,
          destination,
        },
      });
    }

    res.status(200).json({
      message: "Store, address, and location updated successfully",
      data: updatedStore,
    });
  } catch (error) {
    console.error("updateStore:", error);
    res
      .status(500)
      .json({ message: "Failed to update store and related data" });
  }
}
