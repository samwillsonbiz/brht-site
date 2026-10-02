import { NextResponse } from "next/server";

type SourceSignal = {
  source: string;
  detail: string;
  url?: string;
  items?: number;
  comments?: number;
  views?: number;
};

function cleanText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value: string) {
  const stop = new Set(["the", "and", "for", "with", "from", "this", "that", "official", "trailer", "video"]);
  return value
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !stop.has(token));
}

function relevant(text: string, query: string) {
  const queryTokens = tokens(query);
  if (!queryTokens.length) return false;
  const haystack = new Set(tokens(text));
  const matches = queryTokens.filter((token) => haystack.has(token)).length;
  const required = queryTokens.length <= 2 ? 1 : 2;
  return matches >= required;
}

async function blueskySignal(query: string): Promise<SourceSignal | null> {
  try {
    const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "100");
    url.searchParams.set("sort", "latest");
    const response = await fetch(url, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "OutsideTheFeed/0.8" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { posts?: Array<any> };
    const cutoff = Date.now() - 7 * 86400000;
    const posts = (data.posts ?? []).filter((post) => {
      const text = String(post.record?.text ?? "");
      const timestamp = Date.parse(post.indexedAt ?? "");
      return relevant(text, query) && (!Number.isFinite(timestamp) || timestamp >= cutoff);
    });
    if (!posts.length) return null;
    const engagement = posts.reduce((sum, post) => sum + (post.likeCount ?? 0) + (post.repostCount ?? 0) + (post.replyCount ?? 0), 0);
    return {
      source: "Bluesky",
      detail: `${posts.length} recent matching posts · ${engagement} engagements`,
      url: `https://bsky.app/search?q=${encodeURIComponent(query)}`,
      items: posts.length,
    };
  } catch {
    return null;
  }
}

async function gdeltSignal(query: string): Promise<{ source: SourceSignal; description?: string } | null> {
  try {
    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", query);
    url.searchParams.set("mode", "ArtList");
    url.searchParams.set("maxrecords", "50");
    url.searchParams.set("format", "json");
    url.searchParams.set("sort", "HybridRel");
    url.searchParams.set("timespan", "1d");
    const response = await fetch(url, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "OutsideTheFeed/0.8" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { articles?: Array<{ title?: string; url?: string; domain?: string }> };
    const articles = (data.articles ?? []).filter((article) => relevant(article.title ?? "", query));
    if (!articles.length) return null;
    const outlets = new Set(articles.map((article) => article.domain).filter(Boolean));
    const best = articles.find((article) => article.title && article.url);
    return {
      source: {
        source: "GDELT",
        detail: `${articles.length}${articles.length >= 50 ? "+" : ""} recent articles · ${outlets.size} outlets`,
        url: best?.url,
        items: articles.length,
      },
      description: best?.title ? cleanText(best.title) : undefined,
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 120);
  if (query.length < 2) return NextResponse.json({ sources: [] });

  const [bluesky, gdelt] = await Promise.all([
    blueskySignal(query),
    gdeltSignal(query),
  ]);

  const sources = [bluesky, gdelt?.source].filter(Boolean);
  return NextResponse.json({
    query,
    sources,
    description: gdelt?.description,
  }, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" },
  });
}
