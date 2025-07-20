import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

// GET semua alamat milik user saat ini

// POST tambah alamat baru
/* -------------------------------------------------------------------------- */
/*                             CREATE USER ADDRESS                            */
/* -------------------------------------------------------------------------- */
export async function getAddresses(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isPrimary: "desc" }, // alamat utama dulu
    });

    res.json(addresses);
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ message: "Failed to fetch addresses." });
  }
}

// Add new address
export async function addAddress(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const { recipient, address, city, province, postalCode, isPrimary } =
    req.body;

  if (!userId || !recipient || !address || !city || !province || !postalCode) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const newAddress = await prisma.address.create({
      data: {
        userId: userId,
        recipient,
        address,
        city,
        province,
        postalCode,
        isPrimary,
      },
    });

    res
      .status(201)
      .json({ message: "Address created successfully", data: newAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating address" });
  }
}

// Update address
export async function updateAddress(req: Request, res: Response) {
  const { id } = req.params;
  const { recipient, address, city, province, postalCode, isPrimary } =
    req.body;

  try {
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        recipient,
        address,
        city,
        province,
        postalCode,
        isPrimary,
      },
    });

    res
      .status(200)
      .json({ message: "Address updated successfully", data: updatedAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating address" });
  }
}

// Delete address
export async function deleteAddress(req: Request, res: Response) {
  const { id } = req.params;

  try {
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
    await prisma.address.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    // Set selected to true
    await prisma.address.update({
      where: { id },
      data: { isPrimary: true },
    });

    res.json({ message: "Primary address set successfully." });
  } catch (err) {
    console.error("Set primary address error:", err);
    res.status(500).json({ message: "Failed to set primary address." });
  }
}
