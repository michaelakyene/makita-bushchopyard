"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ✅ Skip sidebar for admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pt-20 lg:pt-6 pb-20 lg:pb-6">
        {children}
      </main>
    </div>
  );
}
