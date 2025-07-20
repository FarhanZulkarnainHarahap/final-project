import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Profile } from "passport";
import prisma from "../../../config/prisma-client.js";

export async function loginSuccess(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.json({
    message: "Login with Google successful",
    user: req.user,
  });
}
export async function loginFailed(_req: Request, res: Response) {
  res.status(401).json({ message: "Login with Google failed" });
}
export async function loginGoogle(req: Request, res: Response) {
  try {
    const googleUser = req.user as Profile;
    if (!googleUser.emails?.[0]?.value) {
      res.status(400).json({ message: "Email not found in Google profile" });
      return;
    }
    const email = googleUser.emails?.[0].value;

    if (!email) {
      res.status(400).json({ message: "Email not found from Google profile." });
      return;
    }

    // Cari user di database
    let user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      const nameParts = googleUser.displayName?.split(" ") ?? [
        "Google",
        "User",
      ];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "Account";
      user = await prisma.user.create({
        data: {
          id: googleUser.id,
          email,
          firstName,
          lastName,
          // photo: googleUser.photos?.[0].value,
          provider: "google",
          // role default bisa diisi disini kalau mau
          role: "USER",
          isVerified: false, // Default false, bisa diubah nanti
        },
      });
    }

    const accesstoken = jwt.sign(
      {
        id: googleUser.id,
        email: googleUser.emails?.[0].value,
        name: googleUser.displayName,
        photo: googleUser.photos?.[0].value,
        provider: "google",
        role: user.role,
        isVerified: user.isVerified,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.cookie("accessToken", accesstoken, { httpOnly: true });
    res.redirect("http://localhost:3000");
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to Login", error });
  }
}
