"use client";

import React from "react";
import { openBrhtBooking } from "@/lib/booking";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  FileBarChart2,
  Gauge,
  LineChart,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

export type CfoServiceId =
  | "forecasting"
  | "cash-flow"
  | "kpi-reporting"
  | "board-reporting"
  | "pricing-margin"
  | "capital-planning"
  | "systems-data"
  | "strategic-partner";

const copy: Record<
  CfoServiceId,
  {
    eyebrow: string;
    title: string;
    tagline: string;
    see: string;
    tells: string;
    insight: string;
  }
> = {
  forecasting: {
    eyebrow: "Financial Forecasting",
    title: "See where the business is going.",
    tagline: "A forward-looking operating model that connects revenue, margins, expenses, profitability and cash.",
    see: "Revenue, margins, operating expenses, profitability and cash projected forward.",
    tells: "Whether the current plan supports hiring, inventory, investment and growth.",
    insight:
      "Revenue is tracking 8% ahead of plan, but Q4 hiring would reduce EBITDA margin below 10%. Delay two hires until January.",
  },
  "cash-flow": {
    eyebrow: "Cash Flow & Runway",
    title: "Know the pressure before it arrives.",
    tagline: "See cash inflows, obligations, working capital and runway in one operating view.",
    see: "Cash inflows, obligations, working capital requirements and forward runway.",
    tells: "When the business may become constrained before the bank balance makes it obvious.",
    insight:
      "Splitting the inventory order into two tranches and implementing the price increase extends runway from 8.8 to 14.2 months.",
  },
  "kpi-reporting": {
    eyebrow: "KPI & Management Reporting",
    title: "Run the business from the numbers that matter.",
    tagline: "A management view that connects financial outcomes to the operating drivers behind them.",
    see: "The small set of financial and operational metrics that actually drive performance.",
    tells: "Where the business is outperforming, slipping or creating hidden risk.",
    insight:
      "Revenue growth remains strong, but payroll has grown faster than gross profit for three consecutive months. Hold additional hiring.",
  },
  "board-reporting": {
    eyebrow: "Board & Investor Reporting",
    title: "Give stakeholders the numbers and the story.",
    tagline: "Board-ready reporting that turns performance into context, risks, priorities and decisions.",
    see: "Financial performance, forecasts, KPIs, risks and concise management commentary.",
    tells: "Not merely what changed — but why it changed and what leadership should discuss next.",
    insight:
      "Current growth can be funded internally through February. Secure the facility now while leverage remains low.",
  },
  "pricing-margin": {
    eyebrow: "Pricing & Margin Analysis",
    title: "Find where profit is being created — or lost.",
    tagline: "A profitability view by product, channel and pricing scenario.",
    see: "Margin by product, channel, customer or service line with pricing sensitivity.",
    tells: "Where pricing, cost structure or product mix should change.",
    insight:
      "A 7.8% increase on the premium bundle can absorb an estimated 3% volume decline and still add about $118K in annual gross profit.",
  },
  "capital-planning": {
    eyebrow: "Capital Planning & Fundraising",
    title: "Fund the plan, not just the business.",
    tagline: "Model how much capital is actually needed, what it funds and which milestones it must reach.",
    see: "Runway, capital requirements, funding scenarios, use of funds and dilution tradeoffs.",
    tells: "How much capital the plan needs and which milestones that capital must finance.",
    insight:
      "A $2.5M raise provides enough runway to reach the next major revenue milestone without taking unnecessary dilution today.",
  },
  "systems-data": {
    eyebrow: "Finance Systems & Data",
    title: "Create one trusted financial operating system.",
    tagline: "Connect the systems behind the business into reliable reporting, forecasting and decision support.",
    see: "How operational and financial systems connect into one reporting environment.",
    tells: "Where manual processes, disconnected systems and unreliable data are slowing decisions.",
    insight:
      "Automating commerce, inventory and accounting data removes about 18 hours of monthly reporting work and enables daily margin visibility.",
  },
  "strategic-partner": {
    eyebrow: "CFO Advisory",
    title: "Move from recording the score to deciding the next play.",
    tagline: "CFO advisory sits above the transaction layer and helps leadership make forward-looking financial decisions.",
    see: "Forecasting, scenario planning, cash strategy, pricing, capital planning and decision support.",
    tells: "What the numbers mean for the choices leadership is making now.",
    insight:
      "Accounting tells you what happened. CFO advisory quantifies the tradeoffs, challenges assumptions and recommends what to do next.",
  },
};

function Metric({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-xl border border-[#dbe2dd] bg-white px-4 py-3 shadow-sm">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#74817b]">
        {label}
      </p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-[22px] font-black tracking-[-0.04em] text-[#10201a]">
          {value}
        </span>
        {delta && (
          <span className="mb-0.5 rounded-full bg-[#e8f6e3] px-2 py-0.5 text-[9px] font-extrabold text-[#3f8f38]">
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function ForecastVisual() {
  return (
    <div className="h-full overflow-auto bg-[#edf1ed] p-5 text-[#10201a]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#68766f]">
            12-Month Operating Forecast
          </p>
          <h4 className="mt-1 text-xl font-black">FY27 Forward View</h4>
        </div>
        <div className="flex gap-2 text-[9px] font-bold">
          <span className="rounded-full border border-black/10 bg-white px-3 py-1.5">Base Case</span>
          <span className="rounded-full bg-[#b8f34a] px-3 py-1.5">Growth Case</span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1.5">Downside</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        <Metric label="Revenue" value="$4.82M" delta="+14.2% YoY" />
        <Metric label="Gross Margin" value="67.4%" delta="+2.1 pts" />
        <Metric label="EBITDA" value="$612K" delta="12.7%" />
        <Metric label="Ending Cash" value="$1.18M" />
      </div>

      <div className="mt-4 rounded-2xl border border-[#d6ded9] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-[#51615a]">Revenue — Actual vs Forecast</p>
            <p className="mt-0.5 text-[9px] text-[#8a9691]">Current month: August</p>
          </div>
          <div className="flex gap-4 text-[9px] font-bold text-[#66736d]">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#27b8a8]" />Actual</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#9adf36]" />Forecast</span>
          </div>
        </div>
        <svg viewBox="0 0 650 190" className="mt-2 h-[175px] w-full">
          <g stroke="#dfe5e1" strokeWidth="1">
            <line x1="35" y1="30" x2="625" y2="30" />
            <line x1="35" y1="75" x2="625" y2="75" />
            <line x1="35" y1="120" x2="625" y2="120" />
            <line x1="35" y1="165" x2="625" y2="165" />
          </g>
          <path d="M40 145 L90 132 L140 136 L190 112 L240 118 L290 96 L340 102 L390 82" fill="none" stroke="#27b8a8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M390 82 L440 70 L490 58 L540 42 L590 28" fill="none" stroke="#9adf36" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 6" />
          {[40,90,140,190,240,290,340,390].map((x, i) => {
            const ys = [145,132,136,112,118,96,102,82];
            return <circle key={x} cx={x} cy={ys[i]} r="4" fill="#27b8a8" />;
          })}
          {[390,440,490,540,590].map((x, i) => {
            const ys = [82,70,58,42,28];
            return <circle key={x} cx={x} cy={ys[i]} r="4" fill="#9adf36" />;
          })}
          <g fill="#7b8882" fontSize="10" fontWeight="700">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => (
              <text key={m} x={40 + i * 50} y="184">{m}</text>
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#d6ded9] bg-white">
        <div className="grid grid-cols-5 bg-[#f6f8f6] px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#718078]">
          <span>Month</span><span>Revenue</span><span>Gross Profit</span><span>OpEx</span><span>EBITDA</span>
        </div>
        {[
          ["Sep","$418K","$282K","$221K","$61K"],
          ["Oct","$446K","$301K","$226K","$75K"],
          ["Nov","$492K","$332K","$239K","$93K"],
        ].map((row) => (
          <div key={row[0]} className="grid grid-cols-5 border-t border-black/[0.05] px-4 py-2.5 text-[10px] font-semibold text-[#4d5b55]">
            {row.map((cell) => <span key={cell}>{cell}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function CashVisual() {
  return (
    <div className="h-full overflow-auto bg-[#edf1ed] p-5 text-[#10201a]">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#68766f]">Cash Control Center</p>
        <h4 className="mt-1 text-xl font-black">Liquidity & Runway</h4>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        <Metric label="Current Cash" value="$842K" />
        <Metric label="Monthly Burn" value="$96K" />
        <Metric label="Current Runway" value="8.8 mo" />
        <Metric label="Projected Runway" value="14.2 mo" delta="+5.4 mo" />
      </div>

      <div className="mt-4 rounded-2xl border border-[#d6ded9] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold text-[#51615a]">Projected Cash Balance</p>
          <span className="rounded-full bg-[#e8f6e3] px-2 py-1 text-[9px] font-extrabold text-[#3f8f38]">With recommended changes</span>
        </div>
        <svg viewBox="0 0 650 190" className="mt-2 h-[175px] w-full">
          <defs>
            <linearGradient id="cashArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#27b8a8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#27b8a8" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <g stroke="#dfe5e1" strokeWidth="1">
            <line x1="35" y1="30" x2="625" y2="30" />
            <line x1="35" y1="75" x2="625" y2="75" />
            <line x1="35" y1="120" x2="625" y2="120" />
            <line x1="35" y1="165" x2="625" y2="165" />
          </g>
          <path d="M40 50 L90 60 L140 70 L190 88 L240 108 L290 126 L340 118 L390 108 L440 96 L490 82 L540 68 L590 54 L590 165 L40 165 Z" fill="url(#cashArea)" />
          <path d="M40 50 L90 60 L140 70 L190 88 L240 108 L290 126 L340 118 L390 108 L440 96 L490 82 L540 68 L590 54" fill="none" stroke="#27b8a8" strokeWidth="4" strokeLinecap="round" />
          <g fill="#7b8882" fontSize="10" fontWeight="700">
            {["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map((m,i) => (
              <text key={m} x={40 + i * 50} y="184">{m}</text>
            ))}
          </g>
          <g>
            <line x1="140" y1="70" x2="140" y2="18" stroke="#e8b84c" strokeDasharray="3 3" />
            <rect x="95" y="2" width="92" height="25" rx="8" fill="#fff7e4" stroke="#efd08a" />
            <text x="106" y="18" fontSize="9" fontWeight="800" fill="#7c642f">Inventory -$185K</text>
            <line x1="340" y1="118" x2="340" y2="20" stroke="#9adf36" strokeDasharray="3 3" />
            <rect x="293" y="3" width="106" height="25" rx="8" fill="#f1f9e8" stroke="#b9dd82" />
            <text x="304" y="19" fontSize="9" fontWeight="800" fill="#4f7b28">Pricing +$41K/mo</text>
          </g>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          ["Cash In", [["Customer receipts",82],["Other income",18]]],
          ["Cash Out", [["Payroll",62],["Inventory",48],["Marketing",38],["Operating",31]]],
        ].map(([title, rows]) => (
          <div key={title as string} className="rounded-xl border border-[#d6ded9] bg-white p-4">
            <p className="text-[10px] font-extrabold text-[#51615a]">{title as string}</p>
            <div className="mt-3 space-y-3">
              {(rows as [string,number][]).map(([name,val]) => (
                <div key={name}>
                  <div className="flex justify-between text-[9px] font-semibold text-[#6f7b76]"><span>{name}</span><span>{val}%</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e7ece8]"><div className="h-full rounded-full bg-[#27b8a8]" style={{ width: val + "%" }} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiVisual() {
  const signals = [
    ["Sales Efficiency","On target","#6ccf82"],
    ["Inventory Turns","Below target","#e7bd48"],
    ["Marketing ROAS","Above target","#6ccf82"],
    ["Payroll % Revenue","2.8 pts over","#e76c5c"],
  ];
  return (
    <div className="h-full overflow-auto bg-[#edf1ed] p-5 text-[#10201a]">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#68766f]">Executive Operating Dashboard</p>
      <h4 className="mt-1 text-xl font-black">Management View — August</h4>
      <div className="mt-4 grid grid-cols-5 gap-2.5">
        <Metric label="Revenue" value="$418K" delta="+12% plan" />
        <Metric label="Gross Margin" value="68.1%" delta="+1.7 pts" />
        <Metric label="CAC" value="$42" delta="-8%" />
        <Metric label="LTV" value="$386" delta="+11%" />
        <Metric label="Operating Cash" value="$842K" />
      </div>
      <div className="mt-4 grid grid-cols-[1.45fr_0.75fr] gap-3">
        <div className="rounded-2xl border border-[#d6ded9] bg-white p-4">
          <p className="text-[10px] font-extrabold text-[#51615a]">Revenue / EBITDA / Cash Trend</p>
          <svg viewBox="0 0 520 220" className="mt-3 h-[220px] w-full">
            <g stroke="#dfe5e1"><line x1="28" y1="40" x2="500" y2="40"/><line x1="28" y1="95" x2="500" y2="95"/><line x1="28" y1="150" x2="500" y2="150"/></g>
            <polyline points="35,155 95,135 155,142 215,105 275,112 335,78 395,86 475,54" fill="none" stroke="#27b8a8" strokeWidth="4" strokeLinecap="round"/>
            <polyline points="35,175 95,168 155,164 215,151 275,144 335,128 395,120 475,102" fill="none" stroke="#9adf36" strokeWidth="4" strokeLinecap="round"/>
            <polyline points="35,72 95,78 155,70 215,76 275,68 335,73 395,62 475,58" fill="none" stroke="#82928b" strokeWidth="3" strokeLinecap="round"/>
            <g fill="#7b8882" fontSize="10" fontWeight="700">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map((m,i)=><text key={m} x={35+i*62} y="205">{m}</text>)}</g>
          </svg>
          <div className="flex gap-5 text-[9px] font-bold text-[#68766f]"><span>● Revenue</span><span className="text-[#73a828]">● EBITDA</span><span className="text-[#8d9a94]">● Cash</span></div>
        </div>
        <div className="rounded-2xl border border-[#d6ded9] bg-white p-4">
          <p className="text-[10px] font-extrabold text-[#51615a]">Performance Signals</p>
          <div className="mt-3 divide-y divide-black/[0.06]">
            {signals.map(([label,status,color])=>(
              <div key={label} className="flex items-center gap-3 py-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:color}} />
                <div className="min-w-0 flex-1"><p className="text-[10px] font-bold">{label}</p><p className="mt-0.5 text-[9px] text-[#82908a]">{status}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[#f6f8f6] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#718078]">Management Commentary</p>
            <p className="mt-2 text-[10px] leading-5 text-[#596760]">Growth remains strong. Payroll is rising faster than gross profit and should be watched before the next hiring cycle.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardVisual() {
  const slides = ["Executive Summary","Financial Performance","Forecast vs Actual","Cash & Runway","Operating KPIs","Risks & Opportunities","Strategic Priorities"];
  return (
    <div className="h-full overflow-auto bg-[#e9eeea] p-5 text-[#10201a]">
      <div className="grid h-full min-h-[470px] grid-cols-[150px_1fr] gap-4">
        <div className="space-y-2">
          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#69766f]">Board Pack — Q3</p>
          {slides.map((slide,i)=>(
            <div key={slide} className={"rounded-lg border px-3 py-3 " + (i===0 ? "border-[#9adf36] bg-white shadow-sm" : "border-[#d3dbd6] bg-[#f7f9f7]")}>
              <p className="text-[8px] font-black text-[#8a9690]">0{i+1}</p>
              <p className="mt-1 text-[9px] font-bold leading-4 text-[#48564f]">{slide}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#d3dbd6] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#7c8983]">Executive Summary</p><h4 className="mt-1 text-2xl font-black">Q3 Performance</h4></div>
            <span className="rounded-full bg-[#10201a] px-3 py-1.5 text-[9px] font-black text-white">BOARD CONFIDENTIAL</span>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3">
            <Metric label="Revenue" value="$1.31M" delta="103% plan" />
            <Metric label="Gross Margin" value="67.8%" delta="+1.4 pts" />
            <Metric label="EBITDA" value="$162K" delta="12.4%" />
            <Metric label="Cash" value="$842K" />
          </div>
          <div className="mt-5 grid grid-cols-[1.35fr_0.65fr] gap-4">
            <div className="rounded-xl border border-[#d9e0db] p-4">
              <p className="text-[10px] font-extrabold text-[#51615a]">Revenue vs Plan</p>
              <svg viewBox="0 0 420 170" className="mt-2 h-[170px] w-full">
                <g stroke="#e2e7e3"><line x1="20" y1="40" x2="400" y2="40"/><line x1="20" y1="90" x2="400" y2="90"/><line x1="20" y1="140" x2="400" y2="140"/></g>
                <polyline points="25,130 80,112 135,116 190,86 245,90 300,63 355,70 395,43" fill="none" stroke="#27b8a8" strokeWidth="4"/>
                <polyline points="25,136 80,120 135,110 190,98 245,84 300,73 355,60 395,52" fill="none" stroke="#9adf36" strokeWidth="3" strokeDasharray="5 5"/>
              </svg>
            </div>
            <div className="rounded-xl bg-[#f5f7f5] p-4">
              <p className="text-[10px] font-extrabold">Management Commentary</p>
              <ul className="mt-3 space-y-3 text-[10px] leading-4 text-[#5c6963]">
                <li>• Growth ahead of plan</li><li>• Margin expansion continuing</li><li>• Inventory risk entering Q4</li><li>• Hiring plan revised</li>
              </ul>
              <div className="mt-4 rounded-lg border border-[#badb85] bg-[#eff8e6] p-3"><p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#62833d]">Board Discussion</p><p className="mt-1 text-[10px] font-bold">Approve revised inventory facility before holiday purchasing.</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingVisual() {
  const rows = [
    ["Core Product","$99","$34","65.7%","High","#dff3dc"],
    ["Expansion","$49","$12","75.5%","High","#dff3dc"],
    ["Premium Bundle","$129","$57","55.8%","Medium","#fff0c9"],
    ["Wholesale","$61","$39","36.1%","High","#f7d7d1"],
    ["Marketplace","$109","$48","56.0%","Medium","#fff0c9"],
    ["Subscription","$24","$6","75.0%","Growing","#dff3dc"],
  ];
  return (
    <div className="h-full overflow-auto bg-[#edf1ed] p-5 text-[#10201a]">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#68766f]">Profitability Lab</p>
      <h4 className="mt-1 text-xl font-black">Pricing & Margin Opportunities</h4>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Current Gross Margin" value="61.8%" />
        <Metric label="Target Gross Margin" value="67.0%" delta="+5.2 pts" />
        <Metric label="Identified Opportunity" value="+$284K" delta="annual GP" />
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#d6ded9] bg-white">
        <div className="grid grid-cols-5 bg-[#f7f9f7] px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#718078]"><span>Offer</span><span>Price</span><span>COGS</span><span>Margin</span><span>Volume</span></div>
        {rows.map((r)=>(
          <div key={r[0]} className="grid grid-cols-5 items-center border-t border-black/[0.05] px-4 py-2.5 text-[10px] font-semibold text-[#4d5b55]">
            <span>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full" style={{backgroundColor:r[5]}} />{r[3]}</span><span>{r[4]}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_1fr] gap-3">
        <div className="rounded-xl border border-[#d6ded9] bg-white p-4">
          <div className="flex justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#718078]">Premium Bundle</p><p className="mt-1 text-[18px] font-black">$129 → $139</p></div><span className="rounded-full bg-[#e8f6e3] px-2 py-1 text-[9px] font-black text-[#3f8f38]">+$118K GP</span></div>
          <div className="mt-5"><div className="h-2 rounded-full bg-[#e6ebe7]"><div className="relative h-2 w-[72%] rounded-full bg-[#27b8a8]"><span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#9adf36] shadow" /></div></div><div className="mt-2 flex justify-between text-[9px] font-semibold text-[#78847e]"><span>Current price</span><span>Scenario price</span></div></div>
          <p className="mt-4 text-[10px] text-[#65726c]">Estimated volume impact: -2.8%</p>
        </div>
        <div className="rounded-xl border border-[#d6ded9] bg-white p-4">
          <p className="text-[10px] font-extrabold text-[#51615a]">Gross Profit Waterfall</p>
          <div className="mt-5 flex h-[105px] items-end gap-4">
            {[["Current",58,"#7a8b84"],["Price",76,"#27b8a8"],["Mix",86,"#60c997"],["Savings",94,"#9adf36"]].map(([label,h,color])=>(
              <div key={label as string} className="flex flex-1 flex-col items-center"><div className="w-full rounded-t-md" style={{height:(h as number)+"%",backgroundColor:color as string}}/><span className="mt-2 text-[8px] font-bold text-[#718078]">{label as string}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CapitalVisual() {
  return (
    <div className="h-full overflow-auto bg-[#edf1ed] p-5 text-[#10201a]">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#68766f]">Capital Strategy Workspace</p>
      <h4 className="mt-1 text-xl font-black">Funding the Next Milestone</h4>
      <div className="mt-4 grid grid-cols-4 gap-3">
        <Metric label="Current Runway" value="9 mo" />
        <Metric label="Proposed Raise" value="$2.5M" />
        <Metric label="Post-Raise Runway" value="27 mo" delta="+18 mo" />
        <Metric label="Target Milestone" value="$8M ARR" />
      </div>
      <div className="mt-4 rounded-xl border border-[#d6ded9] bg-white p-5">
        <p className="text-[10px] font-extrabold text-[#51615a]">Capital Timeline</p>
        <div className="relative mt-8">
          <div className="absolute left-3 right-3 top-3 h-1 rounded-full bg-gradient-to-r from-[#27b8a8] via-[#78d79a] to-[#9adf36]" />
          <div className="relative grid grid-cols-6 text-center">
            {["Today","Raise","Hiring","Launch","Expansion","Next Round"].map((label,i)=>(
              <div key={label}><span className={"mx-auto block h-7 w-7 rounded-full border-4 border-white shadow " + (i<2 ? "bg-[#27b8a8]" : "bg-[#9adf36]")} /><p className="mt-2 text-[9px] font-bold text-[#64716b]">{label}</p></div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#d6ded9] bg-white p-4">
          <p className="text-[10px] font-extrabold text-[#51615a]">Use of Funds</p>
          <div className="mt-3 space-y-3">
            {[["Product / Technology",30],["Sales & Marketing",28],["Hiring",22],["Working Capital",15],["Contingency",5]].map(([name,val])=>(
              <div key={name as string}><div className="flex justify-between text-[9px] font-semibold text-[#68766f]"><span>{name as string}</span><span>{val as number}%</span></div><div className="mt-1 h-1.5 rounded-full bg-[#e7ece8]"><div className="h-full rounded-full bg-[#27b8a8]" style={{width:(val as number)+"%"}}/></div></div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#d6ded9] bg-white">
          <p className="p-4 pb-2 text-[10px] font-extrabold text-[#51615a]">Raise Sensitivity</p>
          <div className="grid grid-cols-4 bg-[#f7f9f7] px-4 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-[#74817b]"><span>Raise</span><span>Burn</span><span>Runway</span><span>Dilution</span></div>
          {[["$1.5M","$145K","17 mo","8%"],["$2.5M","$165K","27 mo","12%"],["$4.0M","$190K","36 mo","18%"]].map((r,i)=>(
            <div key={r[0]} className={"grid grid-cols-4 px-4 py-3 text-[10px] font-semibold " + (i===1 ? "bg-[#eff8e6] text-[#3f6728]" : "border-t border-black/[0.05] text-[#53615b]")}>{r.map(c=><span key={c}>{c}</span>)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemsVisual() {
  const sources = [
    ["Shopify",BarChart3],["Stripe",CircleDollarSign],["Bank",Coins],["Payroll",Users],["CRM",Target],["Inventory",Gauge],["Xero / QBO",FileBarChart2]
  ] as const;
  return (
    <div className="relative h-full overflow-hidden bg-[#0b1513] p-5 text-white">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#60d9c7]">Finance Architecture Map</p>
        <h4 className="mt-1 text-xl font-black">One Trusted Financial Operating System</h4>
        <div className="mt-7 grid grid-cols-[1fr_0.78fr_1fr] items-center gap-6">
          <div className="grid grid-cols-2 gap-3">
            {sources.map(([name,Icon])=>(
              <div key={name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#34d6c3]/10 text-[#60d9c7]"><Icon className="h-4 w-4"/></div>
                <div><p className="text-[10px] font-bold">{name}</p><p className="mt-1 text-[8px] font-semibold text-[#69d7c6]">✓ Connected</p></div>
              </div>
            ))}
          </div>
          <div className="relative flex justify-center">
            <div className="absolute left-[-30%] right-[-30%] top-1/2 h-px bg-gradient-to-r from-[#34d6c3]/20 via-[#34d6c3] to-[#b8f34a]" />
            <div className="relative grid h-40 w-40 place-items-center rounded-full border border-[#b8f34a]/40 bg-[#102019] shadow-[0_0_50px_rgba(184,243,74,0.08)]">
              <Settings2 className="h-7 w-7 text-[#b8f34a]" />
              <div className="absolute inset-0 grid place-items-center pt-14 text-center"><p className="text-[10px] font-black uppercase tracking-[0.15em]">Finance<br/>Data Layer</p></div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["Management Reporting",BarChart3],
              ["Forecasting",LineChart],
              ["Cash Planning",Coins],
              ["Board Reporting",FileBarChart2],
            ].map(([name,Icon])=>(
              <div key={name as string} className="flex items-center gap-3 rounded-xl border border-[#b8f34a]/20 bg-[#b8f34a]/[0.045] p-3">
                <Icon className="h-5 w-5 text-[#b8f34a]"/>
                <p className="text-[11px] font-bold">{name as string}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between rounded-xl border border-[#e8b84c]/25 bg-[#2a2413] px-4 py-3">
          <span className="text-[10px] font-bold text-[#e7c865]">⚠ Manual spreadsheet dependency identified</span>
          <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#b8f34a]">→ Automate</span>
        </div>
      </div>
    </div>
  );
}

function PartnerVisual() {
  return (
    <div className="h-full overflow-auto bg-[#edf1ed] p-5 text-[#10201a]">
      <div className="text-center"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#68766f]">Historical Finance vs Strategic Finance</p><h4 className="mt-1 text-xl font-black">Two Different Questions</h4></div>
      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d2dbd5] bg-white shadow-sm">
        <div className="bg-[#f4f5f4] p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#dfe4e1] text-[#69756f]"><FileBarChart2 className="h-5 w-5"/></div><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#8a9690]">Looking Back</p><h5 className="text-[18px] font-black">Accounting & Compliance</h5></div></div>
          <div className="mt-6 space-y-3">{["Bookkeeping","Reconciliations","Payroll","Accounts payable","Tax compliance","Historical reporting"].map(x=><div key={x} className="flex items-center gap-3 text-[11px] font-semibold text-[#65716c]"><span className="h-1.5 w-1.5 rounded-full bg-[#9ea9a4]"/>{x}</div>)}</div>
          <div className="mt-7 border-t border-black/[0.06] pt-5"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#8a9690]">Question answered</p><p className="mt-1 text-[19px] font-black text-[#4a5751]">“What happened?”</p></div>
        </div>
        <div className="relative bg-[#102019] p-6 text-white">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#b8f34a]/10 blur-3xl"/>
          <div className="relative flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#b8f34a]/10 text-[#b8f34a]"><BriefcaseBusiness className="h-5 w-5"/></div><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#b8f34a]/65">Looking Forward</p><h5 className="text-[18px] font-black">CFO Advisory</h5></div></div>
          <div className="relative mt-6 space-y-3">{["Forecasting","Scenario planning","Cash strategy","Pricing & margins","Capital planning","Board guidance","Decision support"].map(x=><div key={x} className="flex items-center gap-3 text-[11px] font-semibold text-white/70"><CheckCircle2 className="h-4 w-4 text-[#b8f34a]"/>{x}</div>)}</div>
          <div className="relative mt-7 border-t border-white/[0.08] pt-5"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#b8f34a]/65">Question answered</p><p className="mt-1 text-[19px] font-black">“What should we do next?”</p></div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 rounded-xl bg-[#102019] px-5 py-4 text-white"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Record</span><ArrowRight className="h-4 w-4 text-[#60d9c7]"/><span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">Understand</span><ArrowRight className="h-4 w-4 text-[#b8f34a]"/><span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b8f34a]">Decide</span></div>
    </div>
  );
}

function ShowcaseVisual({ serviceId }: { serviceId: CfoServiceId }) {
  switch (serviceId) {
    case "forecasting": return <ForecastVisual />;
    case "cash-flow": return <CashVisual />;
    case "kpi-reporting": return <KpiVisual />;
    case "board-reporting": return <BoardVisual />;
    case "pricing-margin": return <PricingVisual />;
    case "capital-planning": return <CapitalVisual />;
    case "systems-data": return <SystemsVisual />;
    case "strategic-partner": return <PartnerVisual />;
  }
}

export default function CfoServiceShowcase({
  serviceId,
  pinned,
  onClose,
}: {
  serviceId: CfoServiceId;
  pinned: boolean;
  onClose: () => void;
}) {
  const item = copy[serviceId];
  const compactAside =
    serviceId === "systems-data" || serviceId === "strategic-partner";

  return (
    <div className="grid h-full overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1513] shadow-[0_35px_120px_rgba(0,0,0,0.45)] lg:grid-cols-[1.75fr_0.75fr]">
      <div className="min-h-0 overflow-hidden">
        <ShowcaseVisual serviceId={serviceId} />
      </div>

      <aside
        className={
          "relative flex min-h-0 flex-col overflow-auto border-l border-white/[0.07] bg-[#0b1513] text-white " +
          (compactAside ? "p-5" : "p-6")
        }
      >
        {pinned && (
          <button
            onClick={onClose}
            aria-label="Close service preview"
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <p className="pr-12 text-[9px] font-black uppercase tracking-[0.22em] text-[#b8f34a]">
          {item.eyebrow}
        </p>
        <h3
          className={
            "pr-10 font-black leading-[1.05] tracking-[-0.04em] " +
            (compactAside ? "mt-2 text-[23px]" : "mt-3 text-[27px]")
          }
        >
          {item.title}
        </h3>
        <p
          className={
            "text-white/52 " +
            (compactAside ? "mt-3 text-[11px] leading-[18px]" : "mt-4 text-[12px] leading-5")
          }
        >
          {item.tagline}
        </p>

        <div className={compactAside ? "mt-4 space-y-3" : "mt-6 space-y-5"}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">What you see</p>
            <p className={compactAside ? "mt-1.5 text-[11px] leading-[18px] text-white/70" : "mt-2 text-[12px] leading-5 text-white/70"}>
              {item.see}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">What it tells you</p>
            <p className={compactAside ? "mt-1.5 text-[11px] leading-[18px] text-white/70" : "mt-2 text-[12px] leading-5 text-white/70"}>
              {item.tells}
            </p>
          </div>
        </div>

        <div
          className={
            "rounded-2xl border border-[#9bd739]/35 bg-[#132116] " +
            (compactAside ? "mt-4 p-3" : "mt-6 p-4")
          }
        >
          <div className="flex items-center gap-2 text-[#b8f34a]">
            <Sparkles className="h-4 w-4 fill-current" />
            <p className="text-[9px] font-black uppercase tracking-[0.16em]">CFO Insight</p>
          </div>
          <p
            className={
              "font-semibold text-white/78 " +
              (compactAside ? "mt-2 text-[11px] leading-[18px]" : "mt-3 text-[12px] leading-5")
            }
          >
            {item.insight}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            openBrhtBooking();
          }}
          className={
            "inline-flex items-center justify-center gap-2 rounded-xl bg-[#b8f34a] px-5 text-[12px] font-black text-[#07100e] transition hover:bg-[#c5f760] " +
            (compactAside ? "mt-4 py-3" : "mt-auto py-3.5")
          }
        >
          Book a Strategy Call <ArrowRight className="h-4 w-4" />
        </button>
      </aside>
    </div>
  );
}
