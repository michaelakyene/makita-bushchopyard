"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserRole } from "@/types";

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RequireRole({
  children,
  allowedRoles,
  redirectTo = "/",
}: RequireRoleProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkUserRole() {
      if (authLoading) return;

      // If no user, redirect to login
      if (!user) {
        router.push("/login");
        setLoading(false);
        return;
      }

      try {
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const role = data.role as UserRole;
          setUserRole(role);

          // Check if user's role is allowed
          if (allowedRoles.includes(role)) {
            setAuthorized(true);
          } else {
            // User doesn't have permission - redirect
            router.push(redirectTo);
          }
        } else {
          // User document doesn't exist - redirect
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    }

    checkUserRole();
  }, [user, authLoading, router, allowedRoles, redirectTo]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authorized
  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

// Optional: Convenience component for admin only
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return <RequireRole allowedRoles={["admin"]}>{children}</RequireRole>;
}

// Optional: Convenience component for staff or admin
export function RequireStaff({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allowedRoles={["staff", "admin"]}>{children}</RequireRole>
  );
}
