import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Temporary private-mode access gate for Fantasy Lab.
 *
 * The draft scheduler is intentionally public so the league can submit its
 * availability. Every other Fantasy Lab page and Fantasy Lab API route is
 * intentionally unavailable until private access is implemented.
 *
 * To restore access later, remove this gate or replace it with authentication.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/fantasy/draft-scheduler") {
    return NextResponse.next();
  }

  if (
    pathname === "/fantasy" ||
    pathname.startsWith("/fantasy/") ||
    pathname === "/api/fantasy" ||
    pathname.startsWith("/api/fantasy/")
  ) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/fantasy/:path*", "/api/fantasy/:path*"],
};
