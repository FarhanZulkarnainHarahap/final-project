"use client";

import MenuNavbarUser from "@/components/header/header-user/header";
import MyOrdersSection from "@/components/menu/menu-user/my-orders";

export default function MyOrders() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <MyOrdersSection />
      </MenuNavbarUser>
    </main>
  );
}
