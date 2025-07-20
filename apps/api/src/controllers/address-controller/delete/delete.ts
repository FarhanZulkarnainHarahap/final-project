import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

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
