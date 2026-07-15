"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  ArrowRight,
  Clock,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    totalItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!isAdmin) return;

      try {
        const ordersSnap = await getDocs(collection(db, "orders"));
        const orders = ordersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        const totalOrders = orders.length;
        const revenue = orders.reduce(
          (sum, order) => sum + (order.total || 0),
          0,
        );
        const pendingOrders = orders.filter(
          (o) => o.status === "pending" || o.status === "confirmed",
        ).length;

        const menuSnap = await getDocs(collection(db, "menuItems"));
        const totalItems = menuSnap.size;

        setStats({ totalOrders, revenue, pendingOrders, totalItems });

        const recentQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        const recentSnap = await getDocs(recentQuery);
        setRecentOrders(
          recentSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[],
        );
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAdmin]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      confirmed: { variant: "secondary", label: "Confirmed" },
      preparing: { variant: "default", label: "Preparing" },
      ready: { variant: "default", label: "Ready" },
      "out-for-delivery": { variant: "default", label: "Out for Delivery" },
      delivered: { variant: "default", label: "Delivered" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const c = config[status] || config.pending;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your restaurant.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">
                  GH₵{stats.revenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menu Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold">Recent Orders</h2>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ?
              <div className="p-8 text-center text-muted-foreground">
                No orders yet
              </div>
            : <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.customerName || "Guest"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary">
                        GH₵{order.total?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20 hover:border-primary">
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="font-semibold">Manage Orders</h3>
              <p className="text-xs text-muted-foreground">
                View and update order status
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/menu">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20 hover:border-primary">
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="font-semibold">Manage Menu</h3>
              <p className="text-xs text-muted-foreground">
                Add or edit menu items
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/staff">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20 hover:border-primary">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="font-semibold">Manage Staff</h3>
              <p className="text-xs text-muted-foreground">Manage your team</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20 hover:border-primary">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="font-semibold">View Reports</h3>
              <p className="text-xs text-muted-foreground">
                Analytics and insights
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
