import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";
import InventoryHistoryPage from "@/components/menu/menu-admin/inventory-management";

export default function ProductPage() {
  return (
    <MenuNavbarAdmin>
      <InventoryHistoryPage />
    </MenuNavbarAdmin>
  );
}
