"use client";

import React from "react";
import { motion } from "framer-motion";
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
  MessageCircle,
  MousePointerClick,
  PlugZap,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    icon: Eye,
    label: "See",
    title: "Business intelligence",
    description:
      "Unify sales, ads, inventory, finance, and operations data into executive dashboards that show what is really happening.",
  },
  {
    icon: Zap,
    label: "Move",
    title: "Workflow automation",
    description:
      "Turn repetitive business processes into connected workflows that trigger actions, alerts, handoffs, and reports automatically.",
  },
  {
    icon: BrainCircuit,
    label: "Think",
    title: "AI operational insight",
    description:
      "Layer AI over your business data to explain changes, find risks, summarize performance, and recommend next actions.",
  },
];

const integrations = ["Shopify", "Amazon", "Meta Ads", "Google Ads", "Inventory", "Postgres", "Metabase", "n8n", "AI"];

const outcomes = [
  "Know revenue, ROAS, margin, and inventory position without logging into every platform.",
  "Spot problems earlier with automated alerts and anomaly detection.",
  "Replace manual spreadsheet reporting with a centralized operational data layer.",
  "Give founders, CFOs, and operators one clear source of truth.",
];

const process = [
  { icon: PlugZap, title: "Connect", desc: "We connect the platforms your business already runs on." },
  { icon: Database, title: "Centralize", desc: "Your data flows into a structured database built for reporting." },
  { icon: BarChart3, title: "Illuminate", desc: "Dashboards reveal the numbers, trends, and bottlenecks that matter." },
  { icon: Workflow, title: "Automate", desc: "We build workflows that move tasks, alerts, and reports without manual work." },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfbf4] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.26),transparent_26%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,0.24),transparent_28%),linear-gradient(180deg,#fffdf0_0%,#f8fafc_46%,#eef6ff_100%)]" />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-yellow-300 shadow-xl shadow-yellow-300/30">
            <Lightbulb className="h-6 w-6" />
            <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">BRHT Intelligence</p>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Bright operational clarity</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#platform" className="hover:text-slate-950">Platform</a>
          <a href="#outcomes" className="hover:text-slate-950">Outcomes</a>
          <a href="#pricing" className="hover:text-slate-950">Pricing</a>
        </nav>

        <Button className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
          Book a Demo
        </Button>
      </header>

      <main>
        <section className="relative px-6 pb-20 pt-14 md:pb-28 md:pt-20">
          <div className="absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-300/30 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-300/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                <SunMedium className="h-4 w-4 text-yellow-500" />
                BI, automation, and AI that illuminate your operations
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 md:text-7xl lg:text-8xl">
                Shed light on every part of your business.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                BRHT connects your tools, centralizes your data, automates the busywork, and uses AI to reveal what changed, what matters, and what to do next.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="rounded-full bg-cyan-500 px-8 text-slate-950 shadow-xl shadow-cyan-400/25 hover:bg-cyan-400">
                  Get an operations audit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-slate-300 bg-white/70 px-8 text-slate-900 hover:bg-white">
                  See the platform
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {integrations.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-yellow-300/45 via-cyan-300/30 to-white blur-2xl" />
              <Card className="overflow-hidden rounded-[2rem] border-white/80 bg-white/85 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
                <CardContent className="p-0">
                  <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-200">BRHT command center</p>
                        <h3 className="mt-1 text-2xl font-bold">Today’s operational signal</h3>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-slate-950 shadow-lg shadow-yellow-300/30">
                        <Lightbulb className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Revenue", "Blended ROAS", "Stockout Risk"].map((label, i) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="mt-2 text-2xl font-black">{["$18.4k", "3.7x", "31d"][i]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 p-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <LineChart className="h-4 w-4 text-cyan-500" /> Revenue clarity
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">+18%</span>
                      </div>
                      <div className="flex h-24 items-end gap-2">
                        {[35, 48, 42, 61, 56, 78, 68, 92, 84, 98].map((height, i) => (
                          <div key={i} className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500 to-yellow-300" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-yellow-50 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                          <Workflow className="h-4 w-4 text-yellow-600" /> Automation
                        </div>
                        <p className="text-sm leading-6 text-slate-600">Low inventory alert sent. Reorder task created. Owner notified.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-cyan-50 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                          <Bot className="h-4 w-4 text-cyan-600" /> AI insight
                        </div>
                        <p className="text-sm leading-6 text-slate-600">Meta spend rose, but margin fell due to product mix shift.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section id="platform" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-600">The BRHT layer</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">See. Move. Think.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Three connected layers that turn scattered business systems into operational clarity.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.title} className="rounded-[2rem] border-slate-200 bg-white/80 shadow-xl shadow-slate-900/5">
                    <CardContent className="p-8">
                      <div className="mb-6 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-yellow-300">{pillar.label}</div>
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-black">{pillar.title}</h3>
                      <p className="mt-4 leading-7 text-slate-600">{pillar.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="outcomes" className="px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-bold uppercase tracking-[0.24em] text-yellow-300">Why it matters</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Your business already has the data. We turn the lights on.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">BRHT gives operators the visibility of a BI team, the leverage of an automation team, and the strategic lift of AI without building a full internal data department.</p>
            </div>
            <div className="grid gap-4">
              {outcomes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
                  <p className="leading-7 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-600">How it works</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">From scattered platforms to a bright operating layer.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-4">
              {process.map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="rounded-[2rem] border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                    <CardContent className="p-6">
                      <Icon className="h-7 w-7 text-cyan-600" />
                      <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                      <p className="mt-3 leading-7 text-slate-600">{step.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-600">Pricing direction</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Start with clarity. Add automation and AI as you grow.</h2>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricing.map((tier) => (
                <Card key={tier.name} className={`rounded-[2rem] border shadow-xl shadow-slate-900/5 ${tier.featured ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-black">{tier.name}</h3>
                    <p className={`mt-3 leading-7 ${tier.featured ? "text-slate-300" : "text-slate-600"}`}>{tier.description}</p>
                    <div className="mt-6">
                      <p className="text-4xl font-black">{tier.price}</p>
                      <p className={`mt-2 text-sm font-bold ${tier.featured ? "text-yellow-300" : "text-cyan-600"}`}>{tier.setup}</p>
                    </div>
                    <div className="mt-7 space-y-3">
                      {tier.items.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${tier.featured ? "text-yellow-300" : "text-cyan-600"}`} />
                          <p>{item}</p>
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
          <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-yellow-200 bg-gradient-to-br from-yellow-100 via-white to-cyan-100 p-10 text-center shadow-2xl shadow-yellow-300/20 md:p-14">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-yellow-300 shadow-xl shadow-yellow-300/30">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">Ready to turn the lights on?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Book a BRHT operations audit and see where better data, automation, and AI can create immediate leverage.</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="rounded-full bg-slate-950 px-8 text-white hover:bg-slate-800">
                Book a Strategy Call <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-slate-300 bg-white/70 px-8 text-slate-900 hover:bg-white">
                <MessageCircle className="mr-2 h-4 w-4" /> Contact BRHT
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
