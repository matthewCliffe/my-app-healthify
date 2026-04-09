import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("healthify_session")?.value;
  const role = request.cookies.get("healthify_role")?.value;
  const { pathname } = request.nextUrl;

  const needsAuth = pathname.startsWith("/dashboard");
  const needsAdmin = pathname.startsWith("/dashboard/admin");

  if (needsAuth && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (needsAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard?denied=1", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
