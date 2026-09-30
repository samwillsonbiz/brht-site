import { NextResponse } from "next/server";
import {
  fetchEspnFantasyLeague,
  getEspnFantasyConfig,
  teamDisplayName,
} from "@/lib/espnFantasy";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getEspnFantasyConfig();

  try {
    const { league, authenticated, rosterScoringPeriodId } =
      await fetchEspnFantasyLeague(config);
    const teams = league.teams ?? [];
    const myTeam = teams.find((team) => String(team.id) === config.teamId);
    const drafted = league.draftDetail?.drafted ?? null;

    return NextResponse.json({
      ok: true,
      source: "espn",
      authenticated,
      league: {
        id: league.id ?? Number(config.leagueId),
        seasonId: league.seasonId ?? Number(config.seasonId),
        name: league.settings?.name ?? null,
        scoringPeriodId: league.scoringPeriodId ?? null,
        rosterScoringPeriodId,
        currentMatchupPeriod: league.status?.currentMatchupPeriod ?? null,
        teamCount: teams.length,
      },
      draft: {
        drafted,
        inProgress: league.draftDetail?.inProgress ?? null,
        completeDate: league.draftDetail?.completeDate ?? null,
        pickCount: league.draftDetail?.picks?.length ?? 0,
      },
      rosterStatus:
        drafted === false
          ? "League has not drafted yet. ESPN rosters will remain empty until the draft is completed."
          : myTeam?.roster?.entries?.length
            ? "Roster loaded from ESPN."
            : "ESPN returned no roster entries for the current scoring period.",
      myTeam: myTeam
        ? {
            id: myTeam.id,
            name: teamDisplayName(myTeam),
            abbreviation: myTeam.abbrev ?? null,
            rosterCount: myTeam.roster?.entries?.length ?? 0,
            roster: (myTeam.roster?.entries ?? []).map((entry) => ({
              playerId: entry.playerId ?? entry.playerPoolEntry?.player?.id ?? null,
              name: entry.playerPoolEntry?.player?.fullName ?? null,
              proTeamId: entry.playerPoolEntry?.player?.proTeamId ?? null,
              defaultPositionId:
                entry.playerPoolEntry?.player?.defaultPositionId ?? null,
              eligibleSlots: entry.playerPoolEntry?.player?.eligibleSlots ?? [],
              injuryStatus: entry.playerPoolEntry?.player?.injuryStatus ?? null,
              lineupSlotId: entry.lineupSlotId ?? null,
              acquisitionDate: entry.acquisitionDate ?? null,
              acquisitionType: entry.acquisitionType ?? null,
            })),
          }
        : null,
      teams: teams.map((team) => ({
        id: team.id ?? null,
        name: teamDisplayName(team),
        abbreviation: team.abbrev ?? null,
        rosterCount: team.roster?.entries?.length ?? 0,
      })),
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status) || 502
        : 502;
    const requiresAuth = status === 401 || status === 403;

    return NextResponse.json(
      {
        ok: false,
        source: "espn",
        leagueId: config.leagueId,
        seasonId: config.seasonId,
        teamId: config.teamId,
        requiresAuth,
        message: requiresAuth
          ? "ESPN requires private-league authentication. Add ESPN_SWID and ESPN_S2 as server-only environment variables."
          : "Unable to reach ESPN fantasy data right now.",
      },
      { status },
    );
  }
}
