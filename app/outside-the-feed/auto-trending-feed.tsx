"use client";

import { ExternalLink, Flame, LoaderCircle, Radar, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import LiveTopicScore from "./live-topic-score";

type SourceSignal = {
  source: string;
  value: number;
  detail: string;
  url?: string;
};

type Trend = {
  rank: number;
  title: string;
  query: string;
  attention: number;
  sourceCount: number;
  sources: SourceSignal[];
  discoveryReason: string;
};

type Result = {
  generatedAt: string;
  topics: Trend[];
  sourceStatus: Record<string, { ok: boolean; candidates?: number; note?: string }>;
  methodology: string;
};

function attentionStyle(value: number) {
  if (value >= 85) return "text-rose-600";
  if (value >= 70) return "text-amber-600";
  return "text-[#2878ff]";
}

export default function AutoTrendingFeed() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/outside-feed/trending?refresh=${refreshKey}`);
        if (!response.ok) throw new Error("Could not discover live topics.");
        const data = (await response.json()) as Result;
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not discover live topics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <section id="live-trends" className="mx-auto max-w-[1280px] px-5 pb-16 lg:px-8">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#17213a]/38">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.09)]" />
            Machine-discovered now
          </div>
          <h2 className="mt-2 text-3xl font-[750] tracking-[-0.04em] md:text-4xl">What is actually trending right now</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#17213a]/46">No editor picked these. Outside the Feed discovers candidates from free live signals, merges the same story across sources, checks for social discussion, then scores sentiment separately.</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#17213a]/8 bg-white px-4 py-2.5 text-xs font-bold text-[#17213a]/55 shadow-sm hover:text-[#2878ff] disabled:opacity-50">
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh discovery
        </button>
      </div>

      {loading && !result && (
        <div className="flex min-h-56 items-center justify-center rounded-[26px] border border-[#17213a]/[0.07] bg-white text-sm font-semibold text-[#17213a]/45 shadow-[0_18px_50px_rgba(33,56,108,0.055)]">
          <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-[#2878ff]" /> Scanning live attention signals…
        </div>
      )}

      {error && !result && (
        <div className="rounded-[26px] border border-rose-100 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-[26px] border border-[#17213a]/[0.07] bg-white shadow-[0_18px_50px_rgba(33,56,108,0.055)]">
            {result.topics.map((topic) => (
              <div key={`${topic.rank}-${topic.title}`} className="grid gap-4 border-b border-[#17213a]/[0.07] px-5 py-6 last:border-b-0 md:grid-cols-[42px_minmax(0,1fr)_150px_190px] md:items-center md:px-7">
                <div className="hidden text-center text-lg font-semibold text-[#17213a]/28 md:block">{topic.rank}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.07em] text-[#17213a]/36">
                    <span className="md:hidden">#{topic.rank}</span>
                    <span className="inline-flex items-center gap-1 text-rose-500"><Flame className="h-3 w-3" /> Attention {topic.attention}</span>
                    <span>·</span>
                    <span>{topic.sourceCount} discovery source{topic.sourceCount === 1 ? "" : "s"}</span>
                  </div>
                  <h3 className="mt-2 text-[21px] font-[750] leading-[1.14] tracking-[-0.03em] text-[#101a33] md:text-[24px]">{topic.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topic.sources.slice(0, 4).map((signal, index) => signal.url ? (
                      <a key={`${signal.source}-${index}`} href={signal.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[#2878ff]/10 bg-[#2878ff]/[0.05] px-2.5 py-1.5 text-[10px] font-bold text-[#2878ff] hover:bg-[#2878ff]/10" onClick={(event) => event.stopPropagation()}>
                        {signal.source} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span key={`${signal.source}-${index}`} className="rounded-full border border-[#17213a]/7 bg-[#f6f8fc] px-2.5 py-1.5 text-[10px] font-bold text-[#17213a]/48">{signal.source}</span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-[#17213a]/38">{topic.sources.slice(0, 3).map((signal) => signal.detail).join(" · ")}</p>
                </div>
                <div className="rounded-[18px] bg-[#f7f9fd] px-4 py-3 text-center">
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Attention</div>
                  <div className={`mt-1 text-[34px] font-[850] leading-none tracking-[-0.06em] ${attentionStyle(topic.attention)}`}>{topic.attention}</div>
                  <div className="mt-1 text-[9px] font-semibold text-[#17213a]/32">discovery score</div>
                </div>
                <LiveTopicScore query={topic.query} />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 rounded-[18px] border border-[#2878ff]/10 bg-[#eaf2ff]/65 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2.5 text-xs leading-5 text-[#17213a]/50">
              <Radar className="mt-0.5 h-4 w-4 shrink-0 text-[#2878ff]" />
              <span>{result.methodology}</span>
            </div>
            <div className="shrink-0 text-[10px] font-bold uppercase tracking-[0.06em] text-[#2878ff]">Updated {new Date(result.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
          </div>
        </>
      )}
    </section>
  );
}
