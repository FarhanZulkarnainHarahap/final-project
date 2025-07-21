"use client";
import Link from "next/link";
import { FaRegUser, FaUser } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";
import SignOut from "./logout";

interface CurrentUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  name: string;
  photo: string;
  provider: "google";
}
export default function LoginPageSection() {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/user/current-user",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setCurrentUser(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    getCurrentUser();
  }, []);

  return (
    <section className="relative">
      {/* {currentUser ? (
        <div></div>>
      ) : ( */}
      <button
        onClick={() => setShowProfilePopup(!showProfilePopup)}
        className="p-2 hover:bg-gray-800 rounded-full transition"
      >
        <FaRegUser className="text-lg text-white" />
      </button>

      {/* )} */}

      {showProfilePopup && (
        <div className="fixed top-0 right-0 h-screen w-full md:w-[350px] bg-white/40 backdrop-blur-md text-white shadow-2xl transition-all duration-300 ease-in-out  z-[100] rounded-l-xl">
          <div className="flex justify-start mb-4 bg-green-900 w-full p-6">
            <button
              onClick={() => setShowProfilePopup(false)}
              className="hover:text-red-400 transition"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          {currentUser ? (
            <div className="flex flex-col h-[90vh] justify-between">
              {/* Bagian Atas */}
              <div className="flex flex-col items-center space-y-6 p-6">
                {/* Avatar */}
                <div className="bg-gradient-to-tr from-teal-500 to-green-900 rounded-full p-4 shadow-lg">
                  <FaUser size={64} className="text-green" />
                </div>
                {/* Nama & Email */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-black">
                    {currentUser.name}
                  </h2>
                  <p className="text-sm text-black">{currentUser.email}</p>
                </div>
                {/* Link */}
                <div className="w-full flex flex-col space-y-2 mt-4 text-black">
                  <Link
                    href="/dashboard/user/profile"
                    className="px-4 py-2 hover:bg-gray-400 hover:text-green-900 cursor-pointer block rounded-md text-center transition"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/user/my-orders"
                    className="px-4 py-2 hover:bg-gray-400 hover:text-green-900 cursor-pointer block rounded-md text-center transition"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/settings"
                    className="px-4 py-2 hover:bg-gray-400 hover:text-green-900 cursor-pointer block rounded-md text-center transition"
                  >
                    Settings
                  </Link>
                </div>
              </div>

              {/* Bagian Bawah: Tombol Sign Out */}
              <div className="p-6 bg-green-900 w-full">
                <div>
                  <SignOut />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 items-center p-6">
              <Link
                href="/auth/login"
                className="w-full text-center bg-gradient-to-r from-blue-500 to-blue-700 py-2 rounded-xl hover:opacity-90 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="w-full text-center bg-gradient-to-r from-green-500 to-green-700 py-2 rounded-xl hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
