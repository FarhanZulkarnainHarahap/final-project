"use client";

import { useState } from "react";

interface DestinationOption {
  label: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

interface CreateStoreSectionProps {
  onStoreCreated?: () => void;
}

interface StoreInput {
  name: string;
  address: string;
  destination: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export default function CreateStoreSection({
  onStoreCreated,
}: CreateStoreSectionProps) {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setlongitude] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);

  const [newStore, setNewStore] = useState<StoreInput>({
    name: "",
    address: "",
    destination: "",
    city: "",
    province: "",
    postalCode: "",
    latitude: 0,
    longitude: 0,
  });

  const handleChange = <K extends keyof StoreInput>(
    key: K,
    value: StoreInput[K]
  ) => {
    setNewStore((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Latitude and Longitude must be within valid ranges.");
      return;
    }

    const updatedStore = { ...newStore, latitude, longitude };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/stores/super-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedStore),
          credentials: "include",
        }
      );

      if (response.ok) {
        await response.json();
        setNewStore({
          name: "",
          address: "",
          destination: "",
          city: "",
          province: "",
          postalCode: "",
          latitude: 0,
          longitude: 0,
        });
        setShowModal(false);
        setSuccess("Toko berhasil dibuat!");
        if (onStoreCreated) onStoreCreated();
      } else {
        setError("Gagal membuat toko. Pastikan semua data sudah benar.");
      }
    } catch (error) {
      console.error(error);
      setError("Gagal membuat toko. Pastikan semua data sudah benar.");
    }
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const fetchDestinationSuggestions = async (keyword: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(
        `${baseUrl}/api/v1/rajaongkir/search?keyword=${encodeURIComponent(
          keyword
        )}`
      );
      const data = await res.json();
      if (res.ok) setDestinationOptions(data);
      else console.error("Failed to fetch destinations:", data.message);
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Create New Store
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">Create Store</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(
                ["name", "address", "city", "province", "postalCode"] as const
              ).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={newStore[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              ))}

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Destination
                </label>
                <input
                  type="text"
                  value={newStore.destination}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange("destination", value);
                    fetchDestinationSuggestions(value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                {destinationOptions.map((opt, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setNewStore({
                        ...newStore,
                        destination: opt.label,
                        city: opt.city_name,
                        province: opt.province_name,
                        postalCode: opt.zip_code,
                      });
                      setDestinationOptions([]);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  longitude
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setlongitude(parseFloat(e.target.value))}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Create Store
              </button>
            </form>

            {error && <div className="mt-4 text-red-500">{error}</div>}
            {success && <div className="mt-4 text-green-500">{success}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
