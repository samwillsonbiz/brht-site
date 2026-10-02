"use client";

import { ExternalLink, LoaderCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SourceSignal = { source: string; detail: string; url?: string; items?: number; comments?: number; views?: number };
export type DetailTopic = { title: string; query: string; description?: string; attention: number; sources: SourceSignal[] };

type DetailResponse = {
  configured?: boolean;
  summary?: string;
  whyTrending?: string;
  publicRead?: string;
  reactionClusters?: Array<{ label: string; description: string; strength?: string }>;
  sources?: Array<{ title: string; url: string }>;
  error?: string;
};

type SourceScore = {
  source: string;
  sampleSize: number;
  uniqueAuthors: number;
  vibe: number;
  consensus: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
};

type ScoreSummary = {
  vibe: number;
  consensus: number;
  heat: number;
  bubbleGap: number | null;
  confidence: number;
  sampleSize: number;
  uniqueAuthors: number;
  classifiedPct: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  sourcesMeasured: number;
  sourceScores: SourceScore[];
};

type SearchItem = {
  source: string;
  title?: string;
  text?: string;
  url?: string;
  author?: string;
  engagement?: number;
};

type SearchResult = {
  totalSamples?: number;
  contextArticles?: number;
  items?: SearchItem[];
  score?: ScoreSummary;
};

function vibeLabel(vibe: number) {
  if (vibe >= 67) return { label: "Positive", text: "text-emerald-600", bg: "bg-emerald-50" };
  if (vibe <= 33) return { label: "Negative", text: "text-rose-600", bg: "bg-rose-50" };
  return { label: "Mixed", text: "text-amber-600", bg: "bg-amber-50" };
}

function fallbackWhy(topic: DetailTopic) {
  const sourceNames = [...new Set(topic.sources.map((source) => source.source))];
  const evidence = topic.sources.slice(0, 3).map((source) => source.detail).filter(Boolean).join(" · ");
  if (!sourceNames.length) return "This topic is showing elevated attention across the public web right now.";
  return `This topic is showing elevated attention across ${sourceNames.join(", ")}. ${evidence}`;
}

function fallbackPublicRead(score?: ScoreSummary) {
  if (!score || score.sampleSize <= 0) return "Attention is clearly elevated, but the measurable reaction sample is still too small for a useful sentiment read.";
  return `Across ${score.sampleSize.toLocaleString()} measured reactions, ${score.positivePct}% were positive, ${score.neutralPct}% neutral or unclear, and ${score.negativePct}% negative. The current Vibe is ${score.vibe}/100 with ${score.consensus}/100 consensus.`;
}

function inferredClusters(score?: ScoreSummary): Array<{ label: string; description: string; strength: string }> {
  if (!score || score.sampleSize <= 0) return [];
  const rows = [
    { label: "Positive reactions", pct: score.positivePct, description: "Supportive, excited or approving reactions in the measured sample." },
    { label: "Neutral / unclear", pct: score.neutralPct, description: "Informational, observational or difficult-to-classify reactions." },
    { label: "Negative reactions", pct: score.negativePct, description: "Critical, disappointed or opposing reactions in the measured sample." },
  ].filter((row) => row.pct > 0);
  return rows.sort((a, b) => b.pct - a.pct).map((row) => ({ label: row.label, description: row.description, strength: `${row.pct}%` }));
}

export default function TopicDetailModal({ topic, onClose }: { topic: DetailTopic; onClose: () => void }) {
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [reactionData, setReactionData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDetail(null);
    setReactionData(null);

    const detailRequest = fetch("/api/outside-feed/topic-detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topic),
    }).then((response) => response.json()).catch(() => null);

    const reactionRequest = fetch(`/api/outside-feed/search?q=${encodeURIComponent(topic.query || topic.title)}`)
      .then((response) => response.json())
      .catch(() => null);

    Promise.all([detailRequest, reactionRequest])
      .then(([detailResult, reactionResult]) => {
        if (cancelled) return;
        setDetail((detailResult as DetailResponse | null) ?? null);
        setReactionData((reactionResult as SearchResult | null) ?? null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [topic]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const score = reactionData?.score;
  const vibe = score ? vibeLabel(score.vibe) : null;
  const clusters = detail?.reactionClusters?.length ? detail.reactionClusters : inferredClusters(score);
  const sampleItems = useMemo(() => (reactionData?.items ?? [])
    .filter((item) => item.source !== "News / GDELT" && (item.title || item.text))
    .sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0))
    .slice(0, 6), [reactionData]);

  const sourceLinks = detail?.sources?.length
    ? detail.sources
    : topic.sources.filter((source) => source.url).map((source) => ({ title: source.source, url: source.url as string }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071126]/45 p-0 backdrop-blur-[2px] md:items-center md:p-6" onClick={onClose}>
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-[#f8faff] shadow-2xl md:max-w-4xl md:rounded-[28px]" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#17213a]/[0.07] bg-[#f8faff]/95 px-6 py-5 backdrop-blur md:px-8">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-rose-500">{topic.attention} attention</div>
            <h2 className="mt-1 text-2xl font-[800] tracking-[-0.04em] text-[#101a33] md:text-3xl">{topic.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#17213a]/10 bg-white p-2 text-[#17213a]/55 hover:text-[#101a33]" aria-label="Close topic detail"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-7 px-6 py-6 md:px-8 md:py-8">
          {loading && (
            <div className="flex min-h-44 items-center justify-center text-sm font-semibold text-[#17213a]/45"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-[#2878ff]" /> Reading reactions across the public web…</div>
          )}

          {!loading && (
            <>
              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">What’s going on</h3>
                <p className="mt-2 text-[16px] font-medium leading-7 text-[#17213a]/78">{detail?.summary || topic.description || topic.title}</p>
              </section>

              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Why it’s trending</h3>
                <p className="mt-2 text-[15px] font-medium leading-6.5 text-[#17213a]/68">{detail?.whyTrending || fallbackWhy(topic)}</p>
              </section>

              {score && score.sampleSize > 0 && vibe && (
                <section className="rounded-[24px] border border-[#17213a]/[0.07] bg-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">Measured public reaction</div>
                      <div className="mt-1 text-sm font-semibold text-[#17213a]/45">{score.sampleSize.toLocaleString()} reactions · {score.uniqueAuthors.toLocaleString()} unique authors · {score.sourcesMeasured} measured sources</div>
                    </div>
                    <div className={`rounded-[18px] px-4 py-3 text-right ${vibe.bg}`}>
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/38">Vibe</div>
                      <div className={`text-4xl font-[850] leading-none tracking-[-0.07em] ${vibe.text}`}>{score.vibe}</div>
                      <div className={`mt-1 text-[9px] font-extrabold uppercase tracking-[0.05em] ${vibe.text}`}>{vibe.label}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["Consensus", score.consensus],
                      ["Confidence", score.confidence],
                      ["Heat", score.heat],
                      ["Bubble gap", score.bubbleGap ?? "—"],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-[15px] bg-[#f6f8fc] px-3 py-3 text-center">
                        <div className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#17213a]/35">{label}</div>
                        <div className="mt-1 text-xl font-[800] tracking-[-0.04em] text-[#101a33]">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 overflow-hidden rounded-full bg-[#eef1f6]">
                    <div className="flex h-3 w-full">
                      <div className="bg-emerald-500" style={{ width: `${score.positivePct}%` }} />
                      <div className="bg-amber-400" style={{ width: `${score.neutralPct}%` }} />
                      <div className="bg-rose-500" style={{ width: `${score.negativePct}%` }} />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 text-center text-[10px] font-bold">
                    <span className="text-emerald-600">{score.positivePct}% positive</span>
                    <span className="text-amber-600">{score.neutralPct}% neutral</span>
                    <span className="text-rose-600">{score.negativePct}% negative</span>
                  </div>
                </section>
              )}

              <section className="rounded-[22px] border border-[#2878ff]/10 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">The public read</h3>
                <p className="mt-2 text-[15px] font-medium leading-6.5 text-[#17213a]/72">{detail?.publicRead || fallbackPublicRead(score)}</p>
              </section>

              {!!score?.sourceScores?.length && (
                <section>
                  <div className="flex items-end justify-between gap-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Reaction by source</h3>
                    <span className="text-[10px] font-semibold text-[#17213a]/30">Same topic, different communities</span>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {score.sourceScores.map((source) => {
                      const sourceVibe = vibeLabel(source.vibe);
                      return (
                        <div key={source.source} className="rounded-[18px] border border-[#17213a]/[0.07] bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-extrabold text-[#101a33]">{source.source}</div>
                              <div className="mt-1 text-[10px] font-semibold text-[#17213a]/38">{source.sampleSize} reactions · {source.uniqueAuthors} authors</div>
                            </div>
                            <div className={`text-2xl font-[850] tracking-[-0.05em] ${sourceVibe.text}`}>{source.vibe}</div>
                          </div>
                          <div className="mt-3 text-[10px] font-bold text-[#17213a]/42">{source.positivePct}% positive · {source.neutralPct}% neutral · {source.negativePct}% negative · {source.consensus} consensus</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {!!clusters.length && (
                <section>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">What people are saying</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {clusters.map((cluster, index) => (
                      <div key={`${cluster.label}-${index}`} className="rounded-[18px] border border-[#17213a]/[0.07] bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-extrabold text-[#101a33]">{cluster.label}</div>
                          {cluster.strength && <span className="rounded-full bg-[#f1f4fa] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] text-[#17213a]/42">{cluster.strength}</span>}
                        </div>
                        <p className="mt-2 text-sm font-medium leading-5.5 text-[#17213a]/62">{cluster.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!!sampleItems.length && (
                <section>
                  <div className="flex items-end justify-between gap-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Sample reactions behind the numbers</h3>
                    <span className="text-[10px] font-semibold text-[#17213a]/30">Public sample</span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {sampleItems.map((item, index) => (
                      <div key={`${item.source}-${index}`} className="rounded-[16px] border border-[#17213a]/[0.05] bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#2878ff]">
                          <span>{item.source}</span>
                          {item.author && <span className="text-[#17213a]/30">@{item.author}</span>}
                          {typeof item.engagement === "number" && <span className="text-[#17213a]/30">{item.engagement} engagement</span>}
                        </div>
                        <p className="mt-1.5 text-sm font-medium leading-5.5 text-[#17213a]/64">{item.title || item.text}</p>
                        {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#2878ff]">View source <ExternalLink className="h-2.5 w-2.5" /></a>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!!sourceLinks.length && (
                <section>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Sources driving the trend</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sourceLinks.map((source, index) => (
                      <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#2878ff]/10 bg-white px-3 py-2 text-[11px] font-bold text-[#2878ff] hover:bg-[#2878ff]/[0.05]">
                        <span className="max-w-[260px] truncate">{source.title}</span><ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <p className="border-t border-[#17213a]/[0.07] pt-5 text-[11px] font-medium leading-5 text-[#17213a]/35">Public reaction summarizes the accessible sample. It does not establish factual truth, guilt, scientific validity, or what you should believe.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
