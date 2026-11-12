import { NextResponse } from "next/server";
import {
  BRHT_MCP_RESOURCE,
  BRHT_OAUTH_ISSUER,
  BRHT_READ_SCOPE,
  OFFLINE_SCOPE,
} from "@/lib/brht-mcp-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      resource: BRHT_MCP_RESOURCE,
      authorization_servers: [BRHT_OAUTH_ISSUER],
      scopes_supported: [BRHT_READ_SCOPE, OFFLINE_SCOPE],
      resource_documentation: "https://www.brht.ai/dashboards/fable-fury",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
