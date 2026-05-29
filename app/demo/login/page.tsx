"use client";

import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";

export default function DemoLoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
            <Lightbulb />
          </div>
          <div>
            <h1 className="text-2xl font-black">BRHT Intelligence</h1>
            <p className="text-sm text-cyan-200">Demo login</p>
          </div>
        </div>

        <input
          className="mb-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          placeholder="sam@brht.ai"
        />

        <input
          className="mb-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          placeholder="Password"
          type="password"
        />

        <button
          onClick={() => router.push("/demo/companies")}
          className="w-full rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950 hover:bg-cyan-200"
        >
          Sign in to demo
        </button>
      </div>
    </main>
  );
}