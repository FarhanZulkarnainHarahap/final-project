import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import { DiscountType } from "../../generated/prisma/index.js";

// Helper function untuk build where clause berdasarkan role
const buildDiscountWhereClause = async (
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

/* -------------------------------------------------------------------------- */
/*                             GET ALL DISCOUNTS                             */
/* -------------------------------------------------------------------------- */
export async function getDiscounts(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { storeId, productId, page, limit, isActive } = req.query;
    const { pageNum, limitNum, skip } = getPaginationData(
      page as string,
      limit as string
    );

    const additionalFilters: any = {};
    if (storeId && user.role === "SUPER_ADMIN")
      additionalFilters.storeId = storeId;
    if (productId) additionalFilters.productId = productId;

    // Filter untuk active/expired discounts
    if (isActive === "true") {
      additionalFilters.endDate = { gte: new Date() };
      additionalFilters.startDate = { lte: new Date() };
    } else if (isActive === "false") {
      additionalFilters.endDate = { lt: new Date() };
    }

    const whereClause = await buildDiscountWhereClause(user, additionalFilters);

    const [totalItems, discounts] = await Promise.all([
      prisma.discount.count({ where: whereClause }),
      prisma.discount.findMany({
        where: whereClause,
        include: {
          Store: true,
          Product: {
            include: {
              imagePreview: true,
            },
          },
          DiscountUsage: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
              User: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      message: "Discounts retrieved successfully",
      data: discounts,
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
    console.error("Error getting discounts:", error);
    res.status(500).json({ message: "Failed to get discounts" });
  }
}

/* -------------------------------------------------------------------------- */
/*                             CREATE DISCOUNT                               */
/* -------------------------------------------------------------------------- */
export async function createDiscount(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      storeId,
      productId,
      value,
      discountType,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
    } = req.body;

    // Validation
    if (
      !storeId ||
      !productId ||
      !value ||
      !discountType ||
      !startDate ||
      !endDate
    ) {
      res.status(400).json({
        message:
          "storeId, productId, value, discountType, startDate, and endDate are required",
      });
      return;
    }

    const validDiscountTypes: DiscountType[] = ["PERCENTAGE", "FIXED"];
    if (!validDiscountTypes.includes(discountType)) {
      res.status(400).json({ message: "Invalid discount type" });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      res.status(400).json({ message: "End date must be after start date" });
      return;
    }

    // Check if user has permission for this store
    if (user.role === "STORE_ADMIN") {
      const userStore = await prisma.store.findFirst({
        where: { id: storeId, userId: user.id },
      });
      if (!userStore) {
        res.status(403).json({
          message:
            "You don't have permission to create discount for this store",
        });
        return;
      }
    }

    // Check if store and product exist
    const [store, product] = await Promise.all([
      prisma.store.findUnique({ where: { id: storeId } }),
      prisma.product.findUnique({ where: { id: productId, deletedAt: null } }),
    ]);

    if (!store || !product) {
      res.status(404).json({ message: "Store or product not found" });
      return;
    }

    // Create discount
    const discount = await prisma.discount.create({
      data: {
        storeId,
        productId,
        value: parseFloat(value),
        discountType,
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : 0,
        startDate: start,
        endDate: end,
      },
      include: {
        Store: true,
        Product: true,
      },
    });

    res.status(201).json({
      message: "Discount created successfully",
      data: discount,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ message: "Failed to create discount" });
  }
}

/* -------------------------------------------------------------------------- */
/*                             UPDATE DISCOUNT                               */
/* -------------------------------------------------------------------------- */
export async function updateDiscount(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const {
      value,
      discountType,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
    } = req.body;

    // Check if discount exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { id, deletedAt: null },
      include: { Store: true },
    });

    if (!existingDiscount) {
      res.status(404).json({ message: "Discount not found" });
      return;
    }

    // Check permission
    if (
      user.role === "STORE_ADMIN" &&
      existingDiscount.Store.userId !== user.id
    ) {
      res.status(403).json({
        message: "You don't have permission to update this discount",
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (value !== undefined) updateData.value = parseFloat(value);
    if (discountType !== undefined) updateData.discountType = discountType;
    if (minPurchase !== undefined)
      updateData.minPurchase = parseFloat(minPurchase);
    if (maxDiscount !== undefined)
      updateData.maxDiscount = parseFloat(maxDiscount);
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    // Validate dates if both are provided
    if (
      updateData.startDate &&
      updateData.endDate &&
      updateData.startDate >= updateData.endDate
    ) {
      res.status(400).json({ message: "End date must be after start date" });
      return;
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: { ...updateData, updatedAt: new Date() },
      include: {
        Store: true,
        Product: true,
      },
    });

    res.status(200).json({
      message: "Discount updated successfully",
      data: updatedDiscount,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Failed to update discount" });
  }
}

/* -------------------------------------------------------------------------- */
/*                             DELETE DISCOUNT                               */
/* -------------------------------------------------------------------------- */
export async function deleteDiscount(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    // Check if discount exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { id, deletedAt: null },
      include: { Store: true },
    });

    if (!existingDiscount) {
      res.status(404).json({ message: "Discount not found" });
      return;
    }

    // Check permission
    if (
      user.role === "STORE_ADMIN" &&
      existingDiscount.Store.userId !== user.id
    ) {
      res.status(403).json({
        message: "You don't have permission to delete this discount",
      });
      return;
    }

    // Soft delete
    await prisma.discount.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ message: "Failed to delete discount" });
  }
}

/* -------------------------------------------------------------------------- */
/*                           GET DISCOUNT USAGE REPORT                       */
/* -------------------------------------------------------------------------- */
export async function getDiscountUsageReport(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { storeId, startDate, endDate, page, limit } = req.query;
    const { pageNum, limitNum, skip } = getPaginationData(
      page as string,
      limit as string
    );

    // Build where clause for discount usage
    let whereClause: any = {};

    if (user.role === "STORE_ADMIN") {
      const userStores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      whereClause.Discount = {
        storeId: { in: userStores.map((store) => store.id) },
        deletedAt: null,
      };
    } else {
      whereClause.Discount = { deletedAt: null };
      if (storeId) {
        whereClause.Discount.storeId = storeId as string;
      }
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const [totalItems, usageData] = await Promise.all([
      prisma.discountUsage.count({ where: whereClause }),
      prisma.discountUsage.findMany({
        where: whereClause,
        include: {
          User: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          Discount: {
            include: {
              Store: true,
              Product: {
                include: {
                  imagePreview: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    // Calculate summary
    const totalDiscountAmount = usageData.reduce(
      (sum, usage) => sum + parseFloat(usage.totalAmount.toString()),
      0
    );

    res.status(200).json({
      message: "Discount usage report retrieved successfully",
      data: usageData,
      summary: {
        totalUsage: totalItems,
        totalDiscountAmount,
      },
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
    console.error("Error getting discount usage report:", error);
    res.status(500).json({ message: "Failed to get discount usage report" });
  }
}
