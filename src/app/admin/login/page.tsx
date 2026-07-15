"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ REMOVED: The auto-redirect useEffect that was causing the loop

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Sign in
      const userCredential = await signIn(email, password);
      const uid = userCredential.user?.uid || userCredential.uid;

      if (!uid) {
        setError("Failed to get user ID");
        await signOut();
        setLoading(false);
        return;
      }

      // Check if user has admin role
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        setError("User account not found. Please contact support.");
        await signOut();
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const role = userData?.role;

      if (role === "admin" || role === "staff") {
        toast.success(`Welcome back, ${userData?.displayName || "Admin"}!`);
        setLoading(false);
        // ✅ Simple redirect - no loops
        window.location.href = "/admin/dashboard";
      } else {
        setError("You don't have permission to access the admin panel");
        await signOut();
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Admin login error:", error);

      if (error.code === "auth/user-not-found") {
        setError(
          "No account found with this email. Please check and try again.",
        );
      } else if (error.code === "auth/wrong-password") {
        setError("Invalid password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl font-display font-bold text-foreground">
              Admin Panel
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Secure access for authorized personnel only
            </p>
          </div>

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-[11px] font-medium text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Secure Connection
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@makita.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 gap-2 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ?
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Authenticating...
                </>
              : <>
                  <Shield className="h-4 w-4" />
                  Access Admin Dashboard
                </>
              }
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Navigation
              </span>
            </div>
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Store
            </Button>
          </Link>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-[11px] text-muted-foreground/60">
              This area is restricted to authorized personnel only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
