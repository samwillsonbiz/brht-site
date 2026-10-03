import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400;

const DRIVE_IDS = ["1ijFNar-AFAsH4Jgnt3TZLkwg76eyYi4a", "1Gl9e3yQiP0kYffkk7E0toXOTNRk6pHzK"];

async function fetchDriveFile(id: string) {
  const candidates = [
    `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${id}&confirm=t`,
  ];
  for (const url of candidates) {
    const response = await fetch(url, { cache: "force-cache", redirect: "follow" });
    if (response.ok && response.body) return response;
  }
  return null;
}

export async function GET() {
  for (const id of DRIVE_IDS) {
    const upstream = await fetchDriveFile(id);
    if (!upstream) continue;
    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "video/mp4",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  }
  return NextResponse.json({ error: "Home video unavailable" }, { status: 502 });
}
