import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS System - Login",
  description: "Login to the Point of Sale System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
