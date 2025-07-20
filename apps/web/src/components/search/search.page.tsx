"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function SearchSection() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="flex-1">
      <form
        onSubmit={handleSearch}
        className="flex rounded overflow-hidden bg-white"
      >
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 px-4 py-2 text-black outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-black px-4">
          <FiSearch className="text-white" />
        </button>
      </form>
    </div>
  );
}
