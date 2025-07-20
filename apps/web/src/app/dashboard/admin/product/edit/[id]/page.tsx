"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";

interface Category {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

interface StoreProduct {
  productId: string;
  storeId: string;
  stock: number;
  Store: Store;
}

interface ProductCategory {
  categoryId: string;
  Category: Category;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  ProductCategory: ProductCategory[];
  StoreProduct: StoreProduct[];
  imagePreview: { imageUrl: string }[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [categoryId, setCategoryId] = useState("");
  const [imagePreviewFile, setImagePreviewFile] = useState<File | null>(null);
  const [imageContentFile, setImageContentFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeStocks, setStoreStocks] = useState<
    { storeId: string; stock: number }[]
  >([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    async function fetchAllData() {
      try {
        setLoading(true);

        // Fetch product, categories, and stores in parallel
        const [productRes, categoriesRes, storesRes] = await Promise.all([
          axios.get(
            `http://localhost:8000/api/v1/products/${id}?includeAllStores=true`,
            {
              // ← TAMBAHAN parameter
              withCredentials: true,
            }
          ),
          axios.get("http://localhost:8000/api/v1/categories", {
            withCredentials: true,
          }),
          axios.get("http://localhost:8000/api/v1/stores", {
            withCredentials: true,
          }),
        ]);

        const product: Product = productRes.data.data;
        const categoriesData: Category[] = categoriesRes.data.data;
        const storesData: Store[] = storesRes.data.data;

        console.log("Product data:", product);
        console.log("Stores data:", storesData);
        console.log("StoreProduct data:", product.StoreProduct);

        // Set categories and stores
        setCategories(categoriesData);
        setStores(storesData);

        // Populate form with existing product data
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(product.price || 0);
        setWeight(product.weight || 0);

        // Extract category ID from ProductCategory relation
        const firstCategoryId = product.ProductCategory?.[0]?.categoryId || "";
        setCategoryId(firstCategoryId);

        // Set image preview URL
        setImagePreviewUrl(product.imagePreview?.[0]?.imageUrl || "");

        // Initialize store stocks - PENTING: Untuk SEMUA store, bukan hanya yang ada di StoreProduct
        const existingStocks = product.StoreProduct || [];

        const initialStocks = storesData.map((store) => {
          // Cari stock yang sudah ada untuk store ini
          const existingStock = existingStocks.find(
            (sp: StoreProduct) => sp.storeId === store.id
          );

          const stockValue = existingStock ? existingStock.stock : 0;
          console.log(
            `Store ${store.name} (${store.id}): stock = ${stockValue}`
          );

          return {
            storeId: store.id,
            stock: stockValue,
          };
        });

        console.log("Final initial stocks:", initialStocks);
        setStoreStocks(initialStocks);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load product data");
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [id]);

  // Handle form submission
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !weight ||
      !categoryId
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setUpdating(true);

      // Prepare form data
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", String(price));
      formData.append("weight", String(weight));
      formData.append("categoryIds", categoryId);

      // PENTING: Kirim SEMUA store stocks, termasuk yang 0
      // Filter hanya yang stock > 0 atau yang sudah ada sebelumnya
      const stocksToSend = storeStocks.filter((stock) => stock.stock >= 0);
      formData.append("storeStocks", JSON.stringify(stocksToSend));

      console.log("Sending storeStocks:", stocksToSend);

      // Add image files if selected
      if (imagePreviewFile) {
        formData.append("imagePreview", imagePreviewFile);
      }
      if (imageContentFile) {
        formData.append("imageContent", imageContentFile);
      }

      // Send update request
      await axios.patch(
        `http://localhost:8000/api/v1/products/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Product updated successfully!");
      router.push("/dashboard/admin/product");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle stock change for specific store
  const handleStockChange = (storeId: string, newStock: number) => {
    setStoreStocks((prev) =>
      prev.map((s) =>
        s.storeId === storeId ? { ...s, stock: Math.max(0, newStock) } : s
      )
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <MenuNavbarAdmin>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleUpdateProduct}
          className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-lg space-y-6 overflow-y-auto max-h-[90vh]"
        >
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
            <p className="text-gray-600 mt-1">
              Update product information and stock levels
            </p>
          </div>

          {/* Product Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Image Preview */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Current Image Preview
            </label>
            {imagePreviewUrl && (
              <div className="mb-3">
                <Image
                  src={imagePreviewUrl}
                  alt="Current Preview"
                  width={150}
                  height={150}
                  className="object-contain bg-gray-50 border border-gray-200 rounded-lg"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagePreviewFile(e.target.files?.[0] ?? null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload new image to replace current preview
            </p>
          </div>

          {/* Image Content */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Image Content (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageContentFile(e.target.files?.[0] ?? null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Additional product image
            </p>
          </div>

          {/* Store Stocks */}
          <div>
            <label className="block mb-3 font-medium text-gray-700">
              Stock per Store <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              {stores.map((store) => {
                const currentStock =
                  storeStocks.find((s) => s.storeId === store.id)?.stock || 0;
                return (
                  <div
                    key={store.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <label className="font-medium text-gray-700 flex-1">
                      {store.name}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={currentStock}
                        onChange={(e) =>
                          handleStockChange(store.id, Number(e.target.value))
                        }
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-500">units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/product")}
              disabled={updating}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {updating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{updating ? "Updating..." : "Update Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </MenuNavbarAdmin>
  );
}
