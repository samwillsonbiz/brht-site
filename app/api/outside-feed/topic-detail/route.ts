import { NextRequest, NextResponse } from "next/server";

type SourceSignal = { source?: string; detail?: string; url?: string };
type Body = { title?: string; query?: string; description?: string; attention?: number; sources?: SourceSignal[] };
type WebSource = { url?: string; title?: string };
type ResponsePayload = { output?: Array<{ type?: string; action?: { sources?: WebSource[] }; content?: Array<{ type?: string; text?: string; annotations?: Array<{ url?: string; title?: string; url_citation?: { url?: string; title?: string } }> }> }> };
type Detail = { summary?: string; why_trending?: string; public_read?: string; reaction_clusters?: Array<{ label?: string; description?: string; strength?: string }>; source_urls?: string[] };

function outputText(payload: ResponsePayload) {
  for (const item of payload.output ?? []) if (item.type === "message") for (const part of item.content ?? []) if (part.type === "output_text" && part.text) return part.text;
  return "";
}

function sourcesFrom(payload: ResponsePayload) {
  const sources = new Map<string, string>();
  for (const item of payload.output ?? []) {
    for (const source of item.action?.sources ?? []) if (source.url) sources.set(source.url, source.title ?? source.url);
    for (const part of item.content ?? []) for (const annotation of part.annotations ?? []) {
      const url = annotation.url_citation?.url ?? annotation.url;
      const title = annotation.url_citation?.title ?? annotation.title;
      if (url) sources.set(url, title ?? url);
    }
  }
  return sources;
}

function parseJson(text: string): Detail | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned) as Detail; } catch {
    const start = cleaned.indexOf("{"); const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) try { return JSON.parse(cleaned.slice(start, end + 1)) as Detail; } catch { return null; }
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const title = String(body.title ?? "").trim().slice(0, 180);
  const query = String(body.query ?? title).trim().slice(0, 240);
  const description = String(body.description ?? "").trim().slice(0, 500);
  const attention = Math.max(0, Math.min(100, Number(body.attention ?? 0) || 0));
  const evidence = (body.sources ?? []).slice(0, 8).map((s) => `${s.source ?? "Source"}: ${s.detail ?? ""}${s.url ? ` (${s.url})` : ""}`).join("\n");
  if (!title) return NextResponse.json({ error: "Missing topic title." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({
    configured: false,
    summary: description || title,
    whyTrending: attention ? `This topic currently has an Attention score of ${attention} from the connected discovery sources.` : "This topic is appearing in the current discovery feed.",
    publicRead: "A deeper live public-reaction read will appear once OpenAI web search is connected.",
    reactionClusters: [],
    sources: (body.sources ?? []).filter((s) => s.url).map((s) => ({ title: s.source ?? "Source", url: s.url! })).slice(0, 6),
  });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5.5",
        reasoning: { effort: "low" },
        tools: [{ type: "web_search" }],
        tool_choice: "required",
        include: ["web_search_call.action.sources"],
        store: false,
        max_output_tokens: 2400,
        input: `Research this currently trending topic using the live public web. Help a reader understand both what happened and how accessible public reaction is breaking down outside one algorithm.\n\nTOPIC: ${title}\nQUERY: ${query}\nCURRENT DESCRIPTION: ${description || "none"}\nATTENTION: ${attention || "unknown"}\nCURRENT EVIDENCE:\n${evidence || "none"}\n\nReturn ONLY valid JSON: {"summary":"2-4 factual sentences","why_trending":"1-3 sentences","public_read":"2-4 sentences summarizing the overall tone of accessible public discussion while distinguishing reaction from established fact","reaction_clusters":[{"label":"short theme","description":"what this reaction cluster is saying and why","strength":"dominant|common|meaningful|minority|mixed"}],"source_urls":["https://..."]}.\n\nUse current sources and public discussion, not just press. Include 2-4 genuinely distinct reaction clusters when evidence supports them; do not manufacture false balance. For allegations, distinguish allegations from established facts. For political/electoral topics, stay neutral: do not endorse or oppose, rank candidates, assess electability, or tell the reader what to think. Describe documented reaction themes only. source_urls must be exact URLs you actually consulted. No markdown outside JSON.`,
      }),
    });
    if (!response.ok) throw new Error(`OpenAI web search returned HTTP ${response.status}.`);
    const payload = (await response.json()) as ResponsePayload;
    const parsed = parseJson(outputText(payload));
    if (!parsed) throw new Error("Could not parse topic detail.");

    const allowed = sourcesFrom(payload);
    const requested = (parsed.source_urls ?? []).filter((url) => allowed.has(url));
    const urls = (requested.length ? requested : [...allowed.keys()]).slice(0, 6);
    const clusters = (parsed.reaction_clusters ?? []).slice(0, 4).flatMap((cluster) => {
      const label = String(cluster.label ?? "").trim(); const text = String(cluster.description ?? "").trim();
      return label && text ? [{ label, description: text, strength: String(cluster.strength ?? "mixed") }] : [];
    });

    return NextResponse.json({
      configured: true,
      summary: String(parsed.summary ?? (description || title)),
      whyTrending: String(parsed.why_trending ?? ""),
      publicRead: String(parsed.public_read ?? ""),
      reactionClusters: clusters,
      sources: urls.map((url) => ({ title: allowed.get(url) ?? url, url })),
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      summary: description || title,
      whyTrending: "The deeper live read could not be generated on this request.",
      publicRead: "The front-page score still reflects the measurable sources currently connected.",
      reactionClusters: [],
      sources: (body.sources ?? []).filter((s) => s.url).map((s) => ({ title: s.source ?? "Source", url: s.url! })).slice(0, 6),
      error: error instanceof Error ? error.message : "Topic detail failed.",
    });
  }
}
