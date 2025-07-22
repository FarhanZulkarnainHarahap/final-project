"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";

interface Store {
  id: string;
  name: string;
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

export default function EditStoreAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    storeId: "",
  });

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminData, setAdminData] = useState<StoreAdmin | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch store admin data
        const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
        const adminResponse = await fetch(
          `${baseUrl}/api/v1/user/store-admins/${id}`,
          {
            credentials: "include",
          }
        );

        if (adminResponse.ok) {
          const adminResult = await adminResponse.json();
          const admin = adminResult.data;
          setAdminData(admin);

          console.log("Fetched admin data:", admin); // Debug log
          console.log("Admin stores:", admin.Store); // Debug log

          // Populate form with existing data
          const currentStoreId =
            admin.Store && admin.Store.length > 0 ? admin.Store[0].id : "";
          console.log("Current store ID:", currentStoreId); // Debug log

          setFormData({
            firstName: admin.firstName || "",
            lastName: admin.lastName || "",
            email: admin.email || "",
            username: admin.username || "",
            phoneNumber: admin.phoneNumber || "",
            storeId: currentStoreId,
          });
        } else {
          alert("Failed to fetch store admin data.");
          router.push("/dashboard/admin/user-store");
          return;
        }

        // Fetch available stores
        const storesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/stores`,
          {
            credentials: "include",
          }
        );

        if (storesResponse.ok) {
          const storesResult = await storesResponse.json();
          console.log("Fetched stores:", storesResult.data); // Debug log
          setStores(storesResult.data || []);
        } else {
          console.error("Failed to fetch stores"); // Debug log
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Failed to load data.");
        router.push("/dashboard/admin/user-store");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`); // Debug log
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        storeId: formData.storeId || null, // Send null instead of undefined for empty store
      };

      console.log("Sending payload:", payload); // Debug log
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const response = await fetch(
        `${baseUrl}/api/v1/user/store-admins/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      console.log("Response:", responseData); // Debug log

      if (response.ok) {
        alert("Store admin updated successfully!");
        router.push("/dashboard/admin/user-store");
      } else {
        const errorMessage =
          responseData.message || "Failed to update store admin.";
        alert(`Error: ${errorMessage}`);
        console.error("Update failed:", responseData);
      }
    } catch (error) {
      console.error("Error updating store admin:", error);
      alert("Failed to update store admin. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MenuNavbarAdmin>
        <section className="max-w-2xl mx-auto p-4">
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading store admin data...</div>
          </div>
        </section>
      </MenuNavbarAdmin>
    );
  }

  return (
    <MenuNavbarAdmin>
      <section className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Edit Store Admin</h1>
          <Link
            href="/dashboard/admin/user-store"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            ← Back to List
          </Link>
        </div>

        {adminData && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800">Current Admin Info</h3>
            <p className="text-sm text-blue-700">
              Editing: {adminData.firstName} {adminData.lastName} (
              {adminData.email})
            </p>
            <p className="text-sm text-blue-700">
              Role: {adminData.role} | Created:{" "}
              {new Date(adminData.createdAt).toLocaleDateString("id-ID")}
            </p>
            {adminData?.Store && adminData.Store.length > 0 && (
              <p className="text-sm text-blue-700">
                Currently assigned to:{" "}
                <strong>{adminData.Store[0].name}</strong>
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block mb-1 font-medium">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block mb-1 font-medium">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="username" className="block mb-1 font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block mb-1 font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Store Assignment Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Store Assignment
            </h2>

            <div>
              <label htmlFor="storeId" className="block mb-1 font-medium">
                Assign to Store (Optional)
              </label>
              <select
                id="storeId"
                name="storeId"
                value={formData.storeId}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">No store assignment</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Change the store assignment for this admin.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Link
              href="/dashboard/admin/user-store"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Updating..." : "Update Store Admin"}
            </button>
          </div>
        </form>
      </section>
    </MenuNavbarAdmin>
  );
}
