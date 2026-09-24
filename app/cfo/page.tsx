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
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <span className="text-[27px] font-black tracking-[-0.055em] text-white">
          BRHT
        </span>
        <span className="ml-1 inline-flex -skew-x-12 gap-[2px]">
          <span className="h-3 w-1.5 rounded-sm bg-lime-300" />
          <span className="mt-1 h-3 w-1.5 rounded-sm bg-lime-400" />
        </span>
      </div>
      {cfo && (
        <>
          <span className="h-5 w-px bg-white/20" />
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300">
            CFO
          </span>
        </>
      )}
    </div>
  );
}

function MiniLine({ up = true }: { up?: boolean }) {
  const points = up
    ? "2,32 18,27 34,29 50,18 66,22 82,13 98,16 114,8"
    : "2,13 18,18 34,15 50,23 66,20 82,27 98,24 114,31";
  return (
    <svg viewBox="0 0 116 38" className="h-10 w-full">
      <polyline
        points={points}
        fill="none"
        stroke="#9cff3b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.split(" ").map((p, i) => {
        const [cx, cy] = p.split(",");
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="2"
            fill="#9cff3b"
            opacity={i === 7 ? 1 : 0.6}
          />
        );
      })}
    </svg>
  );
}

function Dashboard() {
  const bars = [26, 34, 29, 42, 38, 51, 46, 61, 56, 72];
  return (
    <div className="relative rounded-[22px] border border-white/[0.09] bg-[#0d1714]/95 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Financial Overview
        </p>
        <span className="rounded-md border border-white/10 px-2 py-1 text-[9px] text-white/50">
          Last 12 months
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-white/[0.075] bg-white/[0.03] p-4">
          <p className="text-[10px] text-white/55">Revenue vs Forecast</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-bold">$2.4M</span>
            <span className="mb-1 text-[10px] font-bold text-lime-300">↑ 12%</span>
          </div>
          <MiniLine />
        </div>

        <div className="rounded-xl border border-white/[0.075] bg-white/[0.03] p-4">
          <p className="text-[10px] text-white/55">Cash Runway</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-bold">14</span>
            <span className="mb-1 text-xs text-white/60">months</span>
          </div>
          <div className="mt-4 flex h-10 items-end gap-1.5">
            {bars.slice(0, 8).map((h, i) => (
              <span
                key={i}
                className="w-full rounded-t-sm bg-gradient-to-t from-emerald-800 to-emerald-300"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.075] bg-white/[0.03] p-4">
          <p className="text-[10px] text-white/55">Gross Margin</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-bold">68%</span>
            <span className="mb-1 text-[10px] font-bold text-lime-300">↑ 6%</span>
          </div>
          <MiniLine />
        </div>

        <div className="rounded-xl border border-white/[0.075] bg-white/[0.03] p-4">
          <p className="text-[10px] text-white/55">Operating Cash Flow</p>
          <div className="mt-1 text-2xl font-bold">$412K</div>
          <div className="mt-4 flex h-10 items-end gap-1.5">
            {bars.slice(2).map((h, i) => (
              <span
                key={i}
                className="w-full rounded-t-sm bg-gradient-to-t from-emerald-900 to-teal-300"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.075] bg-white/[0.03] p-4">
          <p className="mb-3 text-[10px] text-white/55">Scenario Planning</p>
          {[
            ["Base Case", "14 months", "bg-teal-300"],
            ["Growth Case", "22 months", "bg-lime-300"],
            ["Downside Case", "6 months", "bg-amber-300"],
          ].map(([a, b, dot]) => (
            <div key={a} className="mb-2 flex items-center justify-between text-[9px]">
              <span className="flex items-center gap-2 text-white/60">
                <i className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {a}
              </span>
              <span className="text-white/80">{b}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-lime-300/45 bg-lime-300/[0.045] p-4 shadow-[0_0_40px_rgba(163,230,53,0.08)]">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold text-lime-300">
            <span className="text-sm">✦</span>
            BRHT AI Insights
          </div>
          <div className="space-y-2.5 text-[9px] leading-4 text-white/62">
            <p>● Revenue is pacing 12% ahead of plan.</p>
            <p>● Consider increasing inventory for Q4.</p>
            <p>● Runway could extend to 22 months with the proposed pricing change.</p>
          </div>
        </div>
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
          <MiniLine />
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
    <div\n      className="min-h-screen bg-[#07100e] text-white selection:bg-lime-300 selection:text-[#07100e]"\n      style={{ fontFamily: "var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif" }}\n    >
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07100e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-3.5 md:px-8">
          <a href="#top" aria-label="BRHT CFO home">
            <BrhtLogo cfo />
          </a>

          <nav className="hidden items-center gap-8 text-[12px] font-semibold text-white/70 md:flex">
            <a className="border-b border-lime-300 pb-1 text-lime-300" href="#services">
              CFO Advisory
            </a>
            <a className="transition hover:text-white" href="#resources">Resources</a>
            <a className="transition hover:text-white" href="#about">About</a>
            <a className="transition hover:text-white" href="/">BRHT Intelligence</a>
          </nav>

          <a
            href={bookingHref}
            className="hidden items-center gap-2 rounded-md bg-lime-300 px-5 py-3 text-[12px] font-extrabold text-[#07100e] shadow-[0_0_30px_rgba(163,230,53,0.18)] transition hover:bg-lime-200 md:inline-flex"
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
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(132,204,22,0.09),transparent_32%),radial-gradient(circle_at_15%_25%,rgba(16,185,129,0.06),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-70">
            <svg viewBox="0 0 1600 260" preserveAspectRatio="none" className="h-full w-full">
              <path d="M0 220 L100 160 L180 192 L270 138 L355 182 L445 126 L520 168 L620 104 L720 160 L820 118 L930 174 L1010 136 L1110 178 L1210 112 L1310 150 L1410 104 L1600 174 L1600 260 L0 260Z" fill="#0c1714" />
              <path d="M0 240 L130 190 L260 220 L380 168 L500 216 L650 158 L790 212 L930 164 L1060 214 L1190 160 L1320 208 L1450 154 L1600 205 L1600 260 L0 260Z" fill="#09120f" />
              <path d="M0 220 L100 160 L180 192 L270 138 L355 182 L445 126 L520 168 L620 104 L720 160 L820 118 L930 174 L1010 136 L1110 178 L1210 112 L1310 150 L1410 104 L1600 174" fill="none" stroke="#2b4038" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-24 pt-14 md:px-8 md:pb-28 md:pt-16 lg:grid-cols-[0.90fr_1.10fr] lg:gap-14">
            <div className="max-w-[560px]">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
                Strategic finance for operators
              </p>
              <h1 className="text-[46px] font-black leading-[0.99] tracking-[-0.055em] sm:text-[56px] lg:text-[64px] xl:text-[68px]">
                See the numbers.
                <span className="mt-2 block text-lime-300">Know what to do next.</span>
              </h1>
              <p className="mt-6 max-w-[520px] text-[15px] leading-7 text-white/66">
                BRHT CFO provides outsourced CFO advisory for growing companies that need clearer financial insights, stronger forecasting, and a strategic partner to help make better decisions.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <a
                  href={bookingHref}
                  className="inline-flex items-center gap-2 rounded-md bg-lime-300 px-6 py-3.5 text-[13px] font-extrabold text-[#07100e] shadow-[0_0_28px_rgba(163,230,53,0.15)] transition hover:bg-lime-200"
                >
                  Book a Strategy Call <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#resources"
                  className="inline-flex items-center gap-2 border-b border-white/35 pb-1 text-[13px] font-semibold text-white/80 transition hover:text-white"
                >
                  Explore CFO Resources <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-6 text-[11px] font-medium text-white/42">
                Strategic. Data-driven. Built for operators.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-12 rounded-full bg-lime-300/[0.035] blur-3xl" />
              <div className="relative">
                <Dashboard />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] bg-[#08110f]">
          <div className="mx-auto grid max-w-[1240px] divide-y divide-white/10 px-5 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-8">
            {[
              [LineChart, "Forward-looking forecasts", "Go beyond the numbers and see what’s next."],
              [FileBarChart2, "Board-ready reporting", "Clear, concise reporting for confident decisions."],
              [Coins, "Cash visibility", "Know your runway and key drivers in real time."],
              [Users, "Senior strategic finance", "Experienced CFO advisors invested in your success."],
            ].map(([Icon, title, copy]) => {
              const I = Icon as React.ElementType;
              return (
                <div key={title as string} className="flex gap-4 py-7 md:px-6 first:md:pl-0">
                  <I className="mt-1 h-6 w-6 shrink-0 text-lime-300" />
                  <div>
                    <h3 className="text-sm font-bold">{title as string}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-white/50">{copy as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
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
