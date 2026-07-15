"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { fetchMenuItems, MenuItemView } from "@/lib/shop/menu";
import { useCart } from "@/lib/cart/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Clock,
  Star,
  Flame,
  Leaf,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Category = "all" | "food" | "drink";
type SortOption = "popular" | "price-low" | "price-high" | "time";

const categoryTabs: { id: Category; label: string; emoji: string }[] = [
  { id: "all", label: "All Items", emoji: "🍽️" },
  { id: "food", label: "Food", emoji: "🫕" },
  { id: "drink", label: "Drinks", emoji: "🥤" },
];

const sortOptions: { id: SortOption; label: string }[] = [
  { id: "popular", label: "⭐ Popular" },
  { id: "price-low", label: "↑ Price" },
  { id: "price-high", label: "↓ Price" },
  { id: "time", label: "⚡ Fastest" },
];

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showSort, setShowSort] = useState(false);

  // Get initial filter from URL
  useEffect(() => {
    const kind = searchParams.get("kind");
    if (kind === "food" || kind === "drink") {
      setSelectedCategory(kind);
    }
  }, [searchParams]);

  // Load menu items
  useEffect(() => {
    async function loadItems() {
      try {
        const menuItems = await fetchMenuItems();
        setItems(menuItems);
      } catch (error) {
        console.error("Error loading menu items:", error);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.kind === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "time":
          return (a.prepTimeMinutes || 15) - (b.prepTimeMinutes || 15);
        case "popular":
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });

    return filtered;
  }, [items, selectedCategory, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6">
      {/* Sticky search/filter bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-4 pb-3 space-y-3 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dishes, drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-11"
          />
        </div>

        {/* Category pills + sort toggle */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  selectedCategory === tab.id ?
                    "bg-primary text-white shadow-sm shadow-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort button */}
          <button
            onClick={() => setShowSort(!showSort)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold border transition-all ${
              showSort ?
                "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Sort
          </button>
        </div>

        {/* Sort options — reveal panel */}
        {showSort && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSortBy(opt.id);
                  setShowSort(false);
                }}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  sortBy === opt.id ?
                    "bg-secondary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {filteredItems.length}
          </span>{" "}
          {filteredItems.length === 1 ? "item" : "items"} found
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-primary font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Items grid */}
      <div className="px-4 pb-6">
        {filteredItems.length === 0 ?
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-3xl">
              🍽️
            </div>
            <h3 className="text-lg font-bold mb-2">Nothing found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term or category
            </p>
          </div>
        : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <BrowseCard
                key={item.id}
                item={item}
                onAdd={() => addToCart(item)}
              />
            ))}
          </div>
        }
      </div>
    </div>
  );
}

const BrowseCard = ({
  item,
  onAdd,
}: {
  item: MenuItemView;
  onAdd: () => void;
}) => (
  <div className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
    {/* Image */}
    <div className="relative h-32 bg-muted">
      <img
        src={item.image}
        alt={item.name}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Badges */}
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        {item.isFeatured && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
            <Star className="h-2 w-2 fill-white" />
            Popular
          </span>
        )}
        {item.isSpicy && !item.isFeatured && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
            <Flame className="h-2 w-2" />
            Hot
          </span>
        )}
        {item.isVegetarian && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
            <Leaf className="h-2 w-2" />
            Veg
          </span>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="p-3">
      <h4 className="text-xs font-semibold leading-tight line-clamp-1 mb-0.5">
        {item.name}
      </h4>
      <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1.5">
        {item.description}
      </p>
      <div className="flex items-center gap-2 mb-2.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          {item.prepTimeMinutes}m
        </span>
        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-muted text-[9px] font-medium text-muted-foreground">
          {item.kind === "drink" ? "🥤" : "🍽️"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-primary text-sm">
          GH₵{item.price.toFixed(0)}
        </span>
        <button
          onClick={onAdd}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
);
