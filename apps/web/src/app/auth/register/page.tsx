"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter untuk redirect

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter(); // Hook untuk routing

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error/success message
    setError(null);
    setSuccessMessage(null);

    const formData = {
      email,
      firstName,
      lastName,
      username,
      password,
      phoneNumber,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Registration failed");
        return;
      }

      const data = await response.json();
      setSuccessMessage(
        data.message ||
          "Registration successful! Please check your email to verify."
      );

      // Redirect to home page after successful registration
      setTimeout(() => {
        router.push("/"); // Redirect to localhost:3000 (Home page)
      }, 2000); // Give a 2-second delay before redirect
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white py-10">
      <div className="w-full max-w-md p-8 bg-[#191717] shadow-lg rounded-lg border">
        <h2 className="text-2xl font-semibold text-center text-green-500 mb-6">
          Register
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded">{error}</div>
        )}
        {successMessage && (
          <div className="bg-green-500 text-white p-2 mb-4 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-green-500"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full mt-2 p-2 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-green-500"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full mt-2 p-2 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-green-500"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-2 p-2 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-green-500"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-2 p-2 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-green-500"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 p-2 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-green-500"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full mt-2 p-2 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-customGreen bg-green-700 text-white rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-customGreen"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
