import { NextResponse } from "next/server";
import {
  BRHT_MCP_RESOURCE,
  BRHT_READ_SCOPE,
  CHATGPT_CLIENT_ID,
  CHATGPT_REDIRECT_URI,
  consumeAuthorizationCode,
  pkceChallenge,
  tokenResponse,
  verifyToken,
} from "@/lib/brht-mcp-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function oauthError(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    },
  );
}

export async function POST(request: Request) {
  let form: URLSearchParams;
  try {
    form = new URLSearchParams(await request.text());
  } catch {
    return oauthError("invalid_request", "Could not parse token request.");
  }

  const grantType = form.get("grant_type") || "";
  const clientId = form.get("client_id") || CHATGPT_CLIENT_ID;
  const resource = form.get("resource") || BRHT_MCP_RESOURCE;

  if (clientId !== CHATGPT_CLIENT_ID) {
    return oauthError("invalid_client", "Unknown OAuth client.", 401);
  }
  if (resource !== BRHT_MCP_RESOURCE) {
    return oauthError("invalid_target", "Invalid MCP resource.");
  }

  if (grantType === "authorization_code") {
    const code = form.get("code") || "";
    const redirectUri = form.get("redirect_uri") || "";
    const verifier = form.get("code_verifier") || "";

    if (!code || !redirectUri || !verifier) {
      return oauthError("invalid_request", "code, redirect_uri and code_verifier are required.");
    }
    if (redirectUri !== CHATGPT_REDIRECT_URI) {
      return oauthError("invalid_grant", "Redirect URI mismatch.");
    }

    const row = await consumeAuthorizationCode(code);
    if (!row) return oauthError("invalid_grant", "Authorization code is invalid, expired, or already used.");

    if (
      row.client_id !== CHATGPT_CLIENT_ID ||
      row.redirect_uri !== CHATGPT_REDIRECT_URI ||
      row.resource !== BRHT_MCP_RESOURCE
    ) {
      return oauthError("invalid_grant", "Authorization code context mismatch.");
    }

    if (pkceChallenge(verifier) !== row.code_challenge) {
      return oauthError("invalid_grant", "PKCE verification failed.");
    }

    return NextResponse.json(
      tokenResponse(row.username, row.client_id, row.resource, row.scope),
      {
        headers: {
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      },
    );
  }

  if (grantType === "refresh_token") {
    const refreshToken = form.get("refresh_token") || "";
    const payload = verifyToken(refreshToken, "refresh");
    if (!payload) return oauthError("invalid_grant", "Refresh token is invalid or expired.");

    return NextResponse.json(
      tokenResponse(
        payload.sub,
        payload.client_id,
        payload.aud,
        payload.scope || BRHT_READ_SCOPE,
      ),
      {
        headers: {
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      },
    );
  }

  return oauthError("unsupported_grant_type", "Supported grants are authorization_code and refresh_token.");
}
