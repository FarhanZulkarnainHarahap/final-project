// import { Request, Response } from "express";
// import prisma from "../config/prisma-client.js";

// // Get all store products
// export const getAllStoreProducts = async (_req: Request, res: Response) => {
//   try {
//     const storeProducts = await prisma.storeProduct.findMany({
//       include: {
//         Product: true,
//         Store: {
//           select: {
//             id: true,
//             name: true,
//             address: true,
//             imageUrl: true,
//           },
//         },
//       },
//     });
//     res.json(storeProducts);
//   } catch (error) {
//     console.error("Error fetching store products:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const getProductsByStore = async (req: Request, res: Response) => {
//   const { storeId } = req.params;
//   const page = parseInt(req.query.page as string) || 1;
//   const pageSize = parseInt(req.query.pageSize as string) || 10;
//   const category = req.query.category as string | undefined;

//   const skip = (page - 1) * pageSize;

//   try {
//     // Hitung total count buat pagination
//     const totalCount = await prisma.storeProduct.count({
//       where: {
//         storeId,
//         Product: {
//           ProductCategory: category
//             ? {
//                 some: {
//                   Category: {
//                     name: {
//                       equals: category,
//                       mode: "insensitive",
//                     },
//                   },
//                 },
//               }
//             : undefined,
//         },
//       },
//     });

//     // Ambil data store products dengan filter
//     const storeProducts = await prisma.storeProduct.findMany({
//       where: {
//         storeId,
//         Product: {
//           ProductCategory: category
//             ? {
//                 some: {
//                   Category: {
//                     name: {
//                       equals: category,
//                       mode: "insensitive",
//                     },
//                   },
//                 },
//               }
//             : undefined,
//         },
//       },
//       include: {
//         Product: {
//           include: {
//             ProductCategory: { include: { Category: true } },
//             imagePreview: true,
//           },
//         },
//       },
//       skip,
//       take: pageSize,
//     });

//     // Format data
//     const data = storeProducts.map((item) => ({
//       id: item.Product.id,
//       name: item.Product.name,
//       description: item.Product.description,
//       price: item.Product.price,
//       stock: item.stock,
//       imagePreview: item.Product.imagePreview,
//       category: item.Product.ProductCategory.map((el) => el.Category.name),
//     }));

//     // Response dengan data & info pagination
//     res.status(200).json({
//       data,
//       pagination: {
//         totalItems: totalCount,
//         totalPages: Math.ceil(totalCount / pageSize),
//         currentPage: page,
//         pageSize,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching products by store:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Get store product by ID
// export const getStoreProductById = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const storeProduct = await prisma.storeProduct.findUnique({
//       where: { id },
//       include: {
//         Product: {
//           select: {
//             id: true,
//             name: true,
//             price: true,
//             description: true,
//           },
//         },
//         Store: {
//           select: {
//             id: true,
//             name: true,
//             address: true,
//             imageUrl: true,
//           },
//         },
//       },
//     });

//     if (!storeProduct) {
//       res.status(404).json({ error: "Store Product not found" });
//     }

//     res.json(storeProduct);
//   } catch (error) {
//     console.error("Error fetching store product:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Create a new store product
// export const createStoreProduct = async (req: Request, res: Response) => {
//   const { storeId, productId, stock } = req.body;
//   try {
//     const newStoreProduct = await prisma.storeProduct.create({
//       data: {
//         storeId,
//         productId,
//         stock,
//       },
//     });
//     res.status(201).json(newStoreProduct);
//   } catch (error) {
//     console.error("Error creating store product:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Update a store product
// export const updateStoreProduct = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { stock } = req.body;
//   try {
//     const updatedStoreProduct = await prisma.storeProduct.update({
//       where: { id: id },
//       data: { stock },
//     });
//     res.json(updatedStoreProduct);
//   } catch (error) {
//     console.error("Error updating store product:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Delete a store product
// export const deleteStoreProduct = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     await prisma.storeProduct.delete({
//       where: { id: id },
//     });
//     res.status(204).send();
//   } catch (error) {
//     console.error("Error deleting store product:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
