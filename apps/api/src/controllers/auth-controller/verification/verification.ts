import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import fs from "fs/promises";
import handlebars from "handlebars";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import { CustomJwtPayload } from "../../../types/express.js";

const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendVerificationEmail(req: Request, res: Response) {
  const userLogin = req.user as CustomJwtPayload;
  const userEmail = userLogin.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "Akun sudah diverifikasi." });
      return;
    }

    // Buat token baru jika belum ada
    if (!user.verificationToken) {
      const newToken = randomUUID();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: newToken,
        },
      });
      user.verificationToken = newToken;
    }

    // Compile template email
    const templateSource = await fs.readFile(
      "src/templates/verify-email.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const htmlContent = compiledTemplate({
      customerName: user.username || user.email,
      token: user.verificationToken,
      currentYear: new Date().getFullYear(),
    });

    // Kirim email dengan Resend
    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Verifikasi Email MarketSnap",
      html: htmlContent,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      res.status(500).json({ message: "Gagal mengirim email." });
      return;
    }

    res.status(200).json({ message: "Email verifikasi telah dikirim." });
  } catch (error) {
    console.error("Gagal mengirim email verifikasi:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
    return;
  }
}
/* ------------------------------------ - ----------------------------------- */
export async function confirmEmail(req: Request, res: Response) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Token tidak valid.");
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(404).send("Token tidak ditemukan.");
      return;
    }

    if (user.isVerified) {
      res.redirect(
        "http://localhost:3000/dashboard/user/profile?status=already-verified"
      );
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.redirect(
      "http://localhost:3000/dashboard/user/profile?status=already-verified"
    );
  } catch (error) {
    console.error("Gagal verifikasi email:", error);
    res.status(500).send("Terjadi kesalahan saat verifikasi email.");
  }
}
/* ------------------------------------ - ----------------------------------- */

export async function VerifySuccess(req: Request, res: Response) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Token tidak valid.");
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(404).send("Token tidak ditemukan.");
      return;
    }

    if (user.isVerified) {
      // Baca dan compile template verify-complated.hbs
      const templateSource = await fs.readFile(
        "src/templates/verify-complated.hbs",
        "utf-8"
      );
      const compiledTemplate = handlebars.compile(templateSource);
      const htmlTemplate = compiledTemplate({
        currentYear: new Date().getFullYear(),
      });

      // Kirim email menggunakan hasil template
      const { error: sendError } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verifikasi Email Berhasil",
        html: htmlTemplate,
      });

      if (sendError) {
        console.error("Resend error:", sendError);
        res.status(400).json({ message: "Gagal mengirim email." });
        return;
      }

      // Tampilkan halaman yang sama ke browser
      res.status(200).send(htmlTemplate);
      return;
    }

    res
      .status(400)
      .send("Akun belum diverifikasi. Silakan verifikasi terlebih dahulu.");
  } catch (error) {
    console.error("Gagal menampilkan halaman verifikasi:", error);
    res.status(500).send("Terjadi kesalahan saat menampilkan halaman.");
  }
}
