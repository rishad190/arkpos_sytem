// components/InventoryList.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
};

type InventoryListProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function InventoryList({ searchParams }: InventoryListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = parseInt((searchParams.page as string) || "1");

  useEffect(() => {
    async function fetchInventory() {
      const { products, totalPages } = await getInventory(searchParams);
      setProducts(products);
      setTotalPages(totalPages);
    }
    fetchInventory();
  }, [searchParams]);

  return (
    <div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border p-2">{product.name}</td>
              <td className="border p-2">{product.category}</td>
              <td className="border p-2">{product.quantity}</td>
              <td className="border p-2">${product.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <Link
          href={{
            query: { ...searchParams, page: Math.max(1, currentPage - 1) },
          }}
          className={`px-4 py-2 bg-blue-500 text-white rounded ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </Link>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Link
          href={{
            query: {
              ...searchParams,
              page: Math.min(totalPages, currentPage + 1),
            },
          }}
          className={`px-4 py-2 bg-blue-500 text-white rounded ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

async function getInventory(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  // In a real app, this would be an API call with proper filtering and pagination
  const products: Product[] = [
    {
      id: 1,
      name: "Laptop",
      category: "Electronics",
      quantity: 10,
      price: 999.99,
    },
    {
      id: 2,
      name: "T-Shirt",
      category: "Clothing",
      quantity: 100,
      price: 19.99,
    },
    {
      id: 3,
      name: "Chocolate Bar",
      category: "Food",
      quantity: 500,
      price: 2.99,
    },
    // ... more products
  ];
  const search = searchParams.search as string | undefined;

  const category = searchParams.category as string | undefined;
  const page = parseInt((searchParams.page as string) || "1");
  const pageSize = 10;

  let filteredProducts = products;

  if (search) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return { products: paginatedProducts, totalPages };
}
