"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function AdminStoreCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/categories`,
          {
            withCredentials: true,
          }
        );
        setCategories(res.data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <p className="text-gray-600 mb-6">View all available categories</p>

      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No categories available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {category.name}
              </h2>
              <p className="mt-2 text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Optional: Add category count */}
      {categories.length > 0 && (
        <div className="mt-6 text-sm text-gray-500">
          Total categories: {categories.length}
        </div>
      )}
    </section>
  );
}
