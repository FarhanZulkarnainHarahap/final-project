import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import { InventoryAction } from "../../generated/prisma/index.js";

// Helper functions
const buildWhereClause = async (
  user: CustomJwtPayload,
  additionalFilters: any = {}
) => {
  let whereClause = { deletedAt: null, ...additionalFilters };
  if (user.role === "STORE_ADMIN") {
    const userStores = await prisma.store.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    whereClause.storeId = { in: userStores.map((store) => store.id) };
  }
  return whereClause;
};

const getPaginationData = (
  page: string | undefined,
  limit: string | undefined
) => {
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
};

const updateStockOperation = async (
  storeId: string,
  productId: string,
  quantity: number,
  action: InventoryAction,
  user: CustomJwtPayload,
  weight: number,
  isCreate: boolean = false
) => {
  const currentStock = isCreate
    ? 0
    : (
        await prisma.storeProduct.findUnique({
          where: { productId_storeId: { productId, storeId } },
        })
      )?.stock || 0;

  let newStock: number;
  let actualQuantity: number;

  switch (action) {
    case "ADD":
    case "RESTOCK":
      newStock = currentStock + quantity;
      actualQuantity = quantity;
      break;
    case "SALE":
      if (currentStock < quantity) {
        throw new Error(
          `Insufficient stock. Current: ${currentStock}, Requested: ${quantity}`
        );
      }
      newStock = currentStock - quantity;
      actualQuantity = -quantity;
      break;
    default:
      throw new Error("Invalid action");
  }

  await prisma.$transaction(async (tx) => {
    await tx.inventoryJournal.create({
      data: {
        storeId,
        productId,
        quantity: actualQuantity.toString(),
        weight,
        action,
        userId: user.id,
      },
    });

    await tx.storeProduct.upsert({
      where: { productId_storeId: { productId, storeId } },
      update: { stock: newStock, updatedAt: new Date() },
      create: { productId, storeId, stock: newStock },
    });
  });
};

/* -------------------------------------------------------------------------- */
/*                             GET INVENTORY DATA                             */
/* -------------------------------------------------------------------------- */
export async function getInventoryData(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { storeId, productId, page, limit } = req.query;
    const { pageNum, limitNum, skip } = getPaginationData(
      page as string,
      limit as string
    );

    const additionalFilters: any = {};
    if (storeId && user.role === "SUPER_ADMIN")
      additionalFilters.storeId = storeId;
    if (productId) additionalFilters.productId = productId;

    const whereClause = await buildWhereClause(user, additionalFilters);

    const [totalItems, inventoryData] = await Promise.all([
      prisma.storeProduct.count({ where: whereClause }),
      prisma.storeProduct.findMany({
        where: whereClause,
        include: {
          Product: {
            include: {
              imagePreview: true,
              ProductCategory: { include: { Category: true } },
            },
          },
          Store: { include: { StoreAddress: { include: { Address: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      message: "Inventory data retrieved successfully",
      data: inventoryData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error getting inventory data:", error);
    res.status(500).json({ message: "Failed to get inventory data" });
  }
}

/* -------------------------------------------------------------------------- */
/*                            UPDATE STOCK WITH JOURNAL                       */
/* -------------------------------------------------------------------------- */
export async function updateStockWithJournal(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { storeId, productId, quantity, action } = req.body;

    if (!storeId || !productId || !quantity || !action) {
      res.status(400).json({
        message: "storeId, productId, quantity, and action are required",
      });
      return;
    }

    const validActions: InventoryAction[] = ["RESTOCK", "SALE", "ADD"];
    if (!validActions.includes(action) || parseInt(quantity) <= 0) {
      res.status(400).json({
        message: "Invalid action or quantity",
      });
      return;
    }

    if (user.role === "STORE_ADMIN") {
      const userStore = await prisma.store.findFirst({
        where: { id: storeId, userId: user.id },
      });
      if (!userStore) {
        res.status(403).json({
          message: "You don't have permission to update this store's inventory",
        });
        return;
      }
    }

    const [store, product] = await Promise.all([
      prisma.store.findUnique({ where: { id: storeId } }),
      prisma.product.findUnique({ where: { id: productId, deletedAt: null } }),
    ]);

    if (!store || !product) {
      res.status(404).json({ message: "Store or product not found" });
      return;
    }

    await updateStockOperation(
      storeId,
      productId,
      parseInt(quantity),
      action,
      user,
      product.weight
    );

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Failed to update stock" });
  }
}

/* -------------------------------------------------------------------------- */
/*                        SUPER ADMIN: CREATE STOCK ENTRY                    */
/* -------------------------------------------------------------------------- */
export async function createStockEntry(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user || user.role !== "SUPER_ADMIN") {
      res
        .status(403)
        .json({ message: "Only Super Admin can create stock entries" });
      return;
    }

    const { storeId, productId, initialStock } = req.body;
    const stockNum = parseInt(initialStock);

    if (!storeId || !productId || stockNum < 0) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }

    const existing = await prisma.storeProduct.findUnique({
      where: { productId_storeId: { productId, storeId } },
    });

    if (existing) {
      res.status(400).json({ message: "Stock entry already exists" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await updateStockOperation(
      storeId,
      productId,
      stockNum,
      "ADD",
      user,
      product.weight,
      true
    );

    res.status(201).json({ message: "Stock entry created successfully" });
  } catch (error) {
    console.error("Error creating stock entry:", error);
    res.status(500).json({ message: "Failed to create stock entry" });
  }
}

/* -------------------------------------------------------------------------- */
/*                        SUPER ADMIN: DELETE STOCK ENTRY                    */
/* -------------------------------------------------------------------------- */
export async function deleteStockEntry(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user || user.role !== "SUPER_ADMIN") {
      res
        .status(403)
        .json({ message: "Only Super Admin can delete stock entries" });
      return;
    }

    const { storeId, productId } = req.params;

    const existing = await prisma.storeProduct.findUnique({
      where: { productId_storeId: { productId, storeId } },
      include: { Product: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Stock entry not found" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.inventoryJournal.create({
        data: {
          storeId,
          productId,
          quantity: (-existing.stock).toString(),
          weight: existing.Product.weight,
          action: "SALE",
          userId: user.id,
        },
      });

      await tx.storeProduct.update({
        where: { productId_storeId: { productId, storeId } },
        data: { deletedAt: new Date(), stock: 0 },
      });
    });

    res.status(200).json({ message: "Stock entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting stock entry:", error);
    res.status(500).json({ message: "Failed to delete stock entry" });
  }
}

/* -------------------------------------------------------------------------- */
/*                            GET INVENTORY HISTORY                           */
/* -------------------------------------------------------------------------- */
export async function getInventoryHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { storeId, productId, action, startDate, endDate, page, limit } =
      req.query;
    const { pageNum, limitNum, skip } = getPaginationData(
      page as string,
      limit as string
    );

    // Build filters
    let whereClause: any = {};

    // PERBAIKAN: Filter berdasarkan role
    if (user.role === "STORE_ADMIN") {
      // Store admin hanya bisa lihat tokonya sendiri
      const userStores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      if (userStores.length === 0) {
        res.status(403).json({ message: "No store assigned to this user" });
        return;
      }

      const userStoreIds = userStores.map((store) => store.id);
      whereClause.storeId = { in: userStoreIds };
    } else if (user.role === "SUPER_ADMIN") {
      // Super admin bisa filter berdasarkan storeId jika ada
      if (storeId) {
        whereClause.storeId = storeId as string;
      }
    } else {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Filter lainnya
    if (productId) whereClause.productId = productId as string;
    if (action) whereClause.action = action as InventoryAction;

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate as string);
      }
    }

    // Get total count
    const totalItems = await prisma.inventoryJournal.count({
      where: whereClause,
    });

    // Get history data
    const historyData = await prisma.inventoryJournal.findMany({
      where: whereClause,
      include: {
        Store: true,
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: { include: { Category: true } },
          },
        },
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      message: "Inventory history retrieved successfully",
      data: historyData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error getting inventory history:", error);
    res.status(500).json({ message: "Failed to get inventory history" });
  }
}

/* -------------------------------------------------------------------------- */
/*                            GET LOW STOCK ALERTS                            */
/* -------------------------------------------------------------------------- */
export async function getLowStockAlerts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const threshold = parseInt(req.query.threshold as string) || 10;
    const whereClause = await buildWhereClause(user, {
      stock: { lte: threshold },
    });

    const lowStockItems = await prisma.storeProduct.findMany({
      where: whereClause,
      include: {
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: { include: { Category: true } },
          },
        },
        Store: true,
      },
      orderBy: { stock: "asc" },
    });

    res.status(200).json({
      message: "Low stock items retrieved successfully",
      data: lowStockItems,
      threshold,
      totalLowStockItems: lowStockItems.length,
    });
  } catch (error) {
    console.error("Error getting low stock alerts:", error);
    res.status(500).json({ message: "Failed to get low stock alerts" });
  }
}
