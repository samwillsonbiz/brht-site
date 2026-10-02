import { NextResponse } from "next/server";
import { scoreConversation } from "@/lib/outside-feed/scoring";

type SourceStatus = {
  id: string;
  name: string;
  mode: "measured" | "context" | "setup" | "pending";
  note: string;
  count?: number;
};

type SampleItem = {
  source: string;
  title?: string;
  text?: string;
  url?: string;
  author?: string;
  engagement?: number;
  publishedAt?: string;
};

type YouTubeSearchItem = {
  id?: { videoId?: string };
  snippet?: { title?: string };
};

type YouTubeVideo = {
  id?: string;
  snippet?: { title?: string; channelTitle?: string; publishedAt?: string };
  statistics?: { viewCount?: string; commentCount?: string };
};

const stripHtml = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

async function searchBluesky(query: string): Promise<SampleItem[]> {
  const all: SampleItem[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < 3; page += 1) {
    const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "100");
    url.searchParams.set("sort", "latest");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, {
      headers: { "User-Agent": "OutsideTheFeed/0.8" },
      next: { revalidate: 180 },
    });
    if (!response.ok) break;

    const data = (await response.json()) as { posts?: Array<any>; cursor?: string };
    for (const post of data.posts ?? []) {
      const rkey = typeof post.uri === "string" ? post.uri.split("/").pop() : undefined;
      const handle = post.author?.handle;
      all.push({
        source: "Bluesky",
        text: post.record?.text ?? "",
        author: handle,
        engagement: (post.likeCount ?? 0) + (post.repostCount ?? 0) + (post.replyCount ?? 0),
        publishedAt: post.indexedAt,
        url: handle && rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined,
      });
    }

    cursor = data.cursor;
    if (!cursor || !(data.posts ?? []).length) break;
  }

  const cutoff = Date.now() - 7 * 86400000;
  return all
    .filter((item) => {
      const timestamp = Date.parse(item.publishedAt ?? "");
      return !Number.isFinite(timestamp) || timestamp >= cutoff;
    })
    .slice(0, 300);
}

async function searchHackerNews(query: string): Promise<SampleItem[]> {
  const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
  url.searchParams.set("query", query);
  url.searchParams.set("tags", "(story,comment)");
  url.searchParams.set("hitsPerPage", "75");

  const response = await fetch(url, {
    headers: { "User-Agent": "OutsideTheFeed/0.8" },
    next: { revalidate: 300 },
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { hits?: Array<any> };

  return (data.hits ?? []).map((hit) => ({
    source: "Hacker News",
    title: hit.title ?? hit.story_title ?? undefined,
    text: stripHtml(hit.comment_text ?? hit.story_text),
    author: hit.author,
    engagement: (hit.points ?? 0) + (hit.num_comments ?? 0),
    publishedAt: hit.created_at,
    url: hit.url ?? (hit.story_id ? `https://news.ycombinator.com/item?id=${hit.story_id}` : hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : undefined),
  }));
}

async function searchGdelt(query: string): Promise<SampleItem[]> {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("maxrecords", "25");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "HybridRel");
  url.searchParams.set("timespan", "7d");

  const response = await fetch(url, {
    headers: { "User-Agent": "OutsideTheFeed/0.8" },
    next: { revalidate: 600 },
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { articles?: Array<any> };

  return (data.articles ?? []).map((article) => ({
    source: "News / GDELT",
    title: article.title,
    url: article.url,
    author: article.domain,
    publishedAt: article.seendate,
  }));
}

function safeVideoIds(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[A-Za-z0-9_-]{6,20}$/.test(id))
    .slice(0, 12);
}

async function searchYouTube(query: string, seedVideoIds: string[], allowSearch: boolean): Promise<SampleItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const videoIds = new Set(seedVideoIds);

  // YouTube search.list costs 100 quota units. Only use it for the few top topics
  // explicitly allowed by the front page, rather than once for every card on every refresh.
  if (allowSearch) {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("maxResults", "25");
    searchUrl.searchParams.set("order", "relevance");
    searchUrl.searchParams.set("relevanceLanguage", "en");
    searchUrl.searchParams.set("publishedAfter", new Date(Date.now() - 45 * 86400000).toISOString());
    searchUrl.searchParams.set("key", key);

    const searchResponse = await fetch(searchUrl, { next: { revalidate: 1800 } });
    if (searchResponse.ok) {
      const searchData = (await searchResponse.json()) as { items?: YouTubeSearchItem[] };
      for (const item of searchData.items ?? []) {
        const id = item.id?.videoId;
        if (id) videoIds.add(id);
      }
    }
  }

  const ids = [...videoIds].slice(0, 25);
  if (!ids.length) return [];

  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.searchParams.set("part", "snippet,statistics");
  statsUrl.searchParams.set("id", ids.join(","));
  statsUrl.searchParams.set("key", key);
  const statsResponse = await fetch(statsUrl, { next: { revalidate: 900 } });
  if (!statsResponse.ok) return [];
  const statsData = (await statsResponse.json()) as { items?: YouTubeVideo[] };

  const rankedVideos = (statsData.items ?? [])
    .map((video) => ({
      ...video,
      viewCount: Number(video.statistics?.viewCount ?? 0),
      commentCount: Number(video.statistics?.commentCount ?? 0),
    }))
    .sort((a, b) => {
      const aScore = Math.log10(1 + a.viewCount) * 0.65 + Math.log10(1 + a.commentCount) * 1.4;
      const bScore = Math.log10(1 + b.viewCount) * 0.65 + Math.log10(1 + b.commentCount) * 1.4;
      return bScore - aScore;
    })
    .slice(0, 12);

  const commentBatches = await Promise.all(rankedVideos.map(async (video) => {
    const videoId = video.id;
    if (!videoId) return [];

    const commentsUrl = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
    commentsUrl.searchParams.set("part", "snippet");
    commentsUrl.searchParams.set("videoId", videoId);
    commentsUrl.searchParams.set("maxResults", "100");
    commentsUrl.searchParams.set("order", "relevance");
    commentsUrl.searchParams.set("textFormat", "plainText");
    commentsUrl.searchParams.set("key", key);

    const response = await fetch(commentsUrl, { next: { revalidate: 900 } });
    if (!response.ok) return [];
    const data = (await response.json()) as { items?: Array<any> };

    return (data.items ?? []).map((item) => {
      const snippet = item.snippet?.topLevelComment?.snippet;
      return {
        source: "YouTube",
        title: video.snippet?.title,
        text: snippet?.textDisplay ?? "",
        author: snippet?.authorDisplayName,
        engagement: snippet?.likeCount ?? 0,
        publishedAt: snippet?.publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      } satisfies SampleItem;
    });
  }));

  return commentBatches.flat().slice(0, 1200);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 160);
  const seedVideoIds = safeVideoIds(searchParams.get("youtubeVideoIds"));
  const allowYouTubeSearch = searchParams.get("youtubeSearch") === "1";

  if (query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters." }, { status: 400 });
  }

  const [bluesky, hackerNews, gdelt, youtube] = await Promise.all([
    searchBluesky(query).catch(() => []),
    searchHackerNews(query).catch(() => []),
    searchGdelt(query).catch(() => []),
    searchYouTube(query, seedVideoIds, allowYouTubeSearch).catch(() => []),
  ]);

  const statuses: SourceStatus[] = [
    { id: "bluesky", name: "Bluesky", mode: "measured", note: "Public API; samples up to ~300 recent matching posts when available.", count: bluesky.length },
    { id: "hackernews", name: "Hacker News", mode: "measured", note: "Public Algolia API; counted only where Hacker News has relevant discussion.", count: hackerNews.length },
    { id: "gdelt", name: "News / open web", mode: "context", note: "GDELT supplies factual context only and is excluded from sentiment scoring.", count: gdelt.length },
    process.env.YOUTUBE_API_KEY
      ? { id: "youtube", name: "YouTube", mode: "measured", note: allowYouTubeSearch ? "Official Data API; known videos plus a cached search are sampled across up to 12 videos." : "Official Data API; reuses videos already found during discovery so scoring does not spend search quota unnecessarily.", count: youtube.length }
      : { id: "youtube", name: "YouTube", mode: "setup", note: "Collector is ready; add YOUTUBE_API_KEY to begin sampling comments." },
    { id: "reddit", name: "Reddit", mode: "pending", note: "Commercial data permission/licensing is required before Reddit can enter the score." },
    { id: "tiktok", name: "TikTok", mode: "pending", note: "TikTok attention is measured separately; TikTok comments are not included in Vibe until a compliant commercial reaction feed is connected." },
    { id: "instagram", name: "Instagram / Reels", mode: "pending", note: "No approved broad Reels-comment collector is connected yet, so Reels is not included in the score." },
    { id: "chatgpt", name: "OpenAI web context", mode: "setup", note: "Useful for discovery/context later, but search results will never be counted as representative social reactions." },
    { id: "x", name: "X", mode: "setup", note: "Can enter the scoring model once the paid API is connected." },
  ];

  const measurableItems = [...bluesky, ...hackerNews, ...youtube].filter((item) => item.text || item.title);
  const score = scoreConversation(measurableItems);

  const previewItems = [...measurableItems, ...gdelt]
    .filter((item) => item.text || item.title)
    .sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0))
    .slice(0, 250);

  return NextResponse.json(
    {
      query,
      fetchedAt: new Date().toISOString(),
      totalSamples: score.sampleSize,
      contextArticles: gdelt.length,
      statuses,
      items: previewItems,
      score,
      disclaimer: "Vibe, Consensus, Heat, Bubble Gap and Confidence are calculated from returned measurable social samples only. This v0.1 classifier is a deterministic lexical stance proxy, not yet the planned target-aware classifier. The score measures sampled reaction, not factual truth.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
