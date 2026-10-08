import { NextResponse } from "next/server";
import { fetchPlayerMarket, latestPlayerMarketSync } from "@/lib/fantasyPlayerMarket";

export const dynamic = "force-dynamic";

/**
 * Public read-only market view for the standalone Draft Room.
 * Unlike /api/fantasy/sync/player-market, this never writes snapshots or
 * triggers a privileged database sync from an unauthenticated browser.
 */
export async function GET() {
  try {
    const { players } = await fetchPlayerMarket(1000);
    let persistedAt: string | null = null;
    try {
      const latest = await latestPlayerMarketSync();
      persistedAt = latest?.completed_at ?? latest?.started_at ?? null;
    } catch {
      // Live ESPN data remains useful even when stored sync metadata is unavailable.
    }
    return NextResponse.json(
      { ok: true, source: "espn", count: players.length, players, persisted: false, persistedAt },
      { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to load the ESPN player market." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
