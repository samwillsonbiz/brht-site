import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * The shared draft scheduling calendar has been retired.
 *
 * The previously shared link must NOT redirect to Fantasy Lab, expose
 * its navigation, or reveal its route structure. The dashboard and
 * Fantasy Lab API routes are otherwise accessible again.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  if (
    pathname === "/fantasy/draft-scheduler" ||
    pathname.startsWith("/fantasy/draft-scheduler/")
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

  // Keep these tools out of search engines, but allow directly entered URLs.
  const response = NextResponse.next();
  if (pathname === "/fantasy" || pathname.startsWith("/fantasy/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: ["/fantasy/:path*", "/api/fantasy/:path*"],
};
