import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

// GET ALL PRODUCT
export async function getAllProduct(req: Request, res: Response) {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || "createdAt"; // default sort by createdAt
    const sortOrder = (req.query.sortOrder as string) || "desc"; // default desc

    const allowedSortFields = [
      "name",
      "price",
      "createdAt",
      "updatedAt",
      "stock",
    ];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category) {
      where.ProductCategory = {
        some: {
          Category: {
            name: {
              equals: category,
              mode: "insensitive",
            },
          },
        },
      };
    }
    let orderBy: any = {};

    if (finalSortBy === "stock") {
      orderBy = {
        StoreProduct: {
          _count: finalSortOrder,
        },
      };
    } else {
      orderBy[finalSortBy] = finalSortOrder;
    }

    const totalProducts = await prisma.product.count({
      where,
    });
    const products = await prisma.product.findMany({
      where,
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          include: {
            Store: true,
          },
        },
        Discount: {
          where: {
            deletedAt: null,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          orderBy: { value: "desc" },
          take: 1,
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    let finalResult = products.map((item) => {
      const storeProduct = item.StoreProduct?.[0];

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: storeProduct ? storeProduct.stock : 0,
        storeName: storeProduct?.Store?.name ?? null,
        imagePreview: item.imagePreview,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.ProductCategory.map((el) => el.Category.name),
      };
    });

    if (finalSortBy === "stock") {
      finalResult = finalResult.sort((a, b) => {
        if (finalSortOrder === "asc") {
          return a.stock - b.stock;
        } else {
          return b.stock - a.stock;
        }
      });
    }
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      data: finalResult,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search: search || null,
        category: category || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get all products data" });
  }
}
// GET PRODUCT BY ID
export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { lat, lng, province, includeAllStores } = req.query;

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        imagePreview: true,
        imageContent: true,
        ProductCategory: { include: { Category: true } }, // 🔥 TAMBAH DISCOUNT MANUAL
        Discount: {
          where: {
            deletedAt: null,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          orderBy: { value: "desc" },
          take: 1,
        },
      },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (includeAllStores === "true") {
      const allStoreProducts = await prisma.storeProduct.findMany({
        where: { productId: id, deletedAt: null },
        include: { Store: true },
      });

      res.status(200).json({
        data: {
          ...product,
          StoreProduct: allStoreProducts,
        },
      });
    }

    // ✅ LOGIC LAMA TETAP SAMA - untuk customer/user
    let storeProduct;

    // Prioritas 1: Jika lat & lng tersedia, cari toko terdekat (simple Euclidean)
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      const stores = await prisma.storeAddress.findMany({
        where: {
          Store: {
            StoreProduct: {
              some: { productId: id, deletedAt: null },
            },
          },
        },
        include: {
          Store: {
            include: {
              StoreProduct: {
                where: { productId: id, deletedAt: null },
              },
            },
          },
        },
      });

      // Hitung jarak dan cari yang terdekat
      let minDistance = Infinity;
      let nearestStore = null;

      for (const store of stores) {
        const dist = Math.sqrt(
          Math.pow(store.latitude - latitude, 2) +
            Math.pow(store.longitude - longitude, 2)
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearestStore = store;
        }
      }

      storeProduct = nearestStore?.Store?.StoreProduct?.[0];
    }

    // Prioritas 2: jika ada provinsi
    if (!storeProduct && province) {
      const addresses = await prisma.address.findMany({
        where: {
          province: { equals: province as string, mode: "insensitive" },
          storeAddressId: { not: null },
        },
        select: { storeAddressId: true },
      });

      const storeAddressIds = addresses.map((a) => a.storeAddressId!);

      const storeAddress = await prisma.storeAddress.findFirst({
        where: {
          id: { in: storeAddressIds },
          Store: {
            StoreProduct: {
              some: { productId: id, deletedAt: null },
            },
          },
        },
        include: {
          Store: {
            include: {
              StoreProduct: {
                where: { productId: id, deletedAt: null },
              },
            },
          },
        },
      });

      storeProduct = storeAddress?.Store.StoreProduct?.[0];
    }

    // Fallback: ambil dari toko manapun yang punya produk
    if (!storeProduct) {
      storeProduct = await prisma.storeProduct.findFirst({
        where: { productId: id, deletedAt: null },
      });
    }

    res.status(200).json({
      data: {
        ...product,
        StoreProduct: storeProduct ? [storeProduct] : [],
      },
    });
    return;
  } catch (error) {
    console.error("❌ Error getProductById:", error);
    res.status(500).json({ message: "Error fetching product by ID" });
  }
}

export async function getAllProductsByCity(req: Request, res: Response) {
  try {
    const { province, category: rawCategory, search: rawSearch } = req.query;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    // Validate province
    if (!province || typeof province !== "string") {
      res.status(400).json({ message: "Province parameter is required." });
      return;
    }

    // Normalize and validate filters
    const category =
      typeof rawCategory === "string"
        ? rawCategory
        : Array.isArray(rawCategory)
          ? rawCategory[0]
          : undefined;

    const search =
      typeof rawSearch === "string"
        ? rawSearch
        : Array.isArray(rawSearch)
          ? rawSearch[0]
          : undefined;

    const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    const addresses = await prisma.address.findMany({
      where: {
        province: {
          equals: province,
          mode: "insensitive",
        },
        storeAddressId: { not: null },
      },
      select: { storeAddressId: true },
    });

    const storeAddressIds = addresses.map((addr) => addr.storeAddressId!);

    const storeAddresses = await prisma.storeAddress.findMany({
      where: {
        id: { in: storeAddressIds },
      },
      select: { storeId: true },
    });

    const storeIds = storeAddresses.map((sa) => sa.storeId);

    let productIds: string[] | undefined = undefined;

    if (category || search) {
      const productWhere: any = {
        deletedAt: null,
      };

      if (category) {
        productWhere.ProductCategory = {
          some: {
            Category: {
              name: { equals: category, mode: "insensitive" },
            },
          },
        };
      }

      if (search) {
        productWhere.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      const products = await prisma.product.findMany({
        where: productWhere,
        select: { id: true },
      });

      productIds = products.map((p) => p.id);
    }

    const where: any = {
      storeId: { in: storeIds },
      deletedAt: null,
      ...(productIds && { productId: { in: productIds } }),
    };

    const totalProducts = await prisma.storeProduct.count({
      where,
    });

    const orderBy: any = {
      Product: { [finalSortBy]: finalSortOrder },
    };

    const storeProducts = await prisma.storeProduct.findMany({
      where,
      include: {
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: { include: { Category: true } },
            Discount: {
              where: {
                storeId: { in: storeIds }, // Only get discounts for current stores
                deletedAt: null,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
              orderBy: { value: "desc" },
              take: 1,
            },
          },
        },
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
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: `Products in province: ${province}`,
      data: storeProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        province,
        category: category || null,
        search: search || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching products by province:", error);
    res.status(500).json({ message: "Error fetching products." });
  }
}

export async function getNearbyProducts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // 1. EXTRACT QUERY PARAMETERS
    const { latitude, longitude, radius = 5000, category } = req.query;
    const search = req.query.search as string | undefined;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt"; // default sort by createdAt
    const sortOrder = (req.query.sortOrder as string) || "desc"; // default desc

    // Distance sort parameter (specific to nearby search)
    const sortByDistance = req.query.sortByDistance === "true";

    // Validate required parameters
    if (!latitude || !longitude) {
      res.status(400).json({ message: "Latitude and longitude are required." });
      return;
    }

    // Validate and parse coordinates
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);

    if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
      res
        .status(400)
        .json({ message: "Invalid latitude, longitude, or radius." });
      return;
    }

    const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    const stores = await prisma.store.findMany({
      include: {
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });

    const nearbyStores = stores
      .map((store) => {
        const addr = store.StoreAddress[0];
        if (!addr?.latitude || !addr?.longitude) return null;

        const distance = calculateDistance(
          lat,
          lon,
          addr.latitude,
          addr.longitude
        );
        return distance <= rad
          ? {
              id: store.id,
              name: store.name,
              distance: Math.round(distance * 100) / 100,
              address: addr.Address,
            }
          : null;
      })
      .filter(
        (
          s
        ): s is {
          id: string;
          name: string;
          distance: number;
          address: any;
        } => s !== null
      );

    if (sortByDistance) {
      nearbyStores.sort((a, b) => a.distance - b.distance);
    }

    if (nearbyStores.length === 0) {
      res.json({
        nearbyStores: [],
        products: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: {
          search: search || null,
          category: category || null,
          radius: rad,
          sortBy: sortByDistance ? "distance" : finalSortBy,
          sortOrder: finalSortOrder,
        },
      });
      return;
    }

    const nearbyStoreIds = nearbyStores.map((s) => s.id);

    const productFilter: any = {
      deletedAt: null,
    };

    if (search) {
      productFilter.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category && typeof category === "string") {
      productFilter.ProductCategory = {
        some: {
          Category: {
            name: { equals: category, mode: "insensitive" },
          },
        },
      };
    }

    const storeProductWhere = {
      storeId: { in: nearbyStoreIds },
      deletedAt: null,
      Product: productFilter,
    };

    const totalProducts = await prisma.storeProduct.count({
      where: storeProductWhere,
    });

    let orderBy: any = {};

    if (sortByDistance) {
      orderBy = {
        Product: { [finalSortBy]: finalSortOrder },
      };
    } else {
      orderBy = {
        Product: { [finalSortBy]: finalSortOrder },
      };
    }

    const storeProducts = await prisma.storeProduct.findMany({
      where: storeProductWhere,
      include: {
        Product: {
          include: {
            imagePreview: true,
            imageContent: true,
            ProductCategory: {
              include: { Category: true },
            },
            User: true,
            Discount: {
              where: {
                deletedAt: null,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
              orderBy: { value: "desc" },
              take: 1,
            },
          },
        },
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
      orderBy,
      skip: sortByDistance ? 0 : skip,
      take: sortByDistance ? undefined : limit,
    });

    let productsWithDistance = storeProducts.map((sp) => {
      const storeData = nearbyStores.find((ns) => ns.id === sp.storeId);

      return {
        id: sp.Product.id,
        name: sp.Product.name,
        description: sp.Product.description,
        price: sp.Product.price,
        weight: sp.Product.weight,
        stock: sp.stock,
        storeName: sp.Store?.name ?? null,
        storeDistance: storeData?.distance ?? 0,
        storeAddress: storeData?.address ?? null,
        imagePreview: sp.Product.imagePreview,
        imageContent: sp.Product.imageContent,
        createdAt: sp.Product.createdAt,
        updatedAt: sp.Product.updatedAt,
        category: sp.Product.ProductCategory.map((pc) => pc.Category.name),
        user: sp.Product.User,
        Discount: sp.Product.Discount,
      };
    });

    if (sortByDistance) {
      productsWithDistance.sort((a, b) => {
        if (finalSortOrder === "asc") {
          return a.storeDistance - b.storeDistance;
        } else {
          return b.storeDistance - a.storeDistance;
        }
      });
      const startIndex = skip;
      const endIndex = skip + limit;
      productsWithDistance = productsWithDistance.slice(startIndex, endIndex);
    }

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      nearbyStores: nearbyStores.map((store) => ({
        id: store.id,
        name: store.name,
        distance: store.distance,
        address: store.address,
      })),
      products: productsWithDistance,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search: search || null,
        category: category || null,
        radius: rad,
        latitude: lat,
        longitude: lon,
        sortBy: sortByDistance ? "distance" : finalSortBy,
        sortOrder: finalSortOrder,
        sortByDistance,
      },
      summary: {
        totalNearbyStores: nearbyStores.length,
        averageDistance:
          nearbyStores.length > 0
            ? Math.round(
                (nearbyStores.reduce((sum, store) => sum + store.distance, 0) /
                  nearbyStores.length) *
                  100
              ) / 100
            : 0,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching nearby products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Jarak dalam meter
}
