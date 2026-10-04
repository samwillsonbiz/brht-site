import { NextResponse } from "next/server";

const DRIVE_ID_RE = /^[A-Za-z0-9_-]{10,}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const requested = Number(searchParams.get("size") ?? "1200");
  const size = Number.isFinite(requested) ? Math.max(128, Math.min(2400, Math.round(requested))) : 1200;

  if (!DRIVE_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid asset id." }, { status: 400 });
  }

  const source = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${size}`;

  try {
    const upstream = await fetch(source, {
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 * 30 },
      headers: { "User-Agent": "FableFury/1.0" },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Asset source unavailable." }, { status: upstream.status });
    }

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/webp",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000, immutable",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Fable Fury asset proxy failed", error);
    return NextResponse.json({ error: "Could not load asset." }, { status: 502 });
  }
}
