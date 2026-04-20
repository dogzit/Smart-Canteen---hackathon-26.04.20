import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Нэвтэрсэн хэрэглэгчийг Signup руу оруулахгүй
  if (token && (pathname === "/signup" || pathname === "/")) {
    return NextResponse.redirect(new URL("/smart-canteen", request.url));
  }

  // Нэвтрээгүй бол Smart Canteen руу оруулахгүй
  if (!token && pathname.startsWith("/smart-canteen")) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup", "/smart-canteen/:path*"],
};
