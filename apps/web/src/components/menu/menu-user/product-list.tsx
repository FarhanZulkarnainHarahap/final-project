"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculateDiscountPrice } from "../../../../lib/utils/discount";

interface DiscountType {
  id: string;
  value: number;
  discountType: "PERCENTAGE" | "FIXED";
  minPurchase: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePreview: { imageUrl: string }[];
  storeName?: string | null;
  storeDistance?: number;
  Discount?: DiscountType[];
}

interface Store {
  name: string;
}

interface StoreProductResponse {
  Product: Product;
  Store: Store;
  stock: number;
}

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const DEFAULT_STORE_ID = "f96bdf49-a653-44f9-bcb8-39432ff738c1";

export default function ProductPage() {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeoActive, setIsGeoActive] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const savedLat = localStorage.getItem("lat");
    const savedLng = localStorage.getItem("lng");
    const savedProvince = localStorage.getItem("province");
    const savedIsGeoActive = localStorage.getItem("isGeoActive");

    if (savedLat && savedLng && savedIsGeoActive === "true") {
      setLatitude(parseFloat(savedLat));
      setLongitude(parseFloat(savedLng));
      setIsGeoActive(true);
      console.log("🔄 Loaded location from localStorage:", {
        lat: savedLat,
        lng: savedLng,
      });
    } else if (savedProvince && savedProvince !== "All") {
      setSelectedProvince(savedProvince);
      console.log("🔄 Loaded province from localStorage:", savedProvince);
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLatitude(lat);
          setLongitude(lng);
          setIsGeoActive(true);

          localStorage.setItem("lat", lat.toString());
          localStorage.setItem("lng", lng.toString());
          localStorage.setItem("isGeoActive", "true");

          localStorage.removeItem("province");
          setSelectedProvince("All");

          console.log("📍 Geolocation active, saved to localStorage:", {
            lat,
            lng,
          });
        },
        (error) => {
          console.log("❌ Geolocation failed:", error.message);
          setIsGeoActive(false);

          localStorage.removeItem("lat");
          localStorage.removeItem("lng");
          localStorage.setItem("isGeoActive", "false");
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (isGeoActive && (latitude === null || longitude === null)) return;

        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category) params.append("category", category);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        let url = "";

        if (isGeoActive && latitude !== null && longitude !== null) {
          params.append("latitude", latitude.toString());
          params.append("longitude", longitude.toString());
          params.append("radius", "20000");
          url = `${domain}/api/v1/products/nearby?${params.toString()}`;
          console.log("🔍 Fetching products by geolocation:", {
            latitude,
            longitude,
          });
        } else if (selectedProvince !== "All") {
          params.append("province", selectedProvince);
          url = `${domain}/api/v1/products/by-province?${params.toString()}`;
          console.log("🔍 Fetching products by province:", selectedProvince);
        } else {
          params.append("storeId", DEFAULT_STORE_ID);
          url = `${domain}/api/v1/products/by-store?${params.toString()}`;
          console.log("🔍 Fetching products by default store");
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Gagal memuat produk.");
        }

        const data = await res.json();
        const rawData = data.data ?? data.products ?? [];

        const normalized: Product[] = rawData.map(
          (item: Product | StoreProductResponse) =>
            "Product" in item ? { ...item.Product, stock: item.stock } : item
        );

        const nearbyStoreNames: string[] = (data.nearbyStores ?? []).map(
          (store: { name: string }) => store.name
        );

        setProducts(normalized);
        setStores(nearbyStoreNames);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchProducts();
  }, [
    latitude,
    longitude,
    selectedProvince,
    isGeoActive,
    search,
    page,
    limit,
    category,
  ]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/addresses/provinces`
        );
        const data = await res.json();
        setProvinces(data.provinces || []);
      } catch (err) {
        console.error("Gagal mengambil provinsi", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${domain}/api/v1/categories`);
        const data = await res.json();
        const names = (data.data || []).map((c: { name: string }) => c.name);
        setCategories(names);
      } catch (err) {
        console.error("Gagal mengambil kategori", err);
      }
    };

    fetchProvinces();
    fetchCategories();
  }, []);

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setPage(1);
    localStorage.setItem("province", province);

    // Clear geolocation data karena user pilih province manual
    if (province !== "All") {
      setIsGeoActive(false);
      setLatitude(null);
      setLongitude(null);
      localStorage.removeItem("lat");
      localStorage.removeItem("lng");
      localStorage.setItem("isGeoActive", "false");
    }

    console.log("🌍 Province changed to:", province);
  };

  return (
    <div className="min-h-screen px-6 md:px-20 lg:px-40 py-10 grid grid-rows-[auto_1fr] gap-10">
      <div>{error && <p className="text-red-400 text-center">{error}</p>}</div>
      <div className="grid grid-rows-[auto_1fr] gap-5">
        {!isGeoActive && (
          <div className="w-full flex justify-end px-5">
            <div className="flex items-center gap-2 bg-green-700 text-white px-6 py-2 rounded shadow-md">
              <span className="font-semibold">Choose Location</span>
              <select
                className="border-none rounded-md px-3 py-2 text-black cursor-pointer shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                <option value="" disabled hidden>
                  Choose Province
                </option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="p-6 rounded-lg shadow-l grid grid-rows-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-900"></h2>

            {/*  Status indicator */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                {isGeoActive
                  ? `📍 Your nearest location`
                  : selectedProvince !== "All"
                    ? `🌍 Province: ${selectedProvince}`
                    : "🏪 Default store location"}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded shadow"
              />

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="border rounded px-3 py-2 shadow"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {isGeoActive && stores.length > 0 && (
              <div className="mb-2 text-green-900 font-semibold">
                <strong>Nearby store:</strong> {stores.join(", ")}
              </div>
            )}

            {products.length === 0 && (
              <p className="text-green-600">No Products Found</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const activeDiscount = product.Discount?.[0] || null;
                const { finalPrice, discountAmount, discountLabel } =
                  calculateDiscountPrice(product.price, activeDiscount);

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition duration-300 text-center relative overflow-hidden"
                  >
                    {/* Discount Badge */}
                    {activeDiscount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
                        {discountLabel}
                      </div>
                    )}

                    {/* Hot Deal Badge */}
                    {activeDiscount &&
                      ((activeDiscount.discountType === "PERCENTAGE" &&
                        activeDiscount.value >= 30) ||
                        (activeDiscount.discountType === "FIXED" &&
                          activeDiscount.value >= 50000)) && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold animate-pulse z-10">
                          🔥 HOT
                        </div>
                      )}

                    <Image
                      src={
                        product.imagePreview?.[0]?.imageUrl ??
                        "/placeholder.jpg"
                      }
                      alt={product.name}
                      width={150}
                      height={150}
                      className="mx-auto mb-4"
                    />

                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>

                    <div className="mb-2">
                      {activeDiscount ? (
                        <>
                          <p className="text-sm text-gray-400 line-through">
                            Rp {product.price.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-lg font-bold text-green-700">
                              Rp {finalPrice.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            Save Rp {discountAmount.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-green-700">
                          Rp {product.price.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Stock: {product.stock}
                    </p>

                    <Link
                      href={`/products/${product.id}`}
                      className="inline-block bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 transition"
                    >
                      View Product
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-8 gap-3">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-green-700 text-white rounded shadow"
              >
                Prev
              </button>
              <span className="px-4 py-2 border rounded shadow">
                Page {page}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 bg-green-700 text-white rounded shadow"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
