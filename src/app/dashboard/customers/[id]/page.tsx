// app/customers/[id]/page.tsx
import { use } from "react";
import Link from "next/link";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPurchases: number;
};

type PurchaseHistory = {
  id: number;
  date: string;
  amount: number;
};

async function getCustomer(
  id: string
): Promise<{ customer: Customer; purchaseHistory: PurchaseHistory[] }> {
  // In a real app, this would be an API call
  return {
    customer: {
      id: parseInt(id),
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      address: "123 Main St, Anytown, USA",
      totalPurchases: 1500,
    },
    purchaseHistory: [
      { id: 1, date: "2024-09-01", amount: 500 },
      { id: 2, date: "2024-08-15", amount: 1000 },
    ],
  };
}

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { customer, purchaseHistory } = use(getCustomer(params.id));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Customer Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
          <p>
            <strong>Name:</strong> {customer.name}
          </p>
          <p>
            <strong>Email:</strong> {customer.email}
          </p>
          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>
          <p>
            <strong>Address:</strong> {customer.address}
          </p>
          <p>
            <strong>Total Purchases:</strong> $
            {customer.totalPurchases.toFixed(2)}
          </p>
          <Link
            href={`/customers/${customer.id}/edit`}
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Customer
          </Link>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Purchase History</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Date</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.map((purchase) => (
                <tr key={purchase.id}>
                  <td className="border p-2">{purchase.date}</td>
                  <td className="border p-2">${purchase.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Link
        href="/customers"
        className="inline-block mt-4 text-blue-500 hover:underline"
      >
        Back to Customer List
      </Link>
    </div>
  );
}
