import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username cannot be more than 20 characters"),
});
export const setPasswordSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });
export const resetPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});
