import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { rpc } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

type CreatedOrganization = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  dashboardKey: string;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SOURCE_KEY_RE = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;
const CURRENCY_RE = /^[A-Z]{3}$/;

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

function safeTokenEqual(presented: string, expected: string): boolean {
  const left = createHash("sha256").update(presented).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

function authorize(request: NextRequest): boolean {
  const expected = process.env.BRHT_PLATFORM_ADMIN_TOKEN?.trim();
  if (!expected) return false;
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const presented = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : request.headers.get("x-brht-admin-token")?.trim() ?? "";
  return Boolean(presented) && safeTokenEqual(presented, expected);
}

function normalizeSources(value: unknown) {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("sources must be an array.");
  if (value.length > 30) throw new Error("sources cannot contain more than 30 entries.");
  return value.map((entry, index) => {
    if (!isObject(entry)) throw new Error(`sources[${index}] must be an object.`);
    return {
      key: requiredString(entry.key, `sources[${index}].key`, {
        max: 100,
        pattern: SOURCE_KEY_RE,
      }),
      type: requiredString(entry.type, `sources[${index}].type`, {
        max: 100,
        pattern: SOURCE_KEY_RE,
      }),
      displayName: requiredString(
        entry.displayName ?? entry.name ?? entry.key,
        `sources[${index}].displayName`,
        { max: 200 },
      ),
      metadata: isObject(entry.metadata) ? entry.metadata : {},
    };
  });
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const body: unknown = await request.json();
    if (!isObject(body)) throw new Error("Request body must be a JSON object.");

    const slug = requiredString(body.slug, "slug", { max: 100, pattern: SLUG_RE });
    const name = requiredString(body.name, "name", { max: 240 });
    const timezone = requiredString(body.timezone ?? "UTC", "timezone", { max: 100 });
    const currency = requiredString(body.currency ?? "USD", "currency", {
      max: 3,
      pattern: CURRENCY_RE,
    });
    const sources = normalizeSources(body.sources);
    const dashboardInput = isObject(body.dashboard) ? body.dashboard : {};
    const dashboard = {
      key: requiredString(dashboardInput.key ?? "executive", "dashboard.key", {
        max: 100,
        pattern: SOURCE_KEY_RE,
      }),
      title: requiredString(
        dashboardInput.title ?? `${name} Business Dashboard`,
        "dashboard.title",
        { max: 240 },
      ),
      description:
        typeof dashboardInput.description === "string"
          ? dashboardInput.description.trim().slice(0, 1_000)
          : null,
      config: isObject(dashboardInput.config) ? dashboardInput.config : {},
    };

    const rawIngestKey = `brht_live_${randomBytes(36).toString("base64url")}`;
    const keyHash = createHash("sha256").update(rawIngestKey).digest("hex");
    const keyPrefix = rawIngestKey.slice(0, 18);

    const organization = await rpc<CreatedOrganization>("brht_create_organization", {
      p_slug: slug,
      p_name: name,
      p_timezone: timezone,
      p_currency: currency,
      p_key_name: "Primary ingestion",
      p_key_prefix: keyPrefix,
      p_key_hash: keyHash,
      p_sources: sources,
      p_dashboard: dashboard,
    });

    const origin = request.nextUrl.origin;
    return NextResponse.json(
      {
        ok: true,
        organization,
        dashboardUrl: `${origin}/dashboards/${slug}`,
        ingest: {
          url: `${origin}/api/brht/ingest/${slug}`,
          header: "x-brht-ingest-key",
          key: rawIngestKey,
          warning: "This raw key is returned only once. Store it in the business's n8n credential vault.",
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Organization creation failed.";
    const duplicate = /duplicate key|already exists|unique constraint/i.test(message);
    const validation =
      !duplicate &&
      (message.includes("required") ||
        message.includes("must") ||
        message.includes("invalid format") ||
        message.includes("cannot contain"));
    if (!duplicate && !validation) console.error("BRHT organization creation failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: duplicate
          ? "An organization with that slug or ingestion-key name already exists."
          : message,
      },
      {
        status: duplicate ? 409 : validation ? 400 : 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  }
}
