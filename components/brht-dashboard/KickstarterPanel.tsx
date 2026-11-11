import { Rocket, Users, Target, TrendingUp } from "lucide-react";
import type { KickstarterData } from "@/lib/brht-dashboard/types";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function KickstarterPanel({
  data,
  currency,
}: {
  data: KickstarterData;
  currency: string;
}) {
  const active = data.campaigns.find((campaign) => campaign.status === "live") ?? data.campaigns[0];
  const activeTrend = active
    ? data.trend.filter((point) => point.campaignKey === active.campaignKey)
    : [];

  const width = 760;
  const height = 250;
  const left = 56;
  const right = 16;
  const top = 18;
  const bottom = 38;
  const max = Math.max(1, ...activeTrend.map((point) => point.pledged));
  const paddedMax = max * 1.08;
  const x = (index: number) =>
    left + (index / Math.max(1, activeTrend.length - 1)) * (width - left - right);
  const y = (value: number) =>
    top + (height - top - bottom) * (1 - value / paddedMax);
  const line = activeTrend.map((point, index) => `${x(index)},${y(point.pledged)}`).join(" ");

  if (data.campaigns.length === 0) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/10 bg-white p-8 text-center text-sm text-[#86868b]">
        Kickstarter data will appear when the campaign source is connected.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {active ? (
          <>
            <div className="rounded-[22px] border border-black/[0.06] bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.11em] text-[#86868b]">
                Live pledged <Rocket className="h-4 w-4 text-[#0071e3]" />
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{money(active.pledged, currency)}</div>
              <div className="mt-2 text-xs text-[#86868b]">{active.name}</div>
            </div>
            <div className="rounded-[22px] border border-black/[0.06] bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.11em] text-[#86868b]">
                Backers <Users className="h-4 w-4 text-[#0071e3]" />
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{number.format(active.backers)}</div>
              <div className="mt-2 text-xs text-[#86868b]">Avg pledge {money(active.averagePledge, currency)}</div>
            </div>
            <div className="rounded-[22px] border border-black/[0.06] bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.11em] text-[#86868b]">
                Goal multiple <Target className="h-4 w-4 text-[#0071e3]" />
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                {active.goal > 0 ? `${(active.pledged / active.goal).toFixed(1)}x` : "—"}
              </div>
              <div className="mt-2 text-xs text-[#86868b]">Goal {money(active.goal, currency)}</div>
            </div>
            <div className="rounded-[22px] border border-black/[0.06] bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.11em] text-[#86868b]">
                Time remaining <TrendingUp className="h-4 w-4 text-[#0071e3]" />
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                {active.daysRemaining === null ? "—" : `${number.format(active.daysRemaining)} days`}
              </div>
              <div className="mt-2 text-xs text-[#86868b]">Campaign ends {active.endDate ?? "—"}</div>
            </div>
          </>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
          <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Campaign trajectory</div>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Cumulative Kickstarter funding</h3>
          {activeTrend.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px] w-full">
                {[0, 0.5, 1].map((tick) => {
                  const yy = top + (height - top - bottom) * (1 - tick);
                  return (
                    <g key={tick}>
                      <line x1={left} x2={width - right} y1={yy} y2={yy} stroke="#1d1d1f" strokeOpacity="0.08" />
                      <text x={left - 10} y={yy + 4} textAnchor="end" fill="#86868b" fontSize="10">
                        {money(paddedMax * tick, currency)}
                      </text>
                    </g>
                  );
                })}
                <polyline points={line} fill="none" stroke="#05a66b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {activeTrend.map((point, index) => {
                  const label = new Intl.DateTimeFormat("en-AU", {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  }).format(new Date(`${point.date}T00:00:00Z`));
                  return (
                    <g key={point.date}>
                      <circle cx={x(index)} cy={y(point.pledged)} r="4" fill="#05a66b" />
                      <text x={x(index)} y={height - 10} textAnchor="middle" fill="#86868b" fontSize="10">{label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="grid h-52 place-items-center text-xs text-[#86868b]">No campaign trend snapshots yet.</div>
          )}
        </article>

        <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.04)] sm:p-7">
          <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#86868b]">Campaign history</div>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Fable Fury crowdfunding</h3>
          <div className="mt-5 divide-y divide-black/[0.055]">
            {data.campaigns.map((campaign) => (
              <div key={campaign.campaignKey} className="py-4 first:pt-0 last:pb-0">
                <div className="text-sm font-semibold">{campaign.name}</div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-[#86868b]">
                  <div><span className="block font-semibold text-[#1d1d1f]">{money(campaign.pledged, currency)}</span> pledged</div>
                  <div><span className="block font-semibold text-[#1d1d1f]">{number.format(campaign.backers)}</span> backers</div>
                  <div><span className="block font-semibold text-[#1d1d1f]">{money(campaign.averagePledge, currency)}</span> avg pledge</div>
                  <div><span className="block font-semibold text-[#1d1d1f]">{campaign.status}</span> status</div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
