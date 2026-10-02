"use client";

import { Check, ExternalLink, Gauge, LoaderCircle, Search, ShieldAlert } from "lucide-react";
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
  methodology: string;
};

type SearchResult = {
  query: string;
  fetchedAt: string;
  totalSamples: number;
  contextArticles: number;
  statuses: SourceStatus[];
  items: SampleItem[];
  score: ScoreSummary;
  disclaimer: string;
};

const modeStyle = {
  measured: "border-emerald-200 bg-emerald-50 text-emerald-700",
  context: "border-blue-200 bg-blue-50 text-blue-700",
  setup: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-slate-200 bg-slate-50 text-slate-500",
};

function vibeStyle(vibe: number) {
  if (vibe >= 67) return { label: "Positive", text: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" };
  if (vibe <= 33) return { label: "Negative", text: "text-rose-600", bg: "bg-rose-50", bar: "bg-rose-500" };
  return { label: "Mixed", text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" };
}

function Metric({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-[18px] border border-[#17213a]/[0.06] bg-[#f8faff] px-4 py-4">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/38">{label}</div>
      <div className="mt-1 text-2xl font-[750] tracking-[-0.04em] text-[#101a33]">{value}{suffix}</div>
    </div>
  );
}

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

  const vibe = result ? vibeStyle(result.score.vibe) : null;

  return (
    <section className="border-t border-[#17213a]/[0.06] bg-[#eef4ff]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
      <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2878ff]/15 bg-white px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live scoring lab
            </div>
            <h2 className="mt-5 text-4xl font-[750] leading-[1] tracking-[-0.05em] text-[#101a33] md:text-5xl">Now we count the room.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#17213a]/55">
              Search a topic and Outside the Feed retrieves measurable public reactions, classifies each one, removes near-duplicates, discounts repeat authors and turns the sample into quantitative scores.
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
                {loading ? "Scoring…" : "Get the score"}
              </button>
            </form>
            <p className="mt-3 max-w-xl text-[11px] leading-5 text-[#17213a]/40">
              V0.1 uses a deterministic lexical classifier so the scoring system works without paid AI infrastructure. The next classifier will use target-aware GPT stance classification while keeping the same aggregation math.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#17213a]/[0.07] bg-white p-5 shadow-[0_20px_60px_rgba(33,56,108,0.07)] sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/38">Live read for</div>
                <div className="mt-1 text-2xl font-[750] tracking-[-0.035em] text-[#101a33]">{query}</div>
              </div>
              {result && <div className="text-right"><div className="text-2xl font-[750] text-[#2878ff]">{result.score.sampleSize}</div><div className="text-[11px] font-bold text-[#17213a]/38">deduped reactions scored</div></div>}
            </div>

            {loading && !result && <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[#f6f8fc] p-5 text-sm font-semibold text-[#17213a]/55"><LoaderCircle className="h-5 w-5 animate-spin text-[#2878ff]" /> Retrieving and scoring live reactions…</div>}
            {error && <div className="mt-8 flex items-center gap-3 rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700"><ShieldAlert className="h-5 w-5" /> {error}</div>}

            {result && vibe && (
              <>
                <div className="mt-7 grid gap-4 lg:grid-cols-[210px_1fr]">
                  <div className={`rounded-[24px] p-5 ${vibe.bg}`}>
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#17213a]/42"><Gauge className="h-3.5 w-3.5" /> Vibe score</div>
                    <div className={`mt-3 text-[72px] font-[800] leading-none tracking-[-0.08em] ${vibe.text}`}>{result.score.vibe}</div>
                    <div className={`mt-2 text-sm font-extrabold ${vibe.text}`}>{vibe.label}</div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80"><div className={`h-full rounded-full ${vibe.bar}`} style={{ width: `${result.score.vibe}%` }} /></div>
                    <div className="mt-3 text-[10px] font-semibold leading-4 text-[#17213a]/40">0 = most negative · 50 = mixed · 100 = most positive</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                    <Metric label="Consensus" value={result.score.consensus} />
                    <Metric label="Heat" value={result.score.heat} />
                    <Metric label="Confidence" value={result.score.confidence} />
                    <Metric label="Bubble gap" value={result.score.bubbleGap ?? "—"} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[18px] border border-[#17213a]/[0.06] bg-[#f8faff]">
                  <div className="p-4 text-center"><div className="text-xl font-[750] text-emerald-600">{result.score.positivePct}%</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#17213a]/38">positive</div></div>
                  <div className="border-x border-[#17213a]/[0.06] p-4 text-center"><div className="text-xl font-[750] text-amber-600">{result.score.neutralPct}%</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#17213a]/38">neutral / unclear</div></div>
                  <div className="p-4 text-center"><div className="text-xl font-[750] text-rose-600">{result.score.negativePct}%</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#17213a]/38">negative</div></div>
                </div>

                {result.score.sourceScores.length > 0 && (
                  <div className="mt-7 border-t border-[#17213a]/[0.07] pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-extrabold text-[#101a33]">Score by source</div>
                      <div className="text-[10px] font-bold text-[#17213a]/36">Bubble Gap = max source Vibe − min source Vibe</div>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {result.score.sourceScores.map((source) => {
                        const style = vibeStyle(source.vibe);
                        return (
                          <div key={source.source} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[16px] border border-[#17213a]/[0.05] bg-[#fbfcff] px-4 py-3 sm:grid-cols-[150px_1fr_auto]">
                            <div><div className="text-sm font-extrabold text-[#101a33]">{source.source}</div><div className="mt-0.5 text-[10px] font-semibold text-[#17213a]/35">{source.sampleSize} reactions · {source.uniqueAuthors} authors</div></div>
                            <div className="hidden sm:block"><div className="h-2 overflow-hidden rounded-full bg-[#17213a]/6"><div className={`h-full rounded-full ${style.bar}`} style={{ width: `${source.vibe}%` }} /></div><div className="mt-1.5 text-[9px] font-semibold text-[#17213a]/35">{source.positivePct}% + · {source.neutralPct}% neutral · {source.negativePct}% −</div></div>
                            <div className="text-right"><div className={`text-2xl font-[800] tracking-[-0.04em] ${style.text}`}>{source.vibe}</div><div className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#17213a]/35">Vibe · {source.consensus} consensus</div></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {result.statuses.map((source) => (
                    <div key={source.id} className="rounded-[18px] border border-[#17213a]/[0.06] bg-[#fbfcff] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-[#101a33]">{source.name}</div>
                        <span className={`rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] ${modeStyle[source.mode]}`}>
                          {source.mode === "measured" ? `${source.count ?? 0} returned` : source.mode}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#17213a]/48">{source.note}</p>
                    </div>
                  ))}
                </div>

                {previewItems.length > 0 && (
                  <div className="mt-7 border-t border-[#17213a]/[0.07] pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-extrabold text-[#101a33]">Sample reactions behind the number</div>
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

                <div className="mt-6 rounded-[16px] bg-[#101a33] px-4 py-4 text-[10px] leading-5 text-white/55">
                  <div className="font-extrabold uppercase tracking-[0.07em] text-white/80">Method v0.1</div>
                  <p className="mt-1">{result.score.methodology}</p>
                  <p className="mt-2 text-white/38">{result.disclaimer}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
