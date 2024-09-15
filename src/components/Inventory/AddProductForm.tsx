import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getDatabase, ref, push, get } from "firebase/database";
import app from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
}

interface AddProductFormProps {
  onComplete: () => void;
}

const formSchema = z.object({
  category: z.string({
    required_error: "Please select a category.",
  }),
  subcategory: z.string({
    required_error: "Please select a subcategory.",
  }),
  containerNumber: z.string().min(1, "Container number is required."),
  stockYear: z.string().regex(/^\d{4}$/, "Please enter a valid 4-digit year."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  price: z.coerce.number().positive("Price must be a positive number."),
});

const AddProductForm: React.FC<AddProductFormProps> = ({ onComplete }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      containerNumber: "",
      stockYear: new Date().getFullYear().toString(),
      quantity: 0,
      price: 0,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const db = getDatabase(app);
      const categoriesRef = ref(db, "categories");
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const formattedCategories = Object.entries(categoriesData).map(
          ([id, data]: [string, any]) => ({
            id,
            name: data.name,
          })
        );
        setCategories(formattedCategories);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        const db = getDatabase(app);
        const subcategoriesRef = ref(db, `subcategories/${selectedCategory}`);
        const snapshot = await get(subcategoriesRef);
        if (snapshot.exists()) {
          const subcategoriesData = snapshot.val();
          const formattedSubcategories = Object.entries(subcategoriesData).map(
            ([id, data]: [string, any]) => ({
              id,
              name: data.name,
              description: data.description,
            })
          );
          setSubcategories(formattedSubcategories);
        } else {
          setSubcategories([]);
        }
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const db = getDatabase(app);
      const productsRef = ref(db, "products");

      const productData = {
        category: values.category,
        subcategory: values.subcategory,
        containerNumber: values.containerNumber,
        stockYear: values.stockYear,
        quantity: values.quantity,
        price: values.price,
      };

      await push(productsRef, productData);

      toast({
        title: "Success",
        description: "Product added successfully",
      });
      onComplete();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                      form.setValue("subcategory", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="containerNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter container number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stockYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Year</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter stock year" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="Enter quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      placeholder="Enter price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddProductForm;
