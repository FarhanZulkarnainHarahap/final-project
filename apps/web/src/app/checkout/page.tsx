"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/* Types */
interface CartItem {
  id: string;
  quantity: number;
  Product: {
    title: string;
    image: string;
    price: number;
  };
}

interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface ShippingOption {
  id: string;
  label: string;
  cost: number;
}

/* -------------------------------------------------------------------------- */
/* Dummy shipping list – swap with RajaOngkir or your API later               */
const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "reg", label: "Regular (3‑4 days)", cost: 15000 },
  { id: "exp", label: "Express (1‑2 days)", cost: 30000 },
  { id: "sameday", label: "Same‑day", cost: 50000 },
];

/* -------------------------------------------------------------------------- */

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [shippingId, setShippingId] = useState<string | null>(null);
  const router = useRouter();

  /* -------------------- Fetch cart once on mount ------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/cart/index", {
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          router.push("/auth/login");
          return;
        }

        const json = await res.json();
        if (res.ok) setCartItems(json.data);
        else console.error("Failed to load cart", json.message);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    })();
  }, [router]);

  /* -------------------- Derived values ---------------------------------- */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.Product.price * item.quantity,
    0
  );
  const shippingCost =
    SHIPPING_OPTIONS.find((opt) => opt.id === shippingId)?.cost ?? 0;
  const grandTotal = subtotal + shippingCost;

  /* -------------------- Helpers ----------------------------------------- */

  const formatRp = (n: number) =>
    n.toLocaleString("id-ID", { minimumFractionDigits: 2 });

  const allAddressFilled = Object.values(address).every((v) => v.trim() !== "");

  const handlePayNow = () => {
    if (!allAddressFilled) {
      alert("Please complete your shipping address.");
      return;
    }
    if (!shippingId) {
      alert("Please select a shipping method.");
      return;
    }

    // 👉 send address, shippingId & cart data to your back‑end / payment gateway
    console.log({ address, shippingId, cartItems });

    // Example redirect to payment page
    router.push("/payment"); // or Midtrans snap token page, etc.
  };

  /* ---------------------------------------------------------------------- */
  return (
    <section className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Checkout</h1>

      {/* ---------- 1. Cart table ---------- */}
      <div className="overflow-x-auto w-full mb-8">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-center">Product</th>
              <th className="p-2 text-center">Price</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-center">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="border-b ">
                <td className="p-2 flex items-center gap-2 ">
                  <Image
                    src={item.Product.image}
                    alt={item.Product.title}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                  <span>{item.Product.title}</span>
                </td>
                <td className="p-2 text-center">
                  Rp. {formatRp(item.Product.price)}
                </td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-center">
                  Rp. {formatRp(item.Product.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- 2. Address & shipping ---------- */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Address form */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>

          {(
            [
              ["fullName", "Full name"],
              ["phone", "Phone"],
              ["address", "Address"],
              ["city", "City"],
              ["postalCode", "Postal code"],
            ] as [keyof Address, string][]
          ).map(([key, label]) => (
            <input
              key={key}
              placeholder={label}
              value={address[key]}
              onChange={(e) =>
                setAddress({ ...address, [key]: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          ))}
        </div>

        {/* Shipping options & totals */}
        <div className="bg-gray-100 p-4 rounded h-fit">
          <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
          <div className="space-y-2 mb-4">
            {SHIPPING_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center justify-between border p-2 rounded cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingId === opt.id}
                    onChange={() => setShippingId(opt.id)}
                  />
                  <span>{opt.label}</span>
                </div>
                <span>Rp. {formatRp(opt.cost)}</span>
              </label>
            ))}
          </div>

          {/* Totals */}
          <h3 className="text-lg font-semibold mb-2">Totals</h3>
          <div className="flex justify-between mb-1">
            <span>Items subtotal</span>
            <span>Rp. {formatRp(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Shipping</span>
            <span>{shippingId ? `Rp. ${formatRp(shippingCost)}` : "—"}</span>
          </div>
          <div className="flex justify-between border-t mt-2 pt-2 text-lg font-bold">
            <span>Grand total</span>
            <span>Rp. {formatRp(grandTotal)}</span>
          </div>

          <button
            onClick={handlePayNow}
            className="bg-green-600 mt-4 w-full text-white py-2 rounded disabled:opacity-60"
            disabled={!allAddressFilled || !shippingId}
          >
            Pay Now
          </button>
        </div>
      </div>
    </section>
  );
}
