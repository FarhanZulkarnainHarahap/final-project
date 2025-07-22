"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  ProductCategory: { Category: { name: string } }[];
  imagePreview: { imageUrl: string }[];
  stock: number;
  storeName: string | null;
}

export default function StoreAdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get user store info
  useEffect(() => {
    async function fetchUserStore() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/profile`,
          {
            withCredentials: true,
          }
        );
        if (res.data.user?.Store && res.data.user.Store.length > 0) {
          setUserStore(res.data.user.Store[0]);
        } else {
          alert(
            "You are not assigned to any store. Please contact administrator."
          );
        }
      } catch (error) {
        console.error("Error fetching user store:", error);
        alert("Failed to load user profile. Please check if you're logged in.");
      }
    }
    fetchUserStore();
  }, []);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/categories`,
          {
            withCredentials: true,
          }
        );
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      if (!userStore?.id) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/products/by-store`,
          {
            params: {
              storeId: userStore.id,
              page: currentPage,
              limit: 5,
              search,
              category: selectedCategory,
              sortBy,
              sortOrder,
            },
            withCredentials: true,
          }
        );
        setProducts(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [userStore?.id, currentPage, search, selectedCategory, sortBy, sortOrder]);

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        bgClass: "bg-red-100",
        textClass: "text-red-700",
        dotClass: "bg-red-500",
      };
    if (stock < 10)
      return {
        bgClass: "bg-orange-100",
        textClass: "text-orange-700",
        dotClass: "bg-orange-500",
      };
    return {
      bgClass: "bg-green-100",
      textClass: "text-green-700",
      dotClass: "bg-green-500",
    };
  };

  const getSortOrderOptions = () => {
    const options = {
      name: [
        { value: "asc", label: "🔤 A to Z" },
        { value: "desc", label: "🔡 Z to A" },
      ],
      price: [
        { value: "asc", label: "💸 Lowest to Highest" },
        { value: "desc", label: "💰 Highest to Lowest" },
      ],
      createdAt: [
        { value: "desc", label: "📅 Newest First" },
        { value: "asc", label: "📅 Oldest First" },
      ],
    };
    return (
      options[sortBy as keyof typeof options] || [
        { value: "asc", label: "⬆️ Ascending" },
        { value: "desc", label: "⬇️ Descending" },
      ]
    );
  };

  if (!userStore) {
    return (
      <MenuNavbarStoreAdmin>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading store information...</div>
        </div>
      </MenuNavbarStoreAdmin>
    );
  }

  return (
    <MenuNavbarStoreAdmin>
      <section className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            All Products - {userStore.name}
          </h1>
        </div>

        {/* Filter & Sort */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-1 rounded"
          />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-1 rounded"
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="border px-3 py-1 rounded"
          >
            {getSortOrderOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <p>No products found in your store.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Image</th>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Description</th>
                  <th className="border px-4 py-2 text-left">Price</th>
                  <th className="border px-4 py-2 text-left">Stock</th>
                  <th className="border px-4 py-2 text-left">Category</th>
                  <th className="border px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">
                        <Image
                          src={
                            product.imagePreview?.[0]?.imageUrl ??
                            "/placeholder.jpg"
                          }
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-contain bg-white"
                        />
                      </td>
                      <td className="border px-4 py-2 font-medium">
                        {product.name}
                      </td>
                      <td className="border px-4 py-2 text-sm text-gray-600 max-w-[200px] truncate">
                        {product.description}
                      </td>
                      <td className="border px-4 py-2 font-semibold">
                        Rp{product.price.toLocaleString()}
                      </td>
                      <td className="border px-4 py-2">
                        <div className="space-y-2">
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgClass} ${stockStatus.textClass}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${stockStatus.dotClass} mr-2`}
                            ></div>
                            {product.stock} units
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.stock === 0
                              ? "Out of Stock"
                              : product.stock < 10
                                ? "Low Stock"
                                : "In Stock"}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {product.ProductCategory.map((pc, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                            >
                              {pc.Category.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <Link
                          href={`/dashboard/admin-store/product/edit/${product.id}`}
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                        >
                          Update Stock
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages >= 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </MenuNavbarStoreAdmin>
  );
}
