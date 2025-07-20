import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";

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
