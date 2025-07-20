import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";
import jwt from "jsonwebtoken";
import { Role } from "../../../../generated/prisma/index.js";

export async function getAllUser(_req: Request, res: Response) {
  try {
    const user = await prisma.user.findMany();
    res.status(200).json({ message: "Get All user success", data: user });
  } catch (error) {
    console.error("get All User Error:", error);
    res.status(500).json({ message: "Failed to get address" });
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
    // Extract the accessToken from cookies
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(401).json({ message: "Unauthorized. No token provided." });
      return;
    }

    // Verify and decode the JWT token to get user data (CustomJwtPayload)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    if (!decoded || !decoded.id) {
      res.status(401).json({ message: "Unauthorized. Invalid token." });
      return;
    }

    // Fetch the latest user data from the database using the decoded user ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phoneNumber: true,
        isVerified: true, // Check if the user is verified
      },
    });

    // If user is not found
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Return the user data excluding the password
    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Failed to get user data." });
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
