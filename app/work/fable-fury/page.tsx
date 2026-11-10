import type { Metadata } from "next";
import { FableFuryDashboard } from "@/components/brht/FableFuryDashboard";
import {
  getDemoFableFuryDashboardData,
  normalizeRange,
} from "@/lib/fableFuryAnalytics";

export const metadata: Metadata = {
  title: "Fable Fury Operating Intelligence",
  description:
    "A BRHT case study showing how commerce, advertising and operating data becomes a reliable custom command centre.",
};

type PageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

export default async function FableFuryCaseStudyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = normalizeRange(params.range);
  const data = getDemoFableFuryDashboardData(range);

  return (
    <FableFuryDashboard
      data={data}
      basePath="/work/fable-fury"
      publicView
    />
  );
}
