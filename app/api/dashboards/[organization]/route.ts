import { NextResponse, type NextRequest } from "next/server";
import { getOrganizationDashboardData } from "@/lib/brht-dashboard/data";
import { normalizeDashboardRange } from "@/lib/brht-dashboard/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ organization: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { organization } = await context.params;
  const range = normalizeDashboardRange(request.nextUrl.searchParams.get("range"));
  const data = await getOrganizationDashboardData(organization, range);
  return NextResponse.json(data, {
    status: data.connection === "not-found" ? 404 : 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
