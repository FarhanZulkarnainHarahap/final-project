import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";
import cloudinary from "../../../config/cloudinary-config.js";
import fs from "fs/promises";

export async function updateProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, price, weight, categoryIds, storeStocks } =
      req.body;
    const user = req.user as CustomJwtPayload;

    // ✅ Validasi user authentication
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // ✅ Validasi product exists dan belum dihapus
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        StoreProduct: { include: { Store: true } },
      },
    });

    if (!product || product.deletedAt) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // 🔥 NEW: Validasi ownership untuk STORE_ADMIN
    if (user.role === "STORE_ADMIN") {
      // Check apakah user adalah pemilik produk
      if (product.userId !== user.id) {
        res.status(403).json({
          message: "You don't have permission to update this product",
        });
        return;
      }

      // Jika ada storeStocks, pastikan semua store adalah milik user
      if (storeStocks) {
        const userStores = await prisma.store.findMany({
          where: { userId: user.id },
          select: { id: true },
        });

        const userStoreIds = userStores.map((store) => store.id);
        let parsedStoreStocks;

        try {
          parsedStoreStocks = JSON.parse(storeStocks);
        } catch (error) {
          res.status(400).json({ message: "Invalid storeStocks format" });
          return;
        }

        const requestedStoreIds = parsedStoreStocks.map(
          (item: any) => item.storeId
        );
        const invalidStores = requestedStoreIds.filter(
          (storeId: string) => !userStoreIds.includes(storeId)
        );

        if (invalidStores.length > 0) {
          res.status(403).json({
            message:
              "You don't have permission to update stock for these stores",
            invalidStores,
          });
          return;
        }
      }
    }

    // ✅ Validasi duplicate name (kecuali untuk produk ini sendiri)
    if (name && name !== product.name) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingProduct) {
        res.status(409).json({ message: "Product name already exists" });
        return;
      }
    }

    // ✅ Validasi categories jika ada
    if (categoryIds) {
      let newCategoryIds = categoryIds;
      if (typeof newCategoryIds === "string") {
        newCategoryIds = [newCategoryIds];
      }

      const validCategories = await prisma.category.findMany({
        where: {
          id: { in: newCategoryIds },
          deletedAt: null,
        },
      });

      if (validCategories.length !== newCategoryIds.length) {
        res.status(400).json({ message: "One or more categories not found" });
        return;
      }
    }

    // ✅ Update basic product info
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (weight) updateData.weight = parseFloat(weight);

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id },
        data: updateData,
      });
    }

    // 🔥 NEW: Update Images if provided
    const files = req.files as {
      imagePreview?: Express.Multer.File[];
      imageContent?: Express.Multer.File[];
    };

    if (files?.imagePreview?.[0]) {
      // Hapus image preview lama
      await prisma.image.deleteMany({
        where: { previewProductId: id },
      });

      // Upload image preview baru
      const result = await cloudinary.uploader.upload(
        files.imagePreview[0].path,
        {
          folder: "final-project/products",
        }
      );

      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          previewProductId: id,
        },
      });

      await fs.unlink(files.imagePreview[0].path);
    }

    if (files?.imageContent?.[0]) {
      // Hapus image content lama
      await prisma.image.deleteMany({
        where: { contentProductId: id },
      });

      // Upload image content baru
      const result = await cloudinary.uploader.upload(
        files.imageContent[0].path,
        {
          folder: "final-project/products",
        }
      );

      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          contentProductId: id,
        },
      });

      await fs.unlink(files.imageContent[0].path);
    }

    // 🔥 NEW: Update stock per store (bukan semua store)
    if (storeStocks) {
      let parsedStoreStocks;
      try {
        parsedStoreStocks = JSON.parse(storeStocks);
      } catch (error) {
        res.status(400).json({ message: "Invalid storeStocks format" });
        return;
      }

      // Validasi stores exist
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

      // Update stock untuk setiap store
      for (const item of parsedStoreStocks) {
        await prisma.storeProduct.upsert({
          where: {
            productId_storeId: {
              productId: id,
              storeId: item.storeId,
            },
          },
          update: {
            stock: parseInt(item.stock),
            deletedAt: null, // Reset deletedAt jika ada
          },
          create: {
            productId: id,
            storeId: item.storeId,
            stock: parseInt(item.stock),
          },
        });
      }
    }

    // ✅ Update categories
    if (categoryIds) {
      let newCategoryIds = categoryIds;
      if (typeof newCategoryIds === "string") {
        newCategoryIds = [newCategoryIds];
      }

      //delete categories lama

      await prisma.productCategory.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // Buat categories baru
      await prisma.productCategory.createMany({
        data: newCategoryIds.map((categoryId: string) => ({
          productId: id,
          categoryId,
        })),
      });
    }

    // ✅ Return updated product dengan relasi lengkap
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        ProductCategory: {
          where: { deletedAt: null },
          include: { Category: true },
        },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          where: { deletedAt: null },
          include: { Store: true },
        },
      },
    });

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // 🔥 NEW: Better error handling
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

    res.status(500).json({ message: "Failed to update product" });
  }
}
