import { isSupabaseConfigured, rpc, selectRows } from "@/lib/supabaseRest";
import {
  emptyDashboardData,
  rangeToDays,
  type ChannelPerformanceRow,
  type DashboardData,
  type DashboardRange,
  type DataSourceHealth,
  type DailyPerformancePoint,
  type ProductPerformanceRow,
  type KickstarterData,
} from "./types";
import {
  dateOnly,
  finiteNumber,
  isoDate,
  metric,
  nullableFiniteNumber,
  percentChange,
  safeDivide,
} from "./math";

type OrganizationRow = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  status: string;
};

type DashboardBundle = {
  organization: OrganizationRow;
  dashboard?: {
    dashboard_key?: string;
    title?: string;
    description?: string | null;
  };
  metrics?: RawMetric[];
  products?: RawProduct[];
  inventory?: RawInventory[];
  sources?: RawSource[];
  period?: DashboardData["period"];
  kickstarterMetrics?: RawMetric[];
};

type RawMetric = {
  metric_date: string;
  source_key: string;
  metric_key: string;
  dimension_key: string;
  dimensions: Record<string, unknown> | null;
  value: number | string;
  unit: string | null;
  source_updated_at: string | null;
  updated_at: string | null;
};

type RawProduct = {
  metric_date: string;
  source_key: string;
  product_key: string;
  product_name: string;
  sku: string | null;
  units_sold: number | string;
  gross_revenue: number | string;
  net_revenue: number | string;
  refunds: number | string;
  cogs: number | string | null;
  currency: string | null;
  source_updated_at: string | null;
  updated_at: string | null;
};

type RawInventory = {
  source_key: string;
  product_key: string;
  product_name: string;
  sku: string | null;
  captured_at: string;
  on_hand: number | string | null;
  available: number | string | null;
  committed: number | string | null;
  incoming: number | string | null;
};

type RawSource = {
  source_key: string;
  source_type: string;
  display_name: string;
  configured_status: string;
  last_synced_at: string | null;
  latest_run_status: string | null;
  latest_run_started_at: string | null;
  latest_run_finished_at: string | null;
  rows_read: number | string | null;
  rows_written: number | string | null;
  rows_failed: number | string | null;
  error_message: string | null;
};

type ChannelAccumulator = Omit<
  ChannelPerformanceRow,
  "channel" | "kind" | "roas" | "changePercent"
> & {
  sourceKey: string;
  sourceType: string;
  attributedRevenue: number;
  previousAttributedRevenue: number;
};

const REVENUE_METRICS = new Set(["sales_revenue", "net_revenue"]);
const ATTRIBUTED_REVENUE_METRICS = new Set(["attributed_revenue"]);
const SPEND_METRICS = new Set(["ad_spend"]);
const ORDER_METRICS = new Set(["orders"]);
const CONVERSION_METRICS = new Set(["conversions", "purchases"]);
const UNIT_METRICS = new Set(["units_sold"]);

function formatDateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function addDays(date: string, amount: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

function periodFor(range: DashboardRange, timezone: string): DashboardData["period"] {
  const days = rangeToDays(range);
  const end = formatDateInTimezone(new Date(), timezone);
  const start = addDays(end, -(days - 1));
  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(days - 1));
  return { start, end, previousStart, previousEnd };
}

function inPeriod(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function logicalProductKey(value: string): string {
  const name = String(value ?? "").toLowerCase();
  if (name.includes("besties")) return "besties-vs-baddies";
  if (name.includes("fable fury")) return "fable-fury";
  if (name.includes("metal coin")) return "premium-metal-coins";
  if (name.includes("card sleeve")) return "custom-card-sleeves";
  if (name.includes("drakorath") || name.includes("plush")) return "drakorath-jr-plushie";
  if (name.includes("enemies unleashed")) return "enemies-unleashed";
  if (name.includes("neoprene") || name.includes("game board")) return "neoprene-game-board";
  return name.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sumNullable(values: Array<number | null>): number | null {
  const numbers = values.filter((value): value is number => value !== null);
  return numbers.length ? numbers.reduce((total, value) => total + value, 0) : null;
}

function sourceTypeToKind(sourceType: string): ChannelPerformanceRow["kind"] {
  if (sourceType === "commerce") return "commerce";
  if (sourceType === "paid_media") return "paid-media";
  if (sourceType === "finance") return "finance";
  if (sourceType === "operations") return "operations";
  if (sourceType === "mixed") return "mixed";
  return "other";
}

function metricChannel(
  row: RawMetric,
  source: RawSource | undefined,
): { key: string; label: string } {
  const dimensions = row.dimensions ?? {};
  const raw =
    dimensions.channel ??
    dimensions.platform ??
    dimensions.store ??
    dimensions.account ??
    row.source_key;
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, "_") || row.source_key;
  const label =
    typeof dimensions.channel_label === "string"
      ? dimensions.channel_label
      : source?.display_name ?? titleCase(String(raw));
  return { key, label };
}

function inventoryStatus(
  available: number | null,
  daysOfCover: number | null,
  averageDailyUnits: number | null,
): ProductPerformanceRow["inventoryStatus"] {
  if (available === null) return "unknown";
  if (available <= 0) return "out-of-stock";
  if (!averageDailyUnits || averageDailyUnits <= 0) return "no-velocity";
  if (daysOfCover !== null && daysOfCover < 14) return "critical";
  if (daysOfCover !== null && daysOfCover < 30) return "watch";
  return "healthy";
}

function emptyChannel(sourceKey: string, sourceType: string): ChannelAccumulator {
  return {
    sourceKey,
    sourceType,
    revenue: 0,
    previousRevenue: 0,
    spend: 0,
    previousSpend: 0,
    orders: 0,
    previousOrders: 0,
    conversions: 0,
    previousConversions: 0,
    attributedRevenue: 0,
    previousAttributedRevenue: 0,
    latestMetricAt: null,
  };
}

function addMetric(
  target: ChannelAccumulator,
  metricKey: string,
  value: number,
  current: boolean,
) {
  if (REVENUE_METRICS.has(metricKey)) {
    if (current) target.revenue += value;
    else target.previousRevenue += value;
  } else if (ATTRIBUTED_REVENUE_METRICS.has(metricKey)) {
    if (current) target.attributedRevenue += value;
    else target.previousAttributedRevenue += value;
  } else if (SPEND_METRICS.has(metricKey)) {
    if (current) target.spend += value;
    else target.previousSpend += value;
  } else if (ORDER_METRICS.has(metricKey)) {
    if (current) target.orders += value;
    else target.previousOrders += value;
  } else if (CONVERSION_METRICS.has(metricKey)) {
    if (current) target.conversions += value;
    else target.previousConversions += value;
  }
}

function toHealth(source: RawSource): DataSourceHealth {
  const now = Date.now();
  const reference =
    isoDate(source.latest_run_finished_at) ??
    isoDate(source.last_synced_at) ??
    isoDate(source.latest_run_started_at);
  const lagHours = reference
    ? Math.max(0, (now - new Date(reference).getTime()) / 3_600_000)
    : null;
  const configured = String(source.configured_status ?? "").toLowerCase();
  const latest = String(source.latest_run_status ?? "").toLowerCase();
  const status: DataSourceHealth["status"] =
    configured === "paused"
      ? "paused"
      : configured === "error" || latest === "failed"
        ? "failed"
        : lagHours === null
          ? "unknown"
          : lagHours > 30
            ? "delayed"
            : "healthy";

  return {
    source: source.display_name,
    sourceKey: source.source_key,
    sourceType: source.source_type,
    status,
    message: source.error_message,
    lastStartedAt: isoDate(source.latest_run_started_at),
    lastFinishedAt: isoDate(source.latest_run_finished_at),
    latestMetricDate: dateOnly(source.last_synced_at),
    latestMetricAt: isoDate(source.last_synced_at),
    lagHours,
  };
}

function buildKickstarterData(rows: RawMetric[]): KickstarterData {
  const snapshots = new Map<string, {
    campaignKey: string;
    campaignName: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    byDate: Map<string, {
      date: string;
      pledged: number;
      backers: number;
      goal: number;
      daysRemaining: number | null;
    }>;
  }>();

  for (const row of rows) {
    const dimensions = row.dimensions ?? {};
    const campaignKey = String(dimensions.campaign ?? row.dimension_key ?? "campaign");
    const campaignName = String(dimensions.campaign_label ?? titleCase(campaignKey));
    const status = String(dimensions.campaign_status ?? "unknown");
    const startDate = typeof dimensions.campaign_start === "string" ? dimensions.campaign_start : null;
    const endDate = typeof dimensions.campaign_end === "string" ? dimensions.campaign_end : null;
    const date = dateOnly(row.metric_date);
    if (!date) continue;

    const campaign = snapshots.get(campaignKey) ?? {
      campaignKey,
      campaignName,
      status,
      startDate,
      endDate,
      byDate: new Map(),
    };
    const point = campaign.byDate.get(date) ?? {
      date,
      pledged: 0,
      backers: 0,
      goal: 0,
      daysRemaining: null,
    };
    const value = finiteNumber(row.value);
    if (row.metric_key === "campaign_pledged") point.pledged = value;
    if (row.metric_key === "campaign_backers") point.backers = value;
    if (row.metric_key === "campaign_goal") point.goal = value;
    if (row.metric_key === "campaign_days_remaining") point.daysRemaining = value;
    campaign.byDate.set(date, point);
    snapshots.set(campaignKey, campaign);
  }

  const trend: KickstarterData["trend"] = [];
  const campaigns: KickstarterData["campaigns"] = [];

  for (const campaign of snapshots.values()) {
    const points = Array.from(campaign.byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    let previousPledged: number | null = null;
    let previousBackers: number | null = null;
    for (const point of points) {
      trend.push({
        date: point.date,
        campaignKey: campaign.campaignKey,
        campaignName: campaign.campaignName,
        pledged: point.pledged,
        backers: point.backers,
        dailyPledged: previousPledged === null ? null : Math.max(0, point.pledged - previousPledged),
        dailyBackers: previousBackers === null ? null : Math.max(0, point.backers - previousBackers),
      });
      previousPledged = point.pledged;
      previousBackers = point.backers;
    }
    const latest = points.at(-1);
    if (!latest) continue;
    campaigns.push({
      campaignKey: campaign.campaignKey,
      name: campaign.campaignName,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      pledged: latest.pledged,
      backers: latest.backers,
      goal: latest.goal,
      averagePledge: safeDivide(latest.pledged, latest.backers) ?? 0,
      daysRemaining: latest.daysRemaining,
      latestDate: latest.date,
    });
  }

  campaigns.sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  trend.sort((a, b) => a.date.localeCompare(b.date));
  return { campaigns, trend };
}

function buildDashboard(
  organization: OrganizationRow,
  bundle: DashboardBundle,
  range: DashboardRange,
  period: DashboardData["period"],
): DashboardData {
  const metricRows = Array.isArray(bundle.metrics) ? bundle.metrics : [];
  const productRows = Array.isArray(bundle.products) ? bundle.products : [];
  const inventoryRows = Array.isArray(bundle.inventory) ? bundle.inventory : [];
  const sourceRows = Array.isArray(bundle.sources) ? bundle.sources : [];
  const kickstarterRows = Array.isArray(bundle.kickstarterMetrics) ? bundle.kickstarterMetrics : [];
  const kickstarter = buildKickstarterData(kickstarterRows);
  const sourceMap = new Map(sourceRows.map((source) => [source.source_key, source]));
  const channelMap = new Map<string, { label: string; values: ChannelAccumulator }>();
  const dailyMap = new Map<string, DailyPerformancePoint>();

  const ensureDaily = (date: string) => {
    const current = dailyMap.get(date);
    if (current) return current;
    const point: DailyPerformancePoint = {
      date,
      revenue: 0,
      adSpend: 0,
      orders: 0,
      unitsSold: 0,
    };
    dailyMap.set(date, point);
    return point;
  };

  for (const row of metricRows) {
    const date = dateOnly(row.metric_date);
    if (!date) continue;
    const current = inPeriod(date, period.start, period.end);
    const previous = inPeriod(date, period.previousStart, period.previousEnd);
    if (!current && !previous) continue;

    const source = sourceMap.get(row.source_key);
    const channel = metricChannel(row, source);
    const existing = channelMap.get(channel.key) ?? {
      label: channel.label,
      values: emptyChannel(row.source_key, source?.source_type ?? "other"),
    };
    const value = finiteNumber(row.value);
    addMetric(existing.values, row.metric_key, value, current);
    existing.values.latestMetricAt =
      isoDate(row.source_updated_at) ?? isoDate(row.updated_at) ?? existing.values.latestMetricAt;
    channelMap.set(channel.key, existing);

    if (current) {
      const daily = ensureDaily(date);
      if (
        REVENUE_METRICS.has(row.metric_key) &&
        source?.source_type !== "paid_media"
      ) {
        daily.revenue += value;
      }
      if (SPEND_METRICS.has(row.metric_key)) daily.adSpend += value;
      if (ORDER_METRICS.has(row.metric_key)) daily.orders += value;
      if (UNIT_METRICS.has(row.metric_key)) daily.unitsSold += value;
    }
  }

  const channels: ChannelPerformanceRow[] = Array.from(channelMap.values())
    .map(({ label, values }) => {
      const kind = sourceTypeToKind(values.sourceType);
      const displayedRevenue =
        kind === "paid-media" && values.revenue === 0
          ? values.attributedRevenue
          : values.revenue;
      const previousDisplayedRevenue =
        kind === "paid-media" && values.previousRevenue === 0
          ? values.previousAttributedRevenue
          : values.previousRevenue;
      const comparisonCurrent = kind === "paid-media" ? values.spend : displayedRevenue;
      const comparisonPrevious =
        kind === "paid-media" ? values.previousSpend : previousDisplayedRevenue;
      return {
        channel: label,
        kind,
        revenue: displayedRevenue,
        previousRevenue: previousDisplayedRevenue,
        spend: values.spend,
        previousSpend: values.previousSpend,
        orders: values.orders,
        previousOrders: values.previousOrders,
        conversions: values.conversions,
        previousConversions: values.previousConversions,
        roas: safeDivide(
          values.attributedRevenue || displayedRevenue,
          values.spend,
        ),
        changePercent: percentChange(comparisonCurrent, comparisonPrevious),
        latestMetricAt: values.latestMetricAt,
      };
    })
    .filter((row) =>
      [
        row.revenue,
        row.previousRevenue,
        row.spend,
        row.previousSpend,
        row.orders,
        row.conversions,
      ].some((value) => value !== 0),
    )
    .sort((a, b) => b.revenue + b.spend - (a.revenue + a.spend));

  const revenueChannels = channels.filter(
    (channel) => channel.kind !== "paid-media",
  );
  const paidChannels = channels.filter(
    (channel) => channel.kind === "paid-media" || channel.kind === "mixed",
  );
  const sum = <K extends keyof ChannelPerformanceRow>(
    rows: ChannelPerformanceRow[],
    key: K,
  ) => rows.reduce((total, row) => total + finiteNumber(row[key]), 0);

  const currentRevenue = sum(revenueChannels, "revenue");
  const previousRevenue = sum(revenueChannels, "previousRevenue");
  const currentOrders = sum(revenueChannels, "orders");
  const previousOrders = sum(revenueChannels, "previousOrders");
  const currentSpend = sum(paidChannels, "spend");
  const previousSpend = sum(paidChannels, "previousSpend");

  const inventoryByLogicalProduct = new Map<string, RawInventory[]>();
  for (const row of inventoryRows) {
    const key = logicalProductKey(row.product_name || row.product_key);
    const group = inventoryByLogicalProduct.get(key) ?? [];
    group.push(row);
    inventoryByLogicalProduct.set(key, group);
  }

  const productMap = new Map<
    string,
    {
      name: string;
      sourceKey: string;
      current: number;
      previous: number;
    }
  >();

  for (const row of productRows) {
    const date = dateOnly(row.metric_date);
    if (!date) continue;
    const key = `${row.source_key}:${row.product_key}`;
    const existing = productMap.get(key) ?? {
      name: row.product_name || row.product_key,
      sourceKey: row.source_key,
      current: 0,
      previous: 0,
    };
    if (inPeriod(date, period.start, period.end)) {
      existing.current += finiteNumber(row.units_sold);
      ensureDaily(date).unitsSold += finiteNumber(row.units_sold);
    } else if (inPeriod(date, period.previousStart, period.previousEnd)) {
      existing.previous += finiteNumber(row.units_sold);
    }
    productMap.set(key, existing);
  }

  const days = rangeToDays(range);
  const products: ProductPerformanceRow[] = Array.from(productMap.entries())
    .map(([key, values]) => {
      const logicalKey = logicalProductKey(values.name);
      const inventoryRowsForProduct = inventoryByLogicalProduct.get(logicalKey) ?? [];
      const bySource = new Map<string, RawInventory[]>();
      for (const inventoryRow of inventoryRowsForProduct) {
        const rows = bySource.get(inventoryRow.source_key) ?? [];
        rows.push(inventoryRow);
        bySource.set(inventoryRow.source_key, rows);
      }

      const inventoryBySource = Array.from(bySource.entries()).map(([sourceKey, rows]) => ({
        sourceKey,
        available: sumNullable(rows.map((row) => nullableFiniteNumber(row.available))),
        onHand: sumNullable(rows.map((row) => nullableFiniteNumber(row.on_hand))),
        committed: sumNullable(rows.map((row) => nullableFiniteNumber(row.committed))),
        incoming: sumNullable(rows.map((row) => nullableFiniteNumber(row.incoming))),
        capturedAt:
          rows
            .map((row) => isoDate(row.captured_at))
            .filter((value): value is string => Boolean(value))
            .sort()
            .at(-1) ?? null,
      }));

      const availableQuantity = sumNullable(inventoryBySource.map((row) => row.available));
      const inventorySnapshotAt =
        inventoryBySource
          .map((row) => row.capturedAt)
          .filter((value): value is string => Boolean(value))
          .sort()
          .at(-1) ?? null;
      const averageDailyUnits = values.current > 0 ? values.current / days : 0;
      const daysOfCover = safeDivide(availableQuantity, averageDailyUnits);
      return {
        productId: key,
        productName: values.name,
        unitsSold: values.current,
        previousUnitsSold: values.previous,
        changePercent: percentChange(values.current, values.previous),
        availableQuantity,
        inventorySnapshotAt,
        inventoryBySource,
        averageDailyUnits,
        daysOfCover,
        inventoryStatus: inventoryStatus(
          availableQuantity,
          daysOfCover,
          averageDailyUnits,
        ),
      };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold);

  const metricUnits = metricRows
    .filter(
      (row) =>
        UNIT_METRICS.has(row.metric_key) &&
        inPeriod(String(row.metric_date), period.start, period.end),
    )
    .reduce((total, row) => total + finiteNumber(row.value), 0);
  const previousMetricUnits = metricRows
    .filter(
      (row) =>
        UNIT_METRICS.has(row.metric_key) &&
        inPeriod(String(row.metric_date), period.previousStart, period.previousEnd),
    )
    .reduce((total, row) => total + finiteNumber(row.value), 0);
  const productUnits = products.reduce((total, product) => total + product.unitsSold, 0);
  const previousProductUnits = products.reduce(
    (total, product) => total + product.previousUnitsSold,
    0,
  );
  const currentUnits = metricUnits || productUnits;
  const previousUnits = previousMetricUnits || previousProductUnits;

  const warnings: string[] = [];
  if (metricRows.length === 0) {
    warnings.push(
      "The BRHT database is connected, but no normalized daily metrics have been ingested yet.",
    );
  }
  if (sourceRows.length === 0) {
    warnings.push("No data sources are configured for this organization.");
  }

  return {
    source: "supabase",
    connection: "connected",
    generatedAt: new Date().toISOString(),
    range,
    rangeDays: days,
    organization: {
      slug: organization.slug,
      name: organization.name,
      timezone: organization.timezone,
      currency: organization.currency,
    },
    dashboard: {
      key: bundle.dashboard?.dashboard_key ?? "executive",
      title: bundle.dashboard?.title ?? `${organization.name} Business Dashboard`,
      description: bundle.dashboard?.description ?? null,
    },
    period,
    summary: {
      revenue: metric(currentRevenue, previousRevenue),
      orders: metric(currentOrders, previousOrders),
      adSpend: metric(currentSpend, previousSpend),
      blendedRoas: metric(
        safeDivide(currentRevenue, currentSpend),
        safeDivide(previousRevenue, previousSpend),
      ),
      averageOrderValue: metric(
        safeDivide(currentRevenue, currentOrders),
        safeDivide(previousRevenue, previousOrders),
      ),
      unitsSold: metric(currentUnits, previousUnits),
    },
    trend: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    channels,
    products,
    kickstarter,
    dataHealth: sourceRows.map(toHealth),
    capabilities: [
      { name: "Supabase database", available: true, required: true },
      { name: "Secure ingest API", available: true, required: true },
      { name: "Daily metrics", available: true, required: true },
      { name: "Products & inventory", available: true, required: false },
      { name: "Source health", available: true, required: false },
    ],
    warnings,
    error: null,
  };
}

export async function getOrganizationDashboardData(
  organizationSlug: string,
  range: DashboardRange,
): Promise<DashboardData> {
  if (!isSupabaseConfigured()) {
    return emptyDashboardData(organizationSlug, range, {
      source: "unconfigured",
      connection: "unconfigured",
      error: "Supabase is not configured for this deployment.",
    });
  }

  try {
    const organizations = (await selectRows("brht_organizations", {
      select: "id,slug,name,timezone,currency,status",
      slug: `eq.${organizationSlug}`,
      status: "neq.archived",
      limit: "1",
    })) as OrganizationRow[];
    const organization = organizations[0];
    if (!organization) {
      return emptyDashboardData(organizationSlug, range, {
        source: "supabase",
        connection: "not-found",
        error: `No BRHT organization exists for “${organizationSlug}”.`,
      });
    }

    const period = periodFor(range, organization.timezone || "UTC");
    const bundle = await rpc<DashboardBundle | null>("brht_dashboard_bundle", {
      p_organization_slug: organizationSlug,
      p_start_date: period.start,
      p_end_date: period.end,
      p_previous_start_date: period.previousStart,
      p_previous_end_date: period.previousEnd,
    });

    if (!bundle) {
      return emptyDashboardData(organizationSlug, range, {
        source: "supabase",
        connection: "not-found",
        error: `No dashboard bundle exists for “${organizationSlug}”.`,
      });
    }

    const kickstarterMetrics = (await selectRows("brht_metric_daily", {
      select: "metric_date,source_key,metric_key,dimension_key,dimensions,value,unit,source_updated_at,updated_at",
      organization_id: `eq.${organization.id}`,
      source_key: "eq.kickstarter",
      order: "metric_date.asc",
      limit: "5000",
    })) as RawMetric[];
    bundle.kickstarterMetrics = kickstarterMetrics;

    return buildDashboard(organization, bundle, range, period);
  } catch (error) {
    console.error("BRHT Supabase dashboard load failed", error);
    return emptyDashboardData(organizationSlug, range, {
      source: "supabase",
      connection: "unreachable",
      error:
        error instanceof Error
          ? error.message
          : "The BRHT data platform could not be reached.",
    });
  }
}

export async function getFableFuryDashboardData(
  range: DashboardRange,
): Promise<DashboardData> {
  return getOrganizationDashboardData("fable-fury", range);
}
