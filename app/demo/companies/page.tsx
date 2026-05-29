"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { demoCompanies } from "../demoData";

export default function DemoCompaniesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-cyan-200 font-black uppercase tracking-[0.2em]">
          BRHT Demo
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Choose a company workspace.
        </h1>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {demoCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => router.push(`/demo/company/${company.id}`)}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
            >
              <p className="text-2xl font-black">{company.name}</p>
              <p className="mt-2 text-slate-400">{company.industry}</p>

              <div className="mt-6 rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                {company.connected} sources connected
              </div>

              <div className="mt-6 flex items-center font-black text-cyan-200">
                Open workspace <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}