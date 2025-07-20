import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import prisma from "../../../config/prisma-client.js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import fs from "fs/promises";
import handlebars from "handlebars";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendSetPasswordLink(req: Request, res: Response) {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate reset token using JWT
    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Save the token to a cookie (if needed)
    res.cookie("resetToken", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour expiration
    });

    // Read the Handlebars template for the email
    const templateSource = await fs.readFile(
      "src/templates/reset-password.hbs",
      "utf-8"
    );

    // Compile the template with Handlebars
    const compiledTemplate = handlebars.compile(templateSource);
    const html = compiledTemplate({ resetToken });

    // Send the email using Resend
    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev", // Sender email address
      to: user.email,
      subject: "Reset Your Password",
      html: html, // The HTML content of the email
    });

    // Handle any errors when sending the email
    if (sendError) {
      console.error("Resend error:", sendError);
      res.status(400).json({ message: "Failed to send email" });
      return;
    }

    // Respond with success message
    res.status(200).json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong while sending the reset link" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { password, confirmPassword, resetToken } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match." });
    return;
  }

  if (!resetToken) {
    res.status(400).json({ message: "No reset token found." });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing in the environment variables");
    }

    // Verify the reset token
    const decoded = jwt.verify(resetToken, jwtSecret) as { email: string };

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });

    res.clearCookie("resetToken"); // Clear the token after the reset

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired reset token." });
  }
}
