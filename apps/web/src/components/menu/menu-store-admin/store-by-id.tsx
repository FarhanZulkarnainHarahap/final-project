"use client";

import { useEffect, useState } from "react";
import AddProductPage from "./add-product";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  weight: number;
  stock: number;
}
interface StoreProduct {
  productId: string;
  storeId: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  Product: Product;
}
interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  StoreProduct: StoreProduct[];
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
        const { storeId } = params;
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
  }, [params]);

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
      <ul>
        {store.StoreProduct.map((storeProduct) => (
          <li key={storeProduct.productId} className="mb-4">
            <h3 className="text-lg font-medium">{storeProduct.Product.name}</h3>
            <p className="text-gray-700">{storeProduct.Product.description}</p>
            <p>Price: ${storeProduct.Product.price}</p>
            <p>Weight: {storeProduct.Product.weight} kg</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
