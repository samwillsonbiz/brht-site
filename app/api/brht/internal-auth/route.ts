import { NextResponse } from "next/server";
import {
  createInternalSession,
  internalAuthConfigured,
  internalAuthCookie,
  internalSessionFromRequest,
  validateInternalCredentials,
} from "@/lib/brht-internal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = internalSessionFromRequest(request);
  return NextResponse.json(
    {
      configured: internalAuthConfigured(),
      authenticated: Boolean(session),
      username: session?.username ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!internalAuthConfigured()) {
    return NextResponse.json(
      { error: "Internal BRHT authentication is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;
  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";

  if (!validateInternalCredentials(username, password)) {
    return NextResponse.json(
      { error: "Incorrect internal credentials." },
      { status: 401 },
    );
  }

  const token = createInternalSession(username);
  const response = NextResponse.json({ authenticated: true, username });
  response.cookies.set(internalAuthCookie.name, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: internalAuthCookie.maxAge,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(internalAuthCookie.name, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
