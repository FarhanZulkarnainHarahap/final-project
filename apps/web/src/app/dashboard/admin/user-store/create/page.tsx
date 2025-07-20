"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";

interface Store {
  id: string;
  name: string;
}

export default function CreateStoreAdminPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    phoneNumber: "",
    storeId: "",
  });

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      try {
        // Fetch available stores - adjust endpoint as needed
        const response = await fetch("http://localhost:8000/api/v1/stores", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setStores(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching stores:", err);
        // Continue without stores if endpoint doesn't exist
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        storeId: formData.storeId || undefined, // Don't send empty string
      };

      const response = await fetch(
        "http://localhost:8000/api/v1/user/store-admins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Store admin created successfully!");
        router.push("/dashboard/admin/user-store");
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Failed to create store admin.";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error creating store admin:", error);
      alert("Failed to create store admin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MenuNavbarAdmin>
      <section className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Store Admin</h1>
          <Link
            href="/dashboard/admin/user-store"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            ← Back to List
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block mb-1 font-medium">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block mb-1 font-medium">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="username" className="block mb-1 font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block mb-1 font-medium">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block mb-1 font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Store Assignment Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Store Assignment
            </h2>

            <div>
              <label htmlFor="storeId" className="block mb-1 font-medium">
                Assign to Store (Optional)
              </label>
              <select
                id="storeId"
                name="storeId"
                value={formData.storeId}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                disabled={loading}
              >
                <option value="">Select a store (optional)</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {loading && (
                <p className="text-sm text-gray-500 mt-1">Loading stores...</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                You can assign this admin to a store later if needed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Link
              href="/dashboard/admin/user-store"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Store Admin"}
            </button>
          </div>
        </form>
      </section>
    </MenuNavbarAdmin>
  );
}
