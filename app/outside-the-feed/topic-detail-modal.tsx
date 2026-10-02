"use client";

import { ArrowRight, ExternalLink, LoaderCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { topicHref, type SourceSignal } from "./topic-utils";

export type DetailTopic = { title: string; query: string; description?: string; attention: number; sources: SourceSignal[] };
type DetailResponse = { summary?: string; whyTrending?: string; publicRead?: string; reactionClusters?: Array<{ label: string; description: string; strength?: string }>; sources?: Array<{ title: string; url: string }> };
type SourceScore = { source: string; sampleSize: number; uniqueAuthors: number; vibe: number; consensus: number; positivePct: number; neutralPct: number; negativePct: number };
type Score = { vibe: number; consensus: number; heat: number; bubbleGap: number | null; confidence: number; sampleSize: number; uniqueAuthors: number; positivePct: number; neutralPct: number; negativePct: number; sourcesMeasured: number; sourceScores: SourceScore[] };
type SearchItem = { source: string; title?: string; text?: string; url?: string; engagement?: number };
type SearchResult = { score?: Score; items?: SearchItem[] };

function vibeStyle(vibe: number) {
  if (vibe >= 67) return { label: "Positive", text: "text-emerald-600", bg: "bg-emerald-50" };
  if (vibe <= 33) return { label: "Negative", text: "text-rose-600", bg: "bg-rose-50" };
  return { label: "Mixed", text: "text-amber-600", bg: "bg-amber-50" };
}

export default function TopicDetailModal({ topic, onClose }: { topic: DetailTopic; onClose: () => void }) {
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [reactionData, setReactionData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/outside-feed/topic-detail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(topic) }).then((response) => response.json()).catch(() => null),
      fetch(`/api/outside-feed/search?q=${encodeURIComponent(topic.query || topic.title)}`).then((response) => response.json()).catch(() => null),
    ]).then(([topicDetail, reactions]) => {
      if (cancelled) return;
      setDetail(topicDetail as DetailResponse | null);
      setReactionData(reactions as SearchResult | null);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [topic]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const score = reactionData?.score;
  const vibe = score ? vibeStyle(score.vibe) : null;
  const samples = useMemo(() => (reactionData?.items ?? []).filter((item) => item.source !== "News / GDELT" && (item.text || item.title)).sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0)).slice(0, 4), [reactionData]);
  const sources = detail?.sources?.length ? detail.sources : topic.sources.filter((source) => source.url).map((source) => ({ title: source.source, url: source.url as string }));
  const fullTopicHref = topicHref(topic);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071126]/45 p-0 backdrop-blur-[2px] md:items-center md:p-6" onClick={onClose}>
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-[#f8faff] shadow-2xl md:max-w-4xl md:rounded-[28px]" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#17213a]/[0.07] bg-[#f8faff]/95 px-6 py-5 backdrop-blur md:px-8">
          <div><div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-rose-500">{topic.attention} attention</div><h2 className="mt-1 text-2xl font-[800] tracking-[-0.04em] md:text-3xl">{topic.title}</h2></div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#17213a]/10 bg-white p-2 text-[#17213a]/55" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-7 px-6 py-6 md:px-8 md:py-8">
          {loading && <div className="flex min-h-44 items-center justify-center text-sm font-semibold text-[#17213a]/45"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-[#2878ff]" /> Reading reactions across the public web…</div>}

          {!loading && <>
            <section><h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">What’s going on</h3><p className="mt-2 text-[16px] font-medium leading-7 text-[#17213a]/78">{detail?.summary || topic.description || topic.title}</p></section>
            <section><h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Why it’s trending</h3><p className="mt-2 text-[15px] font-medium leading-6 text-[#17213a]/68">{detail?.whyTrending || `This topic is drawing elevated attention across ${topic.sources.length || "multiple"} discovery sources.`}</p></section>

            {score && score.sampleSize > 0 && vibe && <section className="rounded-[24px] border border-[#17213a]/[0.07] bg-white p-5 md:p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">Measured public reaction</div><div className="mt-1 text-sm font-semibold text-[#17213a]/42">{score.sampleSize.toLocaleString()} reactions · {score.uniqueAuthors.toLocaleString()} authors · {score.sourcesMeasured} sources</div></div><div className={`rounded-[18px] px-4 py-3 text-right ${vibe.bg}`}><div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Vibe</div><div className={`text-4xl font-[850] leading-none tracking-[-0.07em] ${vibe.text}`}>{score.vibe}</div><div className={`mt-1 text-[9px] font-extrabold uppercase ${vibe.text}`}>{vibe.label}</div></div></div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Consensus",score.consensus],["Confidence",score.confidence],["Heat",score.heat],["Bubble gap",score.bubbleGap ?? "—"]].map(([label,value]) => <div key={String(label)} className="rounded-[14px] bg-[#f6f8fc] p-3 text-center"><div className="text-[9px] font-extrabold uppercase tracking-[0.06em] text-[#17213a]/33">{label}</div><div className="mt-1 text-xl font-[850]">{value}</div></div>)}</div>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[#eef1f6]"><div className="bg-emerald-500" style={{ width: `${score.positivePct}%` }} /><div className="bg-amber-400" style={{ width: `${score.neutralPct}%` }} /><div className="bg-rose-500" style={{ width: `${score.negativePct}%` }} /></div><div className="mt-2 grid grid-cols-3 text-center text-[10px] font-bold"><span className="text-emerald-600">{score.positivePct}% positive</span><span className="text-amber-600">{score.neutralPct}% neutral</span><span className="text-rose-600">{score.negativePct}% negative</span></div></section>}

            <section className="rounded-[22px] border border-[#2878ff]/10 bg-white p-5"><h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">The public read</h3><p className="mt-2 text-[15px] font-medium leading-6 text-[#17213a]/72">{detail?.publicRead || (score ? `The measured sample is ${score.positivePct}% positive, ${score.neutralPct}% neutral or unclear and ${score.negativePct}% negative. Sentiment describes reaction; it does not establish truth.` : "The measurable reaction sample is still developing.")}</p></section>

            {!!samples.length && <section><h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Sample reactions</h3><div className="mt-3 grid gap-2">{samples.map((item,index) => <div key={`${item.source}-${index}`} className="rounded-[16px] border border-[#17213a]/[0.06] bg-white p-4"><div className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#2878ff]">{item.source}{typeof item.engagement === "number" ? ` · ${item.engagement} engagement` : ""}</div><p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-[#17213a]/62">{item.text || item.title}</p></div>)}</div></section>}

            {!!sources.length && <section><h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Sources</h3><div className="mt-3 flex flex-wrap gap-2">{sources.slice(0,8).map((source,index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#2878ff]/10 bg-white px-3 py-2 text-[11px] font-bold text-[#2878ff]"><span className="max-w-[280px] truncate">{source.title}</span><ExternalLink className="h-3 w-3" /></a>)}</div></section>}

            <a href={fullTopicHref} className="flex items-center justify-between gap-4 rounded-[22px] bg-[#101a33] px-5 py-4 text-white transition hover:bg-[#182746]"><div><div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#8eb8ff]">Permanent topic page</div><div className="mt-1 text-sm font-extrabold">Open the full topic, sources and discussion</div><div className="mt-1 text-xs font-medium text-white/45">One topic. One long-lived thread. No duplicate reposts.</div></div><ArrowRight className="h-5 w-5 shrink-0" /></a>

            <p className="border-t border-[#17213a]/[0.07] pt-5 text-[11px] font-medium leading-5 text-[#17213a]/35">Public reaction summarizes the accessible sample. It does not establish factual truth, guilt, scientific validity, or what you should believe.</p>
          </>}
        </div>
      </div>
    </div>
  );
}
