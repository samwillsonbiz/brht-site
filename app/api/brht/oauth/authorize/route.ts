import { NextResponse } from "next/server";
import {
  BRHT_OAUTH_ISSUER,
  createAuthorizationCode,
  validateAuthorizationRequest,
} from "@/lib/brht-mcp-oauth";
import { validateInternalCredentials } from "@/lib/brht-internal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function html(body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Connect BRHT to ChatGPT</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f5f5f7;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif}
main{min-height:100vh;display:grid;place-items:center;padding:28px}
.card{width:min(460px,100%);background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:28px;padding:30px;box-shadow:0 24px 80px rgba(0,0,0,.08)}
.mark{width:52px;height:52px;border-radius:17px;background:#1d1d1f;color:#fff;display:grid;place-items:center;font-weight:800;font-size:18px}
.eyebrow{margin-top:24px;font-size:11px;font-weight:750;letter-spacing:.13em;text-transform:uppercase;color:#0071e3}
h1{margin:8px 0 0;font-size:30px;line-height:1.05;letter-spacing:-.045em}
p{font-size:14px;line-height:1.65;color:#6e6e73}
label{display:block;margin-top:14px;font-size:12px;font-weight:650;color:#3a3a3c}
input[type=text],input[type=password]{width:100%;height:46px;margin-top:7px;padding:0 13px;border:1px solid rgba(0,0,0,.10);border-radius:13px;background:#f9f9fb;font:inherit;outline:none}
input:focus{border-color:#0071e3}
button{width:100%;height:46px;margin-top:20px;border:0;border-radius:13px;background:#1d1d1f;color:#fff;font-weight:700;font-size:14px;cursor:pointer}
.note{margin-top:18px;padding:12px 14px;border-radius:14px;background:#f1fbf5;color:#49705b;font-size:12px;line-height:1.55}
.error{margin-top:16px;padding:11px 13px;border-radius:13px;background:#fff7e6;color:#8a5500;font-size:12px}
</style>
</head>
<body><main><div class="card">${body}</div></main></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      },
    },
  );
}

type AuthValues = {
  responseType: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  state: string;
  resource: string;
  scope: string;
};

function readSearch(url: URL): AuthValues {
  return {
    responseType: url.searchParams.get("response_type") || "",
    clientId: url.searchParams.get("client_id") || "",
    redirectUri: url.searchParams.get("redirect_uri") || "",
    codeChallenge: url.searchParams.get("code_challenge") || "",
    codeChallengeMethod: url.searchParams.get("code_challenge_method") || "",
    state: url.searchParams.get("state") || "",
    resource: url.searchParams.get("resource") || "",
    scope: url.searchParams.get("scope") || "",
  };
}

function hidden(name: string, value: string) {
  return `<input type="hidden" name="${esc(name)}" value="${esc(value)}" />`;
}

function form(values: AuthValues, error?: string) {
  return `
<div class="mark">B</div>
<div class="eyebrow">Private BRHT connection</div>
<h1>Connect Fable Fury data to ChatGPT</h1>
<p>ChatGPT is requesting read-only access to BRHT’s structured operating data. This does not give BRHT access to your ChatGPT account, email, or Drive.</p>
${error ? `<div class="error">${esc(error)}</div>` : ""}
<form method="post" action="/api/brht/oauth/authorize" autocomplete="on">
  ${hidden("response_type", values.responseType)}
  ${hidden("client_id", values.clientId)}
  ${hidden("redirect_uri", values.redirectUri)}
  ${hidden("code_challenge", values.codeChallenge)}
  ${hidden("code_challenge_method", values.codeChallengeMethod)}
  ${hidden("state", values.state)}
  ${hidden("resource", values.resource)}
  ${hidden("scope", values.scope)}
  <label>Internal username<input name="username" type="text" autocomplete="username" required /></label>
  <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
  <button type="submit">Authorize ChatGPT</button>
</form>
<div class="note"><strong>Read-only:</strong> revenue, orders, ad spend, product sales, inventory, Kickstarter and BRHT source health. BRHT exposes no write actions.</div>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const values = readSearch(url);
  const validation = validateAuthorizationRequest(values);
  if (validation) return html(`<div class="mark">B</div><h1>Unable to connect</h1><div class="error">${esc(validation)}</div>`, 400);
  return html(form(values));
}

export async function POST(request: Request) {
  const data = await request.formData();
  const values: AuthValues = {
    responseType: String(data.get("response_type") || ""),
    clientId: String(data.get("client_id") || ""),
    redirectUri: String(data.get("redirect_uri") || ""),
    codeChallenge: String(data.get("code_challenge") || ""),
    codeChallengeMethod: String(data.get("code_challenge_method") || ""),
    state: String(data.get("state") || ""),
    resource: String(data.get("resource") || ""),
    scope: String(data.get("scope") || ""),
  };

  const validation = validateAuthorizationRequest(values);
  if (validation) return html(`<div class="mark">B</div><h1>Unable to connect</h1><div class="error">${esc(validation)}</div>`, 400);

  const username = String(data.get("username") || "").trim();
  const password = String(data.get("password") || "");
  if (!validateInternalCredentials(username, password)) {
    return html(form(values, "Incorrect internal BRHT credentials."), 401);
  }

  const code = await createAuthorizationCode({
    username,
    clientId: values.clientId,
    redirectUri: values.redirectUri,
    codeChallenge: values.codeChallenge,
    resource: values.resource,
    scope: values.scope,
  });

  const redirect = new URL(values.redirectUri);
  redirect.searchParams.set("code", code);
  redirect.searchParams.set("state", values.state);
  redirect.searchParams.set("iss", BRHT_OAUTH_ISSUER);

  return NextResponse.redirect(redirect, 303);
}
