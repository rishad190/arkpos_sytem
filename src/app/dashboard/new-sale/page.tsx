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
import { log } from "console";

const metersToYards = (meters: number) => meters * 1.09361;

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  unit: "yards" | "meters" | "kg";
}

interface SaleItem extends Product {
  quantity: number;
  unit: "yards" | "meters" | "kg";
  customPrice: number | null;
}

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const { toast } = useToast();
  const [unit, setUnit] = useState<"yards" | "meters" | "kg">("yards");

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, "products");

    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productList = data
        ? Object.entries(data).map(([id, product]) => ({
            ...(product as Product),
            id,
          }))
        : [];
      setProducts(productList);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProduct);

    if (product) {
      let convertedQuantity = quantity;
      let convertedUnit = unit;

      if (unit === "meters") {
        convertedQuantity = metersToYards(quantity);
      }

      const newItem: SaleItem = {
        ...product,
        quantity: convertedQuantity,
        unit: convertedUnit,
        customPrice: useCustomPrice ? customPrice : null,
      };
      setSaleItems([...saleItems, newItem]);
      // Reset form
      setSelectedProduct("");
      setQuantity(1);
      setUnit("yards");
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
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.price} (Stock: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex space-x-2">
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  className="flex-grow"
                />
                <Select
                  value={unit}
                  onValueChange={(value: "yards" | "meters" | "kg") =>
                    setUnit(value)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yards">Yards</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="kg">KG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.quantity.toFixed(2)} {item.unit}
                      {item.unit !== item.unit &&
                        ` (${(
                          item.quantity *
                          (item.unit === "yards" ? 0.9144 : 1.09361)
                        ).toFixed(2)} ${
                          item.unit === "yards" ? "meters" : "yards"
                        })`}
                    </TableCell>
                    <TableCell>
                      ৳
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
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring">Recurring Sale</Label>
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
