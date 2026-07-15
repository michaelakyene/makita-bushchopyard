"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Menu as MenuIcon,
  Users,
  BarChart3, // ✅ Added for Reports
  LogOut,
  Home,
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { path: "/admin/menu", icon: MenuIcon, label: "Menu Management" },
  { path: "/admin/staff", icon: Users, label: "Staff" },
  { path: "/admin/reports", icon: BarChart3, label: "Reports" }, // ✅ Added Reports
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 w-64 bg-charcoal text-white border-r border-white/10 z-40">
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Makita <span className="text-primary">Admin</span>
          </h2>
          <p className="text-sm text-white/60 mt-0.5">Management Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active ?
                    "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-white" : ""}`} />
                <span className="font-medium">{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 mb-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/30 text-white text-sm font-bold">
              {user?.displayName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.displayName || "Admin User"}
              </p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm"
          >
            <Home className="h-4 w-4" />
            <span>Back to Store</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/60 hover:bg-destructive/20 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-white/10 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-2.5 px-3 text-xs transition-colors ${
                  active ? "text-primary" : "text-white/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 mb-0.5 ${
                    active ? "text-primary" : "text-white/50"
                  }`}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <span className="mt-0.5 h-0.5 w-6 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="lg:hidden h-16" />
    </>
  );
}
