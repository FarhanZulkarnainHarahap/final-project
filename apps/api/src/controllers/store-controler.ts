import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

export async function createStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized. User not found." });
    return;
  }

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
        userId: userId,
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

// Get all stores with their associated addresses and store products
export async function getAllStores(_req: Request, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });
    if (!stores) {
      res.status(400).json({ message: "Stores Not Found" });
      return;
    }
    res.status(200).json({ message: "Stores fetched.", data: stores });
  } catch (error) {
    console.error("Fetch stores error:", error);
    res.status(500).json({ message: "Error fetching stores." });
  }
}

export async function deleteStore(req: Request, res: Response) {
  const { storeId } = req.params;

  try {
    // 1. Ambil semua StoreAddress yang terhubung ke Store ini
    const storeAddresses = await prisma.storeAddress.findMany({
      where: { storeId },
    });

    // 2. Hapus semua Address yang berelasi dengan masing-masing StoreAddress
    for (const sa of storeAddresses) {
      await prisma.address.deleteMany({
        where: { storeAddressId: sa.id },
      });
    }

    // 3. Hapus semua StoreAddress yang terkait dengan storeId
    await prisma.storeAddress.deleteMany({
      where: { storeId },
    });

    // 4. Hapus semua StoreProduct yang terkait dengan storeId (jika ada)
    await prisma.storeProduct.deleteMany({
      where: { storeId },
    });

    // 5. Hapus data Store itu sendiri
    const deletedStore = await prisma.store.delete({
      where: { id: storeId },
    });

    res
      .status(200)
      .json({ message: "Toko berhasil dihapus.", data: deletedStore });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menghapus toko." });
  }
}
// Get a store by its ID along with its associated products
export async function getStoreById(req: Request, res: Response) {
  const { storeId } = req.params;

  if (!storeId) {
    res.status(400).json({ message: "Store ID is required." });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        StoreProduct: {
          include: { Product: true },
        },
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });

    if (!store) {
      res.status(404).json({ message: "Store not found." });
      return;
    }

    res.status(200).json({ message: `Get ${storeId} success`, data: store });
  } catch (error) {
    console.error("Get store by ID error:", error);
    res.status(500).json({ message: "Error retrieving store." });
  }
}
export async function updateStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const storeId = req.params.storeId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized user." });
    return;
  }

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
    // 1. Check if store exists and owned by current user
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { StoreAddress: { include: { Address: true } } },
    });

    if (!store || store.userId !== userId) {
      res.status(404).json({ message: "Store not found or access denied." });
      return;
    }

    // 2. Update store name
    await prisma.store.update({
      where: { id: storeId },
      data: { name },
    });

    // 3. Update StoreAddress (ambil satu alamat pertama)
    const storeAddress = store.StoreAddress[0];
    if (storeAddress) {
      await prisma.storeAddress.update({
        where: { id: storeAddress.id },
        data: {
          latitude,
          longitude,
        },
      });

      // 4. Update Address terkait
      const relatedAddress = storeAddress.Address[0];
      if (relatedAddress) {
        await prisma.address.update({
          where: { id: relatedAddress.id },
          data: {
            address,
            city,
            province,
            postalCode,
            destination,
          },
        });
      }
    }

    res.json({ message: "Store updated successfully." });
  } catch (error) {
    console.error("Update store error:", error);
    res.status(500).json({ message: "Error updating store." });
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

// Fungsi untuk menghitung jarak antara dua titik koordinat
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
                storeId: { in: nearbyStoreIds },
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
      skip: sortByDistance ? 0 : skip, // Don't skip if sorting by distance (we'll handle pagination after sorting)
      take: sortByDistance ? undefined : limit, // Don't limit if sorting by distance
    });

    // 8. MAP RESULTS AND ADD DISTANCE INFO
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
      };
    });

    // 9. HANDLE DISTANCE SORTING AND PAGINATION
    if (sortByDistance) {
      // Sort by distance
      productsWithDistance.sort((a, b) => {
        if (finalSortOrder === "asc") {
          return a.storeDistance - b.storeDistance;
        } else {
          return b.storeDistance - a.storeDistance;
        }
      });

      // Apply pagination after sorting
      const startIndex = skip;
      const endIndex = skip + limit;
      productsWithDistance = productsWithDistance.slice(startIndex, endIndex);
    }

    // 10. CALCULATE PAGINATION INFO
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 11. PREPARE RESPONSE
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
  const R = 6371e3; // Radius bumi dalam meter
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
