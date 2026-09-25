"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Coins,
  FileBarChart2,
  Gauge,
  Lightbulb,
  LineChart,
  Menu,
  Search,
  Settings2,
  Sparkles,
  Star,
  Target,
  Users,
  X,
} from "lucide-react";

import CfoServiceShowcase, { type CfoServiceId } from "@/components/CfoServiceShowcase";
import CfoResourceLibrary from "@/components/CfoResourceLibrary";

const bookingHref =
  "mailto:samwillsonbiz@gmail.com?subject=BRHT%20CFO%20Strategy%20Call";

const services: Array<{
  id: CfoServiceId;
  icon: React.ElementType;
  title: string;
  copy: string;
  accent?: boolean;
}> = [
  {
    id: "forecasting",
    icon: LineChart,
    title: "Financial Forecasting",
    copy: "Build accurate, driver-based forecasts to plan for growth, stress test scenarios and make confident decisions.",
  },
  {
    id: "cash-flow",
    icon: Coins,
    title: "Cash Flow & Runway",
    copy: "Get real visibility into cash, understand key drivers, and plan for the road ahead.",
  },
  {
    id: "kpi-reporting",
    icon: Gauge,
    title: "KPI & Management Reporting",
    copy: "Track the metrics that matter with clear, actionable reporting tailored to your business.",
  },
  {
    id: "board-reporting",
    icon: FileBarChart2,
    title: "Board & Investor Reporting",
    copy: "Professional, board-ready reporting to support investors, lenders and key stakeholders.",
  },
  {
    id: "pricing-margin",
    icon: Target,
    title: "Pricing & Margin Analysis",
    copy: "Analyze margins, model pricing scenarios and find opportunities to increase profitability.",
  },
  {
    id: "capital-planning",
    icon: CircleDollarSign,
    title: "Capital Planning & Fundraising Support",
    copy: "Build financial models, prepare investor materials and get strategic support for raising capital.",
  },
  {
    id: "systems-data",
    icon: Settings2,
    title: "Finance Systems & Data",
    copy: "Design and optimize your finance stack, integrate your data and create scalable reporting systems.",
  },
  {
    id: "strategic-partner",
    icon: Sparkles,
    title: "Not Bookkeeping. A Strategic Partner.",
    copy: "See the difference between recording what happened and having a CFO help decide what happens next.",
    accent: true,
  },
];

const process = [
  {
    number: "01",
    title: "Discover",
    icon: Search,
    copy: "We learn your business, goals and challenges, then assess the financial systems and data behind them.",
  },
  {
    number: "02",
    title: "Model",
    icon: BarChart3,
    copy: "We build tailored forecasts, reporting and scenarios around the drivers that actually matter.",
  },
  {
    number: "03",
    title: "Advise",
    icon: Lightbulb,
    copy: "We turn the numbers into clear recommendations and strategic guidance.",
  },
  {
    number: "04",
    title: "Partner",
    icon: Users,
    copy: "We stay alongside you as the business evolves, helping navigate what comes next.",
  },
];

const testimonials = [
  {
    quote:
      "BRHT CFO gave us the clarity we needed to make faster, more confident decisions. Our forecasting and reporting are now on a completely different level.",
    role: "Founder",
    company: "Called to Surf",
    avatar: "https://i.pravatar.cc/96?img=12",
  },
  {
    quote:
      "The team quickly understood our business and built a reporting structure that actually helps us run the business. We finally have real visibility into cash and what’s next.",
    role: "CEO",
    company: "Clarke Capital",
    avatar: "https://i.pravatar.cc/96?img=47",
  },
  {
    quote:
      "BRHT CFO has been an incredible strategic partner. They bring deep financial expertise, ask the right questions, and help us think through opportunities we wouldn’t have seen on our own.",
    role: "Operations Leader",
    company: "Kiln",
    avatar: "https://i.pravatar.cc/96?img=33",
  },
];

function BrhtLogo({ cfo = false }: { cfo?: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex items-center">
        <span className="text-[27px] font-black tracking-[-0.055em] text-white">
          BRHT
        </span>
        <span className="inline-flex -skew-x-12 gap-[3px] pt-1">
          <span className="h-4 w-[7px] rounded-full bg-[#b8f34a]" />
          <span className="mt-1 h-4 w-[7px] rounded-full bg-[#97e533]" />
        </span>
      </div>
      {cfo && (
        <>
          <span className="h-6 w-px bg-white/18" />
          <span className="text-[12px] font-bold uppercase tracking-[0.33em] text-[#b8f34a]">
            CFO
          </span>
        </>
      )}
    </div>
  );
}

function DualLineChart() {
  const actual = "18,74 52,62 84,64 116,55 148,58 180,45 212,48 244,30";
  const forecast = "18,68 52,58 84,54 116,56 148,44 180,48 212,38 244,18";
  return (
    <svg viewBox="0 0 264 110" className="h-[86px] w-full">
      <defs>
        <linearGradient id="revGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a7e83f" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#a7e83f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g opacity="0.14" stroke="#ffffff">
        <line x1="12" y1="88" x2="252" y2="88" />
        <line x1="12" y1="63" x2="252" y2="63" />
        <line x1="12" y1="38" x2="252" y2="38" />
      </g>
      <polyline points={actual} fill="none" stroke="#25b9aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <polyline points={forecast} fill="none" stroke="#9fdc38" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 68 L52 58 L84 54 L116 56 L148 44 L180 48 L212 38 L244 18 L244 88 L18 88 Z" fill="url(#revGlow)" />
      {[[18,68],[52,58],[84,54],[116,56],[148,44],[180,48],[212,38],[244,18]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.1" fill="#9fdc38" />
      ))}
      <g fill="#7f918a" fontSize="8.6" fontWeight="600">
        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map((m, i) => (
          <text key={m} x={18 + i * 32} y="102">{m}</text>
        ))}
      </g>
      <g transform="translate(150,90)" fontSize="9.3" fontWeight="700">
        <circle cx="0" cy="0" r="4" fill="#25b9aa" />
        <text x="10" y="3" fill="#91a09a">Actual</text>
        <circle cx="62" cy="0" r="4" fill="#9fdc38" />
        <text x="72" y="3" fill="#91a09a">Forecast</text>
      </g>
    </svg>
  );
}

function BarChart({ values, compact = false }: { values: number[]; compact?: boolean }) {
  return (
    <div className={"flex items-end gap-2 " + (compact ? "h-[54px]" : "mt-4 h-[76px]")}>
      {values.map((v, i) => (
        <div key={i} className="flex-1">
          <div
            className="w-full rounded-t-[4px] bg-gradient-to-t from-[#21746b] via-[#2bb6a6] to-[#69ddce]"
            style={{ height: v + "%" }}
          />
        </div>
      ))}
    </div>
  );
}

function AreaChart() {
  return (
    <svg viewBox="0 0 264 110" className="mt-1 h-[86px] w-full">
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#25b9aa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#25b9aa" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <g opacity="0.14" stroke="#ffffff">
        <line x1="12" y1="88" x2="252" y2="88" />
        <line x1="12" y1="60" x2="252" y2="60" />
        <line x1="12" y1="34" x2="252" y2="34" />
      </g>
      <path d="M12 84 L36 80 L60 80 L84 72 L108 78 L132 74 L156 78 L180 62 L204 64 L228 44 L252 52 L252 88 L12 88 Z" fill="url(#areaFill)" />
      <path d="M12 84 L36 80 L60 80 L84 72 L108 78 L132 74 L156 78 L180 62 L204 64 L228 44 L252 52" fill="none" stroke="#25b9aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dashboard() {
  const metricCard =
    "rounded-[16px] border border-[#31423b] bg-[#17231f] shadow-[0_10px_28px_rgba(0,0,0,0.16)]";

  return (
    <div className="rounded-[24px] border border-white/[0.1] bg-[#0d1615]/96 p-4 shadow-[0_32px_90px_rgba(0,0,0,0.42)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/60">
          Financial Overview
        </p>
        <span className="rounded-[12px] border border-white/12 px-4 py-2 text-[11px] font-medium text-white/56">
          Last 12 months
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={metricCard + " min-h-[166px] p-4"}>
          <p className="text-[12px] font-semibold text-white/62">Revenue vs Forecast</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-[25px] font-black leading-none text-white">$2.4M</span>
            <span className="rounded-full bg-[#173826] px-2.5 py-1 text-[12px] font-bold text-[#7df786]">
              ↑ 12%
            </span>
          </div>
          <DualLineChart />
        </div>

        <div className={metricCard + " min-h-[166px] p-4"}>
          <p className="text-[12px] font-semibold text-white/62">Gross Margin</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-[25px] font-black leading-none text-white">68%</span>
            <span className="rounded-full bg-[#10352f] px-2.5 py-1 text-[12px] font-bold text-[#42d8c8]">
              ↑ 6%
            </span>
          </div>
          <AreaChart />
        </div>

        <div className={metricCard + " h-[92px] p-4"}>
          <div className="grid h-full grid-cols-[0.9fr_1.1fr] items-end gap-4">
            <div className="self-start">
              <p className="text-[12px] font-semibold text-white/62">Cash Runway</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[25px] font-black leading-none text-white">14</span>
                <span className="mb-0.5 text-[12px] font-medium text-white/58">months</span>
              </div>
            </div>
            <BarChart compact values={[34,45,56,70,62,80,88,100]} />
          </div>
        </div>

        <div className={metricCard + " h-[92px] p-4"}>
          <div className="grid h-full grid-cols-[0.9fr_1.1fr] items-end gap-4">
            <div className="self-start">
              <p className="whitespace-nowrap text-[11.5px] font-semibold text-white/62">
                Operating Cash Flow
              </p>
              <div className="mt-3 text-[25px] font-black leading-none text-white">$412K</div>
            </div>
            <BarChart compact values={[12,22,28,44,56,60,74,92]} />
          </div>
        </div>

        <div className="min-h-[164px] rounded-[16px] border border-[#c7d2ca] bg-[#e7ede8] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#718078]">
                Scenario Planning
              </p>
              <p className="mt-1 text-[13px] font-extrabold text-[#1d2b26]">
                What happens next?
              </p>
            </div>
            <span className="rounded-full bg-white/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#64736c]">
              CFO View
            </span>
          </div>
          <div className="space-y-3.5">
            {[
              ["Base Case", "14 months", "#25b9aa"],
              ["Growth Case", "22 months", "#65dca7"],
              ["Downside Case", "6 months", "#efc84f"],
            ].map(([label, value, dot]) => (
              <div key={label} className="flex items-center justify-between text-[13px] text-[#596660]">
                <span className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dot }} />
                  {label}
                </span>
                <span className="font-semibold text-[#25312d]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[164px] rounded-[16px] border border-[#9bd739]/80 bg-[#112116] p-4 shadow-[0_0_26px_rgba(155,215,57,0.10)]">
          <div className="mb-4 flex items-center gap-3 text-[#b8f34a]">
            <Sparkles className="h-5 w-5 fill-current" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8f34a]/70">
                Advisor Intelligence
              </p>
              <span className="text-[14px] font-extrabold">BRHT AI Insights</span>
            </div>
          </div>
          <div className="space-y-2.5 text-[12px] leading-5 text-white/70">
            {[
              "Revenue is pacing 12% ahead of plan.",
              "Consider increasing inventory for Q4.",
              "Your runway could extend to 22 months with the proposed pricing change.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1.5 grid h-4 w-4 place-items-center rounded-full border border-[#45d8c4]/45 bg-[#15342c] text-[8px] text-[#45d8c4]">
                  ●
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBar() {
  const items = [
    [LineChart, "Forward-looking forecasts", "Go beyond the numbers and see what’s next."],
    [FileBarChart2, "Board-ready reporting", "Clear, concise reporting for confident decisions."],
    [Coins, "Cash visibility", "Know your runway and key drivers in real time."],
    [Users, "Senior strategic finance", "Experienced CFO advisors invested in your success."],
  ] as const;

  return (
    <div className="border-t border-white/[0.08] bg-[#091312]/92">
      <div className="mx-auto grid max-w-[1440px] px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {items.map(([Icon, title, copy], index) => (
          <div
            key={title}
            className={"flex gap-5 py-9 lg:px-8 " + (index !== 3 ? "lg:border-r lg:border-white/[0.08]" : "")}
          >
            <Icon className="mt-1 h-9 w-9 shrink-0 text-[#b8f34a]" strokeWidth={1.8} />
            <div>
              <h3 className="max-w-[180px] text-[16px] font-extrabold leading-6 text-white">{title}</h3>
              <p className="mt-2 max-w-[230px] text-[13px] leading-6 text-white/54">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CfoPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinnedService, setPinnedService] = useState<CfoServiceId | null>(null);

  const closeServiceShowcase = () => {
    setPinnedService(null);
  };

  return (
    <div
      className="min-h-screen bg-[#07100e] text-white selection:bg-lime-300 selection:text-[#07100e]"
      style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}
    >
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07100e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-8">
          <a href="#top" aria-label="BRHT CFO home">
            <BrhtLogo cfo />
          </a>

          <nav className="hidden items-center gap-6 text-[11.5px] font-semibold text-white/64 lg:flex">
            <a className="transition hover:text-[#b8f34a]" href="#services">Services</a>
            <a className="transition hover:text-[#b8f34a]" href="#how-it-works">How It Works</a>
            <a className="transition hover:text-[#b8f34a]" href="#process">Process</a>
            <a className="transition hover:text-[#b8f34a]" href="#results">Results</a>
            <a className="transition hover:text-[#b8f34a]" href="#pricing">Pricing</a>
            <a className="transition hover:text-[#b8f34a]" href="#resources">Resources</a>
          </nav>

          <a
            href={bookingHref}
            className="hidden items-center gap-2 rounded-[12px] bg-[#b8f34a] px-6 py-3.5 text-[12.5px] font-extrabold text-[#09110f] shadow-[0_0_34px_rgba(184,243,74,0.12)] transition hover:bg-[#c5f760] lg:inline-flex"
          >
            Book a Strategy Call <ArrowRight className="h-4 w-4" />
          </a>

          <button
            aria-label="Toggle menu"
            className="rounded-md border border-white/10 p-2 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-5 py-4 lg:hidden">
            <div className="grid gap-3 text-sm text-white/75">
              <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
              <a href="#process" onClick={() => setMenuOpen(false)}>Process</a>
              <a href="#results" onClick={() => setMenuOpen(false)}>Results</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
              <a href="#resources" onClick={() => setMenuOpen(false)}>Resources</a>
              <a
                href={bookingHref}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-lime-300 px-4 py-3 font-bold text-[#07100e]"
              >
                Book a Strategy Call <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_10%,rgba(165,235,69,0.10)_0%,rgba(120,200,60,0.045)_24%,transparent_48%),radial-gradient(ellipse_at_18%_25%,rgba(38,160,140,0.045)_0%,transparent_40%),linear-gradient(180deg,#07100e_0%,#07110f_62%,#081311_100%)]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-[126px] h-36 opacity-55">
            <svg viewBox="0 0 1600 260" preserveAspectRatio="none" className="h-full w-full">
              <g fill="none" stroke="#d7ddd8" strokeOpacity="0.26" strokeWidth="1.1">
                <path d="M0 220 Q110 188 220 214 T440 208 T660 214 T880 205 T1100 216 T1320 203 T1600 214" />
                <path d="M0 236 Q110 206 220 228 T440 224 T660 230 T880 220 T1100 232 T1320 220 T1600 230" />
                <path d="M0 248 Q110 224 220 242 T440 238 T660 246 T880 236 T1100 248 T1320 236 T1600 246" />
                <path d="M0 260 L1600 260" strokeOpacity="0.15" />
                <path d="M100 260 L180 212 L240 244 L310 208 L380 236 L462 205 L520 240 L602 212 L670 250 L745 210 L818 240 L898 206 L968 246 L1044 212 L1120 246 L1200 210 L1282 242 L1364 216 L1444 242 L1522 214" />
              </g>
            </svg>
          </div>

          <div className="relative mx-auto max-w-[1440px] px-6 lg:px-8">
            <div className="grid min-h-[610px] items-start gap-12 py-16 lg:grid-cols-[0.98fr_1.02fr] lg:gap-14 lg:py-16">
              <div className="max-w-[650px] lg:pt-4">
                <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.34em] text-white/60">
                  Strategic finance for operators
                </p>
                <h1 className="text-[54px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[62px] lg:text-[66px] xl:text-[72px]">
                  See the numbers.
                  <span className="mt-1 block text-[#b8f34a]">Know what to do.</span>
                </h1>
                <p className="mt-7 max-w-[640px] text-[17px] leading-8 text-white/76">
                  BRHT CFO provides outsourced CFO advisory for growing companies that need clearer financial insights, stronger forecasting, and a strategic partner to help make better decisions.
                </p>
                <div className="mt-9">
                  <a
                    href={bookingHref}
                    className="inline-flex items-center gap-2 rounded-[14px] bg-[#b8f34a] px-8 py-5 text-[15px] font-extrabold text-[#09110f] shadow-[0_0_28px_rgba(184,243,74,0.12)] transition hover:bg-[#c5f760]"
                  >
                    Book a Strategy Call <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <div className="relative lg:mt-2 lg:max-w-[680px] lg:justify-self-end">
                <div className="absolute -inset-10 rounded-full bg-[#b8f34a]/[0.035] blur-3xl" />
                <div className="relative lg:w-[106%] lg:origin-top-right lg:scale-[0.93]"><Dashboard /></div>
              </div>
            </div>
          </div>

          <FeatureBar />
        </section>

        <section id="services" className="scroll-mt-24 bg-[#f4f4ef] py-20 text-[#101714] md:py-24">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                  Our services
                </p>
                <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-5xl">
                  <span className="block text-[#101714]">Strategic finance.</span>
                  <span className="block text-[#1e7b69]">Confident leadership.</span>
                </h2>
              </div>
              <div className="max-w-md lg:justify-self-end">
                <p className="text-[14px] leading-6 text-[#5a6660]">
                  We help growing companies turn financial data into a strategic advantage with the insights, systems and guidance to make better decisions at every stage.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#8fcf35]/35 bg-[#f4fbeb] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#567d23]">
                  Click to open <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setPinnedService(service.id)}
                    className={
                      "group relative min-h-[220px] overflow-hidden rounded-xl border p-6 text-left shadow-[0_10px_35px_rgba(15,23,20,0.025)] transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_55px_rgba(15,23,20,0.12)] focus:outline-none focus:ring-2 focus:ring-[#9bd739]/45 " +
                      (service.accent
                        ? "border-[#b7e765] bg-gradient-to-br from-white via-[#fbfff4] to-[#effbd4]"
                        : "border-black/[0.06] bg-white hover:border-[#8fcf35]/55 hover:bg-[#fbfff8]")
                    }
                  >
                    {service.accent && (
                      <div className="absolute right-[-40px] top-[-40px] h-28 w-28 rounded-full bg-[#b8f34a]/20 blur-2xl" />
                    )}
                    <div className="relative flex items-start justify-between">
                      <Icon
                        className={"h-7 w-7 " + (service.accent ? "text-[#77a920]" : "text-[#1e7b69]")}
                        strokeWidth={1.8}
                      />
                      <ArrowRight className="h-4 w-4 text-black/45 transition duration-200 group-hover:translate-x-1 group-hover:text-[#6f9f19]" />
                    </div>
                    <h3 className="relative mt-7 text-[16px] font-extrabold leading-5">
                      {service.title}
                    </h3>
                    <p className="relative mt-3 text-[12px] leading-5 text-[#626d68]">
                      {service.copy}
                    </p>
                    <div className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-[#f2f7ee] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#68815f] opacity-55 transition group-hover:bg-[#eaf7d9] group-hover:text-[#567d23] group-hover:opacity-100 group-focus:opacity-100">
                      Click to open <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {pinnedService && (
          <>
            {(
              <button
                type="button"
                aria-label="Close service showcase"
                onClick={closeServiceShowcase}
                className="fixed inset-0 z-[70] cursor-default bg-[#020807]/75 backdrop-blur-[3px]"
              />
            )}
            <div
              className={
                "fixed left-1/2 top-[54%] z-[80] h-[min(72vh,690px)] w-[min(1180px,calc(100vw-36px))] -translate-x-1/2 -translate-y-1/2 pointer-events-auto opacity-100 transition duration-200"
              }
            >
              <CfoServiceShowcase
                serviceId={pinnedService}
                pinned={true}
                onClose={closeServiceShowcase}
              />
            </div>
          </>
        )}

        <section id="how-it-works" className="scroll-mt-24 relative overflow-hidden border-y border-white/[0.06] bg-[#07100e] py-24 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(184,243,74,0.08),transparent_26%),radial-gradient(circle_at_18%_65%,rgba(52,214,195,0.05),transparent_24%)]" />
          <div className="mx-auto max-w-[1320px] px-5 md:px-8">
            <div className="relative text-center">
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#b8f34a]">
                Built to work together
              </p>
              <h2 className="mx-auto max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-5xl">
                <span className="block text-white">Connected data.</span>
                <span className="block text-[#b8f34a]">Better decisions.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[13px] leading-6 text-white/48">
                One connected system. One clearer view of what to do next.
              </p>
            </div>

            <div className="relative mt-14 overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0a1512]/80 px-5 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.24)] md:px-8 md:py-10">
              <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:38px_38px]" />
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8f34a]/10 blur-[70px]" />

              <div className="relative grid items-center gap-7 lg:grid-cols-[0.98fr_0.84fr_0.98fr] lg:gap-4">
                <div className="pointer-events-none absolute left-[21%] right-[13%] top-1/2 z-0 hidden -translate-y-1/2 lg:block">
                  <div className="h-px w-full bg-gradient-to-r from-[#34d6c3]/10 via-[#34d6c3]/75 via-[42%] to-[#b8f34a]/80" />
                  <span className="absolute left-[39%] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#34d6c3] shadow-[0_0_16px_rgba(52,214,195,0.85)]" />
                  <span className="absolute left-[66%] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#b8f34a] shadow-[0_0_18px_rgba(184,243,74,0.85)]" />
                  <span className="absolute left-[48%] top-1/2 -translate-y-1/2 text-[13px] font-black text-[#69e2cf]/80">›</span>
                  <span className="absolute left-[76%] top-1/2 -translate-y-1/2 text-[13px] font-black text-[#b8f34a]/80">›</span>
                </div>
                <div className="relative z-10 mx-auto w-full max-w-[382px] lg:mr-2">
                  <div className="relative overflow-hidden rounded-[24px] border border-[#2b4b42] bg-[#101b17] shadow-[0_0_54px_rgba(52,214,195,0.07)]">
                    <span className="absolute right-[-7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#34d6c3]/55 bg-[#12312b] shadow-[0_0_14px_rgba(52,214,195,0.6)]" />

                    <div className="border-b border-white/[0.08] px-5 py-4">
                      <div className="flex items-center justify-between gap-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#60d9c7]">
                            Connected sources
                          </p>
                          <h3 className="mt-1 text-[28px] font-black leading-none text-white">
                            Your Data
                          </h3>
                        </div>
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#34d6c3]/20 bg-[#34d6c3]/10 text-[#60d9c7]">
                          <Settings2 className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-0">
                      {[
                        { icon: CircleDollarSign, label: "Finance" },
                        { icon: BarChart3, label: "Commerce" },
                        { icon: Coins, label: "Banking" },
                        { icon: Users, label: "CRM" },
                        { icon: Gauge, label: "Operations" },
                        { icon: Settings2, label: "Systems" },
                      ].map(({ icon: Icon, label }, index) => (
                        <div
                          key={label}
                          className={
                            "flex items-center gap-3 px-5 py-3.5 " +
                            (index % 2 === 0 ? "border-r border-white/[0.07] " : "") +
                            (index < 4 ? "border-b border-white/[0.07]" : "")
                          }
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#34d6c3]/35 bg-[#34d6c3]/10 text-[#60d9c7]">
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                          </div>
                          <div>
                            <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/30">
                              Source
                            </p>
                            <p className="mt-1 text-[12.5px] font-extrabold leading-[1.2] text-white/82">
                              {label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex min-h-[320px] items-center justify-center">
                  <div className="relative grid h-[225px] w-[225px] place-items-center rounded-full border border-[#b8f34a]/25 bg-[#0f1b16] shadow-[0_0_70px_rgba(184,243,74,0.10)]">
                    <span className="absolute left-[-7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#34d6c3]/50 bg-[#12312b] shadow-[0_0_14px_rgba(52,214,195,0.55)]" />
                    <span className="absolute right-[-7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#b8f34a]/55 bg-[#233516] shadow-[0_0_16px_rgba(184,243,74,0.55)]" />
                    <div className="absolute inset-[-18px] rounded-full border border-[#b8f34a]/10" />
                    <div className="absolute inset-[-38px] rounded-full border border-white/[0.045]" />
                    <div className="absolute left-1/2 top-[-10px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#b8f34a] shadow-[0_0_18px_rgba(184,243,74,0.7)]" />
                    <div className="absolute bottom-[26px] right-[-4px] h-2.5 w-2.5 rounded-full bg-[#34d6c3] shadow-[0_0_14px_rgba(52,214,195,0.7)]" />

                    <div className="text-center">
                      <div className="mx-auto flex w-fit items-center gap-1.5">
                        <span className="text-[32px] font-black tracking-[-0.07em] text-white">BRHT</span>
                        <span className="inline-flex -skew-x-12 gap-[2px]">
                          <span className="h-4 w-[7px] rounded-full bg-[#b8f34a]" />
                          <span className="mt-1 h-4 w-[7px] rounded-full bg-[#97e533]" />
                        </span>
                      </div>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b8f34a]">
                        Intelligence
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-[382px] lg:-ml-2">
                  <div className="overflow-hidden rounded-[24px] border border-[#9bd739]/40 bg-[#101b17] shadow-[0_0_54px_rgba(155,215,57,0.09)]">
                    <div className="border-b border-white/[0.08] px-5 py-4">
                      <div className="flex items-center justify-between gap-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b8f34a]">
                            BRHT CFO
                          </p>
                          <h3 className="mt-1 text-[28px] font-black leading-none text-white">
                            CFO Advisory
                          </h3>
                        </div>
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#b8f34a]/20 bg-[#b8f34a]/10 text-[#b8f34a]">
                          <Sparkles className="h-5 w-5 fill-current" />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-0">
                      {[
                        {
                          icon: LineChart,
                          kicker: "See ahead",
                          title: "Understand where the business is going.",
                          accent: "#60d9c7",
                        },
                        {
                          icon: Target,
                          kicker: "Weigh the tradeoffs",
                          title: "See the financial impact before you decide.",
                          accent: "#8ee468",
                        },
                        {
                          icon: Sparkles,
                          kicker: "Make the call",
                          title: "Turn insight into a confident next move.",
                          accent: "#b8f34a",
                        },
                      ].map(({ icon: Icon, kicker, title, accent }, index) => (
                        <div
                          key={kicker}
                          className={"relative flex items-center gap-4 px-5 py-3.5 " + (index !== 2 ? "border-b border-white/[0.07]" : "")}
                        >
                          <div
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border"
                            style={{
                              borderColor: accent + "55",
                              backgroundColor: accent + "14",
                              color: accent,
                            }}
                          >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                          </div>
                          <div>
                            <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/35">
                              {kicker}
                            </p>
                            <p className="mt-1 text-[12.5px] font-extrabold leading-[1.35] text-white/82">
                              {title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-7 hidden lg:block">
                <div className="absolute left-[12%] right-[10%] top-[7px] h-px bg-gradient-to-r from-[#34d6c3]/15 via-[#6edbc8]/35 to-[#b8f34a]/35" />
                <div className="relative grid grid-cols-[0.98fr_0.84fr_0.98fr] items-center gap-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
                  <div className="mx-auto flex items-center gap-2 bg-[#0a1512] px-3 text-[#65d7c5]/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34d6c3]" />
                    Connect
                  </div>
                  <div className="mx-auto flex items-center gap-2 bg-[#0a1512] px-3 text-white/38">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#86d973]" />
                    Understand
                  </div>
                  <div className="mx-auto flex items-center gap-2 bg-[#0a1512] px-3 text-[#b8f34a]/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b8f34a]" />
                    Decide
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 bg-[#f4f4ef] py-16 text-[#101714] md:py-20">
          <div className="mx-auto max-w-[1280px] px-5 md:px-8">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#557064]">
              Our process
            </p>
            <h2 className="text-4xl font-black tracking-[-0.045em] md:text-[52px]">
              A simple approach.
            </h2>

            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {process.map((step, i) => (
                <div key={step.number} className="relative pr-3 lg:pr-5">
                  {i < process.length - 1 && (
                    <div className="absolute left-[52px] right-[-12px] top-[21px] hidden h-[2px] bg-gradient-to-r from-[#b8f34a]/60 to-[#b8f34a]/20 lg:block" />
                  )}

                  <div className="relative flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b8f34a] text-[12px] font-black text-[#101714] shadow-[0_6px_18px_rgba(184,243,74,0.18)]">
                      {step.number}
                    </span>
                    <h3 className="text-[21px] font-black tracking-[-0.025em]">
                      {step.title}
                    </h3>
                  </div>

                  <p className="mt-6 max-w-[275px] text-[15px] leading-7 text-[#586760]">
                    {step.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="scroll-mt-24 border-t border-black/[0.05] bg-white py-20 text-[#101714]">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                  Real perspective. Real impact.
                </p>
                <h2 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
                  Operators are saying.
                </h2>
              </div>
              <div className="hidden gap-2 md:flex">
                <button className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-black/50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-black/50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map((item, i) => (
                <article key={i} className="rounded-xl border border-black/[0.07] bg-[#fbfbf9] p-6">
                  <div className="flex gap-1 text-[#9fdc38]" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-current" strokeWidth={1.6} />
                    ))}
                  </div>
                  <p className="mt-4 text-[13px] leading-6 text-[#4e5b55]">{item.quote}</p>
                  <div className="mt-7 flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full border border-black/[0.06] object-cover shadow-sm"
                    />
                    <div>
                      <p className="text-[12px] font-extrabold">{item.role}</p>
                      <p className="text-[10px] text-black/45">{item.company}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 relative overflow-hidden border-t border-white/[0.06] bg-[#07100e] py-20 text-white md:py-24">
          <div className="absolute left-1/2 top-0 h-72 w-[720px] -translate-x-1/2 rounded-full bg-[#b8f34a]/[0.045] blur-[110px]" />
          <div className="relative mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="text-center">
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#b8f34a]">
                Pricing
              </p>
              <h2 className="mx-auto max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-5xl">
                CFO Support.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[14px] leading-6 text-white/52">
                Start with the level of strategic finance support your business needs today. Scale the engagement as complexity grows.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {[
                {
                  name: "Advisory Core",
                  eyebrow: "Essential CFO guidance",
                  price: "$2,500",
                  suffix: "/ month",
                  description: "For growing businesses that need senior financial perspective without a full embedded CFO.",
                  features: [
                    "Monthly CFO strategy session",
                    "KPI and management reporting review",
                    "Cash flow and runway oversight",
                    "Quarterly forecast refresh",
                    "Async strategic finance support",
                  ],
                  featured: false,
                },
                {
                  name: "Growth CFO",
                  eyebrow: "Most popular",
                  price: "$4,500",
                  suffix: "/ month",
                  description: "For leadership teams that need an active CFO partner across planning, reporting and decision-making.",
                  features: [
                    "Bi-weekly CFO strategy sessions",
                    "Rolling forecasts and scenario planning",
                    "Management reporting and KPI design",
                    "Pricing and margin analysis",
                    "Finance systems guidance",
                    "Investor and lender support",
                  ],
                  featured: true,
                },
                {
                  name: "Embedded CFO",
                  eyebrow: "High-touch partnership",
                  price: "$7,500",
                  suffix: "/ month",
                  description: "For more complex companies that need senior finance deeply involved in the leadership rhythm.",
                  features: [
                    "Weekly CFO partnership",
                    "Leadership and board participation",
                    "Capital planning and strategic modeling",
                    "Board and investor reporting",
                    "Fundraising and transaction support",
                    "Priority strategic finance support",
                  ],
                  featured: false,
                },
              ].map((plan) => (
                <article
                  key={plan.name}
                  className={
                    "relative flex h-full flex-col rounded-[22px] border p-7 " +
                    (plan.featured
                      ? "border-[#9bd739]/70 bg-[#101d16] shadow-[0_0_55px_rgba(155,215,57,0.10)]"
                      : "border-white/[0.09] bg-[#0d1815]")
                  }
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-7 rounded-full bg-[#b8f34a] px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-[#07100e]">
                      Most popular
                    </div>
                  )}

                  <div>
                    <p
                      className={
                        "text-[10px] font-bold uppercase tracking-[0.2em] " +
                        (plan.featured ? "text-[#b8f34a]/75" : "text-white/36")
                      }
                    >
                      {plan.eyebrow}
                    </p>
                    <h3 className="mt-2 text-[24px] font-black tracking-[-0.03em] text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-4 min-h-[66px] text-[13px] leading-6 text-white/52">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-7 flex items-end gap-2 border-b border-white/[0.08] pb-7">
                    <span className="text-[42px] font-black leading-none tracking-[-0.045em] text-white">
                      {plan.price}
                    </span>
                    <span className="mb-1 text-[12px] font-semibold text-white/38">
                      {plan.suffix}
                    </span>
                  </div>

                  <div className="mt-7 flex-1 space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#b8f34a]/10 text-[11px] font-black text-[#b8f34a]">
                          ✓
                        </span>
                        <span className="text-[13px] leading-5 text-white/66">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={bookingHref}
                    className={
                      "mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-4 text-[13px] font-extrabold transition " +
                      (plan.featured
                        ? "bg-[#b8f34a] text-[#07100e] hover:bg-[#c5f760]"
                        : "border border-white/15 bg-white/[0.035] text-white hover:bg-white/[0.07]")
                    }
                  >
                    Book a Strategy Call <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>

            <p className="mt-7 text-center text-[11px] leading-5 text-white/32">
              Flexible monthly engagements. Final scope and pricing are tailored to your business, complexity and level of support required.
            </p>
          </div>
        </section>

        <CfoResourceLibrary />

        <section className="relative overflow-hidden border-t border-white/[0.07] bg-[#08110f] py-16">
          <div className="absolute -bottom-24 left-[-5%] h-56 w-96 rounded-full bg-lime-400/10 blur-[80px]" />
          <div className="absolute -right-14 top-6 h-44 w-80 rounded-full bg-lime-400/10 blur-[70px]" />
          <div className="relative mx-auto flex max-w-[1240px] flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.25em] text-lime-300/80">
                Let’s talk
              </p>
              <h2 className="max-w-2xl text-4xl font-black leading-[1.03] tracking-[-0.04em] md:text-5xl">
                The next decision.
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="mb-6 text-[13px] leading-6 text-white/55">
                A direct conversation about your numbers, systems, and what’s next for your business.
              </p>
              <a
                href={bookingHref}
                className="inline-flex items-center gap-2 rounded-md bg-lime-300 px-6 py-3.5 text-[13px] font-extrabold text-[#07100e] transition hover:bg-lime-200"
              >
                Book a Strategy Call <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] bg-[#07100e]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-8 text-[10px] text-white/45 md:flex-row md:items-center md:justify-between md:px-8">
          <BrhtLogo />
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <a href="/">BRHT Intelligence</a>
            <a href="#top">BRHT CFO</a>
            <a href="#resources">Resources</a>
            <a href="#how-it-works">How It Works</a>
            <a href={bookingHref}>Contact</a>
          </div>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
