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
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tone = "positive" | "mixed" | "negative";
type Category = "All" | "World" | "Tech" | "Culture" | "Sport" | "Business" | "Gaming";

type Topic = {
  id: number;
  category: Exclude<Category, "All">;
  age: string;
  subject: string;
  headline: string;
  summary: string;
  positive: number;
  tone: Tone;
  velocity: number;
  reactions: string;
  sources: number;
  platforms: { name: string; positive: number }[];
};

const topics: Topic[] = [
  {
    id: 1,
    category: "Gaming",
    age: "18 min ago",
    subject: "Nintendo Switch 2 pricing",
    headline: "The price is becoming a bigger story than the console.",
    summary: "Excitement around the hardware is holding up, but value-for-money arguments are dominating the fastest-growing threads.",
    positive: 42,
    tone: "negative",
    velocity: 286,
    reactions: "24.8k",
    sources: 141,
    platforms: [
      { name: "YouTube", positive: 56 },
      { name: "X", positive: 39 },
      { name: "Bluesky", positive: 34 },
      { name: "Forums", positive: 43 },
    ],
  },
  {
    id: 2,
    category: "Culture",
    age: "27 min ago",
    subject: "Marvel casting announcement",
    headline: "The internet is much more split than the loudest posts make it look.",
    summary: "Video audiences are broadly positive while text-first communities are driving most of the criticism and meme activity.",
    positive: 51,
    tone: "mixed",
    velocity: 218,
    reactions: "38.1k",
    sources: 187,
    platforms: [
      { name: "YouTube", positive: 69 },
      { name: "X", positive: 47 },
      { name: "Bluesky", positive: 40 },
      { name: "Forums", positive: 48 },
    ],
  },
  {
    id: 3,
    category: "Technology",
    age: "39 min ago",
    subject: "Apple's newest iPhone launch",
    headline: "People like the camera. They are struggling to care about the rest.",
    summary: "The strongest positive cluster is camera quality. Upgrade fatigue is the most repeated criticism across platforms.",
    positive: 63,
    tone: "positive",
    velocity: 154,
    reactions: "19.6k",
    sources: 122,
    platforms: [
      { name: "YouTube", positive: 75 },
      { name: "X", positive: 58 },
      { name: "Bluesky", positive: 55 },
      { name: "Forums", positive: 62 },
    ],
  },
  {
    id: 4,
    category: "Sport",
    age: "51 min ago",
    subject: "FIFA offside rule proposal",
    headline: "Fans understand the goal. Most still think the fix will make the game worse.",
    summary: "The backlash is mainly about flow, officiating complexity, and unintended consequences rather than opposition to the stated objective.",
    positive: 29,
    tone: "negative",
    velocity: 171,
    reactions: "11.3k",
    sources: 88,
    platforms: [
      { name: "YouTube", positive: 35 },
      { name: "X", positive: 22 },
      { name: "Bluesky", positive: 31 },
      { name: "Forums", positive: 28 },
    ],
  },
  {
    id: 5,
    category: "Business",
    age: "1 hr ago",
    subject: "Netflix subscription price increase",
    headline: "People are annoyed. Far fewer sound ready to cancel than the viral posts suggest.",
    summary: "Long-time subscribers are the most negative group, while newer customers are mostly debating whether the bundle still feels worth it.",
    positive: 44,
    tone: "negative",
    velocity: 103,
    reactions: "27.4k",
    sources: 109,
    platforms: [
      { name: "YouTube", positive: 49 },
      { name: "X", positive: 37 },
      { name: "Bluesky", positive: 43 },
      { name: "Forums", positive: 46 },
    ],
  },
  {
    id: 6,
    category: "World",
    age: "1 hr ago",
    subject: "Federal Reserve interest-rate decision",
    headline: "Relief is winning the first reaction. Anxiety about what it signals is catching up.",
    summary: "The conversation began around immediate market impact and is shifting toward what the decision implies about the broader economy.",
    positive: 55,
    tone: "mixed",
    velocity: 97,
    reactions: "16.9k",
    sources: 151,
    platforms: [
      { name: "YouTube", positive: 60 },
      { name: "X", positive: 52 },
      { name: "Bluesky", positive: 51 },
      { name: "Forums", positive: 57 },
    ],
  },
  {
    id: 7,
    category: "Sport",
    age: "2 hrs ago",
    subject: "TaylorMade Qi35 driver reviews",
    headline: "Golfers like it. They are not convinced it is enough better to justify upgrading.",
    summary: "Forgiveness is the strongest positive theme. Price and year-over-year improvement dominate the skeptical side of the conversation.",
    positive: 72,
    tone: "positive",
    velocity: 66,
    reactions: "6.7k",
    sources: 64,
    platforms: [
      { name: "YouTube", positive: 81 },
      { name: "X", positive: 67 },
      { name: "Bluesky", positive: 64 },
      { name: "Forums", positive: 73 },
    ],
  },
];

const categories: Category[] = ["All", "World", "Technology", "Culture", "Sport", "Business", "Gaming"];

const toneCopy: Record<Tone, { label: string; text: string; bar: string; soft: string }> = {
  positive: { label: "Mostly positive", text: "text-emerald-600", bar: "bg-emerald-500", soft: "bg-emerald-50" },
  mixed: { label: "Split", text: "text-amber-600", bar: "bg-amber-500", soft: "bg-amber-50" },
  negative: { label: "Mostly negative", text: "text-rose-600", bar: "bg-rose-500", soft: "bg-rose-50" },
};

function TopicRow({ topic, rank, onOpen }: { topic: Topic; rank: number; onOpen: (topic: Topic) => void }) {
  const tone = toneCopy[topic.tone];
  return (
    <button
      type="button"
      onClick={() => onOpen(topic)}
      className="group grid w-full grid-cols-[34px_1fr] gap-3 border-b border-[#17213a]/[0.07] px-4 py-6 text-left transition last:border-b-0 hover:bg-[#2878ff]/[0.035] sm:grid-cols-[44px_1fr_155px] sm:gap-5 sm:px-7"
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
        <h3 className="max-w-3xl text-[20px] font-bold leading-[1.16] tracking-[-0.025em] text-[#101a33] sm:text-[24px]">
          {topic.subject}
        </h3>
        <p className="mt-1.5 max-w-3xl text-[15px] font-semibold leading-6 tracking-[-0.01em] text-[#2878ff] sm:text-base">
          {topic.headline}
        </p>
        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[#17213a]/50">{topic.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#17213a]/38 sm:hidden">
          <span>{topic.reactions} reactions</span>
          <span>+{topic.velocity}% velocity</span>
          <span className={tone.text}>{topic.positive}% positive</span>
        </div>
      </div>
      <div className="hidden self-center text-right sm:block">
        <div className={`text-[26px] font-bold tracking-[-0.04em] ${tone.text}`}>{topic.positive}%</div>
        <div className={`mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${tone.text}`}>{tone.label}</div>
        <div className="ml-auto mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-[#17213a]/7">
          <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${topic.positive}%` }} />
        </div>
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
            <span className="rounded-full border border-[#2878ff]/15 bg-[#2878ff]/7 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">
              100% ad free
            </span>
            <button type="button" onClick={openMembership} className="grid h-9 w-9 place-items-center rounded-full border border-[#17213a]/8 bg-white text-[#17213a]/60 transition hover:text-[#2878ff]" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <button type="button" onClick={openMembership} className="rounded-full bg-[#2878ff] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(40,120,255,0.2)] transition hover:bg-[#1769e8]">
              Membership
            </button>
          </div>

          <button type="button" onClick={() => setMobileMenu((value) => !value)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white md:hidden" aria-label="Menu">
            {mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
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
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#2878ff]/12 bg-white px-3.5 py-2 text-[11px] font-bold tracking-[-0.01em] text-[#2878ff] shadow-sm">
          <Globe2 className="h-3.5 w-3.5" /> The front page outside your algorithm
        </div>
        <h1 className="mx-auto max-w-[1020px] text-[clamp(3.2rem,7vw,6.9rem)] font-[750] leading-[0.93] tracking-[-0.06em] text-[#101a33]">
          Get outside your feed.
          <span className="mt-2 block text-[#2878ff]">See what everyone else sees.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-[780px] text-[17px] leading-7 tracking-[-0.015em] text-[#17213a]/52 md:text-xl md:leading-8">
          One neutral front page for what the internet is actually talking about — what&apos;s rising, what people think, and where different communities see the same story completely differently.
        </p>

        <button type="button" onClick={openMembership} className="group mx-auto mt-9 flex w-full max-w-[790px] items-center gap-3 rounded-[22px] border border-[#2878ff]/12 bg-white p-2.5 text-left shadow-[0_18px_55px_rgba(33,56,108,0.09)] transition hover:-translate-y-0.5 hover:border-[#2878ff]/24 hover:shadow-[0_24px_70px_rgba(33,56,108,0.13)]">
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#2878ff]/65" />
          <span className="flex-1 py-3 text-[15px] text-[#17213a]/38 md:text-[17px]">What do people actually think about...</span>
          <span className="hidden rounded-2xl bg-[#2878ff] px-4 py-3 text-xs font-bold text-white sm:block">Search with membership</span>
          <ChevronRight className="mr-2 h-4 w-4 text-[#17213a]/30 sm:hidden" />
        </button>

        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-[#17213a]/38">
          <span className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-[#2878ff]" /> No personalized ranking</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#2878ff]" /> No ads or sponsored topics</span>
          <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-[#2878ff]" /> Sources + confidence visible</span>
        </div>
      </section>

      <section id="topics" className="mx-auto max-w-[1280px] px-5 pb-20 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#17213a]/38">
              <span className="h-2 w-2 rounded-full bg-[#2878ff] shadow-[0_0_0_5px_rgba(40,120,255,0.09)]" /> Internet pulse
            </div>
            <h2 className="mt-2 text-3xl font-[750] tracking-[-0.04em] md:text-4xl">What people are talking about</h2>
            <p className="mt-2 text-sm text-[#17213a]/42">Illustrative data for the product prototype — not live sentiment yet.</p>
          </div>
          <div className="flex w-fit rounded-full bg-[#17213a]/[0.055] p-1">
            {["Now", "24h", "7d"].map((item) => (
              <button key={item} type="button" onClick={() => setTimeframe(item)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${timeframe === item ? "bg-white text-[#2878ff] shadow-sm" : "text-[#17213a]/42 hover:text-[#17213a]"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${category === item ? "bg-[#2878ff] text-white shadow-[0_7px_20px_rgba(40,120,255,0.2)]" : "border border-[#17213a]/8 bg-white text-[#17213a]/50 hover:border-[#2878ff]/25 hover:text-[#2878ff]"}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="overflow-hidden rounded-[26px] border border-[#17213a]/[0.07] bg-white shadow-[0_18px_50px_rgba(33,56,108,0.055)]">
            {filteredTopics.map((topic, index) => (
              <TopicRow key={topic.id} topic={topic} rank={index + 1} onOpen={setDrawerTopic} />
            ))}
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-[26px] bg-[#101a33] p-6 text-white shadow-[0_20px_50px_rgba(16,26,51,0.18)]">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#9ec3ff]">
                <Zap className="h-3.5 w-3.5" /> Fastest rising
              </div>
              <div className="mt-5 text-5xl font-[750] tracking-[-0.06em] text-white">+286%</div>
              <div className="mt-3 text-lg font-bold tracking-[-0.025em]">Nintendo Switch 2 pricing</div>
              <p className="mt-2 text-sm leading-6 text-white/54">Conversation velocity over the last hour in this prototype dataset.</p>
              <button type="button" onClick={() => setDrawerTopic(topics[0])} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#9ec3ff]">Open the conversation <ArrowRight className="h-4 w-4" /></button>
            </div>

            <div className="rounded-[26px] border border-[#2878ff]/10 bg-[#eaf2ff] p-6">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">
                <CircleGauge className="h-3.5 w-3.5" /> Bubble check
              </div>
              <h3 className="mt-4 text-xl font-[750] tracking-[-0.035em]">Same story. Different internet.</h3>
              <p className="mt-2 text-sm leading-6 text-[#17213a]/52">Compare how the same topic lands across platforms and communities instead of assuming your timeline is everybody.</p>
              <div className="mt-5 grid gap-3">
                {[{ name: "YouTube", value: 69 }, { name: "X", value: 47 }, { name: "Bluesky", value: 40 }].map((platform) => (
                  <div key={platform.name} className="grid grid-cols-[70px_1fr_35px] items-center gap-2 text-xs font-bold">
                    <span className="text-[#17213a]/55">{platform.name}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-[#2878ff]" style={{ width: `${platform.value}%` }} /></div>
                    <span className="text-right text-[#2878ff]">{platform.value}%</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={openMembership} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2878ff]">Unlock Bubble Check <LockKeyhole className="h-3.5 w-3.5" /></button>
            </div>
          </aside>
        </div>
      </section>

      <section id="principles" className="border-y border-[#17213a]/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8 lg:py-28">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">The business model is the feature</div>
            <h2 className="mt-4 text-4xl font-[750] leading-[1] tracking-[-0.055em] md:text-6xl">You pay us.<br />Advertisers don&apos;t.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["No ads", "No promoted posts, sponsored trends, or brands buying their way into what looks important."],
              ["No outrage optimization", "We do not make more money when you stay angry, scroll longer, or fight in comments."],
              ["No invisible personalization", "The public front page is the public front page. Your chosen follows are separate and explicit."],
              ["Show the disagreement", "Instead of forcing one consensus, we show where communities genuinely diverge and how confident the sample is."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[22px] border border-[#17213a]/[0.07] bg-[#f6f8fc] p-5">
                <ShieldCheck className="h-5 w-5 text-[#2878ff]" />
                <h3 className="mt-4 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#17213a]/48">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-10 text-xs font-semibold text-[#17213a]/36 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2878ff]" /> Outside the Feed — prototype</div>
        <div>No ads. No sponsored trends. No hidden feed.</div>
      </footer>

      {drawerTopic && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#101a33]/25 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) setDrawerTopic(null); }}>
          <div className="h-full w-full max-w-[650px] overflow-y-auto bg-[#f8faff] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#17213a]/7 bg-[#f8faff]/92 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div className="text-sm font-bold text-[#2878ff]">Conversation read</div>
              <button type="button" onClick={() => setDrawerTopic(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-5 py-8 sm:px-8 sm:py-10">
              <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17213a]/40">{drawerTopic.category} · {drawerTopic.age}</div>
              <h2 className="mt-3 text-4xl font-[750] leading-[1.02] tracking-[-0.055em] sm:text-5xl">{drawerTopic.subject}</h2>
              <p className="mt-4 text-xl font-bold leading-7 tracking-[-0.025em] text-[#2878ff]">{drawerTopic.headline}</p>
              <p className="mt-4 text-base leading-7 text-[#17213a]/56">{drawerTopic.summary}</p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-[18px] bg-white p-4 shadow-sm"><div className="text-2xl font-[750]">{drawerTopic.positive}%</div><div className="mt-1 text-[11px] font-bold text-[#17213a]/40">positive</div></div>
                <div className="rounded-[18px] bg-white p-4 shadow-sm"><div className="text-2xl font-[750]">{drawerTopic.reactions}</div><div className="mt-1 text-[11px] font-bold text-[#17213a]/40">reactions</div></div>
                <div className="rounded-[18px] bg-white p-4 shadow-sm"><div className="text-2xl font-[750] text-[#2878ff]">+{drawerTopic.velocity}%</div><div className="mt-1 text-[11px] font-bold text-[#17213a]/40">velocity</div></div>
              </div>

              <div className="mt-8 rounded-[24px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]"><Globe2 className="h-4 w-4" /> Bubble check</div>
                <div className="mt-5 grid gap-4">
                  {drawerTopic.platforms.map((platform) => (
                    <div key={platform.name}>
                      <div className="mb-2 flex items-center justify-between text-sm font-bold"><span>{platform.name}</span><span className="text-[#2878ff]">{platform.positive}% positive</span></div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#17213a]/6"><div className="h-full rounded-full bg-[#2878ff]" style={{ width: `${platform.positive}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#2878ff]/12 bg-[#eaf2ff] p-6">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]"><Sparkles className="h-4 w-4" /> Deep read</div>
                <h3 className="mt-3 text-xl font-[750] tracking-[-0.03em]">See the arguments underneath the number.</h3>
                <p className="mt-2 text-sm leading-6 text-[#17213a]/52">Membership unlocks argument clusters, strongest counter-view, source-by-source sentiment, historical shifts, representative posts, and confidence methodology.</p>
                <button type="button" onClick={openMembership} className="mt-5 rounded-full bg-[#2878ff] px-5 py-3 text-sm font-bold text-white">Unlock the full read</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paywallOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101a33]/32 px-4 backdrop-blur-md" onMouseDown={(event) => { if (event.currentTarget === event.target) setPaywallOpen(false); }}>
          <div className="w-full max-w-[520px] rounded-[30px] bg-white p-6 shadow-[0_35px_100px_rgba(16,26,51,0.28)] sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#2878ff]/10 text-[#2878ff]"><LockKeyhole className="h-5 w-5" /></div>
              <button type="button" onClick={() => setPaywallOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f6f8fc]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">Outside the Feed membership</div>
            <h2 className="mt-2 text-3xl font-[750] leading-[1.05] tracking-[-0.045em]">The front page is public. Going deeper is yours.</h2>
            <p className="mt-4 text-sm leading-6 text-[#17213a]/52">Search any subject, follow topics deliberately, compare communities, inspect historical shifts, and see the arguments behind the sentiment — without ads shaping what you see.</p>
            <div className="mt-6 grid gap-2 text-sm font-semibold text-[#17213a]/62">
              {["Search any topic or story", "Full Bubble Check by source", "Argument clusters + minority views", "Vibe history and change alerts", "No ads. Ever."].map((item) => (
                <div key={item} className="flex items-center gap-2.5"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#2878ff]/10 text-[#2878ff]">✓</span>{item}</div>
              ))}
            </div>
            <button type="button" className="mt-7 w-full rounded-2xl bg-[#2878ff] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(40,120,255,0.22)]">Join the early membership</button>
            <p className="mt-3 text-center text-[11px] font-semibold text-[#17213a]/32">Prototype only — billing is not connected yet.</p>
          </div>
        </div>
      )}
    </main>
  );
}
