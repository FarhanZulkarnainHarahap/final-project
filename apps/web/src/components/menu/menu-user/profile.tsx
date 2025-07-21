"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUser, FaEdit } from "react-icons/fa";

interface User {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
}
export default function ProfileSection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [refreshData, setRefreshData] = useState(false); // State to trigger re-fetch of user data

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [formData, setFormData] = useState<User>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    isVerified: false,
  });

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      setLoading(true); // Set loading to true while fetching data
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/user/current-user",
          {
            credentials: "include", // Send the access token cookie
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUser(data.data); // Update the user state with new data
          setFormData(data.data); // Update the formData state with the current user data
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    }

    fetchUser();
  }, [refreshData]); // Re-fetch when `refreshData` changes

  // Resend verification email
  const handleResendVerification = async () => {
    setVerifying(true);
    setVerifyMessage(null);

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/verify-email",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();
      setVerifyMessage(data.message || "Verification email has been sent.");
      // Trigger re-fetch of user data after verification
      setRefreshData(!refreshData);
    } catch (error) {
      console.error("Error resending verification email:", error);
      setVerifyMessage("Failed to send verification email.");
    } finally {
      setVerifying(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  // Show error if no user data is found
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Failed to load user data.</p>
      </div>
    );
  }

  // Handle the modal open/close
  const handleEditClick = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission to update user data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/user/current-user",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include", // Send the access token cookie
        }
      );

      const data = await res.json();
      if (res.ok) {
        setVerifyMessage("Profile updated successfully.");
        setRefreshData(!refreshData); // Trigger re-fetch
        setIsModalOpen(false); // Close the modal after successful update
      } else {
        setVerifyMessage(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setVerifyMessage("Error updating user profile.");
    }
  };

  return (
    <div>
      {/* Navigation */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 px-10 justify-center">
        <div className="grid grid-cols-2 items-center justify-center space-x-4 text-center">
          <Link
            href="/dashboard/user/profile"
            className="hover:text-green-900 bg-green-600 text-white px-4 py-2 rounded"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/user/profile/address"
            className="hover:text-green-900 bg-green-600 text-white px-4 py-2 rounded"
          >
            Address
          </Link>
        </div>
      </div>

      {/* User Info */}
      <div className="max-w-md mx-auto pt-6 pb-6 bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className="bg-gradient-to-tr from-teal-500 to-green-900 rounded-full p-4 shadow-md">
            <FaUser size={48} className="text-white" />
          </div>
          {/* Name */}
          <h2 className="text-2xl font-semibold text-center">
            {user.firstName} {user.lastName}
          </h2>
          {/* Username */}
          <p className="text-gray-500">@{user.username}</p>
        </div>

        {/* User Info */}
        <div className="space-y-4 pt-6">
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="text-lg font-medium">{user.firstName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="text-lg font-medium">{user.lastName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="text-lg font-medium">{user.phoneNumber}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>

          {/* Email Verification Status */}
          <div className="text-sm mt-4">
            <p className="text-sm text-gray-500">Email Status</p>
            {user.isVerified ? (
              <div>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  ✅ Verified
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 mt-2">
                <span className="text-red-600 font-semibold">Not Verified</span>
                <button
                  onClick={handleResendVerification}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
                  disabled={verifying}
                >
                  {verifying ? "Sending..." : "Verify Account"}
                </button>
                {verifyMessage && (
                  <p className="text-sm mt-1 text-gray-700">{verifyMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Button with Pencil Icon */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleEditClick}
            className="text-green-600 flex items-center gap-2 hover:text-green-900"
          >
            <FaEdit size={18} />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Modal for Editing Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-gray-500">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-900"
                  required
                />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
