import "dotenv/config.js";
import express, { Request, Response, Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import authRouter from "./routers/auth-router.js";
import userRouter from "./routers/user-router.js";
import addressRouter from "./routers/address-router.js";
import "./config/passport.js"; // konfigurasi strategi Passport (GoogleStrategy)

const app: Application = express();
const PORT: number = 8000;

// CORS config
app.use(
  cors({
    origin: "http://localhost:3000", // ganti dengan domain frontend kamu
    credentials: true,
  })
);

// Parser
app.use(express.json());
app.use(cookieParser());

// Session (wajib sebelum passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia_super_aman",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // true jika HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use("/api/v1/auth", authRouter);

app.use("/api/addresses", addressRouter);
// 🛡️ Endpoint dilindungi, bisa pakai verifyToken (JWT) atau verifyGoogleToken (session)
app.use("/api/v1/user", userRouter);

// Health check
app.get("/api/v1/health", async (req: Request, res: Response) => {
  res.status(200).json({ message: "API running" });
});

app.listen(PORT, () => {
  console.info(`🚀 Server is running on http://localhost:${PORT}`);
});
