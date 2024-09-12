// components/InventorySearch.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InventorySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.set("search", searchTerm);
    if (category) searchParams.set("category", category);
    router.push(`/inventory?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 space-y-4">
      <div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="flex space-x-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="food">Food</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
