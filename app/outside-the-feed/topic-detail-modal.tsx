"use client";

import { ExternalLink, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function TopicDetailModal({ topic, onClose }: { topic: DetailTopic; onClose: () => void }) {
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDetail(null);
    fetch("/api/outside-feed/topic-detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topic),
    })
      .then((response) => response.json())
      .then((data) => { if (!cancelled) setDetail(data as DetailResponse); })
      .catch(() => { if (!cancelled) setDetail({ summary: topic.description ?? topic.title, error: "Could not load the deeper read." }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [topic]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071126]/45 p-0 backdrop-blur-[2px] md:items-center md:p-6" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-[#f8faff] shadow-2xl md:max-w-3xl md:rounded-[28px]" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#17213a]/[0.07] bg-[#f8faff]/95 px-6 py-5 backdrop-blur md:px-8">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-rose-500">{topic.attention} attention</div>
            <h2 className="mt-1 text-2xl font-[800] tracking-[-0.04em] text-[#101a33] md:text-3xl">{topic.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#17213a]/10 bg-white p-2 text-[#17213a]/55 hover:text-[#101a33]" aria-label="Close topic detail"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-7 px-6 py-6 md:px-8 md:py-8">
          {loading && (
            <div className="flex min-h-44 items-center justify-center text-sm font-semibold text-[#17213a]/45"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-[#2878ff]" /> Reading across the public web…</div>
          )}

          {!loading && detail && (
            <>
              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">What’s going on</h3>
                <p className="mt-2 text-[16px] font-medium leading-7 text-[#17213a]/78">{detail.summary || topic.description || topic.title}</p>
              </section>

              {detail.whyTrending && (
                <section>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Why it’s trending</h3>
                  <p className="mt-2 text-[15px] font-medium leading-6.5 text-[#17213a]/68">{detail.whyTrending}</p>
                </section>
              )}

              {detail.publicRead && (
                <section className="rounded-[22px] border border-[#2878ff]/10 bg-white p-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">The public read</h3>
                  <p className="mt-2 text-[15px] font-medium leading-6.5 text-[#17213a]/72">{detail.publicRead}</p>
                </section>
              )}

              {!!detail.reactionClusters?.length && (
                <section>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">What people are saying</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {detail.reactionClusters.map((cluster, index) => (
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

              {!!detail.sources?.length && (
                <section>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Sources</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.sources.map((source, index) => (
                      <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#2878ff]/10 bg-white px-3 py-2 text-[11px] font-bold text-[#2878ff] hover:bg-[#2878ff]/[0.05]">
                        <span className="max-w-[260px] truncate">{source.title}</span><ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {detail.configured === false && (
                <p className="rounded-[16px] bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">Live web detail is ready in the app but OpenAI web search has not been connected yet.</p>
              )}

              <p className="border-t border-[#17213a]/[0.07] pt-5 text-[11px] font-medium leading-5 text-[#17213a]/35">Public reaction summarizes the accessible sample. It does not establish factual truth, guilt, scientific validity, or what you should believe.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
