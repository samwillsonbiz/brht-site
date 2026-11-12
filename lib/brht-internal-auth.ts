import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "brht_internal_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function credentials() {
  const username = process.env.BRHT_DASHBOARD_USERNAME;
  const password = process.env.BRHT_DASHBOARD_PASSWORD;
  if (!username || !password) return null;
  const aliases = (process.env.BRHT_INTERNAL_USERNAME_ALIASES || username)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!aliases.includes(username)) aliases.unshift(username);
  return { username, password, aliases };
}

function signingSecret() {
  const creds = credentials();
  return process.env.BRHT_PLATFORM_ADMIN_TOKEN || creds?.password || null;
}

function sign(value: string) {
  const secret = signingSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function internalAuthConfigured() {
  return Boolean(credentials() && signingSecret());
}

export function validateInternalCredentials(username: string, password: string) {
  const creds = credentials();
  if (!creds) return false;

  const leftPass = Buffer.from(password);
  const rightPass = Buffer.from(creds.password);
  const passwordMatches =
    leftPass.length === rightPass.length &&
    timingSafeEqual(leftPass, rightPass);

  if (!passwordMatches) return false;

  return creds.aliases.some((candidate) => {
    const leftUser = Buffer.from(username);
    const rightUser = Buffer.from(candidate);
    return (
      leftUser.length === rightUser.length &&
      timingSafeEqual(leftUser, rightUser)
    );
  });
}

export function createInternalSession(username: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(
    JSON.stringify({ username, expiresAt }),
    "utf8",
  ).toString("base64url");
  const signature = sign(payload);
  if (!signature) throw new Error("Internal authentication is not configured.");
  return `${payload}.${signature}`;
}

export function verifyInternalSession(token: string | undefined | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (!expected) return null;

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { username?: string; expiresAt?: number };
    if (
      !parsed.username ||
      !parsed.expiresAt ||
      parsed.expiresAt < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const creds = credentials();
    if (!creds || !creds.aliases.includes(parsed.username)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readCookie(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const entry = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : null;
}

export function internalSessionFromRequest(request: Request) {
  return verifyInternalSession(readCookie(request));
}

export const internalAuthCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
};
