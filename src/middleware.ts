import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/admin/login",
  "/admin/dashboard",
  "/admin/orders",
  "/admin/menu",
  "/admin/staff",
  "/browse",
  "/cart",
  "/checkout",
  "/profile",
  "/orders",
  "/api",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ✅ Allow all public paths (including admin pages)
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // ✅ For any other path, allow access (no redirects)
  // The pages themselves will handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
