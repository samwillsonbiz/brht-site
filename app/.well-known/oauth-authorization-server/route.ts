import { NextResponse } from "next/server";
import {
  BRHT_OAUTH_ISSUER,
  BRHT_READ_SCOPE,
  OFFLINE_SCOPE,
} from "@/lib/brht-mcp-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      issuer: BRHT_OAUTH_ISSUER,
      authorization_response_iss_parameter_supported: true,
      authorization_endpoint: `${BRHT_OAUTH_ISSUER}/api/brht/oauth/authorize`,
      token_endpoint: `${BRHT_OAUTH_ISSUER}/api/brht/oauth/token`,
      client_id_metadata_document_supported: true,
      token_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      scopes_supported: [BRHT_READ_SCOPE, OFFLINE_SCOPE],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
