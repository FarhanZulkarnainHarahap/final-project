import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

// export async function createProduct() {}

// GET ALL PRODUCT
export async function getAllProduct(req: Request, res: Response) {
  try {
    const search = req.query.search as string | undefined;
    const products = await prisma.product.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive", // biar case insensitive
            },
          }
        : undefined,
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          include: {
            Store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const finalResult = products.map((item) => {
      // Hitung total stock semua toko
      const totalStock = item.StoreProduct.reduce(
        (sum, sp) => sum + sp.stock,
        0
      );

      // Ambil detail per store
      const stockPerStore = item.StoreProduct.map((sp) => ({
        storeId: sp.storeId,
        storeName: sp.Store?.name,
        stock: sp.stock,
      }));

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imagePreview: item.imagePreview,
        category: item.ProductCategory.map(
          (el: { Category: { name: string } }) => el.Category.name
        ),
        totalStock,
        stockPerStore,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.status(200).json({ data: finalResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get all products data" });
  }
}

// GET PRODUCT BY ID
export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: true,
      },
    });
    res.status(200).json({ data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get product by id" });
  }
}

// export async function updateProduct() {}

// export async function deleteProduct() {}

// POST
export async function createProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, description, price, weight, stock, categoryIds, storeId } =
      req.body;

    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    // Check if name is provided and not undefined
    if (!name || name === undefined) {
      res.status(400).json({ message: "Product name is required." });
      return;
    }

    // Check if product name already exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        name: name, // Ensure name is properly provided here
      },
    });

    if (existingProduct) {
      res.status(400).json({ message: "Product name must be unique." });
      return;
    }

    // Validate required fields
    if (
      !description ||
      !price ||
      !weight ||
      !stock ||
      !categoryIds ||
      categoryIds.length === 0 ||
      !storeId
    ) {
      res.status(400).json({
        message: "Missing required fields or no categories selected.",
      });
      return;
    }

    // Create the product in the database
    const newProduct = await prisma.product.create({
      data: {
        name,
        userId,
        description,
        price,
        weight,
        ProductCategory: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        },
      },
      include: {
        ProductCategory: {
          include: {
            Category: true,
          },
        },
      },
    });
    if (!newProduct) {
      res.status(500).json({ message: "Failed to create product." });
      return;
    }
    // Create the StoreProduct entry to link the product to the store
    const storeProduct = await prisma.storeProduct.create({
      data: {
        productId: newProduct.id,
        storeId: storeId,
        stock, // Link product to store
      },
    });
    if (!storeProduct) {
      res.status(500).json({ message: "Failed to link product to store." });
      return;
    }
    res.status(201).json({
      message: "Product created successfully and linked to the store",
      data: {
        product: newProduct,
        storeProduct: storeProduct,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
