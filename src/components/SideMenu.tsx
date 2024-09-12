"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart,
  FileText,
  Settings,
  Menu,
  LogOut,
  Plus,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sales", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "New Sales", href: "/dashboard/new-sale", icon: Plus },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Inventory", href: "/dashboard/inventory", icon: BarChart },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Admin", href: "/dashboard/admin", icon: Settings },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { userRole } = useAuth();

  const filteredMenuItems = menuItems.filter((item) => {
    if (userRole === "admin") return true;
    if (userRole === "seller") {
      return ["Dashboard", "Sales", "New Sales", "Customers"].includes(
        item.name
      );
    }
    return false;
  });

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <h1 className="text-xl font-bold">POS System</h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} />
          </Button>
        </div>
      </header>

      <div className="flex pt-16">
        <div
          className={cn(
            "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out shadow-lg",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="flex flex-col h-full">
            <ul className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {filteredMenuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </nav>
        </div>
        <div className="flex-grow md:ml-64 ">
          {/* Your main content goes here */}
        </div>
      </div>
    </>
  );
}
