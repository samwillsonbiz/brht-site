"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Database,
  Home,
  LineChart,
  Plug,
  Settings,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  connectors,
  dashboardCards,
  demoCompanies,
} from "../../demoData";

export default function CompanyHomePage() {
  const { id } = useParams();
  const router = useRouter();

  const company =
    demoCompanies.find((item) => item.id === id) ?? demoCompanies[0];

  const nav = [
    { label: "Overview", icon: Home, active: true },
    { label: "Executive", icon: BarChart3 },
    { label: "Marketing", icon: LineChart },
    { label: "Operations", icon: Truck },
    { label: "AI Insights", icon: Bot },
    { label: "Connections", icon: Plug },
    { label: "Settings", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-slate-950/90 p-5">
          <div className="mb-8">
            <p className="text-2xl font-black tracking-tight">BRHT</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-cyan-200">
              Intelligence
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-black">{company.name}</p>
            <p className="mt-1 text-xs text-slate-400">{company.plan}</p>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    item.active
                      ? "bg-cyan-300 text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="px-6 py-8 lg:px-10">
          <button
            onClick={() => router.push("/demo/companies")}
            className="mb-8 text-sm font-bold text-cyan-200"
          >
            ← Back to companies
          </button>

          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">
                Workspace Overview
              </p>
              <h1 className="mt-3 text-5xl font-black tracking-tight">
                Welcome back, {company.name}.
              </h1>
              <p className="mt-3 text-slate-300">
                Your business systems are connected and intelligence is updating.
              </p>
            </div>

            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-5 py-3 text-sm font-black text-emerald-200">
              {company.connected} sources live
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {[
              ["Revenue", "$482,216", "+18.6%"],
              ["True ROAS", "4.21x", "+32.1%"],
              ["Inventory Risk", "Low", "Healthy"],
              ["Delivery Lag", "2.4d", "-0.6d"],
            ].map(([label, value, note]) => (
              <div
                key={label}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-4xl font-black">{value}</p>
                <p className="mt-2 text-sm font-bold text-cyan-200">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">Dashboards</h2>
                <button
                  onClick={() =>
                    router.push(`/demo/company/${company.id}/dashboard`)
                  }
                  className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-black text-slate-950"
                >
                  Open Executive
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {dashboardCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      onClick={() =>
                        router.push(`/demo/company/${company.id}/${card.href}`)
                      }
                      className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-left transition hover:border-cyan-300/40"
                    >
                      <Icon className="mb-5 h-7 w-7 text-cyan-300" />
                      <p className="text-lg font-black">{card.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {card.description}
                      </p>
                      <p className="mt-5 flex items-center text-sm font-black text-cyan-200">
                        Open <ArrowRight className="ml-2 h-4 w-4" />
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-purple-300/20 bg-purple-400/10 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-300/15 text-purple-200">
                  <Sparkles />
                </div>
                <h2 className="text-2xl font-black">AI Recommendation</h2>
              </div>

              <p className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 leading-7 text-slate-300">
                Revenue is up 18.6%, but Amazon is contributing more of the
                growth than Shopify. Before scaling marketplace volume, review
                product-level margin and fee impact.
              </p>

              <p className="mt-4 rounded-2xl border border-purple-300/20 bg-slate-950/70 p-5 font-black leading-7 text-purple-100">
                Recommended action: Shift 15% of Meta spend toward higher-margin
                Shopify bundles.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="mb-5 text-2xl font-black">Connected Sources</h2>

              <div className="grid gap-3">
                {connectors.map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      <div>
                        <p className="font-black">{source.name}</p>
                        <p className="text-sm text-slate-400">{source.type}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-200">
                      Connected
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="mb-5 text-2xl font-black">Recent Insights</h2>

              <div className="space-y-4">
                {[
                  "Meta is driving efficient Shopify revenue, but repeat purchase value is strongest from Google Search.",
                  "Delivery lag improved by 0.6 days after fulfillment changes.",
                  "Amazon growth is strong, but contribution margin should be reviewed before scaling.",
                ].map((insight) => (
                  <div
                    key={insight}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                  >
                    <div className="mb-2 flex items-center gap-2 font-black text-cyan-200">
                      <Database className="h-4 w-4" />
                      Insight detected
                    </div>
                    <p className="leading-7 text-slate-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}