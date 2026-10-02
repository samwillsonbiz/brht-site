import { NextResponse } from "next/server";

type RegionCode = "US" | "GB" | "AU" | "CA" | "ZA" | "NZ" | "IE" | "SG";

type ParsedTrend = {
  hashtag: string;
  posts: number;
  views: number;
  rank: number;
  region: RegionCode;
};

type ObservedTrend = {
  hashtag: string;
  posts: number;
  views: number;
  bestRank: number;
  regions: Set<RegionCode>;
};

const REGIONS: RegionCode[] = ["US", "GB", "AU", "CA", "ZA", "NZ", "IE", "SG"];

const REGION_NAMES: Record<RegionCode, string> = {
  US: "United States",
  GB: "United Kingdom",
  AU: "Australia",
  CA: "Canada",
  ZA: "South Africa",
  NZ: "New Zealand",
  IE: "Ireland",
  SG: "Singapore",
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
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

function displayHashtag(value: string) {
  const clean = cleanHashtag(value);
  return `#${clean.replace(/_/g, " ")}`;
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
      const response = await fetch(url, {
        next: { revalidate: 900 },
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OutsideTheFeed/0.8; +https://brht.ai/outside-the-feed)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.8",
        },
      });
      if (!response.ok) continue;
      const html = await response.text();
      const visible = parseVisibleTrends(html, region);
      if (visible.length) return visible;
      const embedded = parseEmbeddedJson(html, region);
      if (embedded.length) return embedded;
    } catch {
      // Try next public Creative Center URL shape.
    }
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
      exact.set(key, {
        hashtag: trend.hashtag,
        posts: trend.posts,
        views: trend.views,
        bestRank: trend.rank,
        regions: new Set([trend.region]),
      });
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
    if (!related) {
      merged.push(trend);
      continue;
    }
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

export async function GET() {
  const regional = await Promise.all(REGIONS.map((region) => fetchRegion(region)));
  const parsed = regional.flat();
  const observed = mergeObserved(parsed)
    .sort((a, b) => attentionFor(b) - attentionFor(a) || b.views - a.views)
    .slice(0, 12);

  const topics = observed.map((trend, index) => {
    const regions = [...trend.regions];
    const regionCopy = regions.length > 1
      ? `across ${regions.length} markets`
      : `in ${REGION_NAMES[regions[0]] ?? regions[0] ?? "the selected market"}`;

    return {
      rank: index + 1,
      title: displayHashtag(trend.hashtag),
      description: `${displayHashtag(trend.hashtag)} is surging on TikTok ${regionCopy} over the last 7 days.`,
      query: cleanHashtag(trend.hashtag).replace(/_/g, " "),
      attention: attentionFor(trend),
      sourceCount: 1,
      platformCount: 1,
      sources: [{
        source: "TikTok",
        detail: `${compactNumber(trend.posts)} posts · ${compactNumber(trend.views)} views · ${regions.length} market${regions.length === 1 ? "" : "s"}`,
        url: `https://ads.tiktok.com/creative/creativeCenter/trends?deviceType=pc&locale=en&period=7&region=${regions[0] ?? "US"}`,
        items: trend.posts,
        views: trend.views,
      }],
      observedSocialItems: trend.posts,
      observedItems: trend.posts,
      observedComments: 0,
      observedViews: trend.views,
      attentionOnlyPlatforms: ["TikTok"],
    };
  });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    topics,
    sourceStatus: {
      tiktok: {
        ok: topics.length > 0,
        candidates: topics.length,
        regionsWithData: regional.filter((items) => items.length > 0).length,
        note: topics.length
          ? "Public TikTok Creative Center trend data is used for Attention only. TikTok comments are not included in Vibe."
          : "TikTok Creative Center did not expose parsable public trend rows to this server on this refresh.",
      },
    },
  }, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" },
  });
}
