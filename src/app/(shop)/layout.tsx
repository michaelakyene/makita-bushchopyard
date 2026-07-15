"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, ShoppingCart, User, MapPin, Bell } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { getCartItemCount } = useCart();
  const cartCount = getCartItemCount();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/browse", icon: Search, label: "Browse" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path) || false;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
                <span className="text-sm font-bold text-white tracking-tight">
                  MB
                </span>
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-foreground tracking-tight">
                  Makita Bushchopyard
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  Authentic Ghanaian Cuisine
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground hidden sm:block">
                  UCC, Cape Coast
                </span>
              </button>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md shadow-xl">
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-4 gap-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex flex-col items-center gap-1 py-3 px-1 transition-colors relative ${
                    active ? "text-primary" : (
                      "text-muted-foreground hover:text-foreground"
                    )
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                  )}
                  <div className="relative">
                    <Icon
                      className={`h-5 w-5 transition-transform ${
                        active ? "scale-110" : ""
                      }`}
                    />
                    {item.badge != null && item.badge > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      active ? "text-primary" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
