export const ANALYTICS_RANGES = ["7d", "30d", "90d"] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];
export type DashboardMode = "demo" | "live";

export type MetricCard = {
  key: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent" | "multiple";
  change: number;
  changeLabel: string;
  direction: "up" | "down" | "flat";
  intent: "positive" | "negative" | "neutral";
  note: string;
};

export type TrendPoint = {
  date: string;
  revenue: number;
  profit: number;
  adSpend: number;
};

export type ChannelRow = {
  channel: string;
  revenue: number;
  spend: number;
  roas: number;
  orders: number;
  cac: number;
  share: number;
  change: number;
};

export type ProductRow = {
  product: string;
  units: number;
  revenue: number;
  margin: number;
  stockCoverDays: number;
  status: "healthy" | "watch" | "action";
};

export type SourceHealth = {
  source: string;
  status: "healthy" | "delayed" | "error";
  lastSync: string;
  freshnessMinutes: number;
  records: number;
};

export type ActionItem = {
  title: string;
  detail: string;
  impact: string;
  owner: string;
  priority: "high" | "medium" | "low";
  category: "growth" | "margin" | "operations" | "data";
};

export type FableFuryDashboardData = {
  mode: DashboardMode;
  range: AnalyticsRange;
  generatedAt: string;
  currency: "USD";
  dataLabel: string;
  metrics: MetricCard[];
  trend: TrendPoint[];
  channels: ChannelRow[];
  products: ProductRow[];
  sourceHealth: SourceHealth[];
  actions: ActionItem[];
  narrative: {
    headline: string;
    summary: string;
    confidence: number;
  };
  warning?: string;
};

const trend30: TrendPoint[] = [
  { date: "Oct 12", revenue: 12640, profit: 5310, adSpend: 2480 },
  { date: "Oct 14", revenue: 14820, profit: 6420, adSpend: 2710 },
  { date: "Oct 16", revenue: 13190, profit: 5580, adSpend: 2540 },
  { date: "Oct 18", revenue: 17240, profit: 7810, adSpend: 2920 },
  { date: "Oct 20", revenue: 19480, profit: 8620, adSpend: 3290 },
  { date: "Oct 22", revenue: 18210, profit: 7990, adSpend: 3180 },
  { date: "Oct 24", revenue: 21340, profit: 9560, adSpend: 3460 },
  { date: "Oct 26", revenue: 20780, profit: 9140, adSpend: 3380 },
  { date: "Oct 28", revenue: 23820, profit: 10910, adSpend: 3710 },
  { date: "Oct 30", revenue: 22690, profit: 10120, adSpend: 3580 },
  { date: "Nov 01", revenue: 25140, profit: 11640, adSpend: 3890 },
  { date: "Nov 03", revenue: 26920, profit: 12480, adSpend: 4020 },
  { date: "Nov 05", revenue: 25360, profit: 11710, adSpend: 3910 },
  { date: "Nov 07", revenue: 28940, profit: 13780, adSpend: 4240 },
  { date: "Nov 09", revenue: 30120, profit: 14420, adSpend: 4380 },
];

const baseMetrics: MetricCard[] = [
  {
    key: "revenue",
    label: "Net revenue",
    value: 482216,
    format: "currency",
    change: 18.6,
    changeLabel: "vs prior period",
    direction: "up",
    intent: "positive",
    note: "Paid, refunded and discounted orders reconciled.",
  },
  {
    key: "profit",
    label: "Contribution profit",
    value: 213480,
    format: "currency",
    change: 22.4,
    changeLabel: "vs prior period",
    direction: "up",
    intent: "positive",
    note: "Revenue less product, fulfilment and paid-media costs.",
  },
  {
    key: "roas",
    label: "Blended ROAS",
    value: 4.21,
    format: "multiple",
    change: 0.46,
    changeLabel: "improvement",
    direction: "up",
    intent: "positive",
    note: "Attributed revenue divided by paid-media spend.",
  },
  {
    key: "orders",
    label: "Orders",
    value: 3926,
    format: "number",
    change: 12.8,
    changeLabel: "vs prior period",
    direction: "up",
    intent: "positive",
    note: "De-duplicated across connected sales channels.",
  },
  {
    key: "aov",
    label: "Average order value",
    value: 122.83,
    format: "currency",
    change: 4.7,
    changeLabel: "vs prior period",
    direction: "up",
    intent: "positive",
    note: "Net revenue divided by fulfilled customer orders.",
  },
  {
    key: "margin",
    label: "Contribution margin",
    value: 44.3,
    format: "percent",
    change: 1.6,
    changeLabel: "points gained",
    direction: "up",
    intent: "positive",
    note: "After variable product, fulfilment and acquisition costs.",
  },
];

const baseChannels: ChannelRow[] = [
  { channel: "Meta Ads", revenue: 178420, spend: 42180, roas: 4.23, orders: 1398, cac: 30.17, share: 37, change: 24.3 },
  { channel: "Google Ads", revenue: 116980, spend: 30140, roas: 3.88, orders: 906, cac: 33.27, share: 24, change: 14.9 },
  { channel: "Email / CRM", revenue: 81760, spend: 3820, roas: 21.4, orders: 672, cac: 5.68, share: 17, change: 11.7 },
  { channel: "Organic / Direct", revenue: 68420, spend: 0, roas: 0, orders: 564, cac: 0, share: 14, change: 8.4 },
  { channel: "Marketplace", revenue: 36636, spend: 7340, roas: 4.99, orders: 386, cac: 19.02, share: 8, change: -3.2 },
];

const baseProducts: ProductRow[] = [
  { product: "Core game", units: 1496, revenue: 119680, margin: 47.8, stockCoverDays: 83, status: "healthy" },
  { product: "Expansion", units: 1182, revenue: 76830, margin: 51.4, stockCoverDays: 48, status: "watch" },
  { product: "Besties vs Baddies", units: 924, revenue: 46200, margin: 45.2, stockCoverDays: 66, status: "healthy" },
  { product: "Metal coins", units: 711, revenue: 14220, margin: 62.1, stockCoverDays: 29, status: "action" },
  { product: "Playmat bundle", units: 496, revenue: 27280, margin: 39.7, stockCoverDays: 91, status: "healthy" },
];

const baseSources: SourceHealth[] = [
  { source: "Shopify", status: "healthy", lastSync: "4 minutes ago", freshnessMinutes: 4, records: 12842 },
  { source: "Meta Ads", status: "healthy", lastSync: "11 minutes ago", freshnessMinutes: 11, records: 2846 },
  { source: "Google Ads", status: "healthy", lastSync: "16 minutes ago", freshnessMinutes: 16, records: 1920 },
  { source: "Amazon", status: "delayed", lastSync: "2 hours ago", freshnessMinutes: 124, records: 884 },
  { source: "Fulfilment", status: "healthy", lastSync: "24 minutes ago", freshnessMinutes: 24, records: 9521 },
];

const baseActions: ActionItem[] = [
  {
    title: "Increase the winning Meta creative set",
    detail: "Three ads are clearing the target contribution margin with room before audience saturation.",
    impact: "+$18k–$27k projected monthly revenue",
    owner: "Growth",
    priority: "high",
    category: "growth",
  },
  {
    title: "Reorder metal coins this week",
    detail: "Current sales velocity leaves less than one month of cover, with the next production window approaching.",
    impact: "Protects an estimated $9.6k in attach revenue",
    owner: "Operations",
    priority: "high",
    category: "operations",
  },
  {
    title: "Investigate marketplace decline",
    detail: "Revenue is down while conversion is stable, pointing to a traffic or listing-visibility problem rather than offer quality.",
    impact: "Recover 3–5% of channel revenue",
    owner: "Commerce",
    priority: "medium",
    category: "growth",
  },
  {
    title: "Repair Amazon freshness alert",
    detail: "The source is beyond its normal sync window. The last successful load completed without row-count anomalies.",
    impact: "Restores confidence in the executive view",
    owner: "Data",
    priority: "medium",
    category: "data",
  },
];

const rangeFactors: Record<AnalyticsRange, number> = {
  "7d": 0.24,
  "30d": 1,
  "90d": 2.78,
};

function scaledMetric(metric: MetricCard, range: AnalyticsRange): MetricCard {
  if (["revenue", "profit", "orders"].includes(metric.key)) {
    return { ...metric, value: Math.round(metric.value * rangeFactors[range]) };
  }
  return metric;
}

function trendForRange(range: AnalyticsRange): TrendPoint[] {
  if (range === "7d") return trend30.slice(-7);
  if (range === "30d") return trend30;

  const first = trend30.map((point, index) => ({
    ...point,
    date: `Aug ${String(12 + index * 2).padStart(2, "0")}`,
    revenue: Math.round(point.revenue * 0.72),
    profit: Math.round(point.profit * 0.66),
    adSpend: Math.round(point.adSpend * 0.82),
  }));
  const second = trend30.map((point, index) => ({
    ...point,
    date: `Sep ${String(11 + index).padStart(2, "0")}`,
    revenue: Math.round(point.revenue * 0.86),
    profit: Math.round(point.profit * 0.82),
    adSpend: Math.round(point.adSpend * 0.91),
  }));
  return [...first, ...second, ...trend30];
}

export function normalizeRange(value: string | string[] | undefined): AnalyticsRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ANALYTICS_RANGES.includes(candidate as AnalyticsRange)
    ? (candidate as AnalyticsRange)
    : "30d";
}

export function getDemoFableFuryDashboardData(range: AnalyticsRange = "30d"): FableFuryDashboardData {
  return {
    mode: "demo",
    range,
    generatedAt: new Date().toISOString(),
    currency: "USD",
    dataLabel: "Anonymised demonstration data",
    metrics: baseMetrics.map((metric) => scaledMetric(metric, range)),
    trend: trendForRange(range),
    channels: baseChannels.map((channel) => ({
      ...channel,
      revenue: Math.round(channel.revenue * rangeFactors[range]),
      spend: Math.round(channel.spend * rangeFactors[range]),
      orders: Math.round(channel.orders * rangeFactors[range]),
    })),
    products: baseProducts.map((product) => ({
      ...product,
      units: Math.round(product.units * rangeFactors[range]),
      revenue: Math.round(product.revenue * rangeFactors[range]),
    })),
    sourceHealth: baseSources,
    actions: baseActions,
    narrative: {
      headline: "Growth is healthy, but inventory and data freshness need attention.",
      summary:
        "Revenue and contribution margin are improving together, which means growth is not being bought at the expense of economics. The immediate decisions are to protect stock on a high-margin add-on, scale the strongest paid-social creative carefully, and restore the delayed marketplace feed before the next executive review.",
      confidence: 92,
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDashboardData(value: unknown): value is FableFuryDashboardData {
  if (!isObject(value)) return false;
  return (
    Array.isArray(value.metrics) &&
    Array.isArray(value.trend) &&
    Array.isArray(value.channels) &&
    Array.isArray(value.products) &&
    Array.isArray(value.sourceHealth) &&
    Array.isArray(value.actions) &&
    isObject(value.narrative)
  );
}

export async function getFableFuryDashboardData(
  range: AnalyticsRange = "30d",
): Promise<FableFuryDashboardData> {
  const endpoint = process.env.FABLE_FURY_ANALYTICS_API_URL?.replace(/\/$/, "");
  const token = process.env.FABLE_FURY_ANALYTICS_API_TOKEN;

  if (!endpoint) return getDemoFableFuryDashboardData(range);

  try {
    const response = await fetch(`${endpoint}/v1/executive-dashboard?range=${range}`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`Analytics API returned ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isDashboardData(payload)) {
      throw new Error("Analytics API returned an invalid dashboard contract");
    }

    return {
      ...payload,
      mode: "live",
      range,
      currency: "USD",
      generatedAt: typeof payload.generatedAt === "string" ? payload.generatedAt : new Date().toISOString(),
      dataLabel: typeof payload.dataLabel === "string" ? payload.dataLabel : "Live PostgreSQL data",
    };
  } catch (error) {
    const fallback = getDemoFableFuryDashboardData(range);
    return {
      ...fallback,
      warning: error instanceof Error ? error.message : "Live analytics data could not be loaded.",
    };
  }
}
