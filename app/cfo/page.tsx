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
import BookingModal from "@/components/BookingModal";
import { openBrhtBooking } from "@/lib/booking";

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
    id: "capital-planning",
    icon: CircleDollarSign,
    title: "Capital Planning & Fundraising Support",
    copy: "Build financial models, prepare investor materials and get strategic support for raising capital.",
  },
  {
    id: "board-reporting",
    icon: FileBarChart2,
    title: "Board & Investor Reporting",
    copy: "Professional, board-ready reporting to support investors, lenders and key stakeholders.",
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

          <button
            type="button"
            onClick={openBrhtBooking}
            className="hidden items-center gap-2 rounded-[12px] bg-[#b8f34a] px-6 py-3.5 text-[12.5px] font-extrabold text-[#09110f] shadow-[0_0_34px_rgba(184,243,74,0.12)] transition hover:bg-[#c5f760] lg:inline-flex"
          >
            Talk to a CFO <ArrowRight className="h-4 w-4" />
          </button>

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
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openBrhtBooking();
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-lime-300 px-4 py-3 font-bold text-[#07100e]"
              >
                Talk to a CFO <ArrowRight className="h-4 w-4" />
              </button>
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
                  For growing companies that need more than bookkeeping and historical reporting, but don’t need a full-time CFO. Get the forecasting, financial visibility and senior guidance to make better decisions.
                </p>
                <div className="mt-9">
                  <button
                    type="button"
                    onClick={openBrhtBooking}
                    className="inline-flex items-center gap-2 rounded-[14px] bg-[#b8f34a] px-8 py-5 text-[15px] font-extrabold text-[#09110f] shadow-[0_0_28px_rgba(184,243,74,0.12)] transition hover:bg-[#c5f760]"
                  >
                    Talk to a CFO <ArrowRight className="h-5 w-5" />
                  </button>
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

        <section id="team" className="border-t border-black/[0.05] bg-white py-20 text-[#101714] md:py-24">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                  Who is BRHT CFO
                </p>
                <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-5xl">
                  <span className="block text-[#101714]">Real people.</span>
                  <span className="block text-[#1e7b69]">Senior finance.</span>
                </h2>
              </div>
              <p className="max-w-md text-[14px] leading-6 text-[#5a6660] lg:justify-self-end">
                BRHT CFO is a human advisory team, not an AI CFO app. Technology makes the work faster; experienced operators and finance leaders own the models, recommendations and conversations.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <article className="group overflow-hidden rounded-2xl border border-black/[0.07] bg-[#f7f8f5] shadow-[0_10px_35px_rgba(15,23,20,0.025)]">
                <div className="relative h-[235px] overflow-hidden bg-[#10201b]">
                  <img
                    src="https://unavatar.io/linkedin/user:brennan-roney"
                    alt="Brennan Roney"
                    className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b1513]/65 to-transparent" />
                  <a
                    href="https://www.linkedin.com/in/brennan-roney"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Brennan Roney on LinkedIn"
                    className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-[#0b1513]/75 text-white backdrop-blur transition hover:bg-[#b8f34a] hover:text-[#10201b]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M6.5 8.3H3.2V21h3.3V8.3ZM4.85 3C3.79 3 3 3.79 3 4.82c0 1.02.77 1.82 1.81 1.82h.02c1.09 0 1.86-.8 1.86-1.82C6.67 3.79 5.92 3 4.85 3ZM21 13.72c0-3.83-2.04-5.61-4.76-5.61-2.19 0-3.17 1.2-3.72 2.05V8.3H9.2c.04 1.23 0 12.7 0 12.7h3.32v-7.09c0-.38.03-.76.14-1.03.24-.76.8-1.55 1.74-1.55 1.23 0 1.72.94 1.72 2.31V21H21v-7.28Z" />
                    </svg>
                  </a>
                </div>
                <div className="p-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#658077]">
                    CFO & Strategic Finance
                  </p>
                  <h3 className="mt-2 text-[24px] font-black tracking-[-0.035em]">
                    Brennan Roney
                  </h3>
                  <p className="mt-4 text-[13px] leading-6 text-[#617069]">
                    Finance leader with 15+ years across strategic finance, CFO leadership, FP&amp;A and growth-stage operations. Brennan specializes in forward planning, capital decisions and turning financial complexity into clear executive action.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-black/[0.06] pt-5">
                    <div>
                      <p className="text-[18px] font-black text-[#1e7b69]">15+</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Years</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-[#1e7b69]">CFO</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Leadership</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-[#1e7b69]">FP&amp;A</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Planning</p>
                    </div>
                  </div>
                </div>
              </article>

              <article className="group overflow-hidden rounded-2xl border border-black/[0.07] bg-[#f7f8f5] shadow-[0_10px_35px_rgba(15,23,20,0.025)]">
                <div className="relative h-[235px] overflow-hidden bg-[#10201b]">
                  <img
                    src="https://unavatar.io/linkedin/user:samwillson84"
                    alt="Sam Willson"
                    className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b1513]/65 to-transparent" />
                  <a
                    href="https://www.linkedin.com/in/samwillson84"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Sam Willson on LinkedIn"
                    className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-[#0b1513]/75 text-white backdrop-blur transition hover:bg-[#b8f34a] hover:text-[#10201b]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M6.5 8.3H3.2V21h3.3V8.3ZM4.85 3C3.79 3 3 3.79 3 4.82c0 1.02.77 1.82 1.81 1.82h.02c1.09 0 1.86-.8 1.86-1.82C6.67 3.79 5.92 3 4.85 3ZM21 13.72c0-3.83-2.04-5.61-4.76-5.61-2.19 0-3.17 1.2-3.72 2.05V8.3H9.2c.04 1.23 0 12.7 0 12.7h3.32v-7.09c0-.38.03-.76.14-1.03.24-.76.8-1.55 1.74-1.55 1.23 0 1.72.94 1.72 2.31V21H21v-7.28Z" />
                    </svg>
                  </a>
                </div>
                <div className="p-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#658077]">
                    Growth & Operations
                  </p>
                  <h3 className="mt-2 text-[24px] font-black tracking-[-0.035em]">
                    Sam Willson
                  </h3>
                  <p className="mt-4 text-[13px] leading-6 text-[#617069]">
                    Growth and operations executive with 20+ years building businesses across CEO, chief growth, chief operations, general manager and managing partner roles. Sam has helped drive four successful business growth stories and served more than 400 businesses.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-black/[0.06] pt-5">
                    <div>
                      <p className="text-[18px] font-black text-[#1e7b69]">20+</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Years</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-[#1e7b69]">4</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Growth stories</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-[#1e7b69]">400+</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Businesses</p>
                    </div>
                  </div>
                </div>
              </article>

              <article className="group overflow-hidden rounded-2xl border border-[#a9da58]/55 bg-[#10201b] text-white shadow-[0_10px_35px_rgba(15,23,20,0.08)]">
                <div className="relative h-[235px] overflow-hidden bg-[#0b1513]">
                  <img
                    src="data:image/jpeg;base64,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"
                    alt="AI-generated placeholder portrait for Steve Johnson"
                    className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b1513]/80 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-[#b8f34a]/30 bg-[#0b1513]/80 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.13em] text-[#b8f34a] backdrop-blur">
                    Placeholder advisor profile
                  </span>
                </div>
                <div className="p-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b8f34a]/75">
                    FP&amp;A & Finance Strategy
                  </p>
                  <h3 className="mt-2 text-[24px] font-black tracking-[-0.035em]">
                    Steve Johnson
                  </h3>
                  <p className="mt-4 text-[13px] leading-6 text-white/62">
                    Illustrative advisor profile with 18+ years across FP&amp;A, divisional finance leadership and CFO advisory. The placeholder background includes operating models, board planning, pricing analysis and capital strategy for scaling companies.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-5">
                    <div>
                      <p className="text-[18px] font-black text-[#b8f34a]">18+</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-white/35">Years</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-[#b8f34a]">FP&amp;A</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-white/35">Leadership</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-[#b8f34a]">CFO</p>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-white/35">Advisory</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <p className="mt-5 text-[10px] leading-5 text-[#7b8781]">
              Steve Johnson is an AI-generated placeholder profile for design review and should be replaced with a real advisor before public use.
            </p>
          </div>
        </section>

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
                Your CFO investment.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-6 text-white/52">
                Senior CFO guidance without the cost or commitment of a full-time CFO. Choose the level of support that fits your business today.
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

                  <button
                    type="button"
                    onClick={openBrhtBooking}
                    className={
                      "mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-4 text-[13px] font-extrabold transition " +
                      (plan.featured
                        ? "bg-[#b8f34a] text-[#07100e] hover:bg-[#c5f760]"
                        : "border border-white/15 bg-white/[0.035] text-white hover:bg-white/[0.07]")
                    }
                  >
                    Talk to a CFO <ArrowRight className="h-4 w-4" />
                  </button>
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
              <button
                type="button"
                onClick={openBrhtBooking}
                className="inline-flex items-center gap-2 rounded-md bg-lime-300 px-6 py-3.5 text-[13px] font-extrabold text-[#07100e] transition hover:bg-lime-200"
              >
                Talk to a CFO <ArrowRight className="h-4 w-4" />
              </button>
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
            <button type="button" onClick={openBrhtBooking} className="text-left">Contact</button>
          </div>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </footer>
      <BookingModal />
    </div>
  );
}
