import MenuNavbarStoreAdmin from "@/components/header/header-admin-store";
import DashboardProducts from "@/components/menu/menu-store-admin/dashboard";

export default function HomeAdmin() {
  return (
    <MenuNavbarStoreAdmin>
      <DashboardProducts />
    </MenuNavbarStoreAdmin>
  );
}
