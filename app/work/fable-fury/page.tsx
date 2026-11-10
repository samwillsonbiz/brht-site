import type { Metadata } from "next";
import { FableFuryDashboard } from "@/components/brht/FableFuryDashboard";
import {
  getDemoFableFuryDashboardData,
  normalizeRange,
} from "@/lib/fableFuryAnalytics";

const description =
  "A BRHT case study showing how commerce, advertising and operating data becomes a reliable custom command centre.";

export const metadata: Metadata = {
  title: "Fable Fury Operating Intelligence",
  description,
  alternates: {
    canonical: "/work/fable-fury",
  },
  openGraph: {
    title: "Fable Fury Operating Intelligence | BRHT",
    description,
    url: "/work/fable-fury",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fable Fury Operating Intelligence | BRHT",
    description,
  },
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
