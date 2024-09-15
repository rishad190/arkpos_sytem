"use client";

import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import app from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Toaster } from "@/components/ui/toaster";
import { ChevronRight } from "lucide-react";
import { AddSubCategoryForm } from "@/components/Inventory/AddSubCategoryForm";
import AddProductForm from "@/components/Inventory/AddProductForm";
import AddCategoryForm from "@/components/Inventory/AddCategoryForm";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
}

interface Product {
  id: string;
  category: string;
  subcategory: string;
  containerNumber: string;
  price: number;
  quantity: number;
  stockYear: string;
}

const sampleData = [
  { name: "Product A", stock: 400 },
  { name: "Product B", stock: 300 },
  { name: "Product C", stock: 500 },
  { name: "Product D", stock: 200 },
];

const getStockStatus = (quantity: number) => {
  if (quantity === 0)
    return { label: "Empty", variant: "destructive" as const };
  if (quantity <= 10)
    return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
};

export default function InventoryPage() {
  const [categories, setCategories] = useState<{ [key: string]: Category }>({});
  const [subcategories, setSubcategories] = useState<{
    [key: string]: Subcategory;
  }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, "products");
    const categoriesRef = ref(db, "categories");
    const subcategoriesRef = ref(db, "subcategories");

    const fetchCategories = async () => {
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        setCategories(categoriesData);
      }
    };

    const fetchSubcategories = async () => {
      const snapshot = await get(subcategoriesRef);
      if (snapshot.exists()) {
        const subcategoriesData = snapshot.val();
        const flattenedSubcategories: { [key: string]: Subcategory } = {};
        Object.values(subcategoriesData).forEach(
          (categorySubcategories: any) => {
            Object.entries(categorySubcategories).forEach(
              ([id, data]: [string, any]) => {
                flattenedSubcategories[id] = { id, name: data.name };
              }
            );
          }
        );
        setSubcategories(flattenedSubcategories);
      }
    };

    const handleProductsChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsList = Object.entries(productsData).map(
          ([id, data]: [string, any]) => ({
            id,
            ...data,
          })
        );
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    };

    fetchCategories();
    fetchSubcategories();
    onValue(productsRef, handleProductsChange);

    return () => {
      off(productsRef, "value", handleProductsChange);
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const categoryName =
      categories[product.category]?.name?.toLowerCase() || "";
    const subcategoryName =
      subcategories[product.subcategory]?.name?.toLowerCase() || "";
    const searchTermLower = searchTerm.toLowerCase();

    return (
      categoryName.includes(searchTermLower) ||
      subcategoryName.includes(searchTermLower) ||
      product.containerNumber.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Inventory Management
          </h1>
          <div>
            <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
              <DialogTrigger asChild>
                <Button>Add New Product</Button>
              </DialogTrigger>
              <DialogContent>
                <AddProductForm onComplete={() => setIsAddingProduct(false)} />
              </DialogContent>
            </Dialog>
            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-2">
                  Add New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AddCategoryForm
                  onComplete={() => setIsAddingCategory(false)}
                />
              </DialogContent>
            </Dialog>
            <Dialog
              open={isAddingSubcategory}
              onOpenChange={setIsAddingSubcategory}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-2">
                  Add New Subcategory
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AddSubCategoryForm
                  onComplete={() => setIsAddingSubcategory(false)}
                  categories={Object.values(categories)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categories and Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(categories).map((category) => (
                <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {category.name}
                  </h3>
                  {Object.values(subcategories)
                    .filter((sub) => sub.id.startsWith(category.id))
                    .map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center bg-white rounded-md p-2 text-sm"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{sub.name}</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Low Stock Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.filter((item) => item.quantity < 30).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Out of Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.filter((item) => item.quantity === 0).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Inventory List</TabsTrigger>
            <TabsTrigger value="chart">Inventory Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Inventory List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="search">Search Inventory</Label>
                  <Input
                    id="search"
                    placeholder="Search by category, subcategory, or container number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead>Container Number</TableHead>
                      <TableHead>Stock Year</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.quantity);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            {categories[product.category]?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            {subcategories[product.subcategory]?.name || "N/A"}
                          </TableCell>
                          <TableCell>{product.containerNumber}</TableCell>
                          <TableCell>{product.stockYear}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                stockStatus.variant as
                                  | "default"
                                  | "secondary"
                                  | "destructive"
                                  | "outline"
                              }
                            >
                              {stockStatus.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  );
}
