"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaTwitter } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to login");
      }

      alert("Login success");

      setLoginData({ username: "", password: "" });

      router.push("/");
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="form-container bg-gradient-to-r from-green-900 from-10% via-green-800 via-30% to-green-600 to-90% p-8 rounded-xl shadow-lg w-full max-w-sm text-white">
        <p className="title text-2xl font-bold mb-6 text-center">Login</p>
        <form className="form grid gap-4" onSubmit={handleSubmit}>
          <div className="input-group grid">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              className="mt-1 p-2 rounded bg-transparent border border-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
            />
          </div>

          <div className="input-group grid">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="mt-1 p-2 rounded bg-transparent border border-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
            <div className="forgot text-right text-sm mt-1">
              <a
                href="/auth/reset-password"
                className="text-gray-400 hover:text-white underline"
              >
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="sign bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition"
          >
            Sign in
          </button>
        </form>
        <div className="grid grid-cols-[1fr_auto] pt-3">
          <p>saya tidak memiliki akun</p>
          <Link
            href="/auth/register"
            className="text-gray-400 hover:text-white text-right underline"
          >
            Daftar Sekarang
          </Link>
        </div>
        <div className="social-message flex items-center gap-2 my-6">
          <div className="line flex-1 h-px bg-gray-500" />
          <p className="message text-sm text-gray-400">
            Login with social accounts
          </p>
          <div className="line flex-1 h-px bg-gray-500" />
        </div>

        <div className="social-icons flex justify-center gap-4">
          <button
            aria-label="Log in with Google"
            className="icon bg-white p-2 rounded-full hover:shadow-lg"
          >
            <Link href="http://localhost:8000/api/v1/auth/google">
              <FcGoogle size={24} />
            </Link>
          </button>
          <button
            aria-label="Log in with Twitter"
            className="icon bg-white p-2 rounded-full hover:shadow-lg text-blue-500"
          >
            <FaTwitter size={24} />
          </button>
        </div>
      </div>
    </main>
  );
}
