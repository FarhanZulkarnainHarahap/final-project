"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";

interface Store {
  id: string;
  name: string;
}

interface StoreProduct {
  storeId: string;
  stock: number;
  Store: Store;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imagePreview: { imageUrl: string }[];
  StoreProduct: StoreProduct[];
}

interface UserProfileResponse {
  user: {
    Store: Store[];
  };
}

interface ProductResponse {
  data: Product;
}

export default function EditStockPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [newStock, setNewStock] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch user store
  useEffect(() => {
    async function fetchUserStore() {
      try {
        const res = await axios.get<UserProfileResponse>(
          "http://localhost:8000/api/v1/auth/profile",
          { withCredentials: true }
        );
        const stores = res.data.user?.Store;

        if (stores?.length > 0) {
          setUserStore(stores[0]);
        } else {
          alert("You are not assigned to any store.");
          router.push("/dashboard/admin-store/product");
        }
      } catch (error) {
        console.error("Error fetching user store:", error);
        router.push("/dashboard/admin-store/product");
      }
    }
    fetchUserStore();
  }, [router]);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      if (!productId || !userStore) return;

      setLoading(true);
      try {
        const res = await axios.get<ProductResponse>(
          `http://localhost:8000/api/v1/products/${productId}?includeAllStores=true`,
          { withCredentials: true }
        );

        const productData = res.data.data;
        setProduct(productData);

        // Find user's store product
        const userStoreProduct = productData.StoreProduct.find(
          (sp: StoreProduct) => sp.storeId === userStore.id
        );

        if (userStoreProduct) {
          setCurrentStock(userStoreProduct.stock);
          setNewStock(userStoreProduct.stock.toString());
        } else {
          setCurrentStock(0);
          setNewStock("0");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product details.");
        router.push("/dashboard/admin-store/product");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId, userStore, router]);

  // Handle stock update
  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userStore || !product) return;

    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      alert("Please enter a valid stock number (0 or greater)");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "storeStocks",
        JSON.stringify([
          {
            storeId: userStore.id,
            stock: stockValue,
          },
        ])
      );

      await axios.patch(
        `http://localhost:8000/api/v1/products/${productId}`,
        formData,
        { withCredentials: true }
      );

      alert("Stock updated successfully!");
      router.push("/dashboard/admin-store/product");
    } catch (error) {
      console.error("Update error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to update stock";
        alert(message);
      } else {
        alert("Network error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600" };
    if (stock < 10) return { text: "Low Stock", color: "text-orange-600" };
    return { text: "In Stock", color: "text-green-600" };
  };

  if (loading || !product || !userStore) {
    return (
      <MenuNavbarStoreAdmin>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </MenuNavbarStoreAdmin>
    );
  }

  const stockStatus = getStockStatus(currentStock);

  return (
    <MenuNavbarStoreAdmin>
      <section className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard/admin-store/product")}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← Back to Products
          </button>
          <h1 className="text-2xl font-bold">
            Update Stock - {userStore.name}
          </h1>
        </div>

        {/* Product Info */}
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex gap-4 mb-4">
            <Image
              src={product.imagePreview?.[0]?.imageUrl ?? "/placeholder.jpg"}
              alt={product.name}
              width={100}
              height={100}
              className="object-contain bg-gray-50 rounded border"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-2">
                {product.description}
              </p>
              <p className="text-lg font-bold text-green-600">
                Rp{product.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                Current Stock in {userStore.name}:
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold">{currentStock} units</span>
                <div className={`text-sm ${stockStatus.color}`}>
                  {stockStatus.text}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Update Stock</h3>

          <form onSubmit={handleUpdateStock}>
            <div className="mb-4">
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Stock Amount for {userStore.name}
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter stock amount"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter 0 to mark as out of stock
              </p>
            </div>

            {/* Stock Change Preview */}
            {newStock && !isNaN(parseInt(newStock)) && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <div className="text-sm">
                  <span className="text-gray-600">Stock change: </span>
                  <span className="font-medium">
                    {currentStock} → {parseInt(newStock)} units
                  </span>
                  <span
                    className={`ml-2 ${
                      parseInt(newStock) > currentStock
                        ? "text-green-600"
                        : parseInt(newStock) < currentStock
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {parseInt(newStock) > currentStock &&
                      `(+${parseInt(newStock) - currentStock})`}
                    {parseInt(newStock) < currentStock &&
                      `(${parseInt(newStock) - currentStock})`}
                    {parseInt(newStock) === currentStock && "(No change)"}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin-store/product")}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={saving || newStock === currentStock.toString()}
              >
                {saving ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </MenuNavbarStoreAdmin>
  );
}
