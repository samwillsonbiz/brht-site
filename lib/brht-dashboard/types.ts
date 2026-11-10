export const DASHBOARD_RANGES = ["7d", "14d", "30d", "90d"] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];
export type DashboardSource = "postgres" | "api" | "unconfigured";
export type DashboardConnectionState =
  | "connected"
  | "unconfigured"
  | "unreachable"
  | "incomplete";

export type MetricValue = {
  value: number | null;
  previous: number | null;
  changePercent: number | null;
};

export type DashboardSummary = {
  revenue: MetricValue;
  orders: MetricValue;
  adSpend: MetricValue;
  blendedRoas: MetricValue;
  averageOrderValue: MetricValue;
  unitsSold: MetricValue;
};

export type DailyPerformancePoint = {
  date: string;
  revenue: number;
  adSpend: number;
  orders: number;
  unitsSold: number;
};

export type ChannelPerformanceRow = {
  channel: string;
  kind: "commerce" | "paid-media" | "mixed" | "other";
  revenue: number;
  previousRevenue: number;
  spend: number;
  previousSpend: number;
  orders: number;
  previousOrders: number;
  conversions: number;
  previousConversions: number;
  roas: number | null;
  changePercent: number | null;
  latestMetricAt: string | null;
};

export type ProductPerformanceRow = {
  productId: string;
  productName: string;
  unitsSold: number;
  previousUnitsSold: number;
  changePercent: number | null;
  availableQuantity: number | null;
  inventorySnapshotAt: string | null;
  averageDailyUnits: number | null;
  daysOfCover: number | null;
  inventoryStatus:
    | "healthy"
    | "watch"
    | "critical"
    | "out-of-stock"
    | "no-velocity"
    | "unknown";
};

export type DataSourceHealth = {
  source: string;
  status: "healthy" | "delayed" | "failed" | "unknown";
  message: string | null;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  latestMetricDate: string | null;
  latestMetricAt: string | null;
  lagHours: number | null;
};

export type TableCapability = {
  name: string;
  available: boolean;
  required: boolean;
};

export type DashboardData = {
  source: DashboardSource;
  connection: DashboardConnectionState;
  generatedAt: string;
  range: DashboardRange;
  rangeDays: number;
  period: {
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  };
  summary: DashboardSummary;
  trend: DailyPerformancePoint[];
  channels: ChannelPerformanceRow[];
  products: ProductPerformanceRow[];
  dataHealth: DataSourceHealth[];
  capabilities: TableCapability[];
  warnings: string[];
  error: string | null;
};

export function rangeToDays(range: DashboardRange): number {
  return Number.parseInt(range.replace("d", ""), 10);
}

export function normalizeDashboardRange(
  value: string | string[] | undefined,
): DashboardRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  return DASHBOARD_RANGES.includes(candidate as DashboardRange)
    ? (candidate as DashboardRange)
    : "14d";
}

export function emptyMetric(): MetricValue {
  return { value: null, previous: null, changePercent: null };
}

export function emptySummary(): DashboardSummary {
  return {
    revenue: emptyMetric(),
    orders: emptyMetric(),
    adSpend: emptyMetric(),
    blendedRoas: emptyMetric(),
    averageOrderValue: emptyMetric(),
    unitsSold: emptyMetric(),
  };
}

export function emptyDashboardData(
  range: DashboardRange,
  options: {
    source?: DashboardSource;
    connection?: DashboardConnectionState;
    error?: string | null;
    warnings?: string[];
  } = {},
): DashboardData {
  const days = rangeToDays(range);
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  const date = (value: Date) => value.toISOString().slice(0, 10);

  return {
    source: options.source ?? "unconfigured",
    connection: options.connection ?? "unconfigured",
    generatedAt: new Date().toISOString(),
    range,
    rangeDays: days,
    period: {
      start: date(start),
      end: date(end),
      previousStart: date(previousStart),
      previousEnd: date(previousEnd),
    },
    summary: emptySummary(),
    trend: [],
    channels: [],
    products: [],
    dataHealth: [],
    capabilities: [
      { name: "daily_channel_metrics", available: false, required: true },
      { name: "shopify_product_daily", available: false, required: false },
      { name: "inventory_snapshots", available: false, required: false },
      { name: "products", available: false, required: false },
      { name: "sync_runs", available: false, required: false },
      { name: "dashboard_daily_summary", available: false, required: false },
    ],
    warnings: options.warnings ?? [],
    error: options.error ?? null,
  };
}
