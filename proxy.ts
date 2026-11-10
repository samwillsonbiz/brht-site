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

function protectOperations(request: NextRequest) {
  const username = process.env.BRHT_OPS_USERNAME;
  const password = process.env.BRHT_OPS_PASSWORD;

  // An operations route must never become public because credentials were omitted.
  if (!username || !password) return notFound();

  const expected = `Basic ${btoa(`${username}:${password}`)}`;
  if (request.headers.get("authorization") !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="BRHT Operations", charset="UTF-8"',
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

/**
 * Protect internal operations views and keep private fantasy tools out of search.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/ops" || pathname.startsWith("/ops/")) {
    return protectOperations(request);
  }

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
  matcher: ["/fantasy/:path*", "/api/fantasy/:path*", "/ops/:path*"],
};
