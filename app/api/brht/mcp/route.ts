import { NextResponse } from "next/server";
import { getOrganizationDashboardData } from "@/lib/brht-dashboard/data";
import {
  convertDashboardCurrency,
  getUsdToAudRate,
  normalizeDisplayCurrency,
} from "@/lib/brht-dashboard/currency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  } & Record<string, unknown>;
};

type DisplayCurrency = "USD" | "AUD";

const DASHBOARD_URL = "https://www.brht.ai/dashboards/fable-fury?range=max";
const MCP_VERSION = "2025-06-18";

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true,
};

const tools = [
  {
    name: "get_business_overview",
    title: "Get Fable Fury business overview",
    description:
      "Use for a grounded executive snapshot of Fable Fury: revenue, orders, ad spend, ROAS, units, channel mix and the selected reporting period. This reads BRHT operating data only.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        range: {
          type: "string",
          enum: ["7d", "14d", "30d", "90d", "180d", "365d", "max"],
          description: "Reporting period. Use max for all represented history.",
        },
        currency: {
          type: "string",
          enum: ["USD", "AUD"],
          description: "Display currency. Underlying BRHT records remain in USD.",
        },
      },
    },
    annotations: readOnlyAnnotations,
  },
  {
    name: "get_sales_timeseries",
    title: "Get Fable Fury sales time series",
    description:
      "Use when the user asks about a trend, recent sales, charting revenue/orders/units/ad spend, or relationships over time. Returns one daily row per available date.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        days: {
          type: "integer",
          minimum: 7,
          maximum: 365,
          description: "Number of most recent days to return, for example 60.",
        },
        currency: {
          type: "string",
          enum: ["USD", "AUD"],
          description: "Display currency.",
        },
      },
    },
    annotations: readOnlyAnnotations,
  },
  {
    name: "get_inventory_reorder_risk",
    title: "Get inventory and reorder risk",
    description:
      "Use for current stock, sales velocity, days of cover and reorder-risk questions. BRHT can identify inventory pressure, but supplier MOQ, lead time, open POs and landed cost must come from other connected sources unless added to BRHT.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        velocityWindow: {
          type: "string",
          enum: ["30d", "90d", "180d"],
          description: "Period used for sales velocity and cover estimates.",
        },
      },
    },
    annotations: readOnlyAnnotations,
  },
  {
    name: "get_kickstarter_performance",
    title: "Get Kickstarter performance",
    description:
      "Use for Fable Fury Kickstarter campaign totals, backers, goals, average pledge and daily/cumulative campaign trajectory.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        currency: {
          type: "string",
          enum: ["USD", "AUD"],
          description: "Display currency.",
        },
      },
    },
    annotations: readOnlyAnnotations,
  },
  {
    name: "get_source_health",
    title: "Get BRHT source health",
    description:
      "Use to see which Fable Fury data sources are healthy, delayed, failed or stale and when they last synced.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
    annotations: readOnlyAnnotations,
  },
  {
    name: "search",
    title: "Search BRHT operating knowledge",
    description:
      "Search the Fable Fury BRHT operating dataset for relevant live business topics. Use for company-knowledge style retrieval before fetch.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "Natural-language search query.",
        },
      },
    },
    outputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["results"],
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "title", "url"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              url: { type: "string" },
            },
          },
        },
      },
    },
    annotations: readOnlyAnnotations,
  },
  {
    name: "fetch",
    title: "Fetch BRHT operating knowledge",
    description:
      "Fetch a BRHT operating-data item returned by search. Returns current model-readable text and a canonical dashboard URL for citation.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["id"],
      properties: {
        id: {
          type: "string",
          description: "Result ID returned by the BRHT search tool.",
        },
      },
    },
    outputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["id", "title", "text", "url", "metadata"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        text: { type: "string" },
        url: { type: "string" },
        metadata: { type: "object", additionalProperties: true },
      },
    },
    annotations: readOnlyAnnotations,
  },
];

function authorized(request: Request) {
  const expected = process.env.BRHT_MCP_TOKEN;
  if (!expected) return false;
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${expected}`;
}

function jsonRpc(id: JsonRpcRequest["id"], result: unknown) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, result },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "https://chatgpt.com",
        "Access-Control-Allow-Headers":
          "Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    },
  );
}

function jsonRpcError(
  id: JsonRpcRequest["id"],
  code: number,
  message: string,
  data?: unknown,
) {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code, message, ...(data === undefined ? {} : { data }) },
    },
    { status: code === -32601 ? 200 : 400, headers: { "Cache-Control": "no-store" } },
  );
}

function toolResult(value: unknown) {
  return {
    structuredContent: value,
    content: [{ type: "text", text: JSON.stringify(value) }],
  };
}

function pickCurrency(value: unknown): DisplayCurrency {
  return normalizeDisplayCurrency(typeof value === "string" ? value : undefined);
}

async function dashboard(
  range: "7d" | "14d" | "30d" | "90d" | "180d" | "365d" | "max",
  currency: DisplayCurrency,
) {
  const base = await getOrganizationDashboardData("fable-fury", range);
  if (currency === "USD") return base;
  const rate = await getUsdToAudRate();
  return convertDashboardCurrency(base, currency, rate);
}

function overviewPayload(data: Awaited<ReturnType<typeof dashboard>>) {
  return {
    organization: data.organization.name,
    period: data.period,
    currency: data.organization.currency,
    summary: {
      revenue: data.summary.revenue.value,
      orders: data.summary.orders.value,
      adSpend: data.summary.adSpend.value,
      blendedRoas: data.summary.blendedRoas.value,
      averageOrderValue: data.summary.averageOrderValue.value,
      unitsSold: data.summary.unitsSold.value,
    },
    channels: data.channels.map((row) => ({
      channel: row.channel,
      kind: row.kind,
      revenue: row.revenue,
      spend: row.spend,
      orders: row.orders,
      roas: row.roas,
      latestMetricAt: row.latestMetricAt,
    })),
    canonicalUrl: DASHBOARD_URL,
  };
}

async function callTool(name: string, args: Record<string, unknown>) {
  if (name === "get_business_overview") {
    const range = ["7d", "14d", "30d", "90d", "180d", "365d", "max"].includes(String(args.range))
      ? (String(args.range) as "7d" | "14d" | "30d" | "90d" | "180d" | "365d" | "max")
      : "30d";
    return toolResult(overviewPayload(await dashboard(range, pickCurrency(args.currency))));
  }

  if (name === "get_sales_timeseries") {
    const daysRaw = Number(args.days ?? 60);
    const days = Math.min(365, Math.max(7, Number.isFinite(daysRaw) ? Math.round(daysRaw) : 60));
    const currency = pickCurrency(args.currency);
    const sourceRange =
      days <= 30 ? "30d" : days <= 90 ? "90d" : days <= 180 ? "180d" : "365d";
    const data = await dashboard(sourceRange, currency);
    const points = data.trend.slice(-days).map((point) => ({
      date: point.date,
      revenue: point.revenue,
      adSpend: point.adSpend,
      orders: point.orders,
      unitsSold: point.unitsSold,
    }));
    return toolResult({
      currency: data.organization.currency,
      requestedDays: days,
      period: points.length
        ? { start: points[0].date, end: points[points.length - 1].date }
        : data.period,
      points,
      canonicalUrl: DASHBOARD_URL,
    });
  }

  if (name === "get_inventory_reorder_risk") {
    const velocityWindow = ["30d", "90d", "180d"].includes(String(args.velocityWindow))
      ? (String(args.velocityWindow) as "30d" | "90d" | "180d")
      : "30d";
    const data = await dashboard(velocityWindow, "USD");
    return toolResult({
      velocityWindow,
      products: data.products.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        unitsSold: product.unitsSold,
        availableQuantity: product.availableQuantity,
        averageDailyUnits: product.averageDailyUnits,
        daysOfCover: product.daysOfCover,
        inventoryStatus: product.inventoryStatus,
        inventoryBySource: product.inventoryBySource,
      })),
      decisionLimits: {
        connected:
          "Current inventory, recent unit velocity and estimated days of cover.",
        missingUnlessFoundInAnotherConnectedApp:
          "Supplier MOQ, supplier lead time, open purchase orders, inbound manufacturing stock, landed unit cost and safety-stock policy.",
      },
      canonicalUrl: DASHBOARD_URL,
    });
  }

  if (name === "get_kickstarter_performance") {
    const data = await dashboard("max", pickCurrency(args.currency));
    return toolResult({
      currency: data.organization.currency,
      campaigns: data.kickstarter.campaigns,
      trend: data.kickstarter.trend,
      canonicalUrl: DASHBOARD_URL,
    });
  }

  if (name === "get_source_health") {
    const data = await dashboard("30d", "USD");
    return toolResult({
      generatedAt: data.generatedAt,
      sources: data.dataHealth,
      warnings: data.warnings,
      canonicalUrl: DASHBOARD_URL,
    });
  }

  if (name === "search") {
    const query = String(args.query ?? "").toLowerCase();
    const candidates = [
      { id: "overview", title: "Fable Fury executive operating overview", keywords: "revenue sales orders business overview channel roas" },
      { id: "sales-90d", title: "Fable Fury recent sales and advertising trend", keywords: "sales revenue advertising ad spend trend chart orders units" },
      { id: "inventory", title: "Fable Fury inventory and reorder risk", keywords: "inventory stock reorder product cover velocity amazon shopify" },
      { id: "kickstarter", title: "Fable Fury Kickstarter performance", keywords: "kickstarter campaign pledge backers magic mayhem crowdfunding" },
      { id: "source-health", title: "BRHT Fable Fury data-source health", keywords: "source sync health data delayed stale failed" },
    ];
    const terms = query.split(/\s+/).filter(Boolean);
    const ranked = candidates
      .map((item) => ({
        ...item,
        score: terms.reduce(
          (score, term) =>
            score +
            (item.title.toLowerCase().includes(term) ? 3 : 0) +
            (item.keywords.includes(term) ? 1 : 0),
          0,
        ),
      }))
      .filter((item) => item.score > 0 || terms.length === 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        url: `${DASHBOARD_URL}#${item.id === "overview" ? "overview" : item.id === "sales-90d" ? "channels" : item.id}`,
      }));
    return toolResult({ results: ranked });
  }

  if (name === "fetch") {
    const id = String(args.id ?? "");
    let title = "";
    let payload: unknown;

    if (id === "overview") {
      title = "Fable Fury executive operating overview";
      payload = overviewPayload(await dashboard("max", "USD"));
    } else if (id === "sales-90d") {
      title = "Fable Fury recent sales and advertising trend";
      const data = await dashboard("90d", "USD");
      payload = {
        currency: "USD",
        period: data.period,
        points: data.trend,
      };
    } else if (id === "inventory") {
      title = "Fable Fury inventory and reorder risk";
      const data = await dashboard("30d", "USD");
      payload = {
        products: data.products,
        note:
          "BRHT inventory cover does not contain supplier MOQ, lead time, landed unit cost or open manufacturing POs unless those are connected separately.",
      };
    } else if (id === "kickstarter") {
      title = "Fable Fury Kickstarter performance";
      const data = await dashboard("max", "USD");
      payload = data.kickstarter;
    } else if (id === "source-health") {
      title = "BRHT Fable Fury data-source health";
      const data = await dashboard("30d", "USD");
      payload = { sources: data.dataHealth, warnings: data.warnings };
    } else {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown BRHT fetch id: ${id}` }],
      };
    }

    const result = {
      id,
      title,
      text: JSON.stringify(payload, null, 2),
      url: DASHBOARD_URL,
      metadata: { organization: "fable-fury", source: "BRHT Intelligence" },
    };
    return toolResult(result);
  }

  return {
    isError: true,
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://chatgpt.com",
      "Access-Control-Allow-Headers":
        "Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="BRHT MCP"',
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      name: "BRHT Intelligence — Fable Fury",
      mcp: true,
      endpoint: "/api/brht/mcp",
      readOnly: true,
      tools: tools.map((tool) => tool.name),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32001, message: "Unauthorized" },
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="BRHT MCP"',
          "Cache-Control": "no-store",
        },
      },
    );
  }

  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return jsonRpcError(null, -32700, "Parse error");
  }

  const method = body.method;

  if (method === "initialize") {
    return jsonRpc(body.id, {
      protocolVersion: MCP_VERSION,
      capabilities: { tools: {}, resources: {} },
      serverInfo: {
        name: "brht-fable-fury",
        title: "BRHT Intelligence — Fable Fury",
        version: "1.0.0",
      },
      instructions:
        "Read-only operating data for Fable Fury Studios. Use BRHT for structured sales, advertising, product, inventory, Kickstarter and source-health data. For supplier terms, MOQ, manufacturing lead times, invoices, email discussions or documents, combine BRHT with the user's other connected apps such as Gmail or Google Drive rather than guessing.",
    });
  }

  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  if (method === "ping") {
    return jsonRpc(body.id, {});
  }

  if (method === "tools/list") {
    return jsonRpc(body.id, { tools });
  }

  if (method === "tools/call") {
    const name = body.params?.name;
    if (!name) return jsonRpcError(body.id, -32602, "Tool name is required");
    try {
      const result = await callTool(
        name,
        (body.params?.arguments ?? {}) as Record<string, unknown>,
      );
      return jsonRpc(body.id, result);
    } catch (error) {
      console.error("BRHT MCP tool failed", name, error);
      return jsonRpc(body.id, {
        isError: true,
        content: [
          {
            type: "text",
            text:
              error instanceof Error
                ? `BRHT tool failed: ${error.message}`
                : "BRHT tool failed.",
          },
        ],
      });
    }
  }

  if (method === "resources/list") {
    return jsonRpc(body.id, { resources: [] });
  }

  return jsonRpcError(body.id, -32601, `Method not found: ${method ?? "unknown"}`);
}
