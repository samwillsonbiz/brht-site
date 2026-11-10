import { NextResponse, type NextRequest } from "next/server";
import { getFableFuryDashboardData } from "@/lib/brht-dashboard/data";
import { normalizeDashboardRange } from "@/lib/brht-dashboard/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const range = normalizeDashboardRange(request.nextUrl.searchParams.get("range") ?? undefined);
  const data = await getFableFuryDashboardData(range);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
