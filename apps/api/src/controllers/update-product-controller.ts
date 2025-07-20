import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs/promises";

interface StoreStockItem {
  storeId: string;
  stock: string;
}

interface UpdateData {
  name?: string;
  description?: string;
  price?: number;
  weight?: number;
}

// DELETE PRODUCT
export async function deleteProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const deleteDate = new Date();

    await Promise.all([
      prisma.product.update({
        where: { id },
        data: { deletedAt: deleteDate },
      }),
      prisma.productCategory.updateMany({
        where: { productId: id },
        data: { deletedAt: deleteDate },
      }),
      prisma.storeProduct.updateMany({
        where: { productId: id },
        data: { deletedAt: deleteDate },
      }),
    ]);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
}

// UPDATE PRODUCT
export async function updateProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, price, weight, categoryIds, storeStocks } =
      req.body;
    const user = req.user as CustomJwtPayload;

    // Authentication validation
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Product existence validation
    const product = await prisma.product.findUnique({
      where: { id },
      include: { StoreProduct: { include: { Store: true } } },
    });

    if (!product || product.deletedAt) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // STORE_ADMIN permission validation
    if (user.role === "STORE_ADMIN") {
      if (storeStocks) {
        // Validate store ownership for stock updates
        const userStores = await prisma.store.findMany({
          where: { userId: user.id },
          select: { id: true },
        });

        const userStoreIds = userStores.map((store) => store.id);
        console.log("User store IDs:", userStoreIds);

        let parsedStoreStocks: StoreStockItem[];
        try {
          parsedStoreStocks = JSON.parse(storeStocks);
        } catch (error) {
          res.status(400).json({ message: "Invalid storeStocks format" });
          return;
        }

        const requestedStoreIds = parsedStoreStocks.map((item) => item.storeId);
        console.log("Requested store IDs:", requestedStoreIds);

        const invalidStores = requestedStoreIds.filter(
          (storeId) => !userStoreIds.includes(storeId)
        );

        if (invalidStores.length > 0) {
          console.log("Invalid stores:", invalidStores);
          res.status(403).json({
            message:
              "You don't have permission to update stock for these stores",
            invalidStores,
          });
          return;
        }
      } else {
        // Validate product ownership for other updates
        if (product.userId !== user.id) {
          res.status(403).json({
            message: "You don't have permission to update this product",
          });
          return;
        }
      }
    }

    // Duplicate name validation
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

    // Categories validation
    if (categoryIds) {
      const newCategoryIds = Array.isArray(categoryIds)
        ? categoryIds
        : [categoryIds];

      const validCategories = await prisma.category.findMany({
        where: { id: { in: newCategoryIds }, deletedAt: null },
      });

      if (validCategories.length !== newCategoryIds.length) {
        res.status(400).json({ message: "One or more categories not found" });
        return;
      }
    }

    // Update basic product info
    const updateData: UpdateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (weight) updateData.weight = parseFloat(weight);

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({ where: { id }, data: updateData });
    }

    // Update images
    const files = req.files as {
      imagePreview?: Express.Multer.File[];
      imageContent?: Express.Multer.File[];
    };

    await handleImageUpdates(id, files);

    // Update stock per store
    // GANTI bagian "Update stock per store" di updateProduct function dengan ini:

    // Update stock per store
    if (storeStocks) {
      let parsedStoreStocks: StoreStockItem[];
      try {
        parsedStoreStocks = JSON.parse(storeStocks);
      } catch (error) {
        res.status(400).json({ message: "Invalid storeStocks format" });
        return;
      }

      // Validate stores exist
      const requestedStoreIds = parsedStoreStocks.map((item) => item.storeId);
      const validStores = await prisma.store.findMany({
        where: { id: { in: requestedStoreIds } },
      });

      if (validStores.length !== requestedStoreIds.length) {
        res.status(400).json({ message: "One or more stores not found" });
        return;
      }

      console.log("Updating stock for stores:", parsedStoreStocks);

      // Get updated product data for weight (needed for journal)
      const currentProduct = await prisma.product.findUnique({
        where: { id },
        select: { weight: true },
      });

      if (!currentProduct) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      // Update stock for each store WITH JOURNAL TRACKING
      await prisma.$transaction(async (tx) => {
        for (const item of parsedStoreStocks) {
          // Get current stock
          const currentStoreProduct = await tx.storeProduct.findUnique({
            where: {
              productId_storeId: { productId: id, storeId: item.storeId },
            },
          });

          const currentStock = currentStoreProduct?.stock || 0;
          const newStock = parseInt(item.stock);
          const difference = newStock - currentStock;

          // Create journal entry ONLY if there's a stock change
          if (difference !== 0) {
            const action = difference > 0 ? "ADD" : "SALE";
            const quantity = Math.abs(difference);

            await tx.inventoryJournal.create({
              data: {
                storeId: item.storeId,
                productId: id,
                quantity:
                  difference > 0 ? quantity.toString() : (-quantity).toString(),
                weight: currentProduct.weight,
                action: action as any, // InventoryAction type
                userId: user.id,
              },
            });

            console.log(
              `Journal created: ${action} ${quantity} units for store ${item.storeId}`
            );
          }

          // Update or create store product
          await tx.storeProduct.upsert({
            where: {
              productId_storeId: { productId: id, storeId: item.storeId },
            },
            update: {
              stock: newStock,
              deletedAt: null,
              updatedAt: new Date(),
            },
            create: {
              productId: id,
              storeId: item.storeId,
              stock: newStock,
            },
          });
        }
      });
    }
    // Update categories
    if (categoryIds) {
      const newCategoryIds = Array.isArray(categoryIds)
        ? categoryIds
        : [categoryIds];

      await prisma.productCategory.deleteMany({
        where: { productId: product.id },
      });

      await prisma.productCategory.createMany({
        data: newCategoryIds.map((categoryId: string) => ({
          productId: id,
          categoryId,
        })),
      });
    }

    // Return updated product
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

    console.log("Stock update successful");

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

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

// Helper function for image updates
async function handleImageUpdates(
  productId: string,
  files: {
    imagePreview?: Express.Multer.File[];
    imageContent?: Express.Multer.File[];
  }
): Promise<void> {
  // Update preview image
  if (files?.imagePreview?.[0]) {
    await prisma.image.deleteMany({
      where: { previewProductId: productId },
    });

    const result = await cloudinary.uploader.upload(
      files.imagePreview[0].path,
      {
        folder: "final-project/products",
      }
    );

    await prisma.image.create({
      data: {
        imageUrl: result.secure_url,
        previewProductId: productId,
      },
    });

    await fs.unlink(files.imagePreview[0].path);
  }

  // Update content image
  if (files?.imageContent?.[0]) {
    await prisma.image.deleteMany({
      where: { contentProductId: productId },
    });

    const result = await cloudinary.uploader.upload(
      files.imageContent[0].path,
      {
        folder: "final-project/products",
      }
    );

    await prisma.image.create({
      data: {
        imageUrl: result.secure_url,
        contentProductId: productId,
      },
    });

    await fs.unlink(files.imageContent[0].path);
  }
}
