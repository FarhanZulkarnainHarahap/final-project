"use client";
import { useState } from "react";
import Submenu from "./sub-menu";
import Image from "next/image";
import { FiSearch, FiHeart, FiShoppingBag } from "react-icons/fi";
import LoginPageSection from "@/components/login/login";
import ShoppingBag from "@/components/menu/menu-user/shoppingbag";
import Footer from "@/components/footer/footer";

export default function MenuNavbarUser({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <section>
      <div className="w-full bg-green-900 text-white">
        <div className="bg-green-800 text-sm text-center py-1">
          Welcome to Market Snap
        </div>
        {/* Main navbar */}
        <div className="flex items-center justify-between gap-6 px-45 py-4 max-w-[1400px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Image src="/market-snap.png" alt="Logo" width={40} height={40} />
            <span className="font-bold text-xl">MARKET SNAP</span>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="flex rounded overflow-hidden bg-white">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 px-4 py-2 text-black outline-none"
              />
              <button className="bg-black px-4">
                <FiSearch className="text-white" />
              </button>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 shrink-0">
            <FiHeart size={20} />
            <LoginPageSection />
            <button onClick={() => setIsCartOpen(true)}>
              <FiShoppingBag size={20} />
            </button>
          </div>
        </div>
      </div>
      {/* Submenu */}
      <div className="bg-white shadow">
        <ShoppingBag isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        {/* Submenu content */}
        <Submenu />
      </div>

      <main className="h-fit">{children}</main>
      <Footer />
    </section>
  );
}
