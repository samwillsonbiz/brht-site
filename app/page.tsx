import type { Metadata } from "next";
import HomePage from "@/components/marketing/HomePage";
import { toHomeDemo } from "@/components/marketing/home-data";
import { getOrganizationDashboardData } from "@/lib/brht-dashboard/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: {
    absolute: "BRHT Intelligence — Business Intelligence, Automation & AI",
  },
  description:
    "BRHT connects scattered business systems into a custom intelligence layer: live dashboards, workflow automation and AI built around how your company actually operates.",
  alternates: { canonical: "https://www.brht.ai" },
};

export default async function Page() {
  let demo = null;
  try {
    demo = toHomeDemo(await getOrganizationDashboardData("fable-fury", "max"));
  } catch {
    // The marketing page stays available even if the data service fails.
  }
  return <HomePage demo={demo} />;
}
