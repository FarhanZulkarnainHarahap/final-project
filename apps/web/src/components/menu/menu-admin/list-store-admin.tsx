"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  createdAt: string;
  StoreAddress: {
    Address: {
      city: string;
      province: string;
      address: string;
    };
  }[];
}

interface StoreAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  Store: Store[];
}

export default function StoreAdminPage() {
  const router = useRouter();

  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<StoreAdmin | null>(null);

  useEffect(() => {
    async function fetchStoreAdmins() {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/store-admins",
          {
            withCredentials: true,
          }
        );

        setStoreAdmins(res.data.data);
      } catch (err) {
        console.error("Error fetching store admins:", err);
        alert(
          "Failed to fetch store admins. Please check your authentication."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStoreAdmins();
  }, []);

  const confirmDeleteAdmin = (admin: StoreAdmin) => {
    setAdminToDelete(admin);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!adminToDelete) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/v1/user/${adminToDelete.id}`,
        {
          withCredentials: true,
        }
      );
      alert("Store admin deleted successfully.");
      setStoreAdmins((prev) =>
        prev.filter((admin) => admin.id !== adminToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting store admin:", error);
      alert("Failed to delete store admin.");
    } finally {
      setShowModal(false);
      setAdminToDelete(null);
    }
  };

  const handleUpdateAdmin = (id: string) => {
    router.push(`/dashboard/admin/user-store/edit/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Store Admin Management</h1>
        <Link
          href="/dashboard/admin/user-store/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Store Admin
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading store admins...</div>
        </div>
      ) : storeAdmins.length === 0 ? (
        <p>No store admins found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Username</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left min-w-[200px]">
                  Assigned Store
                </th>
                <th className="border px-4 py-2 text-left">Created At</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storeAdmins.map((admin) => {
                const hasStore = admin.Store && admin.Store.length > 0;
                const store = hasStore ? admin.Store[0] : null;
                const storeAddress = store?.StoreAddress?.[0]?.Address;

                return (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">
                      {admin.firstName} {admin.lastName}
                    </td>
                    <td className="border px-4 py-2">{admin.email}</td>
                    <td className="border px-4 py-2">@{admin.username}</td>
                    <td className="border px-4 py-2">
                      {admin.phoneNumber || "-"}
                    </td>
                    <td className="border px-4 py-2">
                      {hasStore && store ? (
                        <div>
                          <div className="font-medium text-sm">
                            {store.name}
                          </div>
                          {storeAddress && (
                            <div className="text-xs text-gray-600">
                              {storeAddress.city}, {storeAddress.province}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleUpdateAdmin(admin.id)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDeleteAdmin(admin)}
                          className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && adminToDelete && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 border border-gray-300">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete store admin{" "}
              <span className="font-bold">
                {adminToDelete.firstName} {adminToDelete.lastName}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowModal(false);
                  setAdminToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
