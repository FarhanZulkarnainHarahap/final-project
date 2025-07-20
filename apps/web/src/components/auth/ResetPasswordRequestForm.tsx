"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaTwitter } from "react-icons/fa";

export default function ResetPasswordRequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Reset link has been sent.");
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to contact the server.");
    }
  };

  return (
    <main>
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
        <h1 className="text-3xl font-bold text-green-900 text-center mb-6">
          Reset Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {message && (
            <p className="text-green-500 text-center mb-4">{message}</p>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold py-2 rounded-md transition duration-300"
          >
            Send Reset Link
          </button>
        </form>

        <div className="flex items-center my-6 gap-2">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500">or continue with</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div className="flex justify-center gap-4">
          <a
            href="http://localhost:8000/api/v1/auth/google"
            className="bg-white p-2 rounded-full hover:shadow-md transition"
          >
            <FcGoogle size={24} />
          </a>
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
