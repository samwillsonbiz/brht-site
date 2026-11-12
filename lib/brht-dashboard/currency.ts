import type { DashboardData } from "./types";

export type DashboardDisplayCurrency = "USD" | "AUD";

export function normalizeDisplayCurrency(value: string | string[] | null | undefined): DashboardDisplayCurrency {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "AUD" ? "AUD" : "USD";
}

export async function getUsdToAudRate(): Promise<number> {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=AUD", {
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`FX request failed: ${response.status}`);
    const payload = (await response.json()) as { rates?: { AUD?: number } };
    const rate = Number(payload?.rates?.AUD);
    if (Number.isFinite(rate) && rate > 0) return rate;
  } catch (error) {
    console.error("USD/AUD FX lookup failed; using fallback", error);
  }
  return 1.46;
}

function scaleMetric(metric: DashboardData["summary"]["revenue"], rate: number) {
  return {
    ...metric,
    value: metric.value === null ? null : metric.value * rate,
    previous: metric.previous === null ? null : metric.previous * rate,
  };
}

export function convertDashboardCurrency(
  data: DashboardData,
  target: DashboardDisplayCurrency,
  usdToAudRate: number,
): DashboardData {
  if (target === "USD" || data.organization.currency !== "USD") return data;

  const rate = usdToAudRate;

  return {
    ...data,
    organization: {
      ...data.organization,
      currency: "AUD",
    },
    summary: {
      ...data.summary,
      revenue: scaleMetric(data.summary.revenue, rate),
      adSpend: scaleMetric(data.summary.adSpend, rate),
      averageOrderValue: scaleMetric(data.summary.averageOrderValue, rate),
    },
    trend: data.trend.map((point) => ({
      ...point,
      revenue: point.revenue * rate,
      adSpend: point.adSpend * rate,
    })),
    channels: data.channels.map((channel) => ({
      ...channel,
      revenue: channel.revenue * rate,
      previousRevenue: channel.previousRevenue * rate,
      spend: channel.spend * rate,
      previousSpend: channel.previousSpend * rate,
    })),
    kickstarter: {
      campaigns: data.kickstarter.campaigns.map((campaign) => ({
        ...campaign,
        pledged: campaign.pledged * rate,
        goal: campaign.goal * rate,
        averagePledge: campaign.averagePledge * rate,
      })),
      trend: data.kickstarter.trend.map((point) => ({
        ...point,
        pledged: point.pledged * rate,
        dailyPledged: point.dailyPledged === null ? null : point.dailyPledged * rate,
      })),
    },
  };
}
