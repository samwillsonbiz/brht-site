import type { Metadata } from "next";
import { BusinessDashboard } from "@/components/brht-dashboard/BusinessDashboard";
import { getOrganizationDashboardData } from "@/lib/brht-dashboard/data";
import { normalizeDashboardRange } from "@/lib/brht-dashboard/types";
import {
  convertDashboardCurrency,
  getUsdToAudRate,
  normalizeDisplayCurrency,
} from "@/lib/brht-dashboard/currency";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ organization: string }>;
  searchParams: Promise<{
    range?: string | string[];
    start?: string | string[];
    end?: string | string[];
    currency?: string | string[];
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { organization } = await params;
  return {
    title: organization
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    description: "Private sales, marketing, product, inventory and data-health dashboard.",
  };
}

export default async function OrganizationDashboardPage({
  params,
  searchParams,
}: PageProps) {
  const [{ organization }, query] = await Promise.all([params, searchParams]);
  const rawStart = Array.isArray(query.start) ? query.start[0] : query.start;
  const rawEnd = Array.isArray(query.end) ? query.end[0] : query.end;
  const validDate = (value: string | undefined) =>
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
  const start = validDate(rawStart);
  const end = validDate(rawEnd);
  const range = start && end ? "custom" : normalizeDashboardRange(query.range);
  const displayCurrency = normalizeDisplayCurrency(query.currency);
  const baseData = await getOrganizationDashboardData(organization, range, start, end);
  const usdToAudRate = displayCurrency === "AUD" ? await getUsdToAudRate() : 1;
  const data = convertDashboardCurrency(baseData, displayCurrency, usdToAudRate);
  return <BusinessDashboard data={data} fxRate={usdToAudRate} />;
}
