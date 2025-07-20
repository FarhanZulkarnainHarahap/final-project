"use client";
import Link from "next/link";

export default function Submenu() {
  return (
    <div className="bg-white shadow w-full">
      <div className="max-w-[1400px] mx-auto flex items-center justify-center px-45 py-2 text-green-900">
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
          <Link href="/products" className="hover:text-green-600">
            Product
          </Link>
        </nav>
      </div>
    </div>
  );
}
