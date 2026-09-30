const ESPN_BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba";

export type EspnFantasyConfig = {
  leagueId: string;
  seasonId: string;
  teamId: string;
  swid?: string;
  espnS2?: string;
};

export type EspnFantasyRosterEntry = {
  playerId?: number;
  lineupSlotId?: number;
  acquisitionDate?: number;
  acquisitionType?: string;
  playerPoolEntry?: {
    player?: {
      id?: number;
      fullName?: string;
      proTeamId?: number;
      defaultPositionId?: number;
      eligibleSlots?: number[];
      injuryStatus?: string;
    };
  };
};

export type EspnFantasyTeam = {
  id?: number;
  abbrev?: string;
  location?: string;
  nickname?: string;
  name?: string;
  owners?: string[];
  primaryOwner?: string;
  roster?: {
    entries?: EspnFantasyRosterEntry[];
  };
};

export type EspnFantasyLeague = {
  id?: number;
  seasonId?: number;
  scoringPeriodId?: number;
  status?: { currentMatchupPeriod?: number };
  settings?: { name?: string };
  draftDetail?: {
    drafted?: boolean;
    inProgress?: boolean;
    completeDate?: number;
    picks?: Array<{
      id?: number;
      playerId?: number;
      teamId?: number;
      overallPickNumber?: number;
      roundId?: number;
      roundPickNumber?: number;
    }>;
  };
  teams?: EspnFantasyTeam[];
};

export function getEspnFantasyConfig(): EspnFantasyConfig {
  return {
    leagueId: process.env.ESPN_FANTASY_LEAGUE_ID || "2090908253",
    seasonId: process.env.ESPN_FANTASY_SEASON_ID || "2027",
    teamId: process.env.ESPN_FANTASY_TEAM_ID || "9",
    swid: process.env.ESPN_SWID,
    espnS2: process.env.ESPN_S2,
  };
}

function cookieHeader(config: EspnFantasyConfig) {
  if (!config.swid || !config.espnS2) return undefined;
  return `SWID=${config.swid}; espn_s2=${config.espnS2}`;
}

async function fetchEspnLeagueView(
  config: EspnFantasyConfig,
  views: string[],
  scoringPeriodId?: number,
): Promise<EspnFantasyLeague> {
  const url = new URL(
    `${ESPN_BASE_URL}/seasons/${config.seasonId}/segments/0/leagues/${config.leagueId}`,
  );
  views.forEach((view) => url.searchParams.append("view", view));
  if (scoringPeriodId !== undefined) {
    url.searchParams.set("scoringPeriodId", String(scoringPeriodId));
  }

  const cookie = cookieHeader(config);
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; FantasyLab/1.0)",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(
      `ESPN fantasy request failed (${response.status})${body ? `: ${body.slice(0, 180)}` : ""}`,
    );
    Object.assign(error, { status: response.status });
    throw error;
  }

  return (await response.json()) as EspnFantasyLeague;
}

export async function fetchEspnFantasyLeague(
  config = getEspnFantasyConfig(),
): Promise<{
  league: EspnFantasyLeague;
  authenticated: boolean;
  rosterScoringPeriodId: number;
}> {
  // ESPN's mRoster view is scoring-period-sensitive. Fetch league metadata first,
  // then explicitly request the roster for the current scoring period. This also
  // works in preseason, where scoringPeriodId is normally 0.
  const league = await fetchEspnLeagueView(config, [
    "mTeam",
    "mSettings",
    "mMatchup",
    "mMatchupScore",
    "mScoreboard",
    "mDraftDetail",
    "mStatus",
  ]);

  const rosterScoringPeriodId = league.scoringPeriodId ?? 0;
  const rosterLeague = await fetchEspnLeagueView(
    config,
    ["mRoster"],
    rosterScoringPeriodId,
  );

  const rostersByTeam = new Map(
    (rosterLeague.teams ?? []).map((team) => [team.id, team.roster]),
  );

  league.teams = (league.teams ?? rosterLeague.teams ?? []).map((team) => ({
    ...team,
    roster: rostersByTeam.get(team.id) ?? team.roster,
  }));

  return {
    league,
    authenticated: Boolean(cookieHeader(config)),
    rosterScoringPeriodId,
  };
}

export function teamDisplayName(team: EspnFantasyTeam) {
  return (
    team.name ||
    [team.location, team.nickname].filter(Boolean).join(" ") ||
    team.abbrev ||
    `Team ${team.id ?? ""}`
  );
}
