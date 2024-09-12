import Link from "next/link";
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-full">
            <Store className="text-blue-600 w-16 h-16" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-8 text-center">
          Welcome to POS System
        </h1>
        <p className="text-xl text-center mb-12">
          Streamline your business operations with our powerful point of sale
          solution.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/inventory", icon: Package, label: "Inventory" },
            { href: "/sales", icon: ShoppingCart, label: "Sales" },
            { href: "/customers", icon: Users, label: "Customers" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white bg-opacity-20 rounded-lg p-6 text-center hover:bg-opacity-30 transition duration-300"
            >
              <item.icon className="mx-auto w-12 h-12 mb-4" />
              <span className="text-lg font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-100 transition duration-300"
          >
            Login to Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
