import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  ExternalLink,
  Gauge,
  Layers3,
  PackageSearch,
  RefreshCw,
  Settings2,
  ShoppingBag,
  TrendingUp,
  Unplug,
} from "lucide-react";
import { PerformanceChart } from "./PerformanceChart";
import { MetricTrendChart } from "./MetricTrendChart";
import { KickstarterPanel } from "./KickstarterPanel";
import {
  DASHBOARD_RANGES,
  type DashboardData,
  type DashboardRange,
  type MetricValue,
  type ProductPerformanceRow,
} from "@/lib/brht-dashboard/types";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function formatCurrency(value: number, currency: string, precise = false) {
  const key = `${currency}:${precise ? "precise" : "whole"}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: precise ? 2 : 0,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(value);
}

function formatMetric(
  value: number | null,
  format: "money" | "precise-money" | "number" | "multiple",
  currency: string,
) {
  if (value === null) return "—";
  if (format === "money") return formatCurrency(value, currency);
  if (format === "precise-money") return formatCurrency(value, currency, true);
  if (format === "multiple") return `${value.toFixed(2)}x`;
  return number.format(value);
}

function ChangeBadge({ metric }: { metric: MetricValue }) {
  if (metric.changePercent === null) {
    return <span className="text-xs text-[#86868b]">No prior comparison</span>;
  }
  const positive = metric.changePercent >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        positive ? "text-[#16834a]" : "text-[#d92d20]"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {Math.abs(metric.changePercent).toFixed(1)}%
      <span className="font-normal text-[#86868b]">vs prior period</span>
    </span>
  );
}

function KpiCard({
  label,
  metric,
  format,
  icon: Icon,
  note,
  currency,
}: {
  label: string;
  metric: MetricValue;
  format: "money" | "precise-money" | "number" | "multiple";
  icon: typeof CircleDollarSign;
  note: string;
  currency: string;
}) {
  return (
    <article className="rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.045)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#86868b]">
          {label}
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f2f7] text-[#0071e3]">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-5 text-[30px] font-semibold tracking-[-0.045em] text-[#1d1d1f] tabular-nums">
        {formatMetric(metric.value, format, currency)}
      </div>
      <div className="mt-3">
        <ChangeBadge metric={metric} />
      </div>
      <p className="mt-3 text-[11px] leading-5 text-[#86868b]">{note}</p>
    </article>
  );
}

function SourceBadge({ data }: { data: DashboardData }) {
  const connected = data.connection === "connected";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
        connected
          ? "bg-[#eaf8ef] text-[#167645] ring-[#b8e5c8]"
          : "bg-[#fff7e6] text-[#9a5b00] ring-[#f2d49a]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-[#22a35a]" : "bg-[#f59e0b]"}`}
      />
      {connected
        ? "Live BRHT database"
        : data.connection === "not-found"
          ? "Organization not configured"
          : data.connection === "unreachable"
            ? "Platform unavailable"
            : "Platform not configured"}
    </span>
  );
}

function rangeLabel(range: DashboardRange) {
  return range === "7d"
    ? "7 days"
    : range === "14d"
      ? "14 days"
      : range === "30d"
        ? "30 days"
        : "90 days";
}

function ConnectionPanel({ data }: { data: DashboardData }) {
  const missing = data.capabilities.filter((capability) => !capability.available);
  return (
    <section className="rounded-[28px] border border-[#f0c36a] bg-[#fffaf0] p-6 shadow-[0_10px_35px_rgba(111,72,0,.06)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#b76e00] shadow-sm ring-1 ring-black/[0.05]">
              {data.connection === "unreachable" ? (
                <Unplug className="h-5 w-5" />
              ) : (
                <Database className="h-5 w-5" />
              )}
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                {data.connection === "unreachable"
                  ? "The BRHT data platform is not reachable"
                  : data.connection === "not-found"
                    ? "This organization is not configured in the BRHT data platform"
                    : "Connect this deployment to the BRHT data platform"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#6e6e73]">
                No sample business numbers are being shown. Once Supabase is available to this deployment, the dashboard reads the organization’s live normalized data through the BRHT server layer.
              </p>
            </div>
          </div>
          {data.error ? (
            <div className="mt-5 rounded-2xl border border-[#f0c36a]/70 bg-white/70 px-4 py-3 text-sm text-[#7a4a00]">
              {data.error}
            </div>
          ) : null}
        </div>
        <div className="min-w-[280px] rounded-2xl border border-black/[0.06] bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868b]">
            Connection options
          </div>
          <div className="mt-3 space-y-2 text-sm text-[#3a3a3c]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22a35a]" />
              Supabase server credentials
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22a35a]" />
              Organization-specific ingest key
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22a35a]" />
              Credentials remain server-side
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(missing.length > 0 ? data.capabilities : []).map((capability) => (
          <div
            key={capability.name}
            className="flex items-center justify-between gap-3 rounded-2xl border border-black/[0.055] bg-white/80 px-4 py-3"
          >
            <code className="text-xs text-[#3a3a3c]">{capability.name}</code>
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
                capability.required ? "text-[#d92d20]" : "text-[#86868b]"
              }`}
            >
              {capability.required ? "required" : "optional"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function inventoryStyle(status: ProductPerformanceRow["inventoryStatus"]) {
  if (status === "healthy") return "bg-[#eaf8ef] text-[#167645]";
  if (status === "watch") return "bg-[#fff7e6] text-[#9a5b00]";
  if (status === "critical" || status === "out-of-stock") {
    return "bg-[#fff0ef] text-[#b42318]";
  }
  return "bg-[#f2f2f7] text-[#6e6e73]";
}

function formatCover(product: ProductPerformanceRow) {
  if (product.inventoryStatus === "out-of-stock") return "Out of stock";
  if (product.daysOfCover === null) return "No cover estimate";
  return `${Math.round(product.daysOfCover)} days cover`;
}

export function BusinessDashboard({ data }: { data: DashboardData }) {
  const generated = new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Perth",
  }).format(new Date(data.generatedAt));
  const maxChannel = Math.max(
    1,
    ...data.channels.map((channel) => Math.max(channel.revenue, channel.spend)),
  );
  const maxProduct = Math.max(1, ...data.products.map((product) => product.unitsSold));

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <header className="sticky top-0 z-30 border-b border-black/[0.07] bg-[#f5f5f7]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl bg-[#1d1d1f] text-sm font-black text-white">
              B
            </Link>
            <div>
              <div className="text-sm font-semibold tracking-[-0.01em]">BRHT Dashboards</div>
              <div className="text-[11px] text-[#86868b]">{data.organization.name} operating data</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SourceBadge data={data} />
            <Link
              href={`/api/dashboards/${data.organization.slug}?range=${data.range}`}
              className="hidden h-9 items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 text-xs font-semibold text-[#3a3a3c] transition hover:border-black/20 sm:inline-flex"
            >
              JSON
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1520px] gap-8 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868b]">
              {data.organization.name}
            </div>
            {[
              [BarChart3, "Overview", "#overview"],
              [CircleDollarSign, "Sales & marketing", "#channels"],
              [TrendingUp, "Kickstarter", "#kickstarter"],
              [Boxes, "Products & inventory", "#products"],
              [Database, "Data health", "#data-health"],
            ].map(([Icon, label, href], index) => {
              const IconComponent = Icon as typeof BarChart3;
              return (
                <a
                  key={String(label)}
                  href={String(href)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    index === 0
                      ? "bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/[0.05]"
                      : "text-[#6e6e73] hover:bg-white/70 hover:text-[#1d1d1f]"
                  }`}
                >
                  <IconComponent className={`h-4 w-4 ${index === 0 ? "text-[#0071e3]" : ""}`} />
                  {String(label)}
                </a>
              );
            })}
            <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3a3a3c]">
                <RefreshCw className="h-3.5 w-3.5 text-[#0071e3]" />
                Last rendered
              </div>
              <div className="mt-2 text-[11px] leading-5 text-[#86868b]">{generated}</div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <section id="overview" className="scroll-mt-24">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-[#0071e3]">{data.organization.name}</div>
                <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {data.dashboard.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6e6e73]">
                  {data.dashboard.description ??
                    "One operating view across commerce, paid media, product velocity, inventory and ingestion reliability."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {DASHBOARD_RANGES.map((range) => (
                  <Link
                    key={range}
                    href={`/dashboards/${data.organization.slug}?range=${range}`}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      data.range === range
                        ? "bg-[#1d1d1f] text-white shadow-sm"
                        : "border border-black/[0.08] bg-white text-[#6e6e73] hover:border-black/20 hover:text-[#1d1d1f]"
                    }`}
                  >
                    {rangeLabel(range)}
                  </Link>
                ))}
              </div>
            </div>

            {data.connection !== "connected" ? (
              <div className="mt-8">
                <ConnectionPanel data={data} />
              </div>
            ) : null}

            {data.warnings.length > 0 && data.connection === "connected" ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#f0c36a] bg-[#fffaf0] px-4 py-3 text-sm text-[#7a4a00]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>{data.warnings.join(" ")}</div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <KpiCard
                label="Sales revenue"
                metric={data.summary.revenue}
                format="money"
                currency={data.organization.currency}
                icon={CircleDollarSign}
                note="Operational revenue from non-advertising sources; paid-media attribution is not double-counted."
              />
              <KpiCard
                label="Orders"
                metric={data.summary.orders}
                format="number"
                currency={data.organization.currency}
                icon={ShoppingBag}
                note="Orders or transactions from non-advertising sources in the selected period."
              />
              <KpiCard
                label="Ad spend"
                metric={data.summary.adSpend}
                format="money"
                currency={data.organization.currency}
                icon={TrendingUp}
                note="Spend from connected paid-media channels."
              />
              <KpiCard
                label="Blended ROAS"
                metric={data.summary.blendedRoas}
                format="multiple"
                currency={data.organization.currency}
                icon={Gauge}
                note="Sales revenue divided by total paid-media spend."
              />
              <KpiCard
                label="Average order"
                metric={data.summary.averageOrderValue}
                format="precise-money"
                currency={data.organization.currency}
                icon={Layers3}
                note="Operational revenue divided by reported orders or transactions."
              />
              <KpiCard
                label="Units sold"
                metric={data.summary.unitsSold}
                format="number"
                currency={data.organization.currency}
                icon={Boxes}
                note="Product units from connected commerce sources."
              />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">
                      Performance trajectory
                    </div>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                      Revenue and advertising spend
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-[#0071e3]">● Revenue</span>
                    <span className="text-[#c66b00]">┈ Ad spend</span>
                  </div>
                </div>
                <div className="mt-5">
                  <PerformanceChart points={data.trend} currency={data.organization.currency} />
                </div>
              </article>

              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
                <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">
                  Period definition
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">What is being compared</h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-[#f5f5f7] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868b]">Current</div>
                    <div className="mt-2 text-sm font-semibold text-[#1d1d1f]">
                      {data.period.start} → {data.period.end}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#f5f5f7] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868b]">Previous</div>
                    <div className="mt-2 text-sm font-semibold text-[#1d1d1f]">
                      {data.period.previousStart} → {data.period.previousEnd}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-black/[0.06] p-4 text-xs leading-5 text-[#6e6e73]">
                    <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0071e3]" />
                    Financial logic stays in the BRHT reporting model. The website presents the results rather than recreating spreadsheet formulas in the browser.
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Demand trend</div>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Orders by day</h3>
                <div className="mt-3"><MetricTrendChart points={data.trend} metric="orders" /></div>
              </article>
              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Product trend</div>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Units sold by day</h3>
                <div className="mt-3"><MetricTrendChart points={data.trend} metric="unitsSold" /></div>
              </article>
              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Efficiency trend</div>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Daily blended ROAS</h3>
                <div className="mt-3"><MetricTrendChart points={data.trend} metric="roas" /></div>
              </article>
            </div>
          </section>

          <section id="channels" className="mt-12 scroll-mt-24">
            <div>
              <div className="text-xs font-semibold text-[#0071e3]">Sales & marketing</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Channel performance</h2>
            </div>
            <div className="mt-5 overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,.04)]">
              {data.channels.length === 0 ? (
                <div className="grid min-h-64 place-items-center p-8 text-center">
                  <div>
                    <BarChart3 className="mx-auto h-7 w-7 text-[#86868b]" />
                    <div className="mt-3 text-sm font-semibold">No channel rows available</div>
                    <div className="mt-1 text-xs text-[#86868b]">Waiting for normalized daily metrics from connected sources.</div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-black/[0.055]">
                  {data.channels.map((channel) => {
                    const primary = channel.kind === "paid-media" ? channel.spend : channel.revenue;
                    const barWidth = Math.max(2, (primary / maxChannel) * 100);
                    return (
                      <div key={channel.channel} className="grid gap-4 p-5 lg:grid-cols-[190px_1fr_105px_105px_90px] lg:items-center">
                        <div>
                          <div className="font-semibold text-[#1d1d1f]">{channel.channel}</div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#86868b]">
                            {channel.kind.replace("-", " ")}
                          </div>
                        </div>
                        <div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#f2f2f7]">
                            <div
                              className={`h-full rounded-full ${channel.kind === "paid-media" ? "bg-[#ff9f0a]" : "bg-[#0071e3]"}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#86868b]">
                            <span>{formatCurrency(channel.revenue, data.organization.currency)} revenue</span>
                            <span>{formatCurrency(channel.spend, data.organization.currency)} spend</span>
                          </div>
                        </div>
                        <div className="lg:text-right">
                          <div className="text-xs text-[#86868b]">Orders</div>
                          <div className="mt-1 font-semibold tabular-nums">{number.format(channel.orders)}</div>
                        </div>
                        <div className="lg:text-right">
                          <div className="text-xs text-[#86868b]">ROAS</div>
                          <div className="mt-1 font-semibold tabular-nums">
                            {channel.roas === null ? "—" : `${channel.roas.toFixed(2)}x`}
                          </div>
                        </div>
                        <div className={`text-sm font-semibold lg:text-right ${
                          channel.changePercent === null
                            ? "text-[#86868b]"
                            : channel.changePercent >= 0
                              ? "text-[#16834a]"
                              : "text-[#d92d20]"
                        }`}>
                          {channel.changePercent === null
                            ? "—"
                            : `${channel.changePercent >= 0 ? "+" : ""}${channel.changePercent.toFixed(1)}%`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section id="kickstarter" className="mt-12 scroll-mt-24">
            <div>
              <div className="text-xs font-semibold text-[#0071e3]">Crowdfunding</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Kickstarter performance</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6e6e73]">
                Live campaign funding, backer growth and historical Fable Fury campaign performance.
              </p>
            </div>
            <div className="mt-5">
              <KickstarterPanel data={data.kickstarter} currency={data.organization.currency} />
            </div>
          </section>

          <section id="products" className="mt-12 scroll-mt-24">
            <div>
              <div className="text-xs font-semibold text-[#0071e3]">Products & inventory</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Velocity and stock cover</h2>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Product demand</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Units sold</h3>
                  </div>
                  <Boxes className="h-5 w-5 text-[#86868b]" />
                </div>
                <div className="mt-6 space-y-5">
                  {data.products.length === 0 ? (
                    <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-black/10 bg-[#fafafa] text-center">
                      <div>
                        <PackageSearch className="mx-auto h-7 w-7 text-[#86868b]" />
                        <div className="mt-3 text-sm font-semibold">No product rows available</div>
                        <div className="mt-1 text-xs text-[#86868b]">Waiting for normalized product performance from connected sources.</div>
                      </div>
                    </div>
                  ) : (
                    data.products.slice(0, 10).map((product) => (
                      <div key={product.productId}>
                        <div className="flex items-center justify-between gap-4">
                          <span className="truncate text-sm font-medium text-[#3a3a3c]">{product.productName}</span>
                          <span className="text-sm font-semibold tabular-nums">{number.format(product.unitsSold)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f2f2f7]">
                          <div
                            className="h-full rounded-full bg-[#0071e3]"
                            style={{ width: `${Math.max(2, (product.unitsSold / maxProduct) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Inventory</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Stock risk</h3>
                  </div>
                  <PackageSearch className="h-5 w-5 text-[#86868b]" />
                </div>
                <div className="mt-5 divide-y divide-black/[0.055]">
                  {data.products.length === 0 ? (
                    <div className="grid min-h-56 place-items-center text-center text-xs text-[#86868b]">
                      Inventory status will appear after live data is connected.
                    </div>
                  ) : (
                    [...data.products]
                      .sort((a, b) => {
                        const aCover = a.daysOfCover ?? Number.POSITIVE_INFINITY;
                        const bCover = b.daysOfCover ?? Number.POSITIVE_INFINITY;
                        return aCover - bCover;
                      })
                      .slice(0, 10)
                      .map((product) => (
                        <div key={product.productId} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{product.productName}</div>
                            <div className="mt-1 text-xs text-[#86868b]">
                              {product.availableQuantity === null
                                ? "Quantity unavailable"
                                : `${number.format(product.availableQuantity)} available`}
                            </div>
                            {product.inventoryBySource.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-[#a1a1a6]">
                                {product.inventoryBySource.map((source) => (
                                  <span key={source.sourceKey}>
                                    {source.sourceKey === "amazon" ? "Amazon" : source.sourceKey === "shopify" ? "Shopify" : source.sourceKey}:{" "}
                                    {source.available === null ? "—" : number.format(source.available)}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${inventoryStyle(product.inventoryStatus)}`}>
                            {formatCover(product)}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </article>
            </div>
          </section>

          <section id="data-health" className="mt-12 scroll-mt-24">
            <div>
              <div className="text-xs font-semibold text-[#0071e3]">Reliability</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Data health</h2>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Source freshness</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Ingestion status</h3>
                  </div>
                  <Database className="h-5 w-5 text-[#86868b]" />
                </div>
                <div className="mt-5 divide-y divide-black/[0.055]">
                  {data.dataHealth.length === 0 ? (
                    <div className="grid min-h-52 place-items-center text-center">
                      <div>
                        <Clock3 className="mx-auto h-7 w-7 text-[#86868b]" />
                        <div className="mt-3 text-sm font-semibold">No source health rows yet</div>
                        <div className="mt-1 text-xs text-[#86868b]">Waiting for source sync history and freshness timestamps.</div>
                      </div>
                    </div>
                  ) : (
                    data.dataHealth.map((source) => (
                      <div key={source.source} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {source.status === "healthy" ? (
                              <CheckCircle2 className="h-4 w-4 text-[#22a35a]" />
                            ) : source.status === "failed" ? (
                              <AlertTriangle className="h-4 w-4 text-[#d92d20]" />
                            ) : (
                              <Clock3 className="h-4 w-4 text-[#c66b00]" />
                            )}
                            <span className="font-medium">{source.source}</span>
                          </div>
                          <div className="mt-1 truncate text-xs text-[#86868b]">
                            {source.message ?? (source.latestMetricDate ? `Latest metric date ${source.latestMetricDate}` : "No status message")}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={`text-xs font-semibold ${
                            source.status === "healthy"
                              ? "text-[#16834a]"
                              : source.status === "failed"
                                ? "text-[#d92d20]"
                                : "text-[#9a5b00]"
                          }`}>
                            {source.status}
                          </div>
                          <div className="mt-1 text-[11px] text-[#86868b]">
                            {source.lagHours === null ? "lag unknown" : `${source.lagHours.toFixed(1)}h lag`}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
                <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Warehouse coverage</div>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Reporting objects</h3>
                <div className="mt-5 space-y-3">
                  {data.capabilities.map((capability) => (
                    <div key={capability.name} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f5f5f7] px-4 py-3">
                      <code className="truncate text-xs text-[#3a3a3c]">{capability.name}</code>
                      <span className={`inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.09em] ${
                        capability.available ? "text-[#16834a]" : capability.required ? "text-[#d92d20]" : "text-[#86868b]"
                      }`}>
                        {capability.available ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                        {capability.available ? "ready" : capability.required ? "missing" : "optional"}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
