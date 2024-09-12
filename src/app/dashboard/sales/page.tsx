"use client";

import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import app from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SalesPageSkeleton } from "@/components/Sales/SalesPageSkeleton";

interface SaleItem {
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  date: string;
  status: string;
  isOnline: boolean;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const salesRef = ref(db, "sales");

    const unsubscribe = onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      const salesList: Sale[] = data
        ? Object.entries(data).map(([id, sale]) => ({
            id,
            ...(sale as Omit<Sale, "id">),
          }))
        : [];
      setSales(salesList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculate total sales
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  // Calculate online vs in-store sales
  const onlineSales = sales.filter((sale) => sale.isOnline).length;
  const inStoreSales = sales.length - onlineSales;
  const onlinePercentage =
    sales.length > 0 ? (onlineSales / sales.length) * 100 : 0;
  const inStorePercentage = 100 - onlinePercentage;

  // Prepare data for charts
  const salesByMonth = sales.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleString("default", {
      month: "short",
    });
    if (!acc[month]) {
      acc[month] = { month, online: 0, inStore: 0, total: 0 };
    }
    acc[month].total += sale.totalPrice;
    if (sale.isOnline) {
      acc[month].online += sale.totalPrice;
    } else {
      acc[month].inStore += sale.totalPrice;
    }
    return acc;
  }, {} as Record<string, { month: string; online: number; inStore: number; total: number }>);

  const salesData = Object.values(salesByMonth);

  // Calculate top products
  const topProducts = sales
    .flatMap((sale) => sale.items)
    .reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { name: item.name, sales: 0, revenue: 0 };
      }
      acc[item.name].sales += item.quantity;
      acc[item.name].revenue += item.price * item.quantity;
      return acc;
    }, {} as Record<string, { name: string; sales: number; revenue: number }>);

  const topProductsList = Object.values(topProducts)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)
    .map((product, index) => ({ id: index + 1, ...product }));

  // Get recent sales
  const recentSales = sales
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((sale) => ({
      id: sale.id,
      product: sale.items[0].name,
      customer: sale.customerName,
      date: new Date(sale.date).toISOString().split("T")[0],
      amount: sale.totalPrice,
      status: sale.status || "Completed",
    }));

  if (isLoading) {
    return <SalesPageSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Sales Dashboard
        </h1>
        <Button variant="outline">Generate Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{averageSale.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Online vs In-Store
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onlinePercentage.toFixed(0)}% / {inStorePercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Online leading by{" "}
              {Math.abs(onlinePercentage - inStorePercentage).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="online"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
              />
              <Area
                type="monotone"
                dataKey="inStore"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="topProducts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topProducts">Top Products</TabsTrigger>
          <TabsTrigger value="recentSales">Recent Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="topProducts">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductsList.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell className="text-right">
                        ৳{product.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recentSales">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{sale.product}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>৳{sale.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            sale.status === "Completed"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {sale.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
