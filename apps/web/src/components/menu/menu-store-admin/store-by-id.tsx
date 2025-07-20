"use client";

import { useEffect, useState } from "react";
import AddProductPage from "./add-product";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  products?: Product[];
}

export default function StoreDetailPage({
  params,
}: {
  params: { storeId: string };
}) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStoreById() {
      try {
        const { storeId } = await params;
        const res = await fetch(
          `http://localhost:8000/api/v1/stores/${storeId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setStore(data.data);
      } catch (err) {
        console.error("Error fetching store:", err);
      } finally {
        setLoading(false);
      }
    }
    getStoreById();
  });

  if (loading) return <p className="p-4">Loading...</p>;

  if (!store) return <p className="p-4 text-red-500">Store not found.</p>;

  return (
    <section className="max-w-2xl mx-auto p-6 border border-gray-300 shadow-xl/20 hover:shadow-xl transition-shadow duration-300 cursor-pointer hover:bg-gray-50">
      <h1 className="text-2xl font-bold mb-2">{store.name}</h1>

      <p className="text-gray-700 mb-4">
        {store.address}, {store.city},{store.province},{store.postalCode}
      </p>

      <AddProductPage params={{ storeId: store.id }} />

      <h2 className="text-xl font-semibold mb-2">Products</h2>
      {store.products && store.products.length > 0 ? (
        <ul className="space-y-2">
          {store.products.map((product) => (
            <li
              key={product.id}
              className="border border-gray-300 rounded p-3 flex justify-between"
            >
              <span>{product.name}</span>
              <span>${product.price}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No products found.</p>
      )}
    </section>
  );
}
