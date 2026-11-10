import type { Metadata } from "next";
import { FableFuryDashboard } from "@/components/brht/FableFuryDashboard";
import {
  getFableFuryDashboardData,
  normalizeRange,
} from "@/lib/fableFuryAnalytics";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Fable Fury Command Centre",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type PageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

export default async function FableFuryOperationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = normalizeRange(params.range);
  const data = await getFableFuryDashboardData(range);

  return (
    <FableFuryDashboard
      data={data}
      basePath="/ops/fable-fury"
    />
  );
}
