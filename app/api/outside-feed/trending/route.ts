import { NextResponse } from "next/server";

type SignalSource = "Hacker News" | "Wikipedia" | "Bluesky" | "YouTube";

type Signal = {
  source: SignalSource;
  detail: string;
  url?: string;
  items?: number;
  comments?: number;
  views?: number;
  engagement?: number;
};

type Candidate = {
  title: string;
  query: string;
  rawScore: number;
  signals: Signal[];
  description?: string;
};

type HnStory = {
  title?: string;
  score?: number;
  descendants?: number;
  url?: string;
  time?: number;
  type?: string;
};

type WikiArticle = {
  article?: string;
  views?: number;
  rank?: number;
};

type BlueskyPost = {
  indexedAt?: string;
  likeCount?: number;
  repostCount?: number;
  replyCount?: number;
};

type YouTubeVideo = {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    channelTitle?: string;
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
};

const STOP_WORDS = new Set(["the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "from", "at", "by", "is", "are", "was", "were", "be", "as", "it", "this", "that", "new", "how", "why", "what", "after", "before", "about", "has", "have", "had"]);
const WIKI_BLOCKLIST = ["main page", "special:", "wikipedia:", "portal:", "list of deaths", "deaths in ", "2026", "2025", "2024"];

function cleanTitle(value: string) {
  return value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function cleanDescription(value: string) {
  return value
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortDescription(value: string, max = 220) {
  const cleaned = cleanDescription(value);
  if (!cleaned) return "";
  const sentence = cleaned.match(/^(.{30,260}?[.!?])(?:\s|$)/)?.[1] ?? cleaned;
  return sentence.length <= max ? sentence : `${sentence.slice(0, max - 1).trimEnd()}…`;
}

function topicKey(value: string) {
  return cleanTitle(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 10)
    .join(" ");
}

function queryFor(value: string) {
  const words = topicKey(value).split(" ").filter(Boolean);
  return words.slice(0, 7).join(" ") || cleanTitle(value).slice(0, 80);
}

function tokenSet(value: string) {
  return new Set(topicKey(value).split(" ").filter(Boolean));
}

function similarity(a: string, b: string) {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const token of left) if (right.has(token)) common += 1;
  return common / new Set([...left, ...right]).size;
}

async function getHackerNewsCandidates(): Promise<Candidate[]> {
  try {
    const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
      next: { revalidate: 120 },
      headers: { "User-Agent": "OutsideTheFeed/0.4" },
    });
    if (!idsResponse.ok) return [];

    const ids = (await idsResponse.json()) as number[];
    const selected = ids.slice(0, 20);
    const candidates: Candidate[] = [];

    await Promise.all(
      selected.map(async (id, index) => {
        try {
          const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            next: { revalidate: 120 },
            headers: { "User-Agent": "OutsideTheFeed/0.4" },
          });
          if (!response.ok) return;
          const story = (await response.json()) as HnStory;
          if (!story.title || story.type !== "story") return;

          const title = cleanTitle(story.title.replace(/^Show HN:\s*/i, "").replace(/^Ask HN:\s*/i, ""));
          if (title.length < 8) return;

          const points = story.score ?? 0;
          const comments = story.descendants ?? 0;
          const engagement = points + comments * 1.25;
          const ageHours = story.time ? Math.max(0, Date.now() / 1000 - story.time) / 3600 : 12;
          const rawScore = 18 + Math.log1p(engagement) * 5.5 + Math.max(0, 10 - index * 0.35) + Math.max(0, 7 - ageHours * 0.35);

          candidates.push({
            title,
            query: queryFor(title),
            rawScore,
            signals: [{
              source: "Hacker News",
              detail: `${points} points · ${comments} comments`,
              url: story.url ?? `https://news.ycombinator.com/item?id=${id}`,
              items: 1,
              comments,
              engagement: points + comments,
            }],
          });
        } catch {
          return;
        }
      }),
    );

    return candidates;
  } catch {
    return [];
  }
}

async function getWikipediaCandidates(): Promise<Candidate[]> {
  for (let daysAgo = 1; daysAgo <= 3; daysAgo += 1) {
    try {
      const date = new Date(Date.now() - daysAgo * 86400000);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const response = await fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/${year}/${month}/${day}`, {
        next: { revalidate: 1800 },
        headers: { "User-Agent": "OutsideTheFeed/0.4 contact: brht.ai" },
      });
      if (!response.ok) continue;

      const data = (await response.json()) as { items?: Array<{ articles?: WikiArticle[] }> };
      const articles = data.items?.[0]?.articles ?? [];
      const candidates: Candidate[] = [];

      for (const entry of articles) {
        if (candidates.length >= 24) break;
        const title = cleanTitle(entry.article ?? "");
        const lower = title.toLowerCase();
        if (title.length < 4) continue;
        if (WIKI_BLOCKLIST.some((blocked) => lower === blocked || lower.startsWith(blocked))) continue;

        const views = entry.views ?? 0;
        const rank = entry.rank ?? candidates.length + 1;
        candidates.push({
          title,
          query: queryFor(title),
          rawScore: 18 + Math.log10(Math.max(10, views)) * 8 + Math.max(0, 12 - rank * 0.35),
          signals: [{
            source: "Wikipedia",
            detail: `${views.toLocaleString()} page views · #${rank}`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(entry.article ?? "")}`,
            items: 1,
            views,
          }],
        });
      }

      return candidates;
    } catch {
      // Try the prior completed day.
    }
  }

  return [];
}

async function getYouTubeCandidates(): Promise<Candidate[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const regions = ["US", "GB", "AU", "CA"];
  const candidates: Candidate[] = [];

  await Promise.all(regions.map(async (region) => {
    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("part", "snippet,statistics");
      url.searchParams.set("chart", "mostPopular");
      url.searchParams.set("regionCode", region);
      url.searchParams.set("maxResults", "25");
      url.searchParams.set("key", apiKey);

      const response = await fetch(url, { next: { revalidate: 300 } });
      if (!response.ok) return;
      const data = (await response.json()) as { items?: YouTubeVideo[] };

      for (const [index, video] of (data.items ?? []).entries()) {
        const title = cleanTitle(video.snippet?.title ?? "");
        if (!title || !video.id) continue;
        const views = Number(video.statistics?.viewCount ?? 0);
        const likes = Number(video.statistics?.likeCount ?? 0);
        const comments = Number(video.statistics?.commentCount ?? 0);
        const ageHours = video.snippet?.publishedAt ? Math.max(0, Date.now() - Date.parse(video.snippet.publishedAt)) / 3600000 : 24;
        const engagement = likes + comments * 2.2;
        const rawScore = 35 + Math.log10(Math.max(10, views)) * 9 + Math.log1p(engagement) * 2.2 + Math.max(0, 16 - index * 0.45) + Math.max(0, 8 - ageHours * 0.15);
        const description = shortDescription(video.snippet?.description ?? "");

        candidates.push({
          title,
          query: queryFor(title),
          rawScore,
          description: description.length >= 35 ? description : video.snippet?.channelTitle ? `Trending video from ${video.snippet.channelTitle}.` : undefined,
          signals: [{
            source: "YouTube",
            detail: `${views.toLocaleString()} views · ${comments.toLocaleString()} comments · ${region}`,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            items: 1,
            comments,
            views,
            engagement: likes + comments,
          }],
        });
      }
    } catch {
      return;
    }
  }));

  return candidates;
}

async function addBlueskySignal(candidate: Candidate): Promise<Candidate> {
  try {
    const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts");
    url.searchParams.set("q", candidate.query);
    url.searchParams.set("limit", "25");
    url.searchParams.set("sort", "latest");

    const response = await fetch(url, {
      next: { revalidate: 180 },
      headers: { "User-Agent": "OutsideTheFeed/0.4" },
    });
    if (!response.ok) return candidate;

    const data = (await response.json()) as { posts?: BlueskyPost[] };
    const cutoff = Date.now() - 36 * 3600000;
    const posts = (data.posts ?? []).filter((post) => {
      const timestamp = Date.parse(post.indexedAt ?? "");
      return !Number.isFinite(timestamp) || timestamp >= cutoff;
    });

    const engagement = posts.reduce((sum, post) => sum + (post.likeCount ?? 0) + (post.repostCount ?? 0) * 1.5 + (post.replyCount ?? 0), 0);
    if (posts.length > 0) {
      candidate.rawScore += Math.min(48, posts.length * 1.7 + Math.log1p(engagement) * 5.2);
      candidate.signals.push({
        source: "Bluesky",
        detail: `${posts.length} recent posts · ${Math.round(engagement)} engagement`,
        items: posts.length,
        engagement: Math.round(engagement),
      });
    }

    return candidate;
  } catch {
    return candidate;
  }
}

function mergeCandidates(candidates: Candidate[]) {
  const merged: Candidate[] = [];

  for (const candidate of candidates) {
    const key = topicKey(candidate.title);
    if (!key) continue;
    const existing = merged.find((item) => topicKey(item.title) === key || similarity(item.title, candidate.title) >= 0.48);
    if (!existing) {
      merged.push(candidate);
      continue;
    }

    existing.rawScore += candidate.rawScore * 0.72;
    existing.signals.push(...candidate.signals);
    if (!existing.description && candidate.description) existing.description = candidate.description;
    if (candidate.title.length < existing.title.length && candidate.title.length >= 8) {
      existing.title = candidate.title;
      existing.query = queryFor(candidate.title);
    }
  }

  return merged;
}

async function addContext(candidate: Candidate): Promise<Candidate> {
  if (candidate.description && candidate.description.length >= 35) return candidate;

  const wikiSignal = candidate.signals.find((signal) => signal.source === "Wikipedia" && signal.url);
  if (wikiSignal?.url) {
    try {
      const pageName = decodeURIComponent(wikiSignal.url.split("/wiki/")[1] ?? "");
      if (pageName) {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageName)}`, {
          next: { revalidate: 3600 },
          headers: { "User-Agent": "OutsideTheFeed/0.4 contact: brht.ai" },
        });
        if (response.ok) {
          const data = (await response.json()) as { extract?: string };
          const summary = shortDescription(data.extract ?? "");
          if (summary) return { ...candidate, description: summary };
        }
      }
    } catch {
      // Fall through to news context.
    }
  }

  try {
    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", candidate.query);
    url.searchParams.set("mode", "ArtList");
    url.searchParams.set("maxrecords", "3");
    url.searchParams.set("format", "json");
    url.searchParams.set("sort", "HybridRel");
    url.searchParams.set("timespan", "3d");
    const response = await fetch(url, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "OutsideTheFeed/0.4" },
    });
    if (response.ok) {
      const data = (await response.json()) as { articles?: Array<{ title?: string }> };
      const headline = cleanTitle(data.articles?.find((article) => article.title)?.title ?? "");
      if (headline && headline.toLowerCase() !== candidate.title.toLowerCase()) {
        return { ...candidate, description: headline };
      }
    }
  } catch {
    // Use source-based fallback.
  }

  const sourceNames = [...new Set(candidate.signals.map((signal) => signal.source))];
  return {
    ...candidate,
    description: sourceNames.length > 1
      ? `This topic is drawing attention across ${sourceNames.join(" and ")}.`
      : `This topic is currently drawing attention on ${sourceNames[0] ?? "the public web"}.`,
  };
}

export async function GET() {
  const [hackerNews, wikipedia, youtube] = await Promise.all([
    getHackerNewsCandidates(),
    getWikipediaCandidates(),
    getYouTubeCandidates(),
  ]);

  const merged = mergeCandidates([...youtube, ...wikipedia, ...hackerNews])
    .map((candidate) => ({
      ...candidate,
      rawScore: candidate.rawScore + Math.max(0, new Set(candidate.signals.map((signal) => signal.source)).size - 1) * 22,
    }))
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 24);

  const checked = await Promise.all(merged.map((candidate) => addBlueskySignal(candidate)));
  checked.sort((a, b) => b.rawScore - a.rawScore);

  const topWithContext = await Promise.all(checked.slice(0, 10).map((candidate) => addContext(candidate)));
  const maxScore = topWithContext[0]?.rawScore ?? 1;
  const minScore = topWithContext[topWithContext.length - 1]?.rawScore ?? 0;
  const range = Math.max(1, maxScore - minScore);

  const topics = topWithContext.map((candidate, index) => {
    const observedItems = candidate.signals.reduce((sum, signal) => sum + (signal.items ?? 0), 0);
    const observedComments = candidate.signals.reduce((sum, signal) => sum + (signal.comments ?? 0), 0);
    const observedViews = candidate.signals.reduce((sum, signal) => sum + (signal.views ?? 0), 0);

    return {
      rank: index + 1,
      title: candidate.title,
      description: candidate.description,
      query: candidate.query,
      attention: Math.max(45, Math.min(100, Math.round(55 + ((candidate.rawScore - minScore) / range) * 45))),
      sourceCount: new Set(candidate.signals.map((signal) => signal.source)).size,
      sources: candidate.signals,
      observedItems,
      observedComments,
      observedViews,
      discoveryReason: candidate.signals.map((signal) => signal.source).join(" + "),
    };
  });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    topics,
    sourceStatus: {
      youtube: { ok: youtube.length > 0, candidates: youtube.length, note: process.env.YOUTUBE_API_KEY ? "Most-popular videos included." : "Ready when YOUTUBE_API_KEY is added." },
      bluesky: { ok: true, note: "Recent public discussion is used as a direct social signal." },
      wikipedia: { ok: wikipedia.length > 0, candidates: wikipedia.length },
      hackerNews: { ok: hackerNews.length > 0, candidates: hackerNews.length, note: "Capped so tech discussion cannot dominate the general front page." },
    },
  }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
  });
}
