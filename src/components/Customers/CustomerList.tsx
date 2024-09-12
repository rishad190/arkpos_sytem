// components/CustomerList.tsx
import { use } from "react";
import Link from "next/link";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
};

async function getCustomers(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  // In a real app, this would be an API call with proper filtering and pagination
  const customers: Customer[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      totalPurchases: 1500,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "098-765-4321",
      totalPurchases: 2200,
    },
    // ... more customers
  ];

  const search = searchParams.search as string | undefined;
  const page = parseInt((searchParams.page as string) || "1");
  const pageSize = 10;

  let filteredCustomers = customers;

  if (search) {
    filteredCustomers = filteredCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return { customers: paginatedCustomers, totalPages };
}

export default function CustomerList({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { customers, totalPages } = use(getCustomers(searchParams));
  const currentPage = parseInt((searchParams.page as string) || "1");

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2 hidden md:table-cell">Phone</th>
            <th className="border p-2">Total Purchases</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="border p-2">{customer.name}</td>
              <td className="border p-2">{customer.email}</td>
              <td className="border p-2 hidden md:table-cell">
                {customer.phone}
              </td>
              <td className="border p-2">
                ${customer.totalPurchases.toFixed(2)}
              </td>
              <td className="border p-2">
                <Link
                  href={`/customers/${customer.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
        <Link
          href={{
            query: { ...searchParams, page: Math.max(1, currentPage - 1) },
          }}
          className={`px-4 py-2 bg-blue-500 text-white rounded mb-2 md:mb-0 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </Link>
        <span className="mb-2 md:mb-0">
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
