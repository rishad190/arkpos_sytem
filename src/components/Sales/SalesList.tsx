// components/SalesList.tsx
import { use } from "react";

async function getSales() {
  // In a real app, this would be an API call
  return [
    { id: 1, date: "2024-09-01", total: 59.99, items: 3 },
    { id: 2, date: "2024-09-02", total: 129.99, items: 5 },
    { id: 3, date: "2024-09-03", total: 89.99, items: 4 },
  ];
}

export default function SalesList() {
  const sales = use(getSales());

  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">Date</th>
          <th className="border p-2">Total</th>
          <th className="border p-2">Items</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((sale) => (
          <tr key={sale.id}>
            <td className="border p-2">{sale.date}</td>
            <td className="border p-2">${sale.total.toFixed(2)}</td>
            <td className="border p-2">{sale.items}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
