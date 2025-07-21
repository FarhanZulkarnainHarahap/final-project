import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

// getAllProductsByStore
export async function getAllProductsByStore(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const storeId = req.query.storeId as string;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    if (!storeId) {
      res.status(400).json({ message: "storeId is required" });
      return;
    }

    // Validate sort parameters
    const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    // Step 1: Optional filter productIds by category
    let productIds: string[] | undefined = undefined;

    if (category && typeof category === "string") {
      const products = await prisma.product.findMany({
        where: {
          deletedAt: null,
          ProductCategory: {
            some: {
              Category: {
                name: { equals: category, mode: "insensitive" },
              },
            },
          },
        },
        select: { id: true },
      });

      productIds = products.map((p) => p.id);
    }

    // Step 2: Build dynamic WHERE
    const where: any = {
      storeId,
      deletedAt: null,
      ...(productIds && { productId: { in: productIds } }),
    };

    // Search filter
    if (search && typeof search === "string") {
      where.Product = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Step 3: Get total count
    const totalProducts = await prisma.storeProduct.count({
      where,
    });

    // Step 4: Build orderBy
    const orderBy: any = {};
    if (finalSortBy === "name" || finalSortBy === "price") {
      orderBy.Product = { [finalSortBy]: finalSortOrder };
    } else {
      orderBy.Product = { [finalSortBy]: finalSortOrder };
    }

    // Step 5: Query storeProduct with filters and pagination
    const storeProducts = await prisma.storeProduct.findMany({
      where,
      include: {
        Product: {
          include: {
            ProductCategory: { include: { Category: true } },
            User: true,
            imageContent: true,
            imagePreview: true,
          },
        },
        Store: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // Step 6: Map results
    const result = storeProducts.map((item) => ({
      ...item.Product,
      stock: item.stock,
      storeName: item.Store?.name ?? null,
    }));

    // Step 7: Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        storeId,
        search: search || null,
        category: category || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching products by store:", error);
    res.status(500).json({ message: "Failed to fetch products by store" });
  }
}
