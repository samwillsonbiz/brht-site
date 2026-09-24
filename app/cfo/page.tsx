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
  Target,
  Users,
  X,
} from "lucide-react";

const bookingHref =
  "mailto:samwillsonbiz@gmail.com?subject=BRHT%20CFO%20Strategy%20Call";

const services = [
  {
    icon: LineChart,
    title: "Financial Forecasting",
    copy: "Build accurate, driver-based forecasts to plan for growth, stress test scenarios and make confident decisions.",
  },
  {
    icon: Coins,
    title: "Cash Flow & Runway",
    copy: "Get real visibility into cash, understand key drivers, and plan for the road ahead.",
  },
  {
    icon: Gauge,
    title: "KPI & Management Reporting",
    copy: "Track the metrics that matter with clear, actionable reporting tailored to your business.",
  },
  {
    icon: FileBarChart2,
    title: "Board & Investor Reporting",
    copy: "Professional, board-ready reporting to support investors, lenders and key stakeholders.",
  },
  {
    icon: Target,
    title: "Pricing & Margin Analysis",
    copy: "Analyze margins, model pricing scenarios and find opportunities to increase profitability.",
  },
  {
    icon: CircleDollarSign,
    title: "Capital Planning & Fundraising Support",
    copy: "Build financial models, prepare investor materials and get strategic support for raising capital.",
  },
  {
    icon: Settings2,
    title: "Finance Systems & Data",
    copy: "Design and optimize your finance stack, integrate your data and create scalable reporting systems.",
  },
];

const process = [
  {
    number: "01",
    title: "Discover",
    icon: Search,
    copy: "We learn your business, goals and challenges, and assess your current financial systems and data.",
  },
  {
    number: "02",
    title: "Model",
    icon: BarChart3,
    copy: "We build tailored forecasts, reporting and scenario models based on your unique drivers.",
  },
  {
    number: "03",
    title: "Advise",
    icon: Lightbulb,
    copy: "We provide clear recommendations and strategic guidance to help you make better decisions.",
  },
  {
    number: "04",
    title: "Partner",
    icon: Users,
    copy: "We stay embedded as a long-term partner, helping you adapt, grow and navigate what’s next.",
  },
];

const testimonials = [
  {
    quote:
      "BRHT CFO gave us the clarity we needed to make faster, more confident decisions. Our forecasting and reporting are now on a completely different level.",
    role: "Founder",
    company: "Growth Company",
  },
  {
    quote:
      "The team quickly understood our business and built a reporting structure that actually helps us run the business. We finally have real visibility into cash and what’s next.",
    role: "CEO",
    company: "Ecommerce Brand",
  },
  {
    quote:
      "BRHT CFO has been an incredible strategic partner. They bring deep financial expertise, ask the right questions, and help us think through opportunities we wouldn’t have seen on our own.",
    role: "Operations Leader",
    company: "Multi-Channel Business",
  },
];

const resources = [
  {
    category: "FORECASTING",
    read: "8 MIN READ",
    title: "How to Build a 13-Week Cash Flow Forecast",
    art: "forecast",
  },
  {
    category: "REPORTING",
    read: "6 MIN READ",
    title: "What Your Monthly CFO Report Should Actually Include",
    art: "reporting",
  },
  {
    category: "SYSTEMS",
    read: "7 MIN READ",
    title: "Xero vs QuickBooks vs NetSuite: When to Use Each",
    art: "systems",
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
      <g opacity="0.11" stroke="#15231f">
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
      <g fill="#6f7d78" fontSize="8.6" fontWeight="600">
        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map((m, i) => (
          <text key={m} x={18 + i * 32} y="102">{m}</text>
        ))}
      </g>
      <g transform="translate(150,90)" fontSize="9.3" fontWeight="700">
        <circle cx="0" cy="0" r="4" fill="#25b9aa" />
        <text x="10" y="3" fill="#62716c">Actual</text>
        <circle cx="62" cy="0" r="4" fill="#9fdc38" />
        <text x="72" y="3" fill="#62716c">Forecast</text>
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
      <g opacity="0.11" stroke="#15231f">
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
  const card = "rounded-[16px] border border-[#cbd6cf] bg-[#eef2ee] shadow-[0_10px_26px_rgba(0,0,0,0.06)]";
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
        <div className={card + " min-h-[166px] p-4"}>
          <p className="text-[12px] font-semibold text-[#5e6b66]">Revenue vs Forecast</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-[25px] font-black leading-none text-[#101b17]">$2.4M</span>
            <span className="rounded-full bg-[#e8f7e4] px-2.5 py-1 text-[12px] font-bold text-[#27833b]">↑ 12%</span>
          </div>
          <DualLineChart />
        </div>

        <div className={card + " min-h-[166px] p-4"}>
          <p className="text-[12px] font-semibold text-[#5e6b66]">Gross Margin</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-[25px] font-black leading-none text-[#101b17]">68%</span>
            <span className="rounded-full bg-[#e2f5f1] px-2.5 py-1 text-[12px] font-bold text-[#168f82]">↑ 6%</span>
          </div>
          <AreaChart />
        </div>

        <div className={card + " h-[92px] p-4"}>
          <div className="grid h-full grid-cols-[0.9fr_1.1fr] items-end gap-4">
            <div className="self-start">
              <p className="text-[12px] font-semibold text-[#5e6b66]">Cash Runway</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[25px] font-black leading-none text-[#101b17]">14</span>
                <span className="mb-0.5 text-[12px] font-medium text-[#5e6b66]">months</span>
              </div>
            </div>
            <BarChart compact values={[34,45,56,70,62,80,88,100]} />
          </div>
        </div>

        <div className={card + " h-[92px] p-4"}>
          <div className="grid h-full grid-cols-[0.78fr_1.22fr] items-end gap-4">
            <div className="self-start">
              <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#5e6b66]">Operating Cash Flow</p>
              <div className="mt-3 text-[25px] font-black leading-none text-[#101b17]">$412K</div>
            </div>
            <BarChart compact values={[12,22,28,44,56,60,74,92]} />
          </div>
        </div>

        <div className={card + " min-h-[150px] p-4"}>
          <p className="mb-4 text-[12px] font-semibold text-[#5e6b66]">Scenario Planning</p>
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
                <span className="font-medium text-[#25312d]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[150px] rounded-[16px] border border-[#9bd739] bg-[#f2f7e9] p-4 shadow-[0_10px_26px_rgba(116,155,55,0.08)]">
          <div className="mb-3 flex items-center gap-3 text-[#6f9f19]">
            <Sparkles className="h-5 w-5 fill-current" />
            <span className="text-[14px] font-extrabold">BRHT AI Insights</span>
          </div>
          <div className="space-y-2.5 text-[12px] leading-5 text-[#58645f]">
            {[
              "Revenue is pacing 12% ahead of plan.",
              "Consider increasing inventory for Q4.",
              "Your runway could extend to 22 months with the proposed pricing change.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1.5 grid h-4 w-4 place-items-center rounded-full border border-[#25b9aa]/50 text-[9px] text-[#25b9aa]">●</span>
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

function ResourceArtwork({ type }: { type: string }) {
  if (type === "systems") {
    return (
      <div className="flex h-36 items-center justify-center gap-4 bg-[#111b1a]">
        {["X", "qb", "N"].map((x, i) => (
          <div
            key={x}
            className={`grid h-12 w-12 place-items-center rounded-full text-sm font-black text-white shadow-xl ${
              i === 0 ? "bg-sky-500" : i === 1 ? "bg-lime-500" : "bg-slate-600"
            }`}
          >
            {x}
          </div>
        ))}
      </div>
    );
  }
  if (type === "reporting") {
    return (
      <div className="relative h-36 overflow-hidden bg-[#101817] p-5">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative ml-auto mt-4 w-4/5 rounded-lg border border-white/10 bg-[#0a1110] p-3">
          <AreaChart />
          <div className="mt-1 flex gap-1">
            {[20, 36, 27, 48, 40, 62, 52].map((h, i) => (
              <span
                key={i}
                className="w-full rounded-t bg-lime-300/70"
                style={{ height: h / 2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-36 overflow-hidden bg-gradient-to-b from-[#283b3a] to-[#0b1312]">
      <svg viewBox="0 0 500 180" className="absolute inset-0 h-full w-full">
        <path d="M0 150 L70 90 L120 115 L180 62 L230 104 L300 48 L360 82 L430 36 L500 74 L500 180 L0 180Z" fill="#172623" />
        <path d="M0 160 L82 110 L150 138 L220 82 L290 122 L355 70 L420 112 L500 68 L500 180 L0 180Z" fill="#0d1816" />
        <polyline points="20,140 90,125 145,132 205,100 260,108 320,76 385,84 465,48" fill="none" stroke="#9cff3b" strokeWidth="4" />
      </svg>
    </div>
  );
}

export default function CfoPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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

          <nav className="hidden items-center gap-10 text-[12px] font-semibold text-white/70 md:flex">
            <a className="border-b border-lime-300 pb-1 text-lime-300" href="#services">
              CFO Advisory
            </a>
            <a className="transition hover:text-white" href="#resources">Resources</a>
            <a className="transition hover:text-white" href="#about">About</a>
            <a className="transition hover:text-white" href="/">BRHT Intelligence</a>
          </nav>

          <a
            href={bookingHref}
            className="hidden items-center gap-2 rounded-[12px] bg-[#b8f34a] px-7 py-4 text-[13px] font-extrabold text-[#09110f] shadow-[0_0_34px_rgba(184,243,74,0.12)] transition hover:bg-[#c5f760] md:inline-flex"
          >
            Book a Strategy Call <ArrowRight className="h-4 w-4" />
          </a>

          <button
            aria-label="Toggle menu"
            className="rounded-md border border-white/10 p-2 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-5 py-4 md:hidden">
            <div className="grid gap-3 text-sm text-white/75">
              <a href="#services" onClick={() => setMenuOpen(false)}>CFO Advisory</a>
              <a href="#resources" onClick={() => setMenuOpen(false)}>Resources</a>
              <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
              <a href="/" onClick={() => setMenuOpen(false)}>BRHT Intelligence</a>
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

        <section id="services" className="bg-[#f4f4ef] py-20 text-[#101714] md:py-24">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                  Our services
                </p>
                <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-5xl">
                  Strategic finance, not just financial reporting.
                </h2>
              </div>
              <p className="max-w-md text-[14px] leading-6 text-[#5a6660] lg:justify-self-end">
                We help growing companies turn financial data into a strategic advantage — with the insights, systems and guidance to make better decisions at every stage.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.title}
                    className="group min-h-[220px] rounded-xl border border-black/[0.06] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,20,0.025)] transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,20,0.07)]"
                  >
                    <div className="flex items-start justify-between">
                      <Icon className="h-7 w-7 text-[#1e7b69]" strokeWidth={1.8} />
                      <ArrowRight className="h-4 w-4 text-black/55 transition group-hover:translate-x-1" />
                    </div>
                    <h3 className="mt-7 text-[16px] font-extrabold leading-5">{service.title}</h3>
                    <p className="mt-3 text-[12px] leading-5 text-[#626d68]">{service.copy}</p>
                  </article>
                );
              })}
              <article className="min-h-[220px] rounded-xl border border-lime-300/40 bg-gradient-to-br from-white to-lime-100 p-6">
                <div className="mb-7 h-0.5 w-8 bg-lime-400" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#53655d]">
                  Not bookkeeping.
                  <span className="mt-2 block">A strategic partner.</span>
                </p>
                <p className="mt-5 text-[12px] leading-5 text-[#53655d]">
                  We focus on forward-looking insights and decision support — not bookkeeping, payroll or tax compliance.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="about" className="relative overflow-hidden border-y border-white/[0.06] bg-[#08120f] py-20 md:py-24">
          <div className="absolute -bottom-20 right-[-8%] h-52 w-96 rounded-full bg-lime-400/10 blur-[70px]" />
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-lime-300/80">
                  Built to work together
                </p>
                <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-5xl">
                  From connected data to better decisions.
                </h2>
              </div>
              <p className="max-w-md text-[14px] leading-6 text-white/58 lg:justify-self-end">
                BRHT Intelligence centralizes your operational and financial data. BRHT CFO turns that data into strategic insights, forecasts and guidance — so you can move faster with confidence.
              </p>
            </div>

            <div className="mt-12 grid items-center gap-5 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr]">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-7">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-lime-300/10 text-lime-300">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">BRHT Intelligence</h3>
                    <p className="mt-1 text-[12px] text-white/50">Connect your data.<br />See what’s happening.</p>
                  </div>
                </div>
              </div>

              <ArrowRight className="mx-auto hidden h-6 w-6 text-white/55 lg:block" />

              <div className="relative overflow-hidden rounded-xl border border-white/12 bg-[#0c1714] px-6 py-8 text-center">
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300/10 blur-xl" />
                <div className="relative">
                  <p className="text-xs font-bold text-lime-300">Data → Insight → Decision</p>
                  <div className="mx-auto my-5 flex w-fit">
                    {[0,1,2].map((i) => (
                      <span key={i} className="-ml-2 h-11 w-11 rounded-full border border-lime-300/30 bg-lime-300/[0.04] first:ml-0" />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/50">A complete view of your business.</p>
                </div>
              </div>

              <ArrowRight className="mx-auto hidden h-6 w-6 text-white/55 lg:block" />

              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-7">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-lime-300/10 text-lime-300">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">BRHT CFO</h3>
                    <p className="mt-1 text-[12px] text-white/50">Interpret the numbers.<br />Know what to do next.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f4f4ef] py-20 text-[#101714] md:py-24">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
              Our process
            </p>
            <h2 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
              A simple, proven approach.
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {process.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative pr-5">
                    {i < process.length - 1 && (
                      <div className="absolute left-10 right-0 top-4 hidden h-px bg-lime-300/45 lg:block" />
                    )}
                    <div className="relative flex items-center gap-4">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-lime-300 text-[10px] font-black">
                        {step.number}
                      </span>
                      <h3 className="text-[15px] font-extrabold">{step.title}</h3>
                    </div>
                    <Icon className="ml-1 mt-7 h-6 w-6 text-[#1e7b69]" strokeWidth={1.8} />
                    <p className="mt-4 max-w-[230px] text-[12px] leading-5 text-[#65716b]">
                      {step.copy}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-black/[0.05] bg-white py-20 text-[#101714]">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                  Real perspective. Real impact.
                </p>
                <h2 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
                  What operators are saying.
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
                  <div className="text-3xl leading-none text-[#1e9b7c]">“</div>
                  <p className="mt-2 text-[13px] leading-6 text-[#4e5b55]">{item.quote}</p>
                  <div className="mt-7 flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dfe7e1] text-[11px] font-bold">
                      {item.role.split(" ").map((x) => x[0]).join("").slice(0,2)}
                    </div>
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

        <section id="resources" className="border-t border-black/[0.05] bg-[#f6f6f1] py-20 text-[#101714]">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                  The BRHT CFO Resource Library
                </p>
                <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-5xl">
                  Practical resources for building a stronger business.
                </h2>
              </div>
              <p className="max-w-md text-[13px] leading-6 text-[#5d6963] lg:justify-self-end">
                Guides, templates and insights on forecasting, reporting, finance systems and more. Everything you need to solve your biggest financial questions.
              </p>
            </div>

            <div className="mt-9 flex overflow-hidden rounded-lg border border-black/10 bg-white">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-4 w-4 text-black/40" />
                <span className="text-[12px] text-black/40">What are you trying to solve?</span>
              </div>
              <button className="inline-flex items-center gap-2 bg-lime-300 px-6 py-3 text-[12px] font-extrabold">
                Search <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {["Cash Flow", "Forecasting", "Reporting", "KPIs", "Finance Systems", "Fundraising", "Accounting"].map((tag) => (
                <span key={tag} className="rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-semibold text-black/60">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {resources.map((item) => (
                <article key={item.title} className="group overflow-hidden rounded-xl border border-black/[0.08] bg-white">
                  <ResourceArtwork type={item.art} />
                  <div className="p-5">
                    <div className="flex gap-3 text-[9px] font-bold uppercase tracking-[0.12em] text-black/38">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.read}</span>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-5">
                      <h3 className="text-[16px] font-extrabold leading-5">{item.title}</h3>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-white/[0.07] bg-[#08110f] py-16">
          <div className="absolute -bottom-24 left-[-5%] h-56 w-96 rounded-full bg-lime-400/10 blur-[80px]" />
          <div className="absolute -right-14 top-6 h-44 w-80 rounded-full bg-lime-400/10 blur-[70px]" />
          <div className="relative mx-auto flex max-w-[1240px] flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.25em] text-lime-300/80">
                Let’s talk
              </p>
              <h2 className="max-w-2xl text-4xl font-black leading-[1.03] tracking-[-0.04em] md:text-5xl">
                Make the next decision with better financial clarity.
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
            <a href="#about">About</a>
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
