"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  totalStock: number;
  stockPerStore: {
    storeId: string;
    storeName: string;
    stock: number;
  }[];

  stock: number;
  imagePreview: [{ imageUrl: string }];
  imageContent: [{ imageUrl: string }];
}
export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/products", {
          cache: "no-store",
        });
        const json = await res.json();
        setProducts(json.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p className="text-center py-12">Loading products...</p>;
  }

  return (
    <section className="max-w-[1200px] mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product</h1>
        <p className="text-gray-500">Home / Product</p>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        {/* <p className="text-gray-600">
          Showing 1–{products.length} of {products.length} results
        </p> */}
        {/* <select className="border border-gray-300 rounded px-3 py-2">
          <option>Default sorting</option>
          <option>Sort by price</option>
          <option>Sort by popularity</option>
        </select> */}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-lg shadow text-center relative"
          >
            {/* Sale badge */}
            {product.price < 100 && (
              <span className="absolute top-3 left-3 bg-green-700 text-white text-xs px-2 py-1 rounded">
                Sale
              </span>
            )}

            {/* Image */}
            <Image
              src={product.imagePreview?.[0]?.imageUrl ?? "/placeholder.jpg"}
              alt={product.name}
              width={150}
              height={150}
              className="mx-auto mb-4"
            />

            <p className="text-gray-400 text-sm">
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            {/* Name */}
            <p className="font-semibold mb-1">{product.name}</p>

            {/* Price */}
            <div className="mb-2">
              {product.price < 100 && (
                <span className="text-gray-400 line-through mr-2">
                  ${product.price + 10}.00
                </span>
              )}
              <span className="text-green-700 font-bold">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* View Product Button */}
            <Link
              href={`/dashboard/user/product/${product.id}`}
              className="inline-block bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 transition"
            >
              View Product
            </Link>

            {/* Total stock */}
            <p className="text-gray-400 text-sm mb-2">
              {product.totalStock > 0
                ? `${product.totalStock} pcs available`
                : "Out of Stock"}
            </p>

            {/* Stock per store */}
            {product.totalStock > 0 && (
              <div className="text-xs text-gray-500 text-left mt-2">
                <p className="font-semibold mb-1">Available in stores:</p>
                <ul className="list-disc list-inside">
                  {product.stockPerStore
                    .filter((store) => store.stock > 0)
                    .map((store) => (
                      <li key={store.storeId}>
                        {store.storeName}: {store.stock} pcs
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
