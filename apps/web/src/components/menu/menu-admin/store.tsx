"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateStoreSection from "./create-newstore";
import EditStoreSection from "./edit-store";

interface StoreAddress {
  id: string;
  latitude: number;
  longitude: number;
  Address: {
    id: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    destination: string;
  }[];
}

interface Store {
  id: string;
  name: string;
  StoreAddress: StoreAddress[];
}

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState<string>("");
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setlongitude] = useState<number>(0);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/stores/super-admin`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch stores");

      const data = await response.json();
      setStores(data.data);
    } catch (error) {
      console.log(error);
      setError("Gagal mengambil data toko.");
    }
  };

  const handleOpenEditModal = (store: Store) => {
    const addr = store.StoreAddress[0]?.Address[0];
    setEditingStore(store);
    setEditedName(store.name);
    setAddress(addr?.address || "");
    setCity(addr?.city || "");
    setProvince(addr?.province || "");
    setPostalCode(addr?.postalCode || "");
    setDestination(addr?.destination || "");
    setLatitude(store.StoreAddress[0]?.latitude || 0);
    setlongitude(store.StoreAddress[0]?.longitude || 0);
    setShowEditModal(true);
  };

  const handleUpdateStore = async () => {
    if (!editingStore) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const response = await fetch(
        `${baseUrl}/api/v1/stores/super-admin/${editingStore.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: editedName,
            address,
            city,
            province,
            postalCode,
            destination,
            latitude,
            longitude,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update store");

      fetchStores();
      setShowEditModal(false);
      setEditingStore(null);
    } catch (error) {
      console.log(error);
      setError("Gagal memperbarui toko.");
    }
  };

  const handleDelete = async (storeId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const response = await fetch(
        `${baseUrl}/api/v1/stores/super-admin/${storeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete store");

      setStores(stores.filter((store) => store.id !== storeId));
    } catch (error) {
      console.log(error);
      setError("Gagal menghapus toko.");
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-xl text-red-500">{error}</span>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Store Management</h1>
      <div className="text-center mb-6">
        <CreateStoreSection onStoreCreated={fetchStores} />
      </div>
      {stores.length > 0 ? (
        <ul className="space-y-4">
          {stores.map((store) => (
            <li
              key={store.id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow-md"
            >
              <div>
                <h3 className="text-xl font-semibold">{store.name}</h3>
                <p className="text-gray-600">
                  {store.StoreAddress[0]?.Address[0]?.address},{" "}
                  {store.StoreAddress[0]?.Address[0]?.city},{" "}
                  {store.StoreAddress[0]?.Address[0]?.province}
                </p>
                <p className="text-gray-500">
                  {store.StoreAddress[0]?.Address[0]?.postalCode}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  href={`/dashboard/admin/store/${store.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  View Store
                </Link>
                <button
                  onClick={() => handleOpenEditModal(store)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Edit Store
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Store
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No stores available.</p>
      )}

      {showEditModal && editingStore && (
        <EditStoreSection
          editedName={editedName}
          setEditedName={setEditedName}
          address={address}
          setAddress={setAddress}
          city={city}
          setCity={setCity}
          province={province}
          setProvince={setProvince}
          postalCode={postalCode}
          setPostalCode={setPostalCode}
          destination={destination}
          setDestination={setDestination}
          latitude={latitude}
          setLatitude={setLatitude}
          longitude={longitude}
          setlongitude={setlongitude}
          handleUpdateStore={handleUpdateStore}
          setShowEditModal={setShowEditModal}
        />
      )}
    </div>
  );
}
