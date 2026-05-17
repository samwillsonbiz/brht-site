"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Command,
  Database,
  Eye,
  Layers3,
  Lightbulb,
  LineChart,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  MousePointerClick,
  Plus,
  Network,
  PlugZap,
  Radar,
  ShieldCheck,
  Sparkles,
  SunMedium,
  TrendingUp,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const EMAIL_TO = "samwillsonbiz@gmail.com";

const navItems = [
  { label: "Live Demo", href: "#demo" },
  { label: "Platform", href: "#platform" },
  { label: "Systems", href: "#systems" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

const pillars = [
  {
    icon: Eye,
    label: "SEE",
    title: "Business intelligence",
    description:
      "Unify sales, ads, inventory, finance, and operations data into executive dashboards that show what is really happening.",
  },
  {
    icon: Workflow,
    label: "MOVE",
    title: "Workflow automation",
    description:
      "Turn repetitive business processes into connected workflows that trigger actions, alerts, reports, and handoffs automatically.",
  },
  {
    icon: BrainCircuit,
    label: "THINK",
    title: "AI operational insight",
    description:
      "Layer AI over your business data to explain changes, surface risks, summarize performance, and recommend next actions.",
  },
];

const integrations = [
  "Shopify",
  "Amazon",
  "Meta Ads",
  "Google Ads",
  "Inventory",
  "Postgres",
  "Metabase",
  "n8n",
  "AI",
];

const outcomes = [
  "Know revenue, ROAS, margin, and inventory position without logging into every platform.",
  "Spot problems earlier with automated alerts, thresholds, and anomaly detection.",
  "Replace manual spreadsheet reporting with a centralized operational data layer.",
  "Give founders, CFOs, and operators one clear source of truth.",
];

const process = [
  { icon: PlugZap, title: "Connect", desc: "We connect the platforms your business already runs on." },
  { icon: Database, title: "Centralize", desc: "Your data flows into a structured warehouse built for reporting." },
  { icon: BarChart3, title: "Illuminate", desc: "Dashboards reveal the numbers, trends, and bottlenecks that matter." },
  { icon: Zap, title: "Automate", desc: "Workflows move tasks, alerts, and reports without manual effort." },
];

const systems = [
  { icon: CircleDollarSign, title: "Revenue signal", text: "Orders, AOV, refunds, contribution margin, customer cohorts, and channel attribution." },
  { icon: TrendingUp, title: "Ad performance", text: "Google, Meta, blended ROAS, spend pacing, creative signal, and profitability alerts." },
  { icon: Radar, title: "Inventory risk", text: "Sell-through velocity, stockout projections, reorder points, and supplier timing." },
  { icon: Bot, title: "AI summaries", text: "Daily executive briefings, trend explanations, anomaly notes, and next-action recommendations." },
  { icon: ClipboardCheck, title: "Ops workflows", text: "Task creation, owner handoff, Slack/email alerts, reporting cadences, and SOP automation." },
  { icon: ShieldCheck, title: "Data governance", text: "Clear source mapping, pipeline checks, error alerts, permissions, and documented logic." },
];

const pricing = [
  {
    name: "Intelligence Foundation",
    price: "$1,500/mo",
    setup: "$5,000+ setup",
    description: "For businesses that need dashboards, reporting, and one source of truth.",
    items: ["Up to 4 core integrations", "Centralized data warehouse", "Executive dashboards", "Monthly dashboard edits", "Pipeline monitoring"],
  },
  {
    name: "Automation Layer",
    price: "$2,500/mo",
    setup: "$8,000+ setup",
    description: "For teams that want intelligence plus workflow automation.",
    items: ["Everything in Foundation", "Workflow automation", "Alerts and handoffs", "Process documentation", "Priority support"],
    featured: true,
  },
  {
    name: "BrightOps AI",
    price: "$4,000+/mo",
    setup: "$15,000+ setup",
    description: "For companies that want BI, automation, and AI-assisted operations.",
    items: ["Everything in Automation", "AI insight summaries", "Anomaly detection", "Forecasting support", "Executive strategy reports"],
  },
];

const dashboardBars = [42, 55, 49, 68, 62, 81, 74, 96, 88, 100, 92, 116];

const dateRanges = [
  { label: "Today", key: "today", multiplier: 0.18 },
  { label: "Yesterday", key: "yesterday", multiplier: 0.16 },
  { label: "Last 7 days", key: "7d", multiplier: 1 },
  { label: "Last 30 days", key: "30d", multiplier: 4.15 },
  { label: "Quarter", key: "quarter", multiplier: 12.4 },
];

const metricCatalog = [
  { key: "revenue", label: "Revenue", value: 18400, prefix: "$", suffix: "", trend: "+18%", type: "money", color: "from-cyan-300 to-cyan-100" },
  { key: "roas", label: "Blended ROAS", value: 3.7, prefix: "", suffix: "x", trend: "+0.4", type: "decimal", color: "from-yellow-300 to-yellow-100" },
  { key: "orders", label: "Orders", value: 246, prefix: "", suffix: "", trend: "+32", type: "number", color: "from-indigo-300 to-cyan-100" },
  { key: "margin", label: "Gross Margin", value: 61, prefix: "", suffix: "%", trend: "+6%", type: "percent", color: "from-emerald-300 to-cyan-100" },
  { key: "inventory", label: "Stockout Risk", value: 31, prefix: "", suffix: " days", trend: "Watch", type: "days", color: "from-orange-300 to-yellow-100" },
  { key: "alerts", label: "Automation Alerts", value: 12, prefix: "", suffix: "", trend: "4 resolved", type: "number", color: "from-fuchsia-300 to-cyan-100" },
];

function formatMetric(metric: (typeof metricCatalog)[number], multiplier: number) {
  const scaled = metric.key === "roas" || metric.key === "margin" || metric.key === "inventory" ? metric.value : metric.value * multiplier;

  if (metric.type === "money") return `${metric.prefix}${Math.round(scaled).toLocaleString()}`;
  if (metric.type === "decimal") return `${scaled.toFixed(1)}${metric.suffix}`;
  if (metric.type === "percent") return `${Math.round(scaled)}${metric.suffix}`;
  if (metric.type === "days") return `${Math.round(scaled)}${metric.suffix}`;
  return `${metric.prefix}${Math.round(scaled).toLocaleString()}${metric.suffix}`;
}

function DataConnectionFlow() {
  const [activeSources, setActiveSources] = useState([
    "shopify",
    "amazon",
    "meta",
    "google",
  ]);

  const sources = [
    {
      key: "shopify",
      title: "Shopify",
      subtitle: "Orders + customers",
      accent: "from-emerald-300 to-cyan-100",
      metrics: ["Revenue", "AOV", "Units", "Customer LTV"],
    },
    {
      key: "amazon",
      title: "Amazon",
      subtitle: "Marketplace signal",
      accent: "from-orange-300 to-yellow-100",
      metrics: ["Sessions", "Conversion", "FBA inventory", "Buy box"],
    },
    {
      key: "meta",
      title: "Meta Ads",
      subtitle: "Paid social",
      accent: "from-cyan-300 to-indigo-100",
      metrics: ["Spend", "ROAS", "CTR", "CAC"],
    },
    {
      key: "google",
      title: "Google Ads",
      subtitle: "Search + PMAX",
      accent: "from-blue-300 to-cyan-100",
      metrics: ["Spend", "Conv. value", "ROAS", "Search demand"],
    },
    {
      key: "dear",
      title: "DEAR Systems",
      subtitle: "Inventory + ops",
      accent: "from-yellow-300 to-orange-100",
      metrics: ["Stock", "COGS", "Lead time", "Purchase orders"],
    },
    {
      key: "bill",
      title: "Bill.com",
      subtitle: "Expenses + AP",
      accent: "from-fuchsia-300 to-cyan-100",
      metrics: ["Expenses", "Cash flow", "Vendors", "Burn rate"],
    },
    {
      key: "sheets",
      title: "Google Sheets",
      subtitle: "Custom business logic",
      accent: "from-lime-300 to-cyan-100",
      metrics: ["Forecasts", "Manual KPIs", "Targets", "Scenarios"],
    },
  ];

  const activeCount = activeSources.length;

  function toggleSource(key: string) {
    setActiveSources((current) => {
      if (current.includes(key)) {
        return current.length === 1 ? current : current.filter((item) => item !== key);
      }
      return [...current, key];
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl md:p-7">
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
            <PlugZap className="h-3.5 w-3.5" /> Source orchestration
          </div>
          <h3 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
            Connect the systems that already run your business.
          </h3>
          <p className="mt-4 max-w-3xl leading-8 text-slate-300 md:text-lg">
            BRHT pulls fragmented data from commerce, ads, inventory, finance, and custom spreadsheets into one operational intelligence layer.
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">Connected sources</p>
          <p className="mt-1 text-4xl font-black text-white">{activeCount}</p>
        </div>
      </div>

      <div className="relative mt-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sources.map((source) => {
              const active = activeSources.includes(source.key);

              return (
                <motion.button
                  layout
                  key={source.key}
                  onClick={() => toggleSource(source.key)}
                  whileHover={{ y: -3 }}
                  className={`group relative overflow-hidden rounded-[1.8rem] border p-5 text-left transition ${active ? "border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_40px_rgba(103,232,249,0.12)]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"}`}
                >
                  <div className={`mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r ${source.accent}`} />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xl font-black text-white">{source.title}</h4>
                      <p className="mt-1 text-sm text-slate-400">{source.subtitle}</p>
                    </div>

                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${active ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/15 text-slate-500"}`}>
                      {active ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {source.metrics.map((metric) => (
                      <span key={metric} className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs font-medium text-slate-300">
                        {metric}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_58%)]" />

          <div className="relative flex h-full w-full items-center justify-center">
            <motion.div
              layout
              className="absolute flex h-40 w-40 items-center justify-center rounded-[2rem] border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_60px_rgba(103,232,249,0.2)] backdrop-blur-xl"
            >
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                  <BrainCircuit className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-cyan-100">BRHT Core</p>
                <p className="mt-2 text-2xl font-black text-white">Unified Intelligence</p>
              </div>
            </motion.div>

            {sources.map((source, index) => {
              const active = activeSources.includes(source.key);
              const angle = (Math.PI * 2 * index) / sources.length;
              const radius = 220;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.div
                  key={source.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: active ? 1 : 0.4,
                    scale: active ? 1 : 0.94,
                    x,
                    y,
                  }}
                  transition={{ duration: 0.35 }}
                  className="absolute"
                >
                  <div className={`relative flex h-28 w-40 flex-col justify-center rounded-[1.6rem] border px-4 py-4 backdrop-blur-xl ${active ? "border-cyan-300/30 bg-white/[0.08]" : "border-white/10 bg-white/[0.03]"}`}>
                    <div className={`mb-3 h-1.5 w-14 rounded-full bg-gradient-to-r ${source.accent}`} />
                    <p className="text-lg font-black text-white">{source.title}</p>
                    <p className="text-xs text-slate-400">{source.subtitle}</p>
                  </div>

                  {active && (
                    <motion.div
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.35, 0.9, 0.35] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[2px] origin-left bg-gradient-to-r from-cyan-300 via-cyan-200 to-transparent"
                      style={{
                        width: radius - 60,
                        transform: `translateY(-50%) rotate(${angle + Math.PI}rad)`,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveDashboard() {
  const [activeRange, setActiveRange] = useState(dateRanges[2]);
  const [activeMetrics, setActiveMetrics] = useState(["revenue", "roas", "orders", "margin"]);

  const visibleMetrics = metricCatalog.filter((metric) => activeMetrics.includes(metric.key));
  const chartSeries = useMemo(() => {
    const base = [34, 48, 41, 62, 56, 77, 72, 94, 86, 102, 91, 118];
    return base.map((point, index) => Math.max(12, point * activeRange.multiplier * (0.82 + index * 0.015)));
  }, [activeRange]);

  function toggleMetric(key: string) {
    setActiveMetrics((current) => {
      if (current.includes(key)) return current.length === 1 ? current : current.filter((item) => item !== key);
      return [...current, key];
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl md:p-7">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-yellow-300/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
            <MousePointerClick className="h-3.5 w-3.5" /> Interactive vision
          </div>
          <h3 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Experience the operating layer.</h3>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Choose a time period, toggle the metrics that matter, and see how BRHT turns raw business systems into one executive view.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-slate-950/40 p-2">
          {dateRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setActiveRange(range)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeRange.key === range.key ? "bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(103,232,249,0.25)]" : "text-slate-300 hover:bg-white/10"}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-8 grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-200">Data points</p>
              <p className="text-xs text-slate-500">Add or remove dashboard cards</p>
            </div>
            <Layers3 className="h-5 w-5 text-cyan-200" />
          </div>

          <div className="grid gap-3">
            {metricCatalog.map((metric) => {
              const checked = activeMetrics.includes(metric.key);
              return (
                <button
                  key={metric.key}
                  onClick={() => toggleMetric(metric.key)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${checked ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${checked ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/20"}`}>
                      {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    <span className="font-bold text-slate-200">{metric.label}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500">{metric.trend}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleMetrics.map((metric) => (
              <motion.div
                layout
                key={metric.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[1.7rem] border border-white/10 bg-slate-950/45 p-5"
              >
                <div className={`mb-5 h-1.5 w-16 rounded-full bg-gradient-to-r ${metric.color}`} />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-white">{formatMetric(metric, activeRange.multiplier)}</p>
                <p className="mt-2 text-sm font-bold text-cyan-200">{metric.trend}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-200">Unified performance flow</p>
                <p className="text-xs text-slate-500">Simulated signal across selected range</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                <Network className="h-3.5 w-3.5" /> Data synced
              </div>
            </div>
            <div className="flex h-56 items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.025] p-4">
              {chartSeries.map((height, index) => (
                <motion.div
                  key={`${activeRange.key}-${index}`}
                  initial={{ height: 12, opacity: 0.4 }}
                  animate={{ height: `${Math.min(100, height)}%`, opacity: 1 }}
                  transition={{ duration: 0.42, delay: index * 0.025 }}
                  className="relative flex-1 rounded-t-2xl bg-gradient-to-t from-cyan-500 via-cyan-200 to-yellow-200 shadow-[0_0_18px_rgba(103,232,249,0.16)]"
                >
                  <div className="absolute inset-x-0 top-0 h-2 rounded-full bg-white/50" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-yellow-300/15 bg-yellow-300/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-yellow-100">
                <Bot className="h-4 w-4 text-yellow-200" /> AI explanation
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Revenue increased while margin held steady. Inventory risk is acceptable, but ad spend should be watched if ROAS drops below 3.2x.
              </p>
            </div>
            <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-100">
                <Workflow className="h-4 w-4 text-cyan-200" /> Automation trigger
              </div>
              <p className="text-sm leading-6 text-slate-300">
                If stockout risk falls under 21 days, create reorder task, notify ops, and send daily owner alerts until resolved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function scrollToId(id: string) {
  const element = document.querySelector(id);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildMailto(form: { name: string; email: string; company: string; message: string }) {
  const subject = encodeURIComponent(`BRHT Strategy Call Request${form.company ? ` - ${form.company}` : ""}`);
  const body = encodeURIComponent(
    `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\n\nWhat they need help with:\n${form.message}`
  );
  return `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
}

function LogoMark() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-slate-950 text-yellow-300 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
      <Lightbulb className="h-6 w-6" />
      <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.9)]" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
    </div>
  );
}

function LeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim();
  const mailto = useMemo(() => buildMailto(form), [form]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-2xl"
          >
            <div className="relative border-b border-white/10 p-7">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
              <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-slate-950">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Book a BRHT operations audit</h3>
              <p className="mt-3 leading-7 text-slate-300">Tell us what systems you use and where the business feels dark. This opens your email with everything prefilled.</p>
            </div>

            <div className="grid gap-4 p-7">
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:ring-4" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:ring-4" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:ring-4" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              <textarea className="min-h-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:ring-4" placeholder="What do you want visibility, automation, or AI help with?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <a
                href={canSubmit ? mailto : undefined}
                onClick={(e) => {
                  if (!canSubmit) e.preventDefault();
                }}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 font-bold transition ${canSubmit ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200" : "cursor-not-allowed bg-white/10 text-slate-500"}`}
              >
                Open email request <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    scrollToId(href);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-cyan-300 selection:text-slate-950">
      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(250,204,21,0.18),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.16),transparent_32%),linear-gradient(180deg,#020617_0%,#06111f_42%,#020617_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:54px_54px]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button onClick={() => scrollToId("#top")} className="flex items-center gap-3 text-left">
            <LogoMark />
            <div>
              <p className="text-xl font-black tracking-tight">BRHT Intelligence</p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/70">Illuminate operations</p>
            </div>
          </button>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            {navItems.map((item) => (
              <button key={item.href} onClick={() => handleNav(item.href)} className="hover:text-cyan-200">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="outline" className="rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white" onClick={() => handleNav("#demo")}>
              Live Demo
            </Button>
            <Button className="rounded-full bg-cyan-300 px-6 text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.25)] hover:bg-cyan-200" onClick={() => setModalOpen(true)}>
              Book Audit
            </Button>
          </div>

          <button className="rounded-full border border-white/10 p-3 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/10 md:hidden">
              <div className="grid gap-2 px-6 py-5">
                {navItems.map((item) => (
                  <button key={item.href} onClick={() => handleNav(item.href)} className="rounded-2xl px-4 py-3 text-left text-slate-200 hover:bg-white/10">
                    {item.label}
                  </button>
                ))}
                <Button className="mt-2 rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200" onClick={() => setModalOpen(true)}>
                  Book Audit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        <section className="relative px-6 pb-24 pt-16 md:pb-32 md:pt-24">
          <div className="absolute left-1/2 top-24 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.03fr_0.97fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-sm font-medium text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur">
                <SunMedium className="h-4 w-4 text-yellow-300" />
                BI + automation + AI for operators who need clarity
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.055em] text-white md:text-7xl lg:text-8xl">
                Turn scattered data into a living command center.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                BRHT connects your tools, centralizes your data, automates the busywork, and uses AI to reveal what changed, what matters, and what to do next.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="rounded-full bg-cyan-300 px-8 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] hover:bg-cyan-200" onClick={() => setModalOpen(true)}>
                  Get an operations audit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white" onClick={() => handleNav("#demo")}>
                  Try the live dashboard
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {integrations.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-medium text-slate-300 shadow-sm backdrop-blur">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-yellow-300/20 via-cyan-300/25 to-indigo-500/20 blur-2xl" />
              <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.055] text-white shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
                <CardContent className="p-0">
                  <div className="border-b border-white/10 bg-slate-950/70 p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                          <Command className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-cyan-200">BRHT command center</p>
                          <h3 className="mt-1 text-2xl font-black tracking-tight">Operational signal</h3>
                        </div>
                      </div>
                      <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">Live</div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["Revenue", "$18.4k", "+18%"],
                        ["Blended ROAS", "3.7x", "+0.4"],
                        ["Stockout Risk", "31d", "Alert"],
                      ].map(([label, value, note]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs text-slate-400">{label}</p>
                          <div className="mt-2 flex items-end justify-between gap-2">
                            <p className="text-2xl font-black">{value}</p>
                            <span className="text-xs font-bold text-yellow-200">{note}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 p-6">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                          <LineChart className="h-4 w-4 text-cyan-300" /> Revenue clarity
                        </div>
                        <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">Signal improving</span>
                      </div>
                      <div className="flex h-28 items-end gap-2">
                        {dashboardBars.map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 8 }}
                            animate={{ height: `${height / 1.25}%` }}
                            transition={{ duration: 0.75, delay: i * 0.035 }}
                            className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-400 via-cyan-200 to-yellow-200 shadow-[0_0_18px_rgba(103,232,249,0.18)]"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-yellow-300/15 bg-yellow-300/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-yellow-100">
                          <Workflow className="h-4 w-4 text-yellow-200" /> Automation
                        </div>
                        <p className="text-sm leading-6 text-slate-300">Low inventory alert sent. Reorder task created. Owner notified.</p>
                      </div>
                      <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-100">
                          <Bot className="h-4 w-4 text-cyan-200" /> AI insight
                        </div>
                        <p className="text-sm leading-6 text-slate-300">Meta spend rose, but margin fell due to product mix shift.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section id="demo" className="scroll-mt-24 px-6 py-20">
          <div className="mx-auto max-w-7xl space-y-10">
            <DataConnectionFlow />
            <InteractiveDashboard />
          </div>
        </section>

        <section id="platform" className="scroll-mt-24 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-200">The BRHT layer</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">See. Move. Think.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">Three connected layers that turn scattered business systems into operational clarity.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.title} className="group rounded-[2rem] border-white/10 bg-white/[0.055] text-white shadow-xl shadow-slate-950/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/30">
                    <CardContent className="p-8">
                      <div className="mb-6 inline-flex rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-sm font-black tracking-[0.18em] text-yellow-200">{pillar.label}</div>
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-black">{pillar.title}</h3>
                      <p className="mt-4 leading-7 text-slate-300">{pillar.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="systems" className="scroll-mt-24 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-bold uppercase tracking-[0.24em] text-yellow-200">Operational systems</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">One illuminated layer across the tools that run your business.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {systems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="rounded-[2rem] border-white/10 bg-white/[0.045] text-white shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <Icon className="h-7 w-7 text-cyan-200" />
                      <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                      <p className="mt-3 leading-7 text-slate-300">{item.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-white/10 bg-white/[0.055] p-8 text-white shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-bold uppercase tracking-[0.24em] text-yellow-200">Why it matters</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Your business already has the data. BRHT turns the lights on.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">BRHT gives operators the visibility of a BI team, the leverage of an automation team, and the strategic lift of AI without building a full internal data department.</p>
            </div>
            <div className="grid gap-4">
              {outcomes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
                  <p className="leading-7 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-200">How it works</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">From scattered platforms to a bright operating layer.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-4">
              {process.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="rounded-[2rem] border-white/10 bg-white/[0.045] text-white shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <Icon className="h-7 w-7 text-cyan-200" />
                        <span className="text-sm font-black text-white/20">0{index + 1}</span>
                      </div>
                      <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                      <p className="mt-3 leading-7 text-slate-300">{step.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-200">Pricing direction</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Start with clarity. Add automation and AI as you grow.</h2>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricing.map((tier) => (
                <Card key={tier.name} className={`rounded-[2rem] border text-white shadow-xl shadow-slate-950/25 backdrop-blur-xl ${tier.featured ? "border-cyan-300/40 bg-cyan-300/10 ring-1 ring-cyan-300/25" : "border-white/10 bg-white/[0.045]"}`}>
                  <CardContent className="p-8">
                    {tier.featured && <div className="mb-5 inline-flex rounded-full bg-cyan-300 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-950">Most popular</div>}
                    <h3 className="text-2xl font-black">{tier.name}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{tier.description}</p>
                    <div className="mt-6">
                      <p className="text-4xl font-black">{tier.price}</p>
                      <p className="mt-2 text-sm font-bold text-yellow-200">{tier.setup}</p>
                    </div>
                    <div className="mt-7 space-y-3">
                      {tier.items.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                          <p className="text-slate-200">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-cyan-300/25 bg-gradient-to-br from-cyan-300/15 via-white/[0.06] to-yellow-300/15 p-10 text-center shadow-2xl shadow-cyan-950/20 backdrop-blur-xl md:p-14">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-300 text-slate-950 shadow-[0_0_45px_rgba(103,232,249,0.3)]">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">Ready to turn the lights on?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">Book a BRHT operations audit and see where better data, automation, and AI can create immediate leverage.</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="rounded-full bg-cyan-300 px-8 text-slate-950 hover:bg-cyan-200" onClick={() => setModalOpen(true)}>
                Book a Strategy Call <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a href={`mailto:${EMAIL_TO}?subject=${encodeURIComponent("BRHT Intelligence Inquiry")}`}>
                <Button size="lg" variant="outline" className="w-full rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white sm:w-auto">
                  <MessageCircle className="mr-2 h-4 w-4" /> Contact BRHT
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-black">BRHT Intelligence</p>
              <p className="text-sm text-slate-400">Business intelligence, automation, and AI operations.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Secure data pipelines</span>
            <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> {EMAIL_TO}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
