import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { getDatabase, ref, push } from "firebase/database";
import app from "@/lib/firebase";

interface AddCategoryFormProps {
  onComplete: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onComplete }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const db = getDatabase(app);
      const categoriesRef = ref(db, "categories");
      await push(categoriesRef, {
        name: categoryName,
        description: categoryDescription,
        // ... other category data ...
      });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="categoryName">Fabric Category Name</Label>
        <Input
          id="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter fabric category name (e.g., Cotton, Silk)"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryDescription">Category Description</Label>
        <Textarea
          id="categoryDescription"
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value)}
          placeholder="Enter details about the fabric category"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Category"}
      </Button>
    </form>
  );
};

export default AddCategoryForm;
