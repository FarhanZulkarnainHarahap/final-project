"use client";

import { useEffect, useState } from "react";
import { FiBox } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  price: number;
  // Tambah field lain sesuai schema
}

export default function DashboardProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/products`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("API Response:", data);

        let items: Product[] = [];

        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(data.data)) {
          items = data.data;
        } else {
          console.error("Format data API tidak sesuai");
        }

        setProducts(items);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <div className="w-fit p-6 rounded  flex items-center space-x-4 border border-gray-300 shadow-xl/20 hover:shadow-xl transition-shadow duration-300 cursor-pointer hover:bg-gray-50">
        <div className="bg-green-100 text-green-600 rounded-full p-3">
          <FiBox className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Produk yang Tersedia</h1>
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : (
            <p className="text-3xl font-bold text-green-600">
              {products.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
