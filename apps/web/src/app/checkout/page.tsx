"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MenuNavbarUser from "@/components/header/header-user/header";

/* -------------------------------------------------------------------------- */
/* Types */
interface CartItem {
  id: string;
  quantity: number;
  Product: {
    title: string;
    image: string;
    price: number;
    weight: number;
    imagePreview?: { imageUrl: string }[]; // Added imagePreview type
  };
}

interface Address {
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface UserAddress {
  id: string;
  recipient: string;
  isPrimary: boolean;
  Address: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    destinationId: string;
  };
}

interface ShippingOption {
  shippingName: string;
  serviceName: string;
}

interface ShippingMethod {
  shipping_name: string;
  service_name: string;
  grandtotal: number;
  etd: string;
}

interface ShippingCosts {
  [key: string]: ShippingMethod[]; // This holds an object with string keys, each mapping to an array of ShippingMethod
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address>({
    fullName: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const router = useRouter();
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [shippingCosts, setShippingCosts] = useState<ShippingCosts | null>(
    null
  );

  const [selectedShippingCost, setSelectedShippingCost] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"epayment" | "manual">(
    "epayment"
  );
  const [manualPaymentProof, setManualPaymentProof] = useState<File | null>(
    null
  );
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<ShippingOption | null>(null);

  // Function to calculate shipping cost based on selected address and cart
  const calculateShippingCost = (selectedAddress: UserAddress) => {
    const totalWeight = cartItems.reduce(
      (sum, item) => sum + item.Product.weight * item.quantity,
      0
    );

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.Product.price * item.quantity,
      0
    );

    const queryParams = new URLSearchParams({
      shipper_destination_id: "501", // your warehouse
      receiver_destination_id: selectedAddress.Address.destinationId,
      weight: totalWeight.toString(),
      item_value: subtotal.toString(),
      cod: "false",
    });

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
    fetch(`${baseUrl}/api/v1/rajaongkir/calculate?${queryParams}`)
      .then((res) => res.json())
      .then((body) => {
        if (body) {
          setShippingCosts(body.data);
        }
      })
      .catch((error) => {
        console.error("Shipping calculation failed:", error);
      });
  };

  // Fetch cart items
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/cart/index`,
          {
            credentials: "include",
          }
        );

        if (res.status === 401 || res.status === 403) {
          router.push("/auth/login");
          return;
        }

        const json = await res.json();
        if (res.ok) setCartItems(json.data);
        else console.error("Failed to load cart", json.message);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    })();
  }, [router]);

  // Fetch user addresses
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/addresses`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        if (res.ok) {
          setUserAddresses(json);

          // Auto-select primary address
          const primary = json.find((addr: UserAddress) => addr.isPrimary);
          if (primary) {
            setSelectedAddressId(primary.id);
            setAddress({
              fullName: primary.recipient,
              address: primary.Address.address,
              city: primary.Address.city,
              province: primary.Address.province,
              postalCode: primary.Address.postalCode,
            });
          }
        } else {
          console.error("Failed to load addresses", json.message);
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    })();
  }, []);

  // Load Midtrans snap.js script for payment
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_SANDBOX_CLIENT_KEY;

    if (
      document.querySelector(
        'script[src="https://app.sandbox.midtrans.com/snap/snap.js"]'
      )
    ) {
      return; // already loaded
    }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey || "");
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Update selected address and calculate shipping cost when the address changes
  useEffect(() => {
    if (!selectedAddressId) return;

    const selectedAddress = userAddresses.find(
      (s) => s.id === selectedAddressId
    );

    if (selectedAddress && cartItems.length > 0) {
      setAddress({
        fullName: selectedAddress.recipient,
        address: selectedAddress.Address.address,
        city: selectedAddress.Address.city,
        province: selectedAddress.Address.province,
        postalCode: selectedAddress.Address.postalCode,
      });

      calculateShippingCost(selectedAddress);
    }
  }, [selectedAddressId, userAddresses, cartItems]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.Product.price * item.quantity,
    0
  );
  const grandTotal = subtotal + selectedShippingCost;

  // Format currency in IDR (Rupiah)
  const formatRp = (n: number) =>
    n.toLocaleString("id-ID", { minimumFractionDigits: 2 });

  // Ensure all address fields are filled
  const allAddressFilled = Object.values(address)
    .filter((f) => f != null)
    .every((v) => v.trim() !== "");

  const handlePayNow = async () => {
    if (!allAddressFilled)
      return alert("Please complete your shipping address.");
    if (!selectedShippingOption)
      return alert("Please select a shipping method.");
    if (!manualPaymentProof && paymentMethod === "manual")
      return alert("Please upload your payment proof.");

    const selectedAddress = userAddresses.find(
      (s) => s.id === selectedAddressId
    );

    const formData = new FormData();
    if (manualPaymentProof) {
      formData.append("paymentProof", manualPaymentProof);
    }
    formData.append("address", JSON.stringify(selectedAddress));
    formData.append("shippingOptions", JSON.stringify(selectedShippingOption));
    formData.append("cartItems", JSON.stringify(cartItems));
    formData.append("paymentMethod", paymentMethod);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/checkout/manual`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const json = await res.json();
      if (res.ok) {
        if (paymentMethod === "manual")
          router.push("/dashboard/user/my-orders");
        else {
          window.snap.pay(json.data.midtransTransaction?.token, {
            selectedPaymentType: "bca_va",
            onSuccess: function (result) {
              console.log("success", result);
            },
            onPending: function (result) {
              console.log("pending", result);
            },
            onError: function (result) {
              console.log("error", result);
            },
            onClose: function () {
              console.log(
                "customer closed the popup without finishing the payment"
              );
            },
          });
        }
      } else {
        console.error(json);
        alert("Failed to submit manual payment.");
      }
    } catch (err) {
      console.error("Manual payment error:", err);
      alert("Error during manual payment.");
    }
  };

  return (
    <MenuNavbarUser>
      <section className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center">Checkout</h1>

        {/* ---------- 1. Cart table ---------- */}
        <div className="overflow-x-auto w-full mb-8">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-center">Product</th>
                <th className="p-2 text-center">Price</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-center">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2 flex items-center gap-2 ">
                    {item.Product.imagePreview?.[0]?.imageUrl && (
                      <Image
                        src={item.Product.imagePreview[0].imageUrl}
                        alt={item.Product.title}
                        width={60}
                        height={60}
                        className="rounded"
                      />
                    )}
                    <span>{item.Product.title}</span>
                  </td>
                  <td className="p-2 text-center">
                    Rp. {formatRp(item.Product.price)}
                  </td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-center">
                    Rp. {formatRp(item.Product.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------- 2. Address & shipping ---------- */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Address form */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>

            {userAddresses.length === 0 ? (
              <div className="text-sm bg-yellow-50 border border-yellow-300 p-4 rounded">
                <p className="mb-2">You don't have any saved address yet.</p>
                <Link
                  href="/dashboard/user/profile/address"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add New Address
                </Link>
              </div>
            ) : selectedAddressId ? (
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Full name:</strong> {address.fullName}
                </p>
                <p>
                  <strong>Address:</strong> {address.address}
                </p>
                <p>
                  <strong>City:</strong> {address.city}
                </p>
                <p>
                  <strong>Province:</strong> {address.province}
                </p>
                <p>
                  <strong>Postal Code:</strong> {address.postalCode}
                </p>
              </div>
            ) : null}
          </div>

          {userAddresses.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">
                Select Saved Address
              </h2>
              <div className="space-y-2">
                {userAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 bg-white border rounded-lg cursor-pointer ${
                      selectedAddressId === address.id
                        ? "border-green-700 bg-green-50 text-green-700"
                        : "border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedAddressId(address.id);
                      setAddress({
                        fullName: address.recipient,
                        address: address.Address.address,
                        city: address.Address.city,
                        province: address.Address.province,
                        postalCode: address.Address.postalCode,
                      });
                    }}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="selected-address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold">{address.recipient}</p>
                        <p>{address.Address.address}</p>
                        <p>
                          {address.Address.city}, {address.Address.province},{" "}
                          {address.Address.postalCode}
                        </p>
                        <p className="text-sm">
                          {address.isPrimary
                            ? "Primary Address"
                            : "Secondary Address"}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/user/profile/address"
                className="text-sm text-blue-500 underline"
              >
                Manage saved addresses
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Shipping options & totals */}
          <div className="bg-gray-100 p-4 rounded h-fit md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>

            {shippingCosts &&
              Object.keys(shippingCosts).map((type) => {
                const shippingMethods = shippingCosts[type];
                return (
                  <div key={type} className="grid lg:grid-cols-2">
                    {shippingMethods.map((shippingMethod) => (
                      <div
                        key={
                          shippingMethod.shipping_name +
                          "|" +
                          shippingMethod.service_name
                        }
                        className="px-3 border py-3 mb-2 mx-2"
                      >
                        <input
                          type="radio"
                          name="selected-shipping"
                          className="mr-2"
                          value={shippingMethod.service_name}
                          onChange={() => {
                            setSelectedShippingCost(shippingMethod.grandtotal);
                            setSelectedShippingOption({
                              shippingName: shippingMethod.shipping_name,
                              serviceName: shippingMethod.service_name,
                            });
                          }}
                          checked={
                            selectedShippingOption?.serviceName ===
                            shippingMethod.service_name
                          }
                        />
                        <div>
                          <p>Courier: {shippingMethod.shipping_name}</p>
                          <p>Service: {shippingMethod.service_name}</p>
                          <p>Estimated: {shippingMethod.etd}</p>
                          <p>
                            Price: Rp. {formatRp(shippingMethod.grandtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

            {/* Payment Method Selection */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment-method"
                    value="epayment"
                    checked={paymentMethod === "epayment"}
                    onChange={() => setPaymentMethod("epayment")}
                  />
                  BCA Virtual Account
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment-method"
                    value="manual"
                    checked={paymentMethod === "manual"}
                    onChange={() => setPaymentMethod("manual")}
                  />
                  Manual Bank Transfer
                </label>
              </div>

              {paymentMethod === "manual" && (
                <div className="mt-4">
                  <label className="block mb-2 font-medium">
                    Upload Payment Proof
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setManualPaymentProof(e.target.files?.[0] || null)
                    }
                    className="block w-full border rounded p-2"
                  />
                </div>
              )}
            </div>

            {/* Totals */}
            <h3 className="text-lg font-semibold mb-2">Totals</h3>
            <div className="flex justify-between mb-1">
              <span>Items subtotal</span>
              <span>Rp. {formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Shipping</span>
              <span>
                {selectedShippingCost
                  ? `Rp. ${formatRp(selectedShippingCost)}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between border-t mt-2 pt-2 text-lg font-bold">
              <span>Grand total</span>
              <span>Rp. {formatRp(grandTotal)}</span>
            </div>

            <button
              onClick={handlePayNow}
              className="bg-green-600 mt-4 w-full text-white py-2 rounded disabled:opacity-60"
              disabled={!allAddressFilled || !selectedShippingOption}
            >
              Pay Now
            </button>
          </div>
        </div>
      </section>
    </MenuNavbarUser>
  );
}
