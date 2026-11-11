import type { DailyPerformancePoint } from "@/lib/brht-dashboard/types";

type MetricKey = "orders" | "unitsSold" | "roas";

function valueFor(point: DailyPerformancePoint, metric: MetricKey) {
  if (metric === "orders") return point.orders;
  if (metric === "unitsSold") return point.unitsSold;
  return point.adSpend > 0 ? point.revenue / point.adSpend : 0;
}

function formatValue(value: number, metric: MetricKey) {
  if (metric === "roas") return `${value.toFixed(1)}x`;
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function MetricTrendChart({
  points,
  metric,
}: {
  points: DailyPerformancePoint[];
  metric: MetricKey;
}) {
  if (points.length === 0) {
    return <div className="grid h-44 place-items-center text-xs text-[#86868b]">No trend data yet</div>;
  }

  const width = 520;
  const height = 190;
  const left = 44;
  const right = 14;
  const top = 14;
  const bottom = 34;
  const values = points.map((point) => valueFor(point, metric));
  const max = Math.max(1, ...values);
  const paddedMax = max * 1.12;
  const x = (index: number) =>
    left + (index / Math.max(1, points.length - 1)) * (width - left - right);
  const y = (value: number) =>
    top + (height - top - bottom) * (1 - value / paddedMax);
  const line = points.map((point, index) => `${x(index)},${y(valueFor(point, metric))}`).join(" ");
  const labelStep = Math.max(1, Math.ceil(points.length / 4));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[420px] w-full" role="img">
        {[0, 0.5, 1].map((tick) => {
          const yy = top + (height - top - bottom) * (1 - tick);
          return (
            <g key={tick}>
              <line x1={left} x2={width - right} y1={yy} y2={yy} stroke="#1d1d1f" strokeOpacity="0.08" />
              <text x={left - 9} y={yy + 4} textAnchor="end" fill="#86868b" fontSize="10">
                {formatValue(paddedMax * tick, metric)}
              </text>
            </g>
          );
        })}
        <polyline
          points={line}
          fill="none"
          stroke="#0071e3"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => {
          if (index % labelStep !== 0 && index !== points.length - 1) return null;
          const label = new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          }).format(new Date(`${point.date}T00:00:00Z`));
          return (
            <text key={point.date} x={x(index)} y={height - 10} textAnchor="middle" fill="#86868b" fontSize="10">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
