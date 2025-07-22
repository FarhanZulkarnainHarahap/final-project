"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import SignOut from "@/components/login/logout";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  role: string;
  // avatarUrl?: string; // opsional kalau punya URL foto
}

export default function MenuNavbarAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [users, setUsers] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function getAllUser() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/user/current-user`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("API Response:", data);
        setUsers(data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    getAllUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between bg-green-600 text-white px-4 py-3 shadow z-20 w-full">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-2xl p-2 rounded hover:bg-green-700"
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="text-sm">
          {users ? (
            <div>
              <span>
                Welcome,{" "}
                <strong>
                  {users.name}
                  {users.username}
                </strong>
              </span>
              <div className="text-xs text-green-200">
                Role: <span className="font-semibold">{users.role}</span>
              </div>
            </div>
          ) : (
            <span>Loading user...</span>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`flex flex-col bg-green-600 text-white shadow-lg transition-all duration-300  h-fit ease-in-out  ${
            sidebarOpen ? "w-64" : "w-0"
          } overflow-hidden`}
        >
          {/* Profile */}
          <div className="p-4 border-b border-green-700 flex items-center space-x-3 bg-green-700">
            <div className="relative w-10 h-10">
              <Image
                src="/vercel.svg"
                alt="Profile"
                fill
                className="rounded-full border-2 border-white object-cover"
              />
            </div>
            <div>
              {users ? (
                <>
                  <div className="font-semibold">
                    {users.firstName} {users.lastName}
                    {users.name}
                  </div>
                  <div className="text-xs text-green-300 flex items-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full mr-1"></span>
                    Online
                  </div>
                </>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="flex flex-col h-[81vh] justify-between">
            <nav className="p-4 space-y-2">
              <Link
                href="/dashboard/admin"
                className="block w-full text-left hover:bg-green-700 px-2 py-1 rounded"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/admin/user"
                className="block w-full text-left hover:bg-green-700 px-2 py-1 rounded"
              >
                User
              </Link>
              <Link
                href="/dashboard/admin/store"
                className="block w-full text-left hover:bg-green-700 px-2 py-1 rounded"
              >
                Store
              </Link>
              <Link
                href="/dashboard/admin/product"
                className="block w-full text-left hover:bg-green-700 px-2 py-1 rounded"
              >
                Product
              </Link>
              <Link
                href="/dashboard/admin/category"
                className="block w-full text-left hover:bg-green-700 px-2 py-1 rounded"
              >
                Category
              </Link>
              <Link
                href="/dashboard/admin/user-store"
                className="block w-full text-left hover:bg-green-700 px-2 py-1 rounded"
              >
                Store Admin
              </Link>
              <Link
                href="/dashboard/admin/inventory-history"
                className="block w-full text-left hover:bg-green-700 px-2 py-1 rounded"
              >
                Inventory
              </Link>
            </nav>
            <div className="p-6 bg-green-900 w-full">
              <div>
                <SignOut />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 ease-in-out p-4 h-fit">
          {children}
        </main>
      </div>
    </div>
  );
}
