"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  MapPin,
  Heart,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  // ✅ Guest view - show sign in options instead of redirecting
  if (!user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-muted p-6 rounded-full">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Welcome, Guest!
              </h2>
              <p className="text-muted-foreground max-w-sm">
                Sign in to view your orders, save favorites, and manage your
                account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Link href="/login">
                  <Button className="w-full sm:w-auto">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 You can still order without an account. Visit the Browse page
                to start ordering!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Guest Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/browse">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
                <h4 className="font-semibold text-foreground">Browse Menu</h4>
                <p className="text-xs text-muted-foreground">Start ordering</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/login">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <History className="h-8 w-8 mx-auto text-primary mb-2" />
                <h4 className="font-semibold text-foreground">Sign In</h4>
                <p className="text-xs text-muted-foreground">
                  View order history
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  const initials =
    user.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <Card className="border-2 border-primary">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-primary flex-shrink-0">
              <AvatarFallback className="bg-primary text-xl sm:text-2xl text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {user.displayName || "User"}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground truncate">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="gap-2 w-full sm:w-auto flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">12</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-secondary">4</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Favorites
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">500</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Options */}
      <Card>
        <CardContent className="p-0">
          <Link
            href="/orders"
            className="flex items-center justify-between p-4 border-b border-border transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <History className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">Order History</p>
                <p className="text-xs text-muted-foreground truncate">
                  View past orders
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </Link>

          <div className="flex items-center justify-between p-4 border-b border-border transition-colors hover:bg-accent">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Heart className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">Favorite Items</p>
                <p className="text-xs text-muted-foreground truncate">
                  Your saved favorites
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between p-4 border-b border-border transition-colors hover:bg-accent">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">Saved Addresses</p>
                <p className="text-xs text-muted-foreground truncate">
                  Manage delivery locations
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between p-4 border-b border-border transition-colors hover:bg-accent">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <Settings className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">Settings</p>
                <p className="text-xs text-muted-foreground truncate">
                  Preferences & notifications
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between p-4 transition-colors hover:bg-accent">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">Privacy & Security</p>
                <p className="text-xs text-muted-foreground truncate">
                  Manage your account
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
