"use client";

import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  async function handleClick() {
    try {
      await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "DELETE",
        credentials: "include",
      });

      // Paksa reload halaman agar session/cookie diperbarui
      window.location.href = "/";
      // atau jika kamu ingin reload tanpa pindah halaman:
      // window.location.reload();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition"
    >
      <FiLogOut size={18} />
      Sign Out
    </button>
  );
}
