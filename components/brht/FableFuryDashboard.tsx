import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Gauge,
  Lightbulb,
  Package,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react";
import {
  ANALYTICS_RANGES,
  type AnalyticsRange,
  type FableFuryDashboardData,
  type MetricCard,
  type TrendPoint,
} from "@/lib/fableFuryAnalytics";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const preciseMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function compactMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMetric(metric: MetricCard) {
  if (metric.format === "currency") {
    return metric.key === "aov" ? preciseMoney.format(metric.value) : money.format(metric.value);
  }
  if (metric.format === "percent") return `${metric.value.toFixed(1)}%`;
  if (metric.format === "multiple") return `${metric.value.toFixed(2)}x`;
  return integer.format(metric.value);
}

function metricAccent(key: string) {
  switch (key) {
    case "revenue":
      return "from-[#52d3ff]/25 via-[#52d3ff]/5 to-transparent text-[#9be6ff]";
    case "profit":
      return "from-[#8cf6ba]/25 via-[#8cf6ba]/5 to-transparent text-[#aef8cc]";
    case "roas":
      return "from-[#f9c76c]/25 via-[#f9c76c]/5 to-transparent text-[#ffdc98]";
    case "orders":
      return "from-[#b7a0ff]/25 via-[#b7a0ff]/5 to-transparent text-[#d2c5ff]";
    case "aov":
      return "from-[#ff9da7]/25 via-[#ff9da7]/5 to-transparent text-[#ffc0c6]";
    default:
      return "from-white/15 via-white/[0.03] to-transparent text-white";
  }
}

function statusStyles(status: "healthy" | "delayed" | "error") {
  if (status === "healthy") return "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20";
  if (status === "delayed") return "bg-amber-400/10 text-amber-200 ring-amber-300/20";
  return "bg-rose-400/10 text-rose-200 ring-rose-300/20";
}

function productStatusStyles(status: "healthy" | "watch" | "action") {
  if (status === "healthy") return "text-emerald-300";
  if (status === "watch") return "text-amber-300";
  return "text-rose-300";
}

function priorityStyles(priority: "high" | "medium" | "low") {
  if (priority === "high") return "border-rose-300/20 bg-rose-300/[0.06] text-rose-200";
  if (priority === "medium") return "border-amber-300/20 bg-amber-300/[0.06] text-amber-200";
  return "border-sky-300/20 bg-sky-300/[0.06] text-sky-200";
}

function chartPoints(points: TrendPoint[], key: "revenue" | "profit") {
  const width = 840;
  const height = 286;
  const left = 52;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const values = points.map((point) => point[key]);
  const max = Math.max(1, ...points.map((point) => point.revenue)) * 1.12;
  const x = (index: number) =>
    left + (index / Math.max(1, points.length - 1)) * (width - left - right);
  const y = (value: number) => top + (height - top - bottom) * (1 - value / max);
  const line = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const area = `M ${x(0)} ${height - bottom} L ${values
    .map((value, index) => `${x(index)} ${y(value)}`)
    .join(" L ")} L ${x(values.length - 1)} ${height - bottom} Z`;

  return { width, height, left, right, top, bottom, max, x, y, line, area };
}

function RevenueChart({ points }: { points: TrendPoint[] }) {
  const revenue = chartPoints(points, "revenue");
  const profit = chartPoints(points, "profit");
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="mt-6 overflow-x-auto pb-1">
      <svg
        viewBox={`0 0 ${revenue.width} ${revenue.height}`}
        className="min-w-[680px] w-full"
        role="img"
        aria-label="Revenue and contribution profit trend"
      >
        <defs>
          <linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#52d3ff" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#52d3ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y = revenue.top + (revenue.height - revenue.top - revenue.bottom) * (1 - tick);
          return (
            <g key={tick}>
              <line
                x1={revenue.left}
                x2={revenue.width - revenue.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
              />
              <text
                x={revenue.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="currentColor"
                opacity="0.42"
                fontSize="11"
              >
                {compactMoney(revenue.max * tick)}
              </text>
            </g>
          );
        })}

        <path d={revenue.area} fill="url(#revenueArea)" />
        <polyline
          points={revenue.line}
          fill="none"
          stroke="#52d3ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={profit.line}
          fill="none"
          stroke="#8cf6ba"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="7 8"
        />

        {points.map((point, index) => {
          if (index % labelStep !== 0 && index !== points.length - 1) return null;
          return (
            <text
              key={`${point.date}-${index}`}
              x={revenue.x(index)}
              y={revenue.height - 13}
              textAnchor="middle"
              fill="currentColor"
              opacity="0.46"
              fontSize="11"
            >
              {point.date}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function MixDonut({ data }: { data: FableFuryDashboardData["channels"] }) {
  const palette = ["#52d3ff", "#8cf6ba", "#f9c76c", "#b7a0ff", "#ff9da7"];
  let cursor = 0;
  const stops = data.map((row, index) => {
    const start = cursor;
    cursor += row.share;
    return `${palette[index % palette.length]} ${start}% ${cursor}%`;
  });

  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
      <div className="relative mx-auto h-44 w-44">
        <div
          className="h-full w-full rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        />
        <div className="absolute inset-7 grid place-items-center rounded-full border border-white/10 bg-[#0c121d] text-center shadow-2xl">
          <div>
            <div className="text-2xl font-semibold tracking-[-0.04em]">100%</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">reconciled</div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((row, index) => (
          <div key={row.channel} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              <span className="truncate text-white/70">{row.channel}</span>
            </div>
            <span className="font-medium tabular-nums text-white">{row.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureStrip() {
  const nodes = [
    { label: "Commerce", detail: "orders · products · customers" },
    { label: "Growth", detail: "spend · campaigns · attribution" },
    { label: "Operations", detail: "inventory · fulfilment · costs" },
    { label: "PostgreSQL", detail: "clean models · history · views" },
    { label: "BRHT", detail: "decisions · actions · accountability" },
  ];

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {nodes.map((node, index) => (
        <div key={node.label} className="relative">
          <div className="h-full rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#79ddff]">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="mt-3 font-semibold text-white">{node.label}</div>
            <div className="mt-1 text-xs leading-5 text-white/45">{node.detail}</div>
          </div>
          {index < nodes.length - 1 ? (
            <ArrowUpRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-[#0a101a] p-1 text-white/35 lg:block" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function FableFuryDashboard({
  data,
  basePath,
  publicView = false,
}: {
  data: FableFuryDashboardData;
  basePath: string;
  publicView?: boolean;
}) {
  const freshness = Math.max(...data.sourceHealth.map((source) => source.freshnessMinutes));
  const generated = new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Perth",
  }).format(new Date(data.generatedAt));

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b12] text-white selection:bg-[#52d3ff]/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(82,211,255,0.12),transparent_28rem),radial-gradient(circle_at_90%_25%,rgba(140,246,186,0.08),transparent_34rem)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative mx-auto max-w-[1540px] px-5 pb-24 pt-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-5 border-b border-white/10 pb-5">
          <Link href="/" className="group flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/[0.05] font-black tracking-[-0.08em] text-[#9be6ff] transition group-hover:border-[#52d3ff]/50">
              B
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.18em]">BRHT</span>
              <span className="block text-[10px] uppercase tracking-[0.15em] text-white/35">operating intelligence</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white/50 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Server-rendered · read only
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:border-white/25 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              BRHT
            </Link>
          </div>
        </header>

        {publicView ? (
          <section className="grid gap-10 py-14 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#52d3ff]/20 bg-[#52d3ff]/[0.06] px-3 py-2 text-xs font-semibold text-[#9be6ff]">
                <Sparkles className="h-3.5 w-3.5" />
                Fable Fury case study
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                From scattered platforms to one operating picture.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
                Fable Fury’s commerce, advertising and operating data was moved out of fragile spreadsheets into a reliable PostgreSQL foundation. BRHT turns that foundation into a purpose-built interface for the questions the business actually needs to answer.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">What changed</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["Source of truth", "PostgreSQL models replace spreadsheet logic."],
                  ["Reliable ingestion", "n8n schedules, webhooks and sync checks."],
                  ["Custom interface", "No dashboarding vendor dictates the experience."],
                  ["Action layer", "Signals explain what changed and what to do next."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <div className="mt-3 font-semibold">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-white/45">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {publicView ? (
          <section className="mb-8 rounded-[28px] border border-white/10 bg-black/20 p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#9be6ff]">The data path</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Keep the warehouse. Replace the presentation layer.</h2>
              </div>
              <span className="text-xs text-white/35">APIs → n8n → PostgreSQL → BRHT</span>
            </div>
            <ArchitectureStrip />
          </section>
        ) : null}

        <section className="rounded-[32px] border border-white/10 bg-[#0b111c]/95 p-4 shadow-[0_40px_120px_rgba(0,0,0,.35)] sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ${
                    data.mode === "live"
                      ? "bg-emerald-300/10 text-emerald-200 ring-emerald-300/20"
                      : "bg-amber-300/10 text-amber-200 ring-amber-300/20"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${data.mode === "live" ? "bg-emerald-300" : "bg-amber-300"}`} />
                  {data.mode === "live" ? "Live data" : "Anonymised demo"}
                </span>
                <span className="text-xs text-white/35">Updated {generated}</span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Fable Fury command centre</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
                Revenue, acquisition, margin, inventory and source reliability in one decision surface.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ANALYTICS_RANGES.map((range) => (
                <Link
                  key={range}
                  href={`${basePath}?range=${range}`}
                  scroll={false}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    data.range === range
                      ? "bg-white text-[#07101a]"
                      : "border border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}
                </Link>
              ))}
              <span className="ml-1 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/40">
                <RefreshCcw className="h-3.5 w-3.5" />
                max lag {freshness}m
              </span>
            </div>
          </div>

          {data.warning ? (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100/80">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-semibold text-amber-100">Live source unavailable — safe demo fallback active</div>
                <div className="mt-1 text-amber-100/55">{data.warning}</div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {data.metrics.map((metric) => (
              <article
                key={metric.key}
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-4 ${metricAccent(metric.key)}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">{metric.label}</div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white tabular-nums">{formatMetric(metric)}</div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  {metric.direction === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  <span className="font-semibold">{metric.change > 0 ? "+" : ""}{metric.change}</span>
                  <span className="text-white/35">{metric.changeLabel}</span>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-white/35">{metric.note}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_.8fr]">
            <article className="rounded-[24px] border border-white/10 bg-black/15 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.17em] text-[#9be6ff]">Performance trajectory</div>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Revenue and contribution profit</h3>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-[#9be6ff]">● Revenue</span>
                  <span className="text-[#aef8cc]">┈ Profit</span>
                </div>
              </div>
              <RevenueChart points={data.trend} />
            </article>

            <article className="rounded-[24px] border border-white/10 bg-black/15 p-5 sm:p-6">
              <div className="text-xs font-bold uppercase tracking-[0.17em] text-[#aef8cc]">Revenue mix</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Where growth is coming from</h3>
              <div className="mt-7">
                <MixDonut data={data.channels} />
              </div>
            </article>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
            <article className="overflow-hidden rounded-[24px] border border-white/10 bg-black/15">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5 sm:px-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.17em] text-[#ffdc98]">Channel economics</div>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Spend connected to real revenue</h3>
                </div>
                <Gauge className="h-5 w-5 text-white/25" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Channel</th>
                      <th className="px-4 py-4 font-semibold">Revenue</th>
                      <th className="px-4 py-4 font-semibold">Spend</th>
                      <th className="px-4 py-4 font-semibold">ROAS</th>
                      <th className="px-4 py-4 font-semibold">Orders</th>
                      <th className="px-4 py-4 font-semibold">CAC</th>
                      <th className="px-6 py-4 text-right font-semibold">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.channels.map((row) => (
                      <tr key={row.channel} className="border-t border-white/[0.07] text-white/68">
                        <td className="px-6 py-4 font-semibold text-white">{row.channel}</td>
                        <td className="px-4 py-4 tabular-nums">{money.format(row.revenue)}</td>
                        <td className="px-4 py-4 tabular-nums">{money.format(row.spend)}</td>
                        <td className="px-4 py-4 font-semibold tabular-nums text-[#ffdc98]">{row.roas ? `${row.roas.toFixed(2)}x` : "—"}</td>
                        <td className="px-4 py-4 tabular-nums">{integer.format(row.orders)}</td>
                        <td className="px-4 py-4 tabular-nums">{row.cac ? preciseMoney.format(row.cac) : "—"}</td>
                        <td className={`px-6 py-4 text-right font-semibold tabular-nums ${row.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                          {row.change >= 0 ? "+" : ""}{row.change.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-[24px] border border-[#b7a0ff]/20 bg-[#b7a0ff]/[0.055] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-[#d2c5ff]">
                  <Sparkles className="h-4 w-4" />
                  Executive readout
                </div>
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold text-white/45">{data.narrative.confidence}% confidence</span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.04em]">{data.narrative.headline}</h3>
              <p className="mt-4 text-sm leading-7 text-white/55">{data.narrative.summary}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#d2c5ff]">
                <Lightbulb className="h-4 w-4" />
                Explanation is grounded in the same reconciled data shown here.
              </div>
            </article>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <article className="overflow-hidden rounded-[24px] border border-white/10 bg-black/15">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5 sm:px-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.17em] text-[#ffc0c6]">Product health</div>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Margin and stock cover</h3>
                </div>
                <Package className="h-5 w-5 text-white/25" />
              </div>
              <div className="divide-y divide-white/[0.07]">
                {data.products.map((product) => (
                  <div key={product.product} className="grid grid-cols-[1.4fr_.6fr_.7fr_.65fr] items-center gap-3 px-5 py-4 text-sm sm:px-6">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">{product.product}</div>
                      <div className="mt-1 text-xs text-white/35">{integer.format(product.units)} units</div>
                    </div>
                    <div className="text-right tabular-nums text-white/60">{money.format(product.revenue)}</div>
                    <div className="text-right tabular-nums text-white/60">{product.margin.toFixed(1)}% margin</div>
                    <div className={`text-right text-xs font-semibold tabular-nums ${productStatusStyles(product.status)}`}>{product.stockCoverDays}d cover</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-black/15 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.17em] text-[#9be6ff]">Data reliability</div>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Every number has a health signal</h3>
                </div>
                <Database className="h-5 w-5 text-white/25" />
              </div>
              <div className="mt-5 space-y-3">
                {data.sourceHealth.map((source) => (
                  <div key={source.source} className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.13em] ring-1 ${statusStyles(source.status)}`}>{source.status}</span>
                        <span className="font-semibold text-white">{source.source}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/35">
                        <span>{source.lastSync}</span>
                        <span>{integer.format(source.records)} records</span>
                      </div>
                    </div>
                    {source.status === "healthy" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /> : <Clock3 className="h-5 w-5 shrink-0 text-amber-300" />}
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="mt-4 rounded-[24px] border border-white/10 bg-black/15 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.17em] text-[#aef8cc]">Decision queue</div>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">What the business should do next</h3>
              </div>
              <span className="text-xs text-white/35">Signals become owned, measurable actions.</span>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
              {data.actions.map((action) => (
                <div key={action.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] ${priorityStyles(action.priority)}`}>{action.priority}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">{action.owner}</span>
                  </div>
                  <h4 className="mt-4 font-semibold leading-snug text-white">{action.title}</h4>
                  <p className="mt-2 text-xs leading-5 text-white/42">{action.detail}</p>
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-300/[0.055] p-3 text-xs font-semibold leading-5 text-emerald-200/80">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {action.impact}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {publicView ? (
          <section className="grid gap-6 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#9be6ff]">The point is not the chart</div>
              <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">The point is a business that knows what is true—and can act on it.</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/50">
                Metabase remains useful for exploration. The operating interface does not need to look or behave like Metabase. Once the warehouse is trustworthy, the presentation can be designed around the people, decisions and workflow of the business.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/fantasy" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#07101a] transition hover:bg-[#9be6ff]">
                See another live system
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a href="mailto:samwillsonbiz@gmail.com?subject=BRHT%20systems%20conversation" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/35 hover:text-white">
                Discuss a business problem
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>
        ) : null}

        <footer className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>BRHT · Built by Samuel Willson in Perth, Western Australia.</span>
          <span className="inline-flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-[#9be6ff]" /> Data → understanding → action</span>
        </footer>
      </div>
    </main>
  );
}
