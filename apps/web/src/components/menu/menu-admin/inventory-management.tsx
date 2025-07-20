"use client";

import { useEffect, useState } from "react";

interface Store {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imagePreview: { imageUrl: string }[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface InventoryJournal {
  id: string;
  storeId: string;
  productId: string;
  quantity: string;
  action: "RESTOCK" | "SALE" | "ADD";
  createdAt: string;
  Store: Store;
  Product: Product;
  User: User;
}

interface HistoryResponse {
  message: string;
  data: InventoryJournal[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function InventoryHistoryPage() {
  const [historyData, setHistoryData] = useState<InventoryJournal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [stores, setStores] = useState<Store[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const fetchStores = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/stores", {
        credentials: "include",
      });
      const result = await res.json();
      setStores(result.data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStore) params.append("storeId", selectedStore);
      if (selectedAction) params.append("action", selectedAction);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(
        `http://localhost:8000/api/v1/inventory/history?${params}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result: HistoryResponse = await res.json();
      setHistoryData(result.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to fetch inventory history");
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedStore, selectedAction, startDate, endDate]);

  const clearFilters = () => {
    setSelectedStore("");
    setSelectedAction("");
    setStartDate("");
    setEndDate("");
  };

  const getActionBadgeClass = (action: string) => {
    if (action === "ADD" || action === "RESTOCK")
      return "bg-green-100 text-green-800";
    if (action === "SALE") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getQuantityDisplay = (qty: string) => {
    const num = parseInt(qty);
    return {
      value: num > 0 ? `+${qty}` : qty,
      color: num > 0 ? "text-green-600" : "text-red-600",
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inventory History
        </h1>
        <p className="text-gray-600">
          Track all inventory changes and movements across stores
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Store
          </label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">All Stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Action
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">All Actions</option>
            <option value="ADD">Add Stock</option>
            <option value="RESTOCK">Restock</option>
            <option value="SALE">Sale/Reduce</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={today}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-4 mt-2">
          <button
            onClick={clearFilters}
            className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
                    <span className="ml-3 text-gray-500">
                      Loading history...
                    </span>
                  </div>
                </td>
              </tr>
            ) : historyData.length > 0 ? (
              historyData.map((item) => {
                const qty = getQuantityDisplay(item.quantity);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {item.Product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Rp{item.Product.price.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.Store.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeClass(item.action)}`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={qty.color}>{qty.value} units</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        {item.User.firstName} {item.User.lastName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.User.role}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="text-lg">No inventory history found</div>
                  <p className="text-gray-400 mt-2">
                    {selectedStore || selectedAction || startDate || endDate
                      ? "Try adjusting your filters"
                      : "No inventory changes have been made yet"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {historyData.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
          Showing {historyData.length} inventory{" "}
          {historyData.length === 1 ? "transaction" : "transactions"}
          {selectedStore && ` for selected store`}
          {selectedAction && ` with action: ${selectedAction}`}
          {(startDate || endDate) && ` within date range`}
        </div>
      )}
    </div>
  );
}
