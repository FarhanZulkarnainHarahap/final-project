"use client";

import React from "react";
import { useEffect, useState } from "react";
import { FiUsers, FiUser, FiShield, FiSettings } from "react-icons/fi";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function RegisterUser() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/user`
        );
        const data = await res.json();
        console.log("API Response:", data);

        let users: User[] = [];

        if (Array.isArray(data)) {
          users = data;
        } else if (Array.isArray(data.data)) {
          users = data.data;
        } else {
          console.error("Format data API tidak sesuai");
        }

        setUserCount(users.length);

        const counts: Record<string, number> = {};
        users.forEach((user) => {
          counts[user.role] = (counts[user.role] || 0) + 1;
        });
        setRoleCounts(counts);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    fetchUsers();
  }, []);

  // Mapping role to icon
  const iconMap: Record<string, React.ReactNode> = {
    admin: <FiShield className="w-5 h-5" />,
    user: <FiUser className="w-5 h-5" />,
    moderator: <FiSettings className="w-5 h-5" />,
  };

  // Function to format role
  const formatRole = (role: string) =>
    role
      .replace(/_/g, " ") // ganti _ dengan spasi
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize

  return (
    <div className="bg-white p-6 rounded shadow border border-gray-200">
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-green-100 text-green-600 rounded-full p-3">
          <FiUsers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Total User Terdaftar</h1>
          {userCount === null ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <p className="text-3xl font-bold text-green-600">{userCount}</p>
          )}
        </div>
      </div>

      {userCount !== null && (
        <div className="mt-4 grid grid-cols-1 gap-2">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div
              key={role}
              className="flex items-center space-x-2 text-gray-700"
            >
              <div className="bg-green-100 text-green-600 rounded-full p-2">
                {iconMap[role] || <FiUsers className="w-5 h-5" />}
              </div>
              <span className="text-sm">
                {formatRole(role)}: <span className="font-medium">{count}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
