"use client";

import Image from "next/image";
import { useState } from "react";

interface CartItem {
  id: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: "Item 1",
      image: "/image-of-product.png",
      price: 150.0,
      quantity: 1,
    },
  ]);

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
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
                    src={item.image}
                    alt={item.title}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                  <span>{item.title}</span>
                </td>
                <td className="p-2">${item.price.toFixed(2)}</td>
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
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Coupon and Update */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
      </div>

      {/* Cart Totals */}
      <div className="bg-gray-100 p-4 rounded w-full sm:w-96 ml-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Cart Totals</h2>
        <div className="flex justify-between mb-2 border-b pb-2">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button className="bg-green-600 w-full text-white py-2 rounded">
          Proceed to checkout
        </button>
      </div>
    </section>
  );
}
