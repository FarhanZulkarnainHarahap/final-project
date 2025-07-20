import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";

import StoreInventoryHistoryPage from "@/components/menu/menu-store-admin/inventory-management";

export default function StoreInventory() {
  return (
    <MenuNavbarStoreAdmin>
      <StoreInventoryHistoryPage />
    </MenuNavbarStoreAdmin>
  );
}
