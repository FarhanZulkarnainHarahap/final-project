"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";

interface User {
  name: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
}
export default function ProfileSection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/user/current-user",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setUser(data.data);
        console.log(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Failed to load user data.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 px-10 justify-center">
        <div className="grid grid-cols-2 items-center justify-center space-x-4 text-center">
          <Link
            href="/dashboard/user/profile"
            className="hover:text-green-900 bg-green-600 text-white px-4 py-2 rounded"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/user/profile/address"
            className="hover:text-green-900 bg-green-600 text-white px-4 py-2 rounded"
          >
            Address
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className="bg-gradient-to-tr from-teal-500 to-green-900 rounded-full p-4 shadow-md">
            <FaUser size={48} className="text-white" />
          </div>
          {/* Name */}
          <h2 className="text-2xl font-semibold text-center">
            {user.firstname} {user.lastname}
          </h2>
          {/* Username */}
          <p className="text-gray-500">@{user.username}</p>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="text-lg font-medium">
              {user.firstname} {user.lastname} {user.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-lg font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
