"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  PlugZap,
  Sparkles,
  X,
} from "lucide-react";

type McpSetup = {
  name: string;
  endpoint: string;
  authentication: string;
  readOnly: boolean;
  setupSteps: string[];
};

const samplePrompts = [
  "Using BRHT plus Gmail and Drive, what was the MOQ on our most recent base-game supplier quote, what was the lead time, and based on the last 60 days of BRHT sales when should we reorder?",
  "Use BRHT to check current inventory and sales velocity, then search my supplier emails for any open production order that changes the reorder recommendation.",
  "Compare the last 90 days of BRHT revenue and ad spend with campaign activity in my connected email/docs. What operational events best explain the biggest changes?",
];

function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      onClick={copy}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3.5 text-xs font-semibold text-[#3a3a3c] transition hover:border-black/20"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#16834a]" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function AskBrhtPanel({
  organization,
  range,
  start,
  end,
  currency,
}: {
  organization: string;
  range: string;
  start: string;
  end: string;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [setup, setSetup] = useState<McpSetup | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const contextLabel = useMemo(
    () => `${start} → ${end} · ${currency}`,
    [start, end, currency],
  );

  useEffect(() => {
    if (!open) return;
    let active = true;
    setAuthStatus("checking");

    fetch("/api/brht/internal-auth", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { authenticated?: boolean }) => {
        if (!active) return;
        setAuthStatus(payload.authenticated ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setAuthStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open || authStatus !== "authenticated") return;
    let active = true;
    setSetupError(null);

    fetch("/api/brht/mcp-setup", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as McpSetup & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Could not load BRHT MCP setup.");
        return payload;
      })
      .then((payload) => {
        if (active) setSetup(payload);
      })
      .catch((error) => {
        if (active) {
          setSetupError(error instanceof Error ? error.message : "Could not load BRHT MCP setup.");
        }
      });

    return () => {
      active = false;
    };
  }, [open, authStatus]);

  async function login() {
    if (!username.trim() || !password || authBusy) return;
    setAuthBusy(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/brht/internal-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const payload = (await response.json()) as {
        authenticated?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.authenticated) {
        throw new Error(payload.error || "Internal login failed.");
      }
      setPassword("");
      setAuthStatus("authenticated");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Internal login failed.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/brht/internal-auth", { method: "DELETE" }).catch(() => undefined);
    setSetup(null);
    setUsername("");
    setPassword("");
    setAuthError(null);
    setAuthStatus("unauthenticated");
  }

  const setupPrompt = setup
    ? `Connect my private BRHT Intelligence MCP server in ChatGPT.

Name: ${setup.name}
Server URL: ${setup.endpoint}
Authentication: OAuth

When ChatGPT opens the BRHT authorization page, I will sign in with my existing internal BRHT credentials. After connecting it, use BRHT for structured Fable Fury operating data and combine it with my other connected apps such as Gmail and Google Drive when a question requires supplier emails, quotes, invoices, POs, project context, or documents. Never guess missing business facts.`
    : "";

  const dashboardContextPrompt = `Use BRHT Intelligence — Fable Fury as the structured operating-data source for this analysis.

I am currently looking at the Fable Fury BRHT dashboard:
- Date range: ${start} through ${end}
- Display currency: ${currency}
- Dashboard range preset: ${range}

Use BRHT for live structured metrics such as revenue, orders, advertising spend, product sales, inventory, Kickstarter and source health.

When my question needs operating context that is not in BRHT — supplier MOQ, lead times, purchase orders, quotes, invoices, project history, communications or documents — also use my connected Gmail, Google Drive and other relevant ChatGPT apps rather than guessing.

Distinguish facts from estimates and explicitly say which source each important conclusion came from.

My question: `;

  async function openChatGPT() {
    await navigator.clipboard.writeText(dashboardContextPrompt);
    window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(0,0,0,.22)] transition hover:bg-black"
      >
        <Sparkles className="h-4 w-4 text-[#6fd3ff]" />
        Internal · Ask in ChatGPT
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 p-0 backdrop-blur-[2px] sm:p-4">
          <div className="flex h-[88vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-black/[0.08] bg-[#f5f5f7] shadow-2xl sm:h-[780px] sm:max-h-[92vh] sm:w-[560px] sm:rounded-[26px]">
            <div className="flex items-center justify-between border-b border-black/[0.07] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1d1d1f] text-white">
                  <PlugZap className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#1d1d1f]">
                    Ask ChatGPT
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#86868b]">
                    {authStatus === "authenticated" ? contextLabel : "Internal access only"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {authStatus === "authenticated" ? (
                  <button
                    onClick={logout}
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f7] text-[#6e6e73] transition hover:bg-[#e5e5ea] hover:text-[#1d1d1f]"
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f7] text-[#6e6e73] transition hover:bg-[#e5e5ea] hover:text-[#1d1d1f]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {authStatus === "checking" ? (
              <div className="grid flex-1 place-items-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0071e3]" />
                  <div className="mt-3 text-sm font-semibold text-[#1d1d1f]">
                    Checking internal access…
                  </div>
                </div>
              </div>
            ) : authStatus === "unauthenticated" ? (
              <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-8">
                <div className="w-full max-w-sm rounded-[24px] border border-black/[0.07] bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,.06)]">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1d1d1f] text-white">
                    <LockKeyhole className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                    Internal connection only
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
                    Anyone can see the operating dashboard. Only the internal team can connect BRHT’s private business data to ChatGPT.
                  </p>
                  <div className="mt-5 space-y-3">
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Internal username"
                      autoComplete="username"
                      className="h-11 w-full rounded-xl border border-black/[0.09] bg-[#f9f9fb] px-3 text-sm outline-none focus:border-[#0071e3]/50"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") login();
                      }}
                      placeholder="Password"
                      autoComplete="current-password"
                      className="h-11 w-full rounded-xl border border-black/[0.09] bg-[#f9f9fb] px-3 text-sm outline-none focus:border-[#0071e3]/50"
                    />
                    {authError ? (
                      <div className="rounded-xl border border-[#f0c36a] bg-[#fffaf0] px-3 py-2 text-xs text-[#7a4a00]">
                        {authError}
                      </div>
                    ) : null}
                    <button
                      onClick={login}
                      disabled={!username.trim() || !password || authBusy}
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {authBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Unlock ChatGPT connection
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,.04)]">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1d1d1f] text-white">
                      <MessageSquareText className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0071e3]">
                        Current dashboard context
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1d1d1f]">
                        Ask about what you’re seeing
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
                        I’ll copy the current Fable Fury dashboard context to your clipboard and open a new ChatGPT chat. Paste it, add your question, and use BRHT together with Gmail, Drive or your other connected apps when needed.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#f5f5f7] p-3 text-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868b]">From</div>
                      <div className="mt-1 text-xs font-semibold text-[#1d1d1f]">{start}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868b]">To</div>
                      <div className="mt-1 text-xs font-semibold text-[#1d1d1f]">{end}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868b]">Currency</div>
                      <div className="mt-1 text-xs font-semibold text-[#1d1d1f]">{currency}</div>
                    </div>
                  </div>

                  <button
                    onClick={openChatGPT}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1d1d1f] text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Ask in ChatGPT
                    <ExternalLink className="h-4 w-4" />
                  </button>

                  <div className="mt-3 text-center text-[11px] leading-5 text-[#86868b]">
                    Current dashboard context is copied automatically.
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-black/[0.06] bg-white p-5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868b]">
                    Good questions to try
                  </div>
                  <div className="mt-3 space-y-3">
                    {samplePrompts.map((prompt) => (
                      <div key={prompt} className="rounded-2xl bg-[#f7f7f9] p-4">
                        <div className="text-sm leading-6 text-[#3a3a3c]">“{prompt}”</div>
                        <div className="mt-2">
                          <CopyButton value={prompt} label="Copy question" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <details className="mt-4 rounded-[24px] border border-black/[0.06] bg-white p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[#1d1d1f]">
                    Connection settings
                  </summary>
                  <p className="mt-2 text-xs leading-5 text-[#86868b]">
                    You only need this if BRHT is disconnected from ChatGPT or you want to reconnect it.
                  </p>

                  {setupError ? (
                    <div className="mt-4 rounded-2xl border border-[#f0c36a] bg-[#fffaf0] px-4 py-3 text-sm text-[#7a4a00]">
                      {setupError}
                    </div>
                  ) : !setup ? (
                    <div className="mt-4 flex items-center gap-2 text-sm text-[#86868b]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading connection details…
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-[#6e6e73]">Server URL</div>
                      <code className="mt-2 block overflow-x-auto rounded-xl bg-[#f5f5f7] px-3 py-2.5 text-xs text-[#1d1d1f]">
                        {setup.endpoint}
                      </code>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <CopyButton value={setup.endpoint} label="Copy URL" />
                        <a
                          href="https://chatgpt.com/plugins"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-2 rounded-full bg-[#1d1d1f] px-3.5 text-xs font-semibold text-white"
                        >
                          Open Plugins <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <CopyButton value={setupPrompt} label="Copy setup prompt" />
                      </div>
                      <div className="mt-4 rounded-2xl bg-[#f5f5f7] p-4 text-xs leading-5 text-[#6e6e73]">
                        Authentication: OAuth. If ChatGPT asks you to reconnect, sign in on the BRHT authorization page with your internal BRHT credentials.
                      </div>
                    </div>
                  )}
                </details>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
