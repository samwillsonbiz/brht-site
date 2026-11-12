import HomePage, { type HomeDemoData } from "@/components/marketing/HomePage";
import { getOrganizationDashboardData } from "@/lib/brht-dashboard/data";

export const revalidate = 60;

export default async function Page() {
  const data = await getOrganizationDashboardData("fable-fury", "max");

  const revenueChannels = data.channels
    .filter((channel) => channel.kind !== "paid-media" && channel.revenue > 0)
    .map((channel) => ({ name: channel.channel, revenue: channel.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const inventoryProducts = data.products
    .map((product) => ({
      name: product.productName,
      available: product.availableQuantity,
      daysOfCover: product.daysOfCover,
    }))
    .sort((a, b) => (a.daysOfCover ?? Number.POSITIVE_INFINITY) - (b.daysOfCover ?? Number.POSITIVE_INFINITY));

  const demo: HomeDemoData = {
    revenue: data.summary.revenue.value ?? 0,
    adSpend: data.summary.adSpend.value ?? 0,
    orders: data.summary.orders.value ?? 0,
    units: data.summary.unitsSold.value ?? 0,
    healthySources: data.dataHealth.filter((source) => source.status === "healthy").length,
    revenueChannels,
    inventoryProducts,
  };

  return <HomePage demo={demo} />;
}
