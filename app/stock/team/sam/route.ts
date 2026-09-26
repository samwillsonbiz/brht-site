const SOURCE = "https://unsplash.com/photos/iFgRcqHznqg/download?force=true";

export async function GET() {
  const response = await fetch(SOURCE, {
    redirect: "follow",
    headers: { "User-Agent": "BRHT-CFO/1.0" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return new Response("Headshot unavailable", { status: 502 });
  }

  const body = await response.arrayBuffer();
  return new Response(body, {
    headers: {
      "Content-Type": response.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
