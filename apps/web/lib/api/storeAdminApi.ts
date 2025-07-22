interface StoreAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
}

interface StoreAdmin extends StoreAdminInput {
  name: string;
  id: string;
  createdAt?: string;
}

// export const API_BASE_URL = "http://localhost:8000/api/v1/admin";

/**
 * Ambil semua Store Admin
 */
export async function getAllStoreAdmins(): Promise<StoreAdmin[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/admin`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch store admins");
  return res.json();
}

/**
 * Buat Store Admin baru
 */
export async function createStoreAdmin(
  data: StoreAdminInput
): Promise<StoreAdmin> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create store admin");
  return res.json();
}

/**
 * Perbarui Store Admin
 */
export async function updateStoreAdmin(
  id: string,
  data: StoreAdminInput
): Promise<StoreAdmin> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/admin/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to update store admin");
  return res.json();
}

/**
 * Hapus Store Admin
 */
export async function deleteStoreAdmin(
  id: string
): Promise<{ message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/admin/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to delete store admin");
  return res.json();
}
