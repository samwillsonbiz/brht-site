import { NextResponse } from "next/server";
import { isSupabaseConfigured, selectRows } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "Supabase environment variables are not configured.",
      },
      { status: 503 },
    );
  }

  try {
    const [leagues, teams, players, nbaTeams, games, assignments, syncRuns] =
      await Promise.all([
        selectRows("fantasy_leagues", { select: "espn_league_id" }),
        selectRows("fantasy_teams", { select: "id" }),
        selectRows("fantasy_players", { select: "espn_player_id" }),
        selectRows("nba_teams", { select: "espn_team_id" }),
        selectRows("nba_games", { select: "espn_event_id" }),
        selectRows("fantasy_roster_assignments", { select: "id" }),
        selectRows("fantasy_sync_runs", {
          select: "sync_type,started_at,completed_at,success,detail",
          order: "started_at.desc",
          limit: "1",
        }),
      ]);

    return NextResponse.json({
      ok: true,
      configured: true,
      counts: {
        leagues: Array.isArray(leagues) ? leagues.length : 0,
        fantasyTeams: Array.isArray(teams) ? teams.length : 0,
        players: Array.isArray(players) ? players.length : 0,
        nbaTeams: Array.isArray(nbaTeams) ? nbaTeams.length : 0,
        nbaGames: Array.isArray(games) ? games.length : 0,
        rosterAssignments: Array.isArray(assignments) ? assignments.length : 0,
      },
      lastSync: Array.isArray(syncRuns) ? syncRuns[0] ?? null : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        message: error instanceof Error ? error.message : "Database status check failed.",
      },
      { status: 500 },
    );
  }
}
