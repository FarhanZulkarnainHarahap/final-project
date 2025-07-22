"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CategoryPageSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form fields for creating a new category
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch all categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/categories`, {
          withCredentials: true,
        });
        setCategories(res.data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Handle category creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/categories`,
        {
          name,
          description,
        },
        { withCredentials: true }
      );
      console.log("Category created successfully:", res.data);
      setShowModal(false);
      setName("");
      setDescription("");

      // Fetch updated categories
      const categoriesRes = await axios.get(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/categories`,
        {
          withCredentials: true,
        }
      );
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      await axios.delete(`${baseUrl}/api/v1/categories/${id}`, {
        withCredentials: true,
      });

      // Remove the deleted category from the state
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
      >
        Add New Category
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                placeholder="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p>No categories found. You can add one.</p>
      ) : (
        <ul className="space-y-5">
          {categories.map((category) => (
            <li
              key={category.id}
              className="border border-gray-300 rounded-lg p-4 flex justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <p className="mt-1 text-gray-700">{category.description}</p>
              </div>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
