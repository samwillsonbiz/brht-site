import { NextResponse } from "next/server";

type RegionCode = "US" | "GB" | "AU" | "CA" | "ZA" | "NZ" | "IE" | "SG";
type ParsedTrend = { hashtag: string; posts: number; views: number; rank: number; region: RegionCode };
type ObservedTrend = { hashtag: string; posts: number; views: number; bestRank: number; regions: Set<RegionCode> };
type SourceSignal = { source: string; detail: string; url?: string; items?: number; comments?: number; views?: number };
type NewsContext = { headline?: string; url?: string };

const REGIONS: RegionCode[] = ["US", "GB", "AU", "CA", "ZA", "NZ", "IE", "SG"];
const REGION_NAMES: Record<RegionCode, string> = {
  US: "United States", GB: "United Kingdom", AU: "Australia", CA: "Canada",
  ZA: "South Africa", NZ: "New Zealand", IE: "Ireland", SG: "Singapore",
};

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\\u0023/gi, "#");
}

function pageText(html: string) {
  return decodeHtml(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metricToNumber(value: string) {
  const clean = value.replace(/,/g, "").trim().toUpperCase();
  const match = clean.match(/^([\d.]+)\s*([KMB])?$/);
  if (!match) return 0;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return 0;
  const multiplier = match[2] === "K" ? 1_000 : match[2] === "M" ? 1_000_000 : match[2] === "B" ? 1_000_000_000 : 1;
  return Math.round(base * multiplier);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function cleanHashtag(value: string) {
  return value.replace(/^#/, "").replace(/[^a-zA-Z0-9_]/g, "").trim();
}

function hashtagKey(value: string) {
  return cleanHashtag(value).replace(/_/g, "").toLowerCase();
}

function humanizeHashtag(value: string) {
  const clean = cleanHashtag(value).replace(/_/g, " ").trim();
  if (!clean) return "Trending topic";
  return clean
    .split(/\s+/)
    .map((word) => word.length <= 3 && word.toUpperCase() === word ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function queryTokens(value: string) {
  const stop = new Set(["the", "and", "for", "with", "from", "this", "that", "official", "video", "news", "latest"]);
  return value.toLowerCase().replace(/^#/, "").replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((token) => token.length >= 3 && !stop.has(token));
}

function relevant(text: string, query: string) {
  const wanted = queryTokens(query);
  if (!wanted.length) return false;
  const found = new Set(queryTokens(text));
  const matches = wanted.filter((token) => found.has(token)).length;
  return matches >= (wanted.length <= 2 ? 1 : 2);
}

function cleanHeadline(value?: string) {
  if (!value) return undefined;
  const cleaned = decodeHtml(value)
    .replace(/\s+-\s+[^-]{2,50}$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned.length < 5) return undefined;
  return cleaned.length > 150 ? `${cleaned.slice(0, 147).trimEnd()}…` : cleaned;
}

function parseVisibleTrends(html: string, region: RegionCode): ParsedTrend[] {
  const text = pageText(html);
  const results: ParsedTrend[] = [];
  const seen = new Set<string>();
  const pattern = /#([a-zA-Z0-9_]{2,80})(?:(?!#).){0,120}?([\d.,]+\s*[KMB]?)\s*Posts?(?:(?!#).){0,45}?([\d.,]+\s*[KMB]?)\s*Views?/gi;
  let match: RegExpExecArray | null;
  let rank = 1;
  while ((match = pattern.exec(text)) && results.length < 20) {
    const hashtag = cleanHashtag(match[1]);
    const key = hashtag.toLowerCase();
    if (!hashtag || seen.has(key)) continue;
    const posts = metricToNumber(match[2]);
    const views = metricToNumber(match[3]);
    if (!posts && !views) continue;
    seen.add(key);
    results.push({ hashtag, posts, views, rank, region });
    rank += 1;
  }
  return results;
}

function parseEmbeddedJson(html: string, region: RegionCode): ParsedTrend[] {
  const decoded = decodeHtml(html).replace(/\\"/g, '"');
  const results: ParsedTrend[] = [];
  const seen = new Set<string>();
  const patterns = [
    /"hashtagName"\s*:\s*"([^"]+)"[\s\S]{0,1600}?"publishCnt"\s*:\s*"?(\d+)"?[\s\S]{0,1600}?"(?:vv|videoViews|video_views)"\s*:\s*"?(\d+)"?/gi,
    /"hashtag_name"\s*:\s*"([^"]+)"[\s\S]{0,1600}?"(?:publish_cnt|publishCount)"\s*:\s*"?(\d+)"?[\s\S]{0,1600}?"(?:vv|videoViews|video_views|views)"\s*:\s*"?(\d+)"?/gi,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(decoded)) && results.length < 20) {
      const hashtag = cleanHashtag(match[1]);
      const key = hashtag.toLowerCase();
      if (!hashtag || seen.has(key)) continue;
      const posts = Number(match[2] ?? 0);
      const views = Number(match[3] ?? 0);
      if (!posts && !views) continue;
      seen.add(key);
      results.push({ hashtag, posts, views, rank: results.length + 1, region });
    }
    if (results.length) break;
  }
  return results;
}

async function fetchRegion(region: RegionCode): Promise<ParsedTrend[]> {
  const urls = [
    `https://ads.tiktok.com/creative/creativeCenter/trends?deviceType=pc&locale=en&period=7&region=${region}`,
    `https://ads.tiktok.com/creative/creativeCenter/trends/hashtag?deviceType=pc&locale=en&period=7&region=${region}`,
    `https://ads.tiktok.com/business/creativecenter/hashtag/find?countryCode=${region}&period=7`,
  ];
  for (const url of urls) {
    try {
      const response = await fetch(url, { next: { revalidate: 900 }, headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OutsideTheFeed/0.9; +https://brht.ai/outside-the-feed)",
        Accept: "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.8",
      }});
      if (!response.ok) continue;
      const html = await response.text();
      const visible = parseVisibleTrends(html, region);
      if (visible.length) return visible;
      const embedded = parseEmbeddedJson(html, region);
      if (embedded.length) return embedded;
    } catch { /* try next */ }
  }
  return [];
}

function mergeObserved(trends: ParsedTrend[]) {
  const exact = new Map<string, ObservedTrend>();
  for (const trend of trends) {
    const key = hashtagKey(trend.hashtag);
    const existing = exact.get(key);
    if (existing) {
      existing.posts = Math.max(existing.posts, trend.posts);
      existing.views = Math.max(existing.views, trend.views);
      existing.bestRank = Math.min(existing.bestRank, trend.rank);
      existing.regions.add(trend.region);
    } else {
      exact.set(key, { hashtag: trend.hashtag, posts: trend.posts, views: trend.views, bestRank: trend.rank, regions: new Set([trend.region]) });
    }
  }

  const merged: ObservedTrend[] = [];
  for (const trend of [...exact.values()].sort((a, b) => a.bestRank - b.bestRank || b.views - a.views)) {
    const key = hashtagKey(trend.hashtag);
    const related = merged.find((candidate) => {
      const candidateKey = hashtagKey(candidate.hashtag);
      const shortest = Math.min(key.length, candidateKey.length);
      return key === candidateKey || (shortest >= 7 && (key.includes(candidateKey) || candidateKey.includes(key)));
    });
    if (!related) { merged.push(trend); continue; }
    related.posts = Math.max(related.posts, trend.posts);
    related.views = Math.max(related.views, trend.views);
    related.bestRank = Math.min(related.bestRank, trend.bestRank);
    trend.regions.forEach((region) => related.regions.add(region));
    if (key.length < hashtagKey(related.hashtag).length) related.hashtag = trend.hashtag;
  }
  return merged;
}

function attentionFor(trend: ObservedTrend) {
  const rankSignal = Math.max(0, 30 - (trend.bestRank - 1) * 6);
  const viewSignal = Math.min(28, Math.log10(Math.max(10, trend.views)) * 3.6);
  const postSignal = Math.min(18, Math.log10(Math.max(10, trend.posts)) * 3.1);
  const regionSignal = Math.min(18, trend.regions.size * 4.5);
  return Math.max(50, Math.min(100, Math.round(24 + rankSignal + viewSignal + postSignal + regionSignal)));
}

async function blueskySignal(query: string): Promise<SourceSignal | null> {
  try {
    const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "100");
    url.searchParams.set("sort", "latest");
    const response = await fetch(url, { next: { revalidate: 600 }, headers: { "User-Agent": "OutsideTheFeed/0.9" } });
    if (!response.ok) return null;
    const data = (await response.json()) as { posts?: Array<any> };
    const cutoff = Date.now() - 7 * 86400000;
    const posts = (data.posts ?? []).filter((post) => {
      const timestamp = Date.parse(post.indexedAt ?? "");
      return relevant(String(post.record?.text ?? ""), query) && (!Number.isFinite(timestamp) || timestamp >= cutoff);
    });
    if (!posts.length) return null;
    const engagement = posts.reduce((sum, post) => sum + (post.likeCount ?? 0) + (post.repostCount ?? 0) + (post.replyCount ?? 0), 0);
    return { source: "Bluesky", detail: `${posts.length} recent posts · ${engagement} engagements`, url: `https://bsky.app/search?q=${encodeURIComponent(query)}`, items: posts.length };
  } catch { return null; }
}

async function gdeltSignal(query: string): Promise<{ signal: SourceSignal; headline?: string } | null> {
  try {
    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", query);
    url.searchParams.set("mode", "ArtList");
    url.searchParams.set("maxrecords", "50");
    url.searchParams.set("format", "json");
    url.searchParams.set("sort", "HybridRel");
    url.searchParams.set("timespan", "1d");
    const response = await fetch(url, { next: { revalidate: 600 }, headers: { "User-Agent": "OutsideTheFeed/0.9" } });
    if (!response.ok) return null;
    const data = (await response.json()) as { articles?: Array<{ title?: string; url?: string; domain?: string }> };
    const articles = (data.articles ?? []).filter((article) => relevant(article.title ?? "", query));
    if (!articles.length) return null;
    const outlets = new Set(articles.map((article) => article.domain).filter(Boolean));
    const best = articles.find((article) => article.title && article.url);
    return {
      signal: {
        source: "GDELT",
        detail: `${articles.length}${articles.length >= 50 ? "+" : ""} recent articles · ${outlets.size} outlets`,
        url: best?.url,
        items: articles.length,
      },
      headline: best?.title,
    };
  } catch { return null; }
}

async function googleNewsContext(query: string): Promise<NewsContext | null> {
  try {
    const url = new URL("https://news.google.com/rss/search");
    url.searchParams.set("q", `${query} when:2d`);
    url.searchParams.set("hl", "en-US");
    url.searchParams.set("gl", "US");
    url.searchParams.set("ceid", "US:en");
    const response = await fetch(url, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "OutsideTheFeed/0.9", Accept: "application/rss+xml,application/xml,text/xml" },
    });
    if (!response.ok) return null;
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 20);
    for (const item of items) {
      const block = item[1];
      const title = decodeHtml(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
      if (!title || !relevant(title, query)) continue;
      const link = decodeHtml(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "").trim();
      return { headline: title, url: link || undefined };
    }
    return null;
  } catch { return null; }
}

export async function GET() {
  const regional = await Promise.all(REGIONS.map((region) => fetchRegion(region)));
  const parsed = regional.flat();
  const observed = mergeObserved(parsed)
    .sort((a, b) => attentionFor(b) - attentionFor(a) || b.views - a.views)
    .slice(0, 12);

  const topics = await Promise.all(observed.map(async (trend, index) => {
    const regions = [...trend.regions];
    const query = cleanHashtag(trend.hashtag).replace(/_/g, " ");
    const regionCopy = regions.length > 1
      ? `across ${regions.length} markets`
      : `in ${REGION_NAMES[regions[0]] ?? regions[0] ?? "the selected market"}`;

    const [bluesky, gdelt, googleNews] = await Promise.all([
      blueskySignal(query),
      gdeltSignal(query),
      googleNewsContext(query),
    ]);

    const resolvedHeadline = cleanHeadline(gdelt?.headline) ?? cleanHeadline(googleNews?.headline);
    const resolvedTitle = resolvedHeadline ?? humanizeHashtag(trend.hashtag);

    const sources: SourceSignal[] = [{
      source: "TikTok",
      detail: `#${cleanHashtag(trend.hashtag)} · ${compactNumber(trend.posts)} posts · ${compactNumber(trend.views)} views · ${regions.length} market${regions.length === 1 ? "" : "s"}`,
      url: `https://ads.tiktok.com/creative/creativeCenter/trends?deviceType=pc&locale=en&period=7&region=${regions[0] ?? "US"}`,
      items: trend.posts,
      views: trend.views,
    }];
    if (bluesky) sources.push(bluesky);
    if (gdelt) sources.push(gdelt.signal);

    const description = resolvedHeadline
      ? `TikTok activity around this story is surging ${regionCopy}: ${compactNumber(trend.posts)} posts and ${compactNumber(trend.views)} views in the current trend window.`
      : `${resolvedTitle} is surging on TikTok ${regionCopy} over the last 7 days.`;

    return {
      rank: index + 1,
      title: resolvedTitle,
      description,
      query: resolvedHeadline ?? query,
      attention: Math.min(100, attentionFor(trend) + (bluesky ? 4 : 0) + (gdelt ? 5 : 0)),
      sourceCount: sources.length,
      platformCount: sources.length,
      sources,
      observedSocialItems: trend.posts + (bluesky?.items ?? 0),
      observedItems: trend.posts + (bluesky?.items ?? 0),
      observedComments: 0,
      observedViews: trend.views,
      attentionOnlyPlatforms: ["TikTok"],
      resolver: {
        rawHashtag: `#${cleanHashtag(trend.hashtag)}`,
        resolved: Boolean(resolvedHeadline),
        contextUrl: gdelt?.signal.url ?? googleNews?.url,
      },
    };
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    topics,
    sourceStatus: {
      tiktok: {
        ok: topics.length > 0,
        candidates: topics.length,
        regionsWithData: regional.filter((items) => items.length > 0).length,
        note: topics.length
          ? "TikTok hashtags are treated as discovery keys, then resolved into current human-readable headlines using recent GDELT/Google News context where available. TikTok comments are not included in Vibe."
          : "TikTok Creative Center did not expose parsable public trend rows on this refresh.",
      },
    },
  }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
}
