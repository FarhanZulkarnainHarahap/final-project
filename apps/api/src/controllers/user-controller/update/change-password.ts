import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";
import bcrypt from "bcryptjs";

// CHANGE PASSWORD
export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user as CustomJwtPayload;
    const userId = user.ud; // Diambil dari auth middleware

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
