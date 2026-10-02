"use client";

import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  CircleGauge,
  EyeOff,
  Flame,
  Globe2,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import LiveSourceLab from "./live-source-lab";
import LiveTopicScore from "./live-topic-score";

type Category = "All" | "World" | "Technology" | "Culture" | "Sport" | "Business";
type Source = { name: string; url: string };
type Topic = {
  id: number;
  category: Exclude<Category, "All">;
  age: string;
  subject: string;
  query: string;
  headline: string;
  summary: string;
  evidence: string;
  sampleType: string;
  sources: Source[];
};

const topics: Topic[] = [
  {
    id: 1,
    category: "World",
    age: "Updated today",
    subject: "Cornell University fraternity rape allegations",
    query: "Cornell University fraternity allegations",
    headline: "Outrage dominates the visible conversation, while a separate due-process debate is growing around misidentification and mob justice.",
    summary: "New York prosecutors reopened the 2024 case and the attorney general was appointed special prosecutor. Large public threads are intensely critical of the alleged conduct and institutional handling, while another high-engagement discussion focuses on an unrelated man who was falsely identified online.",
    evidence: "Current snapshot: Reuters + AP + high-engagement Reddit threads",
    sampleType: "Live score uses connected measurable sources only",
    sources: [
      { name: "Reuters", url: "https://www.reuters.com/legal/government/what-we-know-about-cornell-university-rape-investigation-2026-10-01/" },
      { name: "AP", url: "https://apnews.com/article/7203e55c76f7be14ab929764c90b60b1" },
      { name: "Reddit · r/news", url: "https://www.reddit.com/r/news/comments/1wv7vyf/a_new_york_man_was_mistakenly_identified_as/" },
      { name: "Reddit · r/Fauxmoi", url: "https://www.reddit.com/r/Fauxmoi/comments/1wsd0wc/prosecutors_in_central_new_york_say_they_are/" },
    ],
  },
  {
    id: 2,
    category: "Technology",
    age: "Updated today",
    subject: "Google Gemini 4 Argon",
    query: "Google Gemini 4 Argon",
    headline: "The model has real hype. The loudest frustration is that many people still cannot actually use it.",
    summary: "Benchmark claims are driving excitement, while rollout confusion, Ultra/API access and skepticism about announcing a model before broad availability are dominating the criticism.",
    evidence: "Current snapshot: tech coverage + active AI communities",
    sampleType: "Live score uses connected measurable sources only",
    sources: [
      { name: "TechCrunch", url: "https://techcrunch.com/" },
      { name: "Reddit · rollout", url: "https://www.reddit.com/r/GeminiAI/comments/1wuv40i/gemini_4_argon_is_what/" },
      { name: "Reddit · release", url: "https://www.reddit.com/r/GeminiAI/comments/1wufc6s/gemini_4_argon_release/" },
    ],
  },
  {
    id: 3,
    category: "Technology",
    age: "Updated today",
    subject: "OpenAI parts ways with three safety researchers",
    query: "OpenAI three safety researchers",
    headline: "The first visible reaction is concern about transparency more than the personnel change itself.",
    summary: "Reports say three researchers left after allegedly sharing confidential information with a third-party AI-safety organization. Early discussion is skeptical, particularly because the researchers had publicly raised safety concerns.",
    evidence: "Current snapshot: tech coverage + early social discussion",
    sampleType: "Live score uses connected measurable sources only",
    sources: [
      { name: "TechCrunch", url: "https://techcrunch.com/" },
      { name: "Reddit · r/singularity", url: "https://www.reddit.com/r/singularity/comments/1wv4vif/openai_has_parted_ways_with_three_researchers/" },
    ],
  },
  {
    id: 4,
    category: "Business",
    age: "Updated today",
    subject: "Global bond rout and U.S. payrolls",
    query: "global bond rout US payrolls Treasury yields",
    headline: "Markets are tense: Treasury yields reached multi-decade highs and the jobs report is the next major catalyst.",
    summary: "The U.S. 10-year Treasury yield touched 5.34% while the dollar reached a 17-month high. Investors are focused on what payrolls imply for the Federal Reserve.",
    evidence: "Current snapshot: Reuters market data and reporting",
    sampleType: "Low social sample should produce low confidence",
    sources: [
      { name: "Reuters · markets", url: "https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-02/" },
      { name: "Reuters · dollar", url: "https://www.reuters.com/world/asia-pacific/dollar-17-month-high-global-bond-rout-hits-euro-2026-10-02/" },
    ],
  },
  {
    id: 5,
    category: "Culture",
    age: "Updated this week",
    subject: "Taylor Swift breaks two Spotify records",
    query: "Taylor Swift Spotify records 2026",
    headline: "The numbers are enormous. The argument is whether streaming records measure cultural reach or artistic quality.",
    summary: "Swift set new 2026 Spotify records after new music. Discussion splits between treating the numbers as proof of extraordinary reach and dismissing streaming records as popularity rather than quality.",
    evidence: "Current snapshot: entertainment coverage + fan communities",
    sampleType: "Live score uses connected measurable sources only",
    sources: [
      { name: "Variety", url: "https://au.variety.com/" },
      { name: "Reddit · r/SwiftlyNeutral", url: "https://www.reddit.com/r/SwiftlyNeutral/comments/1wqcih8/taylor_swift_breaks_two_spotify_records_for_2026/" },
    ],
  },
  {
    id: 6,
    category: "Sport",
    age: "Updated today",
    subject: "Formula 1 returns to Sepang",
    query: "Formula 1 Sepang Verstappen tyre degradation",
    headline: "Verstappen set the early pace, but heavy tyre degradation is already shaping the weekend.",
    summary: "Max Verstappen topped opening practice with George Russell second. Heat and tyre wear were the recurring themes, with grid penalties adding another layer to the weekend.",
    evidence: "Current snapshot: Reuters sports reporting",
    sampleType: "Live score uses connected measurable sources only",
    sources: [
      { name: "Reuters", url: "https://www.reuters.com/sports/formula1/verstappen-sets-pace-opening-practice-sepang-2026-10-02/" },
    ],
  },
];

const categories: Category[] = ["All", "World", "Technology", "Culture", "Sport", "Business"];

function TopicRow({ topic, rank, onOpen }: { topic: Topic; rank: number; onOpen: (topic: Topic) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(topic)}
      className="group grid w-full grid-cols-[34px_1fr] gap-x-3 gap-y-4 border-b border-[#17213a]/[0.07] px-4 py-6 text-left transition last:border-b-0 hover:bg-[#2878ff]/[0.035] md:grid-cols-[44px_1fr_205px] md:gap-x-5 md:px-7"
    >
      <div className="pt-1 text-center text-base font-semibold text-[#17213a]/30 sm:text-lg">{rank}</div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#17213a]/42">
          <span>{topic.category}</span>
          <span className="h-1 w-1 rounded-full bg-[#17213a]/18" />
          <span>{topic.age}</span>
          {rank <= 3 && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#2878ff]/8 px-2 py-1 text-[10px] text-[#2878ff]">
              <Flame className="h-3 w-3" /> moving
            </span>
          )}
        </div>
        <h3 className="max-w-3xl text-[20px] font-bold leading-[1.16] tracking-[-0.025em] text-[#101a33] sm:text-[24px]">{topic.subject}</h3>
        <p className="mt-1.5 max-w-3xl text-[15px] font-semibold leading-6 tracking-[-0.01em] text-[#2878ff] sm:text-base">{topic.headline}</p>
        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[#17213a]/50">{topic.summary}</p>
        <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.05em] text-[#17213a]/30">{topic.sampleType}</div>
      </div>
      <div className="col-start-2 md:col-start-auto md:self-center">
        <LiveTopicScore query={topic.query} />
      </div>
    </button>
  );
}

export default function OutsideTheFeedPage() {
  const [category, setCategory] = useState<Category>("All");
  const [timeframe, setTimeframe] = useState("Now");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [drawerTopic, setDrawerTopic] = useState<Topic | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredTopics = useMemo(
    () => (category === "All" ? topics : topics.filter((topic) => topic.category === category)),
    [category],
  );

  const openMembership = () => {
    setDrawerTopic(null);
    setPaywallOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#101a33] selection:bg-[#2878ff] selection:text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
      <header className="sticky top-0 z-40 border-b border-[#17213a]/[0.06] bg-[#f6f8fc]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-5 lg:px-8">
          <a href="/outside-the-feed" className="flex items-center gap-2.5 font-semibold tracking-[-0.025em]">
            <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2878ff] shadow-[0_6px_18px_rgba(40,120,255,0.28)]">
              <span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#9ec3ff]" />
            </span>
            <span className="text-[17px] font-bold">Outside the Feed</span>
          </a>
          <nav className="hidden flex-1 items-center gap-6 text-[13px] font-semibold text-[#17213a]/52 md:flex">
            <a href="#today" className="text-[#17213a]">Today</a>
            <a href="#topics" className="transition hover:text-[#17213a]">Explore</a>
            <button type="button" onClick={openMembership} className="transition hover:text-[#17213a]">Following</button>
            <a href="#principles" className="transition hover:text-[#17213a]">Why this exists</a>
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-[#2878ff]/15 bg-[#2878ff]/7 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">100% ad free</span>
            <button type="button" onClick={openMembership} className="grid h-9 w-9 place-items-center rounded-full border border-[#17213a]/8 bg-white text-[#17213a]/60 hover:text-[#2878ff]" aria-label="Search"><Search className="h-4 w-4" /></button>
            <button type="button" onClick={openMembership} className="rounded-full bg-[#2878ff] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(40,120,255,0.2)] hover:bg-[#1769e8]">Membership</button>
          </div>
          <button type="button" onClick={() => setMobileMenu((value) => !value)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white md:hidden" aria-label="Menu">{mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
        {mobileMenu && (
          <div className="border-t border-[#17213a]/6 bg-white px-5 py-4 md:hidden">
            <div className="grid gap-1 text-sm font-semibold">
              <a href="#today" onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-3 hover:bg-[#2878ff]/5">Today</a>
              <a href="#topics" onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-3 hover:bg-[#2878ff]/5">Explore</a>
              <button type="button" onClick={openMembership} className="rounded-xl px-3 py-3 text-left hover:bg-[#2878ff]/5">Search</button>
              <button type="button" onClick={openMembership} className="rounded-xl px-3 py-3 text-left hover:bg-[#2878ff]/5">Membership</button>
            </div>
          </div>
        )}
      </header>

      <section id="today" className="mx-auto max-w-[1280px] px-5 pb-12 pt-16 text-center lg:px-8 lg:pt-24">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#2878ff]/12 bg-white px-3.5 py-2 text-[11px] font-bold text-[#2878ff] shadow-sm"><Globe2 className="h-3.5 w-3.5" /> The front page outside your algorithm</div>
        <h1 className="mx-auto max-w-[1020px] text-[clamp(3.2rem,7vw,6.9rem)] font-[750] leading-[0.93] tracking-[-0.06em] text-[#101a33]">Get outside your feed.<span className="mt-2 block text-[#2878ff]">See what everyone else sees.</span></h1>
        <p className="mx-auto mt-7 max-w-[790px] text-[17px] leading-7 tracking-[-0.015em] text-[#17213a]/52 md:text-xl md:leading-8">A quantified read on what the internet is talking about — how people feel, how strongly they agree, how hot the conversation is, and how trustworthy the sample is.</p>
        <button type="button" onClick={openMembership} className="group mx-auto mt-9 flex w-full max-w-[790px] items-center gap-3 rounded-[22px] border border-[#2878ff]/12 bg-white p-2.5 text-left shadow-[0_18px_55px_rgba(33,56,108,0.09)] transition hover:-translate-y-0.5 hover:border-[#2878ff]/24">
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#2878ff]/65" />
          <span className="flex-1 py-3 text-[15px] text-[#17213a]/38 md:text-[17px]">What do people actually think about...</span>
          <span className="hidden rounded-2xl bg-[#2878ff] px-4 py-3 text-xs font-bold text-white sm:block">Search with membership</span>
          <ChevronRight className="mr-2 h-4 w-4 text-[#17213a]/30 sm:hidden" />
        </button>
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-[#17213a]/38">
          <span className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-[#2878ff]" /> No personalized ranking</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#2878ff]" /> No ads or sponsored topics</span>
          <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-[#2878ff]" /> Scores show sample + confidence</span>
        </div>
      </section>

      <section id="topics" className="mx-auto max-w-[1280px] px-5 pb-16 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#17213a]/38"><span className="h-2 w-2 rounded-full bg-[#2878ff] shadow-[0_0_0_5px_rgba(40,120,255,0.09)]" /> Internet pulse</div>
            <h2 className="mt-2 text-3xl font-[750] tracking-[-0.04em] md:text-4xl">What people are talking about</h2>
            <p className="mt-2 text-sm text-[#17213a]/42">Real current topics · quantitative scores are calculated live from connected measurable sources.</p>
          </div>
          <div className="flex w-fit rounded-full bg-[#17213a]/[0.055] p-1">
            {["Now", "24h", "7d"].map((item) => (
              <button key={item} type="button" onClick={() => setTimeframe(item)} className={`rounded-full px-4 py-2 text-xs font-bold ${timeframe === item ? "bg-white text-[#2878ff] shadow-sm" : "text-[#17213a]/42"}`}>{item}</button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold ${category === item ? "bg-[#2878ff] text-white shadow-[0_7px_20px_rgba(40,120,255,0.2)]" : "border border-[#17213a]/8 bg-white text-[#17213a]/50 hover:text-[#2878ff]"}`}>{item}</button>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="overflow-hidden rounded-[26px] border border-[#17213a]/[0.07] bg-white shadow-[0_18px_50px_rgba(33,56,108,0.055)]">
            {filteredTopics.map((topic, index) => <TopicRow key={topic.id} topic={topic} rank={index + 1} onOpen={setDrawerTopic} />)}
          </div>
          <aside className="grid content-start gap-5">
            <div className="rounded-[26px] bg-[#101a33] p-6 text-white shadow-[0_20px_50px_rgba(16,26,51,0.18)]">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#9ec3ff]"><Zap className="h-3.5 w-3.5" /> Read the room in numbers</div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white/7 p-3"><div className="text-2xl font-[800]">0–100</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white/42">Vibe</div></div>
                <div className="rounded-2xl bg-white/7 p-3"><div className="text-2xl font-[800]">0–100</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white/42">Consensus</div></div>
                <div className="rounded-2xl bg-white/7 p-3"><div className="text-2xl font-[800]">0–100</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white/42">Heat</div></div>
                <div className="rounded-2xl bg-white/7 p-3"><div className="text-2xl font-[800]">0–100</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white/42">Confidence</div></div>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/48">A low Vibe means negative reaction, not that a claim is false or a person is guilty. The score measures sampled conversation only.</p>
            </div>
            <div className="rounded-[26px] border border-[#2878ff]/10 bg-[#eaf2ff] p-6">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]"><CircleGauge className="h-3.5 w-3.5" /> Confidence matters</div>
              <h3 className="mt-4 text-xl font-[750] tracking-[-0.035em]">A number without a sample is meaningless.</h3>
              <p className="mt-2 text-sm leading-6 text-[#17213a]/52">Every score carries sample size and confidence. Sparse topics should visibly look weak instead of receiving fake precision.</p>
              <button type="button" onClick={openMembership} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2878ff]">Deep source analysis <LockKeyhole className="h-3.5 w-3.5" /></button>
            </div>
          </aside>
        </div>
      </section>

      <LiveSourceLab />

      <section id="principles" className="mt-16 border-y border-[#17213a]/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8 lg:py-28">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">The business model is the feature</div>
            <h2 className="mt-4 text-4xl font-[750] leading-[1] tracking-[-0.055em] md:text-6xl">You pay us.<br />Advertisers don&apos;t.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["No ads", "No promoted posts, sponsored trends, or brands buying their way into what looks important."], ["No outrage optimization", "We do not make more money when you stay angry, scroll longer, or fight in comments."], ["No invisible personalization", "The public front page is the public front page. Your chosen follows are separate and explicit."], ["Show the disagreement", "Instead of forcing one consensus, we show where communities genuinely diverge and how confident the sample is."]].map(([title, copy]) => (
              <div key={title} className="rounded-[22px] border border-[#17213a]/[0.07] bg-[#f6f8fc] p-5"><ShieldCheck className="h-5 w-5 text-[#2878ff]" /><h3 className="mt-4 text-base font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#17213a]/48">{copy}</p></div>
            ))}
          </div>
        </div>
      </section>

      {drawerTopic && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#101a33]/25 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) setDrawerTopic(null); }}>
          <div className="h-full w-full max-w-[680px] overflow-y-auto bg-[#f8faff] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#17213a]/7 bg-[#f8faff]/92 px-6 py-4 backdrop-blur-xl"><div className="text-sm font-bold text-[#2878ff]">Conversation read</div><button type="button" onClick={() => setDrawerTopic(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white"><X className="h-4 w-4" /></button></div>
            <div className="px-6 py-9 sm:px-8">
              <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/40">{drawerTopic.category} · {drawerTopic.age}</div>
              <h2 className="mt-3 text-4xl font-[750] leading-[1.02] tracking-[-0.055em] sm:text-5xl">{drawerTopic.subject}</h2>
              <p className="mt-4 text-xl font-bold leading-7 text-[#2878ff]">{drawerTopic.headline}</p>
              <p className="mt-4 text-base leading-7 text-[#17213a]/56">{drawerTopic.summary}</p>
              <div className="mt-7"><LiveTopicScore query={drawerTopic.query} /></div>
              <div className="mt-6 rounded-[22px] border border-[#17213a]/7 bg-white p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Editorial context</div>
                <div className="mt-3 text-sm leading-6 text-[#17213a]/52">{drawerTopic.evidence}</div>
                <div className="mt-3 text-xs font-bold text-[#2878ff]">{drawerTopic.sampleType}</div>
              </div>
              <div className="mt-6 rounded-[22px] bg-white p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Sources used for context</div>
                <div className="mt-4 grid gap-2">
                  {drawerTopic.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-[#17213a]/7 px-4 py-3 text-sm font-bold text-[#17213a]/65 hover:border-[#2878ff]/30 hover:text-[#2878ff]">{source.name}<ArrowRight className="h-4 w-4" /></a>
                  ))}
                </div>
              </div>
              <button type="button" onClick={openMembership} className="mt-6 w-full rounded-2xl bg-[#2878ff] px-5 py-4 text-sm font-bold text-white">Unlock arguments, history and source detail</button>
            </div>
          </div>
        </div>
      )}

      {paywallOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101a33]/32 px-4 backdrop-blur-md" onMouseDown={(event) => { if (event.currentTarget === event.target) setPaywallOpen(false); }}>
          <div className="w-full max-w-[520px] rounded-[30px] bg-white p-7 shadow-[0_35px_100px_rgba(16,26,51,0.28)]">
            <div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#2878ff]/10 text-[#2878ff]"><LockKeyhole className="h-5 w-5" /></div><button type="button" onClick={() => setPaywallOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f6f8fc]"><X className="h-4 w-4" /></button></div>
            <div className="mt-6 text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">Outside the Feed membership</div>
            <h2 className="mt-2 text-3xl font-[750] leading-[1.05] tracking-[-0.045em]">The front page is public. Going deeper is yours.</h2>
            <p className="mt-4 text-sm leading-6 text-[#17213a]/52">Search anything, follow topics deliberately, compare communities, inspect historical shifts, and see the arguments behind the scores — without ads shaping what you see.</p>
            <button type="button" className="mt-7 w-full rounded-2xl bg-[#2878ff] px-5 py-4 text-sm font-extrabold text-white">Join the early membership</button>
            <p className="mt-3 text-center text-[11px] font-semibold text-[#17213a]/32">Prototype only — billing is not connected yet.</p>
          </div>
        </div>
      )}
    </main>
  );
}
