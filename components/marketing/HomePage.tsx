"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleDollarSign,
  Code2,
  Database,
  Eye,
  Gauge,
  Globe2,
  Layers3,
  LineChart,
  Mail,
  Menu,
  Network,
  PackageCheck,
  Plug,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";

const EMAIL_TO = "samwillsonbiz@gmail.com";

export type HomeDemoData = {
  revenue: number;
  adSpend: number;
  orders: number;
  units: number;
  healthySources: number;
  revenueChannels: Array<{ name: string; revenue: number }>;
  inventoryProducts: Array<{
    name: string;
    available: number | null;
    daysOfCover: number | null;
  }>;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const nav = [
  ["The system", "#system"],
  ["Live proof", "#proof"],
  ["Why BRHT", "#why-brht"],
  ["Process", "#process"],
  ["Pricing", "#pricing"],
] as const;

const sources = [
  { name: "Shopify", logo: "/logos/Shopify.svg" },
  { name: "Amazon", logo: "/logos/Amazon.svg" },
  { name: "Meta", logo: "/logos/Meta.svg" },
  { name: "Google Ads", logo: "/logos/Googleads.svg" },
  { name: "Kickstarter", text: "K" },
  { name: "BackerKit", text: "B" },
];

const platformLayers = [
  {
    step: "01",
    eyebrow: "Connect",
    title: "Your tools stay where they are.",
    body: "Commerce, ads, marketplaces, crowdfunding, finance, CRM, fulfilment and internal data keep doing their jobs. BRHT connects to them instead of forcing a platform migration.",
    icon: Plug,
  },
  {
    step: "02",
    eyebrow: "Normalize",
    title: "One source of truth underneath.",
    body: "Raw feeds are cleaned, deduplicated and stored in a proper data layer. Revenue means revenue. Inventory means inventory. Every metric gets a consistent definition.",
    icon: Database,
  },
  {
    step: "03",
    eyebrow: "Model",
    title: "Business logic becomes software.",
    body: "We encode the calculations that matter to your business—blended ROAS, stock cover, campaign revenue, channel economics, operating KPIs and exceptions.",
    icon: Network,
  },
  {
    step: "04",
    eyebrow: "Experience",
    title: "The data becomes a product.",
    body: "Instead of another reporting portal, your team gets a fast, branded web experience on your domain—with dashboards, workflows and AI designed around how you actually operate.",
    icon: Globe2,
  },
];

const pillars = [
  {
    label: "SEE",
    title: "Business intelligence",
    text: "Live operating views that connect revenue, marketing, product, inventory and finance without spreadsheet archaeology.",
    icon: Eye,
    accent: "from-cyan-300/30 to-blue-400/10",
  },
  {
    label: "MOVE",
    title: "Workflow automation",
    text: "Turn recurring checks, alerts, reports and handoffs into reliable workflows that run without someone remembering to do them.",
    icon: Workflow,
    accent: "from-lime-300/25 to-emerald-400/10",
  },
  {
    label: "THINK",
    title: "AI operational intelligence",
    text: "Give AI structured business context so it can explain changes, surface risk, summarize performance and recommend the next action.",
    icon: BrainCircuit,
    accent: "from-violet-300/25 to-fuchsia-400/10",
  },
];

const comparisonRows = [
  {
    label: "Connect and model business data",
    brht: "Yes",
    power: "Yes",
  },
  {
    label: "Interactive dashboards and KPI views",
    brht: "Yes",
    power: "Yes",
  },
  {
    label: "Lives natively on your own website/domain",
    brht: "Built for it",
    power: "Possible via embedding",
  },
  {
    label: "Fully custom product UX",
    brht: "Unlimited",
    power: "Platform-defined",
  },
  {
    label: "Per-viewer BRHT licence",
    brht: "None",
    power: "Often licence/capacity dependent",
  },
  {
    label: "Operational actions + custom workflows",
    brht: "Native design goal",
    power: "Usually via surrounding Microsoft stack",
  },
  {
    label: "Self-service drag-and-drop analytics",
    brht: "Custom-built",
    power: "Excellent",
  },
  {
    label: "Enterprise BI governance out of the box",
    brht: "Designed per engagement",
    power: "Excellent",
  },
];

const process = [
  {
    n: "01",
    title: "Map the business",
    text: "We identify the decisions that matter, the systems creating data, the definitions people disagree on, and the manual work slowing the team down.",
  },
  {
    n: "02",
    title: "Build the data foundation",
    text: "Sources connect into a normalized warehouse with reliable schemas, source health, refresh logic and definitions that can survive beyond a spreadsheet.",
  },
  {
    n: "03",
    title: "Ship the operating layer",
    text: "We build the dashboard, alerts, workflows and AI interfaces around the exact roles and decisions your business needs—not a generic report pack.",
  },
  {
    n: "04",
    title: "Keep improving it",
    text: "New sources, new questions and new processes plug into the same foundation. The system compounds instead of becoming another abandoned dashboard.",
  },
];

const pricing = [
  {
    name: "Intelligence Foundation",
    price: "$1,500/mo",
    setup: "$5,000+ setup",
    body: "For businesses that need a reliable reporting layer and executive visibility.",
    items: ["Up to 4 core integrations", "Centralized data layer", "Custom executive dashboard", "Pipeline monitoring", "Monthly dashboard evolution"],
  },
  {
    name: "Automation Layer",
    price: "$2,500/mo",
    setup: "$8,000+ setup",
    body: "For teams that want intelligence connected directly to how work gets done.",
    items: ["Everything in Foundation", "Workflow automation", "Alerts and handoffs", "Process documentation", "Priority iteration"],
    featured: true,
  },
  {
    name: "BrightOps AI",
    price: "$4,000+/mo",
    setup: "$15,000+ setup",
    body: "For companies that want a custom operating layer across BI, automation and AI.",
    items: ["Everything in Automation", "AI insight summaries", "Anomaly detection", "Forecasting support", "Executive strategy reporting"],
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={cx(
        "relative grid place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06]",
        small ? "h-10 w-10" : "h-12 w-12",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(103,232,249,.35),transparent_55%)]" />
      <Sparkles className={cx("relative text-cyan-200", small ? "h-4 w-4" : "h-5 w-5")} />
      <div className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_14px_rgba(190,242,100,.9)]" />
    </div>
  );
}

function Button({
  children,
  onClick,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "group inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition",
        secondary
          ? "border border-white/12 bg-white/[0.045] text-white hover:border-white/25 hover:bg-white/[0.075]"
          : "bg-white text-[#071018] shadow-[0_10px_40px_rgba(255,255,255,.14)] hover:bg-cyan-100",
      )}
    >
      {children}
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function LeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim();
  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`BRHT Strategy Call${form.company ? ` — ${form.company}` : ""}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\n\nWhat they want to improve:\n${form.message}`,
    );
    return `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
  }, [form]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#03060b]/80 px-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-white/12 bg-[#0a1019] shadow-2xl"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative border-b border-white/10 p-7">
              <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#071018]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-3xl font-semibold tracking-[-0.04em] text-white">Book an operations audit.</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
                Tell us where the business feels dark. We’ll start with the systems, reporting and decisions that matter most.
              </p>
            </div>
            <div className="relative grid gap-3 p-7">
              {[
                ["name", "Your name"],
                ["email", "Email"],
                ["company", "Company"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  placeholder={placeholder}
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50"
                />
              ))}
              <textarea
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="What do you want better visibility, automation or AI to solve?"
                className="min-h-32 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50"
              />
              <a
                href={canSubmit ? mailto : undefined}
                onClick={(event) => {
                  if (!canSubmit) event.preventDefault();
                }}
                className={cx(
                  "mt-2 inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition",
                  canSubmit ? "bg-white text-[#071018] hover:bg-cyan-100" : "cursor-not-allowed bg-white/10 text-white/30",
                )}
              >
                Open email request <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SourceChip({ source, delay }: { source: (typeof sources)[number]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b121d]/90 px-3.5 py-3 shadow-[0_12px_45px_rgba(0,0,0,.25)] backdrop-blur-xl"
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white p-1.5 shadow-sm">
        {"logo" in source && source.logo ? (
          <img src={source.logo} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-sm font-black text-[#071018]">{source.text}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-white">{source.name}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/30">connected</div>
      </div>
    </motion.div>
  );
}

function HeroSystem({ demo }: { demo: HomeDemoData }) {
  const bars = [26, 35, 31, 46, 42, 58, 51, 67, 61, 74, 70, 88];
  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      <div className="absolute inset-x-[10%] top-[8%] h-[72%] rounded-full bg-cyan-300/[0.08] blur-[90px]" />
      <div className="relative grid gap-3 lg:grid-cols-[165px_minmax(0,1fr)_220px] lg:items-center">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {sources.map((source, index) => (
            <SourceChip key={source.name} source={source} delay={0.15 + index * 0.06} />
          ))}
        </div>

        <div className="relative min-h-[340px] overflow-hidden rounded-[30px] border border-cyan-200/20 bg-[linear-gradient(145deg,rgba(12,23,36,.94),rgba(6,11,19,.98))] p-5 shadow-[0_35px_110px_rgba(0,0,0,.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,.16),transparent_42%)]" />
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">BRHT data layer</div>
              <div className="mt-1 text-lg font-semibold text-white">One operating model</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <Database className="h-4 w-4 text-cyan-200" />
            </div>
          </div>

          <div className="relative mt-7 space-y-3">
            {[
              ["Revenue", "Normalized", "100%"],
              ["Inventory", "Source-aware", "Live"],
              ["Ad spend", "Daily", "Live"],
              ["Campaigns", "Reconciled", "2x KS"],
            ].map(([label, state, value], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + index * 0.08 }}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3"
              >
                <span className="text-xs font-medium text-white/70">{label}</span>
                <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/40">{state}</span>
                <span className="text-xs font-semibold text-lime-200">{value}</span>
              </motion.div>
            ))}
          </div>

          <div className="relative mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
            <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,.8)]" />
            source health monitored
          </div>
        </div>

        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="rounded-[24px] border border-white/10 bg-white/[0.96] p-4 text-[#071018] shadow-[0_25px_70px_rgba(0,0,0,.3)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Tracked revenue</span>
              <LineChart className="h-4 w-4 text-cyan-700" />
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.055em]">{formatMoney(demo.revenue)}</div>
            <div className="mt-4 flex h-20 items-end gap-1.5">
              {bars.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 4 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.6 + index * 0.035, duration: 0.45 }}
                  className="min-w-0 flex-1 rounded-t bg-gradient-to-t from-cyan-700 to-cyan-300"
                />
              ))}
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-[#0b121d] p-4">
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">Ad spend</div>
              <div className="mt-2 text-xl font-semibold text-white">{formatMoney(demo.adSpend)}</div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-[#0b121d] p-4">
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">Sources</div>
              <div className="mt-2 text-xl font-semibold text-white">{demo.healthySources} healthy</div>
            </div>
          </div>
          <Link
            href="/dashboards/fable-fury?range=max"
            className="group flex items-center justify-between rounded-[22px] border border-cyan-200/20 bg-cyan-200/[0.07] px-4 py-3.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-200/[0.12]"
          >
            Open live Fable Fury dashboard
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,.07)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{value}</div>
    </div>
  );
}

export default function HomePage({ demo }: { demo: HomeDemoData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#06090f] text-white">
      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#06090f]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark small />
            <div>
              <div className="text-sm font-semibold tracking-[-0.02em]">BRHT</div>
              <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/30">Intelligence systems</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="text-xs font-medium text-white/45 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/dashboards/fable-fury?range=max" className="rounded-full px-4 py-2 text-xs font-semibold text-white/60 transition hover:text-white">
              Live demo
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#071018] transition hover:bg-cyan-100"
            >
              Book an audit
            </button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-2 text-white/70 lg:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/[0.06] bg-[#06090f] lg:hidden"
            >
              <div className="grid gap-1 px-5 py-4">
                {nav.map(([label, href]) => (
                  <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/[0.05] hover:text-white">
                    {label}
                  </a>
                ))}
                <Link href="/dashboards/fable-fury?range=max" className="mt-2 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#071018]">
                  View live demo
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-36 sm:px-8 lg:px-10 lg:pb-32 lg:pt-44">
          <div className="pointer-events-none absolute left-1/2 top-[-360px] h-[780px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,.16),rgba(99,102,241,.07)_38%,transparent_68%)] blur-2xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

          <div className="relative mx-auto max-w-[1440px]">
            <div className="grid gap-16 xl:grid-cols-[0.88fr_1.12fr] xl:items-center">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-cyan-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,.85)]" />
                  Business intelligence · automation · AI
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.6 }}
                  className="mt-7 text-[clamp(3.4rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.075em]"
                >
                  Your business has the answers.
                  <span className="block bg-gradient-to-r from-cyan-200 via-white to-lime-200 bg-clip-text text-transparent">
                    They’re just trapped in six different systems.
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.55 }}
                  className="mt-7 max-w-xl text-base leading-7 text-white/52 sm:text-lg sm:leading-8"
                >
                  BRHT connects the tools you already use, turns fragmented data into a reliable operating model, and delivers it as a custom web product—dashboards, workflows and AI built around your business.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.23, duration: 0.55 }}
                  className="mt-9 flex flex-wrap gap-3"
                >
                  <Link href="/dashboards/fable-fury?range=max">
                    <Button>Explore the live system</Button>
                  </Link>
                  <Button secondary onClick={() => setModalOpen(true)}>
                    Book an operations audit
                  </Button>
                </motion.div>
                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-medium uppercase tracking-[0.12em] text-white/28">
                  <span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Your data foundation</span>
                  <span className="inline-flex items-center gap-2"><Code2 className="h-3.5 w-3.5" /> Your business logic</span>
                  <span className="inline-flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" /> Your domain</span>
                </div>
              </div>
              <HeroSystem demo={demo} />
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto grid max-w-[1440px] gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["DATA", "Connect scattered systems"],
              ["LOGIC", "Standardize the numbers"],
              ["EXPERIENCE", "Ship custom interfaces"],
              ["ACTION", "Automate what happens next"],
            ].map(([eyebrow, text]) => (
              <div key={eyebrow} className="bg-[#070b12] px-6 py-7">
                <div className="text-[9px] font-bold tracking-[0.18em] text-cyan-200/45">{eyebrow}</div>
                <div className="mt-2 text-sm font-medium text-white/70">{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="system" className="scroll-mt-24 bg-[#f4f3ef] px-5 py-24 text-slate-950 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">How it works</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                  Not another dashboard.
                  <span className="block text-slate-400">A data system with an interface.</span>
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-slate-500 lg:justify-self-end lg:text-lg lg:leading-8">
                Most businesses already own the software that generates the data. The problem is the data lives in separate worlds. BRHT creates the layer between those systems and the decisions your team has to make.
              </p>
            </div>

            <div className="relative mt-16 grid gap-4 lg:grid-cols-4">
              <div className="absolute left-[10%] right-[10%] top-12 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block" />
              {platformLayers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <motion.article
                    key={layer.step}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.07 }}
                    className="relative rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,.065)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{layer.step}</span>
                    </div>
                    <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">{layer.eyebrow}</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{layer.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{layer.body}</p>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-8 rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_25px_80px_rgba(15,23,42,.14)] sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-200">The difference</div>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                    The dashboard is the visible part.
                    <span className="block text-white/35">The data foundation is the compounding asset.</span>
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Reliable", "One definition for every core metric."],
                    ["Reusable", "New dashboards use the same clean foundation."],
                    ["Actionable", "The same data can drive alerts, AI and workflows."],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="mt-2 text-xs leading-5 text-white/40">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="scroll-mt-24 bg-white px-5 py-24 text-slate-950 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Live proof · Fable Fury Studios</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                  Built on a real operating business.
                  <span className="block text-slate-400">Not a demo dataset.</span>
                </h2>
              </div>
              <Link
                href="/dashboards/fable-fury?range=max"
                className="group inline-flex items-center text-sm font-semibold text-slate-700"
              >
                Open the live dashboard <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricTile label="Tracked revenue" value={formatMoney(demo.revenue)} icon={CircleDollarSign} />
              <MetricTile label="Tracked ad spend" value={formatMoney(demo.adSpend)} icon={Gauge} />
              <MetricTile label="Orders / transactions" value={formatNumber(demo.orders)} icon={BarChart3} />
              <MetricTile label="Units sold" value={formatNumber(demo.units)} icon={PackageCheck} />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
              <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f8fafc]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Revenue model</div>
                    <div className="mt-1 text-lg font-semibold">One number. Multiple systems.</div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                    Live
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="space-y-3">
                    {demo.revenueChannels.slice(0, 5).map((channel) => {
                      const max = Math.max(1, ...demo.revenueChannels.map((item) => item.revenue));
                      return (
                        <div key={channel.name} className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                          <div className="truncate text-xs font-medium text-slate-600">{channel.name}</div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-300"
                              style={{ width: `${Math.max(3, (channel.revenue / max) * 100)}%` }}
                            />
                          </div>
                          <div className="text-xs font-semibold tabular-nums">{formatMoney(channel.revenue)}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                    Kickstarter campaigns are reconciled day by day, BackerKit incremental revenue is separated from Kickstarter-originated pledges, and ad-attributed revenue is not double-counted as operational sales.
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-6 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-200/60">Inventory intelligence</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Stock lives across channels. The decision shouldn’t.</h3>
                <div className="mt-6 space-y-3">
                  {demo.inventoryProducts.slice(0, 5).map((product) => (
                    <div key={product.name} className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-white/75">{product.name}</div>
                        <div className="mt-1 text-[10px] text-white/30">
                          {product.daysOfCover === null ? "Cover calculating" : `${Math.round(product.daysOfCover)} days cover`}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {product.available === null ? "—" : formatNumber(product.available)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/30">
                  <span className="h-2 w-2 rounded-full bg-lime-300" />
                  Shopify + Amazon FBA source-aware inventory
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-brht" className="scroll-mt-24 bg-[#080c14] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">BRHT vs traditional BI</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                  Same core objective.
                  <span className="block text-white/32">A different default.</span>
                </h2>
              </div>
              <div className="max-w-2xl lg:justify-self-end">
                <p className="text-base leading-7 text-white/48 lg:text-lg lg:leading-8">
                  Power BI is a very good business-intelligence platform. BRHT is not pretending otherwise. The difference is that Power BI starts with a reporting product. BRHT starts with your business and builds the data experience around it.
                </p>
              </div>
            </div>

            <div className="mt-12 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.025]">
              <div className="grid grid-cols-[1fr_140px_170px] border-b border-white/10 bg-white/[0.025] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.13em] text-white/35 sm:grid-cols-[1fr_220px_220px] sm:px-7">
                <div>Capability</div>
                <div className="text-cyan-200">BRHT</div>
                <div>Power BI</div>
              </div>
              {comparisonRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[1fr_140px_170px] gap-0 border-b border-white/[0.065] px-5 py-4 last:border-0 sm:grid-cols-[1fr_220px_220px] sm:px-7">
                  <div className="pr-4 text-sm text-white/65">{row.label}</div>
                  <div className="text-xs font-semibold text-cyan-100 sm:text-sm">{row.brht}</div>
                  <div className="text-xs text-white/40 sm:text-sm">{row.power}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[26px] border border-cyan-200/15 bg-cyan-200/[0.045] p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">Choose BRHT when</div>
                <p className="mt-3 text-lg font-medium tracking-[-0.02em] text-white">
                  The analytics experience needs to feel like part of your business—not like a separate BI product your team has to visit.
                </p>
                <div className="mt-5 grid gap-2 text-sm text-white/45 sm:grid-cols-2">
                  {["Custom UX and branding", "Client-facing analytics", "Bespoke operating logic", "Dashboards + actions + AI"].map((item) => (
                    <div key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-lime-200" /> {item}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Choose Power BI when</div>
                <p className="mt-3 text-lg font-medium tracking-[-0.02em] text-white">
                  You want a mature self-service BI environment for a large analyst population inside an established Microsoft ecosystem.
                </p>
                <div className="mt-5 grid gap-2 text-sm text-white/40 sm:grid-cols-2">
                  {["Self-service analysts", "Enterprise governance", "Microsoft ecosystem", "Standardized BI workflows"].map((item) => (
                    <div key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-white/30" /> {item}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-xs leading-5 text-white/30 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Microsoft’s current Power BI plans use per-user licensing for Pro/PPU, while Embedded/capacity pricing varies. BRHT has no per-viewer BRHT licence.
              </span>
              <a
                href="https://www.microsoft.com/en-us/microsoft-fabric/features/power-bi/pricing"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-semibold text-white/55 transition hover:text-white"
              >
                Microsoft pricing <ChevronRight className="inline h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#f4f3ef] px-5 py-24 text-slate-950 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">The BRHT layer</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                See what’s happening. Move the work. Think ahead.
              </h2>
            </div>
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.08 }}
                    className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,.06)]"
                  >
                    <div className={cx("absolute inset-x-0 top-0 h-36 bg-gradient-to-b", pillar.accent)} />
                    <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="relative mt-10 text-xs font-bold tracking-[0.22em] text-cyan-700">{pillar.label}</div>
                    <h3 className="relative mt-2 text-2xl font-semibold tracking-[-0.035em]">{pillar.title}</h3>
                    <p className="relative mt-4 text-sm leading-6 text-slate-500">{pillar.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 bg-white px-5 py-24 text-slate-950 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">What working together looks like</div>
                <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                  Turn the lights on. Then keep building.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
                  The goal isn’t a one-time report. It’s an operational layer that becomes more valuable as more of the business plugs into it.
                </p>
                <button onClick={() => setModalOpen(true)} className="group mt-7 inline-flex items-center text-sm font-semibold text-slate-900">
                  Start with an operations audit <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </div>
              <div className="space-y-3">
                {process.map((step) => (
                  <div key={step.n} className="grid gap-5 rounded-[28px] border border-slate-200 bg-[#fafaf8] p-6 sm:grid-cols-[80px_1fr] sm:p-7">
                    <div className="text-4xl font-semibold tracking-[-0.06em] text-slate-200">{step.n}</div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.03em]">{step.title}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 bg-[#080c14] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Engagements</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Start with visibility. Add leverage as you grow.
              </h2>
            </div>
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {pricing.map((tier) => (
                <div
                  key={tier.name}
                  className={cx(
                    "rounded-[30px] border p-7",
                    tier.featured
                      ? "border-cyan-200/30 bg-cyan-200/[0.07] shadow-[0_25px_80px_rgba(34,211,238,.08)]"
                      : "border-white/10 bg-white/[0.025]",
                  )}
                >
                  {tier.featured ? (
                    <div className="mb-5 inline-flex rounded-full bg-cyan-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-950">
                      Most common starting point
                    </div>
                  ) : null}
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-white/40">{tier.body}</p>
                  <div className="mt-7 text-3xl font-semibold tracking-[-0.04em]">{tier.price}</div>
                  <div className="mt-1 text-xs font-medium text-cyan-200/60">{tier.setup}</div>
                  <div className="mt-7 space-y-3">
                    {tier.items.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-white/50">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-200" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#dff9ff] px-5 py-24 text-[#071018] sm:px-8 lg:px-10 lg:py-32">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-lime-200/60 blur-[100px]" />
          <div className="absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-300/50 blur-[100px]" />
          <div className="relative mx-auto max-w-[1100px] text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#071018] text-white">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="mx-auto mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
              Your business is already generating the data.
              <span className="block text-cyan-800/45">Make it useful.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600">
              Start with the decisions you wish were easier to make. We’ll work backwards into the data, workflows and intelligence layer needed to answer them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => setModalOpen(true)} className="inline-flex h-12 items-center rounded-full bg-[#071018] px-6 text-sm font-semibold text-white">
                Book an operations audit <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <Link href="/dashboards/fable-fury?range=max" className="inline-flex h-12 items-center rounded-full border border-slate-900/15 bg-white/50 px-6 text-sm font-semibold">
                Explore the live build
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] bg-[#06090f] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark small />
            <div>
              <div className="text-sm font-semibold">BRHT Intelligence</div>
              <div className="mt-0.5 text-xs text-white/30">Business intelligence, automation and AI operations.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/30">
            <a href={`mailto:${EMAIL_TO}`} className="inline-flex items-center gap-2 transition hover:text-white">
              <Mail className="h-3.5 w-3.5" /> {EMAIL_TO}
            </a>
            <span>Perth · Remote</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
