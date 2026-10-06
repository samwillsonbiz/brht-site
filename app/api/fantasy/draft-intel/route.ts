import { NextRequest, NextResponse } from "next/server";
import { getEspnFantasyConfig } from "@/lib/espnFantasy";
import { isSupabaseConfigured, selectRows } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Draft intelligence database is not configured." },
      { status: 503 },
    );
  }

  const config = getEspnFantasyConfig();
  const playerIdRaw = request.nextUrl.searchParams.get("playerId");
  const playerId = playerIdRaw ? Number(playerIdRaw) : null;

  try {
    const intel = await selectRows("fantasy_draft_intel", {
      select:
        "espn_player_id,recommendation,rank_adjustment,custom_rank,draft_at_low,draft_at_high,first_six_grade,confidence,summary,updated_at",
      espn_league_id: `eq.${config.leagueId}`,
      order: "custom_rank.asc.nullslast,rank_adjustment.desc",
    });

    let updates: unknown[] = [];
    if (playerId && Number.isFinite(playerId)) {
      updates = (await selectRows("fantasy_draft_intel_updates", {
        select:
          "id,espn_player_id,observed_at,source_title,source_url,source_type,analysis,adjustment_delta,confidence,created_at",
        espn_league_id: `eq.${config.leagueId}`,
        espn_player_id: `eq.${playerId}`,
        order: "observed_at.desc",
        limit: "20",
      })) as unknown[];
    }

    return NextResponse.json({
      ok: true,
      leagueId: config.leagueId,
      intel,
      updates,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load draft intelligence.",
      },
      { status: 500 },
    );
  }
}
