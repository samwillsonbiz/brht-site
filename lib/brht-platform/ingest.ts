import { createHash, timingSafeEqual } from "node:crypto";
import {
  selectRows,
  updateRows,
  upsertRows,
} from "@/lib/supabaseRest";

type JsonObject = Record<string, unknown>;

type OrganizationRow = {
  id: string;
  slug: string;
  status: string;
};

type IngestKeyRow = {
  id: string;
  key_hash: string;
  is_active: boolean;
  expires_at: string | null;
};

type SourceRow = {
  id: string;
  organization_id: string;
  source_key: string;
};

export type BrhtIngestResult = {
  organization: string;
  source: string;
  runKey: string;
  metrics: number;
  products: number;
  inventory: number;
  records: number;
  rowsWritten: number;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEY_RE = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;
const METRIC_RE = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ROWS_PER_TYPE = 5_000;
const WRITE_CHUNK_SIZE = 500;

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredString(
  value: unknown,
  label: string,
  options: { max?: number; pattern?: RegExp } = {},
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  const result = value.trim();
  if (options.max && result.length > options.max) {
    throw new Error(`${label} must be ${options.max} characters or fewer.`);
  }
  if (options.pattern && !options.pattern.test(result)) {
    throw new Error(`${label} has an invalid format.`);
  }
  return result;
}

function optionalString(
  value: unknown,
  label: string,
  max = 500,
): string | null {
  if (value === null || value === undefined || value === "") return null;
  return requiredString(value, label, { max });
}

function finite(value: unknown, label: string, fallback?: number): number {
  if ((value === null || value === undefined || value === "") && fallback !== undefined) {
    return fallback;
  }
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be a finite number.`);
  return number;
}

function nonNegativeInteger(value: unknown, label: string, fallback = 0): number {
  const number = finite(value, label, fallback);
  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return number;
}

function isoTimestamp(value: unknown, label: string, fallback?: string): string {
  if ((value === null || value === undefined || value === "") && fallback) return fallback;
  const raw = requiredString(value, label, { max: 80 });
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${label} must be an ISO timestamp.`);
  return parsed.toISOString();
}

function dateValue(value: unknown, label: string): string {
  const raw = requiredString(value, label, { max: 10 });
  if (!DATE_RE.test(raw) || Number.isNaN(new Date(`${raw}T00:00:00Z`).getTime())) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }
  return raw;
}

function asObject(value: unknown, label: string): JsonObject {
  if (value === null || value === undefined) return {};
  if (!isObject(value)) throw new Error(`${label} must be a JSON object.`);
  return value;
}

function asArray(value: unknown, label: string): unknown[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  if (value.length > MAX_ROWS_PER_TYPE) {
    throw new Error(`${label} cannot contain more than ${MAX_ROWS_PER_TYPE} rows.`);
  }
  return value;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const object = value as JsonObject;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`)
    .join(",")}}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function secureEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]{64}$/.test(a) || !/^[0-9a-f]{64}$/.test(b)) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

async function upsertInChunks(
  table: string,
  rows: JsonObject[],
  onConflict: string,
): Promise<number> {
  let written = 0;
  for (let index = 0; index < rows.length; index += WRITE_CHUNK_SIZE) {
    const chunk = rows.slice(index, index + WRITE_CHUNK_SIZE);
    await upsertRows(table, chunk, onConflict);
    written += chunk.length;
  }
  return written;
}

async function authenticate(
  organizationSlug: string,
  rawKey: string,
): Promise<{ organization: OrganizationRow; key: IngestKeyRow }> {
  const organizations = (await selectRows("brht_organizations", {
    select: "id,slug,status",
    slug: `eq.${organizationSlug}`,
    status: "eq.active",
    limit: "1",
  })) as OrganizationRow[];
  const organization = organizations[0];
  if (!organization) throw new Error("Invalid ingestion credentials.");

  const keyPrefix = rawKey.slice(0, 18);
  const candidates = (await selectRows("brht_ingest_keys", {
    select: "id,key_hash,is_active,expires_at",
    organization_id: `eq.${organization.id}`,
    key_prefix: `eq.${keyPrefix}`,
    is_active: "eq.true",
    limit: "5",
  })) as IngestKeyRow[];
  const presentedHash = sha256(rawKey);
  const key = candidates.find((candidate) => secureEqualHex(candidate.key_hash, presentedHash));
  if (!key) throw new Error("Invalid ingestion credentials.");
  if (key.expires_at && new Date(key.expires_at).getTime() <= Date.now()) {
    throw new Error("Ingestion credentials have expired.");
  }

  return { organization, key };
}

function normalizeMetrics(
  rows: unknown[],
  organizationId: string,
  sourceKey: string,
  now: string,
): JsonObject[] {
  return rows.map((value, index) => {
    if (!isObject(value)) throw new Error(`metrics[${index}] must be an object.`);
    const dimensions = asObject(value.dimensions, `metrics[${index}].dimensions`);
    const dimensionKey =
      optionalString(value.dimensionKey, `metrics[${index}].dimensionKey`, 120) ??
      (Object.keys(dimensions).length ? sha256(canonicalize(dimensions)).slice(0, 24) : "all");
    return {
      organization_id: organizationId,
      metric_date: dateValue(value.date ?? value.metricDate, `metrics[${index}].date`),
      source_key: sourceKey,
      metric_key: requiredString(value.metric ?? value.metricKey, `metrics[${index}].metric`, {
        max: 100,
        pattern: METRIC_RE,
      }),
      dimension_key: dimensionKey,
      dimensions,
      value: finite(value.value, `metrics[${index}].value`),
      unit: optionalString(value.unit, `metrics[${index}].unit`, 30),
      source_updated_at:
        value.sourceUpdatedAt === null || value.sourceUpdatedAt === undefined
          ? null
          : isoTimestamp(value.sourceUpdatedAt, `metrics[${index}].sourceUpdatedAt`),
      ingested_at: now,
    };
  });
}

function normalizeProducts(
  rows: unknown[],
  organizationId: string,
  sourceKey: string,
  now: string,
): JsonObject[] {
  return rows.map((value, index) => {
    if (!isObject(value)) throw new Error(`products[${index}] must be an object.`);
    return {
      organization_id: organizationId,
      metric_date: dateValue(value.date ?? value.metricDate, `products[${index}].date`),
      source_key: sourceKey,
      product_key: requiredString(value.productKey ?? value.id, `products[${index}].productKey`, {
        max: 240,
      }),
      product_name: requiredString(
        value.productName ?? value.name,
        `products[${index}].productName`,
        { max: 500 },
      ),
      sku: optionalString(value.sku, `products[${index}].sku`, 200),
      units_sold: finite(value.unitsSold, `products[${index}].unitsSold`, 0),
      gross_revenue: finite(value.grossRevenue, `products[${index}].grossRevenue`, 0),
      net_revenue: finite(value.netRevenue, `products[${index}].netRevenue`, 0),
      refunds: finite(value.refunds, `products[${index}].refunds`, 0),
      cogs:
        value.cogs === null || value.cogs === undefined
          ? null
          : finite(value.cogs, `products[${index}].cogs`),
      currency: optionalString(value.currency, `products[${index}].currency`, 3),
      metadata: asObject(value.metadata, `products[${index}].metadata`),
      source_updated_at:
        value.sourceUpdatedAt === null || value.sourceUpdatedAt === undefined
          ? null
          : isoTimestamp(value.sourceUpdatedAt, `products[${index}].sourceUpdatedAt`),
      ingested_at: now,
    };
  });
}

function normalizeInventory(
  rows: unknown[],
  organizationId: string,
  sourceKey: string,
  now: string,
): JsonObject[] {
  return rows.map((value, index) => {
    if (!isObject(value)) throw new Error(`inventory[${index}] must be an object.`);
    return {
      organization_id: organizationId,
      source_key: sourceKey,
      product_key: requiredString(value.productKey ?? value.id, `inventory[${index}].productKey`, {
        max: 240,
      }),
      product_name: requiredString(
        value.productName ?? value.name,
        `inventory[${index}].productName`,
        { max: 500 },
      ),
      sku: optionalString(value.sku, `inventory[${index}].sku`, 200),
      captured_at: isoTimestamp(value.capturedAt, `inventory[${index}].capturedAt`, now),
      on_hand:
        value.onHand === null || value.onHand === undefined
          ? null
          : finite(value.onHand, `inventory[${index}].onHand`),
      available:
        value.available === null || value.available === undefined
          ? null
          : finite(value.available, `inventory[${index}].available`),
      committed:
        value.committed === null || value.committed === undefined
          ? null
          : finite(value.committed, `inventory[${index}].committed`),
      incoming:
        value.incoming === null || value.incoming === undefined
          ? null
          : finite(value.incoming, `inventory[${index}].incoming`),
      metadata: asObject(value.metadata, `inventory[${index}].metadata`),
      ingested_at: now,
    };
  });
}

function normalizeRecords(
  rows: unknown[],
  organizationId: string,
  sourceKey: string,
  now: string,
): JsonObject[] {
  return rows.map((value, index) => {
    if (!isObject(value)) throw new Error(`records[${index}] must be an object.`);
    const payload = asObject(value.payload, `records[${index}].payload`);
    const payloadHash = sha256(canonicalize(payload));
    const externalId = optionalString(value.externalId, `records[${index}].externalId`, 500);
    return {
      organization_id: organizationId,
      source_key: sourceKey,
      object_type: requiredString(value.objectType, `records[${index}].objectType`, {
        max: 120,
        pattern: KEY_RE,
      }),
      record_key:
        optionalString(value.recordKey, `records[${index}].recordKey`, 500) ??
        externalId ??
        payloadHash,
      external_id: externalId,
      occurred_at:
        value.occurredAt === null || value.occurredAt === undefined
          ? null
          : isoTimestamp(value.occurredAt, `records[${index}].occurredAt`),
      source_updated_at:
        value.sourceUpdatedAt === null || value.sourceUpdatedAt === undefined
          ? null
          : isoTimestamp(value.sourceUpdatedAt, `records[${index}].sourceUpdatedAt`),
      payload,
      payload_hash: payloadHash,
      ingested_at: now,
    };
  });
}

export async function ingestOrganizationPayload(
  organizationSlug: string,
  rawKey: string,
  payload: unknown,
): Promise<BrhtIngestResult> {
  if (!SLUG_RE.test(organizationSlug)) throw new Error("Invalid organization slug.");
  if (!rawKey || rawKey.length < 32 || rawKey.length > 200) {
    throw new Error("Invalid ingestion credentials.");
  }
  if (!isObject(payload)) throw new Error("Request body must be a JSON object.");

  const { organization, key } = await authenticate(organizationSlug, rawKey);
  const sourceInput = asObject(payload.source, "source");
  const sourceKey = requiredString(sourceInput.key, "source.key", {
    max: 100,
    pattern: KEY_RE,
  });
  const sourceType = requiredString(sourceInput.type, "source.type", {
    max: 100,
    pattern: KEY_RE,
  });
  const displayName = requiredString(
    sourceInput.displayName ?? sourceInput.name,
    "source.displayName",
    { max: 200 },
  );
  const now = new Date().toISOString();

  const sourceRows = (await upsertRows(
    "brht_data_sources",
    [
      {
        organization_id: organization.id,
        source_key: sourceKey,
        source_type: sourceType,
        display_name: displayName,
        status: "active",
        metadata: asObject(sourceInput.metadata, "source.metadata"),
      },
    ],
    "organization_id,source_key",
  )) as SourceRow[];
  const source = sourceRows[0];
  if (!source) throw new Error("The data source could not be created or updated.");

  const metrics = normalizeMetrics(
    asArray(payload.metrics, "metrics"),
    organization.id,
    sourceKey,
    now,
  );
  const products = normalizeProducts(
    asArray(payload.products, "products"),
    organization.id,
    sourceKey,
    now,
  );
  const inventory = normalizeInventory(
    asArray(payload.inventory, "inventory"),
    organization.id,
    sourceKey,
    now,
  );
  const records = normalizeRecords(
    asArray(payload.records, "records"),
    organization.id,
    sourceKey,
    now,
  );

  let rowsWritten = 0;
  rowsWritten += await upsertInChunks(
    "brht_metric_daily",
    metrics,
    "organization_id,metric_date,source_key,metric_key,dimension_key",
  );
  rowsWritten += await upsertInChunks(
    "brht_product_daily",
    products,
    "organization_id,metric_date,source_key,product_key",
  );
  rowsWritten += await upsertInChunks(
    "brht_inventory_snapshots",
    inventory,
    "organization_id,source_key,product_key,captured_at",
  );
  rowsWritten += await upsertInChunks(
    "brht_raw_records",
    records,
    "organization_id,source_key,object_type,record_key",
  );

  const runInput = asObject(payload.run, "run");
  const startedAt = isoTimestamp(runInput.startedAt, "run.startedAt", now);
  const finishedAt = isoTimestamp(runInput.finishedAt, "run.finishedAt", now);
  const runKey =
    optionalString(runInput.key ?? runInput.runKey, "run.key", 240) ??
    `${sourceKey}:${finishedAt}`;
  const requestedStatus = optionalString(runInput.status, "run.status", 20) ?? "success";
  if (!new Set(["running", "success", "partial", "failed"]).has(requestedStatus)) {
    throw new Error("run.status must be running, success, partial, or failed.");
  }

  await upsertRows(
    "brht_sync_runs",
    [
      {
        organization_id: organization.id,
        source_id: source.id,
        source_key: sourceKey,
        run_key: runKey,
        status: requestedStatus,
        started_at: startedAt,
        finished_at: requestedStatus === "running" ? null : finishedAt,
        rows_read: nonNegativeInteger(
          runInput.rowsRead,
          "run.rowsRead",
          metrics.length + products.length + inventory.length + records.length,
        ),
        rows_written: nonNegativeInteger(runInput.rowsWritten, "run.rowsWritten", rowsWritten),
        rows_failed: nonNegativeInteger(runInput.rowsFailed, "run.rowsFailed", 0),
        cursor_state: asObject(runInput.cursor, "run.cursor"),
        error_message: optionalString(runInput.error, "run.error", 4_000),
        metadata: asObject(runInput.metadata, "run.metadata"),
      },
    ],
    "organization_id,source_key,run_key",
  );

  await Promise.all([
    updateRows(
      "brht_data_sources",
      { last_synced_at: finishedAt, status: requestedStatus === "failed" ? "error" : "active" },
      { id: `eq.${source.id}` },
    ),
    updateRows("brht_ingest_keys", { last_used_at: now }, { id: `eq.${key.id}` }),
  ]);

  return {
    organization: organization.slug,
    source: sourceKey,
    runKey,
    metrics: metrics.length,
    products: products.length,
    inventory: inventory.length,
    records: records.length,
    rowsWritten,
  };
}
