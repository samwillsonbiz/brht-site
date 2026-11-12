import { NextResponse } from "next/server";
import { internalSessionFromRequest } from "@/lib/brht-internal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = internalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Internal BRHT access required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const token = process.env.BRHT_MCP_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "BRHT MCP is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      name: "BRHT Intelligence — Fable Fury",
      endpoint: "https://www.brht.ai/api/brht/mcp",
      authentication: "Bearer token",
      token,
      readOnly: true,
      setupSteps: [
        "Open ChatGPT on the web.",
        "Open Plugins and choose Add custom MCP server.",
        "Name it BRHT Intelligence — Fable Fury.",
        "Use the endpoint shown here.",
        "Choose bearer/API-token authentication and paste the private token.",
        "Create/install the plugin, then @mention BRHT together with Gmail, Drive or other connected apps when a question needs both structured BRHT data and operating context.",
      ],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
