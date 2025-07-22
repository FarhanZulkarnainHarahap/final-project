"use client";

import { useState, useEffect } from "react";
import MenuNavbarUser from "@/components/header/header-user/header";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

interface AddressDetail {
  id: string;
  userAddressId: string;
  storeAddressId: string | null;
  address: string;
  destination: string;
  city: string;
  province: string;
  postalCode: string;
  createdAt: string;
}

interface UserAddress {
  id: string;
  userId: string;
  recipient: string;
  isPrimary: boolean;
  Address: AddressDetail[];
}

interface DestinationOption {
  label: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);
  const [formData, setFormData] = useState({
    recipient: "",
    address: "",
    destination: "",
    city: "",
    province: "",
    postalCode: "",
    isPrimary: false,
    destinationId: null,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/addresses", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
      } else {
        setError(data.message || "Failed to fetch addresses.");
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Error fetching addresses.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationSuggestions = async (keyword: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(
        `${baseUrl}/api/v1/rajaongkir/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (res.ok) {
        setDestinationOptions(data);
      } else {
        console.error("Failed to fetch destinations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };

  const setAsPrimary = async (userAddressId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(
        `${baseUrl}/api/v1/addresses/${userAddressId}/set-primary`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Gagal mengatur primary address.");
        return;
      }
      await fetchAddresses();
    } catch (err) {
      console.error("Error setting primary address:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${baseUrl}/api/v1/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchAddresses();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menghapus alamat.");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const handleSave = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
    const endpoint =
      isEditing && selectedAddress
        ? `${baseUrl}/api/v1/addresses/${selectedAddress.Address[0].id}`
        : `${baseUrl}/api/v1/addresses`;
    const method = isEditing ? "PUT" : "POST";
    console.log(formData);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchAddresses();
        setShowModal(false);
        setFormData({
          recipient: "",
          address: "",
          destination: "",
          city: "",
          province: "",
          postalCode: "",
          isPrimary: false,
          destinationId: null,
        });
        setSelectedAddress(null);
        setIsEditing(false);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save address");
      }
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <MenuNavbarUser>
      <main className="bg-[#f7f8fa] min-h-screen text-black flex justify-center">
        <div className="h-fit w-[90%] md:w-[60%] lg:w-[40%] bg-white p-6 rounded-lg shadow-lg border border-black">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-green-800">
              Your Addresses
            </h1>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  recipient: "",
                  address: "",
                  destination: "",
                  city: "",
                  province: "",
                  postalCode: "",
                  isPrimary: false,
                  destinationId: null,
                });
                setShowModal(true);
              }}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full text-sm shadow"
            >
              <FiPlus className="text-lg" /> Add
            </button>
          </div>

          {loading ? (
            <p className="text-center">Loading addresses...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : addresses.length === 0 ? (
            <p className="text-center">No addresses available.</p>
          ) : (
            <ul className="space-y-4">
              {addresses.map((userAddress) => (
                <li
                  key={userAddress.id}
                  className={`transition-all duration-300 p-4 rounded-lg shadow-sm border relative cursor-pointer ${
                    userAddress.isPrimary
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-green-800">
                        {userAddress.recipient || "-"}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {userAddress.Address[0]?.address || "-"}
                      </p>
                      <p className="text-sm text-gray-700">
                        {userAddress.Address[0]?.city || "-"},{" "}
                        {userAddress.Address[0]?.province || "-"},{" "}
                        {userAddress.Address[0]?.postalCode || "-"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => setAsPrimary(userAddress.id)}
                        className="text-xs px-2 py-1 rounded-full border"
                      >
                        {userAddress.isPrimary ? (
                          <span className="text-green-600 border-green-600">
                            PRIMARY
                          </span>
                        ) : (
                          <span className="text-gray-500 border-gray-300">
                            Set Primary
                          </span>
                        )}
                      </button>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAddress(userAddress);
                            setFormData({
                              recipient: userAddress.recipient,
                              address: userAddress.Address[0]?.address || "",
                              destination:
                                userAddress.Address[0]?.destination || "",
                              city: userAddress.Address[0]?.city || "",
                              province: userAddress.Address[0]?.province || "",
                              postalCode:
                                userAddress.Address[0]?.postalCode || "",
                              isPrimary: userAddress.isPrimary,
                              destinationId:
                                userAddress.Address?.[0]?.destinationId,
                            });
                            setIsEditing(true);
                            setShowModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(userAddress.Address[0].id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isEditing ? "Edit Address" : "Add New Address"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <input
                type="text"
                placeholder="Recipient"
                value={formData.recipient}
                onChange={(e) =>
                  setFormData({ ...formData, recipient: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Destination"
                value={formData.destination}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, destination: value });
                  fetchDestinationSuggestions(value);
                }}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              {destinationOptions.map((opt, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData({
                      ...formData,
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
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Province"
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <label className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrimary: e.target.checked })
                  }
                />
                <span>Set as primary</span>
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAddress(null);
                    setIsEditing(false);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MenuNavbarUser>
  );
}
