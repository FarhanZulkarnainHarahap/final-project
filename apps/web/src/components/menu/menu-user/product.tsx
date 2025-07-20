import Link from "next/link";
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
};

export default async function ProductCatalog() {
  const res = await fetch("http://localhost:8000/api/v1/products", {
    cache: "no-store",
  });

  const json = await res.json();
  const products = json.data;
  console.log(json);
  //   const products = await res.json();

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {products.map((product: Product) => (
        <Link
          key={product.id}
          href={`/dashboard/user/product/${product.id}`}
          className="border p-4 rounded shadow hover:bg-gray-50"
        >
          <h2 className="font-bold">{product.name}</h2>
          <p>{product.price}</p>
        </Link>
      ))}
    </div>
  );
}
