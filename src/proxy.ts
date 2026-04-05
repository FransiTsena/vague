import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { normalizeAccessRole } from "@/lib/auth/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/admin/scheduling", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Role-based access control
    const role = normalizeAccessRole((token as any)?.accessRole || (token as any)?.role);
    
    // Admin only route
    if (req.nextUrl.pathname === "/admin/scheduling/members" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/scheduling", req.url));
    }
    
    // Dept Head / Admin routes
    if (req.nextUrl.pathname.startsWith("/admin/staffing") || req.nextUrl.pathname.startsWith("/admin/scheduling")) {
      if (!role || (role !== "ADMIN" && role !== "DEPARTMENT_HEAD")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/me/:path*"],
};
