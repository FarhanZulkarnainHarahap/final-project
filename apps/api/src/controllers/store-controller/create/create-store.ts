import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function createStore(req: Request, res: Response) {
  const {
    name,
    address,
    city,
    province,
    postalCode,
    destination,
    latitude,
    longitude,
  } = req.body;

  // Validasi input
  if (
    !name ||
    !address ||
    !city ||
    !province ||
    !postalCode ||
    !destination ||
    latitude === undefined ||
    longitude === undefined
  ) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    // 1. Create Store
    const store = await prisma.store.create({
      data: {
        name,
      },
    });

    // 2. Create StoreAddress
    const storeAddress = await prisma.storeAddress.create({
      data: {
        storeId: store.id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    // 3. Create Address terkait dengan StoreAddress
    const createdAddress = await prisma.address.create({
      data: {
        address,
        city,
        province,
        postalCode,
        destination,
        storeAddressId: storeAddress.id,
      },
    });

    res.status(201).json({
      message: "Store created successfully.",
      data: {
        store,
        storeAddress,
        address: createdAddress,
      },
    });
  } catch (error) {
    console.error("Create store error:", error);
    res.status(500).json({ message: "Error creating store." });
  }
}

export async function createStoreProduct(req: Request, res: Response) {
  const { storeId, productId, stock } = req.body;

  try {
    // Validate inputs
    if (!storeId || !productId || stock === undefined) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    // Create a new store product entry
    const storeProduct = await prisma.storeProduct.create({
      data: {
        storeId,
        productId,
        stock,
      },
    });

    if (!storeProduct) {
      res.status(500).json({ message: "Error creating product for store." });
      return;
    }

    // Return success response
    res.status(201).json({
      message: "Product created for the store successfully.",
      data: storeProduct,
    });
  } catch (error) {
    console.error("Error creating store product:", error);
    res.status(500).json({ message: "Error creating store product." });
  }
}
