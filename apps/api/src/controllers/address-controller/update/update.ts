import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function updateAddress(req: Request, res: Response) {
  const { id } = req.params;
  const { recipient, address, city, province, postalCode, isPrimary } =
    req.body;

  try {
    // Update the Address
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        address,
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
