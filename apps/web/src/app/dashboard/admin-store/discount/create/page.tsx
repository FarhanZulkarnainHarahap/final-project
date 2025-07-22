"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";

interface Product {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

export default function CreateDiscount() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    value: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    startDate: "",
    endDate: "",
  });

  // Fetch user store info
  useEffect(() => {
    const fetchUserStore = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/profile`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.user?.Store && data.user.Store.length > 0) {
            setUserStore(data.user.Store[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user store:", error);
      }
    };
    fetchUserStore();
  }, []);

  // Fetch products from current store
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userStore?.id) return;

      try {
        const url = new URL(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/products/by-store`
        );
        url.searchParams.append("storeId", userStore.id);

        const response = await fetch(url.toString(), {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [userStore?.id]);

  const validateForm = () => {
    if (!userStore?.id) {
      alert("Store information not loaded. Please refresh the page.");
      return false;
    }
    if (!form.productId) {
      alert("Please select a product");
      return false;
    }
    if (!form.value || parseFloat(form.value) <= 0) {
      alert("Please enter a valid discount value");
      return false;
    }
    if (form.discountType === "PERCENTAGE" && parseFloat(form.value) > 100) {
      alert("Percentage discount cannot exceed 100%");
      return false;
    }
    if (!form.startDate || !form.endDate) {
      alert("Please select start and end dates");
      return false;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      alert("End date must be after start date");
      return false;
    }
    if (new Date(form.startDate) < new Date()) {
      alert("Start date cannot be in the past");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const requestData = {
        storeId: userStore?.id,
        productId: form.productId,
        value: parseFloat(form.value),
        discountType: form.discountType,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}0/api/v1/discounts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        alert("Discount created successfully!");
        router.push("/dashboard/admin-store/discount");
      } else {
        const errorData = await response.json();
        alert(
          `Failed to create discount: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error creating discount");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuNavbarStoreAdmin>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Create New Discount</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product *
              </label>
              <select
                value={form.productId}
                onChange={(e) =>
                  setForm({ ...form, productId: e.target.value })
                }
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  No products available. Please add products first.
                </p>
              )}
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountType: e.target.value as "PERCENTAGE" | "FIXED",
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (IDR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Value *
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  required
                  min="0"
                  max={form.discountType === "PERCENTAGE" ? "100" : undefined}
                  step={form.discountType === "PERCENTAGE" ? "0.01" : "1000"}
                  placeholder={
                    form.discountType === "PERCENTAGE" ? "10" : "50000"
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  required
                  min={form.startDate || new Date().toISOString().slice(0, 16)}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || products.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Discount"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MenuNavbarStoreAdmin>
  );
}
