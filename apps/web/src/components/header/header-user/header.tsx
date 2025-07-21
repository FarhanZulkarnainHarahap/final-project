"use client";

import { useEffect, useState } from "react";
import Submenu from "./sub-menu";
import Image from "next/image";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import LoginPageSection from "@/components/login/login";
import Link from "next/link";
import Footer from "@/components/footer/footer";

export default function MenuNavbarUser({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showGreenHeader, setShowGreenHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (Math.abs(diff) < 5) return; // hindari perbedaan kecil

      // jika scroll timeout sebelumnya masih aktif, batalkan
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // tunggu sedikit sebelum update UI agar lebih stabil
      const timeout = setTimeout(() => {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowGreenHeader(false); // Scroll down
        } else if (currentScrollY < lastScrollY) {
          setShowGreenHeader(true); // Scroll up
        }
        setLastScrollY(currentScrollY);
      }, 80); // tunggu 80ms

      setScrollTimeout(timeout);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, scrollTimeout]);
  return (
    <section>
      {/* Green Header */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          showGreenHeader ? "translate-y-0" : "-translate-y-24"
        }`}
      >
        {/* HEADER HIJAU */}
        <div className="bg-green-900 text-white w-full">
          <div className="bg-green-800 text-sm text-center py-1">
            Welcome to Market Snap
          </div>
          <div className="flex items-center justify-between gap-6 px-4 py-4 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-2 shrink-0">
              <Image src="/market-snap.png" alt="Logo" width={40} height={40} />
              <span className="font-bold text-xl">MARKET SNAP</span>
            </div>
            <div className="flex-1">
              {/* <div className="flex rounded overflow-hidden bg-white">
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 px-4 py-2 text-black outline-none"
                />
                <button className="bg-black px-4">
                  <FiSearch className="text-white" />
                </button>
              </div> */}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <FiHeart size={20} />
              <LoginPageSection />
              <Link href="/cart" className="hover:opacity-80 shrink-0">
                <FiShoppingBag size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* SUBMENU PUTIH */}
        <div className="bg-white shadow w-full">
          <Submenu />
        </div>
      </div>

      <main className="pt-35">{children}</main>
      <Footer />
    </section>
  );
}
