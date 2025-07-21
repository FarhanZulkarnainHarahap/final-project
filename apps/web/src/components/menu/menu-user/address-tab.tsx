"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Address {
  id: string;
  recipient: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
}
interface DestinationOption {
  label: string;
  city_name: string;
  province_name: string;
  id: string;
  zip_code: string;
}

export default function AddressTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);
  const [newAddress, setNewAddress] = useState({
    recipient: "",
    address: "",
    destination: "",
    city: "",
    province: "",
    postalCode: "",
    destinationId: "",
    isPrimary: false,
  });
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
      getAllAddress();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus alamat.");
    }
  };
  const fetchAddresses = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/addresses", {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setAddresses(data); // ✅ Must return array of Address
      } else {
        setError(data.message || "Failed to fetch addresses.");
      }
    } catch (error) {
      setError("Error fetching addresses.");
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationSuggestions = async (keyword: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/rajaongkir/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (res.ok) {
        setDestinationOptions(data); // misalnya array destinasi
      } else {
        console.error("Failed to fetch destinations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNewAddress = () => {
    setIsAddingAddress(true);
  };

  const handleCloseForm = () => {
    setIsAddingAddress(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/v1/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
        credentials: "include",
      });

      if (response.ok) {
        const addedAddress = await response.json();
        console.log("🚀 Added Address:", addedAddress);

        // Reset form
        setNewAddress({
          recipient: "",
          address: "",
          destination: "",
          city: "",
          province: "",
          postalCode: "",
          destinationId: "",
          isPrimary: false,
        });

        setIsAddingAddress(false);

        // ✅ Refresh address list from backend
        await fetchAddresses();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to add address.");
      }
    } catch (error) {
      setError("Error adding address.");
      console.error("Error adding address:", error);
    }
  };

  if (loading) return <p className="text-center">Loading addresses...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="mt-6 text-center">
        {!isAddingAddress && (
          <button
            onClick={handleAddNewAddress}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add New Address
          </button>
        )}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {addresses.length === 0 && !loading && (
        <p>No address yet. Add a new address.</p>
      )}

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
              {addr.address}, {addr.city}, {addr.province}, {addr.postalCode}
            </p>

            <div className="mt-2 flex gap-3">
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
      {isAddingAddress && (
        <div className="fixed inset-0 bg-gray-600/10 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[40%]">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Add New Address
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Recipient
                </label>
                <input
                  type="text"
                  value={newAddress.recipient}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      recipient: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Address Line
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Destination
                </label>
                <input
                  type="text"
                  value={newAddress.destination || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewAddress({ ...newAddress, destination: value });
                    fetchDestinationSuggestions(value); // fetch suggestion saat user ketik
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                {/* Optional: tampilkan list suggestion */}
                {destinationOptions.length > 0 && (
                  <ul className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto mt-2 bg-white shadow-md z-10 relative">
                    {destinationOptions.map((opt, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setNewAddress({
                            ...newAddress,

                            destination: opt.label,
                            city: opt.city_name,
                            province: opt.province_name,
                            postalCode: opt.zip_code,
                            destinationId: opt.id,
                          });
                          setDestinationOptions([]);
                        }}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">City</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Province
                </label>
                <input
                  type="text"
                  value={newAddress.province}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      province: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={newAddress.postalCode}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      postalCode: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Destination ID
                </label>
                <input
                  type="text"
                  value={newAddress.destinationId}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      destinationId: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  checked={newAddress.isPrimary}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isPrimary: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label className="text-sm">Set as Primary Address</label>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="bg-red-600 text-white px-4 py-2 rounded ml-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
