"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
  const total = getCartTotal();
  const deliveryFee = total > 0 ? 5.0 : 0;
  const finalTotal = total + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
        <p className="mb-6 text-muted-foreground">
          Add some delicious items to get started
        </p>
        <Link href="/browse">
          <Button size="lg">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Your Cart</h1>
        <p className="text-muted-foreground">
          {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cart.map((cartItem) => (
          <Card key={cartItem.item.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={cartItem.item.image}
                    alt={cartItem.item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{cartItem.item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        GH₵ {cartItem.item.price.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(
                            cartItem.item.id,
                            cartItem.quantity - 1,
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {cartItem.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(
                            cartItem.item.id,
                            cartItem.quantity + 1,
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="font-bold text-primary">
                      GH₵ {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="sticky bottom-24 border-2 border-primary shadow-xl">
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold">Order Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">GH₵ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                GH₵ {finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <Link href="/checkout">
            <Button
              size="lg"
              className="mt-6 w-full"
              disabled={cart.length === 0}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Continue Shopping */}
      <Link href="/browse">
        <Button variant="outline" className="w-full">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
}
