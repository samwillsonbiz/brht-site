import { NextRequest, NextResponse } from "next/server";
import {
  fetchPlayerMarket,
  latestPlayerMarketSync,
  persistPlayerMarket,
} from "@/lib/fantasyPlayerMarket";
import { isSupabaseConfigured } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

function trustedBrowserRequest(request: NextRequest) {
  const candidate = request.headers.get("origin") || request.headers.get("referer");
  if (!candidate) return false;
  try {
    const host = new URL(candidate).hostname.toLowerCase();
    return host === "brht.ai" || host === "www.brht.ai" || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function authorized(request: NextRequest) {
  const configured = process.env.FANTASY_ADMIN_SYNC_TOKEN;
  const supplied = request.headers.get("x-fantasy-admin-token");
  if (configured && supplied === configured) return true;
  return trustedBrowserRequest(request);
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  try {
    const latest = await latestPlayerMarketSync();
    return NextResponse.json({
      ok: true,
      lastSyncAt: latest?.completed_at ?? latest?.started_at ?? null,
      detail: latest?.detail ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to read player-market sync status.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { ok: false, message: "Sync request was not authorized." },
      { status: 401 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  try {
    const previous = await latestPlayerMarketSync();
    const previousAt = previous?.completed_at ?? previous?.started_at ?? null;
    const elapsedMs = previousAt
      ? Date.now() - new Date(previousAt).getTime()
      : Number.POSITIVE_INFINITY;
    const shouldPersist = !Number.isFinite(elapsedMs) || elapsedMs >= 5 * 60_000;

    const { entries, players } = await fetchPlayerMarket(1000);

    let persistedAt = previousAt;
    let snapshotCount = 0;

    if (shouldPersist) {
      const persisted = await persistPlayerMarket(entries, "draft-room-refresh");
      persistedAt = persisted.capturedAt;
      snapshotCount = persisted.snapshotCount;
    }

    return NextResponse.json({
      ok: true,
      source: "espn",
      count: players.length,
      players,
      persisted: shouldPersist,
      persistedAt,
      snapshotCount,
      message: shouldPersist
        ? "Current ESPN player market saved to Supabase."
        : "Current ESPN data loaded; durable snapshot was refreshed less than five minutes ago.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "espn",
        message:
          error instanceof Error
            ? error.message
            : "Unable to refresh ESPN player market.",
      },
      { status: 500 },
    );
  }
}
