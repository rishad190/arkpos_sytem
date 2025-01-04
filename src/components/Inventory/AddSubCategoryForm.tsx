import React, { useState, useCallback } from "react";
import { getDatabase, ref, push, serverTimestamp } from "firebase/database";
import app from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  description: string;
}

interface AddSubCategoryFormProps {
  categories: Category[];
  onComplete: () => void;
}

export function AddSubCategoryForm({
  categories,
  onComplete,
}: AddSubCategoryFormProps) {
  const [formData, setFormData] = useState({
    parentCategory: "",
    subcategoryName: "",
    subcategoryDescription: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, parentCategory: value }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = [];
    if (!formData.parentCategory) errors.push("Parent category is required");
    if (!formData.subcategoryName.trim())
      errors.push("Subcategory name is required");
    return errors;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(". "),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const db = getDatabase(app);
      const subcategoriesRef = ref(
        db,
        `subcategories/${formData.parentCategory}`
      );
      await push(subcategoriesRef, {
        name: formData.subcategoryName.trim(),
        description: formData.subcategoryDescription.trim(),
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: "Subcategory added successfully",
      });
      setFormData({
        parentCategory: "",
        subcategoryName: "",
        subcategoryDescription: "",
      });
      onComplete();
    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast({
        title: "Error",
        description: "Failed to add subcategory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add New Subcategory</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parentCategory">Parent Category</Label>
            <Select
              value={formData.parentCategory}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="parentCategory">
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
            <Label htmlFor="subcategoryName">Subcategory Name</Label>
            <Input
              id="subcategoryName"
              value={formData.subcategoryName}
              onChange={handleInputChange}
              placeholder="Enter subcategory name"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategoryDescription">Description</Label>
            <Textarea
              id="subcategoryDescription"
              value={formData.subcategoryDescription}
              onChange={handleInputChange}
              placeholder="Enter subcategory description (optional)"
              rows={3}
              maxLength={200}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Subcategory"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
