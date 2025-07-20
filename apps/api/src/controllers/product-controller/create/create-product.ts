import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";
import cloudinary from "../../../config/cloudinary-config.js";
import fs from "fs/promises";

// CREATE PRODUCT

export async function createProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, description, price, weight, storeStocks } = req.body;
    const user = req.user as CustomJwtPayload;

    // Ambil dari req.body
    let { categoryIds } = req.body;
    if (typeof categoryIds === "string") {
      categoryIds = [categoryIds];
    }

    //  Validasi user authentication
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    //  Validasi input required fields
    if (
      !name ||
      !description ||
      !price ||
      !weight ||
      !categoryIds ||
      !storeStocks
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Parse storeStocks
    let parsedStoreStocks;
    try {
      parsedStoreStocks = JSON.parse(storeStocks);
    } catch (error) {
      res.status(400).json({ message: "Invalid storeStocks format" });
      return;
    }

    // Validasi storeStocks tidak kosong
    if (!Array.isArray(parsedStoreStocks) || parsedStoreStocks.length === 0) {
      res.status(400).json({ message: "At least one store is required" });
      return;
    }

    // STORE_ADMIN validation
    if (user.role === "STORE_ADMIN") {
      const userStores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      const userStoreIds = userStores.map((store) => store.id);
      const requestedStoreIds = parsedStoreStocks.map(
        (item: any) => item.storeId
      );

      const invalidStores = requestedStoreIds.filter(
        (storeId: string) => !userStoreIds.includes(storeId)
      );

      if (invalidStores.length > 0) {
        res.status(403).json({
          message: "You don't have permission to add products to these stores",
          invalidStores,
        });
        return;
      }
    }

    // ✅ Validasi category exists
    const validCategories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        deletedAt: null,
      },
    });

    if (validCategories.length !== categoryIds.length) {
      res.status(400).json({ message: "One or more categories not found" });
      return;
    }

    // ✅ Validasi stores exist
    const requestedStoreIds = parsedStoreStocks.map(
      (item: any) => item.storeId
    );
    const validStores = await prisma.store.findMany({
      where: { id: { in: requestedStoreIds } },
    });

    if (validStores.length !== requestedStoreIds.length) {
      res.status(400).json({ message: "One or more stores not found" });
      return;
    }

    // for existing product (active or deleted)
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
      include: {
        ProductCategory: true,
        StoreProduct: true,
        imagePreview: true,
        imageContent: true,
      },
    });

    let finalProduct;
    let isRestored = false;

    if (existingProduct) {
      // Jika produk aktif, return error
      if (existingProduct.deletedAt === null) {
        res.status(409).json({ message: "Product name already exists" });
        return;
      }

      // 🔥 RESTORE dan UPDATE produk yang sudah dihapus
      console.log(`Restoring deleted product: ${existingProduct.name}`);

      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          userId: user.id,
          description,
          price: parseFloat(price),
          weight: parseFloat(weight),
          deletedAt: null, // Restore
          updatedAt: new Date(),
        },
      });

      // Hapus kategori lama dan buat yang baru
      await prisma.productCategory.deleteMany({
        where: { productId: existingProduct.id },
      });

      await prisma.productCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          productId: existingProduct.id,
          categoryId,
        })),
      });

      //  Update/Create StoreProduct
      // Hapus semua storeProduct lama
      await prisma.storeProduct.deleteMany({
        where: { productId: existingProduct.id },
      });

      //  storeProduct baru
      for (const item of parsedStoreStocks) {
        await prisma.storeProduct.create({
          data: {
            productId: existingProduct.id,
            storeId: item.storeId,
            stock: parseInt(item.stock),
          },
        });
      }

      finalProduct = existingProduct;
      isRestored = true;
    } else {
      // ✅ Create new product
      finalProduct = await prisma.product.create({
        data: {
          name,
          userId: user.id,
          description,
          price: parseFloat(price),
          weight: parseFloat(weight),
          ProductCategory: {
            create: categoryIds.map((categoryId: string) => ({ categoryId })),
          },
        },
      });

      // Link product to store
      for (const item of parsedStoreStocks) {
        await prisma.storeProduct.create({
          data: {
            productId: finalProduct.id,
            storeId: item.storeId,
            stock: parseInt(item.stock),
          },
        });
      }
    }

    // ✅ Handle Images (untuk restored product, hapus gambar lama dulu)
    const files = req.files as {
      imagePreview?: Express.Multer.File[];
      imageContent?: Express.Multer.File[];
    };

    if (isRestored) {
      // Hapus gambar lama untuk produk yang di-restore
      await prisma.image.deleteMany({
        where: {
          OR: [
            { previewProductId: finalProduct.id },
            { contentProductId: finalProduct.id },
          ],
        },
      });
    }

    // Upload gambar
    if (files?.imagePreview?.[0]) {
      const result = await cloudinary.uploader.upload(
        files.imagePreview[0].path,
        {
          folder: "final-project/products",
        }
      );
      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          previewProductId: finalProduct.id,
        },
      });
      await fs.unlink(files.imagePreview[0].path);
    }

    if (files?.imageContent?.[0]) {
      const result = await cloudinary.uploader.upload(
        files.imageContent[0].path,
        {
          folder: "final-project/products",
        }
      );
      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          contentProductId: finalProduct.id,
        },
      });
      await fs.unlink(files.imageContent[0].path);
    }

    // ✅ Response data
    const responseProduct = await prisma.product.findUnique({
      where: { id: finalProduct.id },
      include: {
        ProductCategory: { include: { Category: true } },
        imagePreview: true,
        imageContent: true,
        StoreProduct: { include: { Store: true } },
      },
    });

    res.status(isRestored ? 200 : 201).json({
      message: isRestored
        ? "Product restored and updated successfully"
        : "Product created successfully",
      data: responseProduct,
      isRestored,
    });
  } catch (error) {
    console.error("Error creating/restoring product:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        res.status(409).json({ message: "Product name already exists" });
        return;
      }

      if (error.message.includes("Foreign key constraint")) {
        res.status(400).json({ message: "Invalid category or store ID" });
        return;
      }
    }
    res.status(500).json({ message: "Internal server error" });
  }
}
