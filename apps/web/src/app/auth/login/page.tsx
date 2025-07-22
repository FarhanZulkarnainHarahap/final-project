"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaTwitter } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Login gagal");

      const data = await res.json();

      // Optional: alert login sukses
      alert("Login success");

      setLoginData({ usernameOrEmail: "", password: "" });

      // Redirect berdasarkan role
      switch (data.role) {
        case "USER":
          router.push("/");
          break;
        case "STORE_ADMIN":
          router.push("/dashboard/admin-store");
          break;
        case "SUPER_ADMIN":
          router.push("/dashboard/admin");
          break;
        default:
          router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login gagal. Periksa kembali email/username dan password.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
        <h1 className="text-3xl font-bold text-green-900 text-center mb-6">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              placeholder="Enter your username or email"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
              value={loginData.usernameOrEmail}
              onChange={(e) =>
                setLoginData({ ...loginData, usernameOrEmail: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
            />
            <div className="text-right mt-1">
              <Link
                href="/auth/reset-password"
                className="text-sm text-green-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold py-2 rounded-md transition duration-300"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-green-800 hover:underline"
          >
            Register here
          </Link>
        </p>

        <div className="flex items-center my-6 gap-2">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500">or continue with</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href={`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/google`}
            className="bg-white p-2 rounded-full hover:shadow-md transition"
          >
            <FcGoogle size={24} />
          </Link>
          <button
            aria-label="Twitter login"
            className="bg-white p-2 rounded-full hover:shadow-md transition text-blue-500"
          >
            <FaTwitter size={24} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
