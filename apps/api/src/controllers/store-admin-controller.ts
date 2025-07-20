import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import bcrypt from "bcryptjs";

/* -------------------------------------------------------------------------- */
/*                          CREATE STORE ADMIN USER                          */
/* -------------------------------------------------------------------------- */
export async function createStoreAdmin(req: Request, res: Response) {
  try {
    // Cek apakah user yang request adalah SUPER_ADMIN
    const user = req.user as CustomJwtPayload;
    const userRole = user.role;

    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only super admins can create store admin users.",
      });
      return;
    }

    const {
      firstName,
      lastName,
      email,
      username,
      password,
      phoneNumber,
      storeId, // ID toko yang akan dikelola oleh store admin ini
    } = req.body;

    // Validasi input
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        message: "firstName, lastName, email, and password are required.",
      });
      return;
    }

    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email already exists." });
      return;
    }

    // Jika ada storeId, validasi apakah toko ada
    if (storeId) {
      const existingStore = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!existingStore) {
        res.status(404).json({ message: "Store not found." });
        return;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user dengan role STORE_ADMIN
    const newStoreAdmin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        phoneNumber,
        role: "STORE_ADMIN",
      },
    });

    // Jika ada storeId, update store untuk assign user ini sebagai admin
    if (storeId) {
      await prisma.store.update({
        where: { id: storeId },
        data: { userId: newStoreAdmin.id },
      });
    }

    // Return user tanpa password
    const { password: _, ...userWithoutPassword } = newStoreAdmin;

    res.status(201).json({
      message: "Store admin created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Create Store Admin Error:", error);
    res.status(500).json({ message: "Failed to create store admin." });
  }
}

/* -------------------------------------------------------------------------- */
/*                          UPDATE STORE ADMIN USER                          */
/* -------------------------------------------------------------------------- */
export async function updateStoreAdmin(req: Request, res: Response) {
  try {
    // Cek apakah user yang request adalah SUPER_ADMIN
    const user = req.user as CustomJwtPayload;
    const userRole = user.role;

    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only super admins can update store admin users.",
      });
      return;
    }

    const { id } = req.params;
    const { firstName, lastName, email, username, phoneNumber, storeId } =
      req.body;

    // Cek apakah user yang akan diupdate ada dan adalah STORE_ADMIN
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (existingUser.role !== "STORE_ADMIN") {
      res.status(400).json({
        message: "This user is not a store admin.",
      });
      return;
    }

    // Jika ada storeId, validasi apakah toko ada
    if (storeId) {
      const existingStore = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!existingStore) {
        res.status(404).json({ message: "Store not found." });
        return;
      }
    }

    // **BAGIAN BARU** - Handle store assignment
    // 1. Hapus assignment store lama dari user ini
    await prisma.store.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    // 2. Update user data
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        username,
        phoneNumber,
      },
    });

    // 3. Jika ada storeId baru, assign ke store tersebut
    if (storeId) {
      await prisma.store.update({
        where: { id: storeId },
        data: { userId: id },
      });
    }

    // Return user tanpa password
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: "Store admin updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update Store Admin Error:", error);
    res.status(500).json({ message: "Failed to update store admin." });
  }
}

/* -------------------------------------------------------------------------- */
/*                        GET STORE ADMIN WITH STORE                  */
/* -------------------------------------------------------------------------- */
export async function getStoreAdmins(req: Request, res: Response) {
  try {
    // Cek apakah user yang request adalah SUPER_ADMIN
    const user = req.user as CustomJwtPayload;
    const userRole = user.role;

    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only super admins can view store admin users.",
      });
      return;
    }

    const storeAdmins = await prisma.user.findMany({
      where: {
        role: "STORE_ADMIN",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        Store: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            StoreAddress: {
              select: {
                Address: {
                  select: {
                    city: true,
                    province: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Store admins retrieved successfully",
      data: storeAdmins,
    });
  } catch (error) {
    console.error("Get Store Admins Error:", error);
    res.status(500).json({ message: "Failed to get store admins." });
  }
}

/* -------------------------------------------------------------------------- */
/*                        GET STORE ADMIN BY ID                              */
/* -------------------------------------------------------------------------- */
export async function getStoreAdminById(req: Request, res: Response) {
  try {
    // Cek apakah user yang request adalah SUPER_ADMIN
    const user = req.user as CustomJwtPayload;
    const userRole = user.role;

    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only super admins can view store admin details.",
      });
      return;
    }

    const { id } = req.params;

    const storeAdmin = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        Store: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            StoreAddress: {
              select: {
                Address: {
                  select: {
                    city: true,
                    province: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!storeAdmin) {
      res.status(404).json({ message: "Store admin not found." });
      return;
    }

    if (storeAdmin.role !== "STORE_ADMIN") {
      res.status(400).json({
        message: "This user is not a store admin.",
      });
      return;
    }

    res.status(200).json({
      message: "Store admin retrieved successfully",
      data: storeAdmin,
    });
  } catch (error) {
    console.error("Get Store Admin Error:", error);
    res.status(500).json({ message: "Failed to get store admin." });
  }
}
