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
              mode: "insensitive", // agar pencarian tidak case sensitive
            },
          }
        : undefined,
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: true, // ambil data stok dari sini
      },
    });

    const finalResult = products.map((item) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.StoreProduct.reduce(
          (total, storeProd) => total + storeProd.stock,
          0
        ),
        imagePreview: item.imagePreview,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.ProductCategory.map((el) => el.Category.name),
      };
    });

    res.status(200).json({ data: finalResult });
  } catch (error) {
    console.error("Error while getting all products:", error);
    res.status(500).json({ message: "Failed to get all products data" });
  }
}

// GET PRODUCT BY ID
export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    console.log("Mencari produk dengan ID:", id);

    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null, // hanya ambil yang belum dihapus
      },
      include: {
        ProductCategory: {
          include: {
            Category: true,
          },
        },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          include: {
            Store: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan." });
      return;
    }

    res.status(200).json({ data: product });
  } catch (error) {
    console.error("Gagal mengambil produk berdasarkan ID:", error);
    res.status(500).json({ message: "Gagal mengambil produk berdasarkan ID." });
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

export async function getAllProductsByCity(req: Request, res: Response) {
  const { province } = req.query;

  if (!province || typeof province !== "string") {
    res.status(400).json({ message: "City parameter is required." });
    return;
  }

  try {
    // Get all addresses in the given city
    const addresses = await prisma.address.findMany({
      where: {
        province: {
          equals: province,
          mode: "insensitive", // optional: make case-insensitive
        },
        storeAddressId: {
          not: null,
        },
      },
      select: {
        storeAddressId: true,
      },
    });

    const storeAddressIds = addresses.map((addr) => addr.storeAddressId!);

    // Get all store IDs connected to those store addresses
    const storeAddresses = await prisma.storeAddress.findMany({
      where: {
        id: {
          in: storeAddressIds,
        },
      },
      select: {
        storeId: true,
      },
    });

    const storeIds = storeAddresses.map((sa) => sa.storeId);

    // Get all products from those stores
    const storeProducts = await prisma.storeProduct.findMany({
      where: {
        storeId: {
          in: storeIds,
        },
      },
      include: {
        Product: true,
        Store: {
          include: {
            StoreAddress: {
              include: {
                Address: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: `Products in city: ${province}`,
      data: storeProducts,
    });
  } catch (error) {
    console.error("Error fetching products by city:", error);
    res.status(500).json({ message: "Error fetching products." });
  }
}
