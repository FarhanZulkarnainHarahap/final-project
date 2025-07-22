"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

export default function ProductListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [imagePreviewFile, setImagePreviewFile] = useState<File | null>(null);
  const [imageContentFile, setImageContentFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  // const [storeId, setStoreId] = useState<string>("");
  // const [stock, setStock] = useState<number>(0);
  const [storeStocks, setStoreStocks] = useState<
    { storeId: string; stock: number }[]
  >([]);

  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/categories`,
          { withCredentials: true }
        );
        setCategories(categoriesRes.data.data);

        const storesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/stores`,
          { withCredentials: true }
        );
        setStores(storesRes.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !description ||
      !price ||
      !weight ||
      !categoryId ||
      storeStocks.length === 0 ||
      !imagePreviewFile
    ) {
      alert("Missing required fields or no category selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", String(price));
      formData.append("weight", String(weight));
      // formData.append("stock", String(stock));
      // formData.append("storeId", storeId);
      formData.append("storeStocks", JSON.stringify(storeStocks));
      formData.append("categoryIds", categoryId);
      if (imagePreviewFile) formData.append("imagePreview", imagePreviewFile);
      if (imageContentFile) formData.append("imageContent", imageContentFile);

      await axios.post(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/products`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Product created successfully.");
      router.push("/dashboard/admin/product");

      setName("");
      setDescription("");
      setPrice(0);
      setWeight(0);
      setImagePreviewFile(null);
      setImageContentFile(null);
      setCategoryId("");
      setStoreStocks([]);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
  };

  return (
    <MenuNavbarAdmin>
      <section className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
        <form
          onSubmit={handleCreateProduct}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          {currentStep === 1 && (
            <>
              <div>
                <label className="block mb-1 font-medium">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium" htmlFor="price">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium" htmlFor="weight">
                  Weight (gram)
                </label>
                <input
                  type="number"
                  placeholder="Weight"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Image Preview</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImagePreviewFile(e.target.files?.[0] ?? null)
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Image Content (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageContentFile(e.target.files?.[0] ?? null)
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = "/dashboard/admin/product")
                  }
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select a Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Set Stock for Each Store
                </label>
                <div className="space-y-2">
                  {stores.map((store) => (
                    <div key={store.id} className="flex items-center space-x-2">
                      <label className="w-1/3">{store.name}</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-2/3"
                        value={
                          storeStocks.find((s) => s.storeId === store.id)
                            ?.stock ?? 0
                        }
                        onChange={(e) => {
                          const newStock = Number(e.target.value);
                          setStoreStocks((prev) => {
                            const exists = prev.find(
                              (s) => s.storeId === store.id
                            );
                            if (exists) {
                              return prev.map((s) =>
                                s.storeId === store.id
                                  ? { ...s, stock: newStock }
                                  : s
                              );
                            } else {
                              return [
                                ...prev,
                                { storeId: store.id, stock: newStock },
                              ];
                            }
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Create Product
                </button>
              </div>
            </>
          )}
        </form>
      </section>
    </MenuNavbarAdmin>
  );
}
