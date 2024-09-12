// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider"; // Add this line
import { Toaster } from "@/components/ui/toaster"; // Add this line

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS System",
  description: "Point of Sale System built with Next.js 14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex">
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
