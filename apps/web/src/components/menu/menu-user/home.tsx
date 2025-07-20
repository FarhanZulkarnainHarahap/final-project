import Image from "next/image";

export default function HomePageUser() {
  return (
    <div>
      <div className="grid grid-cols-[1fr_30%] px-40">
        <div className="justify-center p-6">
          <div className="grid grid-rows-2 gap-5">
            <div className="">
              <div className="bg-green-800 rounded-xl p-6 text-white flex flex-col justify-center w-full h-full">
                <p className="italic text-sm">FARM FRESH</p>
                <h1 className="text-4xl font-bold mt-2 mb-4">
                  Organic & Healthy
                </h1>
                <p className="text-sm leading-relaxed">
                  Donec sed mauris non quam molestie imperdiet. Integer
                  ullamcorper, purus sit amet hendrerit tincidunt
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center">
                <Image
                  src="/pineapple.png"
                  alt="Pineapple"
                  width={112}
                  height={112}
                  className="mb-4"
                />
                <h2 className="text-2xl font-bold">Healthy Juices</h2>
                <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                  Shop Now
                </button>
              </div>

              <div className="bg-cyan-600 text-white rounded-xl p-6 flex flex-col items-center justify-center">
                <Image
                  src="/pineapple.png"
                  alt="Pineapple"
                  width={112}
                  height={112}
                  className="mb-4"
                />
                <h2 className="text-2xl font-bold">Farm Fresh</h2>
                <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="justify-center p-6 ">
          <div className="grid gap-y-5">
            <div className="bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center">
              <Image
                src="/pineapple.png"
                alt="Pineapple"
                width={112}
                height={112}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold">Organic Fruits</h2>
              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                Shop Now
              </button>
            </div>
            <div className="bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center">
              <Image
                src="/pineapple.png"
                alt="Pineapple"
                width={112}
                height={112}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold">Organic Fruits</h2>
              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Best Sellers Section */}
      <div className="py-8 px-40 w-full bg-blue-100">
        <h2 className="text-left text-3xl font-bold mb-6">Best Sellers</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <Image
              src="/tomato.png"
              alt="Tomato"
              width={150}
              height={150}
              className="mb-4"
            />
            <p className="text-xl font-bold">Omnis iste natus</p>
            <p className="text-green-600">-40%</p>
            <p className="text-xl font-semibold">$40.00 - $300.00</p>
            <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
              Select options
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <Image
              src="/juice.png"
              alt="Juice"
              width={150}
              height={150}
              className="mb-4"
            />
            <p className="text-xl font-bold">Ut perspiciatis</p>
            <p className="text-red-600">-48%</p>
            <p className="text-xl font-semibold">$400.00</p>
            <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
              Add to cart
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <Image
              src="/bread.png"
              alt="Bread"
              width={150}
              height={150}
              className="mb-4"
            />
            <p className="text-xl font-bold">Magnam aliquam</p>
            <p className="text-yellow-600">-50%</p>
            <p className="text-xl font-semibold">$410.00</p>
            <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
              Add to cart
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <Image
              src="/onion.png"
              alt="Onion"
              width={150}
              height={150}
              className="mb-4"
            />
            <p className="text-xl font-bold">Quasi architecto</p>
            <p className="text-yellow-600">-30%</p>
            <p className="text-xl font-semibold">$88.00 - $99.00</p>
            <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
              Select options
            </button>
          </div>
        </div>
      </div>

      {/* Today's Deals Section */}
      <div className="py-8 px-40 w-full">
        <h2 className="text-left text-3xl font-bold mb-6">Today Deals</h2>
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center border ">
            <Image
              src="/tomato.png"
              alt="Tomato"
              width={150}
              height={150}
              className="mb-4"
            />
            <p className="text-xl font-bold">Farm Fresh</p>
            <p className="text-green-600">-40%</p>
            <p className="text-xl font-semibold">$40.00 - $300.00</p>
            <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
              Select Options
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center border">
            <Image
              src="/juice.png"
              alt="Juice"
              width={150}
              height={150}
              className="mb-4"
            />
            <p className="text-xl font-bold">Healthy Juice</p>
            <p className="text-red-600">-48%</p>
            <p className="text-xl font-semibold">$49.00 - $199.00</p>
            <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
              Select Options
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center border">
            <Image
              src="/bread.png"
              alt="Bread"
              width={150}
              height={150}
              className="mb-4"
            />

            <p className="text-xl font-bold">Fresh Breads</p>
            <p className="text-yellow-600">-50%</p>
            <p className="text-xl font-semibold">$88.00 - $99.00</p>
            <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
              Select Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
