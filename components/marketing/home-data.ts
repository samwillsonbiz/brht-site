import type { DashboardData } from "@/lib/brht-dashboard/types";

export type HomeDemoData = {
  currency: string;
  revenue: number | null;
  adSpend: number | null;
  orders: number | null;
  healthySources: number;
  totalSources: number;
  generatedAt: string;
  revenueChannels: Array<{ name: string; revenue: number }>;
  inventoryProducts: Array<{
    name: string;
    available: number | null;
    daysOfCover: number | null;
  }>;
};

/** Only public, aggregated case-study values cross the marketing boundary. */
export function toHomeDemo(data: DashboardData): HomeDemoData | null {
  if (
    data.connection !== "connected" ||
    data.error ||
    data.summary.revenue.value === null
  )
    return null;
  return {
    currency: data.organization.currency,
    revenue: data.summary.revenue.value,
    adSpend: data.summary.adSpend.value,
    orders: data.summary.orders.value,
    healthySources: data.dataHealth.filter(
      (source) => source.status === "healthy",
    ).length,
    totalSources: data.dataHealth.length,
    generatedAt: data.generatedAt,
    revenueChannels: data.channels
      .filter(
        (channel) => channel.kind !== "paid-media" && channel.revenue !== 0,
      )
      .map((channel) => ({ name: channel.channel, revenue: channel.revenue }))
      .sort((a, b) => b.revenue - a.revenue),
    inventoryProducts: data.products
      .filter((product) => product.availableQuantity !== null)
      .map((product) => ({
        name: product.productName,
        available: product.availableQuantity,
        daysOfCover: product.daysOfCover,
      }))
      .sort((a, b) => (a.daysOfCover ?? Infinity) - (b.daysOfCover ?? Infinity))
      .slice(0, 2),
  };
}
