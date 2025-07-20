import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";

import handlebars from "handlebars";
import fs from "fs/promises";
import { Resend } from "resend";

import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!foundUser) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    if (foundUser.isVerified) {
      res.status(200).json({ message: "Akun sudah diverifikasi." });
      return;
    }

    const token = jwt.sign(
      { email: foundUser.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
      },
    });

    const templateSource = await fs.readFile(
      "src/templates/verify-email.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const htmlTemplate = compiledTemplate({
      customerName: foundUser.username,
      token,
      currentYear: new Date().getFullYear(),
    });

    const { error: resendError } = await resend.emails.send({
      from: "MarketSnap <cs@resend.dev>",
      to: [foundUser.email],
      subject: "Please Verify Your Email Address",
      html: htmlTemplate,
    });

    if (resendError) {
      res.status(400).json({
        message: "Email gagal dikirim. Silakan coba beberapa saat lagi.",
      });
      return;
    }

    res.status(200).json({
      message: "Link verifikasi telah dikirim ke email Anda.",
    });
  } catch (error) {
    console.error("Send Verification Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
}

export async function confirmVerificationToken(req: Request, res: Response) {
  const { token } = req.query;

  try {
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Token tidak valid." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    if (user.isVerified) {
      res.status(200).json({ message: "Akun Anda sudah diverifikasi." });
      return;
    }

    await prisma.user.update({
      where: { email: decoded.email },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.status(200).json({ message: "Email berhasil diverifikasi." });
  } catch (error) {
    console.error("Verifikasi gagal:", error);
    res
      .status(400)
      .json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
}
