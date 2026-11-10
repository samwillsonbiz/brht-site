import { Pool, type PoolClient, type PoolConfig } from "pg";
import {
  emptyDashboardData,
  rangeToDays,
  type ChannelPerformanceRow,
  type DashboardData,
  type DashboardRange,
  type DataSourceHealth,
  type DailyPerformancePoint,
  type ProductPerformanceRow,
  type TableCapability,
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

const CAPABILITIES = [
  { name: "daily_channel_metrics", required: true },
  { name: "shopify_product_daily", required: false },
  { name: "inventory_snapshots", required: false },
  { name: "products", required: false },
  { name: "sync_runs", required: false },
  { name: "dashboard_daily_summary", required: false },
] as const;

const COMMERCE_CHANNELS = new Set([
  "shopify",
  "amazon",
  "backerkit",
  "kickstarter",
  "retail",
  "wholesale",
  "direct",
]);

const PAID_MEDIA_CHANNELS = new Set([
  "meta",
  "facebook",
  "instagram",
  "google",
  "google ads",
  "google_ads",
  "tiktok",
  "pinterest",
  "bing",
  "microsoft ads",
  "microsoft_ads",
]);

type ChannelMetricRow = {
  date: unknown;
  channel: unknown;
  orders: unknown;
  revenue: unknown;
  spend: unknown;
  conversions: unknown;
  updated_at: unknown;
};

type PeriodBoundsRow = {
  start_date: unknown;
  end_date: unknown;
  previous_start: unknown;
  previous_end: unknown;
};

type ProductDailyRow = {
  date: unknown;
  product_id: unknown;
  product_name: unknown;
  units_sold: unknown;
};

type InventoryRow = {
  product_id: unknown;
  product_name: unknown;
  available_quantity: unknown;
  snapshot_at: unknown;
};

type SyncRunRow = {
  source: unknown;
  status: unknown;
  message: unknown;
  started_at: unknown;
  finished_at: unknown;
};

type LatestChannelRow = {
  source: unknown;
  latest_metric_date: unknown;
  latest_metric_at: unknown;
};

declare global {
  var __brhtDashboardPool: Pool | undefined;
}

function databaseConfig(): PoolConfig | null {
  const connectionString = process.env.BRHT_DATABASE_URL?.trim();
  if (!connectionString) return null;

  const sslMode = process.env.BRHT_DATABASE_SSL?.trim().toLowerCase();
  const ssl =
    sslMode === "require"
      ? { rejectUnauthorized: false }
      : sslMode === "verify-full"
        ? {
            rejectUnauthorized: true,
            ...(process.env.BRHT_DATABASE_CA
              ? { ca: process.env.BRHT_DATABASE_CA.replace(/\\n/g, "\n") }
              : {}),
          }
        : false;

  return {
    connectionString,
    ssl,
    max: 3,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 8_000,
    statement_timeout: 12_000,
    application_name: "brht-ai-dashboard",
  };
}

function pool(): Pool | null {
  const config = databaseConfig();
  if (!config) return null;
  if (!globalThis.__brhtDashboardPool) {
    globalThis.__brhtDashboardPool = new Pool(config);
  }
  return globalThis.__brhtDashboardPool;
}

function classifyChannel(
  channel: string,
  values: { revenue: number; spend: number; orders: number },
): ChannelPerformanceRow["kind"] {
  const normalized = channel.toLowerCase().trim();
  if (COMMERCE_CHANNELS.has(normalized) && values.spend > 0) return "mixed";
  if (COMMERCE_CHANNELS.has(normalized)) return "commerce";
  if (PAID_MEDIA_CHANNELS.has(normalized)) return "paid-media";
  if (values.revenue > 0 && values.spend > 0) return "mixed";
  if (values.revenue > 0 || values.orders > 0) return "commerce";
  if (values.spend > 0) return "paid-media";
  return "other";
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isCurrentPeriod(date: string, bounds: DashboardData["period"]): boolean {
  return date >= bounds.start && date <= bounds.end;
}

function isPreviousPeriod(date: string, bounds: DashboardData["period"]): boolean {
  return date >= bounds.previousStart && date <= bounds.previousEnd;
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

async function discoverCapabilities(client: PoolClient): Promise<TableCapability[]> {
  const names = CAPABILITIES.map((capability) => capability.name);
  const result = await client.query<{ name: string; available: boolean }>(
    `
      SELECT requested.name,
             to_regclass('public.' || requested.name) IS NOT NULL AS available
      FROM unnest($1::text[]) AS requested(name)
    `,
    [names],
  );
  const availability = new Map(result.rows.map((row) => [row.name, row.available]));
  return CAPABILITIES.map((capability) => ({
    ...capability,
    available: availability.get(capability.name) ?? false,
  }));
}

async function loadFromPostgres(range: DashboardRange): Promise<DashboardData> {
  const activePool = pool();
  if (!activePool) return emptyDashboardData(range);

  const days = rangeToDays(range);
  let client: PoolClient | null = null;
  try {
    client = await activePool.connect();
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout = '12000ms'");

    const capabilities = await discoverCapabilities(client);
    const available = new Set(
      capabilities.filter((capability) => capability.available).map((capability) => capability.name),
    );

    if (!available.has("daily_channel_metrics")) {
      await client.query("COMMIT");
      return {
        ...emptyDashboardData(range, {
          source: "postgres",
          connection: "incomplete",
          error: "The database is reachable, but daily_channel_metrics is not available.",
        }),
        capabilities,
      };
    }

    const boundsResult = await client.query<PeriodBoundsRow>(
      `
        SELECT
          (CURRENT_DATE - ($1::int - 1))::text AS start_date,
          CURRENT_DATE::text AS end_date,
          (CURRENT_DATE - (($1::int * 2) - 1))::text AS previous_start,
          (CURRENT_DATE - $1::int)::text AS previous_end
      `,
      [days],
    );
    const boundsRow = boundsResult.rows[0];
    const period: DashboardData["period"] = {
      start: String(boundsRow.start_date),
      end: String(boundsRow.end_date),
      previousStart: String(boundsRow.previous_start),
      previousEnd: String(boundsRow.previous_end),
    };

    const channelResult = await client.query<ChannelMetricRow>(
      `
        SELECT
          date::text AS date,
          lower(trim(channel)) AS channel,
          COALESCE(SUM(orders), 0)::numeric AS orders,
          COALESCE(SUM(revenue), 0)::numeric AS revenue,
          COALESCE(SUM(spend), 0)::numeric AS spend,
          COALESCE(SUM(conversions), 0)::numeric AS conversions,
          MAX(updated_at) AS updated_at
        FROM daily_channel_metrics
        WHERE date BETWEEN $1::date AND $2::date
        GROUP BY date, lower(trim(channel))
        ORDER BY date ASC, channel ASC
      `,
      [period.previousStart, period.end],
    );

    const channelMap = new Map<
      string,
      Omit<ChannelPerformanceRow, "channel" | "kind" | "roas" | "changePercent">
    >();
    const dailyMap = new Map<string, DailyPerformancePoint>();

    const ensureDaily = (date: string) => {
      const existing = dailyMap.get(date);
      if (existing) return existing;
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

    for (const raw of channelResult.rows) {
      const date = dateOnly(raw.date);
      const channel = String(raw.channel ?? "unknown").trim() || "unknown";
      if (!date) continue;
      const values = {
        revenue: finiteNumber(raw.revenue),
        spend: finiteNumber(raw.spend),
        orders: finiteNumber(raw.orders),
        conversions: finiteNumber(raw.conversions),
      };
      const kind = classifyChannel(channel, values);
      const aggregate = channelMap.get(channel) ?? {
        revenue: 0,
        previousRevenue: 0,
        spend: 0,
        previousSpend: 0,
        orders: 0,
        previousOrders: 0,
        conversions: 0,
        previousConversions: 0,
        latestMetricAt: null,
      };

      if (isCurrentPeriod(date, period)) {
        aggregate.revenue += values.revenue;
        aggregate.spend += values.spend;
        aggregate.orders += values.orders;
        aggregate.conversions += values.conversions;
        aggregate.latestMetricAt = isoDate(raw.updated_at) ?? aggregate.latestMetricAt;

        const daily = ensureDaily(date);
        if (kind === "commerce" || kind === "mixed") {
          daily.revenue += values.revenue;
          daily.orders += values.orders;
        }
        if (kind === "paid-media" || kind === "mixed") {
          daily.adSpend += values.spend;
        }
      } else if (isPreviousPeriod(date, period)) {
        aggregate.previousRevenue += values.revenue;
        aggregate.previousSpend += values.spend;
        aggregate.previousOrders += values.orders;
        aggregate.previousConversions += values.conversions;
      }
      channelMap.set(channel, aggregate);
    }

    const channels: ChannelPerformanceRow[] = Array.from(channelMap.entries())
      .map(([channel, values]) => {
        const kind = classifyChannel(channel, values);
        return {
          channel: titleCase(channel),
          kind,
          ...values,
          roas: safeDivide(values.revenue, values.spend),
          changePercent: percentChange(
            kind === "paid-media" ? values.spend : values.revenue,
            kind === "paid-media" ? values.previousSpend : values.previousRevenue,
          ),
        };
      })
      .filter((row) =>
        [row.revenue, row.spend, row.orders, row.conversions, row.previousRevenue, row.previousSpend].some(
          (value) => value !== 0,
        ),
      )
      .sort((a, b) => b.revenue + b.spend - (a.revenue + a.spend));

    const salesChannels = channels.filter(
      (channel) => channel.kind === "commerce" || channel.kind === "mixed",
    );
    const paidChannels = channels.filter(
      (channel) => channel.kind === "paid-media" || channel.kind === "mixed",
    );

    const sum = <K extends keyof ChannelPerformanceRow>(rows: ChannelPerformanceRow[], key: K) =>
      rows.reduce((total, row) => total + finiteNumber(row[key]), 0);

    const currentRevenue = sum(salesChannels, "revenue");
    const previousRevenue = sum(salesChannels, "previousRevenue");
    const currentOrders = sum(salesChannels, "orders");
    const previousOrders = sum(salesChannels, "previousOrders");
    const currentSpend = sum(paidChannels, "spend");
    const previousSpend = sum(paidChannels, "previousSpend");

    const runtimeWarnings: string[] = [];
    let products: ProductPerformanceRow[] = [];
    if (available.has("shopify_product_daily")) {
      try {
        const productResult = await client.query<ProductDailyRow>(
          `
            SELECT
              date::text AS date,
              product_id::text AS product_id,
              MAX(NULLIF(trim(product_name), '')) AS product_name,
              COALESCE(SUM(units_sold), 0)::numeric AS units_sold
            FROM shopify_product_daily
            WHERE date BETWEEN $1::date AND $2::date
            GROUP BY date, product_id::text
            ORDER BY date ASC
          `,
          [period.previousStart, period.end],
        );

        const inventoryByProduct = new Map<string, InventoryRow>();
        if (available.has("inventory_snapshots")) {
          const inventoryResult = await client.query<InventoryRow>(
            `
              SELECT DISTINCT ON (product_id::text)
                product_id::text AS product_id,
                NULLIF(trim(product_name), '') AS product_name,
                available_quantity,
                snapshot_at
              FROM inventory_snapshots
              ORDER BY product_id::text, snapshot_at DESC
            `,
          );
          for (const row of inventoryResult.rows) {
            inventoryByProduct.set(String(row.product_id), row);
          }
        }

        const productMap = new Map<
          string,
          { name: string; current: number; previous: number }
        >();
        for (const row of productResult.rows) {
          const productId = String(row.product_id);
          const date = dateOnly(row.date);
          if (!date) continue;
          const existing = productMap.get(productId) ?? {
            name: String(row.product_name ?? productId),
            current: 0,
            previous: 0,
          };
          if (row.product_name) existing.name = String(row.product_name);
          if (isCurrentPeriod(date, period)) {
            existing.current += finiteNumber(row.units_sold);
            ensureDaily(date).unitsSold += finiteNumber(row.units_sold);
          } else if (isPreviousPeriod(date, period)) {
            existing.previous += finiteNumber(row.units_sold);
          }
          productMap.set(productId, existing);
        }

        products = Array.from(productMap.entries())
          .map(([productId, values]) => {
            const inventory = inventoryByProduct.get(productId);
            const availableQuantity = nullableFiniteNumber(inventory?.available_quantity);
            const averageDailyUnits = values.current > 0 ? values.current / days : 0;
            const daysOfCover = safeDivide(availableQuantity, averageDailyUnits);
            return {
              productId,
              productName:
                String(inventory?.product_name ?? values.name ?? productId).trim() || productId,
              unitsSold: values.current,
              previousUnitsSold: values.previous,
              changePercent: percentChange(values.current, values.previous),
              availableQuantity,
              inventorySnapshotAt: isoDate(inventory?.snapshot_at),
              averageDailyUnits,
              daysOfCover,
              inventoryStatus: inventoryStatus(
                availableQuantity,
                daysOfCover,
                averageDailyUnits,
              ),
            } satisfies ProductPerformanceRow;
          })
          .sort((a, b) => b.unitsSold - a.unitsSold);
      } catch (error) {
        console.error("BRHT dashboard product query failed", error);
        runtimeWarnings.push("Product or inventory rows could not be read from the current schema.");
      }
    }

    const latestChannelsResult = await client.query<LatestChannelRow>(
      `
        SELECT
          lower(trim(channel)) AS source,
          MAX(date)::text AS latest_metric_date,
          MAX(updated_at) AS latest_metric_at
        FROM daily_channel_metrics
        GROUP BY lower(trim(channel))
      `,
    );

    const syncBySource = new Map<string, SyncRunRow>();
    if (available.has("sync_runs")) {
      try {
        const syncResult = await client.query<SyncRunRow>(
          `
            SELECT DISTINCT ON (lower(trim(source)))
              lower(trim(source)) AS source,
              status,
              message,
              started_at,
              finished_at
            FROM sync_runs
            ORDER BY lower(trim(source)), COALESCE(finished_at, started_at) DESC NULLS LAST
          `,
        );
        for (const row of syncResult.rows) {
          syncBySource.set(String(row.source), row);
        }
      } catch (error) {
        console.error("BRHT dashboard sync query failed", error);
        runtimeWarnings.push("Ingestion history could not be read from sync_runs.");
      }
    }

    const healthSources = new Set<string>([
      ...latestChannelsResult.rows.map((row) => String(row.source)),
      ...syncBySource.keys(),
    ]);
    const latestBySource = new Map(
      latestChannelsResult.rows.map((row) => [String(row.source), row]),
    );
    const now = Date.now();
    const dataHealth: DataSourceHealth[] = Array.from(healthSources)
      .map((source) => {
        const latest = latestBySource.get(source);
        const sync = syncBySource.get(source);
        const latestMetricAt = isoDate(latest?.latest_metric_at);
        const finishedAt = isoDate(sync?.finished_at);
        const reference = latestMetricAt ?? finishedAt;
        const lagHours = reference
          ? Math.max(0, (now - new Date(reference).getTime()) / 3_600_000)
          : null;
        const rawStatus = String(sync?.status ?? "").toLowerCase();
        const failed = ["failed", "error", "failure"].some((status) =>
          rawStatus.includes(status),
        );
        const status: DataSourceHealth["status"] = failed
          ? "failed"
          : lagHours === null
            ? "unknown"
            : lagHours > 30
              ? "delayed"
              : "healthy";
        return {
          source: titleCase(source),
          status,
          message: sync?.message ? String(sync.message) : null,
          lastStartedAt: isoDate(sync?.started_at),
          lastFinishedAt: finishedAt,
          latestMetricDate: dateOnly(latest?.latest_metric_date),
          latestMetricAt,
          lagHours,
        };
      })
      .sort((a, b) => a.source.localeCompare(b.source));

    const currentUnits = products.reduce((total, product) => total + product.unitsSold, 0);
    const previousUnits = products.reduce(
      (total, product) => total + product.previousUnitsSold,
      0,
    );

    const warnings: string[] = [...runtimeWarnings];
    if (!available.has("shopify_product_daily")) {
      warnings.push("Product sales are unavailable because shopify_product_daily is missing.");
    }
    if (!available.has("inventory_snapshots")) {
      warnings.push("Inventory cover is unavailable because inventory_snapshots is missing.");
    }
    if (!available.has("sync_runs")) {
      warnings.push("Ingestion run history is unavailable because sync_runs is missing.");
    }

    await client.query("COMMIT");

    return {
      source: "postgres",
      connection: "connected",
      generatedAt: new Date().toISOString(),
      range,
      rangeDays: days,
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
      trend: Array.from(dailyMap.values())
        .filter((point) => isCurrentPeriod(point.date, period))
        .sort((a, b) => a.date.localeCompare(b.date)),
      channels,
      products,
      dataHealth,
      capabilities,
      warnings,
      error: null,
    };
  } catch (error) {
    try {
      if (client) await client.query("ROLLBACK");
    } catch {
      // Ignore rollback failures; the original error is the useful one.
    }
    console.error("BRHT dashboard database load failed", error);
    return emptyDashboardData(range, {
      source: "postgres",
      connection: "unreachable",
      error: "The dashboard could not reach the PostgreSQL reporting database.",
    });
  } finally {
    client?.release();
  }
}

function isDashboardData(value: unknown): value is DashboardData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DashboardData>;
  return (
    typeof candidate.generatedAt === "string" &&
    Array.isArray(candidate.trend) &&
    Array.isArray(candidate.channels) &&
    Array.isArray(candidate.products) &&
    Array.isArray(candidate.dataHealth) &&
    Array.isArray(candidate.capabilities) &&
    Boolean(candidate.summary) &&
    Boolean(candidate.period)
  );
}

async function loadFromApi(range: DashboardRange): Promise<DashboardData> {
  const baseUrl = process.env.BRHT_ANALYTICS_API_URL?.trim().replace(/\/$/, "");
  if (!baseUrl) return emptyDashboardData(range);

  try {
    const response = await fetch(
      `${baseUrl}/v1/fable-fury/dashboard?range=${encodeURIComponent(range)}`,
      {
        headers: {
          Accept: "application/json",
          ...(process.env.BRHT_ANALYTICS_API_TOKEN
            ? { Authorization: `Bearer ${process.env.BRHT_ANALYTICS_API_TOKEN}` }
            : {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      },
    );
    if (!response.ok) throw new Error(`Analytics API returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!isDashboardData(payload)) throw new Error("Analytics API contract mismatch");
    return { ...payload, source: "api", range };
  } catch (error) {
    console.error("BRHT dashboard API load failed", error);
    return emptyDashboardData(range, {
      source: "api",
      connection: "unreachable",
      error: "The dashboard could not reach the analytics API.",
    });
  }
}

export function dashboardSource(): "postgres" | "api" | "unconfigured" {
  if (process.env.BRHT_DATABASE_URL?.trim()) return "postgres";
  if (process.env.BRHT_ANALYTICS_API_URL?.trim()) return "api";
  return "unconfigured";
}

export async function getFableFuryDashboardData(
  range: DashboardRange,
): Promise<DashboardData> {
  const source = dashboardSource();
  if (source === "postgres") return loadFromPostgres(range);
  if (source === "api") return loadFromApi(range);
  return emptyDashboardData(range, {
    source: "unconfigured",
    connection: "unconfigured",
    warnings: [
      "Add BRHT_DATABASE_URL or BRHT_ANALYTICS_API_URL to connect the existing reporting warehouse.",
    ],
  });
}
