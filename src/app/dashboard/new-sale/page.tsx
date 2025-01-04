"use client";

import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, push } from "firebase/database";
import app from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  price: number;
  quantity: number;
}

interface SaleItem extends Product {
  quantity: number;
  customPrice: number | null;
}

export default function NewSalePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [useCustomPrice, setUseCustomPrice] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const db = getDatabase(app);
    const categoriesRef = ref(db, "categories");
    const subCategoriesRef = ref(db, "subcategories");
    const productsRef = ref(db, "products");

    const unsubscribeCategories = onValue(
      categoriesRef,
      (snapshot) => {
        const data = snapshot.val();
        const categoryList = data
          ? Object.entries(data).map(([id, category]) => ({
              id,
              name: (category as { name: string }).name,
            }))
          : [];
        setCategories(categoryList);
      },
      (error) => {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to fetch categories. Please try again.",
          variant: "destructive",
        });
      }
    );

    const unsubscribeSubCategories = onValue(
      subCategoriesRef,
      (snapshot) => {
        const data = snapshot.val();
        const subCategoryList: Subcategory[] = [];
        if (data) {
          Object.entries(data).forEach(([categoryId, subcategories]) => {
            Object.entries(subcategories as Record<string, any>).forEach(
              ([subCategoryId, subCategory]) => {
                subCategoryList.push({
                  id: subCategoryId,
                  name: subCategory.name,
                  description: subCategory.description,
                  categoryId: categoryId,
                });
              }
            );
          });
        }
        setSubCategories(subCategoryList);
      },
      (error) => {
        console.error("Error fetching subcategories:", error);
        toast({
          title: "Error",
          description: "Failed to fetch subcategories. Please try again.",
          variant: "destructive",
        });
      }
    );

    const unsubscribeProducts = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val();
        const productList = data
          ? Object.entries(data).map(([id, product]) => ({
              ...(product as Product),
              id,
            }))
          : [];
        setProducts(productList);
      },
      (error) => {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to fetch products. Please try again.",
          variant: "destructive",
        });
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeSubCategories();
      unsubscribeProducts();
    };
  }, [toast]);

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProduct);

    if (product) {
      const categoryName: Category | undefined = categories.find(
        (p) => p.id === selectedCategory
      );
      const subCategoryName: Subcategory | undefined = subCategories.find(
        (p) => p.id === selectedSubCategory
      );
      const newItem: SaleItem = {
        ...product,
        name: `${categoryName?.name}(${subCategoryName?.name})`,
        quantity,
        customPrice: useCustomPrice ? customPrice : null,
      };
      setSaleItems([...saleItems, newItem]);
      setSelectedProduct("");
      setQuantity(1);
      setCustomPrice(null);
      setUseCustomPrice(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const totalSalePrice = saleItems.reduce((total, item) => {
    const price = item.customPrice !== null ? item.customPrice : item.price;
    return total + price * item.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saleItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the sale.",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      items: saleItems,
      customerName,
      customerPhone,
      notes,
      isRecurring,
      totalPrice: totalSalePrice,
      date: new Date().toISOString(),
    };

    try {
      const db = getDatabase(app);
      const salesRef = ref(db, "sales");
      await push(salesRef, saleData);

      toast({
        title: "Success",
        description: "Sale completed successfully!",
      });

      // Reset form
      setSaleItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setIsRecurring(false);
    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Error",
        description: "Failed to complete the sale. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">New Sale</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Select Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedSubCategory("");
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subCategory">Select Sub Category</Label>
                <Select
                  value={selectedSubCategory}
                  onValueChange={setSelectedSubCategory}
                >
                  <SelectTrigger id="subCategory">
                    <SelectValue placeholder="Select a sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories
                      .filter(
                        (subCategory) =>
                          subCategory.categoryId === selectedCategory
                      )
                      .map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Select Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter(
                      (product) =>
                        product.category === selectedCategory && // Use categoryId here
                        product.subcategory === selectedSubCategory // Use subcategoryId here
                    )
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.quantity})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="custom-price"
                  checked={useCustomPrice}
                  onCheckedChange={setUseCustomPrice}
                />
                <Label htmlFor="custom-price">Use Custom Price</Label>
              </div>
              {useCustomPrice && (
                <Input
                  id="custom-price-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={customPrice !== null ? customPrice : ""}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value))}
                  placeholder="Enter custom price"
                />
              )}
            </div>
            <Button type="button" onClick={handleAddItem}>
              Add to Sale
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sale Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      $
                      {(item.customPrice !== null
                        ? item.customPrice
                        : item.price
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      $
                      {(
                        (item.customPrice !== null
                          ? item.customPrice
                          : item.price) * item.quantity
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-right font-bold">
              Total Sale Price: ${totalSalePrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring-sale"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring-sale">Recurring Sale</Label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">
          Complete Sale
        </Button>
      </form>
    </div>
  );
}
