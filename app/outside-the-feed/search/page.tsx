"use client";

import { ExternalLink, LoaderCircle, Search as SearchIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type SourceScore = { source: string; sampleSize: number; uniqueAuthors: number; vibe: number; consensus: number; positivePct: number; neutralPct: number; negativePct: number };
type Score = { vibe: number; consensus: number; heat: number; bubbleGap: number | null; confidence: number; sampleSize: number; uniqueAuthors: number; positivePct: number; neutralPct: number; negativePct: number; sourcesMeasured: number; sourceScores: SourceScore[] };
type Item = { source: string; title?: string; text?: string; url?: string; engagement?: number };
type Result = { query: string; score: Score; items: Item[]; contextArticles: number };

function vibeStyle(vibe: number) {
  if (vibe >= 67) return { label: "Positive", text: "text-emerald-600", bg: "bg-emerald-50" };
  if (vibe <= 33) return { label: "Negative", text: "text-rose-600", bg: "bg-rose-50" };
  return { label: "Mixed", text: "text-amber-600", bg: "bg-amber-50" };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(initialQuery);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(query: string) {
    const clean = query.trim();
    if (clean.length < 2) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/outside-feed/search?q=${encodeURIComponent(clean)}&youtubeSearch=1`);
      if (!response.ok) throw new Error("Could not search this topic.");
      setResult(await response.json() as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not search this topic.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (initialQuery.trim().length >= 2) void runSearch(initialQuery);
    // Run once for the query supplied in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void runSearch(draft); }
  const samples = useMemo(() => (result?.items ?? []).filter((item) => item.source !== "News / GDELT" && (item.text || item.title)).sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0)).slice(0, 10), [result]);
  const news = useMemo(() => (result?.items ?? []).filter((item) => item.source === "News / GDELT" && item.url).slice(0, 8), [result]);
  const vibe = result ? vibeStyle(result.score.vibe) : null;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#101a33]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
      <header className="border-b border-[#17213a]/[0.06] bg-[#f6f8fc]/95"><div className="mx-auto flex h-16 max-w-[1180px] items-center gap-5 px-5 lg:px-8"><a href="/outside-the-feed" className="flex items-center gap-2.5 font-bold tracking-[-0.025em]"><span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2878ff]"><span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#9ec3ff]" /></span><span>Global Reacts</span></a><div className="ml-auto flex items-center gap-4 text-xs font-bold text-[#17213a]/55"><a href="/outside-the-feed">Home</a><a href="/outside-the-feed/membership" className="rounded-full bg-[#2878ff] px-3.5 py-2 text-white">Membership</a></div></div></header>

      <section className="mx-auto max-w-[1000px] px-5 py-14 lg:px-8 lg:py-20">
        <div className="text-center"><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#2878ff]">Search the internet’s reaction</div><h1 className="mt-3 text-[clamp(2.8rem,7vw,5.5rem)] font-[820] leading-[0.95] tracking-[-0.065em]">Go deeper on anything.</h1><p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-[#17213a]/52">Search a person, story, brand, game, team or idea and see the measurable public reaction outside one personalized feed.</p></div>

        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-[760px] gap-2 rounded-[20px] border border-[#2878ff]/15 bg-white p-2.5 shadow-[0_14px_42px_rgba(33,56,108,0.08)]"><SearchIcon className="ml-2 mt-3 h-5 w-5 shrink-0 text-[#2878ff]/65" /><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search a topic…" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base font-semibold outline-none placeholder:text-[#17213a]/25" /><button type="submit" disabled={loading} className="rounded-[14px] bg-[#2878ff] px-5 py-3 text-xs font-extrabold text-white disabled:opacity-50">{loading ? "Reading…" : "Search"}</button></form>
        {error && <div className="mx-auto mt-5 max-w-[760px] rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}
        {loading && !result && <div className="mt-10 flex min-h-44 items-center justify-center text-sm font-semibold text-[#17213a]/40"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-[#2878ff]" /> Reading public reactions…</div>}

        {result && vibe && <div className="mt-10 space-y-6">
          <section className="rounded-[28px] border border-[#17213a]/[0.07] bg-white p-6 shadow-[0_18px_50px_rgba(33,56,108,0.05)] md:p-7"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">Public reaction for</div><h2 className="mt-1 text-3xl font-[820] tracking-[-0.045em]">{result.query}</h2><p className="mt-2 text-sm font-semibold text-[#17213a]/38">{result.score.sampleSize.toLocaleString()} measured reactions · {result.score.uniqueAuthors.toLocaleString()} unique authors · {result.score.sourcesMeasured} measured sources</p></div><div className={`rounded-[20px] px-5 py-4 text-right ${vibe.bg}`}><div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Vibe</div><div className={`text-5xl font-[850] leading-none tracking-[-0.07em] ${vibe.text}`}>{result.score.vibe}</div><div className={`mt-1 text-[10px] font-extrabold uppercase ${vibe.text}`}>{vibe.label}</div></div></div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Consensus",result.score.consensus],["Confidence",result.score.confidence],["Heat",result.score.heat],["Bubble gap",result.score.bubbleGap ?? "—"]].map(([label,value]) => <div key={String(label)} className="rounded-[15px] bg-[#f6f8fc] p-3 text-center"><div className="text-[9px] font-extrabold uppercase tracking-[0.06em] text-[#17213a]/34">{label}</div><div className="mt-1 text-2xl font-[850] tracking-[-0.04em]">{value}</div></div>)}</div>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-[#eef1f6]"><div className="bg-emerald-500" style={{ width: `${result.score.positivePct}%` }} /><div className="bg-amber-400" style={{ width: `${result.score.neutralPct}%` }} /><div className="bg-rose-500" style={{ width: `${result.score.negativePct}%` }} /></div><div className="mt-2 grid grid-cols-3 text-center text-[10px] font-bold"><span className="text-emerald-600">{result.score.positivePct}% positive</span><span className="text-amber-600">{result.score.neutralPct}% neutral</span><span className="text-rose-600">{result.score.negativePct}% negative</span></div></section>

          {!!result.score.sourceScores?.length && <section><h2 className="text-2xl font-[800] tracking-[-0.04em]">Reaction by source</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{result.score.sourceScores.map((source) => <div key={source.source} className="rounded-[20px] border border-[#17213a]/[0.07] bg-white p-5"><div className="flex items-start justify-between"><div><div className="font-extrabold">{source.source}</div><div className="mt-1 text-[10px] font-semibold text-[#17213a]/35">{source.sampleSize} reactions · {source.uniqueAuthors} authors</div></div><div className={`text-3xl font-[850] ${vibeStyle(source.vibe).text}`}>{source.vibe}</div></div><p className="mt-3 text-[11px] font-bold text-[#17213a]/43">{source.positivePct}% positive · {source.neutralPct}% neutral · {source.negativePct}% negative</p></div>)}</div></section>}
          {!!news.length && <section><h2 className="text-2xl font-[800] tracking-[-0.04em]">Context and source links</h2><div className="mt-4 flex flex-wrap gap-2">{news.map((item, index) => <a key={`${item.url}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#2878ff]/12 bg-white px-3 py-2 text-xs font-bold text-[#2878ff]"><span className="max-w-[320px] truncate">{item.title || item.source}</span><ExternalLink className="h-3 w-3" /></a>)}</div></section>}
          {!!samples.length && <section><h2 className="text-2xl font-[800] tracking-[-0.04em]">Sample reactions</h2><div className="mt-4 grid gap-3">{samples.map((item,index) => <div key={`${item.source}-${index}`} className="rounded-[18px] border border-[#17213a]/[0.06] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#2878ff]">{item.source}{typeof item.engagement === "number" && <span className="text-[#17213a]/30">· {item.engagement} engagement</span>}</div><p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-[#17213a]/62">{item.text || item.title}</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#2878ff]">View source <ExternalLink className="h-3 w-3" /></a>}</div>)}</div></section>}
        </div>}
      </section>
    </main>
  );
}
