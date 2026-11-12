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

  return NextResponse.json(
    {
      name: "BRHT Intelligence — Fable Fury",
      endpoint: "https://www.brht.ai/api/brht/mcp",
      authentication: "OAuth",
      readOnly: true,
      setupSteps: [
        "Open ChatGPT on the web and open Plugins.",
        "Choose Add custom MCP server.",
        "Name it BRHT Intelligence — Fable Fury.",
        "Use https://www.brht.ai/api/brht/mcp as the server URL.",
        "Choose OAuth authentication.",
        "When ChatGPT opens the BRHT authorization page, sign in with your existing internal BRHT username and password.",
        "Install/connect the plugin. After that, use BRHT together with Gmail, Drive or other connected apps in the same ChatGPT conversation when a question needs both structured operating data and business context.",
      ],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
