import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import prisma from "../../../config/prisma-client.js";
import { ZodError } from "zod";
import { Resend } from "resend";
import fs from "fs/promises";
import handlebars from "handlebars";
import { registerSchema } from "../../../validations/auth-validation.js";

const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------------------------------------------------------------- */
/*                       Register With Web Market Snap                        */
/* -------------------------------------------------------------------------- */
export async function register(req: Request, res: Response) {
  try {
    const { email, username } = registerSchema.parse(req.body);

    // Cek apakah email atau username sudah digunakan
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email atau Username sudah digunakan." });
      return;
    }

    // Buat akun baru tanpa password
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        isVerified: false,
      },
    });

    // Generate token untuk buat password
    const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    // Simpan token untuk nanti dipakai saat set-password
    await prisma.user.update({
      where: { id: newUser.id },
      data: { verificationToken: token },
    });

    // Kirim email untuk buat password
    const templateSource = await fs.readFile(
      "src/templates/registration-welcoming-template.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const htmlTemplate = compiledTemplate({
      customerName: username,
      token,
      currentYear: new Date().getFullYear(),
    });

    const { error: resendError } = await resend.emails.send({
      from: "MarketSnap <cs@resend.dev>",
      to: [email],
      subject: "Complete Your MarketSnap Registration",
      html: htmlTemplate,
    });

    if (resendError) {
      res.status(400).json({
        message: "Akun berhasil dibuat, tapi gagal mengirim email.",
      });
      return;
    }

    res.status(201).json({
      message:
        "Akun berhasil dibuat. Silakan cek email untuk membuat password.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Input tidak valid.",
        error: error.flatten().fieldErrors,
      });
      return;
    }

    console.error("Register error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat registrasi.",
      error,
    });
  }
}
