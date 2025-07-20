"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  city: string;
  stock: number;
  address: string;
  imageUrl: string;
}

export default function StoreHomePage() {
  const [stores, setstores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchstores = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/stores", {
          cache: "no-store",
        });
        const json = await res.json();
        setstores(json.data || []);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchstores();
  }, []);

  if (loading) {
    return <p className="text-center py-12">Loading stores...</p>;
  }

  return (
    <section className="max-w-[1200px] mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-green-700 mb-3">
          Discover Our Stores
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find the perfect place to shop today.
        </p>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        {/* <p className="text-gray-600">
          Showing 1–{stores.length} of {stores.length} results
        </p> */}
        {/* <select className="border border-gray-300 rounded px-3 py-2">
          <option>Default sorting</option>
          <option>Sort by price</option>
          <option>Sort by popularity</option>
        </select> */}
      </div>

      {/* stores grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 text-center"
          >
            {/* Image */}
            <Image
              src={store.imageUrl}
              alt={store.name}
              width={300}
              height={300}
              className="mx-auto mb-4 rounded-xl object-cover aspect-square w-full max-w-[250px]"
            />

            {/* Name */}
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {store.name}
            </h3>

            {/* Address */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm">{store.address}</p>
              <span className="text-green-700 font-semibold">{store.city}</span>
            </div>

            {/* View store Button */}
            <Link
              href={`/dashboard/user/product-store/${store.id}`}
              className="inline-block bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition font-medium"
            >
              View Store
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
