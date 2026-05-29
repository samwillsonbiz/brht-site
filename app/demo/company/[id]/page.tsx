"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.push("/demo/companies")}
          className="mb-8 text-sm font-bold text-cyan-200"
        >
          ← Back to companies
        </button>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">
            {company.plan}
          </p>

          <h1 className="mt-3 text-5xl font-black">{company.name}</h1>
          <p className="mt-3 text-slate-300">{company.industry}</p>

          <h2 className="mt-10 text-2xl font-black">Connected Sources</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {connectors.map((source) => (
              <div
                key={source.name}
                className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-300" />
                  <div>
                    <p className="font-black">{source.name}</p>
                    <p className="text-sm text-slate-400">{source.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-black">Dashboards</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-4">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.title}
                  onClick={() =>
                    router.push(`/demo/company/${company.id}/${card.href}`)
                  }
                  className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 text-left transition hover:border-cyan-300/40"
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
      </div>
    </main>
  );
}