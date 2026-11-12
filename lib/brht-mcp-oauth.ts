import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { insertRows, selectRows, updateRows } from "@/lib/supabaseRest";

export const BRHT_OAUTH_ISSUER = "https://www.brht.ai";
export const BRHT_MCP_RESOURCE = "https://www.brht.ai/api/brht/mcp";
export const CHATGPT_CLIENT_ID = "https://chatgpt.com/oauth/client.json";
export const CHATGPT_REDIRECT_URI = "https://chatgpt.com/connector_platform_oauth_redirect";
export const BRHT_READ_SCOPE = "brht.read";
export const OFFLINE_SCOPE = "offline_access";

const ACCESS_TTL_SECONDS = 60 * 60;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;
const CODE_TTL_SECONDS = 5 * 60;

type OAuthCodeRow = {
  code_hash: string;
  username: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  resource: string;
  scope: string;
  expires_at: string;
  used_at: string | null;
};

type TokenPayload = {
  typ: "access" | "refresh";
  sub: string;
  iss: string;
  aud: string;
  client_id: string;
  scope: string;
  iat: number;
  exp: number;
  jti: string;
};

function secret() {
  const value = process.env.BRHT_OAUTH_SIGNING_SECRET;
  if (!value) throw new Error("BRHT OAuth signing secret is not configured.");
  return value;
}

function b64(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function signPart(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function issueToken(
  type: TokenPayload["typ"],
  username: string,
  clientId: string,
  resource: string,
  scope: string,
) {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    typ: type,
    sub: username,
    iss: BRHT_OAUTH_ISSUER,
    aud: resource,
    client_id: clientId,
    scope,
    iat: now,
    exp: now + (type === "access" ? ACCESS_TTL_SECONDS : REFRESH_TTL_SECONDS),
    jti: randomBytes(18).toString("base64url"),
  };
  const encoded = b64(JSON.stringify(payload));
  return `${encoded}.${signPart(encoded)}`;
}

export function verifyToken(token: string, expectedType: TokenPayload["typ"] = "access") {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = signPart(encoded);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (
      payload.typ !== expectedType ||
      payload.iss !== BRHT_OAUTH_ISSUER ||
      payload.aud !== BRHT_MCP_RESOURCE ||
      payload.client_id !== CHATGPT_CLIENT_ID ||
      !payload.scope.split(/\s+/).includes(BRHT_READ_SCOPE) ||
      payload.exp <= now
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function hashAuthorizationCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function pkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function validateAuthorizationRequest(values: {
  responseType?: string;
  clientId?: string;
  redirectUri?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  resource?: string;
  scope?: string;
}) {
  if (values.responseType !== "code") return "Only response_type=code is supported.";
  if (values.clientId !== CHATGPT_CLIENT_ID) return "Unknown OAuth client.";
  if (values.redirectUri !== CHATGPT_REDIRECT_URI) return "Invalid redirect URI.";
  if (!values.codeChallenge || values.codeChallengeMethod !== "S256") {
    return "PKCE with S256 is required.";
  }
  if (values.resource !== BRHT_MCP_RESOURCE) return "Invalid MCP resource.";
  const scopes = new Set((values.scope || "").split(/\s+/).filter(Boolean));
  if (!scopes.has(BRHT_READ_SCOPE)) return "The brht.read scope is required.";
  return null;
}

export async function createAuthorizationCode(input: {
  username: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  resource: string;
  scope: string;
}) {
  const code = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000).toISOString();
  await insertRows("brht_oauth_codes", [
    {
      code_hash: hashAuthorizationCode(code),
      username: input.username,
      client_id: input.clientId,
      redirect_uri: input.redirectUri,
      code_challenge: input.codeChallenge,
      resource: input.resource,
      scope: input.scope,
      expires_at: expiresAt,
    },
  ]);
  return code;
}

export async function consumeAuthorizationCode(code: string) {
  const rows = (await selectRows("brht_oauth_codes", {
    select:
      "code_hash,username,client_id,redirect_uri,code_challenge,resource,scope,expires_at,used_at",
    code_hash: `eq.${hashAuthorizationCode(code)}`,
    used_at: "is.null",
    limit: "1",
  })) as OAuthCodeRow[];

  const row = rows[0];
  if (!row || new Date(row.expires_at).getTime() <= Date.now()) return null;

  await updateRows(
    "brht_oauth_codes",
    { used_at: new Date().toISOString() },
    { code_hash: `eq.${row.code_hash}`, used_at: "is.null" },
  );

  return row;
}

export function tokenResponse(username: string, clientId: string, resource: string, scope: string) {
  return {
    access_token: issueToken("access", username, clientId, resource, scope),
    token_type: "Bearer",
    expires_in: ACCESS_TTL_SECONDS,
    refresh_token: issueToken("refresh", username, clientId, resource, scope),
    scope,
  };
}

export function authChallenge(error = "invalid_token", description = "BRHT authorization is required.") {
  return `Bearer resource_metadata="${BRHT_OAUTH_ISSUER}/.well-known/oauth-protected-resource", scope="${BRHT_READ_SCOPE}", error="${error}", error_description="${description}"`;
}
