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

export async function middleware(req: NextRequest) {
  const token: any = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const role = token?.user?.role;
  const url = req.nextUrl.clone();
  //================================non authenticated routes (/login)
  if (non_authenticated_routes.includes(url.pathname) && token) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  //===============================user routes (/cart,/user)
  if (!token && /^\/(user|cart)/.test(url.pathname)) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  //===============================admin or seller routes(/auth)
  if (
    url.pathname.startsWith("/auth") &&
    (!["seller", "admin"].includes(role) ||
      (admin_only_routes.includes(url.pathname) && role !== "admin"))
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
  ],
};
