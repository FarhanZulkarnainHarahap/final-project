"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  Product: {
    title: string;
    image: string;
    price: number;
  };
}
export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/cart/index", {
          credentials: "include", // important if you're using cookies
          // headers: {
          //   "Content-Type": "application/json",
          // },
        });

        //check for unauthorized
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/login"); // ⬅️ redirect to login page
          return;
        }

        const json = await res.json();
        if (res.ok) {
          setCartItems(json.data);
        } else {
          console.error("Failed to load cart", json.message);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    }

    fetchCart();
  }, [router]);

  const updateQuantity = async (id: string, quantity: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    try {
      await fetch(`http://localhost:8000/api/v1/cart/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const removeItem = async (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));

    try {
      await fetch(`http://localhost:8000/api/v1/cart/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.Product.price * item.quantity,
    0
  );

  return (
    <section className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Cart</h1>

      {/* Cart table */}
      <div className="overflow-x-auto w-full mb-6">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2"></th>
              <th className="p-2">Product</th>
              <th className="p-2">Price</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-lg"
                  >
                    ×
                  </button>
                </td>
                <td className="p-2 flex items-center gap-2">
                  <Image
                    src={item.Product.image}
                    alt={item.Product.title}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                  <span>{item.Product.title}</span>
                </td>
                <td className="p-2">
                  Rp.{" "}
                  {item.Product.price.toLocaleString("id-ID", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-16 border rounded p-1 text-center"
                  />
                </td>
                <td className="p-2">
                  Rp.{" "}
                  {(item.Product.price * item.quantity).toLocaleString(
                    "id-ID",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Coupon and Update */}
      {/* <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex flex-1 gap-2">
          <input
            placeholder="Coupon code"
            className="border flex-1 p-2 rounded"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Apply coupon
          </button>
        </div>
        <button className="bg-gray-200 text-black px-4 py-2 rounded">
          Update cart
        </button>
      </div> */}

      {/* Cart Totals */}
      <div className="bg-gray-100 p-4 rounded w-full sm:w-96 ml-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Cart Totals</h2>
        <div className="flex justify-between mb-2 border-b pb-2">
          <span>Subtotal</span>
          <span>
            Rp.{" "}
            {subtotal.toLocaleString("id-ID", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span>
            Rp.{" "}
            {subtotal.toLocaleString("id-ID", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="bg-green-600 w-full text-white py-2 rounded"
        >
          Proceed to checkout
        </button>
      </div>
    </section>
  );
}
