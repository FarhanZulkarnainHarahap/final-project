"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  createdBy?: {
    username: string;
  };
  ownedBy?: {
    username: string;
  };
}

interface User {
  id: string;
  username: string;
  role: string;
}

export default function StorePageSection() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [storeAdmins, setStoreAdmins] = useState<User[]>([]);

  // Form fields
  const [targetUsername, setTargetUsername] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/stores", {
          withCredentials: true,
        });
        setStores(res.data.data);
      } catch (err) {
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchStoreAdmins() {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/users?role=STORE_ADMIN",
          { withCredentials: true }
        );
        setStoreAdmins(res.data.data);
      } catch (err) {
        console.error("Error fetching store admins:", err);
      }
    }

    fetchStores();
    fetchStoreAdmins();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/v1/stores",
        {
          targetUsername,
          name,
          address,
          city,
          province,
          postalCode,
        },
        { withCredentials: true }
      );

      setShowModal(false);

      const res = await axios.get("http://localhost:8000/api/v1/stores", {
        withCredentials: true,
      });
      setStores(res.data.data);

      // Reset form
      setTargetUsername("");
      setName("");
      setAddress("");
      setCity("");
      setProvince("");
      setPostalCode("");
    } catch (error) {
      console.error("Error creating store:", error);
      alert("Failed to create store.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">All Stores</h1>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
      >
        Create New Store
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">Create New Store</h2>
            <form onSubmit={handleCreateStore} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">
                  Select Store Admin
                </label>
                <select
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select User --</option>
                  {storeAdmins.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Store Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stores.length === 0 ? (
        <p>No stores found. You can create one.</p>
      ) : (
        <ul className="space-y-5">
          {stores.map((store) => (
            <li
              key={store.id}
              className="border border-gray-300 rounded-lg p-4"
            >
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="mt-1 text-gray-700">
                {store.address}, {store.city}, {store.province},{" "}
                {store.postalCode}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Owner:</span>{" "}
                {store.ownedBy?.username ?? "Unknown"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Created By:</span>{" "}
                {store.createdBy?.username ?? "Unknown"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
