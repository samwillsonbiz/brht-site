"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  Eye,
  Lightbulb,
  LineChart,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  PlugZap,
  ShieldCheck,
  Sparkles,
  SunMedium,
  TrendingUp,
  Workflow,
  X,
  Zap,
} from "lucide-react";

const EMAIL_TO = "samwillsonbiz@gmail.com";

const navItems = [
  { label: "Live Demo", href: "#demo" },
  { label: "Platform", href: "#platform" },
  { label: "Systems", href: "#systems" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

const integrations = [
  "Shopify",
  "Amazon",
  "Meta Ads",
  "Google Ads",
  "ShipStation",
  "HubSpot",
  "Postgres",
  "Metabase",
  "AI",
];

const dashboardBars = [22, 28, 31, 45, 33, 39, 42, 57, 49, 66, 58, 79];

const sourceData = [
  {
    key: "shopify",
    name: "Shopify",
    type: "Commerce",
    logoSrc: "/logos/Shopify.svg",
    border: "border-emerald-400/70",
    panel: "bg-emerald-400/[0.11]",
    line: "#6ee7b7",
    start: { x: 326, y: 118 },
    control: { x: 410, y: 120 },
    node: { x: 486, y: 246 },
  },
  {
    key: "amazon",
    name: "Amazon",
    type: "Marketplace",
    logoSrc: "/logos/Amazon.svg",
    border: "border-orange-300/55",
    panel: "bg-orange-400/[0.10]",
    line: "#7dd3fc",
    start: { x: 326, y: 210 },
    control: { x: 408, y: 214 },
    node: { x: 486, y: 286 },
  },
  {
    key: "meta",
    name: "Meta Ads",
    type: "Paid Social",
    logoSrc: "/logos/Meta.svg",
    border: "border-cyan-300/65",
    panel: "bg-cyan-400/[0.11]",
    line: "#67e8f9",
    start: { x: 326, y: 302 },
    control: { x: 415, y: 304 },
    node: { x: 486, y: 326 },
  },
  {
    key: "google",
    name: "Google Ads",
    type: "Paid Search",
    logoSrc: "/logos/Googleads.svg",
    border: "border-blue-300/50",
    panel: "bg-blue-400/[0.08]",
    line: "#94a3b8",
    start: { x: 326, y: 394 },
    control: { x: 415, y: 394 },
    node: { x: 486, y: 366 },
  },
  {
    key: "shipstation",
    name: "ShipStation",
    type: "Shipping",
    logoSrc: "/logos/Shipstation.svg",
    border: "border-sky-300/45",
    panel: "bg-sky-400/[0.08]",
    line: "#94a3b8",
    start: { x: 326, y: 486 },
    control: { x: 415, y: 486 },
    node: { x: 486, y: 406 },
  },
  {
    key: "hubspot",
    name: "HubSpot",
    type: "CRM",
    logoSrc: "/logos/Hubspot.svg",
    border: "border-orange-300/55",
    panel: "bg-orange-400/[0.10]",
    line: "#94a3b8",
    start: { x: 326, y: 578 },
    control: { x: 405, y: 578 },
    node: { x: 486, y: 446 },
  },
];

const signalData = [
  {
    key: "multiChannelRevenue",
    title: "Multi-Channel Revenue",
    desc: "Total revenue across Shopify store and Amazon marketplace.",
    requires: ["shopify", "amazon"],
    value: "$482,216",
    trend: "↑ 18.6%",
    color: "emerald",
  },
  {
    key: "shopifyMetaRoas",
    title: "ROAS by Sales Channel",
    desc: "See ad performance tied to Shopify online store sales.",
    requires: ["shopify", "meta"],
    value: "4.21x",
    trend: "↑ 32.1%",
    color: "cyan",
  },
  {
    key: "amazonMetaEfficiency",
    title: "Marketplace Ad Efficiency",
    desc: "ROAS for ads driving Amazon marketplace sales.",
    requires: ["amazon", "meta"],
    value: "3.47x",
    trend: "↑ 21.4%",
    color: "orange",
  },
  {
    key: "shopifyGoogleSearch",
    title: "Search to Sales",
    desc: "Paid search performance tied to Shopify purchases.",
    requires: ["shopify", "google"],
    value: "3.88x",
    trend: "↑ 14.9%",
    color: "cyan",
  },
  {
    key: "amazonGoogleSales",
    title: "Search to Marketplace Sales",
    desc: "Paid search driving Amazon marketplace revenue.",
    requires: ["amazon", "google"],
    value: "2.94x",
    trend: "↑ 9.8%",
    color: "orange",
  },
  {
    key: "crossChannelRoas",
    title: "Cross-Channel ROAS",
    desc: "Compare Meta vs Google ad performance side by side.",
    requires: ["meta", "google"],
    value: "3.62x",
    trend: "↑ 17.2%",
    color: "cyan",
  },
  {
    key: "shopifyShippingCost",
    title: "Shipping Cost by Channel",
    desc: "Fulfillment cost for Shopify orders by shipping method.",
    requires: ["shopify", "shipstation"],
    value: "$7.82",
    trend: "↓ 6.5%",
    color: "emerald",
  },
  {
    key: "amazonShippingCost",
    title: "FBA vs FBM Shipping Cost",
    desc: "Compare Amazon fulfillment vs your shipping costs.",
    requires: ["amazon", "shipstation"],
    value: "$8.91",
    trend: "↓ 3.2%",
    color: "orange",
  },
  {
    key: "shopifyCustomerLtv",
    title: "Customer LTV",
    desc: "Lifetime value of Shopify customers in HubSpot.",
    requires: ["shopify", "hubspot"],
    value: "$186",
    trend: "↑ 11.7%",
    color: "emerald",
  },
  {
    key: "amazonCustomerValue",
    title: "Marketplace Customer Value",
    desc: "Track Amazon customer LTV inside HubSpot.",
    requires: ["amazon", "hubspot"],
    value: "$142",
    trend: "↑ 7.4%",
    color: "orange",
  },
  {
    key: "metaCustomerValue",
    title: "Ad Driven Customer Value",
    desc: "LTV of customers acquired from Meta Ads.",
    requires: ["meta", "hubspot"],
    value: "$211",
    trend: "↑ 24.3%",
    color: "cyan",
  },
  {
    key: "googleCustomerValue",
    title: "Search Driven Customer Value",
    desc: "LTV of customers acquired from Google Ads.",
    requires: ["google", "hubspot"],
    value: "$198",
    trend: "↑ 19.1%",
    color: "cyan",
  },
  {
    key: "googleShippingLag",
    title: "Search Order Delivery Lag",
    desc: "Delivery speed for orders generated from search.",
    requires: ["google", "shipstation"],
    value: "2.4d",
    trend: "↓ 0.6d",
    color: "cyan",
  },
  {
    key: "metaShippingLag",
    title: "Social Order Delivery Lag",
    desc: "Delivery speed for orders generated from social.",
    requires: ["meta", "shipstation"],
    value: "2.8d",
    trend: "↓ 0.4d",
    color: "cyan",
  },
  {
    key: "crmFulfillment",
    title: "Post-Purchase Experience",
    desc: "CRM follow-up performance after delivery.",
    requires: ["hubspot", "shipstation"],
    value: "91%",
    trend: "↑ 8.0%",
    color: "emerald",
  },
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

const systems = [
  {
    icon: TrendingUp,
    title: "Revenue signal",
    text: "Orders, AOV, refunds, contribution margin, customer cohorts, and channel attribution.",
  },
  {
    icon: BarChart3,
    title: "Ad performance",
    text: "Google, Meta, blended ROAS, spend pacing, creative signal, and profitability alerts.",
  },
  {
    icon: Bot,
    title: "AI summaries",
    text: "Daily executive briefings, trend explanations, anomaly notes, and next-action recommendations.",
  },
  {
    icon: ShieldCheck,
    title: "Data governance",
    text: "Clear source mapping, pipeline checks, error alerts, permissions, and documented logic.",
  },
];

const pricing = [
  {
    name: "Intelligence Foundation",
    price: "$1,500/mo",
    setup: "$5,000+ setup",
    items: ["Up to 4 core integrations", "Centralized data warehouse", "Executive dashboards", "Pipeline monitoring"],
  },
  {
    name: "Automation Layer",
    price: "$2,500/mo",
    setup: "$8,000+ setup",
    items: ["Everything in Foundation", "Workflow automation", "Alerts and handoffs", "Priority support"],
    featured: true,
  },
  {
    name: "BrightOps AI",
    price: "$4,000+/mo",
    setup: "$15,000+ setup",
    items: ["Everything in Automation", "AI insight summaries", "Anomaly detection", "Executive reports"],
  },
];

function Button({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition ${className}`}
    >
      {children}
    </button>
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

function SourceIcon({ sourceKey, className = "" }: { sourceKey: string; className?: string }) {
  const source = sourceData.find((item) => item.key === sourceKey);
  if (!source) return null;

  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-white p-1.5 ${className}`}>
      <img src={source.logoSrc} alt={`${source.name} logo`} className="h-full w-full object-contain" />
    </span>
  );
}

function LeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim();

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`BRHT Strategy Call Request${form.company ? ` - ${form.company}` : ""}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\n\nWhat they need help with:\n${form.message}`
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
              <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-slate-950">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Book a BRHT operations audit</h3>
              <p className="mt-3 leading-7 text-slate-300">
                Tell us what systems you use and where the business feels dark. This opens your email with everything prefilled.
              </p>
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

function DataConnectionFlow() {
  const [activeSources, setActiveSources] = useState(["shopify", "amazon", "meta"]);
  const [activeRange, setActiveRange] = useState("7d");

  const unlockedSignals = signalData.filter((signal) =>
    signal.requires.every((source) => activeSources.includes(source))
  );

  const featuredSignals = unlockedSignals.slice(0, 3);
  const topSignal = unlockedSignals[0];

  function toggleSource(key: string) {
    setActiveSources((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return [...current, key];
    });
  }

  return (
    <section id="demo" className="scroll-mt-24 px-6 py-16">
      <div className="mx-auto max-w-[1536px]">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#050917] p-8 shadow-2xl shadow-black/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(16,185,129,0.12),transparent_22%),radial-gradient(circle_at_45%_42%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_88%_82%,rgba(168,85,247,0.12),transparent_24%)]" />
          <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

          <div className="relative grid grid-cols-[1fr_auto] items-start gap-8">
            <div>
              <h2 className="text-[32px] font-black leading-tight tracking-[-0.035em] text-white md:text-[44px]">
                Connect your systems. Unlock intelligence.
              </h2>
              <p className="mt-3 max-w-[660px] text-[16px] leading-7 text-slate-300">
                BRHT combines your operational systems to create business intelligence that no single platform can deliver alone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-[84px] w-[180px] rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-300">Sources Connected</p>
                <p className="mt-1 text-[36px] font-black leading-none text-emerald-300">
                  {activeSources.length}<span className="text-slate-500"> / 6</span>
                </p>
              </div>
              <div className="h-[84px] w-[180px] rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-300">Intelligence Signals</p>
                <p className="mt-1 text-[36px] font-black leading-none text-orange-300">
                  {unlockedSignals.length}<span className="text-slate-500"> / 15</span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-[380px_360px_1fr] gap-5">
            <div className="h-[575px] rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="mb-5 text-[14px] font-black uppercase tracking-[0.16em] text-slate-300">Connect your data sources</p>
              <div className="space-y-3">
                {sourceData.map((source) => {
                  const active = activeSources.includes(source.key);

                  return (
                    <button
                      key={source.key}
                      onClick={() => toggleSource(source.key)}
                      className={`flex h-[75px] w-full items-center justify-between rounded-[18px] border px-4 text-left transition ${active ? `${source.border} ${source.panel}` : "border-white/10 bg-white/[0.035]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-2">
                          <img src={source.logoSrc} alt={`${source.name} logo`} className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <p className="text-[16px] font-black leading-tight text-white">{source.name}</p>
                          <p className="mt-1 text-[14px] text-slate-400">{source.type}</p>
                        </div>
                      </div>

                      <div className={`flex h-8 w-[54px] items-center rounded-full p-1 transition ${active ? "bg-emerald-400" : "bg-slate-700"}`}>
                        <div className={`h-6 w-6 rounded-full bg-white shadow transition ${active ? "translate-x-[22px]" : "translate-x-0"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative h-[575px] overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_63%_50%,rgba(34,211,238,0.22),transparent_50%)]" />

              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 575" preserveAspectRatio="none">
                {sourceData.map((source, index) => {
                  const active = activeSources.includes(source.key);
                  const y = 60 + index * 90;
                  const line = active ? source.line : "rgba(148,163,184,0.25)";
                  return (
                    <g key={source.key}>
                      <path
                        d={`M 42 ${y} C 122 ${y}, 130 288, 215 288`}
                        stroke={line}
                        strokeWidth={active ? 3.2 : 2}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={active ? "0" : "6 9"}
                        opacity={active ? 1 : 0.7}
                      />
                      <circle cx="38" cy={y} r="5" fill={line} opacity={active ? 1 : 0.8} />
                      {active && (
                        <>
                          <circle cx="120" cy={(y + 288) / 2} r="3" fill={line} opacity="0.9" />
                          <circle cx="154" cy={(y + 288) / 2 + 22} r="3" fill={line} opacity="0.75" />
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="absolute left-[58%] top-[50%] -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full border border-cyan-300 bg-[#050917]/90 shadow-[0_0_80px_rgba(34,211,238,0.36)]">
                  <div className="absolute inset-[-14px] rounded-full border border-cyan-300/20" />
                  <div className="absolute inset-[-28px] rounded-full border border-cyan-300/10" />
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_0_36px_rgba(103,232,249,0.35)]">
                      <BrainCircuit className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-[13px] font-black uppercase tracking-[0.24em] text-cyan-100">BRHT Core</p>
                    <p className="mt-2 text-[13px] leading-5 text-slate-300">Unified Operational<br />Intelligence</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 w-[190px] rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-5 py-4 text-sm text-cyan-100">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6" />
                  <div>
                    <p className="font-black text-cyan-100">All your data.</p>
                    <p className="text-slate-300">One source of truth.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[575px] overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-black uppercase tracking-[0.16em] text-slate-300">Intelligence Signals Unlocked</p>
                  <p className="mt-1 text-[13px] text-slate-400">New intelligence automatically appears when connected systems create new insights.</p>
                </div>
                <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-black text-emerald-300">
                  {unlockedSignals.length} active
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {signalData.slice(0, 12).map((signal) => {
                  const unlocked = signal.requires.every((source) => activeSources.includes(source));

                  return (
                    <div
                      key={signal.key}
                      className={`relative h-[125px] rounded-2xl border p-4 transition ${unlocked ? "border-emerald-300/35 bg-emerald-400/10" : "border-white/10 bg-white/[0.025] opacity-58"}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SourceIcon sourceKey={signal.requires[0]} className="h-8 w-8" />
                          <span className="text-slate-400">+</span>
                          <SourceIcon sourceKey={signal.requires[1]} className="h-8 w-8" />
                        </div>
                        {unlocked ? (
                          <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">Active</span>
                        ) : (
                          <Lock className="h-4 w-4 text-slate-500" />
                        )}
                      </div>

                      <p className="text-[14px] font-black leading-5 text-white">{signal.title}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-400">{signal.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[14px] font-black uppercase tracking-[0.16em] text-white">Live Intelligence Dashboard</p>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-400">Auto-updated with connected data</span>
              </div>
              <div className="flex gap-2">
                {[
                  ["today", "Today"],
                  ["yesterday", "Yesterday"],
                  ["7d", "Last 7 Days"],
                  ["30d", "Last 30 Days"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveRange(key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${activeRange === key ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[190px_1fr_1fr_1fr_1fr] gap-4">
              <div className="h-[154px] rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Connected</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sourceData.map((source) => {
                    const active = activeSources.includes(source.key);
                    return (
                      <div key={source.key} className={`flex h-8 w-8 items-center justify-center rounded-lg p-1.5 ${active ? "bg-white" : "bg-white/[0.04] opacity-40"}`}>
                        <img src={source.logoSrc} alt={`${source.name} logo`} className="h-full w-full object-contain" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {(featuredSignals.length ? featuredSignals : signalData.slice(0, 3)).map((signal, index) => (
                <MetricCard key={signal.key} signal={signal} index={index} active={unlockedSignals.some((item) => item.key === signal.key)} />
              ))}

              <div className="h-[154px] rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-black text-white">Top Performing Channel</p>
                    <p className="mt-4 text-[30px] font-black text-white">Meta Ads</p>
                    <p className="mt-1 text-sm text-slate-300">32% of total revenue</p>
                  </div>
                  <div className="relative h-24 w-24 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6_0_32%,rgba(255,255,255,0.1)_32%_100%)]">
                    <div className="absolute inset-3 grid place-items-center rounded-full bg-[#050917] text-sm font-black text-white">32%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-purple-300/20 bg-purple-400/10 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 text-purple-200" />
                <p className="leading-7 text-slate-300">
                  <span className="font-black text-purple-100">AI Insight:</span> {topSignal ? `${topSignal.title} is now live. BRHT can explain what changed, why it matters, and what action to take next.` : "Connect two systems to generate the first operational insight."}
                </p>
              </div>
              <Button className="bg-purple-400/20 text-purple-100 hover:bg-purple-400/30">
                View Full Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  signal,
  index,
  active,
}: {
  signal: (typeof signalData)[number];
  index: number;
  active: boolean;
}) {
  return (
    <div className={`h-[154px] rounded-2xl border p-4 transition ${active ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] opacity-55"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-black text-white">{signal.title}</p>
        {!active && <Lock className="h-4 w-4 text-slate-500" />}
      </div>
      <p className="mt-2 text-[30px] font-black tracking-tight text-white">{active ? signal.value : "—"}</p>
      <p className={`text-sm font-bold ${active ? "text-emerald-300" : "text-slate-500"}`}>{active ? signal.trend : "Connect sources"}</p>
      <div className="mt-3 flex h-10 items-end gap-1.5">
        {dashboardBars.map((height, barIndex) => (
          <div
            key={barIndex}
            className={`flex-1 rounded-t-md ${active ? "bg-gradient-to-t from-cyan-500 to-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]" : "bg-white/10"}`}
            style={{ height: `${Math.max(12, height + index * 3)}%` }}
          />
        ))}
      </div>
    </div>
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
            <Button className="border border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => handleNav("#demo")}>
              Live Demo
            </Button>
            <Button className="bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.25)] hover:bg-cyan-200" onClick={() => setModalOpen(true)}>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        <section className="relative px-6 pb-20 pt-16 md:pb-28 md:pt-24">
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
                <Button className="bg-cyan-300 px-8 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] hover:bg-cyan-200" onClick={() => setModalOpen(true)}>
                  Get an operations audit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button className="border border-white/15 bg-white/5 px-8 text-white hover:bg-white/10" onClick={() => handleNav("#demo")}>
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
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] text-white shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
                <div className="border-b border-white/10 bg-slate-950/70 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                        <LineChart className="h-5 w-5" />
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
              </div>
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
                  <div key={pillar.title} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 text-white shadow-xl shadow-slate-950/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/30">
                    <div className="mb-6 inline-flex rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-sm font-black tracking-[0.18em] text-yellow-200">{pillar.label}</div>
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black">{pillar.title}</h3>
                    <p className="mt-4 leading-7 text-slate-300">{pillar.description}</p>
                  </div>
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
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {systems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 text-white shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                    <Icon className="h-7 w-7 text-cyan-200" />
                    <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{item.text}</p>
                  </div>
                );
              })}
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
              {[
                { icon: PlugZap, title: "Connect", desc: "We connect the platforms your business already runs on." },
                { icon: Database, title: "Centralize", desc: "Your data flows into a structured warehouse built for reporting." },
                { icon: BarChart3, title: "Illuminate", desc: "Dashboards reveal the numbers, trends, and bottlenecks that matter." },
                { icon: Zap, title: "Automate", desc: "Workflows move tasks, alerts, and reports without manual effort." },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 text-white shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <Icon className="h-7 w-7 text-cyan-200" />
                      <span className="text-sm font-black text-white/20">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{step.desc}</p>
                  </div>
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
                <div key={tier.name} className={`rounded-[2rem] border p-8 text-white shadow-xl shadow-slate-950/25 backdrop-blur-xl ${tier.featured ? "border-cyan-300/40 bg-cyan-300/10 ring-1 ring-cyan-300/25" : "border-white/10 bg-white/[0.045]"}`}>
                  {tier.featured && <div className="mb-5 inline-flex rounded-full bg-cyan-300 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-950">Most popular</div>}
                  <h3 className="text-2xl font-black">{tier.name}</h3>
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
                </div>
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
              <Button className="bg-cyan-300 px-8 text-slate-950 hover:bg-cyan-200" onClick={() => setModalOpen(true)}>
                Book a Strategy Call <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a href={`mailto:${EMAIL_TO}?subject=${encodeURIComponent("BRHT Intelligence Inquiry")}`}>
                <Button className="w-full border border-white/15 bg-white/5 px-8 text-white hover:bg-white/10 sm:w-auto">
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
