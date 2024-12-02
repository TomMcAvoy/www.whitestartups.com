// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withSession } from "./middleware/redis-store";

export async function middleware(request: NextRequest) {
  // Exclude public paths
  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const { session } = await withSession(request);

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    "/((?!auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
