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

function privateHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

function dashboardAccess(request: NextRequest) {
  const username = process.env.BRHT_DASHBOARD_USERNAME;
  const password = process.env.BRHT_DASHBOARD_PASSWORD;

  // Production fails closed. Preview/local environments remain reviewable until
  // credentials are configured, and Vercel preview protection still applies.
  if (!username || !password) {
    if (process.env.VERCEL_ENV === "production") return notFound();
    return privateHeaders(NextResponse.next());
  }

  const expected = `Basic ${btoa(`${username}:${password}`)}`;
  if (request.headers.get("authorization") !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="BRHT Dashboards", charset="UTF-8"',
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  return privateHeaders(NextResponse.next());
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

  if (
    pathname === "/dashboards" ||
    pathname.startsWith("/dashboards/") ||
    pathname === "/api/dashboards" ||
    pathname.startsWith("/api/dashboards/")
  ) {
    return dashboardAccess(request);
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
    "/dashboards/:path*",
    "/api/dashboards/:path*",
  ],
};
