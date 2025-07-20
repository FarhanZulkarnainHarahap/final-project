"use client";
import MenuNavbarUser from "@/components/header/header-user/header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePreview: [{ imageUrl: string }];
  imageContent: [{ imageUrl: string }];
}

export default function ProductCatalogId({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  /* ----------------------------------------------------------------------------
   *  component state
   * --------------------------------------------------------------------------*/
  const [product, setProduct] = useState<ProductType | null>(null);
  const [qty, setQty] = useState<number>(1);

  const [notification, setNotification] = useState<string | null>(null);

  const router = useRouter();

  /* ----------------------------------------------------------------------------
   *  fetch product data once on mount
   * --------------------------------------------------------------------------*/
  useEffect(() => {
    let isMounted = true;

    async function getProduct() {
      try {
        const { productId } = await params;
        const res = await fetch(
          `http://localhost:8000/api/v1/products/${productId}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (isMounted) setProduct(json?.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }

    getProduct();
    return () => {
      isMounted = false;
    };
    // eslint‑disable‑next‑line react-hooks/exhaustive-deps
  });

  /* ----------------------------------------------------------------------------
   *  helpers
   * --------------------------------------------------------------------------*/
  const changeQty = (delta: number) => {
    if (!product) return;
    setQty((curr) => {
      const next = curr + delta;
      // clamp between 1 and available stock
      return Math.max(1, Math.min(next, product.stock));
    });
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
      // Show success notification
      setNotification("✅ Successfully added to cart!");

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart(); // add first…
    router.push("/checkout"); // …then jump straight to checkout
  };

  /* ----------------------------------------------------------------------------
   *  render
   * --------------------------------------------------------------------------*/
  return (
    <MenuNavbarUser>
      <div className="p-4">
        {notification && (
          <div className="absolute top-0 left-0 right-0 bg-green-100 text-green-800 text-sm text-center p-2 shadow z-50">
            {notification}
          </div>
        )}

        {product && (
          <article
            key={product.id}
            className="max-w-md mx-auto border rounded shadow p-4 space-y-3"
          >
            <Image
              src={product.imagePreview[0].imageUrl}
              alt={product.name}
              width={250}
              height={250}
              className="mx-auto mb-4"
            />

            <h2 className="text-xl font-bold">{product.name}</h2>
            <p>{product.description}</p>
            <p className="font-semibold">
              Price:&nbsp;Rp{product.price.toLocaleString()}
            </p>
            <p>Stock:&nbsp;{product.stock}</p>

            {/* quantity selector */}
            <div className="flex items-center gap-2">
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

            {/* action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                disabled={product.stock === 0}
              >
                Buy Now
              </button>
            </div>
          </article>
        )}
      </div>
    </MenuNavbarUser>
  );
}
