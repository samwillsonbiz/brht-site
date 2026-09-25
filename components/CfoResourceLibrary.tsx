"use client";

import React, { useState } from "react";
import { openBrhtBooking } from "@/lib/booking";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  FileBarChart2,
  LineChart,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";

type ResourceId = "cash-forecast" | "cfo-report" | "systems";

type Resource = {
  id: ResourceId;
  category: string;
  read: string;
  title: string;
  intro: string;
};

const resources: Resource[] = [
  {
    id: "cash-forecast",
    category: "FORECASTING",
    read: "8 MIN READ",
    title: "How to Build a 13-Week Cash Flow Forecast",
    intro:
      "A practical operating forecast that gives leadership enough detail to manage near-term cash without pretending the future is perfectly predictable.",
  },
  {
    id: "cfo-report",
    category: "REPORTING",
    read: "6 MIN READ",
    title: "What Your Monthly CFO Report Should Actually Include",
    intro:
      "A useful CFO report should not simply summarize the accounting system. It should tell leadership what changed, why it matters and what to do next.",
  },
  {
    id: "systems",
    category: "FINANCE SYSTEMS",
    read: "7 MIN READ",
    title: "Xero vs QuickBooks vs NetSuite: When to Use Each",
    intro:
      "The right finance system is less about brand preference and more about the complexity your business needs to manage today and over the next few years.",
  },
];

function ForecastArtwork() {
  return (
    <div className="relative h-[205px] overflow-hidden bg-[#10201b] p-5">
      <div className="absolute right-[-42px] top-[-46px] h-40 w-40 rounded-full bg-[#b8f34a]/10 blur-3xl" />
      <div className="relative mx-auto h-full max-w-[420px] rotate-[-1deg] rounded-xl bg-[#f8f8f2] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[7px] font-black uppercase tracking-[0.16em] text-[#7b8982]">
              13-Week Cash Forecast
            </p>
            <p className="mt-1 text-[12px] font-black text-[#14201c]">Weekly Liquidity View</p>
          </div>
          <span className="rounded-full bg-[#e7f5df] px-2 py-1 text-[7px] font-black text-[#47762c]">
            UPDATED TODAY
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ["Opening Cash", "$842K"],
            ["Lowest Point", "$514K"],
            ["Ending Cash", "$691K"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-black/[0.06] bg-white px-2.5 py-2">
              <p className="text-[6px] font-bold uppercase tracking-[0.12em] text-[#8a9690]">{label}</p>
              <p className="mt-1 text-[11px] font-black text-[#16231f]">{value}</p>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 390 90" className="mt-2 h-[78px] w-full">
          <g stroke="#dce4df" strokeWidth="1">
            <line x1="8" y1="20" x2="382" y2="20" />
            <line x1="8" y1="45" x2="382" y2="45" />
            <line x1="8" y1="70" x2="382" y2="70" />
          </g>
          <polyline
            points="10,28 40,31 70,35 100,43 130,50 160,60 190,67 220,54 250,58 280,49 310,42 340,36 380,31"
            fill="none"
            stroke="#27b8a8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line x1="190" y1="13" x2="190" y2="75" stroke="#e1b84c" strokeDasharray="3 3" />
        </svg>
        <div className="absolute bottom-3 right-4 rounded-lg border border-[#d4e8b8] bg-[#f2fae7] px-3 py-2 shadow-sm">
          <p className="text-[6px] font-black uppercase tracking-[0.12em] text-[#71914f]">CFO note</p>
          <p className="mt-0.5 text-[7px] font-bold text-[#4d623b]">Inventory payment creates week 7 pinch point.</p>
        </div>
      </div>
    </div>
  );
}

function ReportArtwork() {
  return (
    <div className="relative h-[205px] overflow-hidden bg-[#e9eeea] p-5">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/70 to-transparent" />
      <div className="relative mx-auto h-full max-w-[430px]">
        <div className="absolute left-3 top-4 h-[148px] w-[255px] rotate-[-4deg] rounded-xl border border-black/[0.07] bg-white p-4 shadow-[0_14px_32px_rgba(18,31,25,0.12)]">
          <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[#76837d]">Monthly CFO Report</p>
          <p className="mt-1 text-[13px] font-black text-[#14201c]">Executive Summary</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Revenue","Margin","Cash"].map((x,i)=>(
              <div key={x} className="rounded-md bg-[#f3f6f3] p-2">
                <p className="text-[6px] font-bold text-[#89958f]">{x}</p>
                <p className="mt-1 text-[10px] font-black">{["$418K","68.1%","$842K"][i]}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[#e7ece8]">
            <div className="h-full w-[72%] rounded-full bg-[#27b8a8]" />
          </div>
          <div className="mt-2 h-1.5 w-[86%] rounded-full bg-[#e7ece8]" />
          <div className="mt-2 h-1.5 w-[64%] rounded-full bg-[#e7ece8]" />
        </div>

        <div className="absolute right-0 top-0 h-[160px] w-[250px] rotate-[3deg] rounded-xl border border-black/[0.07] bg-[#10201b] p-4 text-white shadow-[0_18px_40px_rgba(18,31,25,0.20)]">
          <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[#b8f34a]">Forecast vs Actual</p>
          <svg viewBox="0 0 220 82" className="mt-3 h-[80px] w-full">
            <g stroke="#ffffff" strokeOpacity="0.10">
              <line x1="5" y1="20" x2="215" y2="20" />
              <line x1="5" y1="45" x2="215" y2="45" />
              <line x1="5" y1="70" x2="215" y2="70" />
            </g>
            <polyline points="7,64 40,54 73,57 106,40 139,43 172,27 210,31" fill="none" stroke="#60d9c7" strokeWidth="3" />
            <polyline points="7,68 40,60 73,52 106,47 139,38 172,31 210,23" fill="none" stroke="#b8f34a" strokeWidth="2.5" strokeDasharray="5 4" />
          </svg>
          <div className="mt-2 rounded-lg border border-[#b8f34a]/20 bg-[#b8f34a]/[0.06] px-3 py-2">
            <p className="text-[6px] font-black uppercase tracking-[0.12em] text-[#b8f34a]/70">Management commentary</p>
            <p className="mt-1 text-[7px] font-bold text-white/75">Hiring pace is the main variance to plan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemsArtwork() {
  return (
    <div className="relative h-[205px] overflow-hidden bg-[#0d1815] p-5 text-white">
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative mx-auto max-w-[430px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[7px] font-black uppercase tracking-[0.16em] text-[#60d9c7]">Finance Stack Fit</p>
            <p className="mt-1 text-[13px] font-black">Choose for complexity, not popularity.</p>
          </div>
          <Settings2 className="h-5 w-5 text-[#b8f34a]" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["Xero","Lean teams","Simple reporting"],
            ["QuickBooks","Growing SMB","Broad ecosystem"],
            ["NetSuite","Complex ops","Multi-entity"],
          ].map(([name,fit,detail],i)=>(
            <div key={name} className={"rounded-xl border p-3 " + (i===1 ? "border-[#b8f34a]/45 bg-[#b8f34a]/[0.06]" : "border-white/10 bg-white/[0.035]")}>
              <div className={"grid h-8 w-8 place-items-center rounded-lg text-[10px] font-black " + (i===0 ? "bg-[#1ca4e8]" : i===1 ? "bg-[#86d214] text-[#10201b]" : "bg-[#586b86]")}>
                {name === "QuickBooks" ? "QB" : name[0]}
              </div>
              <p className="mt-3 text-[10px] font-black">{name}</p>
              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.10em] text-white/38">{fit}</p>
              <p className="mt-2 text-[7px] leading-3 text-white/58">{detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[7px] font-black uppercase tracking-[0.12em] text-white/35">Operating complexity</span>
          <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-[#60d9c7] via-[#8edc75] to-[#b8f34a]" />
          <ArrowRight className="h-3 w-3 text-[#b8f34a]" />
        </div>
      </div>
    </div>
  );
}

function ResourceArtwork({ id }: { id: ResourceId }) {
  if (id === "cash-forecast") return <ForecastArtwork />;
  if (id === "cfo-report") return <ReportArtwork />;
  return <SystemsArtwork />;
}

function ArticleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#12201b]">{title}</h3>
      <div className="mt-4 space-y-4 text-[14px] leading-7 text-[#52615a]">{children}</div>
    </section>
  );
}

function CashForecastArticle() {
  return (
    <>
      <p>
        A 13-week cash flow forecast is one of the most useful short-term planning tools a growing company can maintain. It is long enough to expose upcoming pressure, but short enough that the assumptions can still be managed week by week.
      </p>
      <ArticleSection title="Why 13 weeks works">
        <p>
          Thirteen weeks gives leadership roughly one quarter of visibility. That is usually enough time to see payroll cycles, inventory purchases, tax obligations, debt payments and major customer collections before they become urgent.
        </p>
        <p>
          The goal is not accounting precision. The goal is decision visibility: knowing when cash gets tight, which assumptions matter most and how much room the business has to react.
        </p>
      </ArticleSection>

      <ArticleSection title="Start with opening cash and real timing">
        <p>
          Begin with the actual bank balance available to operate the business. Then map expected receipts and payments into the week they are realistically expected to clear, not simply the date shown on an invoice.
        </p>
        <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
          <div className="grid grid-cols-4 bg-[#f4f6f4] px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#718078]">
            <span>Week</span><span>Cash In</span><span>Cash Out</span><span>Ending Cash</span>
          </div>
          {[
            ["Week 1","$124K","$96K","$870K"],
            ["Week 2","$98K","$137K","$831K"],
            ["Week 3","$146K","$118K","$859K"],
            ["Week 4","$91K","$174K","$776K"],
          ].map(row=>(
            <div key={row[0]} className="grid grid-cols-4 border-t border-black/[0.05] px-4 py-3 text-[11px] font-semibold text-[#53615b]">
              {row.map(cell=><span key={cell}>{cell}</span>)}
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection title="Model the drivers, not every transaction">
        <p>
          Group cash movement into the categories leadership can actually influence: customer receipts, payroll, inventory, marketing, debt service, taxes and major operating expenses. The forecast should remain detailed enough to act on without becoming a second bookkeeping system.
        </p>
        <p>
          Put explicit assumptions behind the volatile lines. If customer collections normally arrive 12 days late, model that behavior. If a supplier requires a 50% deposit eight weeks before delivery, put the cash event in the correct week.
        </p>
      </ArticleSection>

      <ArticleSection title="Refresh it every week">
        <p>
          Each week, replace forecast numbers with actual cash movement, roll the model forward one week and update the assumptions that changed. The value comes from the cadence. A forecast that is rebuilt once a quarter is history by the time leadership sees it.
        </p>
      </ArticleSection>

      <ArticleSection title="The CFO lens">
        <p>
          The model becomes strategic when it is used to test choices. What happens if inventory is split into two orders? What if hiring moves by six weeks? What if customer payment terms improve? The forecast should make those tradeoffs visible before the company is forced to react.
        </p>
      </ArticleSection>
    </>
  );
}

function CfoReportArticle() {
  return (
    <>
      <p>
        A monthly CFO report should help an operator run the company. If it is only a cleaner version of the income statement, it is reporting history rather than supporting decisions.
      </p>

      <ArticleSection title="1. Start with an executive summary">
        <p>
          The first page should answer three questions quickly: what changed, why did it change and what requires attention. A CEO should be able to understand the month without reading twenty pages of schedules.
        </p>
      </ArticleSection>

      <ArticleSection title="2. Show actual performance against a plan">
        <p>
          Revenue, gross profit, operating expenses, EBITDA and cash should be shown against both budget and prior periods. Variance is where the conversation begins. The report should explain the few differences that actually matter.
        </p>
      </ArticleSection>

      <ArticleSection title="3. Include the operating drivers">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Revenue drivers","Volume, pricing, mix and recurring revenue."],
            ["Margin drivers","COGS, labor, freight, discounting and channel mix."],
            ["Efficiency","CAC, payroll %, contribution margin and productivity."],
            ["Liquidity","Cash, collections, payables, inventory and runway."],
          ].map(([title,body])=>(
            <div key={title} className="rounded-xl border border-black/[0.07] bg-white p-4">
              <p className="text-[11px] font-black text-[#17241f]">{title}</p>
              <p className="mt-2 text-[12px] leading-5 text-[#66736d]">{body}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection title="4. Keep a rolling forecast in the same conversation">
        <p>
          Reporting what happened without updating what happens next leaves the leadership team with only half the picture. Every monthly review should connect actual results back into the forward forecast.
        </p>
      </ArticleSection>

      <ArticleSection title="5. End with decisions">
        <p>
          The best CFO report ends with a small number of recommendations. Hire or wait. Increase price or hold it. Pull forward inventory or reduce the order. Seek additional capital or operate within the current runway. Good reporting narrows the decision surface for leadership.
        </p>
      </ArticleSection>

      <ArticleSection title="What to leave out">
        <p>
          More pages are not better. Avoid dumping the full chart of accounts, every bank reconciliation or every historical schedule into the management pack. Keep supporting detail available, but do not force leaders to search through it to find the story.
        </p>
      </ArticleSection>
    </>
  );
}

function SystemsArticle() {
  return (
    <>
      <p>
        Xero, QuickBooks and NetSuite can all be the right answer. The better question is which operating complexity your finance stack needs to support without creating unnecessary cost or friction.
      </p>

      <ArticleSection title="Xero: clean, capable and operator-friendly">
        <p>
          Xero is often a strong fit for smaller and mid-sized businesses that want a modern accounting platform, straightforward reporting and a broad integration ecosystem without a heavy implementation burden.
        </p>
      </ArticleSection>

      <ArticleSection title="QuickBooks: broad ecosystem and familiar workflows">
        <p>
          QuickBooks remains a practical choice for many growing companies, particularly when the existing team, accountants and connected applications already work comfortably inside its ecosystem.
        </p>
      </ArticleSection>

      <ArticleSection title="NetSuite: when operating complexity becomes the problem">
        <p>
          NetSuite becomes more compelling when the company needs deeper controls, multi-entity consolidation, inventory complexity, more sophisticated permissions or an ERP that can support several operating functions in one environment.
        </p>
      </ArticleSection>

      <ArticleSection title="A simple decision framework">
        <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
          <div className="grid grid-cols-4 bg-[#f4f6f4] px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#718078]">
            <span>Factor</span><span>Xero</span><span>QuickBooks</span><span>NetSuite</span>
          </div>
          {[
            ["Implementation","Light","Light","Heavy"],
            ["Multi-entity","Moderate","Moderate","Strong"],
            ["Inventory","Moderate","Moderate","Advanced"],
            ["Reporting","Good","Good","Advanced"],
            ["Typical fit","Lean growth","Growing SMB","Complex scale"],
          ].map(row=>(
            <div key={row[0]} className="grid grid-cols-4 border-t border-black/[0.05] px-4 py-3 text-[11px] font-semibold text-[#53615b]">
              {row.map(cell=><span key={cell}>{cell}</span>)}
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection title="Do not migrate because the company hit a revenue number">
        <p>
          Revenue alone is a poor trigger for an ERP migration. Complexity is the better trigger. Multiple entities, unreliable inventory data, painful consolidations, weak controls and increasing manual work are stronger signals than hitting an arbitrary revenue threshold.
        </p>
      </ArticleSection>

      <ArticleSection title="The CFO lens">
        <p>
          A system change should solve a real operating constraint. Before migrating, quantify the reporting delays, control issues, manual work and decision gaps the current stack creates. Then compare those costs with the implementation burden and ongoing cost of the new system.
        </p>
      </ArticleSection>
    </>
  );
}

function ArticleBody({ id }: { id: ResourceId }) {
  if (id === "cash-forecast") return <CashForecastArticle />;
  if (id === "cfo-report") return <CfoReportArticle />;
  return <SystemsArticle />;
}

export default function CfoResourceLibrary() {
  const [openArticle, setOpenArticle] = useState<ResourceId | null>(null);
  const current = resources.find((item) => item.id === openArticle);

  return (
    <>
      <section id="resources" className="scroll-mt-24 border-t border-black/[0.05] bg-[#f6f6f1] py-20 text-[#101714]">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                The BRHT CFO Resource Library
              </p>
              <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-5xl">
                <span className="block text-[#101714]">Practical resources.</span>
                <span className="block text-[#1e7b69]">Stronger partners.</span>
              </h2>
            </div>
            <p className="max-w-md text-[13px] leading-6 text-[#5d6963] lg:justify-self-end">
              Clear, useful thinking on forecasting, reporting and finance systems. Built to help operators make better financial decisions.
            </p>
          </div>

          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {resources.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenArticle(item.id)}
                className="group overflow-hidden rounded-2xl border border-black/[0.08] bg-white text-left shadow-[0_10px_35px_rgba(15,23,20,0.03)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[#8fcf35]/45 hover:shadow-[0_18px_48px_rgba(15,23,20,0.10)]"
              >
                <ResourceArtwork id={item.id} />
                <div className="p-5">
                  <div className="flex gap-3 text-[9px] font-black uppercase tracking-[0.13em] text-black/36">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.read}</span>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-5">
                    <h3 className="text-[17px] font-black leading-[1.25] tracking-[-0.02em]">{item.title}</h3>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f1f6ee] text-[#587650] transition group-hover:bg-[#b8f34a] group-hover:text-[#10201b]">
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-[#68746e]">Click to read article</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {current && (
        <>
          <button
            type="button"
            aria-label="Close article"
            onClick={() => setOpenArticle(null)}
            className="fixed inset-0 z-[90] cursor-default bg-[#020807]/75 backdrop-blur-[3px]"
          />
          <div className="fixed left-1/2 top-1/2 z-[100] h-[min(88vh,860px)] w-[min(1180px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[26px] border border-white/10 bg-[#f8f8f3] shadow-[0_35px_120px_rgba(0,0,0,0.46)]">
            <button
              type="button"
              aria-label="Close article"
              onClick={() => setOpenArticle(null)}
              className="absolute right-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/90 text-black/60 shadow-sm backdrop-blur transition hover:bg-white hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid h-full min-h-0 lg:grid-cols-[1.6fr_0.6fr]">
              <article className="min-h-0 overflow-y-auto px-6 py-7 text-[#17231f] md:px-10 md:py-9">
                <div className="max-w-[760px]">
                  <div className="flex gap-3 text-[9px] font-black uppercase tracking-[0.14em] text-[#6d7a74]">
                    <span>{current.category}</span>
                    <span>•</span>
                    <span>{current.read}</span>
                  </div>
                  <h2 className="mt-4 max-w-[700px] text-[34px] font-black leading-[1.02] tracking-[-0.045em] md:text-[46px]">
                    {current.title}
                  </h2>
                  <p className="mt-5 max-w-[680px] text-[15px] leading-7 text-[#617069]">{current.intro}</p>
                  <div className="mt-8 border-t border-black/[0.07] pt-2">
                    <ArticleBody id={current.id} />
                  </div>
                </div>
              </article>

              <aside className="hidden min-h-0 overflow-y-auto border-l border-white/[0.07] bg-[#0b1513] p-6 text-white lg:block">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b8f34a]">
                  BRHT CFO Resource
                </p>
                <h3 className="mt-3 text-[23px] font-black leading-[1.05] tracking-[-0.035em]">
                  Practical guidance for operators.
                </h3>
                <p className="mt-4 text-[12px] leading-5 text-white/52">
                  Use the framework, adapt it to your business, and focus on the decisions it helps leadership make.
                </p>

                <div className="mt-6 rounded-2xl border border-[#9bd739]/30 bg-[#132116] p-4">
                  <div className="flex items-center gap-2 text-[#b8f34a]">
                    <Sparkles className="h-4 w-4 fill-current" />
                    <p className="text-[9px] font-black uppercase tracking-[0.14em]">CFO principle</p>
                  </div>
                  <p className="mt-3 text-[12px] font-semibold leading-5 text-white/75">
                    The value is not the report or model itself. The value is making the next decision with better information.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {["Forward-looking", "Decision-focused", "Built for operators"].map((x) => (
                    <div key={x} className="flex items-center gap-3 text-[11px] font-semibold text-white/60">
                      <CheckCircle2 className="h-4 w-4 text-[#60d9c7]" />
                      {x}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpenArticle(null);
                    openBrhtBooking();
                  }}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8f34a] px-5 py-3.5 text-[12px] font-black text-[#07100e] transition hover:bg-[#c5f760]"
                >
                  Book a Strategy Call <ArrowRight className="h-4 w-4" />
                </button>
              </aside>
            </div>
          </div>
        </>
      )}
    </>
  );
}
