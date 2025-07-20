// import prisma from "../config/prisma-client.js";
// import bcrypt from "bcrypt";
// import { Request, Response } from "express";

// /**
//  * GET /api/store-admins
//  * Admin lihat semua user dengan role STORE_ADMIN
//  */
// export async function getAllStoreAdmins(_req: Request, res: Response) {
//   try {
//     const storeAdmins = await prisma.user.findMany({
//       where: { role: "STORE_ADMIN" },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//         username: true,
//         phoneNumber: true,
//         createdAt: true,
//         Store: true,
//       },
//     });
//     res.json(storeAdmins);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /**
//  * POST /api/store-admins
//  * Admin buat user baru dengan role STORE_ADMIN
//  */
// export async function createStoreAdmin(
//   req: Request,
//   res: Response
// ): Promise<void> {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       username,
//       password,
//       phoneNumber,
//       Store,
//     } = req.body;

//     if (!firstName || !lastName || !email || !password) {
//       res.status(400).json({ message: "Missing required fields" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await prisma.user.create({
//       data: {
//         firstName,
//         lastName,
//         email,
//         username,
//         password: hashedPassword,
//         phoneNumber,
//         Store,
//         role: "STORE_ADMIN",
//         isVerified: true, // Optional: langsung verified
//       },
//     });

//     res.status(201).json({
//       id: newUser.id,
//       email: newUser.email,
//       role: newUser.role,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /**
//  * PUT /api/store-admins/:id
//  * Admin update user STORE_ADMIN
//  */
// export async function updateStoreAdmin(
//   req: Request,
//   res: Response
// ): Promise<void> {
//   try {
//     const { id } = req.params;
//     const {
//       firstName,
//       lastName,
//       email,
//       username,
//       password,
//       phoneNumber,
//       Store,
//     } = req.body;

//     const user = await prisma.user.findUnique({ where: { id } });
//     if (!user || user.role !== "STORE_ADMIN") {
//       res.status(404).json({ message: "Store Admin not found" });
//     }

//     const dataToUpdate = {
//       firstName,
//       lastName,
//       email,
//       username,
//       phoneNumber,
//       password,
//       Store,
//     };

//     if (password) {
//       dataToUpdate.password = await bcrypt.hash(password, 10);
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: dataToUpdate,
//     });

//     res.json({
//       id: updatedUser.id,
//       email: updatedUser.email,
//       role: updatedUser.role,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({ message: "Server error" });
//   }
// }

// /**
//  * DELETE /api/store-admins/:id
//  * Admin hapus user STORE_ADMIN
//  */
// export async function deleteStoreAdmin(
//   req: Request,
//   res: Response
// ): Promise<void> {
//   try {
//     const { id } = req.params;

//     const user = await prisma.user.findUnique({ where: { id } });
//     if (!user || user.role !== "STORE_ADMIN") {
//       res.status(404).json({ message: "Store Admin not found" });
//     }

//     await prisma.user.delete({ where: { id } });

//     res.json({ message: "Store Admin deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// }
