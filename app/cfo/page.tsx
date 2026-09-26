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
