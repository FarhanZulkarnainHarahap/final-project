import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import bcrypt from "bcryptjs";
import handlebars from "handlebars";
import fs from "fs/promises";
import { Resend } from "resend";
import { Role } from "../../generated/prisma/index.js";

const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------------------------------------------------------------- */
/*                                GET ALL USER                                */
/* -------------------------------------------------------------------------- */
export async function getAllUser(req: Request, res: Response) {
  try {
    // Ambil query parameters
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      role = "",
    } = req.query;

    // Convert string ke number untuk pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validasi sortBy untuk mencegah injection
    const allowedSortFields = [
      "id",
      "username",
      "email",
      "firstName",
      "lastName",
      "role",
      "createdAt",
    ];
    const validSortBy = allowedSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "createdAt";
    const validSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Build where clause untuk filtering
    const whereClause: any = {};

    // Search filter (mencari di multiple fields)
    if (search) {
      whereClause.OR = [
        { username: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        { firstName: { contains: search as string, mode: "insensitive" } },
        { lastName: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Role filter
    if (role && role !== "") {
      whereClause.role = role as Role;
    }
    // Get total count untuk pagination info
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    // Get users with pagination, filtering, and sorting
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        [validSortBy]: validSortOrder,
      },
      skip: skip,
      take: limitNum,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Response dengan metadata pagination
    res.status(200).json({
      message: "Get All users success",
      data: users,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalUsers: totalUsers,
        usersPerPage: limitNum,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
      filters: {
        search: search || null,
        role: role || null,
        sortBy: validSortBy,
        sortOrder: validSortOrder,
      },
    });
  } catch (error) {
    console.error("get All User Error:", error);
    res.status(500).json({ message: "Failed to get users" });
  }
}
/* -------------------------------------------------------------------------- */
/*                              GET CURRENT USER                              */
/* -------------------------------------------------------------------------- */
export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Login biasa (manual)
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    // Login Google

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      role: user.role,
      loginType: user.loginType,
    };
    res.status(200).json({ data: userData });
  } catch (error) {
    console.error("get User Error:", error);
    res.status(500).json({ message: "Failed to get User" });
  }
}
/* -------------------------------------------------------------------------- */
/*                           GET UPDATE CURRENT USER                          */
/* -------------------------------------------------------------------------- */
export async function updateCurrentUser(req: Request, res: Response) {
  try {
    // Access the authenticated user data from req.user
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    // Check if userId exists, meaning the user is authorized
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the data from the request body that the user wants to update
    const { email, firstName, lastName, phoneNumber, role } = req.body;

    // Validate if the data is present in the request body
    if (!email && !firstName && !lastName && !phoneNumber) {
      return res.status(400).json({ message: "No data to update" });
    }

    // Proceed to update the user's details in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Find the user by userId
      data: {
        email, // Update email
        firstName, // Update first name
        lastName, // Update last name
        phoneNumber, // Update phone number
        role,
      },
    });

    // Return the updated user data
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error });
  }
}
/* -------------------------------------------------------------------------- */
/*                                 DELETE USER                                */
/* -------------------------------------------------------------------------- */
export async function deleteUser(req: Request, res: Response) {
  try {
    // Get the authenticated user from req.user (you'll probably have a middleware for authentication)
    const user = req.user as CustomJwtPayload;

    const userRole = user.role;

    // Check if the user is a super admin
    if (userRole !== "SUPER_ADMIN") {
      res
        .status(403)
        .json({ message: "Forbidden: Only super admins can delete users." });
      return;
    }

    // Get the user ID to delete from the request params
    const { id } = req.params;

    // Check if the user to delete exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Proceed to delete the user from the database
    await prisma.user.delete({
      where: { id },
    });

    // Send a success response
    res.status(200).json({ message: "User successfully deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user.", error });
  }
}

function getRandom(length: number): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length); // Menghasilkan string acak
}
export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email diperlukan." });
      return;
    }

    // Mencari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res
        .status(404)
        .json({ message: "User dengan email ini tidak ditemukan." });
      return;
    }

    // Membuat token reset dan waktu kedaluwarsa (1 jam)
    const resetToken = getRandom(32); // Menggunakan randomBytes dengan benar
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1); // Kedaluwarsa dalam 1 jam

    // Menyimpan token dan waktu kedaluwarsa pada user
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiresAt,
      },
    });

    // Membaca template email dan mengompile-nya
    const templateSource = await fs.readFile(
      "src/templates/reset-password.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);

    // Menghasilkan konten email dengan link reset dan link resend
    const htmlTemplate = compiledTemplate({
      resetLink: `http://localhost:8000/reset-password?token=${resetToken}`, // Link reset password
      resendLink: `http://localhost:8000/request-reset`, // Link resend reset request
      companyName: "YourCompany", // Nama perusahaan
      currentYear: new Date().getFullYear(),
    });

    // Mengirim email menggunakan Resend API
    const { error: resendError } = await resend.emails.send({
      from: "reset-password@market-snap.com", // Gantilah dengan email pengirim yang sesuai
      to: user.email,
      subject: "Permintaan Reset Password",
      html: htmlTemplate, // Menggunakan HTML template yang telah di-generate
    });
    if (resendError) {
      res.status(400).json({ message: "email true but failed to send email" });
      return;
    }
    res.status(200).json({ message: "Email reset password telah dikirim." });
  } catch (error) {
    console.error("Terjadi kesalahan dalam menangani permintaan reset:", error);
    res.status(500).json({ message: "Gagal mengirim email reset password." });
  }
}

// CHANGE PASSWORD
export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user as CustomJwtPayload;
    const userId = user.id; // Diambil dari auth middleware

    if (!oldPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "oldPassword and newPassword are required." });
      return;
    }

    const userChangePassword = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userChangePassword) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Old password is incorrect." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Failed to change password." });
  }
}

export async function getUsersByRole(req: Request, res: Response) {
  try {
    const roleParam = req.query.role as string;

    if (!roleParam) {
      res.status(400).json({ message: "Role query parameter is required." });
      return;
    }

    // Validasi role
    let prismaRole: Role;
    if (roleParam.toUpperCase() === "STORE_ADMIN") {
      prismaRole = Role.STORE_ADMIN;
    } else if (roleParam.toUpperCase() === "SUPER_ADMIN") {
      prismaRole = Role.SUPER_ADMIN;
    } else {
      res.status(400).json({ message: "Invalid role value." });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        role: prismaRole,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    res.status(200).json({
      message: "Users fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users." });
  }
}
