"use client";

import { useState, FormEvent } from "react";

interface RegisterResponse {
  message: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username }),
        }
      );

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pendaftaran gagal.");
      }

      setMessage(data.message);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-600 flex items-center justify-center px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg animate-fade-in"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-green-900">
          Register to MarketSnap
        </h2>

        {message && (
          <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm text-center border border-yellow-300">
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-900"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition duration-300"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
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
    </div>
  );
}
