import { NextResponse } from "next/server";
import { manualChatGPTSeed } from "./manual-seed";

type WebSource = { url?: string; title?: string };
type TrendCandidate = {
  title?: string;
  description?: string;
  query?: string;
  attention?: number;
  source_urls?: string[];
};

type ResponsesPayload = {
  output?: Array<{
    type?: string;
    action?: { sources?: WebSource[] };
    content?: Array<{
      type?: string;
      text?: string;
      annotations?: Array<{ type?: string; url?: string; title?: string; url_citation?: { url?: string; title?: string } }>;
    }>;
  }>;
};

function extractText(payload: ResponsesPayload) {
  for (const item of payload.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return "";
}

function collectAllowedSources(payload: ResponsesPayload) {
  const sources = new Map<string, string>();
  for (const item of payload.output ?? []) {
    for (const source of item.action?.sources ?? []) {
      if (source.url) sources.set(source.url, source.title ?? source.url);
    }
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        const url = annotation.url_citation?.url ?? annotation.url;
        const title = annotation.url_citation?.title ?? annotation.title;
        if (url) sources.set(url, title ?? url);
      }
    }
  }
  return sources;
}

function parseJson(text: string): { topics?: TrendCandidate[] } | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as { topics?: TrendCandidate[] };
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)) as { topics?: TrendCandidate[] }; } catch { return null; }
    }
    return null;
  }
}

function clampAttention(value: unknown, index: number) {
  const number = Number(value);
  if (Number.isFinite(number)) return Math.max(58, Math.min(94, Math.round(number)));
  return Math.max(58, 92 - index * 3);
}

function manualSeedResponse() {
  const topics = manualChatGPTSeed.topics.map((candidate, index) => ({
    rank: index + 1,
    title: candidate.title,
    description: candidate.description,
    query: candidate.query,
    attention: clampAttention(candidate.attention, index),
    sourceCount: 1,
    platformCount: 1,
    sources: [{
      source: "ChatGPT",
      detail: `Manual current-web synthesis · ${candidate.sourceUrls.length} cited source${candidate.sourceUrls.length === 1 ? "" : "s"}`,
      url: candidate.sourceUrls[0],
      items: candidate.sourceUrls.length,
    }],
    observedSocialItems: 0,
    observedItems: 0,
    observedComments: 0,
    observedViews: 0,
    citedSources: candidate.sourceUrls.map((url) => ({ url, title: url })),
  }));

  return NextResponse.json({
    generatedAt: manualChatGPTSeed.generatedAt,
    topics,
    sourceStatus: {
      chatgptWeb: {
        ok: topics.length > 0,
        candidates: topics.length,
        note: manualChatGPTSeed.note,
        mode: "manual",
      },
    },
  }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } });
}

export async function GET() {
  const mode = (process.env.CHATGPT_TRENDS_MODE ?? "manual").toLowerCase();
  const apiKey = process.env.OPENAI_API_KEY;

  // Zero-cost default: use the manually refreshed ChatGPT seed committed with the app.
  // Set CHATGPT_TRENDS_MODE=live later to switch this provider to automatic OpenAI web-search discovery.
  if (mode !== "live" || !apiKey) return manualSeedResponse();

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.5",
        reasoning: { effort: "low" },
        tools: [{ type: "web_search" }],
        tool_choice: "required",
        include: ["web_search_call.action.sources"],
        store: false,
        max_output_tokens: 3200,
        input: `You are one independent discovery signal for a product called Outside the Feed. Search the live public web and identify exactly 10 DISTINCT topics that appear to be receiving broad public attention right now.\n\nThis is NOT a list of what is most important morally or politically. Rank only current public attention. Avoid personalization. Look broadly across entertainment, sport, gaming, technology, business, internet culture, world events and major politics only when it is genuinely attracting broad attention. Do not endorse political actors, assess electability, or tell readers what position to take.\n\nReturn ONLY valid JSON in this shape:\n{"topics":[{"title":"short canonical topic name","description":"one neutral sentence explaining what is happening and why people are paying attention","query":"good short web/social search query","attention":0,"source_urls":["https://..."]}]}\n\nRules:\n- attention must be 0-100 relative to YOUR ten candidates, with #1 highest.\n- Use topic names, not clickbait headlines, raw hashtags, or article titles.\n- description must be factual and neutral.\n- source_urls must contain 1-3 exact URLs you actually consulted in web search for that topic.\n- Prefer recent sources and current discussion.\n- Return no markdown and no prose outside the JSON.`,
      }),
    });

    if (!response.ok) return manualSeedResponse();

    const payload = (await response.json()) as ResponsesPayload;
    const parsed = parseJson(extractText(payload));
    const allowedSources = collectAllowedSources(payload);
    const candidates = (parsed?.topics ?? []).slice(0, 10);

    const topics = candidates.flatMap((candidate, index) => {
      const title = String(candidate.title ?? "").trim();
      const description = String(candidate.description ?? "").trim();
      const query = String(candidate.query ?? title).trim();
      const validated = (candidate.source_urls ?? []).filter((url) => allowedSources.has(url)).slice(0, 3);
      if (!title || !description || !query || !validated.length) return [];

      return [{
        rank: index + 1,
        title,
        description,
        query,
        attention: clampAttention(candidate.attention, index),
        sourceCount: 1,
        platformCount: 1,
        sources: [{
          source: "ChatGPT",
          detail: `Live web-search signal · ${validated.length} cited source${validated.length === 1 ? "" : "s"}`,
          url: validated[0],
          items: validated.length,
        }],
        observedSocialItems: 0,
        observedItems: 0,
        observedComments: 0,
        observedViews: 0,
        citedSources: validated.map((url) => ({ url, title: allowedSources.get(url) ?? url })),
      }];
    });

    if (!topics.length) return manualSeedResponse();

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      topics,
      sourceStatus: {
        chatgptWeb: {
          ok: true,
          candidates: topics.length,
          note: "ChatGPT uses live OpenAI web search as one weighted discovery signal. It nominates topics; it does not determine Vibe or factual truth by itself.",
          mode: "live",
        },
      },
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
  } catch {
    return manualSeedResponse();
  }
}
