import { NextResponse } from "next/server";

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

const stripHtml = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

async function searchBluesky(query: string): Promise<SampleItem[]> {
  const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "25");
  url.searchParams.set("sort", "latest");

  const response = await fetch(url, {
    headers: { "User-Agent": "OutsideTheFeed/0.1" },
    next: { revalidate: 60 },
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { posts?: Array<any> };

  return (data.posts ?? []).map((post) => {
    const rkey = typeof post.uri === "string" ? post.uri.split("/").pop() : undefined;
    const handle = post.author?.handle;
    return {
      source: "Bluesky",
      text: post.record?.text ?? "",
      author: handle,
      engagement: (post.likeCount ?? 0) + (post.repostCount ?? 0) + (post.replyCount ?? 0),
      publishedAt: post.indexedAt,
      url: handle && rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined,
    };
  });
}

async function searchHackerNews(query: string): Promise<SampleItem[]> {
  const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
  url.searchParams.set("query", query);
  url.searchParams.set("tags", "(story,comment)");
  url.searchParams.set("hitsPerPage", "25");

  const response = await fetch(url, {
    headers: { "User-Agent": "OutsideTheFeed/0.1" },
    next: { revalidate: 60 },
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
    headers: { "User-Agent": "OutsideTheFeed/0.1" },
    next: { revalidate: 300 },
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

async function searchYouTube(query: string): Promise<SampleItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("maxResults", "5");
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("key", key);

  const searchResponse = await fetch(searchUrl, { next: { revalidate: 300 } });
  if (!searchResponse.ok) return [];
  const searchData = (await searchResponse.json()) as { items?: Array<any> };
  const videos = searchData.items ?? [];

  const comments = await Promise.all(
    videos.map(async (video) => {
      const videoId = video.id?.videoId;
      if (!videoId) return [];
      const commentsUrl = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
      commentsUrl.searchParams.set("part", "snippet");
      commentsUrl.searchParams.set("videoId", videoId);
      commentsUrl.searchParams.set("maxResults", "20");
      commentsUrl.searchParams.set("order", "relevance");
      commentsUrl.searchParams.set("textFormat", "plainText");
      commentsUrl.searchParams.set("key", key);
      const response = await fetch(commentsUrl, { next: { revalidate: 300 } });
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
    }),
  );

  return comments.flat().slice(0, 80);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 160);

  if (query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters." }, { status: 400 });
  }

  const [bluesky, hackerNews, gdelt, youtube] = await Promise.all([
    searchBluesky(query).catch(() => []),
    searchHackerNews(query).catch(() => []),
    searchGdelt(query).catch(() => []),
    searchYouTube(query).catch(() => []),
  ]);

  const statuses: SourceStatus[] = [
    { id: "bluesky", name: "Bluesky", mode: "measured", note: "Public API; posts can be sampled directly.", count: bluesky.length },
    { id: "hackernews", name: "Hacker News", mode: "measured", note: "Public Algolia search API; useful mainly for tech/business topics.", count: hackerNews.length },
    { id: "gdelt", name: "News / open web", mode: "context", note: "GDELT news search provides live event context, not community sentiment.", count: gdelt.length },
    process.env.YOUTUBE_API_KEY
      ? { id: "youtube", name: "YouTube", mode: "measured", note: "Official Data API; comments are sampled from relevant videos.", count: youtube.length }
      : { id: "youtube", name: "YouTube", mode: "setup", note: "Ready to connect with a YouTube Data API key (free quota)." },
    { id: "reddit", name: "Reddit", mode: "pending", note: "Commercial data permission/licensing required before direct sentiment measurement." },
    { id: "tiktok", name: "TikTok", mode: "pending", note: "TikTok Research API is not available to commercial users; direct broad comment search is not currently a compliant launch dependency." },
    { id: "instagram", name: "Instagram / Reels", mode: "pending", note: "No broad public commercial Reels-comment search feed is connected yet; use contextual discovery only until an approved source is available." },
    { id: "chatgpt", name: "ChatGPT / OpenAI web", mode: "setup", note: "Can add OpenAI web search for discovery and context. It should not be counted as a representative social sample." },
    { id: "x", name: "X", mode: "setup", note: "Available later through X's paid API; not included in the free-source pass." },
  ];

  const items = [...bluesky, ...hackerNews, ...youtube, ...gdelt]
    .filter((item) => item.text || item.title)
    .slice(0, 150);

  return NextResponse.json(
    {
      query,
      fetchedAt: new Date().toISOString(),
      totalSamples: bluesky.length + hackerNews.length + youtube.length,
      contextArticles: gdelt.length,
      statuses,
      items,
      disclaimer: "Counts reflect returned samples, not the whole internet. Sentiment classification is not enabled in this endpoint yet.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
