"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  BarChart3,
  Bot,
  Loader2,
  MessageSquareText,
  Sparkles,
  X,
} from "lucide-react";

type AnalystChart = {
  title: string;
  description: string;
  type: "line" | "bar";
  xKey: string;
  series: Array<{
    key: string;
    label: string;
    format: "currency" | "number" | "percent" | "multiple";
  }>;
  data: Array<Record<string, string | number | null>>;
};

type AnalystReply = {
  answer: string;
  caveats: string[];
  chart: AnalystChart | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  reply?: AnalystReply;
};

function formatValue(
  value: number,
  format: "currency" | "number" | "percent" | "multiple",
  currency: string,
) {
  if (format === "currency") {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "multiple") return `${value.toFixed(2)}x`;
  return new Intl.NumberFormat("en-AU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function InlineAnalystChart({
  chart,
  currency,
}: {
  chart: AnalystChart;
  currency: string;
}) {
  const width = 720;
  const height = 260;
  const left = 58;
  const right = 18;
  const top = 18;
  const bottom = 42;

  const rows = chart.data.slice(0, 120);
  if (rows.length === 0 || chart.series.length === 0) return null;

  const numeric = rows.flatMap((row) =>
    chart.series.map((series) => {
      const value = row[series.key];
      return typeof value === "number" && Number.isFinite(value) ? value : 0;
    }),
  );
  const max = Math.max(1, ...numeric);
  const paddedMax = max * 1.1;
  const x = (index: number) =>
    left +
    (index / Math.max(1, rows.length - 1)) * (width - left - right);
  const y = (value: number) =>
    top + (height - top - bottom) * (1 - value / paddedMax);
  const labelStep = Math.max(1, Math.ceil(rows.length / 6));

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
      <div className="border-b border-black/[0.06] px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
          <BarChart3 className="h-4 w-4 text-[#0071e3]" />
          {chart.title}
        </div>
        {chart.description ? (
          <div className="mt-1 text-xs leading-5 text-[#86868b]">
            {chart.description}
          </div>
        ) : null}
      </div>
      <div className="overflow-x-auto p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[620px] w-full"
          role="img"
          aria-label={chart.title}
        >
          {[0, 0.5, 1].map((tick) => {
            const yy = top + (height - top - bottom) * (1 - tick);
            const formatter = chart.series[0]?.format ?? "number";
            return (
              <g key={tick}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={yy}
                  y2={yy}
                  stroke="#1d1d1f"
                  strokeOpacity="0.08"
                />
                <text
                  x={left - 10}
                  y={yy + 4}
                  textAnchor="end"
                  fill="#86868b"
                  fontSize="10"
                >
                  {formatValue(paddedMax * tick, formatter, currency)}
                </text>
              </g>
            );
          })}

          {chart.type === "line"
            ? chart.series.map((series, seriesIndex) => {
                const stroke = ["#0071e3", "#ff9f0a", "#05a66b", "#af52de"][seriesIndex % 4];
                const points = rows
                  .map((row, index) => {
                    const raw = row[series.key];
                    const value = typeof raw === "number" ? raw : 0;
                    return `${x(index)},${y(value)}`;
                  })
                  .join(" ");
                return (
                  <polyline
                    key={series.key}
                    points={points}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })
            : rows.map((row, index) => {
                const groupWidth = (width - left - right) / Math.max(1, rows.length);
                const barWidth = Math.max(3, Math.min(22, groupWidth / Math.max(1, chart.series.length + 0.5)));
                return chart.series.map((series, seriesIndex) => {
                  const raw = row[series.key];
                  const value = typeof raw === "number" ? raw : 0;
                  const xx =
                    left +
                    index * groupWidth +
                    seriesIndex * barWidth +
                    Math.max(0, (groupWidth - chart.series.length * barWidth) / 2);
                  const yy = y(value);
                  const fill = ["#0071e3", "#ff9f0a", "#05a66b", "#af52de"][seriesIndex % 4];
                  return (
                    <rect
                      key={`${index}-${series.key}`}
                      x={xx}
                      y={yy}
                      width={barWidth - 1}
                      height={Math.max(0, height - bottom - yy)}
                      rx="2"
                      fill={fill}
                    />
                  );
                });
              })}

          {rows.map((row, index) => {
            if (index % labelStep !== 0 && index !== rows.length - 1) return null;
            const rawLabel = row[chart.xKey];
            const label = rawLabel == null ? "" : String(rawLabel);
            return (
              <text
                key={`label-${index}`}
                x={chart.type === "bar"
                  ? left + ((index + 0.5) / Math.max(1, rows.length)) * (width - left - right)
                  : x(index)}
                y={height - 12}
                textAnchor="middle"
                fill="#86868b"
                fontSize="10"
              >
                {label.length > 12 ? `${label.slice(0, 11)}…` : label}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-black/[0.05] px-4 py-3">
        {chart.series.map((series, index) => (
          <div key={series.key} className="flex items-center gap-2 text-[11px] text-[#6e6e73]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: ["#0071e3", "#ff9f0a", "#05a66b", "#af52de"][index % 4] }}
            />
            {series.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const starters = [
  "What is driving sales over the last 30 days?",
  "Which products are closest to reorder risk?",
  "Chart revenue and ad spend for the last 60 days.",
  "Can we estimate gross margin with the data we have?",
];

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const contextLabel = useMemo(
    () => `${start} → ${end} · ${currency}`,
    [start, end, currency],
  );

  async function ask(text: string) {
    const question = text.trim();
    if (!question || status === "sending") return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setStatus("sending");

    try {
      const response = await fetch("/api/brht/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization,
          range,
          start,
          end,
          currency,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const payload = (await response.json()) as AnalystReply & {
        error?: string;
        setupRequired?: boolean;
      };

      if (!response.ok) {
        throw new Error(payload.error || "BRHT Analyst could not answer right now.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.answer,
          reply: payload,
        },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "BRHT Analyst could not answer right now.");
    } finally {
      setStatus("idle");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(0,0,0,.22)] transition hover:bg-black"
      >
        <Sparkles className="h-4 w-4 text-[#6fd3ff]" />
        Ask BRHT
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 p-0 backdrop-blur-[2px] sm:p-4">
          <div className="flex h-[88vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-black/[0.08] bg-[#f5f5f7] shadow-2xl sm:h-[760px] sm:max-h-[90vh] sm:w-[520px] sm:rounded-[26px]">
            <div className="flex items-center justify-between border-b border-black/[0.07] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1d1d1f] text-white">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#1d1d1f]">BRHT Analyst</div>
                  <div className="mt-0.5 text-[11px] text-[#86868b]">{contextLabel}</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f7] text-[#6e6e73] transition hover:bg-[#e5e5ea] hover:text-[#1d1d1f]"
                aria-label="Close BRHT Analyst"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              {messages.length === 0 ? (
                <div>
                  <div className="rounded-[22px] border border-black/[0.06] bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
                      <MessageSquareText className="h-4 w-4 text-[#0071e3]" />
                      Ask questions about the business, not just the dashboard.
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#6e6e73]">
                      I can work with the revenue, ad spend, product, inventory, Kickstarter and BackerKit data currently connected to BRHT. If a question needs data we do not have yet, I’ll tell you what source is missing.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {starters.map((starter) => (
                      <button
                        key={starter}
                        onClick={() => ask(starter)}
                        className="rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-left text-sm leading-5 text-[#3a3a3c] transition hover:border-[#0071e3]/30 hover:bg-[#fafdff]"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) =>
                    message.role === "user" ? (
                      <div key={index} className="flex justify-end">
                        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-[#0071e3] px-4 py-3 text-sm leading-6 text-white">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="rounded-[22px] border border-black/[0.06] bg-white p-4">
                        <div className="whitespace-pre-wrap text-sm leading-6 text-[#3a3a3c]">
                          {message.content}
                        </div>
                        {message.reply?.chart ? (
                          <InlineAnalystChart chart={message.reply.chart} currency={currency} />
                        ) : null}
                        {message.reply?.caveats?.length ? (
                          <div className="mt-4 border-t border-black/[0.055] pt-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868b]">
                              Data notes
                            </div>
                            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#86868b]">
                              {message.reply.caveats.map((caveat, caveatIndex) => (
                                <li key={caveatIndex}>• {caveat}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ),
                  )}
                  {status === "sending" ? (
                    <div className="flex items-center gap-2 px-1 text-xs text-[#86868b]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      BRHT is checking the data…
                    </div>
                  ) : null}
                </div>
              )}

              {error ? (
                <div className="mt-4 rounded-2xl border border-[#f0c36a] bg-[#fffaf0] px-4 py-3 text-xs leading-5 text-[#7a4a00]">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="border-t border-black/[0.07] bg-white p-3">
              <div className="rounded-[20px] border border-black/[0.09] bg-[#f9f9fb] p-2 focus-within:border-[#0071e3]/45">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      ask(draft);
                    }
                  }}
                  placeholder="Ask about sales, inventory, campaigns, reorders…"
                  rows={2}
                  className="max-h-32 min-h-12 w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-[#1d1d1f] outline-none placeholder:text-[#aeaeb2]"
                />
                <div className="flex items-center justify-between gap-3 px-1 pb-1">
                  <div className="text-[10px] text-[#aeaeb2]">
                    Grounded in connected BRHT data
                  </div>
                  <button
                    onClick={() => ask(draft)}
                    disabled={!draft.trim() || status === "sending"}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#1d1d1f] text-white transition disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label="Send question"
                  >
                    {status === "sending" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
