import type { Metadata } from "next";
import { FableFuryDashboard } from "@/components/brht-dashboard/FableFuryDashboard";
import { getFableFuryDashboardData } from "@/lib/brht-dashboard/data";
import { normalizeDashboardRange } from "@/lib/brht-dashboard/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Fable Fury",
  description: "Private Fable Fury sales, marketing, product, inventory and data-health dashboard.",
};

type PageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

export default async function FableFuryDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = normalizeDashboardRange(params.range);
  const data = await getFableFuryDashboardData(range);
  return <FableFuryDashboard data={data} />;
}
