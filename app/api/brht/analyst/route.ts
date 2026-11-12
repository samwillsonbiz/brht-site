import { NextResponse } from "next/server";
import { getOrganizationDashboardData } from "@/lib/brht-dashboard/data";
import {
  convertDashboardCurrency,
  getUsdToAudRate,
  normalizeDisplayCurrency,
} from "@/lib/brht-dashboard/currency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;

function checkRateLimit(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const bucket = requestBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    requestBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= RATE_LIMIT) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AnalystRequest = {
  organization?: string;
  range?: string;
  start?: string | null;
  end?: string | null;
  currency?: string;
  messages?: ChatMessage[];
};

function safeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ChatMessage =>
        Boolean(item) &&
        typeof item === "object" &&
        (item as ChatMessage).role !== undefined &&
        ["user", "assistant"].includes((item as ChatMessage).role) &&
        typeof (item as ChatMessage).content === "string",
    )
    .slice(-12)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 5000),
    }));
}

function compactDashboard(data: Awaited<ReturnType<typeof getOrganizationDashboardData>>) {
  return {
    currency: data.organization.currency,
    period: data.period,
    summary: {
      revenue: data.summary.revenue.value,
      orders: data.summary.orders.value,
      adSpend: data.summary.adSpend.value,
      blendedRoas: data.summary.blendedRoas.value,
      averageOrderValue: data.summary.averageOrderValue.value,
      unitsSold: data.summary.unitsSold.value,
    },
    channels: data.channels.map((channel) => ({
      channel: channel.channel,
      kind: channel.kind,
      revenue: channel.revenue,
      spend: channel.spend,
      orders: channel.orders,
      roas: channel.roas,
    })),
    products: data.products.map((product) => ({
      product: product.productName,
      unitsSold: product.unitsSold,
      available: product.availableQuantity,
      averageDailyUnits: product.averageDailyUnits,
      daysOfCover: product.daysOfCover,
      inventoryStatus: product.inventoryStatus,
      inventoryBySource: product.inventoryBySource,
    })),
    kickstarter: {
      campaigns: data.kickstarter.campaigns,
      trend: data.kickstarter.trend,
    },
    trend: data.trend.map((point) => ({
      date: point.date,
      revenue: point.revenue,
      adSpend: point.adSpend,
      orders: point.orders,
      unitsSold: point.unitsSold,
    })),
    sourceHealth: data.dataHealth.map((source) => ({
      source: source.source,
      sourceKey: source.sourceKey,
      status: source.status,
      lastSyncedAt: source.lastFinishedAt,
    })),
  };
}

const responseSchema = {
  name: "brht_analyst_response",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["answer", "caveats", "chart"],
    properties: {
      answer: { type: "string" },
      caveats: {
        type: "array",
        items: { type: "string" },
      },
      chart: {
        anyOf: [
          { type: "null" },
          {
            type: "object",
            additionalProperties: false,
            required: ["title", "description", "type", "xKey", "series", "data"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              type: { type: "string", enum: ["line", "bar"] },
              xKey: { type: "string" },
              series: {
                type: "array",
                minItems: 1,
                maxItems: 4,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["key", "label", "format"],
                  properties: {
                    key: { type: "string" },
                    label: { type: "string" },
                    format: {
                      type: "string",
                      enum: ["currency", "number", "percent", "multiple"],
                    },
                  },
                },
              },
              data: {
                type: "array",
                maxItems: 120,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["x", "values"],
                  properties: {
                    x: { type: "string" },
                    values: {
                      type: "array",
                      items: { type: "number" },
                      maxItems: 4
                    }
                  }
                },
              },
            },
          },
        ],
      },
    },
  },
};

export async function POST(request: Request) {
  try {
    const rate = checkRateLimit(request);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "BRHT Analyst rate limit reached. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
      );
    }
    const body = (await request.json()) as AnalystRequest;
    const organization = body.organization || "fable-fury";
    if (organization !== "fable-fury") {
      return NextResponse.json({ error: "This analyst is currently enabled for Fable Fury only." }, { status: 400 });
    }

    const messages = safeMessages(body.messages);
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) {
      return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
    }

    const range = ["7d", "14d", "30d", "90d", "180d", "365d", "max", "custom"].includes(body.range || "")
      ? (body.range as "7d" | "14d" | "30d" | "90d" | "180d" | "365d" | "max" | "custom")
      : "30d";
    const customStart = range === "custom" && typeof body.start === "string" ? body.start : null;
    const customEnd = range === "custom" && typeof body.end === "string" ? body.end : null;
    const displayCurrency = normalizeDisplayCurrency(body.currency);

    const [selectedBase, recentBase] = await Promise.all([
      getOrganizationDashboardData(organization, range, customStart, customEnd),
      getOrganizationDashboardData(organization, "90d"),
    ]);

    const usdToAud = displayCurrency === "AUD" ? await getUsdToAudRate() : 1;
    const selected = convertDashboardCurrency(selectedBase, displayCurrency, usdToAud);
    const recent = convertDashboardCurrency(recentBase, displayCurrency, usdToAud);

    const context = {
      dashboardView: compactDashboard(selected),
      recent90Days: compactDashboard(recent),
      knownDataLimits: [
        "BRHT currently has customer sales/revenue, advertising spend, product sales, inventory, Kickstarter and BackerKit campaign/commerce data.",
        "BRHT does NOT currently have manufacturing purchase orders, supplier invoices, landed unit cost, freight allocations, bill-of-materials cost, payroll, or accounting COGS for Fable Fury.",
        "Do not claim gross margin, manufacturing reorder quantity, supplier lead time, or last manufacturing PO values unless the supplied BRHT context actually contains them.",
        "When a requested input is missing, state exactly what is missing and what source or field should be connected. You may still provide clearly labeled scenario math if the user supplies an assumption.",
      ],
    };

    const system = `You are BRHT Analyst, an embedded operating analyst for Fable Fury Studios.
You must ground every factual business claim in the BRHT context supplied in this request.
Never invent missing operational data.
Be concise, commercially useful, and numerical.
Distinguish measured facts from estimates and assumptions.
When the user asks for a relationship, compare the relevant time series and explain correlation cautiously; do not imply causation from correlation alone.
When useful, return a chart using only rows that exist in the supplied context. Do not fabricate points.
For chart data, each row must use {x: "label", values: [number for series 1, number for series 2, ...]} in exactly the same order as chart.series.
For sales-vs-cost or margin analysis, only calculate gross margin if actual COGS/landed cost is present or the user explicitly supplies an assumption.
The display currency is ${selected.organization.currency}.
If inventory cover is available, use it to identify reorder risk, but explain that a purchase recommendation also needs lead time, MOQ, safety stock and inbound/open-PO data.
Write the answer for a business operator, not a data scientist.`;

    const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error: "BRHT Analyst is installed, but AI Gateway authentication is not available in this deployment yet.",
          setupRequired: true,
        },
        { status: 503 },
      );
    }

    const gatewayResponse = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.4-mini",
        reasoning_effort: "low",
        messages: [
          { role: "system", content: system },
          {
            role: "system",
            content: `BRHT DATA CONTEXT:\n${JSON.stringify(context)}`,
          },
          ...messages,
        ],
        response_format: {
          type: "json_schema",
          json_schema: responseSchema,
        },
      }),
      cache: "no-store",
    });

    if (!gatewayResponse.ok) {
      const detail = await gatewayResponse.text().catch(() => "");
      console.error("BRHT Analyst gateway error", gatewayResponse.status, detail.slice(0, 500));
      return NextResponse.json(
        {
          error:
            gatewayResponse.status === 402
              ? "BRHT Analyst needs AI Gateway credits before it can answer."
              : "BRHT Analyst could not reach the AI model right now.",
          setupRequired: gatewayResponse.status === 401 || gatewayResponse.status === 402 || gatewayResponse.status === 403,
        },
        { status: 503 },
      );
    }

    const payload = (await gatewayResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw) throw new Error("AI Gateway returned no analyst response.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { answer: raw, caveats: [], chart: null };
    }

    return NextResponse.json(parsed, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("BRHT Analyst route failed", error);
    return NextResponse.json(
      { error: "BRHT Analyst hit an unexpected error." },
      { status: 500 },
    );
  }
}
