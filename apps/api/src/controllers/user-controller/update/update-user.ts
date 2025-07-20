import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";

export async function updateCurrentUser(req: Request, res: Response) {
  try {
    // Access the authenticated user data from req.user
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    // Check if userId exists, meaning the user is authorized
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get the data from the request body that the user wants to update
    const { email, firstName, lastName, phoneNumber, role } = req.body;

    // Validate if the data is present in the request body
    if (!email && !firstName && !lastName && !phoneNumber) {
      res.status(400).json({ message: "No data to update" });
      return;
    }

    // Proceed to update the user's details in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Find the user by userId
      data: {
        email, // Update email
        firstName, // Update first name
        lastName, // Update last name
        phoneNumber, // Update phone number
        role: user.role === "SUPER_ADMIN" ? role : user.role, // Only allow SUPER_ADMIN to change role
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

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params;
  const { role } = req.body;

  // Validasi input
  if (!id || !role) {
    res.status(400).json({ message: "User ID and new role are required." });
    return;
  }

  try {
    // Update hanya field role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    res
      .status(200)
      .json({ message: "User role updated successfully", data: updatedUser });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
}
