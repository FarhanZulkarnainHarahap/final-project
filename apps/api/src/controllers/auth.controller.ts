import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma-client";
import { ZodError } from "zod";
import { Resend } from "resend";
import fs from "fs/promises";
import handlebars from "handlebars";
import { registerSchema } from "../validations/auth-validation.js";

const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------------------------------------------------------------- */
/*                         Login With Web Market Snap                         */
/* -------------------------------------------------------------------------- */
export async function register(req: Request, res: Response) {
  try {
    const { email, firstName, lastName, username, password, phoneNumber } =
      registerSchema.parse(req.body);

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        username,
        password: hashedPassword,
        phoneNumber,
        verificationToken: "",
      },
    });

    // Create verification token
    const verificationToken = jwt.sign(
      { email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" } // Token valid for 1 day
    );

    // Update the user with verification token
    await prisma.user.update({
      where: { id: newUser.id },
      data: { verificationToken },
    });

    // Read the email template with proper encoding
    const templateSource = await fs.readFile(
      "src/templates/registration-welcoming-template.hbs",
      "utf-8" // encoding as the third parameter
    );

    // Compile the template
    const compiledTemplate = handlebars.compile(templateSource.toString());
    const htmlTemplate = compiledTemplate({
      customerName: firstName,
      token: verificationToken,
      currentYear: new Date().getFullYear(),
    });

    const { error: resendError } = await resend.emails.send({
      from: "MarketSnap <cs@resend.dev>",
      to: [email],
      subject: "Please verify your email",
      html: htmlTemplate,
    });
    if (resendError) {
      res
        .status(400)
        .json({ message: "Registration success but failed to send email" });
      return;
    }

    res.status(201).json({
      message: `registration Success Please Cek You're Mail`,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      res.status(500).json({
        message: "From ZOD: Failed to register new user",
        error: error.flatten().fieldErrors,
      });
      return;
    }

    res.status(500).json({ message: "Failed to register new user", error });
  }
}
export async function login(req: Request, res: Response) {
  try {
    const { username, password, email } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username: username }, { email: email }] },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!existingUser.password) {
      res.status(400).json({ message: "User has no password set" });
      return;
    }
    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isValidPassword) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const JWTToken = jwt.sign(
      {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        fullName: existingUser.firstName + existingUser.lastName,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET as string
    );

    res
      .cookie("accessToken", JWTToken, { httpOnly: true })
      .status(200)
      .json({ message: "Login success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
}
export async function logout(req: Request, res: Response) {
  try {
    res
      .clearCookie("accessToken")
      .status(200)
      .json({ message: "Logout success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to logout" });
    res.redirect("/");
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ message: "Verification token is required" });
    return;
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string };

    // Temukan user berdasarkan email yang terverifikasi
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user || user.isVerified) {
      res.status(400).json({ message: "Invalid or already verified token" });
      return;
    }

    // Update status isVerified menjadi true
    await prisma.user.update({
      where: { email: decoded.email },
      data: { isVerified: true, verificationToken: null }, // Clear token setelah verifikasi
    });
    const templateSource = await fs.readFile(
      "src/templates/verification-complated.hbs",
      "utf-8" // encoding as the third parameter
    );
    const compiledTemplate = handlebars.compile(templateSource.toString());
    const htmlTemplate = compiledTemplate({
      currentYear: new Date().getFullYear(),
    });
    // Return a simple HTML page with a redirect after verification

    res.send(`${htmlTemplate}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify email" });
  }
}
export async function VerifySuccess(req: Request, res: Response) {
  const token = req.query.token;

  if (!token) {
    res.status(400).json({ message: "Verification token is required" });
    return;
  }

  try {
    // Verifikasi token dengan jwt.verify() langsung
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string };

    // Jika token valid, redirect ke halaman yang diinginkan
    res.redirect("http://localhost:3000");
  } catch (error) {
    // Jika token tidak valid, tampilkan pesan error
    console.error(error);
    res.status(400).send("Invalid token");
  }
}
/* -------------------------------------------------------------------------- */
/*                                Login Google                                */
/* -------------------------------------------------------------------------- */
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
