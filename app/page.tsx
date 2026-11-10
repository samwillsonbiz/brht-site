import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Blocks,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Code2,
  Database,
  ExternalLink,
  Gauge,
  GitBranch,
  Layers3,
  Lightbulb,
  LineChart,
  MapPin,
  Network,
  PackageCheck,
  Radar,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

const selectedBuilds = [
  {
    eyebrow: "Commerce product",
    title: "Cecilia’s storefront",
    copy: "A live, product-led shopping experience built around customer problems, real Shopify products, persistent cart state and checkout handoff.",
    href: "/cecilia",
    cta: "Open storefront",
    icon: PackageCheck,
    accent: "text-[#ffc982]",
    bg: "from-[#ffc982]/15",
  },
  {
    eyebrow: "Interactive product",
    title: "Beat the Patriarchy",
    copy: "A story-driven game concept developed into a playable web product, with product strategy, narrative systems, UI and deployment handled end to end.",
    href: "/beat-the-patriarchy",
    cta: "Explore the game",
    icon: Rocket,
    accent: "text-[#ff9ab2]",
    bg: "from-[#ff9ab2]/15",
  },
  {
    eyebrow: "Game systems",
    title: "Fable Fury digital",
    copy: "A tabletop world translated into a working digital deckbuilder with exploration, combat, progression, content systems and a repeatable release pipeline.",
    href: "/fablefury/deckbuilder/run",
    cta: "Open the build",
    icon: Blocks,
    accent: "text-[#b8a4ff]",
    bg: "from-[#b8a4ff]/15",
  },
  {
    eyebrow: "Information product",
    title: "Outside the Feed",
    copy: "A source-led news experience designed to make signal quality, provenance and perspective visible instead of hiding them behind an opaque feed.",
    href: "/outside-the-feed",
    cta: "View the product",
    icon: Radar,
    accent: "text-[#8cf6ba]",
    bg: "from-[#8cf6ba]/15",
  },
];

const capabilities = [
  {
    icon: Search,
    number: "01",
    title: "Understand the real problem",
    copy: "Map the process, systems, users, decisions and failure points before choosing the technology. Requirements become a practical operating model—not a document that disappears.",
    tags: ["Business analysis", "Process mapping", "Requirements", "Change impact"],
  },
  {
    icon: Database,
    number: "02",
    title: "Make the data trustworthy",
    copy: "Connect APIs and operational platforms, preserve history, model the business logic in SQL and make freshness, completeness and reconciliation visible.",
    tags: ["PostgreSQL", "APIs", "Data modelling", "Quality controls"],
  },
  {
    icon: Workflow,
    number: "03",
    title: "Automate the work around it",
    copy: "Remove repetitive handoffs, create alerts, trigger actions and connect systems so teams spend less time moving information and more time using it.",
    tags: ["n8n", "Webhooks", "Automation", "Integrations"],
  },
  {
    icon: Code2,
    number: "04",
    title: "Build the interface people need",
    copy: "Create dashboards, internal tools and customer-facing products around the actual workflow—then measure whether the solution is understood and used.",
    tags: ["Next.js", "React", "TypeScript", "Product UX"],
  },
];

const operatingFit = [
  {
    icon: Network,
    title: "Own connected business systems",
    copy: "CRM, commerce, finance, learning, operations and reporting are treated as one operating environment rather than isolated software subscriptions.",
  },
  {
    icon: BarChart3,
    title: "Turn information into decisions",
    copy: "Data models and dashboards explain performance, trends, risk and opportunity in language leaders can act on.",
  },
  {
    icon: Bot,
    title: "Apply AI where it is useful",
    copy: "AI is used for synthesis, classification, guidance and workflow acceleration—with human review, clear boundaries and measurable value.",
  },
  {
    icon: Users,
    title: "Make change usable",
    copy: "The person using the system matters as much as the system itself. Adoption, documentation and feedback are part of the build—not an afterthought.",
  },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className={`${compact ? "h-9 w-9" : "h-10 w-10"} grid place-items-center rounded-xl border border-white/15 bg-white/[0.055] font-black tracking-[-0.08em] text-[#9be6ff] shadow-lg shadow-black/20`}>
        B
      </span>
      <span>
        <span className="block text-sm font-black tracking-[0.2em] text-white">BRHT</span>
        {!compact ? <span className="block text-[9px] uppercase tracking-[0.18em] text-white/35">business systems that work</span> : null}
      </span>
    </span>
  );
}

function HeroSystem() {
  const sources = ["Commerce", "Advertising", "Finance", "Operations"];
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="absolute -inset-10 rounded-full bg-[#52d3ff]/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[#0c131f]/95 p-5 shadow-[0_45px_120px_rgba(0,0,0,.45)] sm:p-7">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#9be6ff]">BRHT system pattern</div>
            <div className="mt-2 text-lg font-semibold tracking-[-0.03em]">From disconnected tools to one operating picture</div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5 text-[10px] font-semibold text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Healthy
          </span>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="space-y-2.5">
            {sources.map((source, index) => (
              <div key={source} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#8cf6ba]" : index === 1 ? "bg-[#52d3ff]" : index === 2 ? "bg-[#ffc982]" : "bg-[#b8a4ff]"}`} />
                <span className="text-xs font-medium text-white/65">{source}</span>
              </div>
            ))}
          </div>

          <div className="grid justify-items-center gap-2 text-white/25">
            <GitBranch className="h-5 w-5" />
            <span className="h-20 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#8cf6ba]/20 bg-[#8cf6ba]/[0.07] p-4">
              <Database className="h-5 w-5 text-[#aef8cc]" />
              <div className="mt-3 text-sm font-semibold">Reliable foundation</div>
              <div className="mt-1 text-[11px] leading-5 text-white/38">History, business logic and quality checks in PostgreSQL.</div>
            </div>
            <div className="rounded-2xl border border-[#52d3ff]/20 bg-[#52d3ff]/[0.07] p-4">
              <LineChart className="h-5 w-5 text-[#9be6ff]" />
              <div className="mt-3 text-sm font-semibold">Purpose-built experience</div>
              <div className="mt-1 text-[11px] leading-5 text-white/38">Dashboards, explanations and actions designed for the user.</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            ["Truth", "Reconciled"],
            ["Freshness", "Visible"],
            ["Action", "Owned"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/[0.07] bg-black/15 p-3 text-center">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/30">{label}</div>
              <div className="mt-1 text-xs font-semibold text-white/75">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniForecast() {
  const left = [18, 28, 37, 49, 60, 74, 91, 108];
  const right = [16, 27, 35, 44, 59, 68, 80, 95];
  const width = 520;
  const height = 190;
  const max = 120;
  const x = (i: number) => 18 + (i / 7) * (width - 36);
  const y = (v: number) => 12 + (height - 36) * (1 - v / max);
  const points = (values: number[]) => values.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Fantasy matchup forecast preview">
      {[0.25, 0.5, 0.75, 1].map((tick) => (
        <line key={tick} x1="18" x2={width - 18} y1={y(max * tick)} y2={y(max * tick)} stroke="currentColor" strokeOpacity="0.08" />
      ))}
      <polyline points={points(left)} fill="none" stroke="#52d3ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points(right)} fill="none" stroke="#ff9a91" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {left.map((value, index) => <circle key={`a-${index}`} cx={x(index)} cy={y(value)} r="3.5" fill="#52d3ff" />)}
      {right.map((value, index) => <circle key={`b-${index}`} cx={x(index)} cy={y(value)} r="3" fill="#ff9a91" />)}
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070b12] text-white selection:bg-[#52d3ff]/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_2%,rgba(82,211,255,0.11),transparent_30rem),radial-gradient(circle_at_90%_28%,rgba(140,246,186,0.07),transparent_34rem),radial-gradient(circle_at_48%_95%,rgba(184,164,255,0.07),transparent_38rem)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.028] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />

      <header className="relative z-20 border-b border-white/[0.08] bg-[#070b12]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" aria-label="BRHT home"><BrandMark /></Link>
          <nav className="hidden items-center gap-7 text-sm text-white/48 md:flex">
            <a href="#work" className="transition hover:text-white">Work</a>
            <a href="#capabilities" className="transition hover:text-white">Capabilities</a>
            <a href="#about" className="transition hover:text-white">About</a>
          </nav>
          <a
            href="mailto:samwillsonbiz@gmail.com?subject=BRHT%20conversation"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.045] px-4 py-2.5 text-xs font-semibold text-white/75 transition hover:border-[#52d3ff]/45 hover:text-white"
          >
            Start a conversation
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[780px] max-w-[1440px] gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:px-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#52d3ff]/20 bg-[#52d3ff]/[0.055] px-3 py-2 text-[11px] font-semibold text-[#9be6ff]">
            <Sparkles className="h-3.5 w-3.5" />
            Business analysis · data · automation · product
          </div>
          <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.93] tracking-[-0.065em] sm:text-7xl lg:text-[86px]">
            I turn messy operations into systems people can see, trust and use.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/55 sm:text-xl sm:leading-9">
            BRHT is the work of Samuel Willson: an operator and business analyst who can connect the systems, model the data, automate the process and build the product—not just recommend it.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#work" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101a] transition hover:bg-[#9be6ff]">
              Explore the work
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/work/fable-fury" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.035] px-6 py-3.5 text-sm font-semibold text-white/72 transition hover:border-white/35 hover:text-white">
              Open a command centre
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-11 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["Operator", "Commercial context first"],
              ["Analyst", "Evidence before opinion"],
              ["Builder", "Working products, not decks"],
            ].map(([title, copy]) => (
              <div key={title} className="border-l border-white/12 pl-4">
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs leading-5 text-white/35">{copy}</div>
              </div>
            ))}
          </div>
        </div>
        <HeroSystem />
      </section>

      <section className="relative border-y border-white/[0.08] bg-white/[0.025]">
        <div className="mx-auto grid max-w-[1440px] gap-px px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
          {[
            [Database, "Reliable data foundations", "PostgreSQL · SQL models · quality"],
            [Workflow, "Connected operations", "APIs · n8n · webhooks"],
            [LineChart, "Decision interfaces", "Dashboards · internal tools"],
            [BrainCircuit, "Practical AI", "Synthesis · guidance · automation"],
          ].map(([Icon, title, detail]) => {
            const IconComponent = Icon as typeof Database;
            return (
              <div key={String(title)} className="flex items-center gap-4 border-white/[0.08] py-6 sm:border-r sm:px-5 first:pl-0 last:border-r-0">
                <IconComponent className="h-5 w-5 shrink-0 text-[#9be6ff]" />
                <div>
                  <div className="text-sm font-semibold">{String(title)}</div>
                  <div className="mt-1 text-xs text-white/32">{String(detail)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="work" className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#9be6ff]">Selected work</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">The website is the portfolio. The products are the proof.</h2>
          <p className="mt-5 text-base leading-8 text-white/50 sm:text-lg">
            Each build starts with a real operating problem and ends with something people can use. Strategy, data, workflow, interface and implementation stay connected.
          </p>
        </div>

        <article className="mt-14 overflow-hidden rounded-[36px] border border-white/10 bg-[#0b121d] shadow-[0_40px_100px_rgba(0,0,0,.25)]">
          <div className="grid lg:grid-cols-[.9fr_1.1fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#8cf6ba]/20 bg-[#8cf6ba]/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#aef8cc]">Featured case study</span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/38">Operating intelligence</span>
              </div>
              <h3 className="mt-7 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Fable Fury command centre</h3>
              <p className="mt-5 text-base leading-8 text-white/52">
                Commerce, paid media, products, fulfilment and costs moved from fragile spreadsheet logic into scheduled ingestion and PostgreSQL. The next step is not another generic BI skin—it is a custom operating surface built around the questions, decisions and actions of the business.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  "n8n schedules and webhooks keep source data moving",
                  "PostgreSQL models preserve history and business logic",
                  "Freshness and reconciliation make reliability visible",
                  "Custom dashboards turn signals into owned actions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/62">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/work/fable-fury" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#07101a] transition hover:bg-[#aef8cc]">
                Explore the case study
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative min-h-[560px] border-t border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(82,211,255,.13),transparent_24rem),#080d15] p-5 sm:p-8 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:38px_38px]" />
              <div className="relative rounded-[26px] border border-white/12 bg-[#0c131f]/95 p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9be6ff]">Executive view</div>
                    <div className="mt-2 text-lg font-semibold">Performance + reliability + action</div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-300/[0.08] px-3 py-1.5 text-[10px] text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live pattern</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["Revenue", "Reconciled", "text-[#9be6ff]"],
                    ["Margin", "Improving", "text-[#aef8cc]"],
                    ["Sources", "4 / 5 healthy", "text-[#ffdc98]"],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                      <div className="text-[9px] uppercase tracking-[0.14em] text-white/30">{label}</div>
                      <div className={`mt-2 text-xs font-semibold ${tone}`}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold">Revenue and contribution profit</span>
                    <span className="text-[10px] text-white/30">30 days</span>
                  </div>
                  <div className="mt-4 flex h-40 items-end gap-2">
                    {[38, 49, 43, 58, 64, 61, 72, 69, 81, 78, 90, 96].map((height, index) => (
                      <div key={index} className="relative flex-1 rounded-t-sm bg-[#52d3ff]/18" style={{ height: `${height}%` }}>
                        <div className="absolute inset-x-0 bottom-0 rounded-t-sm bg-[#52d3ff]" style={{ height: `${Math.max(18, height * 0.56)}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#aef8cc]"><Target className="h-3.5 w-3.5" /> Decision queue</div>
                    <div className="mt-4 space-y-3">
                      {["Scale winning creative", "Protect high-margin stock", "Repair delayed source"].map((item, index) => (
                        <div key={item} className="flex items-center gap-3 text-xs text-white/55"><span className={`h-2 w-2 rounded-full ${index === 2 ? "bg-amber-300" : "bg-emerald-300"}`} />{item}</div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#b8a4ff]/18 bg-[#b8a4ff]/[0.055] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d2c5ff]"><Sparkles className="h-3.5 w-3.5" /> Executive readout</div>
                    <p className="mt-4 text-xs leading-6 text-white/48">Growth and margin are moving together. The immediate constraint is inventory, not demand.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="mt-6 grid overflow-hidden rounded-[36px] border border-white/10 bg-[#0b121d] lg:grid-cols-[1.05fr_.95fr]">
          <div className="border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#52d3ff]/20 bg-[#52d3ff]/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9be6ff]">
              <CircleDot className="h-3.5 w-3.5" /> Live data product
            </div>
            <h3 className="mt-7 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Fantasy Lab</h3>
            <p className="mt-5 text-base leading-8 text-white/52">
              A real fantasy-basketball operating system built because the available tools did not answer the decisions that mattered: live matchup outlook, schedule value, usable starts, waiver timing and player contribution.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["ESPN integration", "Supabase", "Forecast models", "Custom SVG charts", "Admin sync"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/48">{tag}</span>
              ))}
            </div>
            <Link href="/fantasy" className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-[#52d3ff]/45 hover:text-white">
              Open Fantasy Lab
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex min-h-[460px] items-center bg-[#f7f8fb] p-5 text-[#111827] sm:p-8">
            <div className="w-full rounded-[26px] border border-black/[0.07] bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,.15)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0071e3]">Forecast trajectory</div>
                  <div className="mt-2 text-lg font-semibold tracking-[-0.03em]">Where the matchup could finish</div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">Live model</span>
              </div>
              <div className="mt-6"><MiniForecast /></div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span className="text-[#0071e3]">● My team</span>
                <span className="text-[#f05b52]">● Opponent</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  ["Win chance", "68%"],
                  ["Usable starts", "37"],
                  ["Streaming edge", "+41"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[#f3f5f8] p-3 text-center">
                    <div className="text-[9px] uppercase tracking-[0.13em] text-black/38">{label}</div>
                    <div className="mt-1 text-sm font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {selectedBuilds.map((build) => {
            const Icon = build.icon;
            return (
              <Link key={build.title} href={build.href} className={`group flex min-h-[330px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${build.bg} via-[#0b121d] to-[#0b121d] p-6 transition hover:-translate-y-1 hover:border-white/22`}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/35">{build.eyebrow}</span>
                  <Icon className={`h-5 w-5 ${build.accent}`} />
                </div>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">{build.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/47">{build.copy}</p>
                <div className={`mt-auto flex items-center gap-2 pt-8 text-sm font-semibold ${build.accent}`}>
                  {build.cta}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="capabilities" className="relative border-y border-white/[0.08] bg-white/[0.025]">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#aef8cc]">How I work</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">The gap between business and technology should have an owner.</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/50">
                That owner needs enough commercial context to ask the right questions, enough technical ability to build the answer and enough empathy to make the change work for people.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((capability) => {
                const Icon = capability.icon;
                return (
                  <article key={capability.number} className="rounded-[28px] border border-white/10 bg-[#0b121d] p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="h-5 w-5 text-[#9be6ff]" />
                      <span className="font-mono text-xs text-white/25">{capability.number}</span>
                    </div>
                    <h3 className="mt-7 text-xl font-semibold tracking-[-0.035em]">{capability.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/45">{capability.copy}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {capability.tags.map((tag) => <span key={tag} className="rounded-full border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-white/35">{tag}</span>)}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="rounded-[38px] border border-[#52d3ff]/16 bg-[radial-gradient(circle_at_0%_0%,rgba(82,211,255,.12),transparent_30rem),#0b121d] p-7 sm:p-10 lg:p-14">
          <div className="grid gap-12 lg:grid-cols-[.84fr_1.16fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-white/50">
                <Wrench className="h-3.5 w-3.5 text-[#9be6ff]" />
                What this looks like inside a business
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">A practical business analyst who can also make the solution real.</h2>
              <p className="mt-5 text-base leading-8 text-white/50">
                I work directly with leaders and the teams closest to the work. The goal is not to introduce more technology. It is to make the business easier to understand, easier to operate and better tomorrow than it is today.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {operatingFit.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/[0.09] bg-black/15 p-5">
                    <Icon className="h-5 w-5 text-[#aef8cc]" />
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/43">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative border-t border-white/[0.08] bg-[#090e17]">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:px-12">
          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute -inset-8 rounded-full bg-[#b8a4ff]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.03] p-3">
              <Image
                src="/images/team/sam-willson.jpg"
                alt="Samuel Willson"
                width={960}
                height={1120}
                className="aspect-[4/5] w-full rounded-[26px] object-cover object-top grayscale-[10%]"
                priority={false}
              />
              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/12 bg-[#07101a]/82 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-white"><MapPin className="h-3.5 w-3.5 text-[#9be6ff]" /> Perth, Western Australia</div>
                <div className="mt-1 text-[11px] text-white/42">Available for the right role and selected client work.</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d2c5ff]">Samuel Willson</div>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">I have been the operator waiting for better information and the founder who needed the system yesterday.</h2>
            <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-white/52">
              <p>
                My background spans operations leadership, business growth, finance, real estate, publishing and product development. That mix changed how I approach business analysis: the model must be correct, but it must also survive contact with customers, employees, cash flow and the pace of a real organisation.
              </p>
              <p>
                BRHT brings those disciplines together. I can move from an executive problem to process discovery, data architecture, automation, interface design, implementation and continuous improvement without losing the reason the work started.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                [Gauge, "Commercial", "Understands the operating consequence"],
                [Layers3, "Technical", "Can design and build the system"],
                [Users, "People first", "Makes adoption part of delivery"],
              ].map(([Icon, title, copy]) => {
                const IconComponent = Icon as typeof Gauge;
                return (
                  <div key={String(title)} className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4">
                    <IconComponent className="h-4 w-4 text-[#9be6ff]" />
                    <div className="mt-3 text-sm font-semibold">{String(title)}</div>
                    <div className="mt-1 text-xs leading-5 text-white/35">{String(copy)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white p-8 text-[#07101a] sm:p-12 lg:p-16">
          <div className="absolute right-[-10%] top-[-55%] h-[520px] w-[520px] rounded-full bg-[#52d3ff]/22 blur-3xl" />
          <div className="absolute bottom-[-65%] left-[25%] h-[460px] w-[460px] rounded-full bg-[#8cf6ba]/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0071e3]">Bring me the messy part</div>
              <h2 className="mt-4 max-w-5xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">A process that wastes time. Data nobody trusts. A tool that should exist but does not.</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-black/55 sm:text-lg">That is usually where the most valuable work starts.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href="mailto:samwillsonbiz@gmail.com?subject=Let%E2%80%99s%20talk%20about%20a%20business%20problem" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#07101a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0071e3]">
                Email Samuel
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link href="/work/fable-fury" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/12 px-6 py-3.5 text-sm font-semibold text-black/65 transition hover:border-black/30 hover:text-black">
                View the data case study
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <BrandMark compact />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/35">
            <span>Samuel Willson · Perth</span>
            <a href="mailto:samwillsonbiz@gmail.com" className="transition hover:text-white">samwillsonbiz@gmail.com</a>
            <span className="inline-flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-[#9be6ff]" /> See clearly. Build what is missing.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
