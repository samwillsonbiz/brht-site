"use client";

import { Check, ExternalLink, LoaderCircle, Search, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

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
};

type SearchResult = {
  query: string;
  fetchedAt: string;
  totalSamples: number;
  contextArticles: number;
  statuses: SourceStatus[];
  items: SampleItem[];
  disclaimer: string;
};

const modeStyle = {
  measured: "border-emerald-200 bg-emerald-50 text-emerald-700",
  context: "border-blue-200 bg-blue-50 text-blue-700",
  setup: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-slate-200 bg-slate-50 text-slate-500",
};

export default function LiveSourceLab() {
  const [query, setQuery] = useState("Cornell University fraternity allegations");
  const [draft, setDraft] = useState(query);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(nextQuery: string) {
    const clean = nextQuery.trim();
    if (clean.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/outside-feed/search?q=${encodeURIComponent(clean)}`);
      if (!response.ok) throw new Error("Live source search failed.");
      const data = (await response.json()) as SearchResult;
      setResult(data);
      setQuery(clean);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Live source search failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runSearch(query);
    // Intentionally load the default live test once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(draft);
  }

  const previewItems = result?.items
    .filter((item) => item.source !== "News / GDELT")
    .sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0))
    .slice(0, 8) ?? [];

  return (
    <section className="border-t border-[#17213a]/[0.06] bg-[#eef4ff]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
      <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2878ff]/15 bg-white px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live source lab
            </div>
            <h2 className="mt-5 text-4xl font-[750] leading-[1] tracking-[-0.05em] text-[#101a33] md:text-5xl">The prototype is starting to listen to the real internet.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#17213a]/55">
              This panel queries sources we can access legitimately today. It shows coverage and samples only — we are not pretending the current sample is a statistically representative sentiment score yet.
            </p>

            <form onSubmit={submit} className="mt-7 flex max-w-xl gap-2 rounded-[20px] border border-[#2878ff]/15 bg-white p-2 shadow-[0_15px_45px_rgba(33,56,108,0.08)]">
              <Search className="ml-2 mt-3 h-4 w-4 shrink-0 text-[#2878ff]/65" />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-semibold text-[#101a33] outline-none placeholder:text-[#17213a]/30"
                placeholder="Test a topic..."
                aria-label="Test a live topic"
              />
              <button type="submit" disabled={loading} className="rounded-[14px] bg-[#2878ff] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">
                {loading ? "Checking…" : "Check live"}
              </button>
            </form>
            <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#17213a]/38">Prototype tester: unrestricted search is visible here while we build. The consumer product can move arbitrary deep search behind membership later.</p>
          </div>

          <div className="rounded-[28px] border border-[#17213a]/[0.07] bg-white p-5 shadow-[0_20px_60px_rgba(33,56,108,0.07)] sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/38">Live coverage for</div>
                <div className="mt-1 text-2xl font-[750] tracking-[-0.035em] text-[#101a33]">{query}</div>
              </div>
              {result && <div className="text-right"><div className="text-2xl font-[750] text-[#2878ff]">{result.totalSamples}</div><div className="text-[11px] font-bold text-[#17213a]/38">social samples returned</div></div>}
            </div>

            {loading && !result && <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[#f6f8fc] p-5 text-sm font-semibold text-[#17213a]/55"><LoaderCircle className="h-5 w-5 animate-spin text-[#2878ff]" /> Checking live sources…</div>}
            {error && <div className="mt-8 flex items-center gap-3 rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700"><ShieldAlert className="h-5 w-5" /> {error}</div>}

            {result && (
              <>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {result.statuses.map((source) => (
                    <div key={source.id} className="rounded-[18px] border border-[#17213a]/[0.06] bg-[#fbfcff] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-[#101a33]">{source.name}</div>
                        <span className={`rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] ${modeStyle[source.mode]}`}>
                          {source.mode === "measured" ? `${source.count ?? 0} live` : source.mode}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#17213a]/48">{source.note}</p>
                    </div>
                  ))}
                </div>

                {previewItems.length > 0 && (
                  <div className="mt-7 border-t border-[#17213a]/[0.07] pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-extrabold text-[#101a33]">Sample reactions we actually retrieved</div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600"><Check className="h-3 w-3" /> live data</div>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {previewItems.map((item, index) => (
                        <div key={`${item.source}-${index}`} className="rounded-[16px] bg-[#f6f8fc] px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#2878ff]">
                            <span>{item.source}</span>
                            {typeof item.engagement === "number" && <span className="text-[#17213a]/35">{item.engagement} engagement</span>}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#17213a]/58">{item.title || item.text || "Live result"}</p>
                          {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#2878ff]">Source <ExternalLink className="h-2.5 w-2.5" /></a>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-5 text-[10px] leading-4 text-[#17213a]/35">{result.disclaimer}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
