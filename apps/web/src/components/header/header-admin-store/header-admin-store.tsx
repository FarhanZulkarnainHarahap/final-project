"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FiMenu,
  FiX,
  FiBox,
  FiLayers,
  FiShoppingCart,
  FiUsers,
  FiHome,
} from "react-icons/fi";
import { MdOutlineInventory, MdDiscount } from "react-icons/md";
import Link from "next/link";
import SignOut from "@/components/login/logout";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  // avatarUrl?: string;
}

export default function MenuNavbarStoreAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [users, setUsers] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/user/current-user",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("API Response:", data);
        setUsers(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    getCurrentUser();
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
                  {users.firstName} {users.lastName}
                  {users.name}
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
          className={`flex flex-col bg-green-600 text-white shadow-lg transition-all duration-300 h-fit ease-in-out ${
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
            <div className="flex flex-col h-[90vh] justify-between">
              <nav className="p-4 space-y-2">
                <Link
                  href="/dashboard/admin-store"
                  className="flex items-center space-x-2 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <FiHome />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/dashboard/admin-store/product"
                  className="flex items-center space-x-2 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <FiBox />
                  <span>Product</span>
                </Link>
                <Link
                  href="/dashboard/admin-store/category"
                  className="flex items-center space-x-2 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <FiLayers />
                  <span>Category</span>
                </Link>
                <Link
                  href="/dashboard/admin-store/discount"
                  className="flex items-center space-x-2 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <MdDiscount />
                  <span>Discount</span>
                </Link>
                <Link
                  href="/dashboard/admin-store/inventory-management"
                  className="flex items-center space-x-2 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <MdOutlineInventory />
                  <span>Inventory</span>
                </Link>
                <Link
                  href="/store/orders"
                  className="flex items-center space-x-2 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <FiShoppingCart />
                  <span>Pesanan</span>
                </Link>
                <Link
                  href="/store/customers"
                  className="flex items-center space-x-2 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <FiUsers />
                  <span>Pelanggan</span>
                </Link>
              </nav>
              <div className="p-6 bg-green-900 w-full">
                <SignOut />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 ease-in-out p-4 h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
