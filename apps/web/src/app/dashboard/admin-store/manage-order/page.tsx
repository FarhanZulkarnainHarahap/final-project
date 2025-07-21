"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";

interface Order {
  id: string;
  orderNumber: string;
  recipientName: string;
  totalPrice: number;
  items: {
    name: string;
    quantity: number;
  }[];
  // paymentMethod: "epayment" | "manual";
  proofImageUrl?: string;
  paymentStatus: "pending" | "paid" | "cancelled";
  isDone: boolean;
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["paymentStatus"]
  ) => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/admin/orders/update",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            orderId,
            status: newStatus.toUpperCase(),
          }),
        }
      );

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, paymentStatus: newStatus } // ✅ only update status
              : order
          )
        );
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/admin/orders", {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok) {
          setOrders(json.data);
        } else {
          console.error("Failed to load orders:", json.message);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    }

    fetchOrders();
  }, []);

  return (
    <MenuNavbarStoreAdmin>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Manage Orders</h1>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">No</th>
                <th className="p-3 text-left">Order Number</th>
                <th className="p-3 text-left">Recipient</th>
                <th className="p-3 text-left">Order Details</th>
                <th className="p-3 text-left">Total Price</th>
                <th className="p-3 text-left">Payment Method</th>
                <th className="p-3 text-left">Proof of Payment</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Done</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">#{order.orderNumber}</td>
                    <td className="p-3">{order.recipientName}</td>
                    <td className="p-3 text-sm">
                      <ul className="list-disc pl-4">
                        {order.items.map((item, i) => (
                          <li key={i}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3">{order.totalPrice}</td>
                    {/* <td className="p-3 capitalize">{order.paymentMethod}</td> */}
                    <td className="p-3 capitalize">Manual</td>
                    <td className="p-3">
                      {order.proofImageUrl ? (
                        <a
                          href={order.proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={order.proofImageUrl}
                            alt="Proof"
                            width={60}
                            height={60}
                            className="rounded border"
                          />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    {/* <td
                      className={`p-3 font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </td> */}
                    <td className="p-3">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as Order["paymentStatus"]
                          )
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-3">{order.isDone ? "✅" : "❌"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MenuNavbarStoreAdmin>
  );
}
