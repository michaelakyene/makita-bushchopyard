"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  prepTimeMinutes: number;
}

const categories = ["food", "drink"];
const subcategories = [
  "Main Dishes",
  "Sides & Snacks",
  "Local Drinks",
  "Bottled Drinks",
];

export default function AdminMenuPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    imageUrl: "",
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: false,
    prepTimeMinutes: "15",
  });

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) return;
      if (!user) {
        router.push("/admin/login");
        return;
      }
      setIsAdmin(true);
    }
    checkAdmin();
  }, [user, authLoading, router]);

  const loadItems = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const itemsSnap = await getDocs(collection(db, "menuItems"));
      const itemsData = itemsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuItem[];
      setItems(itemsData);
    } catch (error) {
      console.error("Error loading menu items:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadItems();
    }
  }, [isAdmin]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      subcategory: "",
      imageUrl: "",
      isAvailable: true,
      isFeatured: false,
      isSpicy: false,
      isVegetarian: false,
      prepTimeMinutes: "15",
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      subcategory: item.subcategory || "",
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured || false,
      isSpicy: item.isSpicy || false,
      isVegetarian: item.isVegetarian || false,
      prepTimeMinutes: item.prepTimeMinutes?.toString() || "15",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteDoc(doc(db, "menuItems", id));
      toast.success("Item deleted successfully");
      loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory || "",
        imageUrl: formData.imageUrl || "/menu/placeholder.jpg",
        isAvailable: formData.isAvailable,
        isFeatured: formData.isFeatured,
        isSpicy: formData.isSpicy,
        isVegetarian: formData.isVegetarian,
        prepTimeMinutes: parseInt(formData.prepTimeMinutes) || 15,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, "menuItems", editingItem.id), itemData);
        toast.success("Item updated successfully");
      } else {
        await addDoc(collection(db, "menuItems"), itemData);
        toast.success("Item added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadItems();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "menuItems", id), {
        isAvailable: !current,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Item ${!current ? "available" : "unavailable"}`);
      loadItems();
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Failed to update availability");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Manage your menu items and availability
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadItems}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name *</Label>
                  <Input
                    id="item-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Jollof Rice"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the item"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Price (GH₵) *</Label>
                    <Input
                      id="item-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-prep-time">Prep Time (min)</Label>
                    <Input
                      id="item-prep-time"
                      type="number"
                      value={formData.prepTimeMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prepTimeMinutes: e.target.value,
                        })
                      }
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="item-category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-subcategory">Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subcategory: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-image">Image URL</Label>
                  <Input
                    id="item-image"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="item-available"
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isAvailable: checked })
                      }
                    />
                    <Label htmlFor="item-available">Available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="item-featured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isFeatured: checked })
                      }
                    />
                    <Label htmlFor="item-featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="item-spicy"
                      checked={formData.isSpicy}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isSpicy: checked })
                      }
                    />
                    <Label htmlFor="item-spicy">Spicy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="item-vegetarian"
                      checked={formData.isVegetarian}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isVegetarian: checked })
                      }
                    />
                    <Label htmlFor="item-vegetarian">Vegetarian</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">
              {items.filter((i) => i.isAvailable).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Featured</p>
            <p className="text-2xl font-bold text-gold">
              {items.filter((i) => i.isFeatured).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={item.imageUrl || "/menu/placeholder.jpg"}
                alt={item.name}
                className="h-40 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/menu/placeholder.jpg";
                }}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                {item.isFeatured && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ Featured
                  </Badge>
                )}
                {item.isSpicy && (
                  <Badge variant="destructive" className="text-xs">
                    🌶️ Spicy
                  </Badge>
                )}
                {item.isVegetarian && (
                  <Badge className="bg-green-600 text-xs">🌱 Veg</Badge>
                )}
              </div>
              <Badge
                className={`absolute bottom-2 left-2 text-xs ${
                  item.isAvailable ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="mb-1 flex items-start justify-between">
                  <h4 className="font-semibold">{item.name}</h4>
                  <span className="font-bold text-primary">
                    GH₵ {item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description || "No description"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.subcategory && (
                    <Badge variant="outline" className="text-xs">
                      {item.subcategory}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    🕐 {item.prepTimeMinutes || 15}m
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  {item.isAvailable ?
                    <Eye className="h-4 w-4 text-green-600" />
                  : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAvailability(item.id, item.isAvailable)}
                >
                  {item.isAvailable ? "Disable" : "Enable"}
                </Button>
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex min-h-[40vh] items-center justify-center p-12">
            <div className="text-center">
              <p className="text-muted-foreground">No menu items found</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
