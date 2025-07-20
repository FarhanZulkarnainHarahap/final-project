import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";
import StoreAdminList from "@/components/menu/menu-admin/list-store-admin";

export default function ProductPage() {
  return (
    <MenuNavbarAdmin>
      <StoreAdminList />
    </MenuNavbarAdmin>
  );
}
