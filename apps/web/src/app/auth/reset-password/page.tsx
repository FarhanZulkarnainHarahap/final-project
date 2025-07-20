"use client";

import React, { useState } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "A reset link has been sent to your email.");
      } else {
        setError(data.message || "Failed to send reset link.");
      }
    } catch (error) {
      setError("An error occurred while sending the reset link.");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-green-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-white text-2xl font-semibold mb-4">
          Reset Your Password
        </h2>
        {message && <div className="text-white mb-4">{message}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-white block mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded-md text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
