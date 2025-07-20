import MenuNavbarUser from "@/components/header/header-user/header";
import ProductHomePage from "@/components/menu/menu-user/product-list";

export default function HomePage() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <ProductHomePage />
      </MenuNavbarUser>
    </main>
  );
}
