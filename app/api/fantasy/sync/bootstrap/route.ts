import { NextRequest, NextResponse } from "next/server";
import {
  fetchEspnFantasyLeague,
  fetchEspnPlayerPool,
  getEspnFantasyConfig,
  teamDisplayName,
} from "@/lib/espnFantasy";
import { fetchNbaSchedule } from "@/lib/espnNba";
import {
  insertRows,
  isSupabaseConfigured,
  upsertRows,
} from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

function validDate(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function defaultDates() {
  const from = new Date();
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 56);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function authorized(request: NextRequest) {
  const configured = process.env.FANTASY_ADMIN_SYNC_TOKEN;
  if (!configured) return false;
  const supplied = request.headers.get("x-fantasy-admin-token");
  return supplied === configured;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Admin sync is disabled or the supplied x-fantasy-admin-token is invalid.",
      },
      { status: 401 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  const defaults = defaultDates();
  const fromParam = request.nextUrl.searchParams.get("from");
  const toParam = request.nextUrl.searchParams.get("to");
  const from = validDate(fromParam) ? fromParam! : defaults.from;
  const to = validDate(toParam) ? toParam! : defaults.to;
  const startedAt = new Date().toISOString();

  try {
    const config = getEspnFantasyConfig();
    const [{ league, rosterScoringPeriodId }, playerPool, games] =
      await Promise.all([
        fetchEspnFantasyLeague(config),
        fetchEspnPlayerPool({ limit: 1000, scoringPeriodId: 0 }),
        fetchNbaSchedule(from, to),
      ]);

    await upsertRows(
      "fantasy_leagues",
      [
        {
          espn_league_id: Number(config.leagueId),
          season_id: Number(config.seasonId),
          name: league.settings?.name ?? null,
          my_team_espn_id: Number(config.teamId),
          scoring_period_id: league.scoringPeriodId ?? rosterScoringPeriodId,
          current_matchup_period: league.status?.currentMatchupPeriod ?? null,
          draft_completed: Boolean(league.draftDetail?.drafted),
          updated_at: new Date().toISOString(),
        },
      ],
      "espn_league_id",
    );

    await upsertRows(
      "fantasy_teams",
      (league.teams ?? []).map((team) => ({
        espn_league_id: Number(config.leagueId),
        espn_team_id: team.id,
        name: teamDisplayName(team),
        abbreviation: team.abbrev ?? null,
        owner_name: null,
        is_my_team: String(team.id) === config.teamId,
        updated_at: new Date().toISOString(),
      })),
      "espn_league_id,espn_team_id",
    );

    const nbaTeams = new Map<
      number,
      { espn_team_id: number; abbreviation: string | null; display_name: string | null; updated_at: string }
    >();
    for (const game of games) {
      for (const team of [game.home, game.away]) {
        if (team.id !== null) {
          nbaTeams.set(team.id, {
            espn_team_id: team.id,
            abbreviation: team.abbreviation,
            display_name: team.displayName,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
    for (const entry of playerPool) {
      const id = entry.player?.proTeamId;
      if (id && !nbaTeams.has(id)) {
        nbaTeams.set(id, {
          espn_team_id: id,
          abbreviation: null,
          display_name: null,
          updated_at: new Date().toISOString(),
        });
      }
    }
    await upsertRows("nba_teams", Array.from(nbaTeams.values()), "espn_team_id");

    const players = playerPool
      .filter((entry) => entry.player?.id && entry.player?.fullName)
      .map((entry) => ({
        espn_player_id: entry.player!.id,
        full_name: entry.player!.fullName,
        first_name: entry.player!.firstName ?? null,
        last_name: entry.player!.lastName ?? null,
        nba_team_espn_id: entry.player!.proTeamId || null,
        default_position_id: entry.player!.defaultPositionId ?? null,
        eligible_slots: entry.player!.eligibleSlots ?? [],
        injury_status: entry.player!.injuryStatus ?? null,
        injured: Boolean(entry.player!.injured),
        percent_owned:
          entry.player!.ownership?.percentOwned ?? entry.player!.percentOwned ?? null,
        percent_started:
          entry.player!.ownership?.percentStarted ??
          entry.player!.percentStarted ??
          null,
        average_draft_position:
          entry.player!.ownership?.averageDraftPosition ?? null,
        auction_value_average:
          entry.player!.ownership?.auctionValueAverage ?? null,
        updated_at: new Date().toISOString(),
      }));
    await upsertRows("fantasy_players", players, "espn_player_id");

    await upsertRows(
      "nba_games",
      games.map((game) => ({
        espn_event_id: game.id,
        game_date_et: game.gameDateEt,
        tipoff_at: game.tipoffAt,
        home_team_espn_id: game.home.id,
        away_team_espn_id: game.away.id,
        status: game.status,
        completed: game.completed,
        updated_at: new Date().toISOString(),
      })),
      "espn_event_id",
    );

    await insertRows("fantasy_sync_runs", [
      {
        sync_type: "bootstrap",
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        success: true,
        rows_affected:
          (league.teams?.length ?? 0) + players.length + games.length,
        detail: {
          from,
          to,
          teams: league.teams?.length ?? 0,
          players: players.length,
          games: games.length,
          drafted: Boolean(league.draftDetail?.drafted),
        },
      },
    ]);

    return NextResponse.json({
      ok: true,
      from,
      to,
      league: league.settings?.name ?? null,
      drafted: Boolean(league.draftDetail?.drafted),
      synced: {
        fantasyTeams: league.teams?.length ?? 0,
        players: players.length,
        nbaTeams: nbaTeams.size,
        nbaGames: games.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Bootstrap sync failed.",
      },
      { status: 500 },
    );
  }
}
