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

type Tone = "critical" | "mixed" | "positive" | "context";
type Category = "All" | "World" | "Technology" | "Culture" | "Sport" | "Business";

type Source = { name: string; url: string };
type Topic = {
  id: number;
  category: Exclude<Category, "All">;
  age: string;
  subject: string;
  headline: string;
  summary: string;
  signal: string;
  evidence: string;
  tone: Tone;
  sampleType: string;
  sources: Source[];
};

const topics: Topic[] = [
  {
    id: 1,
    category: "World",
    age: "Updated today",
    subject: "Cornell University fraternity rape allegations",
    headline: "Public reaction is dominated by outrage — with a second debate growing around mob justice and misidentification.",
    summary:
      "New York prosecutors have reopened the 2024 case and the attorney general has been appointed special prosecutor. On Reddit, large threads are overwhelmingly critical of the alleged conduct and institutional handling, while a separate high-engagement thread warns about innocent people being targeted after a man was misidentified.",
    signal: "Outrage + due-process concern",
    evidence: "r/news misidentification thread: 9.6k score · r/Fauxmoi reopening thread: 6.3k score",
    tone: "critical",
    sampleType: "Reuters + AP + Reddit snapshot",
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
    headline: "The model has real hype. The loudest frustration is that most people still cannot actually use it.",
    summary:
      "Google is presenting Argon as its most powerful model yet. Current Gemini communities are excited by benchmark claims, but rollout confusion, Ultra/API access, and skepticism about announcing a model before broad availability dominate the discussion.",
    signal: "Hype + rollout frustration",
    evidence: "r/GeminiAI threads: 472, 451 and 405 score on rollout/release discussions",
    tone: "mixed",
    sampleType: "Tech coverage + Reddit snapshot",
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
    headline: "The first reaction is concern about transparency more than the personnel change itself.",
    summary:
      "Reports say three researchers left after allegedly sharing confidential information with a third-party AI-safety organization. Early Reddit discussion is small but notably skeptical, especially because the researchers had publicly raised safety concerns.",
    signal: "Concerned / skeptical",
    evidence: "r/singularity thread: 210 score; top concern comments at +72",
    tone: "critical",
    sampleType: "Tech coverage + early Reddit sample",
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
    headline: "Markets are tense: Treasury yields hit levels not seen in decades, and today’s jobs report is the next major catalyst.",
    summary:
      "Reuters reports the U.S. 10-year Treasury yield touched 5.34%, a 24-year high, while the dollar reached a 17-month high. Investors are watching payrolls for clues about whether another Federal Reserve hike is coming.",
    signal: "Market anxiety",
    evidence: "U.S. 10-year yield touched 5.34% · dollar at a 17-month high",
    tone: "context",
    sampleType: "Market data / news context",
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
    headline: "The numbers are enormous. The interesting argument is whether streaming records still say anything about artistic quality.",
    summary:
      "Swift set new 2026 Spotify records after the release of new music. A neutral-fan Reddit community is split between treating the numbers as proof of extraordinary reach and dismissing streaming records as a popularity metric rather than a quality metric.",
    signal: "Popularity vs artistry debate",
    evidence: "Top critical comment in r/SwiftlyNeutral: +138 on a 28-score thread",
    tone: "mixed",
    sampleType: "Entertainment coverage + Reddit snapshot",
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
    headline: "Verstappen set the early pace, but extreme tyre degradation is already shaping the weekend.",
    summary:
      "Max Verstappen topped opening practice at Sepang, with George Russell second. The session’s recurring theme was the heat and unusually heavy tyre degradation, while several drivers also carry grid penalties.",
    signal: "Verstappen fast · tyres a problem",
    evidence: "P1: 1:37.520 · Russell +0.383s · Leclerc only other driver within 1s",
    tone: "positive",
    sampleType: "Reuters sports snapshot",
    sources: [
      { name: "Reuters", url: "https://www.reuters.com/sports/formula1/verstappen-sets-pace-opening-practice-sepang-2026-10-02/" },
    ],
  },
];

const categories: Category[] = ["All", "World", "Technology", "Culture", "Sport", "Business"];

const toneStyle: Record<Tone, { text: string; pill: string; dot: string }> = {
  critical: { text: "text-rose-700", pill: "bg-rose-50 border-rose-100", dot: "bg-rose-500" },
  mixed: { text: "text-amber-700", pill: "bg-amber-50 border-amber-100", dot: "bg-amber-500" },
  positive: { text: "text-emerald-700", pill: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  context: { text: "text-[#2878ff]", pill: "bg-[#2878ff]/[0.06] border-[#2878ff]/10", dot: "bg-[#2878ff]" },
};

function TopicRow({ topic, rank, onOpen }: { topic: Topic; rank: number; onOpen: (topic: Topic) => void }) {
  const tone = toneStyle[topic.tone];
  return (
    <button
      type="button"
      onClick={() => onOpen(topic)}
      className="group grid w-full grid-cols-[34px_1fr] gap-3 border-b border-[#17213a]/[0.07] px-4 py-6 text-left transition last:border-b-0 hover:bg-[#2878ff]/[0.035] md:grid-cols-[44px_1fr_230px] md:gap-5 md:px-7"
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
        <div className="mt-3 text-[11px] font-semibold text-[#17213a]/38 md:hidden">{topic.evidence}</div>
      </div>
      <div className="hidden self-center md:block">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${tone.pill} ${tone.text}`}>
          <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
          {topic.signal}
        </div>
        <div className="mt-3 text-xs font-semibold leading-5 text-[#17213a]/45">{topic.evidence}</div>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#17213a]/30">{topic.sampleType}</div>
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
    <main
      className="min-h-screen bg-[#f6f8fc] text-[#101a33] selection:bg-[#2878ff] selection:text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}
    >
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
        <p className="mx-auto mt-7 max-w-[780px] text-[17px] leading-7 tracking-[-0.015em] text-[#17213a]/52 md:text-xl md:leading-8">One neutral front page for what the internet is actually talking about — what&apos;s rising, what people think, and where different communities see the same story differently.</p>
        <button type="button" onClick={openMembership} className="group mx-auto mt-9 flex w-full max-w-[790px] items-center gap-3 rounded-[22px] border border-[#2878ff]/12 bg-white p-2.5 text-left shadow-[0_18px_55px_rgba(33,56,108,0.09)] transition hover:-translate-y-0.5 hover:border-[#2878ff]/24">
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#2878ff]/65" />
          <span className="flex-1 py-3 text-[15px] text-[#17213a]/38 md:text-[17px]">What do people actually think about...</span>
          <span className="hidden rounded-2xl bg-[#2878ff] px-4 py-3 text-xs font-bold text-white sm:block">Search with membership</span>
          <ChevronRight className="mr-2 h-4 w-4 text-[#17213a]/30 sm:hidden" />
        </button>
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-[#17213a]/38">
          <span className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-[#2878ff]" /> No personalized ranking</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#2878ff]" /> No ads or sponsored topics</span>
          <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-[#2878ff]" /> Sources + evidence visible</span>
        </div>
      </section>

      <section id="topics" className="mx-auto max-w-[1280px] px-5 pb-16 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#17213a]/38"><span className="h-2 w-2 rounded-full bg-[#2878ff] shadow-[0_0_0_5px_rgba(40,120,255,0.09)]" /> Live editorial snapshot</div>
            <h2 className="mt-2 text-3xl font-[750] tracking-[-0.04em] md:text-4xl">What people are talking about</h2>
            <p className="mt-2 text-sm text-[#17213a]/42">Real topics and sourced conversation reads · snapshot updated October 2, 2026.</p>
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
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#9ec3ff]"><Zap className="h-3.5 w-3.5" /> Strongest social signal</div>
              <div className="mt-5 text-3xl font-[750] tracking-[-0.05em]">Cornell allegations</div>
              <p className="mt-3 text-sm leading-6 text-white/60">Multiple high-engagement Reddit threads show intense outrage, while a 9.6k-score r/news thread also surfaced a strong backlash against misidentification and mob justice.</p>
              <button type="button" onClick={() => setDrawerTopic(topics[0])} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#9ec3ff]">Open the read <ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="rounded-[26px] border border-[#2878ff]/10 bg-[#eaf2ff] p-6">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]"><CircleGauge className="h-3.5 w-3.5" /> Method</div>
              <h3 className="mt-4 text-xl font-[750] tracking-[-0.035em]">No fake precision.</h3>
              <p className="mt-2 text-sm leading-6 text-[#17213a]/52">Until a topic has a real measured corpus, we show qualitative signals and the evidence behind them rather than inventing a sentiment percentage.</p>
              <button type="button" onClick={openMembership} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2878ff]">Deep analysis will be a member feature <LockKeyhole className="h-3.5 w-3.5" /></button>
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
              <div className="mt-7 rounded-[22px] border border-[#17213a]/7 bg-white p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Current signal</div>
                <div className="mt-2 text-xl font-bold">{drawerTopic.signal}</div>
                <div className="mt-3 text-sm leading-6 text-[#17213a]/52">{drawerTopic.evidence}</div>
                <div className="mt-3 text-xs font-bold text-[#2878ff]">{drawerTopic.sampleType}</div>
              </div>
              <div className="mt-6 rounded-[22px] bg-white p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/35">Sources used for this snapshot</div>
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
            <p className="mt-4 text-sm leading-6 text-[#17213a]/52">Search anything, follow topics deliberately, compare communities, inspect historical shifts, and see the arguments behind the sentiment — without ads shaping what you see.</p>
            <button type="button" className="mt-7 w-full rounded-2xl bg-[#2878ff] px-5 py-4 text-sm font-extrabold text-white">Join the early membership</button>
            <p className="mt-3 text-center text-[11px] font-semibold text-[#17213a]/32">Prototype only — billing is not connected yet.</p>
          </div>
        </div>
      )}
    </main>
  );
}
