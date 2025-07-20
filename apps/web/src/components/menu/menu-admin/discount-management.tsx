"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Discount {
  id: string;
  value: number;
  discountType: "PERCENTAGE" | "FIXED";
  startDate: string;
  endDate: string;
  Store: { name: string };
  Product: { name: string; price: number };
  DiscountUsage: Array<{ totalAmount: number }>;
}

export default function DiscountManagement() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch discounts
  const fetchDiscounts = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/discounts", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discount?")) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/discounts/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchDiscounts();
        alert("Discount deleted successfully!");
      } else {
        alert("Failed to delete discount");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting discount");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);

  const getStatus = (discount: Discount) => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    if (now < startDate) return "Scheduled";
    if (now >= startDate && now <= endDate) return "Active";
    return "Expired";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Discount Management
          </h1>
          <p className="text-gray-600">Manage store discounts and vouchers</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin-store/discount/create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Discount
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {discounts.map((discount) => (
              <tr
                key={discount.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {discount.Product.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {discount.Store.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {discount.discountType === "PERCENTAGE"
                      ? `${discount.value}%`
                      : formatCurrency(discount.value)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {new Date(discount.startDate).toLocaleDateString("id-ID")}
                  </div>
                  <div className="text-xs">
                    to {new Date(discount.endDate).toLocaleDateString("id-ID")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getStatus(discount))}`}
                  >
                    {getStatus(discount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {discount.DiscountUsage.length} times
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(
                      discount.DiscountUsage.reduce(
                        (sum, usage) =>
                          sum + parseFloat(usage.totalAmount.toString()),
                        0
                      )
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(discount.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete discount"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {discounts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No discounts found</div>
            <p className="text-gray-400 text-sm">
              Create your first discount to get started
            </p>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-center">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
