"use client";

import { useParams, useRouter } from "next/navigation";
import { Bot, Sparkles } from "lucide-react";
import {
  aiInsights,
  aiRecommendation,
  demoCompanies,
  kpis,
} from "../../../demoData";

export default function ExecutiveDashboardPage() {
  const { id } = useParams();
  const router = useRouter();

  const company =
    demoCompanies.find((item) => item.id === id) ?? demoCompanies[0];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.push(`/demo/company/${company.id}`)}
          className="mb-8 text-sm font-bold text-cyan-200"
        >
          ← Back to workspace
        </button>

        <div className="mb-8">
          <p className="font-black uppercase tracking-[0.2em] text-cyan-200">
            Executive Dashboard
          </p>
          <h1 className="mt-3 text-5xl font-black">{company.name}</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-sm text-slate-400">{kpi.label}</p>
              <p className="mt-3 text-4xl font-black">{kpi.value}</p>
              <p className="mt-2 text-sm font-bold text-cyan-200">
                {kpi.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Metabase Dashboard</h2>
              <span className="rounded-full bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-200">
                Live data
              </span>
            </div>

            <div className="flex h-[460px] items-center justify-center rounded-[1.5rem] border border-dashed border-cyan-300/30 bg-slate-950/70 text-center">
              <div>
                <p className="text-2xl font-black">Metabase Embed Goes Here</p>
                <p className="mt-3 max-w-md text-slate-400">
                  Replace this box with your signed Metabase iframe once your
                  dashboard URL is ready.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-purple-300/20 bg-purple-400/10 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-300/15 text-purple-200">
                <Sparkles />
              </div>
              <h2 className="text-2xl font-black">AI Summary</h2>
            </div>

            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <p
                  key={insight}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 leading-7 text-slate-300"
                >
                  {insight}
                </p>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-purple-300/20 bg-slate-950/70 p-5">
              <div className="mb-3 flex items-center gap-2 font-black text-purple-100">
                <Bot className="h-5 w-5" />
                Recommendation
              </div>
              <p className="leading-7 text-purple-100">{aiRecommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}