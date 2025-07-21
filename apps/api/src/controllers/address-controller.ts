import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
// import { getSubdistrictIdFromName } from "../utils/rajaongkir.js";

// GET semua alamat milik user saat ini

// POST tambah alamat baru
/* -------------------------------------------------------------------------- */
/*                             CREATE USER ADDRESS                            */
/* -------------------------------------------------------------------------- */
export async function getAddresses(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    const userAddresses = await prisma.userAddress.findMany({
      where: { userId },
      orderBy: { isPrimary: "desc" },
      include: {
        Address: true,
      },
    });

    res.json(userAddresses);
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ message: "Failed to fetch addresses." });
  }
}

// Add new address
export async function addAddress(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const {
    recipient,
    address,
    destination,
    destinationId,
    city,
    province,
    postalCode,
    isPrimary,
  } = req.body;

  if (
    !userId ||
    !recipient ||
    !address ||
    !destination ||
    !destinationId ||
    !city ||
    !province ||
    !postalCode
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1. Create Address
    const newAddress = await prisma.address.create({
      data: {
        address,
        destination,
        destinationId,
        city,
        province,
        postalCode,
      },
    });

    // 2. Create UserAddress linking to Address via addressId
    const userAddress = await prisma.userAddress.create({
      data: {
        userId,
        recipient,
        isPrimary,
        addressId: newAddress.id,
      },
      include: {
        Address: true,
      },
    });

    res.status(201).json({
      message: "Address created successfully",
      data: userAddress,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Error creating address" });
  }
}

// Update address
export async function updateAddress(req: Request, res: Response) {
  const { id } = req.params;
  const {
    recipient,
    address,
    destination,
    destinationId,
    city,
    province,
    postalCode,
    isPrimary,
  } = req.body;

  try {
    // Update the Address
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        address,
        destination,
        destinationId,
        city,
        province,
        postalCode,
      },
    });

    // Update the UserAddress
    const updatedUserAddress = await prisma.userAddress.updateMany({
      where: {
        Address: {
          some: {
            id: updatedAddress.id,
          },
        },
      },
      data: {
        recipient,
        isPrimary,
      },
    });

    res.status(200).json({
      message: "Address updated successfully",
      data: { updatedAddress, updatedUserAddress },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating address" });
  }
}

// Delete address
export async function deleteAddress(req: Request, res: Response) {
  const { id } = req.params;

  try {
    // Delete UserAddress record first
    await prisma.userAddress.deleteMany({
      where: {
        Address: {
          some: {
            id,
          },
        },
      },
    });

    // Delete Address record
    await prisma.address.delete({
      where: { id },
    });

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting address" });
  }
}

// Set address as primary
export async function setPrimaryAddress(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    const { id } = req.params;

    // Reset all to false
    await prisma.userAddress.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    // Set selected to true (find correct userAddress)
    await prisma.userAddress.updateMany({
      where: {
        userId,
        Address: {
          some: {
            id,
          },
        },
      },
      data: {
        isPrimary: true,
      },
    });

    res.json({ message: "Primary address set successfully." });
  } catch (error) {
    console.error("Set primary address error:", error);
    res.status(500).json({ message: "Failed to set primary address." });
  }
}

export async function getAllProvincesFromStores(_req: Request, res: Response) {
  try {
    // Ambil semua Address yang memiliki storeAddressId
    const addresses = await prisma.address.findMany({
      where: {
        storeAddressId: {
          not: null,
        },
        province: {
          not: "",
        },
      },
      select: {
        province: true,
      },
      distinct: ["province"],
    });

    const provinces = addresses
      .map((addr) => addr.province)
      .filter((prov): prov is string => !!prov); // filter null/undefined

    res.status(200).json({ provinces });
  } catch (error) {
    console.error("Error fetching provinces:", error);
    res.status(500).json({ message: "Failed to fetch provinces" });
  }
}
