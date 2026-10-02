import { NextResponse } from "next/server";

type SourceSignal = {
  source: string;
  detail: string;
  url?: string;
  items?: number;
  views?: number;
  regions?: string[];
};

type Trend = {
  rank: number;
  title: string;
  description?: string;
  query: string;
  attention: number;
  platformCount: number;
  sourceCount: number;
  sources: SourceSignal[];
  observedSocialItems: number;
  observedItems: number;
  observedComments: number;
  observedViews: number;
};

type GoogleObserved = {
  title: string;
  traffic: number;
  regions: Set<string>;
  newestPublishedAt?: number;
  newsTitle?: string;
  newsUrl?: string;
};

type GdeltArticle = {
  url?: string;
  title?: string;
  domain?: string;
};

const REGIONS = ["US", "AU", "GB", "CA", "NZ", "ZA", "IE", "SG"];

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(value: string) {
  return decodeXml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function xmlTag(block: string, tag: string) {
  const escaped = tag.replace(":", "\\:");
  const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return cleanText(match?.[1] ?? "");
}

function parseTraffic(value: string) {
  const normalized = value.toLowerCase().replace(/[,+\s]/g, "");
  const match = normalized.match(/([\d.]+)([kmb])?/i);
  if (!match) return 0;
  const number = Number(match[1]);
  const multiplier = match[2] === "b" ? 1_000_000_000 : match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Number.isFinite(number) ? Math.round(number * multiplier) : 0;
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function titleCase(value: string) {
  if (!value) return value;
  if (/[A-Z]/.test(value)) return value;
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizedTopic(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicTokens(value: string) {
  const stop = new Set(["the", "and", "for", "with", "from", "this", "that", "are", "was", "were", "has", "have", "vs"]);
  return normalizedTopic(value).split(" ").filter((token) => token.length > 2 && !stop.has(token));
}

function sameTopic(left: string, right: string) {
  const a = normalizedTopic(left).replace(/\s/g, "");
  const b = normalizedTopic(right).replace(/\s/g, "");
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.min(a.length, b.length) >= 7 && (a.includes(b) || b.includes(a))) return true;
  const leftTokens = new Set(topicTokens(left));
  const rightTokens = new Set(topicTokens(right));
  const shared = [...leftTokens].filter((token) => rightTokens.has(token));
  return shared.length >= 2 && shared.length / Math.max(1, Math.min(leftTokens.size, rightTokens.size)) >= 0.7;
}

function queryFor(value: string) {
  return topicTokens(value).slice(0, 8).join(" ") || cleanText(value).slice(0, 80);
}

async function getGoogleTrends() {
  const observed: GoogleObserved[] = [];
  let successfulRegions = 0;

  await Promise.all(REGIONS.map(async (region) => {
    try {
      const response = await fetch(`https://trends.google.com/trending/rss?geo=${region}`, {
        next: { revalidate: 600 },
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OutsideTheFeed/0.8; +https://brht.ai/outside-the-feed)",
          Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
      });
      if (!response.ok) return;
      const xml = await response.text();
      if (!xml.includes("<item>")) return;
      successfulRegions += 1;

      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 30);
      for (const match of items) {
        const block = match[1];
        const title = xmlTag(block, "title");
        const traffic = parseTraffic(xmlTag(block, "ht:approx_traffic"));
        const pubDate = Date.parse(xmlTag(block, "pubDate"));
        const newsTitle = xmlTag(block, "ht:news_item_title");
        const newsUrl = xmlTag(block, "ht:news_item_url");
        if (!title || traffic <= 0) continue;

        const existing = observed.find((item) => sameTopic(item.title, title));
        if (existing) {
          existing.traffic = Math.max(existing.traffic, traffic);
          existing.regions.add(region);
          if (Number.isFinite(pubDate)) existing.newestPublishedAt = Math.max(existing.newestPublishedAt ?? 0, pubDate);
          if (!existing.newsTitle && newsTitle) existing.newsTitle = newsTitle;
          if (!existing.newsUrl && newsUrl) existing.newsUrl = newsUrl;
        } else {
          observed.push({
            title,
            traffic,
            regions: new Set([region]),
            newestPublishedAt: Number.isFinite(pubDate) ? pubDate : undefined,
            newsTitle: newsTitle || undefined,
            newsUrl: newsUrl || undefined,
          });
        }
      }
    } catch {
      return;
    }
  }));

  observed.sort((a, b) => {
    const aScore = Math.log10(Math.max(10, a.traffic)) * 20 + a.regions.size * 8;
    const bScore = Math.log10(Math.max(10, b.traffic)) * 20 + b.regions.size * 8;
    return bScore - aScore;
  });

  return { observed: observed.slice(0, 24), successfulRegions };
}

async function getGdeltSignal(title: string) {
  try {
    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", queryFor(title));
    url.searchParams.set("mode", "ArtList");
    url.searchParams.set("maxrecords", "75");
    url.searchParams.set("format", "json");
    url.searchParams.set("sort", "HybridRel");
    url.searchParams.set("timespan", "1d");

    const response = await fetch(url, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "OutsideTheFeed/0.8" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { articles?: GdeltArticle[] };
    const articles = data.articles ?? [];
    if (!articles.length) return null;

    const domains = new Set(articles.map((article) => article.domain).filter(Boolean));
    const best = articles.find((article) => article.title && article.url);

    return {
      count: articles.length,
      outlets: domains.size,
      url: best?.url,
      headline: cleanText(best?.title ?? ""),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const google = await getGoogleTrends();

  const enriched = await Promise.all(google.observed.slice(0, 16).map(async (item) => {
    const gdelt = await getGdeltSignal(item.title);
    const ageHours = item.newestPublishedAt ? Math.max(0, Date.now() - item.newestPublishedAt) / 3_600_000 : 12;
    const googleScore = 38 + Math.log10(Math.max(10, item.traffic)) * 10 + Math.min(28, Math.max(0, item.regions.size - 1) * 5) + Math.max(0, 9 - ageHours * 0.3);
    const gdeltBoost = gdelt ? Math.min(28, Math.log1p(gdelt.count) * 4 + Math.log1p(gdelt.outlets) * 3) : 0;

    const sources: SourceSignal[] = [{
      source: "Google Trends",
      detail: `${compactNumber(item.traffic)}+ searches · ${item.regions.size} region${item.regions.size === 1 ? "" : "s"}`,
      url: `https://trends.google.com/trending?geo=${item.regions.has("US") ? "US" : [...item.regions][0] ?? "US"}`,
      items: item.traffic,
      regions: [...item.regions],
    }];

    if (gdelt) {
      sources.push({
        source: "GDELT",
        detail: `${gdelt.count}${gdelt.count >= 75 ? "+" : ""} recent news articles · ${gdelt.outlets} outlets`,
        url: gdelt.url,
        items: gdelt.count,
      });
    } else if (item.newsTitle && item.newsUrl) {
      sources.push({
        source: "GDELT",
        detail: "Related current-news context from Google Trends",
        url: item.newsUrl,
        items: 1,
      });
    }

    const description = item.newsTitle
      ? cleanText(item.newsTitle)
      : gdelt?.headline
        ? cleanText(gdelt.headline)
        : `${titleCase(item.title)} is spiking in Google searches${item.regions.size > 1 ? ` across ${item.regions.size} markets` : ""}.`;

    return {
      title: titleCase(item.title),
      query: queryFor(item.title),
      rawScore: googleScore + gdeltBoost,
      sources,
      description,
    };
  }));

  enriched.sort((a, b) => b.rawScore - a.rawScore);
  const top = enriched.slice(0, 10);
  const maxScore = top[0]?.rawScore ?? 1;
  const minScore = top[top.length - 1]?.rawScore ?? 0;
  const range = Math.max(1, maxScore - minScore);

  const topics: Trend[] = top.map((item, index) => ({
    rank: index + 1,
    title: item.title,
    description: item.description,
    query: item.query,
    attention: Math.max(50, Math.min(100, Math.round(58 + ((item.rawScore - minScore) / range) * 42))),
    platformCount: item.sources.length,
    sourceCount: item.sources.length,
    sources: item.sources,
    observedSocialItems: 0,
    observedItems: 0,
    observedComments: 0,
    observedViews: 0,
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    topics,
    sourceStatus: {
      googleTrends: {
        ok: google.observed.length > 0,
        candidates: google.observed.length,
        note: `Trending searches collected from ${google.successfulRegions}/${REGIONS.length} Google Trends markets. Search volume affects Attention, not Vibe.`,
      },
      gdelt: {
        ok: topics.some((topic) => topic.sources.some((source) => source.source === "GDELT")),
        note: "Recent-news breadth/context is used as an attention and explanation signal, not public sentiment.",
      },
    },
  }, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" },
  });
}
