"use client";

import { ArrowLeft, Bell, Bookmark, ExternalLink, LoaderCircle, MessageCircle, Search, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { parseTopicSources, type SourceSignal } from "../../topic-utils";

type SourceScore = { source: string; sampleSize: number; uniqueAuthors: number; vibe: number; consensus: number; positivePct: number; neutralPct: number; negativePct: number };
type Score = { vibe: number; consensus: number; heat: number; bubbleGap: number | null; confidence: number; sampleSize: number; uniqueAuthors: number; positivePct: number; neutralPct: number; negativePct: number; sourcesMeasured: number; sourceScores: SourceScore[] };
type SearchItem = { source: string; title?: string; text?: string; url?: string; author?: string; engagement?: number };
type SearchResult = { score?: Score; items?: SearchItem[]; contextArticles?: number };
type Detail = { summary?: string; whyTrending?: string; publicRead?: string; reactionClusters?: Array<{ label: string; description: string; strength?: string }>; sources?: Array<{ title: string; url: string }> };
type Comment = { id: string; author: string; text: string; createdAt: string };

function vibeStyle(vibe: number) {
  if (vibe >= 67) return { label: "Positive", text: "text-emerald-600", bg: "bg-emerald-50" };
  if (vibe <= 33) return { label: "Negative", text: "text-rose-600", bg: "bg-rose-50" };
  return { label: "Mixed", text: "text-amber-600", bg: "bg-amber-50" };
}

function moderateComment(value: string) {
  const blocked = /\b(fuck|shit|bitch|cunt|retard(?:ed)?|nigg(?:er|a)|faggot)\b/i;
  return blocked.test(value) ? "Please rephrase this comment to meet the community rules." : null;
}

export default function CanonicalTopicPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug ?? "topic";
  const title = searchParams.get("title") || slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const query = searchParams.get("q") || title;
  const description = searchParams.get("description") || "";
  const attention = Math.max(0, Math.min(100, Number(searchParams.get("attention") || 0)));
  const sources = useMemo(() => parseTopicSources(searchParams.get("sources")), [searchParams]);

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = `global-reacts-thread:${slug}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setComments(JSON.parse(stored) as Comment[]);
    } catch { /* prototype storage only */ }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const body = { title, query, description, attention, sources };
    Promise.all([
      fetch(`/api/outside-feed/search?q=${encodeURIComponent(query)}&youtubeSearch=1`).then((response) => response.json()).catch(() => null),
      fetch("/api/outside-feed/topic-detail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((response) => response.json()).catch(() => null),
    ]).then(([reaction, topicDetail]) => {
      if (cancelled) return;
      setSearchResult(reaction as SearchResult | null);
      setDetail(topicDetail as Detail | null);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [title, query, description, attention, sources]);

  const score = searchResult?.score;
  const vibe = score ? vibeStyle(score.vibe) : null;
  const samples = useMemo(() => (searchResult?.items ?? []).filter((item) => item.source !== "News / GDELT" && (item.text || item.title)).sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0)).slice(0, 8), [searchResult]);
  const sourceLinks = useMemo(() => {
    const links = new Map<string, string>();
    for (const source of sources) if (source.url) links.set(source.url, source.source);
    for (const source of detail?.sources ?? []) if (source.url) links.set(source.url, source.title);
    for (const item of searchResult?.items ?? []) if (item.url && item.source === "News / GDELT") links.set(item.url, item.title || item.source);
    return [...links.entries()].slice(0, 10).map(([url, label]) => ({ url, label }));
  }, [sources, detail, searchResult]);

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = draft.trim();
    if (clean.length < 2) return;
    const moderationError = moderateComment(clean);
    if (moderationError) { setCommentError(moderationError); return; }
    const next: Comment[] = [...comments, { id: crypto.randomUUID(), author: "You", text: clean, createdAt: new Date().toISOString() }];
    setComments(next);
    setDraft("");
    setCommentError(null);
    try { localStorage.setItem(`global-reacts-thread:${slug}`, JSON.stringify(next)); } catch { /* prototype storage only */ }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#101a33]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
      <header className="sticky top-0 z-40 border-b border-[#17213a]/[0.06] bg-[#f6f8fc]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-5 px-5 lg:px-8">
          <a href="/outside-the-feed" className="flex items-center gap-2.5 font-bold tracking-[-0.025em]"><span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2878ff]"><span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#9ec3ff]" /></span><span>Global Reacts</span></a>
          <div className="ml-auto flex items-center gap-3 text-xs font-bold text-[#17213a]/55"><a href="/outside-the-feed/search" className="inline-flex items-center gap-1.5 hover:text-[#101a33]"><Search className="h-3.5 w-3.5" /> Search</a><a href="/outside-the-feed/membership" className="rounded-full bg-[#2878ff] px-3.5 py-2 text-white">Membership</a></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-12">
        <a href="/outside-the-feed" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17213a]/45 hover:text-[#2878ff]"><ArrowLeft className="h-3.5 w-3.5" /> Back to the front page</a>

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em]"><span className="rounded-full bg-[#2878ff]/10 px-2.5 py-1.5 text-[#2878ff]">Canonical topic</span>{attention > 0 && <span className="rounded-full bg-rose-50 px-2.5 py-1.5 text-rose-600">{attention} attention</span>}</div>
            <h1 className="mt-4 max-w-4xl text-[clamp(2.6rem,6vw,5rem)] font-[820] leading-[0.98] tracking-[-0.06em]">{title}</h1>
            {description && <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-[#17213a]/58">{description}</p>}
            <div className="mt-6 flex flex-wrap gap-2"><button className="inline-flex items-center gap-1.5 rounded-full border border-[#17213a]/8 bg-white px-3.5 py-2 text-xs font-bold text-[#17213a]/55"><Bookmark className="h-3.5 w-3.5" /> Save topic</button><button className="inline-flex items-center gap-1.5 rounded-full border border-[#17213a]/8 bg-white px-3.5 py-2 text-xs font-bold text-[#17213a]/55"><Bell className="h-3.5 w-3.5" /> Follow updates</button></div>
          </div>

          <aside className="rounded-[24px] border border-[#17213a]/[0.07] bg-white p-5 shadow-[0_18px_50px_rgba(33,56,108,0.05)]">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]"><ShieldCheck className="h-3.5 w-3.5" /> One topic, one thread</div>
            <p className="mt-3 text-sm font-medium leading-6 text-[#17213a]/58">This is the permanent home for this topic. If it trends again next week, the same page and discussion continue instead of creating duplicate posts.</p>
          </aside>
        </section>

        {loading && <div className="mt-10 flex min-h-40 items-center justify-center rounded-[26px] border border-[#17213a]/[0.07] bg-white text-sm font-semibold text-[#17213a]/45"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-[#2878ff]" /> Building the public read…</div>}

        {!loading && (
          <>
            <section className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[26px] border border-[#17213a]/[0.07] bg-white p-6 md:p-7">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">What’s going on</div>
                <p className="mt-3 text-[17px] font-medium leading-7 text-[#17213a]/72">{detail?.summary || description || title}</p>
                <div className="mt-6 border-t border-[#17213a]/[0.07] pt-5"><div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Why it’s trending</div><p className="mt-2 text-sm font-medium leading-6 text-[#17213a]/62">{detail?.whyTrending || `This topic is drawing elevated attention across ${sources.length || "multiple"} public sources.`}</p></div>
              </div>

              {score && score.sampleSize > 0 && vibe ? (
                <div className="rounded-[26px] border border-[#17213a]/[0.07] bg-white p-6">
                  <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">Public reaction</div><div className="mt-2 text-sm font-semibold text-[#17213a]/42">{score.sampleSize.toLocaleString()} reactions · {score.uniqueAuthors.toLocaleString()} authors</div></div><div className={`rounded-[18px] px-4 py-3 text-right ${vibe.bg}`}><div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Vibe</div><div className={`text-4xl font-[850] leading-none tracking-[-0.07em] ${vibe.text}`}>{score.vibe}</div><div className={`mt-1 text-[9px] font-extrabold uppercase ${vibe.text}`}>{vibe.label}</div></div></div>
                  <div className="mt-5 grid grid-cols-3 gap-2">{[["Consensus", score.consensus],["Confidence", score.confidence],["Heat", score.heat]].map(([label,value]) => <div key={String(label)} className="rounded-[14px] bg-[#f6f8fc] p-3 text-center"><div className="text-[9px] font-extrabold uppercase tracking-[0.06em] text-[#17213a]/33">{label}</div><div className="mt-1 text-xl font-[850]">{value}</div></div>)}</div>
                  <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-[#eef1f6]"><div className="bg-emerald-500" style={{ width: `${score.positivePct}%` }} /><div className="bg-amber-400" style={{ width: `${score.neutralPct}%` }} /><div className="bg-rose-500" style={{ width: `${score.negativePct}%` }} /></div>
                  <div className="mt-2 grid grid-cols-3 text-center text-[10px] font-bold"><span className="text-emerald-600">{score.positivePct}% positive</span><span className="text-amber-600">{score.neutralPct}% neutral</span><span className="text-rose-600">{score.negativePct}% negative</span></div>
                </div>
              ) : <div className="rounded-[26px] border border-[#17213a]/[0.07] bg-white p-6 text-sm font-medium leading-6 text-[#17213a]/48">Attention is measurable, but there is not yet enough accessible reaction data for a useful sentiment score.</div>}
            </section>

            <section className="mt-5 rounded-[26px] border border-[#2878ff]/10 bg-white p-6 md:p-7"><div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">The public read</div><p className="mt-3 text-[16px] font-medium leading-7 text-[#17213a]/70">{detail?.publicRead || (score ? `The measured sample is ${score.positivePct}% positive, ${score.neutralPct}% neutral or unclear and ${score.negativePct}% negative. Vibe measures sampled reaction, not factual truth.` : "The public-reaction sample is still developing.")}</p></section>

            {!!score?.sourceScores?.length && <section className="mt-8"><h2 className="text-2xl font-[800] tracking-[-0.04em]">Same topic, different communities</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{score.sourceScores.map((source) => <div key={source.source} className="rounded-[20px] border border-[#17213a]/[0.07] bg-white p-5"><div className="flex items-start justify-between gap-3"><div><div className="font-extrabold">{source.source}</div><div className="mt-1 text-[10px] font-semibold text-[#17213a]/35">{source.sampleSize} reactions · {source.uniqueAuthors} authors</div></div><div className={`text-3xl font-[850] ${vibeStyle(source.vibe).text}`}>{source.vibe}</div></div><div className="mt-3 text-[11px] font-bold text-[#17213a]/45">{source.positivePct}% positive · {source.neutralPct}% neutral · {source.negativePct}% negative · {source.consensus} consensus</div></div>)}</div></section>}

            {!!sourceLinks.length && <section className="mt-8"><h2 className="text-2xl font-[800] tracking-[-0.04em]">Sources</h2><p className="mt-1 text-sm text-[#17213a]/45">Go straight to the places where this topic was detected.</p><div className="mt-4 flex flex-wrap gap-2">{sourceLinks.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#2878ff]/12 bg-white px-3 py-2 text-xs font-bold text-[#2878ff] hover:bg-[#2878ff]/5"><span className="max-w-[300px] truncate">{source.label}</span><ExternalLink className="h-3 w-3" /></a>)}</div></section>}

            {!!samples.length && <section className="mt-8"><h2 className="text-2xl font-[800] tracking-[-0.04em]">Sample reactions</h2><div className="mt-4 grid gap-3">{samples.map((item, index) => <div key={`${item.source}-${index}`} className="rounded-[18px] border border-[#17213a]/[0.06] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#2878ff]"><span>{item.source}</span>{typeof item.engagement === "number" && <span className="text-[#17213a]/30">{item.engagement} engagement</span>}</div><p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-[#17213a]/62">{item.text || item.title}</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#2878ff]">View source <ExternalLink className="h-3 w-3" /></a>}</div>)}</div></section>}

            <section className="mt-12 border-t border-[#17213a]/[0.07] pt-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]"><MessageCircle className="h-4 w-4" /> Permanent discussion</div><h2 className="mt-2 text-3xl font-[820] tracking-[-0.045em]">Talk about this topic here.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#17213a]/48">This thread stays attached to the canonical topic. Community rules block obvious abuse, slurs, spam and harassment; disagreement is welcome.</p></div><a href="/outside-the-feed/membership" className="text-xs font-bold text-[#2878ff]">Member feature →</a></div>

              <form onSubmit={submitComment} className="mt-6 rounded-[22px] border border-[#17213a]/[0.07] bg-white p-4"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={1200} placeholder="Add to the discussion…" className="w-full resize-none bg-transparent text-sm font-medium leading-6 outline-none placeholder:text-[#17213a]/25" /><div className="mt-3 flex items-center justify-between gap-4 border-t border-[#17213a]/[0.06] pt-3"><div className="text-[10px] font-semibold text-[#17213a]/35">Be substantive. No obvious abuse, slurs or spam.</div><button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-[#2878ff] px-4 py-2 text-xs font-extrabold text-white"><Send className="h-3.5 w-3.5" /> Comment</button></div>{commentError && <p className="mt-3 text-xs font-bold text-rose-600">{commentError}</p>}</form>

              <div className="mt-5 grid gap-3">{comments.length ? comments.map((comment) => <article key={comment.id} className="rounded-[20px] border border-[#17213a]/[0.06] bg-white p-5"><div className="flex items-center justify-between gap-4"><div className="text-sm font-extrabold">{comment.author}</div><time className="text-[10px] font-semibold text-[#17213a]/30">{new Date(comment.createdAt).toLocaleString()}</time></div><p className="mt-3 text-sm font-medium leading-6 text-[#17213a]/65">{comment.text}</p></article>) : <div className="rounded-[20px] border border-dashed border-[#17213a]/10 bg-white/60 p-8 text-center text-sm font-semibold text-[#17213a]/35">No comments yet. This is where the permanent thread begins.</div>}</div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
