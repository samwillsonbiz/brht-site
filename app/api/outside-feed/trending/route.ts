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
  regions?: string[];
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

type YouTubeObserved = {
  video: YouTubeVideo;
  regions: Set<string>;
  bestRank: number;
};

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "from", "at", "by", "is", "are", "was", "were", "be", "as", "it", "this", "that", "new", "how", "why", "what", "after", "before", "about", "has", "have", "had",
]);

const PROMO_WORDS = new Set([
  "official", "trailer", "teaser", "clip", "video", "videos", "review", "reaction", "breakdown", "recap", "explained", "preview", "announcement", "watch", "full", "hd", "4k",
]);

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

function shortDescription(value: string, max = 210) {
  const cleaned = cleanDescription(value);
  if (!cleaned) return "";
  const sentence = cleaned.match(/^(.{30,250}?[.!?])(?:\s|$)/)?.[1] ?? cleaned;
  return sentence.length <= max ? sentence : `${sentence.slice(0, max - 1).trimEnd()}…`;
}

function normalizeNumericHyphens(value: string) {
  return value.replace(/\b\d(?:-\d)+\b/g, (match) => match.replace(/-/g, ""));
}

function topicTokens(value: string) {
  return normalizeNumericHyphens(cleanTitle(value))
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => (word.length > 2 || /^\d+$/.test(word)) && !STOP_WORDS.has(word) && !PROMO_WORDS.has(word));
}

function topicKey(value: string) {
  return topicTokens(value).slice(0, 12).join(" ");
}

function queryFor(value: string) {
  const words = topicTokens(value);
  return words.slice(0, 8).join(" ") || cleanTitle(value).slice(0, 80);
}

function tokenSet(value: string) {
  return new Set(topicTokens(value));
}

function similarity(a: string, b: string) {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (!left.size || !right.size) return 0;

  const shared = [...left].filter((token) => right.has(token));
  if (!shared.length) return 0;

  if (shared.length === 1 && Math.min(left.size, right.size) === 1) {
    return shared[0].length >= 6 ? 0.78 : 0.35;
  }

  const containment = shared.length / Math.min(left.size, right.size);
  const union = new Set([...left, ...right]).size;
  const jaccard = shared.length / union;
  return containment * 0.68 + jaccard * 0.32;
}

function canonicalizeYouTubeTitle(rawValue: string) {
  let title = cleanTitle(rawValue)
    .replace(/[“”]/g, '"')
    .replace(/\[(official|trailer|teaser|video)[^\]]*\]/gi, " ");

  const pipeParts = title.split(/\s*[|｜]\s*/).filter(Boolean);
  if (pipeParts.length > 1) {
    let primary = pipeParts[0].trim();
    const remainder = pipeParts.slice(1).join(" ");
    const season = remainder.match(/\bseason\s+\d+\b/i)?.[0];
    if (season && !primary.toLowerCase().includes(season.toLowerCase())) primary = `${primary} ${season}`;
    title = primary;
  }

  const animationMatch = title.match(/^(.*?)\s*\(([^)]*\banimation\b[^)]*)\)\s*$/i);
  if (animationMatch) {
    const subject = cleanTitle(animationMatch[1]);
    const franchise = cleanTitle(animationMatch[2].replace(/\banimation\b/gi, ""));
    if (franchise && subject) title = `${franchise}: ${subject}`;
  }

  title = title
    .replace(/\s*[-–—]\s*(?:official\s+)?(?:trailer|teaser|clip|review|reaction|breakdown|recap|explained)\b.*$/i, "")
    .replace(/\s*\((?:official\s+)?(?:trailer|teaser|clip|video|movie\s+\d{4}|\d{4}\s+movie)[^)]*\)\s*$/i, "")
    .replace(/\s+(?:official\s+)?(?:trailer|teaser|clip)\s*\d*\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return title.length >= 3 ? title.slice(0, 120) : cleanTitle(rawValue).slice(0, 120);
}

function youtubeDescription(canonical: string, rawTitle: string, channelTitle?: string) {
  const lower = rawTitle.toLowerCase();
  if (lower.includes("trailer")) return `A new trailer for ${canonical} is driving a surge of views and comments.`;
  if (lower.includes("teaser")) return `A new teaser for ${canonical} is driving a surge of views and comments.`;
  if (lower.includes("reaction") || lower.includes("review")) return `Reaction and review videos about ${canonical} are drawing heavy discussion.`;
  if (lower.includes("animation")) return `${canonical} is trending after a new animation release.`;
  return channelTitle ? `${canonical} is drawing attention after a new video from ${channelTitle}.` : `${canonical} is drawing growing attention on YouTube.`;
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function consolidateSignals(signals: Signal[]) {
  const grouped = new Map<SignalSource, Signal>();

  for (const signal of signals) {
    const existing = grouped.get(signal.source);
    if (!existing) {
      grouped.set(signal.source, {
        ...signal,
        regions: signal.regions ? [...new Set(signal.regions)] : undefined,
      });
      continue;
    }

    existing.items = (existing.items ?? 0) + (signal.items ?? 0);
    existing.comments = (existing.comments ?? 0) + (signal.comments ?? 0);
    existing.views = (existing.views ?? 0) + (signal.views ?? 0);
    existing.engagement = (existing.engagement ?? 0) + (signal.engagement ?? 0);
    existing.regions = [...new Set([...(existing.regions ?? []), ...(signal.regions ?? [])])];
    if (!existing.url && signal.url) existing.url = signal.url;
  }

  return [...grouped.values()].map((signal) => {
    if (signal.source === "YouTube") {
      const regions = signal.regions?.length ? ` · ${signal.regions.length} regions` : "";
      return {
        ...signal,
        detail: `${signal.items ?? 0} video${(signal.items ?? 0) === 1 ? "" : "s"} · ${compactNumber(signal.views ?? 0)} views · ${compactNumber(signal.comments ?? 0)} comments${regions}`,
      };
    }
    if (signal.source === "Bluesky") {
      return { ...signal, detail: `${signal.items ?? 0} recent posts · ${compactNumber(signal.engagement ?? 0)} engagement` };
    }
    if (signal.source === "Hacker News") {
      return { ...signal, detail: `${signal.items ?? 0} discussion${(signal.items ?? 0) === 1 ? "" : "s"} · ${compactNumber(signal.comments ?? 0)} comments` };
    }
    if (signal.source === "Wikipedia") {
      return { ...signal, detail: `${compactNumber(signal.views ?? 0)} page views` };
    }
    return signal;
  });
}

async function getHackerNewsCandidates(): Promise<Candidate[]> {
  try {
    const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
      next: { revalidate: 180 },
      headers: { "User-Agent": "OutsideTheFeed/0.5" },
    });
    if (!idsResponse.ok) return [];

    const ids = (await idsResponse.json()) as number[];
    const candidates: Candidate[] = [];

    await Promise.all(ids.slice(0, 20).map(async (id, index) => {
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: 180 },
          headers: { "User-Agent": "OutsideTheFeed/0.5" },
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
        const rawScore = 15 + Math.log1p(engagement) * 4.8 + Math.max(0, 8 - index * 0.3) + Math.max(0, 6 - ageHours * 0.3);

        candidates.push({
          title,
          query: queryFor(title),
          rawScore,
          signals: [{
            source: "Hacker News",
            detail: "",
            url: story.url ?? `https://news.ycombinator.com/item?id=${id}`,
            items: 1,
            comments,
            engagement: points + comments,
          }],
        });
      } catch {
        return;
      }
    }));

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
        headers: { "User-Agent": "OutsideTheFeed/0.5 contact: brht.ai" },
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
          rawScore: 15 + Math.log10(Math.max(10, views)) * 7 + Math.max(0, 10 - rank * 0.3),
          signals: [{
            source: "Wikipedia",
            detail: "",
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(entry.article ?? "")}`,
            items: 1,
            views,
          }],
        });
      }

      return candidates;
    } catch {
      // Try an earlier completed day.
    }
  }
  return [];
}

async function getYouTubeCandidates(): Promise<Candidate[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const regions = ["US", "GB", "AU", "CA", "NZ", "ZA", "IE", "SG"];
  const observed = new Map<string, YouTubeObserved>();

  await Promise.all(regions.map(async (region) => {
    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("part", "snippet,statistics");
      url.searchParams.set("chart", "mostPopular");
      url.searchParams.set("regionCode", region);
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("key", apiKey);

      const response = await fetch(url, { next: { revalidate: 300 } });
      if (!response.ok) return;
      const data = (await response.json()) as { items?: YouTubeVideo[] };

      for (const [index, video] of (data.items ?? []).entries()) {
        if (!video.id || !video.snippet?.title) continue;
        const existing = observed.get(video.id);
        if (existing) {
          existing.regions.add(region);
          existing.bestRank = Math.min(existing.bestRank, index + 1);
        } else {
          observed.set(video.id, { video, regions: new Set([region]), bestRank: index + 1 });
        }
      }
    } catch {
      return;
    }
  }));

  const candidates: Candidate[] = [];
  for (const [videoId, observedVideo] of observed.entries()) {
    const { video, regions: videoRegions, bestRank } = observedVideo;
    const rawTitle = cleanTitle(video.snippet?.title ?? "");
    const title = canonicalizeYouTubeTitle(rawTitle);
    if (!title) continue;

    const views = Number(video.statistics?.viewCount ?? 0);
    const likes = Number(video.statistics?.likeCount ?? 0);
    const comments = Number(video.statistics?.commentCount ?? 0);
    const ageHours = video.snippet?.publishedAt ? Math.max(0, Date.now() - Date.parse(video.snippet.publishedAt)) / 3600000 : 24;
    const engagement = likes + comments * 2.2;
    const regionBoost = Math.min(28, Math.max(0, videoRegions.size - 1) * 5.5);
    const rawScore = 30 + Math.log10(Math.max(10, views)) * 8 + Math.log1p(engagement) * 2 + Math.max(0, 15 - bestRank * 0.35) + Math.max(0, 8 - ageHours * 0.13) + regionBoost;

    candidates.push({
      title,
      query: queryFor(title),
      rawScore,
      description: youtubeDescription(title, rawTitle, video.snippet?.channelTitle),
      signals: [{
        source: "YouTube",
        detail: "",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        items: 1,
        comments,
        views,
        engagement: likes + comments,
        regions: [...videoRegions],
      }],
    });
  }

  return candidates;
}

async function addBlueskySignal(candidate: Candidate): Promise<Candidate> {
  try {
    const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts");
    url.searchParams.set("q", candidate.query);
    url.searchParams.set("limit", "100");
    url.searchParams.set("sort", "latest");

    const response = await fetch(url, {
      next: { revalidate: 180 },
      headers: { "User-Agent": "OutsideTheFeed/0.5" },
    });
    if (!response.ok) return candidate;

    const data = (await response.json()) as { posts?: BlueskyPost[] };
    const cutoff = Date.now() - 48 * 3600000;
    const posts = (data.posts ?? []).filter((post) => {
      const timestamp = Date.parse(post.indexedAt ?? "");
      return !Number.isFinite(timestamp) || timestamp >= cutoff;
    });

    const engagement = posts.reduce((sum, post) => sum + (post.likeCount ?? 0) + (post.repostCount ?? 0) * 1.5 + (post.replyCount ?? 0), 0);
    if (posts.length > 0) {
      candidate.rawScore += Math.min(62, posts.length * 0.58 + Math.log1p(engagement) * 5.6);
      candidate.signals.push({
        source: "Bluesky",
        detail: "",
        items: posts.length,
        engagement: Math.round(engagement),
      });
    }

    return candidate;
  } catch {
    return candidate;
  }
}

function mergeCandidates(input: Candidate[]) {
  const candidates = [...input].sort((a, b) => b.rawScore - a.rawScore);
  const merged: Candidate[] = [];

  for (const candidate of candidates) {
    const key = topicKey(candidate.title);
    if (!key) continue;

    const existing = merged.find((item) => {
      const existingKey = topicKey(item.title);
      return existingKey === key || similarity(item.title, candidate.title) >= 0.7;
    });

    if (!existing) {
      merged.push({ ...candidate, signals: [...candidate.signals] });
      continue;
    }

    // Extra independent items should boost a topic, but with diminishing returns.
    existing.rawScore += Math.min(32, candidate.rawScore * 0.28);
    existing.signals.push(...candidate.signals);

    if (!existing.description && candidate.description) existing.description = candidate.description;

    const existingTokenCount = topicTokens(existing.title).length;
    const candidateTokenCount = topicTokens(candidate.title).length;
    const candidateLooksCleaner = candidate.title.length < existing.title.length && candidate.title.length >= 4;
    const candidateHasUsefulSpecificity = candidateTokenCount >= 2 && candidateTokenCount <= 7 && candidateTokenCount <= existingTokenCount;
    if (candidateLooksCleaner || candidateHasUsefulSpecificity) {
      existing.title = candidate.title;
      existing.query = queryFor(candidate.title);
      if (candidate.description) existing.description = candidate.description;
    }
  }

  return merged.map((candidate) => {
    const signals = consolidateSignals(candidate.signals);
    const socialItems = signals
      .filter((signal) => signal.source === "YouTube" || signal.source === "Bluesky" || signal.source === "Hacker News")
      .reduce((sum, signal) => sum + (signal.items ?? 0), 0);
    const platformCount = signals.length;
    const youtubeRegions = signals.find((signal) => signal.source === "YouTube")?.regions?.length ?? 0;
    const breadthBonus = Math.min(50, Math.log1p(socialItems) * 9 + Math.max(0, platformCount - 1) * 15 + Math.max(0, youtubeRegions - 1) * 3);
    return { ...candidate, rawScore: candidate.rawScore + breadthBonus, signals };
  });
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
          headers: { "User-Agent": "OutsideTheFeed/0.5 contact: brht.ai" },
        });
        if (response.ok) {
          const data = (await response.json()) as { extract?: string };
          const summary = shortDescription(data.extract ?? "");
          if (summary) return { ...candidate, description: summary };
        }
      }
    } catch {
      // Continue to current news context.
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
      headers: { "User-Agent": "OutsideTheFeed/0.5" },
    });
    if (response.ok) {
      const data = (await response.json()) as { articles?: Array<{ title?: string }> };
      const headline = cleanTitle(data.articles?.find((article) => article.title)?.title ?? "");
      if (headline && headline.toLowerCase() !== candidate.title.toLowerCase()) {
        return { ...candidate, description: headline };
      }
    }
  } catch {
    // Use an evidence-based fallback.
  }

  const youtube = candidate.signals.find((signal) => signal.source === "YouTube");
  if (youtube) {
    return {
      ...candidate,
      description: `${candidate.title} is appearing across ${youtube.items ?? 1} popular YouTube video${(youtube.items ?? 1) === 1 ? "" : "s"} and drawing active discussion.`,
    };
  }

  const sourceNames = candidate.signals.map((signal) => signal.source);
  return {
    ...candidate,
    description: `Discussion around ${candidate.title} is rising across ${sourceNames.join(" and ") || "the public web"}.`,
  };
}

export async function GET() {
  const [hackerNews, wikipedia, youtube] = await Promise.all([
    getHackerNewsCandidates(),
    getWikipediaCandidates(),
    getYouTubeCandidates(),
  ]);

  const initialClusters = mergeCandidates([...youtube, ...wikipedia, ...hackerNews])
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 28);

  const withBluesky = await Promise.all(initialClusters.map((candidate) => addBlueskySignal(candidate)));
  const checked = withBluesky
    .map((candidate) => ({ ...candidate, signals: consolidateSignals(candidate.signals) }))
    .map((candidate) => {
      const platformCount = candidate.signals.length;
      const socialItems = candidate.signals
        .filter((signal) => signal.source !== "Wikipedia")
        .reduce((sum, signal) => sum + (signal.items ?? 0), 0);
      return {
        ...candidate,
        rawScore: candidate.rawScore + Math.min(36, Math.log1p(socialItems) * 7 + Math.max(0, platformCount - 1) * 12),
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore);

  const topWithContext = await Promise.all(checked.slice(0, 10).map((candidate) => addContext(candidate)));
  const maxScore = topWithContext[0]?.rawScore ?? 1;
  const minScore = topWithContext[topWithContext.length - 1]?.rawScore ?? 0;
  const range = Math.max(1, maxScore - minScore);

  const topics = topWithContext.map((candidate, index) => {
    const observedSocialItems = candidate.signals
      .filter((signal) => signal.source === "YouTube" || signal.source === "Bluesky" || signal.source === "Hacker News")
      .reduce((sum, signal) => sum + (signal.items ?? 0), 0);
    const observedComments = candidate.signals.reduce((sum, signal) => sum + (signal.comments ?? 0), 0);
    const observedViews = candidate.signals.reduce((sum, signal) => sum + (signal.views ?? 0), 0);

    return {
      rank: index + 1,
      title: candidate.title,
      description: candidate.description,
      query: candidate.query,
      attention: Math.max(45, Math.min(100, Math.round(55 + ((candidate.rawScore - minScore) / range) * 45))),
      platformCount: candidate.signals.length,
      sourceCount: candidate.signals.length,
      sources: candidate.signals,
      observedSocialItems,
      observedItems: observedSocialItems,
      observedComments,
      observedViews,
    };
  });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    topics,
    sourceStatus: {
      youtube: { ok: youtube.length > 0, candidates: youtube.length, note: process.env.YOUTUBE_API_KEY ? "Most-popular videos are deduped by video ID across eight regions, then clustered into topics." : "Ready when YOUTUBE_API_KEY is added." },
      bluesky: { ok: true, note: "Recent public discussion is used as a direct social signal." },
      wikipedia: { ok: wikipedia.length > 0, candidates: wikipedia.length, note: "Used as an attention/context signal, not treated as social consensus." },
      hackerNews: { ok: hackerNews.length > 0, candidates: hackerNews.length, note: "Capped so a tech-heavy community cannot dominate the general front page." },
    },
  }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
  });
}
