"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  ArrowLeft,
  Send,
  Package,
  Clock,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { RESTAURANT_CONFIG } from "@/lib/constants";
import { sendOrderToWhatsApp } from "@/lib/whatsapp/client";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "dine-in" | "takeaway" | "delivery"
  >("takeaway");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "mobile" | "cash"
  >("mobile");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.displayName || "");
    }
  }, [user]);

  // Check if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !isComplete) {
      router.push("/cart");
      toast.error("Your cart is empty");
    }
  }, [cart, router, isComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    setIsProcessing(true);

    try {
      // ✅ Step 1: Prepare order data
      const orderPayload = {
        userId: user?.uid || "guest",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === "delivery" ? deliveryAddress.trim() : null,
        paymentMethod,
        specialInstructions: specialInstructions.trim() || null,
        items: cart.map((item) => ({
          menuItemId: item.item.id,
          name: item.item.name,
          price: item.item.price,
          quantity: item.quantity,
        })),
        subtotal: total,
        tax: 0,
        total: total,
        status: "pending",
        isGuest: !user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // ✅ Step 2: Save to Firestore
      const docRef = await addDoc(collection(db, "orders"), orderPayload);
      const newOrderId = docRef.id;
      setOrderId(newOrderId);

      // ✅ Step 3: Create full order object for WhatsApp
      const fullOrder = {
        id: newOrderId,
        ...orderPayload,
        createdAt: new Date().toISOString(),
      };
      setOrderData(fullOrder);

      // ✅ Step 4: Clear cart
      clearCart();
      setIsComplete(true);

      // ✅ Step 5: Send WhatsApp notification
      try {
        sendOrderToWhatsApp(fullOrder);
        toast.success("Order placed! Staff notified via WhatsApp.");
      } catch (notifyError) {
        console.error("WhatsApp notification error:", notifyError);
        // Order is still placed successfully even if WhatsApp fails
        toast.success("Order placed successfully!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Success State
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-display font-bold text-foreground">
          Order Placed! 🎉
        </h2>
        <p className="text-muted-foreground max-w-md">
          {user ?
            "Thank you for your order! We'll start preparing it right away."
          : "Thank you for your order! Please keep your order number for reference."
          }
        </p>
        {orderId && (
          <div className="bg-muted px-4 py-2 rounded-lg">
            <p className="text-sm font-mono">
              Order #{orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        {/* ✅ WhatsApp Notification Button */}
        {orderData && (
          <div className="w-full max-w-md bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <Send className="h-5 w-5" />
              <span className="font-semibold">Notify Staff via WhatsApp</span>
            </div>
            <p className="text-sm text-green-600">
              Send your order details directly to the restaurant.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
              onClick={() => sendOrderToWhatsApp(orderData)}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              Send to WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground">
              📱 Order will be sent to {RESTAURANT_CONFIG.WHATSAPP_DISPLAY}
            </p>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md">
            <p className="text-sm text-yellow-700">
              💡 Tip: Create an account to track your orders and reorder easily!
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Link href={user ? "/orders" : "/browse"}>
            <Button>{user ? "View Orders" : "Continue Shopping"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Checkout Form
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cart">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Checkout</h1>
      </div>

      {/* Guest notice */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <p>👋 You're ordering as a guest. No account required!</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="024 123 4567"
                  />
                </div>
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground">
                  🔒 No account needed. We'll only use this info for your order.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value: "dine-in" | "takeaway" | "delivery") =>
                  setDeliveryMethod(value)
                }
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway" className="cursor-pointer">
                    Takeaway
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dine-in" id="dine-in" />
                  <Label htmlFor="dine-in" className="cursor-pointer">
                    Dine In
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="cursor-pointer">
                    Delivery
                  </Label>
                </div>
              </RadioGroup>

              {deliveryMethod === "delivery" && (
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "card" | "mobile" | "cash") =>
                  setPaymentMethod(value)
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="mobile" id="mobile" />
                  <Label
                    htmlFor="mobile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile Money
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label
                    htmlFor="card"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                    Card
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label
                    htmlFor="cash"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Banknote className="h-4 w-4" />
                    Cash
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests? (e.g., extra spicy, no onions)"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.item.id}
                    className="flex justify-between text-sm py-1"
                  >
                    <span>
                      {item.quantity}x {item.item.name}
                    </span>
                    <span className="font-medium">
                      GH₵{(item.item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>GH₵{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>GH₵0.00</span>
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>GH₵5.00</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">GH₵{total.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isProcessing || cart.length === 0}
                >
                  {isProcessing ?
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  : <>
                      <Clock className="h-4 w-4" />
                      Place Order
                    </>
                  }
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
