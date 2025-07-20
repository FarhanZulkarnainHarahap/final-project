"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Address {
  id: string;
  recipient: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
}

export default function AddressPageSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const getAllAddress = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/addresses", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      setAddresses(data);
      console.log("Alamat:", data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Gagal memuat alamat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllAddress();
  }, []);

  const handleSetPrimary = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/addresses/${id}/set-primary`, {
        method: "PATCH",
        credentials: "include",
      });
      // Refresh list
      getAllAddress();
    } catch (err) {
      console.error(err);
      alert("Gagal menjadikan alamat utama.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus alamat ini?")) return;

    try {
      await fetch(`http://localhost:8000/api/v1/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      // Refresh list
      getAllAddress();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus alamat.");
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Alamat Pengiriman</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {addresses.length === 0 && !loading && (
        <p>Belum ada alamat. Tambahkan alamat baru.</p>
      )}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => router.push("/add-address")}
      >
        Tambah Alamat
      </button>

      <ul className="space-y-4">
        {addresses.map((addr) => (
          <li
            key={addr.id}
            className={`border p-3 rounded ${
              addr.isPrimary ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <p className="font-semibold">
              {addr.recipient} {addr.isPrimary && "(Utama)"}
            </p>
            <p>{addr.phone}</p>
            <p>
              {addr.addressLine}, {addr.city}, {addr.province},{" "}
              {addr.postalCode}
            </p>

            <div className="mt-2 flex gap-2">
              {!addr.isPrimary && (
                <button
                  className="text-blue-600 underline"
                  onClick={() => handleSetPrimary(addr.id)}
                >
                  Jadikan Utama
                </button>
              )}
              <button
                className="text-green-600 underline"
                onClick={() => router.push(`/edit-address/${addr.id}`)}
              >
                Edit
              </button>
              <button
                className="text-red-600 underline"
                onClick={() => handleDelete(addr.id)}
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
