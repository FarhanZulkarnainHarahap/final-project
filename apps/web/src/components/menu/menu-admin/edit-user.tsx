"use client";

import React from "react";

interface Props {
  userEmail: string;
  roleInput: string;
  onRoleChange: (role: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const allowedRoles = ["USER", "STORE_ADMIN", "SUPER_ADMIN"];

export default function UpdateUserModal({
  userEmail,
  roleInput,
  onRoleChange,
  onClose,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Role for {userEmail}</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Role</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={roleInput}
            onChange={(e) => onRoleChange(e.target.value)}
          >
            <option value="">Pilih role...</option>
            {allowedRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={!roleInput}
            className={`px-4 py-2 rounded text-white ${
              roleInput
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
