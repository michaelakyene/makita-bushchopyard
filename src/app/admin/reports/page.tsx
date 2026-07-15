"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { doc as firestoreDoc, getDoc } from "firebase/firestore";
import { Shield, TrendingUp, ShoppingBag, Users, Calendar } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: any;
  items?: any[];
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topItems: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) {
        setLoading(true);
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(firestoreDoc(db, "users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data()?.role;
          setIsAdmin(role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [user, authLoading]);

  const loadReports = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const ordersSnap = await getDocs(
        query(collection(db, "orders"), orderBy("createdAt", "desc")),
      );
      const ordersData = ordersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);

      // Calculate stats
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce(
        (sum, order) => sum + (order.total || 0),
        0,
      );
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Count items
      const itemCount: Record<string, { name: string; count: number }> = {};
      ordersData.forEach((order) => {
        order.items?.forEach((item) => {
          if (itemCount[item.name]) {
            itemCount[item.name].count += item.quantity;
          } else {
            itemCount[item.name] = { name: item.name, count: item.quantity };
          }
        });
      });

      const topItems = Object.values(itemCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({ totalRevenue, totalOrders, avgOrderValue, topItems });
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadReports();
    }
  }, [isAdmin]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-blue-100 p-4 rounded-full">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Please Sign In</h2>
        <p className="text-muted-foreground">
          You need to be logged in to access this page.
        </p>
        <Button onClick={() => router.push("/admin/login")}>Admin Login</Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-red-100 p-4 rounded-full">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have admin permissions.
        </p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground">Sales analytics and insights</p>
        </div>
        <Button
          onClick={loadReports}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Calendar className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">
                  GH₵{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  GH₵{stats.avgOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topItems.length === 0 ?
            <p className="text-muted-foreground text-center py-8">
              No orders yet to generate reports
            </p>
          : <div className="space-y-3">
              {stats.topItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-primary">
                    {item.count} sold
                  </span>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {orders.length === 0 ?
              <p className="text-muted-foreground text-center py-8">
                No orders yet
              </p>
            : <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Order #</th>
                    <th className="text-left py-2">Customer</th>
                    <th className="text-left py-2 hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-medium">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-2">{order.customerName || "Guest"}</td>
                      <td className="py-2 text-muted-foreground hidden sm:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-2">
                        <Badge variant="outline" className="capitalize">
                          {order.status || "pending"}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-bold">
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
    </div>
  );
}
