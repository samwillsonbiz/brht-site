import { NextRequest, NextResponse } from "next/server";

type InstagramMedia = {
  id: string;
  caption?: string;
  comments_count?: number;
  like_count?: number;
  media_type?: string;
  media_product_type?: string;
  permalink?: string;
  timestamp?: string;
};

type GraphList<T> = {
  data?: T[];
  error?: { message?: string; code?: number };
};

const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v25.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

function cleanHashtag(value: string) {
  const stop = new Set(["the", "and", "for", "with", "from", "this", "that", "are", "was", "were", "has", "have", "vs"]);
  return value
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s_]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stop.has(token))
    .join("")
    .slice(0, 80);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

async function graphJson<T>(url: URL, revalidate = 86_400): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      next: { revalidate },
      headers: { "User-Agent": "OutsideTheFeed/0.9" },
    });
    const data = (await response.json()) as T & { error?: { message?: string } };
    if (!response.ok || data?.error) {
      return { ok: false, error: data?.error?.message || `Instagram Graph API returned ${response.status}` };
    }
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Instagram request failed" };
  }
}

async function recentHashtagUsage(igUserId: string, token: string) {
  const url = new URL(`${BASE_URL}/${igUserId}/recently_searched_hashtags`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "50");
  const result = await graphJson<GraphList<{ id: string }>>(url, 3_600);
  return result.ok ? result.data?.data?.length ?? 0 : null;
}

async function hashtagId(hashtag: string, igUserId: string, token: string) {
  const url = new URL(`${BASE_URL}/ig_hashtag_search`);
  url.searchParams.set("user_id", igUserId);
  url.searchParams.set("q", hashtag);
  url.searchParams.set("access_token", token);
  const result = await graphJson<GraphList<{ id: string }>>(url);
  if (!result.ok) return { id: null, error: result.error };
  return { id: result.data?.data?.[0]?.id ?? null };
}

async function hashtagMedia(edge: "top_media" | "recent_media", id: string, igUserId: string, token: string) {
  const fieldsWithProduct = "id,caption,comments_count,like_count,media_type,media_product_type,permalink,timestamp";
  const fallbackFields = "id,caption,comments_count,like_count,media_type,permalink,timestamp";

  async function request(fields: string) {
    const url = new URL(`${BASE_URL}/${id}/${edge}`);
    url.searchParams.set("user_id", igUserId);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", token);
    return graphJson<GraphList<InstagramMedia>>(url, 21_600);
  }

  const first = await request(fieldsWithProduct);
  if (first.ok) return first.data?.data ?? [];
  const fallback = await request(fallbackFields);
  return fallback.ok ? fallback.data?.data ?? [] : [];
}

export async function GET(request: NextRequest) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_IG_USER_ID;
  const rawQuery = request.nextUrl.searchParams.get("q")?.trim() || "";
  const hashtag = cleanHashtag(rawQuery);

  if (!token || !igUserId) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      topics: [],
      sourceStatus: {
        instagram: {
          ok: false,
          configured: false,
          note: "Instagram hashtag corroboration is ready but needs INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_IG_USER_ID.",
        },
      },
    }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  }

  if (!hashtag || hashtag.length < 2) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      topics: [],
      sourceStatus: { instagram: { ok: false, configured: true, note: "No usable Instagram hashtag could be derived from this topic." } },
    });
  }

  // Meta limits Instagram Professional accounts to roughly 30 unique hashtag searches
  // per rolling seven days. Stop early near the cap rather than burning the allowance.
  const recentUsage = await recentHashtagUsage(igUserId, token);
  if (recentUsage !== null && recentUsage >= 28) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      topics: [],
      sourceStatus: {
        instagram: {
          ok: false,
          configured: true,
          budgetLimited: true,
          recentlySearched: recentUsage,
          note: "Instagram hashtag budget is near Meta's rolling seven-day limit; skipping new lookups.",
        },
      },
    }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  }

  const resolved = await hashtagId(hashtag, igUserId, token);
  if (!resolved.id) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      topics: [],
      sourceStatus: {
        instagram: {
          ok: false,
          configured: true,
          hashtag,
          note: resolved.error || `Instagram returned no public hashtag match for #${hashtag}.`,
        },
      },
    }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
  }

  const [top, recent] = await Promise.all([
    hashtagMedia("top_media", resolved.id, igUserId, token),
    hashtagMedia("recent_media", resolved.id, igUserId, token),
  ]);

  const byId = new Map<string, InstagramMedia>();
  [...top, ...recent].forEach((item) => byId.set(item.id, item));
  const media = [...byId.values()];
  const videos = media.filter((item) => item.media_type === "VIDEO" || item.media_product_type === "REELS");
  const reels = media.filter((item) => item.media_product_type === "REELS");
  const comments = media.reduce((sum, item) => sum + (item.comments_count ?? 0), 0);
  const likes = media.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
  const last48h = media.filter((item) => {
    const ts = item.timestamp ? Date.parse(item.timestamp) : NaN;
    return Number.isFinite(ts) && Date.now() - ts <= 48 * 3_600_000;
  }).length;

  if (!media.length) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      topics: [],
      sourceStatus: {
        instagram: { ok: true, configured: true, hashtag, candidates: 0, note: `#${hashtag} resolved, but no public top/recent media was returned.` },
      },
    }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
  }

  const engagement = comments + likes;
  const attention = Math.max(50, Math.min(92, Math.round(
    48 + Math.log10(media.length + 1) * 9 + Math.log10(engagement + 1) * 5 + Math.min(10, last48h * 0.7),
  )));
  const sampleLabel = reels.length > 0
    ? `${reels.length} Reels · ${media.length} public posts sampled`
    : `${videos.length} video${videos.length === 1 ? "" : "s"} · ${media.length} public posts sampled`;
  const detail = `${sampleLabel} · ${compactNumber(comments)} comments · ${compactNumber(likes)} likes`;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    topics: [{
      rank: 1,
      title: rawQuery,
      description: `Instagram public hashtag media also shows activity around ${rawQuery}.`,
      query: rawQuery,
      attention,
      platformCount: 1,
      sourceCount: 1,
      sources: [{
        source: "Instagram",
        detail,
        url: `https://www.instagram.com/explore/tags/${hashtag}/`,
        items: media.length,
        comments,
      }],
      observedSocialItems: media.length,
      observedItems: media.length,
      observedComments: comments,
      observedViews: 0,
    }],
    sourceStatus: {
      instagram: {
        ok: true,
        configured: true,
        hashtag,
        candidates: media.length,
        reels: reels.length,
        videos: videos.length,
        recentlySearched: recentUsage,
        note: "Instagram is used for Attention/corroboration only; these public hashtag media are not treated as a complete Reels census or Vibe sample.",
      },
    },
  }, {
    headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
  });
}
