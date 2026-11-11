import type { Metadata } from "next";
import { BusinessDashboard } from "@/components/brht-dashboard/BusinessDashboard";
import { getOrganizationDashboardData } from "@/lib/brht-dashboard/data";
import { normalizeDashboardRange } from "@/lib/brht-dashboard/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ organization: string }>;
  searchParams: Promise<{ range?: string | string[] }>;
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
  const range = normalizeDashboardRange(query.range);
  const data = await getOrganizationDashboardData(organization, range);
  return <BusinessDashboard data={data} />;
}
