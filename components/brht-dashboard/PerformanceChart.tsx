import type { DailyPerformancePoint } from "@/lib/brht-dashboard/types";

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function chartGeometry(points: DailyPerformancePoint[]) {
  const width = 900;
  const height = 310;
  const left = 62;
  const right = 20;
  const top = 18;
  const bottom = 44;
  const max = Math.max(
    1,
    ...points.flatMap((point) => [point.revenue, point.adSpend]),
  );
  const paddedMax = max * 1.12;
  const x = (index: number) =>
    left +
    (index / Math.max(1, points.length - 1)) *
      (width - left - right);
  const y = (value: number) =>
    top + (height - top - bottom) * (1 - value / paddedMax);
  const line = (key: "revenue" | "adSpend") =>
    points.map((point, index) => `${x(index)},${y(point[key])}`).join(" ");
  const area = `M ${x(0)} ${height - bottom} L ${points
    .map((point, index) => `${x(index)} ${y(point.revenue)}`)
    .join(" L ")} L ${x(points.length - 1)} ${height - bottom} Z`;

  return { width, height, left, right, top, bottom, paddedMax, x, y, line, area };
}

export function PerformanceChart({ points }: { points: DailyPerformancePoint[] }) {
  if (points.length === 0) {
    return (
      <div className="grid h-[310px] place-items-center rounded-2xl border border-dashed border-black/10 bg-[#fafafa] text-center">
        <div>
          <div className="text-sm font-semibold text-[#1d1d1f]">No live time-series data yet</div>
          <div className="mt-1 text-xs text-[#6e6e73]">
            The chart will populate from daily_channel_metrics after the database is connected.
          </div>
        </div>
      </div>
    );
  }

  const chart = chartGeometry(points);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelStep = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div className="overflow-x-auto pb-1">
      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        className="min-w-[700px] w-full"
        role="img"
        aria-label="Sales revenue and advertising spend by day"
      >
        <defs>
          <linearGradient id="brhtRevenueArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0071e3" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y =
            chart.top +
            (chart.height - chart.top - chart.bottom) * (1 - tick);
          return (
            <g key={tick}>
              <line
                x1={chart.left}
                x2={chart.width - chart.right}
                y1={y}
                y2={y}
                stroke="#1d1d1f"
                strokeOpacity="0.08"
              />
              <text
                x={chart.left - 12}
                y={y + 4}
                textAnchor="end"
                fill="#6e6e73"
                fontSize="11"
              >
                {compactCurrency.format(chart.paddedMax * tick)}
              </text>
            </g>
          );
        })}

        <path d={chart.area} fill="url(#brhtRevenueArea)" />
        <polyline
          points={chart.line("revenue")}
          fill="none"
          stroke="#0071e3"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={chart.line("adSpend")}
          fill="none"
          stroke="#ff9f0a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="7 7"
        />

        {points.map((point, index) => {
          if (index % labelStep !== 0 && index !== points.length - 1) return null;
          const date = new Date(`${point.date}T00:00:00Z`);
          const label = new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          }).format(date);
          return (
            <text
              key={`${point.date}-${index}`}
              x={chart.x(index)}
              y={chart.height - 14}
              textAnchor="middle"
              fill="#86868b"
              fontSize="11"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
