"use client";

import { useEffect, useState } from "react";

import Icons from "./icons";
import Image from "next/image";
import Link from "next/link";

interface DiscountType {
  id: string;
  value: number;
  discountType: "PERCENTAGE" | "FIXED";
  minPurchase: number;
  maxDiscount: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePreview: { imageUrl: string }[];
  storeName?: string | null;
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

// Helper untuk menghitung diskon
const calculateDiscount = (price: number, discount: DiscountType | null) => {
  if (!discount) return { finalPrice: price, discountAmount: 0, label: null };

  let discountAmount = 0;
  if (discount.discountType === "PERCENTAGE") {
    discountAmount = (price * discount.value) / 100;
    if (discount.maxDiscount > 0)
      discountAmount = Math.min(discountAmount, discount.maxDiscount);
  } else {
    discountAmount = discount.value;
  }

  const finalPrice = Math.max(0, price - discountAmount);
  const label =
    discount.discountType === "PERCENTAGE"
      ? `${discount.value}% OFF`
      : `Rp ${discount.value.toLocaleString()} OFF`;

  return { finalPrice, discountAmount, label };
};

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const DEFAULT_STORE_ID = "f96bdf49-a653-44f9-bcb8-39432ff738c1";

export default function HomePageUser() {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeoActive, setIsGeoActive] = useState<boolean>(false);

  // 🔥 PERBAIKAN 1: Load initial data dari localStorage
  useEffect(() => {
    // Load saved location data
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

  // 🔥 PERBAIKAN 2: Geolocation dengan localStorage sync
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLatitude(lat);
          setLongitude(lng);
          setIsGeoActive(true);

          // 🔥 SIMPAN KE LOCALSTORAGE
          localStorage.setItem("lat", lat.toString());
          localStorage.setItem("lng", lng.toString());
          localStorage.setItem("isGeoActive", "true");

          // Clear province selection karena geo aktif
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

          // 🔥 BERSIHKAN LOCALSTORAGE
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

        let url = "";

        if (isGeoActive && latitude !== null && longitude !== null) {
          url = `${domain}/api/v1/products/nearby?latitude=${latitude}&longitude=${longitude}&radius=20000`;
          console.log("🔍 Fetching products by geolocation:", {
            latitude,
            longitude,
          });
        } else if (selectedProvince !== "All") {
          url = `${domain}/api/v1/products/by-province?province=${selectedProvince}`;
          console.log("🔍 Fetching products by province:", selectedProvince);
        } else {
          url = `${domain}/api/v1/products/by-store?storeId=${DEFAULT_STORE_ID}`;
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
  }, [latitude, longitude, selectedProvince, isGeoActive]);

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

    fetchProvinces();
  }, []);

  // 🔥 PERBAIKAN 3: Handler untuk province change
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);

    // 🔥 SIMPAN KE LOCALSTORAGE
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
      <div>
        <h1 className="text-3xl font-bold text-center">
          Selamat Datang di Market Snap
        </h1>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
      <div className="grid grid-rows-[auto_1fr] gap-5">
        {!isGeoActive && (
          <div className="w-full flex justify-end px-5">
            <div className="flex items-center gap-2 bg-green-700 text-white px-6 py-2 rounded shadow-md">
              <span className="font-semibold">Choose Location </span>
              <select
                className="border-none rounded-md px-3 py-2 text-black cursor-pointer shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                <option value="" disabled hidden>
                  Choose Location
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

        <div className="p-6 rounded-lg shadow-l flex flex-col gap-20">
          <Icons />
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-900">Products</h2>

            {/* 🔥 PERBAIKAN 4: Status indicator */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                {isGeoActive
                  ? `📍 Your nearest location`
                  : selectedProvince !== "All"
                    ? `🌍 Province: ${selectedProvince}`
                    : "🏪 Main store location"}
              </p>
            </div>

            {isGeoActive && stores.length > 0 && (
              <div className="mb-2 text-xl text-green-900 font-semibold">
                <strong>Nearby stores:</strong> {stores.join(", ")}
              </div>
            )}

            {products.length === 0 && (
              <p className="text-green-600">No products found.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => {
                // Ambil diskon aktif pertama
                const activeDiscount = product.Discount?.[0] || null;
                const { finalPrice, discountAmount, label } = calculateDiscount(
                  product.price,
                  activeDiscount
                );

                return (
                  <div
                    key={product.id}
                    className="bg-white border rounded-lg shadow hover:shadow-lg transition-transform transform hover:scale-105 p-4 relative"
                  >
                    {/* Discount Badge */}
                    {activeDiscount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
                        {label}
                      </div>
                    )}

                    {/* Hot Deal Badge */}
                    {activeDiscount &&
                      ((activeDiscount.discountType === "PERCENTAGE" &&
                        activeDiscount.value >= 30) ||
                        (activeDiscount.discountType === "FIXED" &&
                          activeDiscount.value >= 50000)) && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold animate-pulse z-10">
                          🔥
                        </div>
                      )}

                    <Image
                      src={
                        product.imagePreview?.[0]?.imageUrl ?? "/default.jpg"
                      }
                      alt={product.name}
                      width={200}
                      height={150}
                      className="mx-auto mb-4 rounded object-contain"
                    />

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                      {product.name}
                    </h3>

                    {/* Price with Discount */}
                    <div className="text-center mb-2 min-h-[72px]">
                      {activeDiscount ? (
                        <>
                          <p className="text-sm text-gray-400 line-through">
                            Rp {product.price.toLocaleString()}
                          </p>
                          <p className="text-xl font-bold text-green-700">
                            Rp {finalPrice.toLocaleString()}
                          </p>
                          <p className="text-xs text-red-600">
                            Save Rp {discountAmount.toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-xl font-bold text-green-700">
                          Rp {product.price.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 text-center mb-4">
                      Stock: {product.stock}
                    </p>

                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      View product
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
