"use client";

import { useState, useEffect } from "react";

export default function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Extract resetToken from the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    console.log("Token from URL:", token); // Debug: Log token to see if it is correctly retrieved.
    setResetToken(token); // Set resetToken state
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Ensure password and confirmation match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Ensure resetToken is available
    if (!resetToken) {
      setError("Invalid or expired reset link.");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/set-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, confirmPassword, resetToken }), // Send resetToken to the backend
          credentials: "include", // Include cookies for token verification
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || "Password successfully reset.");
        // Redirect to the login page after a successful reset
        setTimeout(() => {
          window.location.href = "/auth/login"; // Redirect to login page
        }, 1000); // Wait for 1 second before redirecting
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to contact the server.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-600 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
        <h2 className="text-3xl font-semibold text-green-900 text-center mb-6">
          Set New Password
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-center mb-4">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-900 text-white font-semibold rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300"
          >
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
}
