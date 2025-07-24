import { NextResponse } from "next/server";

export const middleware = (req) => {
  const pathname = req.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/room");

  const token =
    req.cookies.get("session")?.value || req.headers.get("Authorization");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/room/:path*"],
};
