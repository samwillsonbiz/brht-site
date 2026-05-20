"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  Eye,
  Lightbulb,
  LineChart,
  Lock,
  Mail,
  Menu,
  MessageCircle,
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

const EMAIL_TO = "samwillsonbiz@gmail.com";

type SourceKey =
  | "shopify"
  | "amazon"
  | "meta"
  | "google"
  | "shipstation"
  | "hubspot";

type Source = {
  key: SourceKey;
  name: string;
  type: string;
  logoSrc: string;
  activeTone: string;
  borderTone: string;
  line: string;
};

type Signal = {
  key: string;
  title: string;
  desc: string;
  requires: [SourceKey, SourceKey];
  value: string;
  trend: string;
  chartTone: string;
};

const navItems = [
  { label: "Live Demo", href: "#demo" },
  { label: "BRHT Layer", href: "#platform" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

const sources: Source[] = [
  {
    key: "shopify",
    name: "Shopify",
    type: "Commerce",
    logoSrc: "/logos/Shopify.svg",
    activeTone: "bg-emerald-400/[0.10]",
    borderTone: "border-emerald-300/35",
    line: "rgba(110, 231, 183, 0.96)",
  },
  {
    key: "amazon",
    name: "Amazon",
    type: "Marketplace",
    logoSrc: "/logos/Amazon.svg",
    activeTone: "bg-orange-400/[0.09]",
    borderTone: "border-orange-300/35",
    line: "rgba(251, 191, 36, 0.92)",
  },
  {
    key: "meta",
    name: "Meta Ads",
    type: "Paid Social",
    logoSrc: "/logos/Meta.svg",
    activeTone: "bg-cyan-400/[0.10]",
    borderTone: "border-cyan-300/35",
    line: "rgba(103, 232, 249, 0.96)",
  },
  {
    key: "google",
    name: "Google Ads",
    type: "Paid Search",
    logoSrc: "/logos/Googleads.svg",
    activeTone: "bg-blue-400/[0.09]",
    borderTone: "border-blue-300/35",
    line: "rgba(96, 165, 250, 0.92)",
  },
  {
    key: "shipstation",
    name: "ShipStation",
    type: "Shipping",
    logoSrc: "/logos/Shipstation.svg",
    activeTone: "bg-sky-400/[0.09]",
    borderTone: "border-sky-300/35",
    line: "rgba(125, 211, 252, 0.9)",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    type: "CRM",
    logoSrc: "/logos/Hubspot.svg",
    activeTone: "bg-orange-400/[0.09]",
    borderTone: "border-orange-300/35",
    line: "rgba(251, 146, 60, 0.9)",
  },
];
const intelligenceOutcomeCards = [
  {
    title: "True ROAS",
    icon: CircleDollarSign,
    chart: "line" as const,
    tone: "text-cyan-300",
    chartTone: "from-cyan-500 to-emerald-200",
  },
  {
    title: "Customer LTV",
    icon: BrainCircuit,
    chart: "donut" as const,
    tone: "text-violet-300",
    chartTone: "from-violet-500 to-purple-200",
  },
  {
    title: "Inventory Forecasting",
    icon: Database,
    chart: "steps" as const,
    tone: "text-orange-300",
    chartTone: "from-orange-500 to-yellow-200",
  },
  {
    title: "Fulfillment Delays",
    icon: Radar,
    chart: "spark" as const,
    tone: "text-sky-300",
    chartTone: "from-blue-500 to-sky-200",
  },
  {
    title: "Channel Efficiency",
    icon: TrendingUp,
    chart: "stack" as const,
    tone: "text-emerald-300",
    chartTone: "from-emerald-500 to-green-200",
  },
  {
    title: "AI Next Actions",
    icon: Sparkles,
    chart: "bars" as const,
    tone: "text-fuchsia-300",
    chartTone: "from-purple-500 to-fuchsia-200",
  },
];
const intelligenceSignals: Signal[] = [
  {
    key: "multiChannelRevenue",
    title: "Multi-Channel Revenue",
    desc: "Total revenue across Shopify store and Amazon marketplace.",
    requires: ["shopify", "amazon"],
    value: "$482,216",
    trend: "+18.6%",
    chartTone: "from-emerald-500 to-cyan-200",
  },
  {
    key: "shopifyMetaRoas",
    title: "ROAS by Sales Channel",
    desc: "Meta ad performance tied directly to Shopify revenue.",
    requires: ["shopify", "meta"],
    value: "4.21x",
    trend: "+32.1%",
    chartTone: "from-cyan-500 to-sky-200",
  },
  {
    key: "amazonMetaEfficiency",
    title: "Marketplace Ad Efficiency",
    desc: "ROAS for ads driving Amazon marketplace sales.",
    requires: ["amazon", "meta"],
    value: "3.47x",
    trend: "+21.4%",
    chartTone: "from-orange-500 to-yellow-200",
  },
  {
    key: "shopifyGoogleSearch",
    title: "Search to Sales",
    desc: "Paid search performance tied to Shopify purchases.",
    requires: ["shopify", "google"],
    value: "3.88x",
    trend: "+14.9%",
    chartTone: "from-blue-500 to-cyan-200",
  },
  {
    key: "amazonGoogleSales",
    title: "Search to Marketplace Sales",
    desc: "Paid search driving Amazon marketplace revenue.",
    requires: ["amazon", "google"],
    value: "2.94x",
    trend: "+9.8%",
    chartTone: "from-blue-500 to-yellow-200",
  },
  {
    key: "crossChannelRoas",
    title: "Cross-Channel ROAS",
    desc: "Compare Meta vs Google ad performance side by side.",
    requires: ["meta", "google"],
    value: "3.62x",
    trend: "+17.2%",
    chartTone: "from-cyan-500 to-blue-200",
  },
  {
    key: "shopifyShippingCost",
    title: "Shipping Cost by Channel",
    desc: "Fulfillment cost for Shopify orders by shipping method.",
    requires: ["shopify", "shipstation"],
    value: "$7.82",
    trend: "-6.5%",
    chartTone: "from-emerald-500 to-sky-200",
  },
  {
    key: "amazonShippingCost",
    title: "FBA vs FBM Shipping Cost",
    desc: "Compare Amazon fulfillment vs your shipping costs.",
    requires: ["amazon", "shipstation"],
    value: "$8.91",
    trend: "-3.2%",
    chartTone: "from-orange-500 to-sky-200",
  },
  {
    key: "shopifyCustomerLtv",
    title: "Customer LTV",
    desc: "Lifetime value of Shopify customers in HubSpot.",
    requires: ["shopify", "hubspot"],
    value: "$186",
    trend: "+11.7%",
    chartTone: "from-emerald-500 to-orange-200",
  },
  {
    key: "amazonCustomerValue",
    title: "Marketplace Customer Value",
    desc: "Track Amazon customer value inside HubSpot.",
    requires: ["amazon", "hubspot"],
    value: "$142",
    trend: "+7.4%",
    chartTone: "from-orange-500 to-amber-200",
  },
  {
    key: "metaCustomerValue",
    title: "Ad Driven Customer Value",
    desc: "LTV of customers acquired from Meta Ads.",
    requires: ["meta", "hubspot"],
    value: "$211",
    trend: "+24.3%",
    chartTone: "from-cyan-500 to-orange-200",
  },
  {
    key: "googleCustomerValue",
    title: "Search Driven Customer Value",
    desc: "LTV of customers acquired from Google Ads.",
    requires: ["google", "hubspot"],
    value: "$198",
    trend: "+19.1%",
    chartTone: "from-blue-500 to-orange-200",
  },
  {
    key: "googleShippingLag",
    title: "Search Order Delivery Lag",
    desc: "Delivery speed for orders from Google Ads traffic.",
    requires: ["google", "shipstation"],
    value: "2.4d",
    trend: "-0.6d",
    chartTone: "from-blue-500 to-sky-200",
  },
  {
    key: "metaShippingLag",
    title: "Social Order Delivery Lag",
    desc: "Delivery speed for orders from Meta campaigns.",
    requires: ["meta", "shipstation"],
    value: "2.8d",
    trend: "-0.4d",
    chartTone: "from-cyan-500 to-sky-200",
  },
  {
    key: "crmFulfillment",
    title: "Post-Purchase Experience",
    desc: "CRM follow-up performance connected to delivery.",
    requires: ["hubspot", "shipstation"],
    value: "91%",
    trend: "+8.0%",
    chartTone: "from-orange-500 to-sky-200",
  },
];

const pillars = [
  {
    icon: Eye,
    label: "SEE",
    title: "Business intelligence",
    description:
      "Unify sales, ads, fulfillment, CRM, and operations data into executive dashboards that show what is really happening.",
  },
  {
    icon: Workflow,
    label: "MOVE",
    title: "Workflow automation",
    description:
      "Turn repetitive processes into connected workflows that trigger alerts, reports, handoffs, and tasks automatically.",
  },
  {
    icon: BrainCircuit,
    label: "THINK",
    title: "AI operational insight",
    description:
      "Layer AI over business data to explain changes, surface risks, summarize performance, and recommend next actions.",
  },
];

const systems = [
  {
    icon: CircleDollarSign,
    title: "Revenue signal",
    text: "Orders, refunds, margin, channel revenue, and customer value.",
  },
  {
    icon: TrendingUp,
    title: "Ad performance",
    text: "Google, Meta, blended ROAS, spend pacing, and profitability alerts.",
  },
  {
    icon: Radar,
    title: "Fulfillment clarity",
    text: "Shipping cost, delivery lag, operational drag, and post-purchase experience.",
  },
  {
    icon: Bot,
    title: "AI summaries",
    text: "Daily executive briefings, anomaly notes, and next-action recommendations.",
  },
  {
    icon: ClipboardCheck,
    title: "Ops workflows",
    text: "Task creation, owner handoff, alerts, reporting cadences, and SOP automation.",
  },
  {
    icon: ShieldCheck,
    title: "Data governance",
    text: "Source mapping, pipeline checks, error alerts, permissions, and documented logic.",
  },
];

const pricing = [
  {
    name: "Intelligence Foundation",
    price: "$1,500/mo",
    setup: "$5,000+ setup",
    description: "For businesses that need dashboards, reporting, and one source of truth.",
    items: [
      "Up to 4 core integrations",
      "Centralized data warehouse",
      "Executive dashboards",
      "Monthly dashboard edits",
      "Pipeline monitoring",
    ],
  },
  {
    name: "Automation Layer",
    price: "$2,500/mo",
    setup: "$8,000+ setup",
    description: "For teams that want intelligence plus workflow automation.",
    items: [
      "Everything in Foundation",
      "Workflow automation",
      "Alerts and handoffs",
      "Process documentation",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "BrightOps AI",
    price: "$4,000+/mo",
    setup: "$15,000+ setup",
    description: "For companies that want BI, automation, and AI-assisted operations.",
    items: [
      "Everything in Automation",
      "AI insight summaries",
      "Anomaly detection",
      "Forecasting support",
      "Executive strategy reports",
    ],
  },
];

const dashboardBars = [18, 24, 26, 34, 28, 31, 36, 46, 39, 51, 44, 68];

const dashboardBarSets = {
  today: [
    [16, 22, 24, 32, 26, 28, 34, 44, 36, 49, 40, 63],
    [18, 25, 27, 36, 30, 33, 38, 48, 41, 52, 45, 60],
    [20, 24, 29, 38, 31, 34, 40, 46, 43, 52, 48, 59],
  ],
  yesterday: [
    [28, 35, 31, 46, 39, 42, 50, 58, 54, 67, 61, 76],
    [24, 32, 40, 48, 43, 51, 57, 65, 60, 73, 68, 82],
    [22, 29, 37, 44, 49, 53, 59, 69, 63, 75, 70, 79],
  ],
  "7d": [
    [18, 24, 26, 34, 28, 31, 36, 46, 39, 51, 44, 68],
    [20, 29, 33, 43, 36, 40, 48, 58, 52, 65, 58, 74],
    [23, 28, 34, 44, 37, 41, 49, 57, 53, 64, 60, 72],
  ],
  "30d": [
    [30, 36, 42, 48, 54, 49, 58, 63, 70, 66, 76, 84],
    [26, 34, 39, 45, 52, 47, 55, 61, 67, 64, 71, 78],
    [22, 29, 35, 40, 45, 42, 48, 53, 57, 61, 65, 70],
  ],
} as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function scrollToId(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

function PrimaryButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 shadow-[0_0_35px_rgba(103,232,249,0.22)] transition hover:bg-cyan-200",
        className
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-bold text-white transition hover:bg-white/[0.08]",
        className
      )}
    >
      {children}
    </button>
  );
}

function LeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim();

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(
      `BRHT Strategy Call Request${form.company ? ` - ${form.company}` : ""}`
    );
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\n\nWhat they need help with:\n${form.message}`
    );
    return `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
  }, [form]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 px-4 backdrop-blur-xl"
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
              <button
                onClick={onClose}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
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
              {[
                ["name", "Your name"],
                ["email", "Email"],
                ["company", "Company"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:ring-4"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ))}

              <textarea
                className="min-h-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:ring-4"
                placeholder="What do you want visibility, automation, or AI help with?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />

              <a
                href={canSubmit ? mailto : undefined}
                onClick={(e) => {
                  if (!canSubmit) e.preventDefault();
                }}
                className={cx(
                  "inline-flex items-center justify-center rounded-full px-6 py-3 font-bold transition",
                  canSubmit
                    ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                    : "cursor-not-allowed bg-white/10 text-slate-500"
                )}
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

function SourceLogo({
  source,
  size = "md",
}: {
  source: Source;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 rounded-lg p-1.5",
    md: "h-12 w-12 rounded-xl p-2",
    lg: "h-16 w-16 rounded-2xl p-2.5",
  };

  return (
    <div className={cx("flex items-center justify-center bg-white shadow-lg shadow-black/25", sizes[size])}>
      <img src={source.logoSrc} alt={`${source.name} logo`} className="h-full w-full object-contain" />
    </div>
  );
}
function MiniOutcomeChart({
  type,
  tone,
}: {
  type: "bars" | "line" | "donut" | "stack" | "spark" | "steps";
  tone: string;
}) {
  if (type === "line") {
    return (
      <svg viewBox="0 0 160 46" className="h-12 w-full overflow-visible">
        <path
          d="M4 36 C22 30, 28 34, 42 25 C56 15, 66 23, 78 18 C96 10, 106 16, 120 9 C138 2, 146 7, 156 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className={tone}
        />
      </svg>
    );
  }

  if (type === "donut") {
    return (
      <div className={cx("flex items-center gap-3", tone)}>
        <div
          className="relative h-14 w-14 rounded-full"
          style={{
            background:
              "conic-gradient(currentColor 0 68%, rgba(255,255,255,0.13) 68% 100%)",
          }}
        >
          <div className="absolute inset-3 rounded-full bg-[#050917]" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-20 rounded-full bg-white/20" />
          <div className="h-2 w-14 rounded-full bg-white/10" />
          <div className="h-2 w-24 rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (type === "stack") {
    return (
      <div className="space-y-2">
        {[78, 58, 86].map((width, i) => (
          <div key={i} className="h-2.5 rounded-full bg-white/10">
            <div
              className={cx("h-full rounded-full bg-gradient-to-r", tone)}
              style={{ width: `${width}%` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (type === "spark") {
    return (
      <div className="grid grid-cols-6 gap-1.5">
        {[22, 36, 28, 54, 46, 72].map((height, i) => (
          <div
            key={i}
            className={cx("rounded-t-md bg-gradient-to-t", tone)}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    );
  }

  if (type === "steps") {
    return (
      <div className="flex items-end gap-2">
        {[28, 40, 54, 70].map((height, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cx("w-full rounded-xl bg-gradient-to-t", tone)}
              style={{ height: `${height}px` }}
            />
            <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-12 items-end gap-1.5">
      {[18, 24, 28, 36, 34, 42, 58, 72].map((height, i) => (
        <div
          key={i}
          className={cx("flex-1 rounded-t-md bg-gradient-to-t", tone)}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function DataConnectionFlow() {
  const [activeSources, setActiveSources] = useState<SourceKey[]>(["shopify", "amazon", "meta", "google", "shipstation", "hubspot"]);
  const [activeRange, setActiveRange] = useState("7d");
  const flowPanelRef = useRef<HTMLDivElement | null>(null);
  const sourceButtonRefs = useRef<Record<SourceKey, HTMLButtonElement | null>>({
    shopify: null,
    amazon: null,
    meta: null,
    google: null,
    shipstation: null,
    hubspot: null,
  });
  const [connectorStarts, setConnectorStarts] = useState<Record<SourceKey, { x: number; y: number }> | null>(null);

  const unlockedSignals = intelligenceSignals.filter((signal) =>
    signal.requires.every((source) => activeSources.includes(source))
  );

  const featuredSignals = unlockedSignals.length
    ? unlockedSignals.slice(0, 3)
    : intelligenceSignals.slice(0, 3);

  const topSignal = unlockedSignals[1] || unlockedSignals[0];

  const ranges = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "7d", label: "Last 7 Days" },
    { key: "30d", label: "Last 30 Days" },
  ];

  const dashboardMetrics = {
    today: [
      {
        title: "Multi-Channel Revenue",
        value: "$2,184",
        trend: "+6.8%",
        detail: "Today revenue pace",
        chartTone: "from-emerald-500 to-cyan-200",
        insight:
          "Revenue is pacing above the daily average, mostly from Shopify and Amazon activity. Watch whether the afternoon traffic keeps the same conversion rate.",
      },
      {
        title: "ROAS by Sales Channel",
        value: "3.14x",
        trend: "+8.2%",
        detail: "Today paid efficiency",
        chartTone: "from-cyan-500 to-sky-200",
        insight:
          "Ad efficiency is healthy today, but it is not as strong as the 7-day average. Keep spend steady until conversion quality proves it can hold.",
      },
      {
        title: "Marketplace Ad Efficiency",
        value: "2.91x",
        trend: "+5.4%",
        detail: "Today Amazon impact",
        chartTone: "from-orange-500 to-yellow-200",
        insight:
          "Amazon-driven ad performance is positive today, but marketplace efficiency is lagging the Shopify-side return. Check search terms before scaling.",
      },
      {
        title: "Top Performing Channel",
        value: "Shopify",
        trend: "41%",
        detail: "of today revenue",
        chartTone: "from-purple-500 to-violet-200",
        insight:
          "Shopify is leading today’s revenue mix. If this continues, prioritize onsite conversion and cart recovery over marketplace pushes today.",
      },
    ],
    yesterday: [
      {
        title: "Multi-Channel Revenue",
        value: "$3,946",
        trend: "+11.3%",
        detail: "Yesterday revenue",
        chartTone: "from-emerald-500 to-cyan-200",
        insight:
          "Yesterday had stronger revenue volume than today, with solid marketplace contribution. Compare traffic source mix to see what changed.",
      },
      {
        title: "ROAS by Sales Channel",
        value: "3.76x",
        trend: "+18.5%",
        detail: "Yesterday paid efficiency",
        chartTone: "from-cyan-500 to-sky-200",
        insight:
          "Yesterday’s paid traffic converted efficiently across connected channels. The strongest play is to identify which campaign carried the lift.",
      },
      {
        title: "Marketplace Ad Efficiency",
        value: "3.22x",
        trend: "+13.1%",
        detail: "Yesterday Amazon impact",
        chartTone: "from-orange-500 to-yellow-200",
        insight:
          "Amazon marketplace ads performed well yesterday. Keep an eye on whether the result came from higher conversion or simply higher spend.",
      },
      {
        title: "Top Performing Channel",
        value: "Amazon",
        trend: "38%",
        detail: "of yesterday revenue",
        chartTone: "from-purple-500 to-violet-200",
        insight:
          "Amazon was yesterday’s strongest revenue channel. This suggests marketplace demand was unusually strong and may deserve follow-up spend.",
      },
    ],
    "7d": [
      {
        title: "Multi-Channel Revenue",
        value: "$482,216",
        trend: "+18.6%",
        detail: "Last 7 days",
        chartTone: "from-emerald-500 to-cyan-200",
        insight:
          "Revenue is trending upward across Shopify and Amazon over the last 7 days. The next step is separating organic lift from paid-driven lift.",
      },
      {
        title: "ROAS by Sales Channel",
        value: "4.21x",
        trend: "+32.1%",
        detail: "Last 7 days",
        chartTone: "from-cyan-500 to-sky-200",
        insight:
          "ROAS is strongest over the last 7 days, suggesting recent ad optimization is working. This is the strongest card to investigate before scaling budget.",
      },
      {
        title: "Marketplace Ad Efficiency",
        value: "3.47x",
        trend: "+21.4%",
        detail: "Last 7 days",
        chartTone: "from-orange-500 to-yellow-200",
        insight:
          "Amazon ad efficiency is improving and contributing meaningful marketplace revenue. Consider testing whether the same audience also converts on Shopify.",
      },
      {
        title: "Top Performing Channel",
        value: "Meta Ads",
        trend: "32%",
        detail: "of total revenue",
        chartTone: "from-purple-500 to-violet-200",
        insight:
          "Meta Ads is the top performing channel for the last 7 days. BRHT should watch for fatigue and compare Meta’s revenue quality against Google and Amazon.",
      },
    ],
    "30d": [
      {
        title: "Multi-Channel Revenue",
        value: "$1.84M",
        trend: "+24.9%",
        detail: "Last 30 days",
        chartTone: "from-emerald-500 to-cyan-200",
        insight:
          "The 30-day view shows strong multi-channel revenue growth. This is a good executive-level signal, but margin and fulfillment cost should be reviewed next.",
      },
      {
        title: "ROAS by Sales Channel",
        value: "3.68x",
        trend: "+19.7%",
        detail: "Last 30 days",
        chartTone: "from-cyan-500 to-sky-200",
        insight:
          "ROAS is stable over 30 days, though slightly below the 7-day peak. Recent improvements may not be fully reflected in the longer window yet.",
      },
      {
        title: "Marketplace Ad Efficiency",
        value: "3.09x",
        trend: "+12.8%",
        detail: "Last 30 days",
        chartTone: "from-orange-500 to-yellow-200",
        insight:
          "Marketplace ad efficiency is profitable but improving slower than Shopify-side performance. Review Amazon campaign structure and product-level profitability.",
      },
      {
        title: "Top Performing Channel",
        value: "Meta Ads",
        trend: "35%",
        detail: "of total revenue",
        chartTone: "from-purple-500 to-violet-200",
        insight:
          "Meta Ads is the strongest channel over the last 30 days. The key question is whether Meta is creating new demand or capturing demand from other channels.",
      },
    ],
  };

  const [selectedDashboardCard, setSelectedDashboardCard] = useState(1);
  const activeDashboardMetrics = dashboardMetrics[activeRange as keyof typeof dashboardMetrics];
  const selectedInsight = activeDashboardMetrics[selectedDashboardCard];

  function toggleSource(key: SourceKey) {
    setActiveSources((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return [...current, key];
    });
  }

  function getSource(key: SourceKey) {
    return sources.find((source) => source.key === key)!;
  }

  useEffect(() => {
    function calculateConnectorStarts() {
      const panel = flowPanelRef.current;
      if (!panel) return;

      const panelRect = panel.getBoundingClientRect();
      const nextStarts = sources.reduce((acc, source) => {
        const button = sourceButtonRefs.current[source.key];
        if (!button) return acc;

        const buttonRect = button.getBoundingClientRect();

        // Convert real DOM pixel positions into the SVG's 920 x 620 viewBox.
        // This keeps every connector locked to the exact vertical center of its card,
        // even if card height, spacing, font rendering, or responsive width changes.
        acc[source.key] = {
          x: ((buttonRect.right - panelRect.left) / panelRect.width) * 920,
          y: ((buttonRect.top + buttonRect.height / 2 - panelRect.top) / panelRect.height) * 620,
        };

        return acc;
      }, {} as Record<SourceKey, { x: number; y: number }>);

      setConnectorStarts(nextStarts);
    }

    calculateConnectorStarts();
    window.addEventListener("resize", calculateConnectorStarts);

    const observer = new ResizeObserver(calculateConnectorStarts);
    if (flowPanelRef.current) observer.observe(flowPanelRef.current);
    sources.forEach((source) => {
      const button = sourceButtonRefs.current[source.key];
      if (button) observer.observe(button);
    });

    return () => {
      window.removeEventListener("resize", calculateConnectorStarts);
      observer.disconnect();
    };
  }, []);

  return (
    <section id="demo" className="scroll-mt-24 px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1536px]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#030712] px-4 py-5 md:rounded-[34px] md:px-8 md:py-8 shadow-[0_0_120px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_38%_38%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_88%_84%,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_18%_16%,rgba(16,185,129,0.13),transparent_26%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.075] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.24)_48%,rgba(2,6,23,0.78)_100%)]" />

          <div className="relative z-10 mb-5 overflow-hidden rounded-[26px] border border-cyan-300/20 bg-white/[0.025] px-6 py-5 text-center shadow-[0_0_70px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="relative mx-auto max-w-[1400px]">
              <div className="mb-3 flex items-center justify-center gap-3">
                <span className="inline-flex animate-[liveDemoPulse_2.4s_ease-in-out_infinite] items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-300/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.45)]">
  <Sparkles className="h-3.5 w-3.5" />
  Live Demo
</span>
              </div>

              <h2 className="text-[clamp(32px,7.5vw,64px)] lg:whitespace-nowrap font-black leading-none tracking-[-0.055em] text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.18)]">
                Connect your systems. Unlock intelligence.
              </h2>

              <p className="mt-3 text-[clamp(14px,1.25vw,19px)] font-medium leading-7 text-slate-300 xl:whitespace-nowrap">
                BRHT combines your operational systems to create business intelligence that no single platform can deliver alone.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-5 xl:grid-cols-[0.5fr_0.5fr]"></div>
            <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl md:hidden">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-slate-300">
                Connect Your Data Sources
              </p>

              <div className="grid gap-3">
                {sources.map((source) => {
                  const active = activeSources.includes(source.key);

                  return (
                    <button
                      key={source.key}
                      onClick={() => toggleSource(source.key)}
                      className={cx(
                        "flex items-center justify-between rounded-[18px] border px-3 py-3 text-left transition",
                        active
                          ? `${source.borderTone} ${source.activeTone}`
                          : "border-white/10 bg-white/[0.035]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <SourceLogo source={source} size="sm" />
                        <div>
                          <p className="text-sm font-black text-white">{source.name}</p>
                          <p className="text-xs text-slate-400">{source.type}</p>
                        </div>
                      </div>

                      <div
                        className={cx(
                          "flex h-7 w-12 items-center rounded-full p-1 transition",
                          active ? "bg-emerald-400" : "bg-slate-700"
                        )}
                      >
                        <div
                          className={cx(
                            "h-5 w-5 rounded-full bg-white shadow transition",
                            active ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[24px] border border-cyan-300/25 bg-slate-950/70 p-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-cyan-200/30 bg-gradient-to-br from-cyan-200 via-cyan-300 to-emerald-300 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.4)]">
                  <div className="relative">
                    <Lightbulb className="h-8 w-8" />
                    <Sparkles className="absolute -right-2 -top-2 h-3.5 w-3.5 text-slate-950" />
                  </div>
                </div>
                <p className="mt-4 text-base font-black uppercase tracking-[0.28em] text-white">
                  BRHT Core
                </p>
                <p className="mt-2 text-sm leading-5 text-slate-300">
                  Unified operational intelligence from every connected source.
                </p>

                <div className="mt-5 rounded-[18px] border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                  <div className="flex items-center justify-center gap-3">
                    <Database className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-black text-cyan-100">All your data.</p>
                      <p className="text-xs text-slate-300">One source of truth.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div ref={flowPanelRef} className="relative hidden md:block min-h-[600px] overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.025] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_50%,rgba(34,211,238,0.25),transparent_48%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_45%,rgba(16,185,129,0.10),transparent_32%)]" />

              <div className="absolute left-5 top-5 z-30 w-[360px]">
                <p className="mb-5 text-sm font-black uppercase tracking-[0.22em] text-slate-300">
                  Connect Your Data Sources
                </p>

                <div className="grid gap-3">
                  {sources.map((source) => {
                    const active = activeSources.includes(source.key);

                    return (
                      <button
                        key={source.key}
                        ref={(node) => {
                          sourceButtonRefs.current[source.key] = node;
                        }}
                        onClick={() => toggleSource(source.key)}
                        className={cx(
                          "group relative flex h-[78px] items-center justify-between rounded-[20px] border px-4 text-left transition",
                          active
                            ? `${source.borderTone} ${source.activeTone} shadow-[0_0_34px_rgba(16,185,129,0.08)]`
                            : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <SourceLogo source={source} size="md" />
                          <div>
                            <p className="text-base font-black text-white">{source.name}</p>
                            <p className="text-sm text-slate-400">{source.type}</p>
                          </div>
                        </div>

                        <div
                          className={cx(
                            "flex h-8 w-14 items-center rounded-full p-1 transition",
                            active ? "bg-emerald-400" : "bg-slate-700"
                          )}
                        >
                          <div
                            className={cx(
                              "h-6 w-6 rounded-full bg-white shadow transition",
                              active ? "translate-x-6" : "translate-x-0"
                            )}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="absolute left-[45%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

              <svg
                className="absolute inset-0 z-0 h-full w-full"
                viewBox="0 0 920 620"
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="flowGlowCombined" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <linearGradient id="activeFlowCombined" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(110,231,183,0.95)" />
                    <stop offset="55%" stopColor="rgba(103,232,249,0.95)" />
                    <stop offset="100%" stopColor="rgba(34,211,238,0.95)" />
                  </linearGradient>

                  <linearGradient id="inactiveFlowCombined" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(148,163,184,0.30)" />
                    <stop offset="100%" stopColor="rgba(148,163,184,0.14)" />
                  </linearGradient>
                </defs>

                {sources.map((source, index) => {
                  const active = activeSources.includes(source.key);

                  const measuredStart = connectorStarts?.[source.key];
                  const fallbackCardTop = 57;
                  const fallbackCardHeight = 78;
                  const fallbackGap = 12;
                  const startX = measuredStart?.x ?? 380;
                  const startY =
                    measuredStart?.y ?? fallbackCardTop + index * (fallbackCardHeight + fallbackGap) + fallbackCardHeight / 2;
                  const elbowX = startX + 42;
                  const endX = 620;
                  const endY = 310;

                  const path = `M ${startX} ${startY} L ${elbowX} ${startY} C ${elbowX + 70} ${startY}, 535 ${endY}, ${endX} ${endY}`;

                  return (
                    <g key={source.key}>
                      <path
                        d={path}
                        stroke={active ? "url(#activeFlowCombined)" : "url(#inactiveFlowCombined)"}
                        strokeWidth={active ? 11 : 5}
                        fill="none"
                        strokeLinecap="round"
                        opacity={active ? 0.13 : 0.08}
                        filter={active ? "url(#flowGlowCombined)" : undefined}
                      />

                      <path
                        d={path}
                        stroke={active ? "url(#activeFlowCombined)" : "url(#inactiveFlowCombined)"}
                        strokeWidth={active ? 3.4 : 2}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={active ? "0" : "8 10"}
                        opacity={active ? 0.88 : 0.42}
                      />

                      <circle
                        cx={startX}
                        cy={startY}
                        r={active ? 5.5 : 4.5}
                        fill={active ? "rgba(110,231,183,1)" : "rgba(148,163,184,0.55)"}
                        filter={active ? "url(#flowGlowCombined)" : undefined}
                      />

                      <circle
                        cx={endX}
                        cy={endY}
                        r={active ? 5 : 4}
                        fill={active ? "rgba(34,211,238,1)" : "rgba(148,163,184,0.35)"}
                        filter={active ? "url(#flowGlowCombined)" : undefined}
                      />

                      {active && (
                        <>
                          <circle r="4.2" fill="rgba(167,243,208,1)" filter="url(#flowGlowCombined)">
                            <animateMotion dur="2.2s" repeatCount="indefinite" path={path} />
                          </circle>

                          <circle r="3.2" fill="rgba(103,232,249,1)" filter="url(#flowGlowCombined)">
                            <animateMotion dur="2.2s" begin="0.55s" repeatCount="indefinite" path={path} />
                          </circle>

                          <circle r="2.4" fill="rgba(255,255,255,0.9)">
                            <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path={path} />
                          </circle>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="absolute left-[70%] top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex h-[250px] w-[250px] items-center justify-center rounded-full border border-cyan-300 bg-[#020617]/95 shadow-[0_0_120px_rgba(34,211,238,0.44)]">
                  <div className="absolute inset-[-14px] rounded-full border border-cyan-300/20" />
                  <div className="absolute inset-[-28px] rounded-full border border-cyan-300/10" />
                  <div className="absolute inset-[-42px] rounded-full border border-cyan-300/5" />

                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-cyan-200/30 bg-gradient-to-br from-cyan-200 via-cyan-300 to-emerald-300 text-slate-950 shadow-[0_0_48px_rgba(103,232,249,0.6)]">
                      <div className="relative">
                        <Lightbulb className="h-10 w-10" />
                        <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-slate-950" />
                      </div>
                    </div>

                    <p className="mt-6 text-xl font-black uppercase tracking-[0.28em] text-white">
                      BRHT Core
                    </p>

                    <p className="mt-3 text-sm leading-5 text-slate-300">
                      Unified Operational
                      <br />
                      Intelligence
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-[70%] z-30 -translate-x-1/2 rounded-[18px] border border-cyan-300/35 bg-cyan-300/10 px-6 py-4 text-sm text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6" />
                  <div>
                    <p className="font-black text-cyan-100">All your data.</p>
                    <p className="text-slate-300">One source of truth.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl md:p-5">
  <div className="mb-5">
    <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-300">
      Intelligence Unlocked
    </p>
    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
      Turn your connected data into the insights that drive profitable decisions.
    </p>
  </div>

  <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl md:p-5">
  <div className="mb-5">
    <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-300">
      Intelligence Unlocked
    </p>
    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
      Clear business insights from every connected system.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    {intelligenceOutcomeCards.map((card) => {
      const Icon = card.icon;

      return (
        <div
          key={card.title}
          className="group relative min-h-[170px] overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/45 p-5 pb-14 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.045] hover:shadow-[0_0_35px_rgba(34,211,238,0.12)]"
        >
          <div
            className={cx(
              "absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-30",
              card.tone
            )}
          />

          <div className="relative flex items-start gap-4">
            <div
              className={cx(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.16)]",
                card.tone
              )}
            >
              <Icon className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-black leading-tight tracking-tight text-white">
  {card.title}
</h3>
          </div>

         <div className={cx("relative", card.tone)}>
  <MiniOutcomeChart type={card.chart} tone={card.chartTone} />
</div>
        </div>
      );
    })}
  </div>
</div>
          </div>

          <div className="relative z-10 mt-5 rounded-[26px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-white">Live Intelligence Dashboard</p>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-400">
                  Auto-updated with connected data
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ranges.map((range) => (
                  <button
                    key={range.key}
                    onClick={() => setActiveRange(range.key)}
                    className={cx(
                      "rounded-full px-3 py-1.5 text-xs font-bold transition",
                      activeRange === range.key
                        ? "bg-cyan-300 text-slate-950 shadow-[0_0_22px_rgba(103,232,249,0.35)]"
                        : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.72fr_1fr_1fr_1fr_1fr]">
              <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Connected</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sources.map((source) => {
                    const active = activeSources.includes(source.key);
                    return (
                      <div
                        key={source.key}
                        className={cx(
                          "flex h-8 w-8 items-center justify-center rounded-lg p-1.5",
                          active ? "bg-white" : "bg-white/[0.04] opacity-35"
                        )}
                      >
                        <img src={source.logoSrc} alt={`${source.name} logo`} className="h-full w-full object-contain" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeDashboardMetrics.map((metric, index) => {
                const selected = selectedDashboardCard === index;
                const isTopChannel = index === 3;

                return (
                  <button
                    key={metric.title}
                    onClick={() => setSelectedDashboardCard(index)}
                    className={cx(
                      "overflow-hidden rounded-[18px] border p-4 text-left transition",
                      isTopChannel
                        ? selected
                          ? "border-purple-300/35 bg-purple-400/[0.14] shadow-[0_0_35px_rgba(168,85,247,0.18)]"
                          : "border-purple-300/10 bg-purple-400/[0.08] hover:border-purple-300/25"
                        : selected
                          ? "border-cyan-300/50 bg-[linear-gradient(180deg,rgba(8,47,73,0.72),rgba(2,6,23,0.82))] shadow-[0_0_35px_rgba(34,211,238,0.16)]"
                          : "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.45),rgba(2,6,23,0.65))] hover:border-cyan-300/35"
                    )}
                  >
                    {isTopChannel ? (
  <div className="flex h-full flex-col justify-between">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-black text-white">
          {metric.title}
        </p>

        <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
          {metric.value}
        </p>

        <p className="mt-2 text-sm text-slate-300">
          {metric.trend} {metric.detail}
        </p>
      </div>

      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #8b5cf6 0 32%, rgba(255,255,255,0.12) 32% 100%)",
          }}
        />

        <div className="absolute inset-[10px] rounded-full bg-[#050917]" />

        <div className="relative text-sm font-black text-white">
          32%
        </div>
      </div>
    </div>

    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        <span>Revenue Share</span>
        <span>Meta Leads</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-[32%] rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-300 shadow-[0_0_16px_rgba(168,85,247,0.45)]" />
      </div>

      <div className="mt-4 flex items-end gap-1">
        {[18, 26, 22, 34, 41, 38, 52, 58].map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500 to-fuchsia-300 opacity-90"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  </div>
) : (
                      <>
                        <p className="font-black text-white">{metric.title}</p>
                        <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{metric.value}</p>
                        <p className="mt-1 text-sm font-bold text-emerald-300">{metric.trend}</p>

                        <div className="mt-4 flex h-14 items-end gap-1.5">
                          {(dashboardBarSets[activeRange as keyof typeof dashboardBarSets]?.[index] ?? dashboardBars).map((height, barIndex) => (
                            <div
                              key={barIndex}
                              className={cx(
                                "flex-1 rounded-t-md shadow-[0_0_12px_rgba(34,211,238,0.25)]",
                                `bg-gradient-to-t ${metric.chartTone}`
                              )}
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-purple-300/20 bg-purple-400/10 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-purple-200" />
                <p className="leading-7 text-slate-300">
                  <span className="font-black text-purple-100">AI Insight:</span>{" "}
                  <span className="font-black text-white">{selectedInsight.title}:</span>{" "}
                  {selectedInsight.insight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.15),transparent_32%),linear-gradient(180deg,#020617_0%,#06111f_42%,#020617_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.075] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:54px_54px]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button onClick={() => scrollToId("#top")} className="flex items-center gap-3 text-left">
            <LogoMark />
            <div>
              <p className="text-xl font-black tracking-tight">BRHT Intelligence</p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/70">
                Illuminate operations
              </p>
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
            <SecondaryButton className="px-5" onClick={() => handleNav("#demo")}>
              Live Demo
            </SecondaryButton>
            <PrimaryButton onClick={() => setModalOpen(true)}>Book Meeting</PrimaryButton>
          </div>

          <button className="rounded-full border border-white/10 p-3 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-white/10 md:hidden"
            >
              <div className="grid gap-2 px-6 py-5">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNav(item.href)}
                    className="rounded-2xl px-4 py-3 text-left text-slate-200 hover:bg-white/10"
                  >
                    {item.label}
                  </button>
                ))}
                <PrimaryButton className="mt-2" onClick={() => setModalOpen(true)}>
                  Book Audit
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        <section className="relative px-4 pb-14 pt-12 md:px-6 md:pb-24 md:pt-20">
          <div className="absolute left-1/2 top-24 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-14">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-sm font-medium text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur">
                <SunMedium className="h-4 w-4 text-yellow-300" />
                BI + automation + AI for operators who need clarity
              </div>

              <h1 className="max-w-5xl text-[clamp(48px,13vw,84px)] font-black leading-[0.92] tracking-[-0.055em] text-white lg:text-8xl">
                Turn scattered data into a living command center.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-xl md:leading-8">
                BRHT connects your tools, centralizes your data, automates the busywork, and uses AI to reveal what changed, what matters, and what to do next.
              </p>

              <div className="mt-9 flex">
                <PrimaryButton className="px-9" onClick={() => setModalOpen(true)}>
                  Book Meeting <ArrowRight className="ml-2 h-4 w-4" />
                </PrimaryButton>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-cyan-300/18 via-cyan-300/16 to-indigo-500/14 blur-2xl" />
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
                    <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                      Live
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Revenue", "$18.4k", "+18%"],
                      ["Blended ROAS", "3.7x", "+0.4"],
                      ["Delivery Lag", "2.8d", "Watch"],
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
                      <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                        Signal improving
                      </span>
                    </div>
                    <div className="flex h-28 items-end gap-2">
                      {[42, 55, 49, 68, 62, 81, 74, 96, 88, 100, 92, 116].map((height, i) => (
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
                      <p className="text-sm leading-6 text-slate-300">Shipping cost alert sent. Owner notified.</p>
                    </div>
                    <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-100">
                        <Bot className="h-4 w-4 text-cyan-200" /> AI insight
                      </div>
                      <p className="text-sm leading-6 text-slate-300">Meta is driving efficient Shopify revenue.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-y border-cyan-200/35 bg-[linear-gradient(90deg,#dffbff_0%,#cbf7ef_48%,#fff0c7_100%)] px-6 py-7 text-slate-950 md:py-9 shadow-[0_0_80px_rgba(34,211,238,0.12)]">
          <div className="mx-auto grid max-w-7xl gap-8 text-center md:grid-cols-4 md:divide-x md:divide-slate-950/15">
            <div className="px-4">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">Built for</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">Operators</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">founders, CFOs, and teams who need clarity fast</p>
            </div>

            <div className="px-4">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">Connect</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">6 core systems</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">commerce, ads, fulfillment, CRM, and operations</p>
            </div>

            <div className="px-4">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">Unlock</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">15 signals</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">cross-platform intelligence no single app shows</p>
            </div>

            <div className="px-4">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">Result</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">BI + AI</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">one command center for smarter decisions</p>
            </div>
          </div>
        </section>

        <DataConnectionFlow />

        <section id="platform" className="scroll-mt-24 bg-cyan-50 px-4 py-14 md:px-6 md:py-20 text-slate-950">
  <div className="mx-auto max-w-7xl">
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-black uppercase tracking-[0.24em] text-cyan-700">
        The BRHT Layer
      </p>
      <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
        See. Move. Think.
      </h2>
      <p className="mt-5 text-lg leading-8 text-slate-600">
        BRHT connects intelligence, automation, and AI into one progressive operating layer.
      </p>
    </div>

    <div className="relative mt-14 grid gap-8 lg:grid-cols-3">
      <div className="absolute left-[18%] right-[18%] top-1/2 hidden h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-yellow-300 lg:block" />

      {pillars.map((pillar, index) => {
        const Icon = pillar.icon;

        return (
          <div key={pillar.title} className="relative">
            {index < 2 && (
              <div className="absolute -right-7 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-200 bg-white shadow-xl lg:flex">
                <ArrowRight className="h-6 w-6 text-cyan-700" />
              </div>
            )}

            <div className="relative z-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="mb-6 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
                {pillar.label}
              </div>

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                <Icon className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-950">{pillar.title}</h3>

              <p className="mt-4 leading-7 text-slate-600">
                {pillar.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>

<section id="process" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
  <div className="mx-auto max-w-7xl">
    <div className="mx-auto max-w-4xl text-center">
      <p className="font-black uppercase tracking-[0.24em] text-cyan-200">
        What Working With BRHT Looks Like
      </p>

      <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
        From disconnected systems to operational clarity in four stages.
      </h2>

      <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
        BRHT becomes the operational layer between your tools, reporting, workflows,
        and executive decision-making.
      </p>
    </div>

    <div className="relative mt-10 md:mt-16">
      <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-cyan-300/0 via-cyan-300/60 to-emerald-300/0 lg:block" />

      <div className="grid gap-6 lg:grid-cols-4">
        {[
          {
            step: "01",
            title: "Discovery",
            caption: "Usually completed in 1–2 strategy sessions.",
            items: [
              "Audit your operational stack",
              "Identify reporting blind spots",
              "Define the KPIs that matter",
              "Prioritize highest-value integrations",
            ],
          },
          {
            step: "02",
            title: "Integration",
            caption: "Your systems begin speaking the same language.",
            items: [
              "Connect commerce, ads, CRM, and fulfillment",
              "Centralize data into a warehouse",
              "Validate source accuracy",
              "Map business logic clearly",
            ],
          },
          {
            step: "03",
            title: "Intelligence Layer",
            caption: "Your business becomes measurable in real time.",
            items: [
              "Executive dashboards",
              "Operational reporting",
              "Automated alerts",
              "AI summaries and anomaly detection",
            ],
          },
          {
            step: "04",
            title: "Ongoing Operations",
            caption: "BRHT evolves alongside your operations.",
            items: [
              "Continuous optimization",
              "Dashboard iteration",
              "Workflow refinement",
              "Strategic operational insights",
            ],
          },
        ].map((stage) => (
          <div key={stage.step} className="relative">
            <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/35 bg-slate-950 text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
              <span className="text-xl font-black">{stage.step}</span>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
              <h3 className="text-2xl font-black text-white">{stage.title}</h3>

              <p className="mt-3 text-sm leading-6 text-cyan-100">
                {stage.caption}
              </p>

              <div className="mt-6 space-y-3">
                {stage.items.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

<section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#eef6fb] py-10 text-slate-950">
  <div className="mx-auto mb-7 max-w-7xl px-6 text-center">
    <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">
      Operator Feedback
    </p>
  </div>

  <div className="relative flex overflow-hidden">
    {[0, 1].map((row) => (
      <div
        key={row}
        aria-hidden={row === 1}
        className="testimonial-marquee flex min-w-full shrink-0 gap-5 px-4 md:gap-8"
      >
        {[
          {
            quote:
              "BRHT finally gave us one clear place to see what was happening across revenue, ads, and operations.",
            name: "Operations Lead",
            company: "Commerce Brand",
          },
          {
            quote:
              "The biggest win was getting out of manual reporting. We can see problems earlier and act faster.",
            name: "Founder",
            company: "DTC Business",
          },
          {
            quote:
              "Our systems were creating data, but not clarity. BRHT connected the dots in a way our team could actually use.",
            name: "CEO",
            company: "Growth Company",
          },
          {
            quote:
              "The AI summaries make the dashboards easier to understand. We know what changed and what to look at next.",
            name: "Marketing Director",
            company: "Multi-Channel Seller",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex min-h-[250px] w-[300px] shrink-0 flex-col justify-between rounded-[1.5rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] md:min-h-[280px] md:w-[420px] md:rounded-[2rem] md:p-8"
          >
            <div>
              <div className="mb-7 text-xl tracking-[0.12em] text-yellow-400">
                ★★★★★
              </div>

              <p className="text-base font-medium leading-7 text-slate-900 md:text-xl md:leading-8">
                “{item.quote}”
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-lg font-black text-white">
                {item.name[0]}
              </div>

              <div>
                <p className="font-black uppercase tracking-[0.08em] text-slate-950">
                  {item.name}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {item.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
</section>

        <section id="pricing" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-200">Pricing direction</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Start with clarity. Add automation and AI as you grow.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricing.map((tier) => (
                <div
                  key={tier.name}
                  className={cx(
                    "rounded-[2rem] border p-8 text-white shadow-xl shadow-slate-950/25 backdrop-blur-xl",
                    tier.featured
                      ? "border-cyan-300/40 bg-cyan-300/10 ring-1 ring-cyan-300/25"
                      : "border-white/10 bg-white/[0.045]"
                  )}
                >
                  {tier.featured && (
                    <div className="mb-5 inline-flex rounded-full bg-cyan-300 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
                      Most popular
                    </div>
                  )}
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
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Book a BRHT operations audit and see where better data, automation, and AI can create immediate leverage.
            </p>
            <div className="mt-8 flex justify-center">
              <PrimaryButton className="px-8" onClick={() => setModalOpen(true)}>
                Book Meeting <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-black">BRHT Intelligence</p>
              <p className="text-sm text-slate-400">Business intelligence, automation, and AI operations.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" /> Secure data pipelines
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> {EMAIL_TO}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
