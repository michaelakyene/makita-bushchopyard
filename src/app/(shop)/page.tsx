"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchFeaturedItems,
  fetchMenuItems,
  MenuItemView,
} from "@/lib/shop/menu";
import { useCart } from "@/lib/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  Star,
  Flame,
  Leaf,
  ChefHat,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  Plus,
  Zap,
  Award,
  Truck,
} from "lucide-react";

const categories = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "soups-stews", label: "Soups & Stews", emoji: "🫕" },
  { id: "rice-swallow", label: "Rice & Swallow", emoji: "🍚" },
  { id: "bush-meat", label: "Bush Meat", emoji: "🥩" },
  { id: "drinks", label: "Drinks", emoji: "🥤" },
];

const stats = [
  { icon: Truck, label: "Avg. Delivery", value: "25–35 min" },
  { icon: Award, label: "Free Delivery", value: "GH₵50+" },
  { icon: Star, label: "Rating", value: "4.8 / 5" },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItemView[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const [allItems, featured] = await Promise.all([
          fetchMenuItems(),
          fetchFeaturedItems(),
        ]);
        setItems(allItems);
        setFeaturedItems(featured);
      } catch (error) {
        console.error("Error loading menu:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const foodItems = items.filter((item) => item.kind === "food").slice(0, 6);
  const drinkItems = items.filter((item) => item.kind === "drink").slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative h-[62vh] min-h-[380px] max-h-[530px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&h=700&fit=crop&auto=format"
          alt="Authentic Ghanaian Jollof Rice"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/96 via-[#111827]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Open Now · Closes 10 PM
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-white/80">
              <MapPin className="h-3 w-3" />
              UG Legon, Accra
            </span>
          </div>

          <h1 className="font-display mb-3 text-[2.6rem] font-bold italic leading-[1.05] text-white">
            Authentic
            <br />
            Ghanaian
            <br />
            Cuisine
          </h1>

          <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/70">
            Bold flavors, fresh ingredients — delivered straight to your door.
          </p>

          <div className="flex gap-3">
            <Link href="/browse">
              <Button
                size="lg"
                className="bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Order Now
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/40"
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Build Meal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────── */}
      <div className="bg-charcoal text-white px-4 py-3.5">
        <div className="flex items-center justify-around">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <Icon className="mb-0.5 h-4 w-4 text-gold" />
                <p className="text-[10px] text-white/50 leading-none">
                  {stat.label}
                </p>
                <p className="text-sm font-bold text-gold mt-0.5 font-mono">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────── */}
      <div className="space-y-8 px-4 py-6">
        {/* Category chips */}
        <section>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  activeCategory === cat.id ?
                    "bg-primary text-white shadow-md shadow-primary/25 scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Popular Right Now ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold italic leading-tight">
                Popular Right Now
              </h2>
              <p className="text-xs text-muted-foreground">
                Most-ordered dishes today
              </p>
            </div>
            <Link
              href="/browse"
              className="flex items-center gap-0.5 text-sm font-semibold text-primary hover:gap-1.5 transition-all duration-150"
            >
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-4 scrollbar-hide">
            {featuredItems.length > 0 ?
              featuredItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="group flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="relative h-36 bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {item.isSpicy && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        <Flame className="h-2.5 w-2.5" /> Hot
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="absolute left-2 top-10 inline-flex items-center gap-0.5 rounded-full bg-green-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        <Leaf className="h-2.5 w-2.5" /> Veg
                      </span>
                    )}
                    <button
                      onClick={() => addToCart(item)}
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold leading-tight line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono font-bold text-primary text-sm">
                        GH₵{item.price.toFixed(0)}
                      </span>
                      <div className="flex items-center gap-0.5 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-medium">
                          {item.prepTimeMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : <p className="text-muted-foreground text-sm">
                No popular items yet
              </p>
            }
          </div>
        </section>

        {/* ── From Our Kitchen ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold italic leading-tight">
              From Our Kitchen
            </h2>
            <Link
              href="/browse"
              className="flex items-center gap-0.5 text-sm font-semibold text-primary"
            >
              View Menu <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {foodItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-28 bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  {item.isSpicy && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                      <Flame className="h-2 w-2" /> Hot
                    </span>
                  )}
                  {item.isVegetarian && (
                    <span className="absolute left-2 top-8 inline-flex items-center gap-0.5 rounded-full bg-green-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                      <Leaf className="h-2 w-2" /> Veg
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-semibold leading-tight line-clamp-1 mb-0.5">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary text-sm">
                      GH₵{item.price.toFixed(0)}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Drinks Section ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold italic leading-tight">
                Quench Your Thirst
              </h2>
              <p className="text-xs text-muted-foreground">
                Local brews & refreshments
              </p>
            </div>
            <Link
              href="/browse"
              className="flex items-center gap-0.5 text-sm font-semibold text-primary"
            >
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {drinkItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-36 rounded-2xl overflow-hidden border border-border bg-card shadow-sm"
              >
                <div className="relative h-28 bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-semibold leading-tight line-clamp-1 mb-2">
                    {item.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary text-sm">
                      GH₵{item.price.toFixed(0)}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Promo Cards ── */}
        <section className="grid grid-cols-2 gap-3 pb-2">
          <Link href="/browse">
            <div className="relative h-32 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-amber-600 p-4 text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-150">
              <ChefHat className="mb-2 h-8 w-8 opacity-80" />
              <p className="text-sm font-bold leading-tight">
                Build Your
                <br />
                Perfect Meal
              </p>
              <ChevronRight className="absolute bottom-3 right-3 h-5 w-5 opacity-50" />
            </div>
          </Link>
          <Link href="/orders">
            <div className="relative h-32 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-rose-800 p-4 text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-150">
              <Zap className="mb-2 h-8 w-8 opacity-80" />
              <p className="text-sm font-bold leading-tight">
                Track Your
                <br />
                Live Order
              </p>
              <ChevronRight className="absolute bottom-3 right-3 h-5 w-5 opacity-50" />
            </div>
          </Link>
        </section>

        {/* ── Featured spotlight ── */}
        <section className="relative overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=300&fit=crop&auto=format"
            alt="Ghanaian food spread"
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-gold" />
              <span className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                This Week
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white leading-tight mb-3 italic">
              Explore Our Full
              <br />
              Ghanaian Menu
            </h3>
            <Link href="/browse">
              <button className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition-colors">
                Browse All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
