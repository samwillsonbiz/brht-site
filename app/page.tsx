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
  { key: "blendedRoas", label: "Blended ROAS", value: 3.7, prefix: "", suffix: "x", trend: "+0.4", type: "decimal", color: "from-cyan-300 to-cyan-100" },
  { key: "contributionMargin", label: "True Contribution Margin", value: 22.4, prefix: "", suffix: "%", trend: "+6%", type: "percent", color: "from-emerald-300 to-cyan-100" },
  { key: "inventoryRunway", label: "Inventory Runway", value: 31, prefix: "", suffix: " days", trend: "Watch", type: "days", color: "from-orange-300 to-yellow-100" },
  { key: "cac", label: "Blended CAC", value: 42, prefix: "$", suffix: "", trend: "-12%", type: "money", color: "from-yellow-300 to-yellow-100" },
  { key: "cashForecast", label: "Cash Burn Forecast", value: 14.2, prefix: "", suffix: " mo", trend: "+2.1 mo", type: "decimal", color: "from-indigo-300 to-cyan-100" },
  { key: "fulfillmentCost", label: "Fulfillment Cost / Order", value: 8.31, prefix: "$", suffix: "", trend: "-7%", type: "moneyDecimal", color: "from-fuchsia-300 to-cyan-100" },
  { key: "forecastAccuracy", label: "Forecast Accuracy", value: 94, prefix: "", suffix: "%", trend: "+9%", type: "percent", color: "from-lime-300 to-cyan-100" },
  { key: "customerPayback", label: "Customer Payback Period", value: 38, prefix: "", suffix: " days", trend: "-11 days", type: "days", color: "from-blue-300 to-cyan-100" },
];

function formatMetric(metric: (typeof metricCatalog)[number], multiplier: number) {
  const scaled = metric.key === "roas" || metric.key === "margin" || metric.key === "inventory" ? metric.value : metric.value * multiplier;

  if (metric.type === "money") return `${metric.prefix}${Math.round(scaled).toLocaleString()}`;
  if (metric.type === "moneyDecimal") return `${metric.prefix}${scaled.toFixed(2)}`;
  if (metric.type === "decimal") return `${scaled.toFixed(1)}${metric.suffix}`;
  if (metric.type === "percent") return `${Math.round(scaled)}${metric.suffix}`;
  if (metric.type === "days") return `${Math.round(scaled)}${metric.suffix}`;
  return `${metric.prefix}${Math.round(scaled).toLocaleString()}${metric.suffix}`;
}

function DataConnectionFlow() {
  const [activeSources, setActiveSources] = useState(["shopify", "amazon", "meta"]);
  const [activeRange, setActiveRange] = useState("7d");

  const sources = [
    { key: "shopify", name: "Shopify", short: "S", type: "Commerce", accent: "from-emerald-400 to-cyan-200", bg: "bg-emerald-400/10", border: "border-emerald-300/35" },
    { key: "amazon", name: "Amazon", short: "a", type: "Marketplace", accent: "from-orange-300 to-yellow-100", bg: "bg-orange-400/10", border: "border-orange-300/35" },
    { key: "meta", name: "Meta Ads", short: "∞", type: "Paid Social", accent: "from-cyan-300 to-blue-100", bg: "bg-cyan-400/10", border: "border-cyan-300/35" },
    { key: "google", name: "Google Ads", short: "G", type: "Paid Search", accent: "from-blue-400 to-yellow-100", bg: "bg-blue-400/10", border: "border-blue-300/35" },
    { key: "shipstation", name: "ShipStation", short: "⚙", type: "Shipping", accent: "from-sky-300 to-cyan-100", bg: "bg-sky-400/10", border: "border-sky-300/35" },
    { key: "hubspot", name: "HubSpot", short: "H", type: "CRM", accent: "from-orange-400 to-pink-100", bg: "bg-orange-400/10", border: "border-orange-300/35" },
  ];

  const intelligenceSignals = [
    {
      key: "multiChannelRevenue",
      title: "Multi-Channel Revenue",
      desc: "Total revenue across Shopify store and Amazon marketplace.",
      requires: ["shopify", "amazon"],
      value: "$482,216",
      trend: "+18.6%",
    },
    {
      key: "shopifyMetaRoas",
      title: "ROAS by Sales Channel",
      desc: "Meta ad performance tied directly to Shopify revenue.",
      requires: ["shopify", "meta"],
      value: "4.21x",
      trend: "+32.1%",
    },
    {
      key: "amazonMetaEfficiency",
      title: "Marketplace Ad Efficiency",
      desc: "Meta-driven demand compared against Amazon marketplace sales.",
      requires: ["amazon", "meta"],
      value: "3.47x",
      trend: "+21.4%",
    },
    {
      key: "shopifyGoogleSearch",
      title: "Search to Sales",
      desc: "Google Ads search performance tied to Shopify purchases.",
      requires: ["shopify", "google"],
      value: "3.88x",
      trend: "+14.9%",
    },
    {
      key: "amazonGoogleSales",
      title: "Search to Marketplace Sales",
      desc: "Google demand compared against Amazon marketplace revenue.",
      requires: ["amazon", "google"],
      value: "2.94x",
      trend: "+9.8%",
    },
    {
      key: "crossChannelRoas",
      title: "Cross-Channel ROAS",
      desc: "Meta and Google performance compared in one paid media view.",
      requires: ["meta", "google"],
      value: "3.62x",
      trend: "+17.2%",
    },
    {
      key: "shopifyShippingCost",
      title: "Shipping Cost by Channel",
      desc: "Fulfillment cost for Shopify orders by shipping method.",
      requires: ["shopify", "shipstation"],
      value: "$7.82",
      trend: "-6.5%",
    },
    {
      key: "amazonShippingCost",
      title: "FBA vs FBM Shipping Cost",
      desc: "Amazon fulfillment cost compared against ShipStation shipments.",
      requires: ["amazon", "shipstation"],
      value: "$8.91",
      trend: "-3.2%",
    },
    {
      key: "shopifyCustomerLtv",
      title: "Customer LTV",
      desc: "Lifetime value of Shopify customers tracked inside HubSpot.",
      requires: ["shopify", "hubspot"],
      value: "$186",
      trend: "+11.7%",
    },
    {
      key: "amazonCustomerValue",
      title: "Marketplace Customer Value",
      desc: "Amazon customer value connected to CRM follow-up activity.",
      requires: ["amazon", "hubspot"],
      value: "$142",
      trend: "+7.4%",
    },
    {
      key: "metaCustomerValue",
      title: "Ad Driven Customer Value",
      desc: "LTV of customers acquired from Meta campaigns.",
      requires: ["meta", "hubspot"],
      value: "$211",
      trend: "+24.3%",
    },
    {
      key: "googleCustomerValue",
      title: "Search Driven Customer Value",
      desc: "LTV of customers acquired from Google search demand.",
      requires: ["google", "hubspot"],
      value: "$198",
      trend: "+19.1%",
    },
    {
      key: "googleShippingLag",
      title: "Search Order Delivery Lag",
      desc: "Delivery speed for orders generated from Google Ads traffic.",
      requires: ["google", "shipstation"],
      value: "2.4d",
      trend: "-0.6d",
    },
    {
      key: "metaShippingLag",
      title: "Social Order Delivery Lag",
      desc: "Delivery speed for orders generated from Meta campaigns.",
      requires: ["meta", "shipstation"],
      value: "2.8d",
      trend: "-0.4d",
    },
    {
      key: "crmFulfillment",
      title: "Post-Purchase Experience",
      desc: "CRM follow-up performance connected to delivery completion.",
      requires: ["hubspot", "shipstation"],
      value: "91%",
      trend: "+8.0%",
    },
  ];

  const unlockedSignals = intelligenceSignals.filter((signal) =>
    signal.requires.every((source) => activeSources.includes(source))
  );

  const featuredSignals = unlockedSignals.slice(0, 4);
  const topSignal = unlockedSignals[0];

  const ranges = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "7d", label: "Last 7 Days" },
    { key: "30d", label: "Last 30 Days" },
  ];

  function toggleSource(key: string) {
    setActiveSources((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return [...current, key];
    });
  }

  function getSource(key: string) {
    return sources.find((source) => source.key === key);
  }

  return (
    <section id="demo" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_33%_35%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_58%_42%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_86%_72%,rgba(168,85,247,0.12),transparent_30%)]" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                Connect your systems. Unlock intelligence.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                BRHT combines your operational systems to create business intelligence that no single platform can deliver alone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">Sources Connected</p>
                <p className="mt-2 text-4xl font-black text-emerald-300">{activeSources.length}<span className="text-slate-500"> / 6</span></p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">Intelligence Signals</p>
                <p className="mt-2 text-4xl font-black text-orange-300">{unlockedSignals.length}<span className="text-slate-500"> / 15</span></p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 grid gap-6 xl:grid-cols-[0.48fr_0.52fr]">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-slate-300">Connect your data sources</p>
                <div className="grid gap-3">
                  {sources.map((source) => {
                    const active = activeSources.includes(source.key);

                    return (
                      <button
                        key={source.key}
                        onClick={() => toggleSource(source.key)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${active ? `${source.border} ${source.bg}` : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${source.accent} text-lg font-black text-slate-950 shadow-lg shadow-cyan-950/20`}>
                            {source.short}
                          </div>
                          <div>
                            <p className="font-black text-white">{source.name}</p>
                            <p className="text-sm text-slate-400">{source.type}</p>
                          </div>
                        </div>

                        <div className={`flex h-8 w-14 items-center rounded-full p-1 transition ${active ? "bg-emerald-400" : "bg-slate-700"}`}>
                          <div className={`h-6 w-6 rounded-full bg-white shadow transition ${active ? "translate-x-6" : "translate-x-0"}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative min-h-[520px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_55%)]" />

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 520" preserveAspectRatio="none">
                  {sources.map((source, index) => {
                    const active = activeSources.includes(source.key);
                    const positions = [
                      [78, 90],
                      [78, 205],
                      [78, 320],
                      [78, 435],
                      [118, 500],
                      [118, 20],
                    ];
                    const [x, y] = positions[index];
                    return (
                      <path
                        key={source.key}
                        d={`M ${x} ${y} C 210 ${y}, 230 260, 285 260`}
                        stroke={active ? "rgba(110, 231, 183, 0.85)" : "rgba(148, 163, 184, 0.25)"}
                        strokeWidth={active ? 3 : 2}
                        fill="none"
                        strokeDasharray={active ? "0" : "6 8"}
                      />
                    );
                  })}
                </svg>

                <div className="absolute left-[58%] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-cyan-300 bg-slate-950/80 shadow-[0_0_80px_rgba(34,211,238,0.35)]">
                    <div className="absolute inset-[-10px] rounded-full border border-cyan-300/25" />
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                        <BrainCircuit className="h-7 w-7" />
                      </div>
                      <p className="mt-4 text-sm font-black uppercase tracking-[0.24em] text-cyan-100">BRHT Core</p>
                      <p className="mt-2 text-sm leading-5 text-slate-300">Unified Operational Intelligence</p>
                    </div>
                  </div>
                </div>

                {sources.map((source, index) => {
                  const active = activeSources.includes(source.key);
                  const positions = [
                    "left-[6%] top-[12%]",
                    "left-[6%] top-[30%]",
                    "left-[6%] top-[48%]",
                    "left-[6%] top-[66%]",
                    "left-[14%] top-[82%]",
                    "left-[14%] top-[3%]",
                  ];

                  return (
                    <div key={source.key} className={`absolute ${positions[index]}`}>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-black transition ${active ? `${source.border} ${source.bg} text-white shadow-[0_0_22px_rgba(34,211,238,0.15)]` : "border-white/10 bg-white/[0.03] text-slate-500"}`}>
                        {source.short}
                      </div>
                    </div>
                  );
                })}

                <div className="absolute bottom-6 right-6 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-4 text-sm text-cyan-100">
                  <div className="flex items-center gap-3">
                    <Database className="h-6 w-6" />
                    <div>
                      <p className="font-black">All your data.</p>
                      <p className="text-slate-300">One source of truth.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">Intelligence Signals Unlocked</p>
                  <p className="mt-1 text-sm text-slate-400">Signals appear when the correct pair of systems is connected.</p>
                </div>
                <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                  {unlockedSignals.length} active
                </div>
              </div>

              <div className="grid max-h-[620px] gap-3 overflow-hidden lg:grid-cols-2 xl:grid-cols-3">
                {intelligenceSignals.map((signal) => {
                  const unlocked = signal.requires.every((source) => activeSources.includes(source));
                  const first = getSource(signal.requires[0]);
                  const second = getSource(signal.requires[1]);

                  return (
                    <div
                      key={signal.key}
                      className={`relative min-h-[124px] rounded-2xl border p-4 transition ${unlocked ? "border-emerald-300/35 bg-emerald-400/10" : "border-white/10 bg-white/[0.025] opacity-60"}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${first?.accent} text-sm font-black text-slate-950`}>{first?.short}</span>
                          <span className="text-slate-400">+</span>
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${second?.accent} text-sm font-black text-slate-950`}>{second?.short}</span>
                        </div>
                        {unlocked ? (
                          <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">Active</span>
                        ) : (
                          <Lock className="h-4 w-4 text-slate-500" />
                        )}
                      </div>

                      <p className="font-black text-white">{signal.title}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-400">{signal.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-white">Live Intelligence Dashboard</p>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-400">Auto-updated with connected data</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ranges.map((range) => (
                  <button
                    key={range.key}
                    onClick={() => setActiveRange(range.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${activeRange === range.key ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.75fr_1fr_1fr_1fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Connected</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sources.map((source) => {
                    const active = activeSources.includes(source.key);
                    return (
                      <div key={source.key} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${active ? `bg-gradient-to-br ${source.accent} text-slate-950` : "bg-white/[0.04] text-slate-600"}`}>
                        {source.short}
                      </div>
                    );
                  })}
                </div>
              </div>

              {(featuredSignals.length ? featuredSignals : intelligenceSignals.slice(0, 4)).map((signal, index) => {
                const active = unlockedSignals.some((item) => item.key === signal.key);
                const bars = [22, 28, 31, 45, 33, 39, 42, 57, 49, 66, 58, 79];

                return (
                  <div key={signal.key} className={`rounded-2xl border p-4 transition ${active ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] opacity-55"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-black text-white">{signal.title}</p>
                      {!active && <Lock className="h-4 w-4 text-slate-500" />}
                    </div>
                    <p className="mt-3 text-3xl font-black text-white">{active ? signal.value : "—"}</p>
                    <p className={`mt-1 text-sm font-bold ${active ? "text-emerald-300" : "text-slate-500"}`}>{active ? signal.trend : "Connect sources"}</p>
                    <div className="mt-4 flex h-16 items-end gap-1.5">
                      {bars.map((height, barIndex) => (
                        <div key={barIndex} className={`flex-1 rounded-t-md ${active ? "bg-gradient-to-t from-cyan-500 to-cyan-200" : "bg-white/10"}`} style={{ height: `${Math.max(12, height + index * 3)}%` }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-purple-300/20 bg-purple-400/10 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 text-purple-200" />
                <p className="leading-7 text-slate-300">
                  <span className="font-black text-purple-100">AI Insight:</span> {topSignal ? `${topSignal.title} is now live. BRHT can explain what changed, why it matters, and what action to take next.` : "Connect two systems to generate the first operational insight."}
                </p>
              </div>
              <Button className="rounded-full bg-purple-400/20 px-6 text-purple-100 hover:bg-purple-400/30">
                View Full Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function scrollToId(id: string) {
  const element = document.querySelector(id);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`BRHT Strategy Call Request${form.company ? ` - ${form.company}` : ""}`);
    const body = encodeURIComponent(
      `Name: ${form.name}
Email: ${form.email}
Company: ${form.company}

What they need help with:
${form.message}`
    );
    return `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
  }, [form]);

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

        <DataConnectionFlow />

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
