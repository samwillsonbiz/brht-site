import type { NextRequest } from "next/server";
import { GET as getPlayers } from "@/app/api/fantasy/espn/players/route";

export const dynamic = "force-dynamic";

// Expose only the existing read-only player list on the standalone Draft Room.
export async function GET(request: NextRequest) {
  return getPlayers(request);
}
