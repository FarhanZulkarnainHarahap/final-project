import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";

export async function addAddress(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const {
    recipient,
    address,
    city,
    province,
    destination,
    postalCode,
    isPrimary,
    destinationId,
  } = req.body;

  if (
    !recipient ||
    !address ||
    !city ||
    !destination ||
    !province ||
    !destinationId ||
    !postalCode
  ) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    // Create Address first
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

    // Create UserAddress with reference to Address
    const userAddress = await prisma.userAddress.create({
      data: {
        userId: userId,
        recipient,
        isPrimary,
        Address: {
          connect: {
            id: newAddress.id,
          },
        },
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
    console.error(error);
    res.status(500).json({ message: "Error creating address" });
  }
}
export async function setPrimaryAddress(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    const { id } = req.params;

    // Reset semua address user jadi false
    await prisma.userAddress.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    // Jadikan address yang dipilih sebagai primary
    await prisma.userAddress.update({
      where: { id },
      data: { isPrimary: true },
    });

    res.json({ message: "Primary address set successfully." });
  } catch (error) {
    console.error("Set primary address error:", error);
    res.status(500).json({ message: "Failed to set primary address." });
  }
}
