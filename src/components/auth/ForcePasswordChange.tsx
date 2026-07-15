// src/components/auth/ForcePasswordChange.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { updatePassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ForcePasswordChangeProps {
  children: React.ReactNode;
}

export function ForcePasswordChange({ children }: ForcePasswordChangeProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDefaultAdmin, setIsDefaultAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkDefaultAdmin() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Check if this is the default admin and password hasn't been changed
          setIsDefaultAdmin(
            data.isDefaultAdmin === true && data.passwordChanged !== true,
          );
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkDefaultAdmin();
  }, [user]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!user) {
      toast.error("No user found. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      // Update the password in Firebase Auth
      await updatePassword(user, newPassword);

      // Update Firestore to mark password as changed
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          isDefaultAdmin: false,
          passwordChanged: true,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      setIsDefaultAdmin(false);
      toast.success("Password updated successfully!");

      // Refresh to show admin panel
      router.refresh();
    } catch (error: any) {
      console.error("Error updating password:", error);

      if (error.code === "auth/requires-recent-login") {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else {
        toast.error("Failed to update password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Force password change for default admin
  if (isDefaultAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-2 border-primary shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              🔒 Password Change Required
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              You're using the default admin account. For security, you must set
              a new password before continuing.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  New Password <span className="text-destructive">*</span>
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={submitting}
              >
                {submitting ?
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Updating...
                  </>
                : "Update Password & Continue"}
              </Button>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                <p className="text-xs text-yellow-800 text-center">
                  ⚠️ This is a security requirement. You won't be able to access
                  the admin panel until you change this password.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin with password already changed - render children
  return <>{children}</>;
}
