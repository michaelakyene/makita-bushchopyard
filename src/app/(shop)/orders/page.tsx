"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Package,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Order {
  id: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  createdAt: any;
  deliveryMethod: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersData);
      } catch (error: any) {
        console.error("Error loading orders:", error);
        if (error.code === "failed-precondition") {
          toast.info("Orders are loading. Please wait a moment and refresh.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">No Orders</h2>
        <p className="text-muted-foreground">
          Sign in to view your order history
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );
  const pastOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "cancelled",
  );

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">No Orders Yet</h2>
        <p className="text-muted-foreground">Start your first order today!</p>
        <Link href="/browse">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case "out-for-delivery":
        return (
          <Badge className="bg-blue-600">
            <Clock className="mr-1 h-3 w-3" />
            Out for Delivery
          </Badge>
        );
      case "preparing":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Preparing
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Order History</h1>
        <p className="text-muted-foreground">
          View all your past and current orders
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeOrders.length === 0 ?
            <div className="flex min-h-[40vh] flex-col items-center justify-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No active orders</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Start a new order to see it here
              </p>
              <Link href="/browse">
                <Button>Browse Menu</Button>
              </Link>
            </div>
          : activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                getStatusBadge={getStatusBadge}
              />
            ))
          }
        </TabsContent>

        <TabsContent value="past" className="mt-6 space-y-4">
          {pastOrders.length === 0 ?
            <div className="flex min-h-[40vh] flex-col items-center justify-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No past orders</h3>
              <p className="text-sm text-muted-foreground">
                Your order history will appear here
              </p>
            </div>
          : pastOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                getStatusBadge={getStatusBadge}
              />
            ))
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}

const OrderCard = ({ order, getStatusBadge }: any) => {
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="space-y-2 p-4">
          {order.items.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">
                GH₵ {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 3} more items
            </p>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold text-primary">
              GH₵ {order.total.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Button asChild className="flex-1">
                <Link href={`/order-tracking/${order.id}`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Track Order
                </Link>
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              Reorder
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href={`/order-tracking/${order.id}`}>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
