"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function User() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function getAllUser() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/user");
        const data = await res.json();
        console.log("API Response:", data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.error("Format data API tidak sesuai");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    getAllUser();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Super Admin</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border-b">ID</th>
              <th className="text-left px-4 py-2 border-b">Name</th>
              <th className="text-left px-4 py-2 border-b">Email</th>
              <th className="text-left px-4 py-2 border-b">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Tidak ada data user.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{user.id}</td>
                  <td className="px-4 py-2 border-b">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-2 border-b">{user.email}</td>
                  <td className="px-4 py-2 border-b">{user.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
