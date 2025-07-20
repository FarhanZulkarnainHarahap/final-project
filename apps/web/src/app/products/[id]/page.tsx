"use client";
import MenuNavbarUser from "@/components/header/header-user/header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface DiscountType {
  id: string;
  value: number;
  discountType: "PERCENTAGE" | "FIXED";
  minPurchase: number;
  maxDiscount: number;
}

interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePreview: [{ imageUrl: string }];
  Discount?: DiscountType[];
}

// Helper untuk menghitung diskon
const calculateDiscount = (
  price: number,
  discount: DiscountType | null,
  qty: number = 1
) => {
  if (!discount)
    return {
      finalPrice: price,
      discountAmount: 0,
      label: null,
      totalFinal: price * qty,
      canApply: true,
    };

  const totalOriginal = price * qty;
  const canApply = totalOriginal >= discount.minPurchase;

  if (!canApply) {
    return {
      finalPrice: price,
      discountAmount: 0,
      label: `Min. Rp ${discount.minPurchase.toLocaleString()}`,
      totalFinal: totalOriginal,
      canApply: false,
    };
  }

  let discountAmount = 0;
  if (discount.discountType === "PERCENTAGE") {
    discountAmount = (price * discount.value) / 100;
    if (discount.maxDiscount > 0)
      discountAmount = Math.min(discountAmount, discount.maxDiscount);
  } else {
    discountAmount = discount.value;
  }

  const finalPrice = Math.max(0, price - discountAmount);
  return {
    finalPrice,
    discountAmount,
    label:
      discount.discountType === "PERCENTAGE"
        ? `${discount.value}% OFF`
        : `Rp ${discount.value.toLocaleString()} OFF`,
    totalFinal: finalPrice * qty,
    canApply: true,
  };
};

export default function ProductCatalogId({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function getProduct() {
      try {
        const { id } = await params;
        const lat = localStorage.getItem("lat");
        const lng = localStorage.getItem("lng");
        const province = localStorage.getItem("province");

        let url = `http://localhost:8000/api/v1/products/${id}`;
        const query = new URLSearchParams();

        if (lat && lng) {
          query.append("lat", lat);
          query.append("lng", lng);
        } else if (province && province !== "All") {
          query.append("province", province);
        }

        if (query.toString()) url += `?${query.toString()}`;

        const res = await fetch(url, { credentials: "include" });
        const json = await res.json();
        const raw = json?.data;

        const storeProduct = (raw.StoreProduct ?? [])[0];
        const stock = storeProduct?.stock ?? 0;

        const normalized: ProductType = {
          id: raw.id,
          name: raw.name,
          description: raw.description,
          price: raw.price,
          imagePreview: raw.imagePreview ?? [],
          stock,
          Discount: raw.Discount ?? [],
        };

        if (isMounted) setProduct(normalized);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }

    getProduct();
    return () => {
      isMounted = false;
    };
  }, []);

  const changeQty = (delta: number) => {
    if (!product) return;
    setQty((curr) => Math.max(1, Math.min(curr + delta, product.stock)));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await fetch("http://localhost:8000/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      setNotification("✅ Successfully added to cart!");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/checkout");
  };

  if (!product) {
    return (
      <MenuNavbarUser>
        <div className="p-4 max-w-5xl mx-auto text-center">Loading...</div>
      </MenuNavbarUser>
    );
  }

  const activeDiscount = product.Discount?.[0] || null;
  const discountInfo = calculateDiscount(product.price, activeDiscount, qty);

  return (
    <MenuNavbarUser>
      <div className="p-4 max-w-5xl mx-auto">
        {notification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow-lg z-50">
            {notification}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 border rounded-lg shadow p-6 bg-white">
          {/* LEFT: Image */}
          <div className="flex justify-center md:w-1/2 relative">
            <Image
              src={product.imagePreview?.[0]?.imageUrl ?? "/placeholder.jpg"}
              alt={product.name}
              width={300}
              height={300}
              className="rounded-lg border object-contain"
            />

            {/* Discount Badge */}
            {activeDiscount && discountInfo.canApply && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md font-bold text-xs">
                {discountInfo.label}
              </div>
            )}

            {/* Hot Deal Badge */}
            {activeDiscount &&
              discountInfo.canApply &&
              ((activeDiscount.discountType === "PERCENTAGE" &&
                activeDiscount.value >= 30) ||
                (activeDiscount.discountType === "FIXED" &&
                  activeDiscount.value >= 50000)) && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md font-bold text-xs animate-pulse">
                  🔥 HOT
                </div>
              )}
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col md:w-1/2 space-y-4">
            <h1 className="text-2xl font-bold text-green-800">
              {product.name}
            </h1>
            <p className="text-gray-700">{product.description}</p>

            {/* Price Section */}
            <div className="space-y-2">
              {activeDiscount ? (
                <>
                  {discountInfo.canApply ? (
                    <>
                      <p className="text-sm text-gray-400 line-through">
                        Rp {product.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-green-700">
                          Rp {discountInfo.finalPrice.toLocaleString()}
                        </p>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                          Save Rp {discountInfo.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-green-700">
                        Rp {product.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-yellow-600">
                        💰 Get discount with {discountInfo.label}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <p className="text-2xl font-bold text-green-700">
                  Rp {product.price.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Available Stock: {product.stock}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quantity:</span>
              <button
                onClick={() => changeQty(-1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={qty === 1}
              >
                −
              </button>
              <span className="min-w-[2rem] text-center">{qty}</span>
              <button
                onClick={() => changeQty(1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={product.stock === 0 || qty === product.stock}
              >
                +
              </button>
            </div>

            {qty > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total ({qty} items):</span>
                  <span className="text-lg font-bold text-green-700">
                    Rp {discountInfo.totalFinal.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {activeDiscount && !discountInfo.canApply && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Add Rp{" "}
                  {(
                    activeDiscount.minPurchase -
                    product.price * qty
                  ).toLocaleString()}{" "}
                  more to get discount!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full px-4 py-2 rounded bg-gray-800 hover:bg-gray-900 text-white disabled:opacity-50"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MenuNavbarUser>
  );
}
