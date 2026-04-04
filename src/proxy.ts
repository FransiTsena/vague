import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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
    const role = token?.accessRole as string;
    
    // Admin only routes
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      // Allow Dept Heads into scheduling but not specific top-level admin things if they exist
      // For now, let's say /admin/scheduling/members is ADMIN only
      if (req.nextUrl.pathname === "/admin/scheduling/members" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/scheduling", req.url));
      }
    }
    
    // Dept Head / Admin routes
    if ((req.nextUrl.pathname.startsWith("/admin/staffing") || req.nextUrl.pathname.startsWith("/admin/scheduling")) && !["ADMIN", "DEPARTMENT_HEAD"].includes(role)) {
       return NextResponse.redirect(new URL("/", req.url));
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
