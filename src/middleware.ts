import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const non_authenticated_routes = ["/forgot-password", "/signup", "/login"];
const admin_only_routes = [
  "/auth/settings",
  "/auth/dashboard",
  "/auth/categories",
  "/auth/sub-categories",
  "/auth/seller-request",
  "/auth/boost-approvals",
  "/auth/sellers",
  "/auth/invoices",
  "/auth/users",
  "/auth/enquiry",
];

// Routes that allow guest access (cart, checkout, checkout success)
const guest_allowed_routes = ["/cart", "/checkout", "/checkoutsuccess"];

export async function middleware(req: NextRequest) {
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as { user?: { role?: string; type?: string; active_role?: string } } | null;
  const url = req.nextUrl.clone();

  //================================non authenticated routes (/login)
  if (non_authenticated_routes.includes(url.pathname) && token) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Allow guest access to cart and checkout pages
  if (guest_allowed_routes.some((route) => url.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  //===============================user routes (/user) - require authentication
  if (!token && /^\/user/.test(url.pathname)) {
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  //===============================admin, seller, delivery_company, or driver routes(/auth)
  const role       = token?.user?.role        ?? "";
  const activeRole = token?.user?.active_role ?? "";

  const isAdmin   = ["super_admin", "admin"].includes(role) ||
                    ["super_admin", "admin"].includes(activeRole);
  const isAllowed = isAdmin ||
                    ["seller", "delivery_company", "driver"].includes(role) ||
                    ["seller", "delivery_company", "driver"].includes(activeRole);

  if (
    url.pathname.startsWith("/auth") &&
    (!isAllowed ||
      (admin_only_routes.some(r => url.pathname.startsWith(r)) && !isAdmin))
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Applies next-auth only to matching routes - can be regex
export const config = {
  matcher: [
    "/user(/.*)?",
    "/auth(/.*)?",
    "/forgot-password",
    "/signup",
    "/login",
    "/cart",
    "/checkout",
    "/checkoutsuccess(/.*)?",
  ],
};
