
import { NextResponse } from "next/server";

export const revalidate = 21600;

const products = [
  { handle: "prod12", key: "moisturizer" },
  { handle: "prod6", key: "blu" },
  { handle: "prod19", key: "emerald" },
  { handle: "prod30", key: "lotion" },
  { handle: "prod20", key: "eye" },
];

function imageFromHtml(html: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/(?:og:image|twitter:image)/i.test(tag)) continue;
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (content) return content.replaceAll("&amp;", "&").startsWith("//") ? "https:" + content.replaceAll("&amp;", "&") : content.replaceAll("&amp;", "&");
  }
  return null;
}

async function fetchPhoto(handle: string): Promise<string | null> {
  const domain = "https://ceciliasproducts.com";
  try {
    const response = await fetch(domain + "/products/" + handle + ".js", {
      headers: { "Accept": "application/json", "User-Agent": "Cecilia-Storefront-Concept/1.0" },
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(7000)
    });
    if (response.ok) {
      const product = await response.json();
      const src: string | undefined = product.featured_image || product.images?.[0];
      if (src) return src.startsWith("//") ? "https:" + src : src;
    }
  } catch {}
  try {
    const response = await fetch(domain + "/products/" + handle, {
      headers: { "Accept": "text/html", "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(7000)
    });
    if (response.ok) return imageFromHtml(await response.text());
  } catch {}
  return null;
}

export async function GET() {
  const data = await Promise.all(products.map(async ({handle,key}) => ({
    key, image: await fetchPhoto(handle)
  })));
  return NextResponse.json({ products: data }, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
  });
}
