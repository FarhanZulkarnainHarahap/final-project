"use client";
import { FiMenu } from "react-icons/fi";
import Link from "next/link";

export default function Submenu() {
  return (
    <div className="bg-white shadow w-full">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-45 py-2 text-green-900">
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
          <FiMenu /> All Categories
        </button>
        <nav className="flex gap-6">
          <Link href="/" className="hover:text-green-600">
            Home
          </Link>
          <Link
            href="/dashboard/user/best-deals"
            className="hover:text-green-600"
          >
            Best Deals
          </Link>
          <Link href="/dashboard/user/about" className="hover:text-green-600">
            About
          </Link>
          <Link
            href="/dashboard/user/contact-us"
            className="hover:text-green-600"
          >
            Contact Us
          </Link>
          <Link href="/dashboard/user/shop" className="hover:text-green-600">
            Shop
          </Link>
          <Link href="/dashboard/user/product" className="hover:text-green-600">
            Product
          </Link>
        </nav>
        <div className="text-sm">📞 Call To +6281958169283</div>
      </div>
    </div>
  );
}
