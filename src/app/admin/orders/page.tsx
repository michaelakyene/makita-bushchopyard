"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  where,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  paymentMethod: string;
  specialInstructions?: string;
  isGuest?: boolean;
  createdAt: any;
}

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "border-yellow-500 text-yellow-600",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "border-blue-500 text-blue-600",
  },
  {
    value: "preparing",
    label: "Preparing",
    color: "border-purple-500 text-purple-600",
  },
  {
    value: "ready",
    label: "Ready",
    color: "border-indigo-500 text-indigo-600",
  },
  {
    value: "out-for-delivery",
    label: "Out for Delivery",
    color: "border-blue-600 text-blue-600",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "border-green-600 text-green-600",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "border-red-600 text-red-600",
  },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

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

  const loadOrders = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
    }
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Order status updated to ${newStatus}`);
      await loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusOptions.find((s) => s.value === status);
    if (!config) return <Badge variant="outline">{status}</Badge>;
    return (
      <Badge variant="outline" className={`${config.color} capitalize`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "MMM dd, yyyy • h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const activeOrders = filteredOrders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );
  const completedOrders = filteredOrders.filter(
    (order) => order.status === "delivered" || order.status === "cancelled",
  );

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Orders Management</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <Button
          onClick={loadOrders}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeOrders.length === 0 ?
            <Card>
              <CardContent className="flex min-h-[40vh] items-center justify-center p-12">
                <p className="text-muted-foreground">No active orders</p>
              </CardContent>
            </Card>
          : activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                updateOrderStatus={updateOrderStatus}
                updating={updating}
              />
            ))
          }
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedOrders.length === 0 ?
            <Card>
              <CardContent className="flex min-h-[40vh] items-center justify-center p-12">
                <p className="text-muted-foreground">No completed orders</p>
              </CardContent>
            </Card>
          : completedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                updateOrderStatus={updateOrderStatus}
                updating={updating}
              />
            ))
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}

const OrderCard = ({
  order,
  getStatusBadge,
  formatDate,
  updateOrderStatus,
  updating,
}: any) => {
  const canUpdate =
    order.status !== "delivered" && order.status !== "cancelled";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h3 className="text-lg font-bold">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h3>
              {getStatusBadge(order.status)}
              {order.isGuest && (
                <Badge variant="outline" className="text-xs">
                  Guest
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              GH₵ {order.total.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.paymentMethod}
            </p>
          </div>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-semibold">Customer</p>
            <p className="text-sm text-muted-foreground">
              {order.customerName}
            </p>
            {order.customerPhone && (
              <p className="text-sm text-muted-foreground">
                {order.customerPhone}
              </p>
            )}
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold">Delivery</p>
            <p className="text-sm text-muted-foreground capitalize">
              {order.deliveryMethod}
            </p>
            {order.deliveryAddress && (
              <p className="text-sm text-muted-foreground">
                {order.deliveryAddress}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 border-t border-border pt-4">
          <p className="mb-2 text-sm font-semibold">Order Items</p>
          <div className="space-y-2">
            {order.items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  GH₵ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          {order.specialInstructions && (
            <p className="mt-2 text-sm text-muted-foreground">
              📝 {order.specialInstructions}
            </p>
          )}
        </div>

        {canUpdate && (
          <div className="flex flex-wrap gap-2">
            <Select
              value={order.status}
              onValueChange={(value: string) =>
                updateOrderStatus(order.id, value)
              }
              disabled={updating === order.id}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updating === order.id && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            )}
            <Button size="sm" variant="ghost">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
