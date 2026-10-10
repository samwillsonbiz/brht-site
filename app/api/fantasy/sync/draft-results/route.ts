import { NextRequest, NextResponse } from "next/server";
import {
  fetchEspnFantasyLeague,
  getEspnFantasyConfig,
  teamDisplayName,
} from "@/lib/espnFantasy";
import { isSupabaseConfigured, upsertRows } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const configured = process.env.FANTASY_ADMIN_SYNC_TOKEN;
  const supplied = request.headers.get("x-fantasy-admin-token");
  if (configured && supplied === configured) return true;

  const candidate = request.headers.get("origin") || request.headers.get("referer");
  if (!candidate) return false;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" &&
      (url.hostname === "brht.ai" || url.hostname === "www.brht.ai");
  } catch {
    return false;
  }
}

/**
 * Snapshot the actual completed ESPN draft into a private Supabase table.
 * Never return other managers' picks on this endpoint.
 * RLS + explicit revoked client access keep the snapshot server-side.
 */
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "Not authorized." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "Draft database unavailable." }, { status: 503 });
  }

  try {
    const config = getEspnFantasyConfig();
    const { league } = await fetchEspnFantasyLeague(config);
    const picks = league.draftDetail?.picks ?? [];
    if (!league.draftDetail?.drafted || picks.length === 0) {
      return NextResponse.json(
        { ok: false, message: "ESPN has not returned a completed draft." },
        { status: 409 },
      );
    }
    const rosters = new Map<number, string>();
    for (const team of league.teams ?? []) {
      for (const entry of team.roster?.entries ?? []) {
        const id = entry.playerId ?? entry.playerPoolEntry?.player?.id;
        const name = entry.playerPoolEntry?.player?.fullName;
        if (id && name) rosters.set(id, name);
      }
    }

    const rows = picks
      .filter((pick) =>
        Number.isInteger(pick.overallPickNumber) &&
        Number.isInteger(pick.teamId) &&
        Number.isInteger(pick.playerId))
      .map((pick) => ({
        espn_league_id: Number(config.leagueId),
        overall_pick_number: pick.overallPickNumber!,
        round_id: pick.roundId ?? null,
        round_pick_number: pick.roundPickNumber ?? null,
        fantasy_team_espn_id: pick.teamId!,
        espn_player_id: pick.playerId!,
        player_name: rosters.get(pick.playerId!) ?? null,
        drafted_at: league.draftDetail?.completeDate
          ? new Date(league.draftDetail.completeDate).toISOString()
          : null,
        synced_at: new Date().toISOString(),
      }));

    if (rows.length !== picks.length) {
      return NextResponse.json(
        { ok: false, message: "ESPN returned incomplete draft-pick identifiers." },
        { status: 502 },
      );
    }

    await upsertRows("fantasy_leagues", [{
      espn_league_id: Number(config.leagueId),
      season_id: Number(config.seasonId),
      name: league.settings?.name ?? null,
      my_team_espn_id: Number(config.teamId),
      scoring_period_id: league.scoringPeriodId ?? 0,
      current_matchup_period: league.status?.currentMatchupPeriod ?? null,
      draft_completed: true,
      updated_at: new Date().toISOString(),
    }], "espn_league_id");

    if (league.teams?.length) {
      await upsertRows("fantasy_teams", league.teams.map((team) => ({
        espn_league_id: Number(config.leagueId),
        espn_team_id: team.id,
        name: teamDisplayName(team),
        abbreviation: team.abbrev ?? null,
        is_my_team: String(team.id) === config.teamId,
        updated_at: new Date().toISOString(),
      })), "espn_league_id,espn_team_id");
    }

    await upsertRows("fantasy_draft_picks", rows, "espn_league_id,overall_pick_number");

    return NextResponse.json({
      ok: true, drafted: true, teamCount: league.teams?.length ?? 0,
      picksSaved: rows.length, unnamedPicks: rows.filter((pick) => !pick.player_name).length,
      lastPick: Math.max(...rows.map((pick) => pick.overall_pick_number)),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Could not retrieve or save the completed ESPN draft." },
      { status: 502 },
    );
  }
}
