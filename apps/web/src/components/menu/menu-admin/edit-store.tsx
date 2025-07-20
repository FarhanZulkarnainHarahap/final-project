"use client";

import { Dispatch, SetStateAction } from "react";

interface EditStoreSectionProps {
  editedName: string;
  setEditedName: Dispatch<SetStateAction<string>>;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
  city: string;
  setCity: Dispatch<SetStateAction<string>>;
  province: string;
  setProvince: Dispatch<SetStateAction<string>>;
  postalCode: string;
  setPostalCode: Dispatch<SetStateAction<string>>;
  destination: string;
  setDestination: Dispatch<SetStateAction<string>>;
  latitude: number;
  setLatitude: Dispatch<SetStateAction<number>>;
  longitude: number;
  setlongitude: Dispatch<SetStateAction<number>>;
  handleUpdateStore: () => Promise<void>;
  setShowEditModal: Dispatch<SetStateAction<boolean>>;
}

export default function EditStoreSection({
  editedName,
  setEditedName,
  address,
  setAddress,
  city,
  setCity,
  province,
  setProvince,
  postalCode,
  setPostalCode,
  destination,
  setDestination,
  latitude,
  setLatitude,
  longitude,
  setlongitude,
  handleUpdateStore,
  setShowEditModal,
}: EditStoreSectionProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Store</h2>
        <div className="space-y-3">
          <input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Name"
            className="w-full p-2 border"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full p-2 border"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full p-2 border"
          />
          <input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="Province"
            className="w-full p-2 border"
          />
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Postal Code"
            className="w-full p-2 border"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination"
            className="w-full p-2 border"
          />
          <input
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            type="number"
            placeholder="Latitude"
            className="w-full p-2 border"
          />
          <input
            value={longitude}
            onChange={(e) => setlongitude(parseFloat(e.target.value))}
            type="number"
            placeholder="longitude"
            className="w-full p-2 border"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStore}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
