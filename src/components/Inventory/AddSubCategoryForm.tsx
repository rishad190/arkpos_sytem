import { useState } from "react";
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
import { getDatabase, ref, push } from "firebase/database";
import app from "@/lib/firebase";

interface Category {
  id: string;
  name: string;
}

interface AddSubCategoryFormProps {
  categories: Category[];
  onComplete: () => void;
}

export function AddSubCategoryForm({
  categories,
  onComplete,
}: AddSubCategoryFormProps) {
  const [parentCategory, setParentCategory] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentCategory || !subcategoryName.trim()) {
      toast({
        title: "Error",
        description: "Parent category and subcategory name are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const db = getDatabase(app);
      const subcategoriesRef = ref(db, `subcategories/${parentCategory}`);
      await push(subcategoriesRef, {
        name: subcategoryName,
        description: subcategoryDescription,
      });
      toast({
        title: "Success",
        description: "Subcategory added successfully",
      });
      setSubcategoryName("");
      setSubcategoryDescription("");
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subcategory",
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
            <Label htmlFor="parent-category">Parent Category</Label>
            <Select value={parentCategory} onValueChange={setParentCategory}>
              <SelectTrigger id="parent-category">
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
            <Label htmlFor="subcategory-name">Subcategory Name</Label>
            <Input
              id="subcategory-name"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              placeholder="Enter subcategory name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory-description">Description</Label>
            <Textarea
              id="subcategory-description"
              value={subcategoryDescription}
              onChange={(e) => setSubcategoryDescription(e.target.value)}
              placeholder="Enter subcategory description"
              rows={3}
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
