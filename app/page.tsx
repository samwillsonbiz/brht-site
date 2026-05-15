"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Bot, CheckCircle2, Database, Gauge, Lock, RefreshCw, Settings2, Sparkles, Workflow, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    icon: BarChart3,
    title: "Business Intelligence",
    description:
      "Connect Shopify, Amazon, ads, inventory, finance, and operations data into one clean dashboard built for real decisions.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Replace repetitive manual work with smart workflows that move data, trigger actions, send alerts, and keep teams aligned.",
  },
  {
    icon: Bot,
    title: "AI Business Insights",
    description:
      "Layer AI on top of your company data to surface trends, explain changes, flag risks, and suggest next actions.",
  },
];

const outcomes = [
  "Daily sales, margin, ROAS, and inventory visibility",
  "Automated reporting across all major business systems",
  "Forecasts for inventory, reorder timing, and cash planning",
  "Custom dashboards by department, channel, or product line",
  "Automated alerts when something needs attention",
  "AI summaries that explain what changed and why it matters",
];

const pricing = [
  {
    name: "BI Foundation",
    price: "$1,500/mo",
    setup: "$5,000+ setup",
    description: "For businesses that need clean dashboards and automated data visibility.",
    items: ["Up to 4 core integrations", "Postgres data warehouse", "Metabase dashboards", "Monthly dashboard edits", "Pipeline monitoring"],
  },
  {
    name: "Ops Automation",
    price: "$2,500/mo",
    setup: "$8,000+ setup",
    description: "For teams that want dashboards plus automated workflows between tools.",
    items: ["Everything in BI Foundation", "Workflow automation buildout", "Alerts and trigger-based actions", "Process documentation", "Priority support"],
    featured: true,
  },
  {
    name: "Intelligent Ops",
    price: "$4,000+/mo",
    setup: "$15,000+ setup",
    description: "For companies that want BI, automation, and AI-assisted operations.",
    items: ["Everything in Ops Automation", "AI insight agents", "Weekly executive summaries", "Anomaly detection", "Custom forecasting models"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">Backbone BI</p>
            <p className="text-xs text-slate-400">Dashboards. Automation. AI.</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#solution" className="hover:text-white">Solution</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#process" className="hover:text-white">Process</a>
        </nav>
        <Button className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">Book a Demo</Button>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 py-20 md:py-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_35%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Built for growing businesses that are tired of spreadsheet chaos
              </div>
              <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
                The operating system behind your business decisions.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                We connect your tools, centralize your data, automate the busywork, and turn your numbers into clear dashboards and AI-powered insights.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="rounded-2xl bg-cyan-400 px-7 text-slate-950 hover:bg-cyan-300">
                  Get a Custom BI Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl border-slate-700 bg-transparent px-7 text-white hover:bg-slate-900">
                  See What We Build
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <Card className="rounded-[2rem] border-slate-800 bg-slate-900/80 shadow-2xl shadow-cyan-500/10 backdrop-blur">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Executive Dashboard</p>
                      <h3 className="text-2xl font-bold text-white">Today’s Performance</h3>
                    </div>
                    <Gauge className="h-8 w-8 text-cyan-300" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["Revenue", "ROAS", "Orders", "Inventory Days"].map((label, i) => (
                      <div key={label} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                        <p className="text-sm text-slate-400">{label}</p>
                        <p className="mt-2 text-3xl font-bold text-white">{["$18.4k", "3.7x", "214", "47"][i]}</p>
                        <p className="mt-2 text-xs text-cyan-300">Updated automatically</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950 p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                      <Bot className="h-4 w-4 text-cyan-300" /> AI Weekly Insight
                    </div>
                    <p className="text-sm leading-6 text-slate-300">
                      Google ROAS improved 18% week-over-week while Amazon conversion softened. Inventory risk detected for Product A within 31 days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section id="solution" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-semibold text-cyan-300">What we build</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">One backbone for data, work, and decisions.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Instead of logging into ten platforms, exporting CSVs, or guessing what happened, your business gets one source of truth.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.title} className="rounded-3xl border-slate-800 bg-slate-900">
                    <CardContent className="p-7">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                      <p className="mt-3 leading-7 text-slate-300">{pillar.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <p className="font-semibold text-cyan-300">Real outcomes</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">You get clarity without hiring an internal data team.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                We handle the setup, integrations, dashboards, data pipelines, and ongoing improvements so your team can simply use the system.
              </p>
            </div>
            <div className="grid gap-4">
              {outcomes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                  <p className="text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-semibold text-cyan-300">Simple pricing</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Start with dashboards. Add automation and AI as you grow.</h2>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricing.map((tier) => (
                <Card key={tier.name} className={`rounded-[2rem] border ${tier.featured ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-800 bg-slate-900 text-white"}`}>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <p className={`mt-3 leading-7 ${tier.featured ? "text-slate-800" : "text-slate-300"}`}>{tier.description}</p>
                    <div className="mt-6">
                      <p className="text-4xl font-bold">{tier.price}</p>
                      <p className={`mt-2 text-sm ${tier.featured ? "text-slate-700" : "text-slate-400"}`}>{tier.setup}</p>
                    </div>
                    <div className="mt-7 space-y-3">
                      {tier.items.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                          <p>{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-slate-400">
              Additional integrations, complex workflows, custom AI models, or major rebuilds are scoped separately.
            </p>
          </div>
        </section>

        <section id="process" className="bg-slate-900/60 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-semibold text-cyan-300">How it works</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">From messy systems to one connected operating layer.</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {[
  { icon: Settings2, title: "Map", desc: "We identify your tools, KPIs, manual work, and reporting gaps." },
  { icon: Database, title: "Connect", desc: "We build secure data pipelines into a centralized database." },
  { icon: Zap, title: "Automate", desc: "We create dashboards, workflows, alerts, and recurring reports." },
  { icon: RefreshCw, title: "Improve", desc: "We monitor, refine, and add new views as your business changes." },
].map(({ icon: StepIcon, title, desc }) => {
                
                return (
                  <Card key={title} className="rounded-3xl border-slate-800 bg-slate-950">
                    <CardContent className="p-6">
                      <StepIcon className="h-7 w-7 text-cyan-300" />
                      <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
                      <p className="mt-3 leading-7 text-slate-300">{desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center shadow-2xl shadow-cyan-500/10 md:p-14">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Ready to build your business backbone?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Get the visibility of a BI platform, the efficiency of automation, and the decision support of AI — without hiring a full internal data team.
            </p>
            <Button size="lg" className="mt-8 rounded-2xl bg-cyan-400 px-8 text-slate-950 hover:bg-cyan-300">
              Schedule a Strategy Call <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
