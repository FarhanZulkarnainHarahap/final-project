"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  usersPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  message: string;
  data: User[];
  pagination: PaginationInfo;
  filters: {
    search: string | null;
    role: string | null;
    sortBy: string;
    sortOrder: string;
  };
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: search,
        role: roleFilter,
        sortBy: "createdAt",
        sortOrder: sortOrder,
      });
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${baseUrl}/api/v1/user?${params}`);
      const data: ApiResponse = await res.json();

      if (data && data.data) {
        setUsers(data.data);
        setPagination(data.pagination);
      } else {
        console.error("Format data API tidak sesuai");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter, sortOrder]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;

    let start = Math.max(1, current - 2);
    const end = Math.min(totalPages, start + 4);

    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);

    return pages;
  };

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        />

        <div className="flex gap-2 w-full sm:w-1/3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border px-2 py-2 rounded text-sm w-1/2"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="STORE_ADMIN">Store Admin</option>
          </select>

          <button
            onClick={toggleSortOrder}
            className="border px-3 py-2 rounded text-sm w-1/2 bg-blue-100 hover:bg-blue-200"
          >
            Sort Created {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <button
          onClick={() => {
            setSearch("");
            setRoleFilter("");
            setCurrentPage(1);
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        Sorted by created date ({sortOrder})
      </p>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border-b">Username</th>
              <th className="text-left px-4 py-2 border-b">Name</th>
              <th className="text-left px-4 py-2 border-b">Email</th>
              <th className="text-left px-4 py-2 border-b">Role</th>
              <th className="text-left px-4 py-2 border-b">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Tidak ada data user.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{user.username}</td>
                  <td className="px-4 py-2 border-b">
                    {user.firstName ?? "-"} {user.lastName ?? ""}
                  </td>
                  <td className="px-4 py-2 border-b">{user.email}</td>
                  <td className="px-4 py-2 border-b text-sm">{user.role}</td>
                  <td className="px-4 py-2 border-b">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex flex-wrap gap-2 items-center justify-center sm:justify-between text-sm">
          <div className="text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`px-3 py-1 rounded ${
                pagination.hasPrevPage
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  page === pagination.currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-3 py-1 rounded ${
                pagination.hasNextPage
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
