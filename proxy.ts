import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function notFound() {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

/**
 * Keep private tools out of search, retire the old draft scheduler, and
 * protect BRHT operating dashboards at the edge.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  if (
    pathname === "/fantasy/draft-scheduler" ||
    pathname.startsWith("/fantasy/draft-scheduler/")
  ) {
    return notFound();
  }

  const response = NextResponse.next();
  if (pathname === "/fantasy" || pathname.startsWith("/fantasy/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: [
    "/fantasy/:path*",
    "/api/fantasy/:path*",

  ],
};
