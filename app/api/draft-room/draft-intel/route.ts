import type { NextRequest } from "next/server";
import { GET as getDraftIntel } from "@/app/api/fantasy/draft-intel/route";

export const dynamic = "force-dynamic";

// Reuse the Fantasy Lab read-only dossier endpoint without opening /api/fantasy.
export async function GET(request: NextRequest) {
  return getDraftIntel(request);
}
