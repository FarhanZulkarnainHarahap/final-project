"use client";
import { useState, useEffect } from "react";

interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}
export default function ProductCatalogId({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const [products, setProducts] = useState<ProductType | null>(null);

  useEffect(() => {
    async function getProduct() {
      try {
        const { productId } = await params;
        const res = await fetch(
          `http://localhost:8000/api/v1/products/${productId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setProducts(data?.data);
        console.log(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    getProduct();
  });
  useEffect(() => {
    async function getProduct() {
      try {
        const { productId } = await params;
        const res = await fetch(
          `http://localhost:8000/api/v1/products/${productId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setProducts(data?.data);
        console.log(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    getProduct();
  });
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {products && (
        <article key={products.id} className="border p-2 rounded shadow">
          <h2 className="font-bold">{products.name}</h2>
          <p>{products.description}</p>
          <p>Price: Rp{products.price}</p>
          <p>Stock: {products.stock}</p>
          {/* {product.ProductImage?.[0]?.Image?.imageUrl && (
            
          )} */}
        </article>
      )}
    </div>
  );
}
