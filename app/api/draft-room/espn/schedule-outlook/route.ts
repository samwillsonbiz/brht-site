import type { NextRequest } from "next/server";
import { GET as getOutlook } from "@/app/api/fantasy/espn/schedule-outlook/route";

export const dynamic = "force-dynamic";

// Expose only the existing read-only Weeks 1–6 outlook.
export async function GET(request: NextRequest) {
  return getOutlook(request);
}
