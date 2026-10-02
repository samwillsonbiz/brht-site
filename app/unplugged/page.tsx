"use client";

import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  CircleGauge,
  Clock3,
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
type Category = "All" | "World" | "Technology" | "Culture" | "Sport" | "Business" | "Gaming";

type Topic = {
  id: number;
  category: Exclude<Category, "All">;
  age: string;
  title: string;
  summary: string;
  positive: number;
  tone: Tone;
  velocity: number;
  reactions: string;
  sources: number;
};

const topics: Topic[] = [
  {
    id: 1,
    category: "Technology",
    age: "12 min ago",
    title: "A major AI hardware reveal is dominating tech discussion",
    summary: "Excitement is high, but price, privacy, and whether people need another device are driving most skepticism.",
    positive: 68,
    tone: "positive",
    velocity: 342,
    reactions: "18.4k",
    sources: 126,
  },
  {
    id: 2,
    category: "Culture",
    age: "21 min ago",
    title: "The internet is sharply split on a huge franchise casting announcement",
    summary: "The overall number hides a major platform divide: enthusiasm is much stronger on video than text-first networks.",
    positive: 49,
    tone: "mixed",
    velocity: 218,
    reactions: "31.7k",
    sources: 183,
  },
  {
    id: 3,
    category: "Gaming",
    age: "37 min ago",
    title: "A struggling multiplayer game appears to be winning players back",
    summary: "Gameplay sentiment is moving quickly upward while monetization remains the most persistent complaint.",
    positive: 74,
    tone: "positive",
    velocity: 121,
    reactions: "12.9k",
    sources: 94,
  },
  {
    id: 4,
    category: "Sport",
    age: "48 min ago",
    title: "A proposed rule change has players and fans pushing back",
    summary: "Most criticism is about game flow and unintended consequences rather than the stated safety goal.",
    positive: 31,
    tone: "negative",
    velocity: 166,
    reactions: "8.6k",
    sources: 77,
  },
  {
    id: 5,
    category: "Business",
    age: "1 hr ago",
    title: "A controversial subscription price increase is landing better than expected",
    summary: "Long-time customers are angrier than recent subscribers, but cancellation intent is lower than the loudest posts suggest.",
    positive: 57,
    tone: "mixed",
    velocity: 83,
    reactions: "21.1k",
    sources: 102,
  },
  {
    id: 6,
    category: "World",
    age: "1 hr ago",
    title: "Markets are digesting a surprise central-bank decision",
    summary: "Conversation is split between near-term relief and concern about what the move may signal about the broader economy.",
    positive: 54,
    tone: "mixed",
    velocity: 92,
    reactions: "14.2k",
    sources: 139,
  },
  {
    id: 7,
    category: "Technology",
    age: "2 hrs ago",
    title: "A new phone launch is getting praise for one feature and indifference toward everything else",
    summary: "Camera changes are resonating. The rest of the upgrade is widely being described as incremental.",
    positive: 63,
    tone: "positive",
    velocity: 71,
    reactions: "10.8k",
    sources: 81,
  },
];

const categories: Category[] = ["All", "World", "Technology", "Culture", "Sport", "Business", "Gaming"];

const toneCopy: Record<Tone, { label: string; text: string; bar: string }> = {
  positive: { label: "Mostly positive", text: "text-emerald-600", bar: "bg-emerald-500" },
  mixed: { label: "Split", text: "text-amber-600", bar: "bg-amber-500" },
  negative: { label: "Mostly negative", text: "text-rose-600", bar: "bg-rose-500" },
};

const platformBreakdown = [
  { name: "YouTube", share: 38 },
  { name: "X", share: 29 },
  { name: "Bluesky", share: 14 },
  { name: "Web + forums", share: 19 },
];

function TopicRow({ topic, rank, onOpen }: { topic: Topic; rank: number; onOpen: (topic: Topic) => void }) {
  const tone = toneCopy[topic.tone];
  return (
    <button
      type="button"
      onClick={() => onOpen(topic)}
      className="group grid w-full grid-cols-[38px_1fr] gap-4 border-b border-black/6 px-5 py-6 text-left transition last:border-b-0 hover:bg-black/[0.025] md:grid-cols-[48px_1fr_150px] md:gap-6 md:px-7"
    >
      <div className="pt-1 text-center text-lg font-semibold tracking-[-0.04em] text-black/28">{rank}</div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/42">
          <span>{topic.category}</span>
          <span className="h-1 w-1 rounded-full bg-black/18" />
          <span>{topic.age}</span>
          {rank <= 3 && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] tracking-[0.08em] text-rose-600">
              <Flame className="h-3 w-3" /> live
            </span>
          )}
        </div>
        <h3 className="max-w-3xl text-[19px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#17171a] transition group-hover:text-black md:text-[22px]">
          {topic.title}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-black/48">{topic.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-medium text-black/36 md:hidden">
          <span>{topic.reactions} reactions</span>
          <span>+{topic.velocity}% velocity</span>
        </div>
      </div>
      <div className="hidden self-center text-right md:block">
        <div className={`text-2xl font-bold tracking-[-0.05em] ${tone.text}`}>{topic.positive}%</div>
        <div className={`mt-0.5 text-[11px] font-bold uppercase tracking-[0.09em] ${tone.text}`}>{tone.label}</div>
        <div className="ml-auto mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-black/6">
          <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${topic.positive}%` }} />
        </div>
      </div>
    </button>
  );
}

export default function UnpluggedPage() {
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
    <main className="min-h-screen bg-[#f5f5f7] text-[#111114] selection:bg-black selection:text-white">
      <div className="sticky top-0 z-40 border-b border-black/5 bg-[#f5f5f7]/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-5 lg:px-8">
          <a href="/unplugged" className="flex items-center gap-2.5 font-semibold tracking-[-0.04em]">
            <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[11px] bg-black text-white shadow-sm">
              <span className="absolute -left-1 h-5 w-5 rounded-full bg-white" />
              <span className="absolute -right-1 bottom-1 h-4 w-4 rounded-full bg-white/45" />
            </span>
            <span className="text-[17px] font-bold">UNPLUGGED</span>
          </a>

          <nav className="hidden flex-1 items-center gap-6 text-[13px] font-medium text-black/55 md:flex">
            <a href="#today" className="font-semibold text-black">Today</a>
            <a href="#topics" className="transition hover:text-black">Topics</a>
            <button type="button" onClick={openMembership} className="transition hover:text-black">Following</button>
            <a href="#principles" className="transition hover:text-black">Principles</a>
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-black/8 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/50">
              Ad free
            </span>
            <button
              type="button"
              onClick={openMembership}
              className="grid h-9 w-9 place-items-center rounded-full border border-black/8 bg-white text-black/65 transition hover:-translate-y-0.5 hover:text-black"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={openMembership}
              className="rounded-full bg-black px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-black/82"
            >
              Membership
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu((value) => !value)}
            className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white md:hidden"
            aria-label="Menu"
          >
            {mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="border-t border-black/5 bg-white px-5 py-4 md:hidden">
            <div className="grid gap-1 text-sm font-medium">
              <a href="#today" onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-3 hover:bg-black/[0.03]">Today</a>
              <a href="#topics" onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-3 hover:bg-black/[0.03]">Topics</a>
              <button type="button" onClick={openMembership} className="rounded-xl px-3 py-3 text-left hover:bg-black/[0.03]">Search</button>
              <button type="button" onClick={openMembership} className="rounded-xl px-3 py-3 text-left hover:bg-black/[0.03]">Membership</button>
            </div>
          </div>
        )}
      </div>

      <section id="today" className="mx-auto max-w-[1280px] px-5 pb-12 pt-20 text-center lg:px-8 lg:pt-28">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45 shadow-sm">
          <Globe2 className="h-3.5 w-3.5" /> The front page outside your feed
        </div>
        <h1 className="mx-auto max-w-[980px] text-[clamp(3.4rem,8vw,7.7rem)] font-bold leading-[0.9] tracking-[-0.075em] text-[#101012]">
          See what&apos;s happening.
          <span className="block bg-gradient-to-r from-black via-black/65 to-black/35 bg-clip-text text-transparent">Not what you&apos;re fed.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-[760px] text-[17px] leading-7 tracking-[-0.02em] text-black/48 md:text-xl md:leading-8">
          A live read on what the internet is talking about, how fast it&apos;s moving, and how people actually feel — across communities, not inside your algorithm.
        </p>

        <button
          type="button"
          onClick={openMembership}
          className="group mx-auto mt-9 flex w-full max-w-[780px] items-center gap-3 rounded-[22px] border border-black/8 bg-white p-2.5 text-left shadow-[0_18px_55px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(0,0,0,0.11)]"
        >
          <Search className="ml-3 h-5 w-5 shrink-0 text-black/36" />
          <span className="flex-1 py-3 text-[15px] text-black/36 md:text-[17px]">Search any topic, person, product, story or idea...</span>
          <span className="hidden rounded-2xl bg-black px-4 py-3 text-xs font-semibold text-white sm:block">Members search everything</span>
          <ChevronRight className="mr-2 h-4 w-4 text-black/30 sm:hidden" />
        </button>

        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-black/35">
          <span className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5" /> No recommendation algorithm</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> No ads or sponsored topics</span>
          <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Sources + confidence shown</span>
        </div>
      </section>

      <section id="topics" className="mx-auto max-w-[1280px] px-5 pb-20 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black/35">
              <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_5px_rgba(244,63,94,0.08)]" /> Live pulse
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em] md:text-4xl">What&apos;s moving right now</h2>
            <p className="mt-2 text-sm text-black/42">Prototype data for product design. Real source ingestion comes next.</p>
          </div>
          <div className="flex w-fit rounded-full bg-black/[0.055] p-1">
            {["Now", "24h", "7d"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTimeframe(item)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${timeframe === item ? "bg-white text-black shadow-sm" : "text-black/38 hover:text-black"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                category === item ? "border-black bg-black text-white" : "border-black/8 bg-white text-black/50 hover:-translate-y-0.5 hover:text-black"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.65fr_0.85fr]">
          <div className="overflow-hidden rounded-[28px] border border-black/7 bg-white shadow-[0_14px_42px_rgba(0,0,0,0.05)]">
            {filteredTopics.map((topic, index) => (
              <TopicRow key={topic.id} topic={topic} rank={index + 1} onOpen={setDrawerTopic} />
            ))}
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-[28px] border border-black/7 bg-white p-6 shadow-[0_14px_42px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.035em]">Fastest rising</h3>
                  <p className="mt-1 text-xs text-black/38">Conversation velocity · past hour</p>
                </div>
                <TrendingUp className="h-5 w-5 text-black/25" />
              </div>
              <div className="mt-6 grid gap-5">
                {topics.slice(0, 4).sort((a, b) => b.velocity - a.velocity).map((topic) => (
                  <button key={topic.id} type="button" onClick={() => setDrawerTopic(topic)} className="grid grid-cols-[1fr_auto] items-center gap-4 text-left">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-black/78">{topic.title}</div>
                      <div className="mt-1 text-[11px] text-black/34">{topic.category}</div>
                    </div>
                    <div className="text-[13px] font-bold text-emerald-600">+{topic.velocity}%</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/7 bg-white p-6 shadow-[0_14px_42px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.035em]">Where the conversation is</h3>
                  <p className="mt-1 text-xs text-black/38">Share of sampled public discussion</p>
                </div>
                <CircleGauge className="h-5 w-5 text-black/25" />
              </div>
              <div className="mt-6 grid gap-4">
                {platformBreakdown.map((platform) => (
                  <div key={platform.name} className="grid grid-cols-[86px_1fr_38px] items-center gap-3 text-xs">
                    <span className="font-semibold text-black/70">{platform.name}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/6"><div className="h-full rounded-full bg-black/70" style={{ width: `${platform.share * 2.2}%` }} /></div>
                    <span className="text-right font-medium text-black/38">{platform.share}%</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" onClick={openMembership} className="rounded-[28px] bg-[#121214] p-6 text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/42">Member feature</div>
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.035em]">Bubble Check</h3>
                </div>
                <Sparkles className="h-5 w-5 text-white/55" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/55">See how differently X, YouTube, Bluesky, Reddit and other communities are viewing the exact same topic.</p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white">See how it works <ArrowRight className="h-3.5 w-3.5" /></div>
            </button>
          </aside>
        </div>
      </section>

      <section id="principles" className="mx-auto max-w-[1280px] px-5 pb-10 lg:px-8">
        <div className="relative overflow-hidden rounded-[38px] bg-[#111113] px-6 py-12 text-white md:px-12 md:py-14 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="absolute -right-24 -top-44 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/42">A different bargain</div>
            <h2 className="mt-4 max-w-xl text-4xl font-bold leading-[0.98] tracking-[-0.055em] md:text-5xl lg:text-[58px]">You pay us.<br />Advertisers don&apos;t.</h2>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/52 md:text-base">
              UNPLUGGED is designed to help you understand the internet, not trap you inside it. There is no advertising auction deciding what you see, no sponsored topic rankings, and no incentive for us to manufacture outrage for engagement.
            </p>
          </div>
          <div className="relative mt-9 grid gap-3 lg:mt-0 lg:self-center">
            {[
              "Trending means trending — not recommended for you.",
              "Every read shows its sample, sources and confidence.",
              "Following is deliberate. Nothing is secretly personalized.",
              "No ads. No sponsored opinions. Ever.",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-[13px] text-white/78">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-black">✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-9 text-xs text-black/35 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>© 2026 UNPLUGGED · Prototype on BRHT</div>
        <div className="flex flex-wrap gap-5"><a href="#principles">Principles</a><button type="button" onClick={openMembership}>Membership</button><span>Methodology</span><span>Privacy</span></div>
      </footer>

      {drawerTopic && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close topic" className="absolute inset-0 bg-black/22 backdrop-blur-[2px]" onClick={() => setDrawerTopic(null)} />
          <aside className="absolute right-0 top-0 h-full w-[min(720px,96vw)] overflow-y-auto bg-[#f7f7f9] shadow-[-24px_0_70px_rgba(0,0,0,0.16)]">
            <div className="sticky top-0 z-10 border-b border-black/6 bg-[#f7f7f9]/92 px-6 py-5 backdrop-blur-2xl md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/35">Live topic · prototype data</div>
                  <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight tracking-[-0.045em] md:text-3xl">{drawerTopic.title}</h2>
                </div>
                <button type="button" onClick={() => setDrawerTopic(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/5 text-black/60"><X className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="px-6 py-7 md:px-8">
              <p className="text-[15px] leading-7 text-black/55">
                Across the sampled conversation, the reaction is <strong className="font-semibold text-black/78">{toneCopy[drawerTopic.tone].label.toLowerCase()}</strong>. {drawerTopic.summary}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-black/7 bg-white p-4"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/32">Overall vibe</div><div className={`mt-2 text-2xl font-bold tracking-[-0.04em] ${toneCopy[drawerTopic.tone].text}`}>{drawerTopic.positive}%</div></div>
                <div className="rounded-2xl border border-black/7 bg-white p-4"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/32">Reactions</div><div className="mt-2 text-2xl font-bold tracking-[-0.04em]">{drawerTopic.reactions}</div></div>
                <div className="rounded-2xl border border-black/7 bg-white p-4"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/32">Velocity</div><div className="mt-2 text-2xl font-bold tracking-[-0.04em] text-emerald-600">+{drawerTopic.velocity}%</div></div>
              </div>

              <div className="mt-4 rounded-[24px] border border-black/7 bg-white p-5">
                <div className="flex items-center justify-between"><div><h3 className="font-bold tracking-[-0.025em]">What people agree on</h3><p className="mt-1 text-xs text-black/35">High-breadth themes across multiple discussion clusters</p></div><Zap className="h-5 w-5 text-black/24" /></div>
                <div className="mt-5 grid gap-4">
                  <div className="grid grid-cols-[1fr_auto] gap-4"><div><div className="text-sm font-semibold text-black/76">The underlying event is genuinely significant</div><div className="mt-1 text-xs text-black/35">Appears across multiple independent communities</div></div><div className="text-sm font-bold">81%</div></div>
                  <div className="grid grid-cols-[1fr_auto] gap-4"><div><div className="text-sm font-semibold text-black/76">Price and implementation will decide long-term reaction</div><div className="mt-1 text-xs text-black/35">Most common cross-platform concern</div></div><div className="text-sm font-bold">72%</div></div>
                </div>
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[26px] border border-black/7 bg-white p-6">
                <div className="pointer-events-none select-none space-y-3 blur-[7px] opacity-35">
                  {[84, 62, 91, 73, 51, 79].map((width, index) => <div key={index} className="h-4 rounded-full bg-black/25" style={{ width: `${width}%` }} />)}
                </div>
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-white/20 via-white/82 to-white p-6 text-center">
                  <div className="max-w-sm">
                    <LockKeyhole className="mx-auto h-6 w-6 text-black/55" />
                    <div className="mt-3 text-lg font-bold tracking-[-0.035em]">Go beyond the headline.</div>
                    <p className="mt-2 text-sm leading-6 text-black/48">Members see platform-by-platform sentiment, strongest opposing arguments, history, Bubble Check, representative sources and confidence.</p>
                    <button type="button" onClick={openMembership} className="mt-4 rounded-full bg-black px-5 py-3 text-xs font-semibold text-white">Unlock this topic</button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {paywallOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/28 p-5 backdrop-blur-xl">
          <button type="button" aria-label="Close membership" className="absolute inset-0" onClick={() => setPaywallOpen(false)} />
          <div className="relative w-full max-w-[600px] rounded-[32px] bg-white p-6 shadow-[0_38px_110px_rgba(0,0,0,0.25)] md:p-8">
            <button type="button" onClick={() => setPaywallOpen(false)} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-black/5"><X className="h-4 w-4" /></button>
            <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-black/36">Member intelligence</div>
            <h2 className="mt-3 pr-10 text-4xl font-bold leading-[0.98] tracking-[-0.055em] md:text-5xl">Search outside your bubble.</h2>
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-black/50">The front page stays visible. Membership pays for the deeper product instead of advertising: search anything, compare communities, follow sentiment over time and inspect the arguments shaping the conversation.</p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {["Search any topic", "Platform breakdowns", "30-day vibe history", "Follow topics + alerts", "Argument clusters", "Source transparency"].map((item) => (
                <div key={item} className="rounded-xl border border-black/6 bg-black/[0.018] px-3.5 py-3 text-xs font-semibold text-black/58">✓ {item}</div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-4 py-4">
              <div><span className="text-2xl font-bold tracking-[-0.04em]">$9</span><span className="text-xs text-black/42"> / month</span></div>
              <div className="text-right text-xs leading-5 text-black/42">No ads.<br />Cancel anytime.</div>
            </div>

            <button type="button" className="mt-4 w-full rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-black/82">Founding membership coming soon</button>
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-medium text-black/30"><Clock3 className="h-3 w-3" /> Payment is intentionally disabled in this prototype.</div>
          </div>
        </div>
      )}
    </main>
  );
}
