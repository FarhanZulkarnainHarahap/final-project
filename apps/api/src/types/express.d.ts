import { JwtPayload } from "jsonwebtoken";
import { Profile } from "passport";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  username: string;
  provider: string;
  isVerified: Boolean;
}

export interface GoogleJwtPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  photo?: string;
  provider: "google";
  role: "USER" | "STORE_ADMIN" | "SUPER_ADMIN" | string;
  isVerified: boolean;
}
declare global {
  namespace Express {
    interface Request {
      /**
       * Akan terisi user dari JWT atau dari Passport (Google)
       * Kamu bisa pakai union untuk menampung keduanya
       */
      user?: CustomJwtPayload | GoogleJwtPayload;

      /**
       * Tambahkan logout() agar tidak error saat pakai Passport
       */
      logout(callback: (err: Error | null) => void): void;
    }
  }
}
