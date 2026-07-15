"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  redirectTo = "/admin/login",
}: RequireRoleProps) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip check if on admin login page
    if (pathname === "/admin/login") {
      setLoading(false);
      setAuthorized(true);
      return;
    }

    async function checkAccess() {
      if (authLoading) {
        setLoading(true);
        return;
      }

      if (!user) {
        window.location.href = redirectTo;
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role as UserRole;

          if (allowedRoles.includes(role)) {
            setAuthorized(true);
          } else {
            window.location.href = redirectTo;
          }
        } else {
          window.location.href = redirectTo;
        }
      } catch (error) {
        console.error("Error checking role:", error);
        window.location.href = redirectTo;
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [user, authLoading, allowedRoles, redirectTo, pathname]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return <RequireRole allowedRoles={["admin"]}>{children}</RequireRole>;
}

export function RequireStaff({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allowedRoles={["staff", "admin"]}>{children}</RequireRole>
  );
}
