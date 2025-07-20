"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Address {
  id: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  destination: string;
}

interface AddressData {
  id: string;
  recipient: string;
  isPrimary: boolean;
  Address: Address[]; // Address is an array of objects
}

export default function AddressPageSection() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Fetch addresses
  const getAllAddress = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/addresses", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data: AddressData[] = await res.json(); // Type the response
      setAddresses(data); // Update the state with fetched addresses
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Gagal memuat alamat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllAddress();
  }, []); // Fetch on mount

  // Set a specific address as primary
  const handleSetPrimary = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/addresses/${id}/primary`, {
        method: "PUT",
        credentials: "include",
      });
      // Refresh list after setting primary
      getAllAddress();
    } catch (err) {
      console.error(err);
      alert("Gagal menjadikan alamat utama.");
    }
  };

  // Delete an address
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus alamat ini?")) return;

    try {
      await fetch(`http://localhost:8000/api/v1/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      // Refresh list after deletion
      getAllAddress();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus alamat.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Alamat Pengiriman</h2>

      {/* Loading and Error States */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* No addresses found */}
      {addresses.length === 0 && !loading && (
        <p>Belum ada alamat. Tambahkan alamat baru.</p>
      )}

      {/* Button to Add Address */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => router.push("/add-address")}
      >
        Tambah Alamat
      </button>

      {/* Address List */}
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

            {/* Loop through the Address array and display the address details */}
            {addr.Address.map((address) => (
              <div key={address.id}>
                <p>{address.address}</p>
                <p>
                  {address.city}, {address.province}, {address.postalCode}
                </p>
                <p>{address.destination}</p>
              </div>
            ))}

            {/* Action Buttons */}
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
