import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { CustomJwtPayload } from "../types/express.js";
import { GoogleProfileWithToken } from "../types/GoogleProfileWithToken .js";
import axios from "axios";
import prisma from "./prisma-client.js";

dotenv.config(); // ⛳ WAJIB agar .env bisa digunakan

// console.log("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID);
// console.log("callbackURL", "http://localhost:8000/api/v1/auth/google/callback");
const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${baseUrl}/api/v1/auth/google/callback`,
    },
    async (accessToken, _refreshToken, _profile, done) => {
      try {
        // 1. Ambil info user dari Google
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // 2. Cek apakah user sudah ada di database
        let user = await prisma.user.findUnique({
          where: { email: data.email },
        });

        // 3. Kalau belum ada, buat user baru
        if (!user) {
          user = await prisma.user.create({
            data: {
              id: data.sub,
              email: data.email,
              firstName: data.given_name || "",
              lastName: data.family_name || "",
              username: data.name.replace(/\s+/g, "").toLowerCase(), // default username// karena login pakai Google
              role: "USER",
              provider: data.provider,
            },
          });
        }

        // 4. Bentuk payload untuk session
        const profileWithToken: GoogleProfileWithToken = {
          id: user.id,
          displayName: user.firstName + " " + user.lastName,
          emails: [{ value: user.email }],
          photos: [{ value: data.picture }],
          provider: "google",
          accessToken,
          name: {
            givenName: user.firstName,
            familyName: user.lastName,
          },
          _json: data,
          _raw: JSON.stringify(data),
        };

        return done(null, profileWithToken);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  const safeUser = user as GoogleProfileWithToken;

  done(null, {
    id: safeUser.id,
    name: safeUser.displayName,
    email: safeUser.emails?.[0].value,
    photo: safeUser.photos?.[0].value,
    accessToken: safeUser.accessToken,
  });
});

passport.deserializeUser((user: unknown, done) => {
  done(null, user as CustomJwtPayload); // 👈 assert langsung
});
