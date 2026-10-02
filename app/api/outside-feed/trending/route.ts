import { NextResponse } from "next/server";

type Signal = {
  source: "Hacker News" | "Wikipedia" | "GDELT" | "Bluesky";
  value: number;
  detail: string;
  url?: string;
};

type Candidate = {
  title: string;
  query: string;
  key: string;
  rawScore: number;
  signals: Signal[];
  blueskyPosts: number;
  blueskyEngagement: number;
};

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "with", "from", "at", "by", "is", "are", "was", "were", "be", "been", "as", "it", "this", "that", "these", "those", "new", "how", "why", "what", "when", "where", "who", "into", "after", "before", "over", "under", "about", "your", "our", "their", "its", "you", "we", "they", "has", "have", "had", "will", "would", "could", "should",
]);

const WIKI_BLOCKLIST = [
  "main page",
  "special:",
  "wikipedia:",
  "portal:",
  "list of deaths",
  "deaths in ",
  "2026",
  "2025",
  "2024",
  "united states",
  "india",
  "youtube",
  "facebook",
  "google",
];

const compact = (value: string) => value.replace(/_/g, " ").replace(/\s+/g, " ").trim();

function keyFor(value: string) {
  return compact(value)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 10)
    .join(" ");
}

function searchQuery(value: string) {
  const words = keyFor(value).split(" ").filter(Boolean);
  return words.slice(0, 7).join(" ") || compact(value).slice(0, 80);
}

function tokens(value: string) {
  return new Set(keyFor(value).split(" ").filter(Boolean));
}

function similarity(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
}

function mergeCandidate(list: Candidate[], incoming: Candidate) {
  const existing = list.find((item) => similarity(item.title, incoming.title) >= 0.5 || item.key === incoming.key);
  if (!existing) {
    list.push(incoming);
    return;
  }

  existing.rawScore += incoming.rawScore;
  existing.signals.push(...incoming.signals);
  if (incoming.title.length < existing.title.length && incoming.title.length > 8) existing.title = incoming.title;
}

async function fetchHackerNews(): Promise<Candidate[]> {
  const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
    next: { revalidate: 120 },
    headers: { "User-Agent": "OutsideTheFeed/0.2" },
  });
  if (!idsResponse.ok) return [];
  const ids = (await idsResponse.json()) as number[];
  const top = ids.slice(0, 30);

  const stories = await Promise.all(
    top.map(async (id, index) => {
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: 120 },
          headers: { "User-Agent": "OutsideTheFeed/0.2" },
        });
        if (!response.ok) return null;
        const story = (await response.json()) as { title?: string; score?: number; descendants?: number; url?: string; time?: number; type?: string };
        if (!story?.title || story.type !== "story") return null;
        const title = compact(story.title.replace(/^Show HN:\s*/i, "").replace(/^Ask HN:\s*/i, ""));
        if (title.length < 8) return null;
        const engagement = (story.score ?? 0) + (story.descendants ?? 0) * 1.35;
        const rankBoost = Math.max(0, 22 - index * 0.6);
        const ageHours = story.time ? Math.max(0, (Date.now() / 1000 - story.time) / 3600) : 12;
        const recency = Math.max(0, 14 - ageHours * 0.8);
        const rawScore = 24 + Math.log1p(engagement) * 7 + rankBoost + recency;
        return {
          title,
          query: searchQuery(title),
          key: keyFor(title),
          rawScore,
          blueskyPosts: 0,
          blueskyEngagement: 0,
          signals: [{ source: "Hacker News" as const, value: Math.round(engagement), detail: `${story.score ?? 0} points · ${story.descendants ?? 0} comments`, url: story.url ?? `https://news.ycombinator.com/item?id=${id}` }],
        } satisfies Candidate;
      } catch {
        return null;
      }
    }),
  );

  return stories.filter((item): item is Candidate => Boolean(item));
}

async function fetchWikipedia(): Promise<Candidate[]> {
  const dates = [1, 2, 3].map((daysAgo) => {
    const date = new Date(Date.now() - daysAgo * 86400000);
    return { y: date.getUTCFullYear(), m: String(date.getUTCMonth() + 1).padStart(2, "0"), d: String(date.getUTCDate()).padStart(2, "0") };
  });

  for (const date of dates) {
    try {
      const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/${date.y}/${date.m}/${date.d}`;
      const response = await fetch(url, {
        next: { revalidate: 1800 },
        headers: { "User-Agent": "OutsideTheFeed/0.2 contact: brht.ai" },
      });
      if (!response.ok) continue;
      const data = (await response.json()) as { items?: Array<{ articles?: Array<{ article?: string; views?: number; rank?: number }> }> };
      const articles = data.items?.[0]?.articles ?? [];
      return articles
        .filter((entry) => {
          const title = compact(entry.article ?? "");
          const lower = title.toLowerCase();
          return title.length > 3 && !WIKI_BLOCKLIST.some((blocked) => lower === blocked || lower.startsWith(blocked));
        })
        .slice(0, 30)
        .map((entry, index) => {
          const title = compact(entry.article ?? "");
          const views = entry.views ?? 0;
          const rankBoost = Math.max(0, 22 - index * 0.7);
          return {
            title,
            query: searchQuery(title),
            key: keyFor(title),
            rawScore: 20 + Math.log10(Math.max(views, 10)) * 10 + rankBoost,
            blueskyPosts: 0,
            blueskyEngagement: 0,
            signals: [{ source: "Wikipedia" as const, value: views, detail: `${views.toLocaleString()} page views · #${entry.rank ?? index + 1}`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(entry.article ?? "")}` }],
          } satisfies Candidate;
        });
    } catch {
      // Try the prior day.
    }
  }

  return [];
}

function extractGdeltTerms(input: unknown, out: Array<{ term: string; weight: number }>) {
  if (!input || out.length >= 80) return;
  if (Array.isArray(input)) {
    for (const item of input) extractGdeltTerms(item, out);
    return;
  }
  if (typeof input !== "object") return;
  const object = input as Record<string, unknown>;
  const textFields = ["topic", "term", "label", "name", "phrase", "keyword"];
  const scoreFields = ["count", "value", "score", "volume", "mentions"];
  const term = textFields.map((field) => object[field]).find((value) => typeof value === "string") as string | undefined;
  if (term) {
    const cleaned = compact(term);
    const lower = cleaned.toLowerCase();
    if (cleaned.length >= 4 && cleaned.length <= 100 && !lower.includes("http") && !/^[0-9\s.,%-]+$/.test(cleaned)) {
      const raw = scoreFields.map((field) => object[field]).find((value) => typeof value === "number");
      out.push({ term: cleaned, weight: typeof raw === "number" ? raw : 1 });
    }
  }
  for (const value of Object.values(object)) extractGdeltTerms(value, out);
}

async function fetchGdelt(): Promise<Candidate[]> {
  try {
    const url = "https://api.gdeltproject.org/api/v2/tv/tv?mode=trendingtopics&format=json&maxrecords=40";
    const response = await fetch(url, {
      next: { revalidate: 900 },
      headers: { "User-Agent": "OutsideTheFeed/0.2" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as unknown;
    const extracted: Array<{ term: string; weight: number }> = [];
    extractGdeltTerms(data, extracted);
    const seen = new Set<string>();
    return extracted
      .filter(({ term }) => {
        const key = keyFor(term);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 25)
      .map(({ term, weight }, index) => ({
        title: term,
        query: searchQuery(term),
        key: keyFor(term),
        rawScore: 28 + Math.log1p(Math.max(1, weight)) * 5 + Math.max(0, 18 - index * 0.65),
        blueskyPosts: 0,
        blueskyEngagement: 0,
        signals: [{ source: "GDELT" as const, value: Math.round(weight), detail: "Trending in current TV/news coverage" }],
      }));
  } catch {
    return [];
  }
}

async function probeBluesky(candidate: Candidate) {
  try {
    const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts");
    url.searchParams.set("q", candidate.query);
    url.searchParams.set("limit", "20");
    url.searchParams.set("sort", "latest");
    const response = await fetch(url, {
      next: { revalidate: 180 },
      headers: { "User-Agent": "OutsideTheFeed/0.2" },
    });
    if (!response.ok) return candidate;
    const data = (await response.json()) as { posts?: Array<any> };
    const cutoff = Date.now() - 36 * 3600000;
    const posts = (data.posts ?? []).filter((post) => {
      const date = Date.parse(post.indexedAt ?? post.record?.createdAt ?? "");
      return Number.isFinite(date) ? date >= cutoff : true;
    });
    const engagement = posts.reduce((sum, post) => sum + (post.likeCount ?? 0) + (post.repostCount ?? 0) * 1.5 + (post.replyCount ?? 0), 0);
    candidate.blueskyPosts = posts.length;
    candidate.blueskyEngagement = Math.round(engagement);
    if (posts.length) {
      candidate.signals.push({ source: "Bluesky", value: posts.length, detail: `${posts.length} recent posts · ${Math.round(engagement)} engagement` });
      candidate.rawScore += Math.min(32, posts.length * 1.1 + Math.log1p(engagement) * 4.5);
    }
    return candidate;
  } catch {
    return candidate;
  }
}

export async function GET() {
  const [hn, wiki, gdelt] = await Promise.all([
    fetchHackerNews().catch(() => []),
    fetchWikipedia().catch(() => []),
    fetchGdelt().catch(() => []),
  ]);

  const merged: Candidate[] = [];
  for (const candidate of [...hn, ...wiki, ...gdelt]) mergeCandidate(merged, candidate);

  const preselected = merged
    .map((candidate) => ({
      ...candidate,
      rawScore: candidate.rawScore + Math.max(0, candidate.signals.length - 1) * 18,
    }))
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 18);

  const probed = await Promise.all(preselected.map((candidate) => probeBluesky(candidate)));
  probed.sort((a, b) => b.rawScore - a.rawScore);

  const max = probed[0]?.rawScore ?? 1;
  const min = probed[Math.min(probed.length - 1, 9)]?.rawScore ?? 0;
  const range = Math.max(1, max - min);

  const topics = probed.slice(0, 10).map((candidate, index) => ({
    rank: index + 1,
    title: candidate.title,
    query: candidate.query,
    attention: Math.max(35, Math.min(100, Math.round(52 + ((candidate.rawScore - min) / range) * 48))),
    sourceCount: new Set(candidate.signals.map((signal) => signal.source)).size,
    sources: candidate.signals,
    discoveryReason: candidate.signals.map((signal) => signal.source).join(" + "),
  }));

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      topics,
      sourceStatus: {
        hackerNews: { ok: hn.length > 0, candidates: hn.length },
        wikipedia: { ok: wiki.length > 0, candidates: wiki.length },
        gdelt: { ok: gdelt.length > 0, candidates: gdelt.length },
        bluesky: { ok: true, note: "Used to cross-check candidate discussion volume." },
      },
      methodology: "Candidates come from Hacker News top stories, English Wikipedia most-viewed pages, and GDELT trending TV/news topics. Near-duplicate topics are merged, then candidates are cross-checked against recent Bluesky discussion. Attention is a relative 0-100 discovery score for this snapshot, not population share.",
    },
    {
      headers: { "Cache-Control": "public, s-maxage=180, stale-while-revalidate=900" },
    },
  );
}
