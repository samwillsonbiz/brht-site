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

export type EspnFantasyPlayerStat = {
  id?: string;
  appliedAverage?: number;
  appliedTotal?: number;
  scoringPeriodId?: number;
  statSourceId?: number;
  statSplitTypeId?: number;
  proTeamId?: number;
  stats?: Record<string, number>;
};

export type EspnFantasyPlayerPoolEntry = {
  id?: number;
  onTeamId?: number;
  lineupLocked?: boolean;
  player?: {
    id?: number;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    proTeamId?: number;
    defaultPositionId?: number;
    eligibleSlots?: number[];
    injuryStatus?: string;
    injured?: boolean;
    percentOwned?: number;
    percentStarted?: number;
    ownership?: {
      percentOwned?: number;
      percentStarted?: number;
      auctionValueAverage?: number;
      averageDraftPosition?: number;
    };
    stats?: EspnFantasyPlayerStat[];
    draftRanksByRankType?: Record<string, unknown>;
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
  players?: EspnFantasyPlayerPoolEntry[];
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

async function espnFetch(url: URL, config: EspnFantasyConfig, extraHeaders?: Record<string, string>) {
  const cookie = cookieHeader(config);
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; FantasyLab/1.0)",
      ...(cookie ? { Cookie: cookie } : {}),
      ...extraHeaders,
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

  return response;
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

  const response = await espnFetch(url, config);
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

export async function fetchEspnPlayerPool(options?: {
  limit?: number;
  scoringPeriodId?: number;
  status?: Array<"FREEAGENT" | "WAIVERS" | "ONTEAM">;
}) {
  const config = getEspnFantasyConfig();
  const limit = Math.min(Math.max(options?.limit ?? 500, 1), 1500);
  const scoringPeriodId = options?.scoringPeriodId ?? 0;
  const url = new URL(
    `${ESPN_BASE_URL}/seasons/${config.seasonId}/segments/0/leagues/${config.leagueId}`,
  );
  url.searchParams.set("view", "kona_player_info");
  url.searchParams.set("scoringPeriodId", String(scoringPeriodId));

  const playerFilter: Record<string, unknown> = {
    limit,
    sortPercOwned: { sortPriority: 1, sortAsc: false },
  };
  if (options?.status?.length) {
    playerFilter.filterStatus = { value: options.status };
  }

  const response = await espnFetch(url, config, {
    "X-Fantasy-Filter": JSON.stringify({ players: playerFilter }),
  });
  const body = (await response.json()) as EspnFantasyLeague;
  return body.players ?? [];
}

export function teamDisplayName(team: EspnFantasyTeam) {
  return (
    team.name ||
    [team.location, team.nickname].filter(Boolean).join(" ") ||
    team.abbrev ||
    `Team ${team.id ?? ""}`
  );
}
