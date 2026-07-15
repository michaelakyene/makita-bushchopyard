"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import type { UserRole } from "@/types";

/**
 * Wrap any admin/staff page in this component to redirect unauthorized users.
 * This is a UX-layer guard only — Firestore security rules are the real
 * enforcement boundary, since client-side checks can always be bypassed.
 */
export function RequireRole({
  allow,
  children,
}: {
  allow: UserRole[];
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!role || !allow.includes(role)) {
      router.replace("/");
    }
  }, [loading, user, role, allow, router]);

  if (loading || !user || !role || !allow.includes(role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-body text-taupe">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
