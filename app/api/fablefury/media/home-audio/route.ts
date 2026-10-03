import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400;

const AUDIO_ID = "1t-cKYyHNhGAMlLdAM1ZhT_KP43CYpmmy";

export async function GET() {
  const urls = [
    `https://drive.usercontent.google.com/download?id=${AUDIO_ID}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${AUDIO_ID}&confirm=t`,
  ];

  for (const url of urls) {
    const upstream = await fetch(url, { cache: "force-cache", redirect: "follow" });
    if (!upstream.ok || !upstream.body) continue;
    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  }

  return NextResponse.json({ error: "Home audio unavailable" }, { status: 502 });
}
