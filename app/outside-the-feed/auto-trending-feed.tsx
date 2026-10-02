"use client";

import { ExternalLink, Flame, LoaderCircle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import LiveTopicScore from "./live-topic-score";

type SourceSignal = {
  source: string;
  detail: string;
  url?: string;
  items?: number;
};

type Trend = {
  rank: number;
  title: string;
  description?: string;
  query: string;
  attention: number;
  platformCount?: number;
  sourceCount: number;
  sources: SourceSignal[];
  observedSocialItems?: number;
  observedItems?: number;
  observedComments?: number;
  observedViews?: number;
};

type Result = {
  generatedAt: string;
  topics: Trend[];
  sourceStatus: Record<string, { ok: boolean; candidates?: number; note?: string }>;
};

function attentionStyle(value: number) {
  if (value >= 85) return "text-rose-600";
  if (value >= 70) return "text-amber-600";
  return "text-[#2878ff]";
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function sourceLabel(signal: SourceSignal) {
  const count = signal.items ?? 0;
  if (!count) return signal.source;
  if (signal.source === "YouTube") return `${signal.source} · ${count} video${count === 1 ? "" : "s"}`;
  if (signal.source === "Bluesky") return `${signal.source} · ${count} post${count === 1 ? "" : "s"}`;
  if (signal.source === "Hacker News") return `${signal.source} · ${count} discussion${count === 1 ? "" : "s"}`;
  return signal.source;
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
        if (!response.ok) throw new Error("Could not load current trends.");
        const data = (await response.json()) as Result;
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load current trends.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <section id="live-trends" className="mx-auto max-w-[1280px] px-5 pb-16 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-[750] tracking-[-0.04em] md:text-4xl">Trending now</h2>
          {result && (
            <p className="mt-1.5 text-xs font-semibold text-[#17213a]/35">
              Updated {new Date(result.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </div>
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#17213a]/8 bg-white px-3.5 py-2 text-xs font-bold text-[#17213a]/50 shadow-sm hover:text-[#2878ff] disabled:opacity-50">
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading && !result && (
        <div className="flex min-h-52 items-center justify-center rounded-[24px] border border-[#17213a]/[0.07] bg-white text-sm font-semibold text-[#17213a]/42 shadow-[0_18px_50px_rgba(33,56,108,0.05)]">
          <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-[#2878ff]" /> Loading what&apos;s moving…
        </div>
      )}

      {error && !result && (
        <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
      )}

      {result && (
        <div className="overflow-hidden rounded-[24px] border border-[#17213a]/[0.07] bg-white shadow-[0_18px_50px_rgba(33,56,108,0.05)]">
          {result.topics.map((topic) => {
            const breadth: string[] = [];
            const socialItems = topic.observedSocialItems ?? topic.observedItems ?? 0;
            if (socialItems > 0) breadth.push(`${compactNumber(socialItems)} social posts/videos observed`);
            if ((topic.observedComments ?? 0) > 0) breadth.push(`${compactNumber(topic.observedComments ?? 0)} comments`);
            if ((topic.observedViews ?? 0) > 0) breadth.push(`${compactNumber(topic.observedViews ?? 0)} views`);

            const platformCount = topic.platformCount ?? topic.sourceCount;

            return (
              <div key={`${topic.rank}-${topic.title}`} className="grid gap-4 border-b border-[#17213a]/[0.07] px-5 py-5 last:border-b-0 md:grid-cols-[38px_minmax(0,1fr)_138px_190px] md:items-center md:px-7">
                <div className="hidden text-center text-base font-semibold text-[#17213a]/28 md:block">{topic.rank}</div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#17213a]/34">
                    <span className="md:hidden">#{topic.rank}</span>
                    <span className="inline-flex items-center gap-1 text-rose-500"><Flame className="h-3 w-3" /> {topic.attention} attention</span>
                    <span>·</span>
                    <span>{platformCount} platform{platformCount === 1 ? "" : "s"}</span>
                  </div>

                  <h3 className="mt-1.5 text-[21px] font-[750] leading-[1.14] tracking-[-0.03em] text-[#101a33] md:text-[24px]">{topic.title}</h3>

                  {topic.description && (
                    <p className="mt-1.5 max-w-3xl text-sm font-medium leading-5.5 text-[#17213a]/55 md:text-[15px] md:leading-6">{topic.description}</p>
                  )}

                  {breadth.length > 0 && (
                    <p className="mt-2 text-[11px] font-bold text-[#17213a]/38">{breadth.join(" · ")}</p>
                  )}

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {topic.sources.slice(0, 4).map((signal) => signal.url ? (
                      <a key={signal.source} href={signal.url} target="_blank" rel="noreferrer" title={signal.detail} className="inline-flex items-center gap-1 rounded-full border border-[#2878ff]/10 bg-[#2878ff]/[0.045] px-2.5 py-1.5 text-[10px] font-bold text-[#2878ff] hover:bg-[#2878ff]/10" onClick={(event) => event.stopPropagation()}>
                        {sourceLabel(signal)} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span key={signal.source} title={signal.detail} className="rounded-full border border-[#17213a]/7 bg-[#f6f8fc] px-2.5 py-1.5 text-[10px] font-bold text-[#17213a]/46">{sourceLabel(signal)}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[16px] bg-[#f7f9fd] px-3.5 py-3 text-center">
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/34">Attention</div>
                  <div className={`mt-1 text-[32px] font-[850] leading-none tracking-[-0.06em] ${attentionStyle(topic.attention)}`}>{topic.attention}</div>
                </div>

                <LiveTopicScore query={topic.query} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
