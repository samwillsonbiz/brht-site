const ESPN_BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba";

export type EspnFantasyConfig = {
  leagueId: string;
  seasonId: string;
  teamId: string;
  swid?: string;
  espnS2?: string;
};

export type EspnFantasyTeam = {
  id?: number;
  abbrev?: string;
  location?: string;
  nickname?: string;
  owners?: string[];
  primaryOwner?: string;
  roster?: {
    entries?: Array<{
      playerId?: number;
      lineupSlotId?: number;
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
    }>;
  };
};

export type EspnFantasyLeague = {
  id?: number;
  seasonId?: number;
  scoringPeriodId?: number;
  status?: { currentMatchupPeriod?: number };
  settings?: { name?: string };
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

export async function fetchEspnFantasyLeague(
  config = getEspnFantasyConfig(),
): Promise<{ league: EspnFantasyLeague; authenticated: boolean }> {
  const views = [
    "mTeam",
    "mRoster",
    "mSettings",
    "mMatchup",
    "mMatchupScore",
    "mScoreboard",
  ];
  const url = new URL(
    `${ESPN_BASE_URL}/seasons/${config.seasonId}/segments/0/leagues/${config.leagueId}`,
  );
  views.forEach((view) => url.searchParams.append("view", view));

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

  return {
    league: (await response.json()) as EspnFantasyLeague,
    authenticated: Boolean(cookie),
  };
}

export function teamDisplayName(team: EspnFantasyTeam) {
  return [team.location, team.nickname].filter(Boolean).join(" ") || team.abbrev || `Team ${team.id ?? ""}`;
}
