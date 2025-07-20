import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const pathname = req.nextUrl.pathname;

  // Halaman produk bisa diakses oleh siapa saja (termasuk yang belum login)
  if (pathname.startsWith("/dashboard/user/product")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/dashboard/user/product-store")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/dashboard/user/best-deals")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/dashboard/user/contact-us")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/dashboard/user/about")) {
    return NextResponse.next();
  }
  // Halaman checkout di dalam /dashboard/user hanya bisa diakses oleh yang sudah login
  if (pathname.startsWith("/dashboard/user/checkout") && !accessToken) {
    return NextResponse.redirect("${req.nextUrl.origin}/auth/login");
  }

  // Tidak perlu token untuk halaman auth/login
  if (!accessToken && pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Redirect ke login jika tidak ada token
  if (!accessToken) {
    return NextResponse.redirect(`${req.nextUrl.origin}/auth/login`);
  }

  const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!secret || secret.trim() === "") {
    console.error("🚨 Secret Code is not defined or empty!");
    return new NextResponse("Server misconfiguration: Secret Code missing", {
      status: 500,
    });
  }

  let payload;
  try {
    const verified = await jwtVerify(
      accessToken,
      new TextEncoder().encode(secret)
    );
    payload = verified.payload;
  } catch (err) {
    console.error("Secret Code verification failed:", err);
    return NextResponse.redirect(`${req.nextUrl.origin}/auth/login`);
  }

  const role = payload?.role;

  // Role-based access control
  if (
    (role === "SUPER_ADMIN" && pathname.startsWith("/dashboard/admin")) ||
    (role === "USER" && pathname.startsWith("/dashboard/user")) ||
    (role === "STORE_ADMIN" && pathname.startsWith("/dashboard/admin-store"))
  ) {
    return NextResponse.next();
  } else {
    return new NextResponse("Forbidden access", { status: 403 });
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Mencakup semua halaman dalam dashboard
    "/auth/:path*",
    "/dashboard/user/product/:path*", // Memastikan akses produk terbuka untuk semua
    "/dashboard/user/checkout", // Hanya yang sudah login bisa mengakses halaman checkout
  ],
};
