"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  unitPrice: number;
  quantity: number;
  total: number;
  Product?: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subTotal: number;
  shippingTotal: number;
  totalPrice: number;
  createdAt: string;
  isDone: boolean;
  OrderItem: OrderItem[];
}

export default function MyOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/my-orders`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        setOrders(json.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <p>Memuat pesanan Anda...</p>;
  if (!orders.length) return <p>Belum ada pesanan.</p>;

  return (
    <div className="space-y-6 mx-auto container pt-10 px-16 ">
      <p className="lg:text-5xl text-xl font-bold">My Orders</p>
      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-lg p-4 shadow-sm bg-gray-50 space-y-2"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <h3 className="font-bold text-lg">#{order.orderNumber}</h3>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            {order.status === "CANCELLED" ? (
              <span className="text-red-600 font-semibold">
                We are sorry, but your order has been cancelled. If this was a
                mistake, please try placing your order again or contact our
                customer service for assistance.
              </span>
            ) : order.isDone ? (
              <span className="text-gray-700 font-semibold">
                Your order has been <strong>completed</strong>. Thank you!
              </span>
            ) : order.status === "PENDING" ? (
              <span className="text-yellow-600 font-semibold">
                We are verifying your payment. Please allow 1–2 hours for our
                admin to complete the confirmation.
              </span>
            ) : (
              <span className="text-green-600 font-semibold">
                Thank you! Your payment has been confirmed. We are processing
                and delivering your order.
              </span>
            )}
          </div>

          <div className="space-y-2">
            {order.OrderItem.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-1"
              >
                <div>
                  <p className="font-medium">{item.Product?.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  Rp {item.total.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>

          <div className="text-right pt-2 border-t mt-2">
            <p className="text-sm text-gray-600">
              Subtotal: Rp {order.subTotal.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-600">
              Shipping: Rp {order.shippingTotal.toLocaleString("id-ID")}
            </p>
            <p className="font-bold text-green-700">
              Total: Rp {order.totalPrice.toLocaleString("id-ID")}
            </p>
          </div>
          {order.status === "PAID" && (
            <div className="pt-2">
              {order.isDone ? (
                <span className="inline-block px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">
                  Order Completed
                </span>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
                      const res = await fetch(
                        `${baseUrl}/api/v1/my-orders/complete`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          credentials: "include",
                          body: JSON.stringify({ orderId: order.id }),
                        }
                      );
                      if (res.ok) {
                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === order.id ? { ...o, isDone: true } : o
                          )
                        );
                      } else {
                        console.error("Failed to complete order");
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Complete My Order
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
