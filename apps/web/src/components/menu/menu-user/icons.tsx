import Image from "next/image";
import Link from "next/link";

export default function Icons() {
  return (
    <div className="grid grid-cols-[1fr_30%] gap-5">
      <div className="justify-center">
        <div className="grid grid-rows-2 gap-5">
          <div>
            <div className="bg-green-800 rounded-xl p-6 text-white flex flex-col justify-center w-full h-full transition duration-300 hover:scale-[1.01] hover:brightness-105">
              <p className="italic text-sm">Market Snap</p>
              <h1 className="text-4xl font-bold mt-2 mb-4">
                Everything You Need, Just Nearby.
              </h1>
              <p className="text-sm leading-relaxed">
                Market Snap — Semua yang Kamu Butuhkan, dari Toko Terdekat,
                Langsung ke Tanganmu.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Link href="/dashboard/user/product">
              <div className="relative bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center transition duration-300 hover:brightness-105 hover:scale-105">
                <div className="relative w-28 h-28">
                  <Image
                    src="/product.png"
                    alt="Product"
                    fill
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold mt-4">Product</h2>
                <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                  Shop Now
                </button>
              </div>
            </Link>
            <div className="relative bg-cyan-600 text-white rounded-xl p-6 flex flex-col items-center justify-center transition duration-300 hover:brightness-105 hover:scale-105">
              <div className="relative w-28 h-28 mb-4">
                <Image
                  src="/coupon.png"
                  alt="Coupon"
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold">Coupon</h2>
              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                Get Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="justify-center">
        <div className="grid gap-y-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center transition duration-300 hover:brightness-105 hover:scale-105"
            >
              <div className="relative w-28 h-28 mb-4">
                <Image
                  src="/discount-product.png"
                  alt="Discount Product"
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold">Discount Product</h2>
              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                Get Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
