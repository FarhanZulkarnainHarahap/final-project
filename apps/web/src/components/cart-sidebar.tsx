import { FiX } from "react-icons/fi";
// import Image from "next/image";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  return (
    <>
      {/* Optional backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black opacity-0 z-40"
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 w-80 h-screen bg-white shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-50 flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} className="text-2xl">
            <FiX />
          </button>
        </div>

        {/* Cart items */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Dummy product */}
          <div className="flex gap-2 border-b pb-2 mb-2">
            {/* <Image
              src="/image-of-product.png"
              className="w-16 h-16 object-cover rounded"
              alt="Product"
            /> */}
            <div className="flex-1">
              <p>Product Name</p>
              <p>$150.00</p>
            </div>
            <button className="text-red-500">Delete</button>
          </div>
          {/* Repeat for other items */}
        </div>

        {/* Checkout */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-2 font-semibold">
            <span>Subtotal:</span>
            <span>$150.00</span>
          </div>
          <button className="bg-black text-white w-full py-2 rounded">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}
