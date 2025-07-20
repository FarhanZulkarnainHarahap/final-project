import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";
import RegisterUser from "@/components/menu/menu-admin/register-user";
import User from "@/components/menu/menu-admin/user";

export default function UserAdmin() {
  return (
    <MenuNavbarAdmin>
      <RegisterUser />
      <User />
    </MenuNavbarAdmin>
  );
}
