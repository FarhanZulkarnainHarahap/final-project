"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MenuNavbarUser from "@/components/header/header-user/header";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePreview: { imageUrl: string }[];
}

export default function ProductStorePage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/categories");
        const json = await res.json();
        setCategories(json.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", "8");
        if (category) params.set("category", category);

        const res = await fetch(
          `http://localhost:8000/api/v1/store-products/${storeId}/products?${params}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        setProducts(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch store products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreProducts();
    }
  }, [storeId, page, category]);

  if (loading) {
    return (
      <p className="text-center py-12">Loading products from this store...</p>
    );
  }

  return (
    <MenuNavbarUser>
      <section className="max-w-[1200px] mx-auto py-12 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <p className="text-gray-600">
            Showing {products.length} product{products.length !== 1 && "s"} in
            this store
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="category" className="text-sm">
              Filter by Category:
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1); // reset halaman
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-400">
              No products found in this store.
            </p>
          ) : (
            products.map((product) => (
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
                  src={product.imagePreview[0]?.imageUrl || "/placeholder.png"}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="mx-auto mb-4 object-cover"
                />

                {/* Stock */}
                <p
                  className={`text-sm mb-2 ${product.stock > 0 ? "text-green-600" : "text-red-400"}`}
                >
                  {product.stock > 0
                    ? `${product.stock} pcs available`
                    : "Out of Stock"}
                </p>

                {/* Name */}
                <p className="font-semibold mb-1">{product.name}</p>

                {/* Price */}
                <div className="mb-2">
                  {product.price < 100 && (
                    <span className="text-gray-400 line-through mr-2">
                      Rp{(product.price + 10).toLocaleString()}
                    </span>
                  )}
                  <span className="text-green-700 font-bold">
                    Rp{product.price.toLocaleString()}
                  </span>
                </div>

                {/* View Product Button */}
                <Link
                  href={`/dashboard/user/product/${product.id}`}
                  className="inline-block bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 transition"
                >
                  View Product
                </Link>
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </MenuNavbarUser>
  );
}
