const NBA_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

export type NbaScheduleTeam = {
  id: number | null;
  abbreviation: string | null;
  displayName: string | null;
  homeAway: "home" | "away" | null;
};

export type NbaScheduleGame = {
  id: string;
  tipoffAt: string;
  gameDateEt: string;
  status: string | null;
  completed: boolean;
  seasonType: number | null;
  home: NbaScheduleTeam;
  away: NbaScheduleTeam;
};

function easternDateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function competitorToTeam(competitor: any): NbaScheduleTeam {
  return {
    id: competitor?.team?.id ? Number(competitor.team.id) : null,
    abbreviation: competitor?.team?.abbreviation ?? null,
    displayName: competitor?.team?.displayName ?? null,
    homeAway:
      competitor?.homeAway === "home" || competitor?.homeAway === "away"
        ? competitor.homeAway
        : null,
  };
}

export async function fetchNbaSchedule(from: string, to: string) {
  const url = new URL(NBA_SCOREBOARD_URL);
  url.searchParams.set(
    "dates",
    `${from.replaceAll("-", "")}-${to.replaceAll("-", "")}`,
  );
  url.searchParams.set("limit", "1000");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; FantasyLab/1.0)",
    },
  });

  if (!response.ok) {
    const error = new Error(`ESPN NBA schedule request failed (${response.status})`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  const body = (await response.json()) as { events?: any[] };
  const games: NbaScheduleGame[] = (body.events ?? []).flatMap((event) => {
    const competition = event?.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const home = competitors.find((item: any) => item?.homeAway === "home");
    const away = competitors.find((item: any) => item?.homeAway === "away");
    const tipoffAt = event?.date ?? competition?.date;

    if (!event?.id || !tipoffAt || !home || !away) return [];

    const seasonTypeRaw =
      event?.season?.type ??
      competition?.season?.type ??
      event?.seasonType ??
      null;
    const seasonType =
      seasonTypeRaw === null || seasonTypeRaw === undefined
        ? null
        : Number(seasonTypeRaw);

    return [
      {
        id: String(event.id),
        tipoffAt,
        gameDateEt: easternDateKey(tipoffAt),
        status:
          event?.status?.type?.name ??
          event?.status?.type?.description ??
          competition?.status?.type?.name ??
          null,
        completed: Boolean(
          event?.status?.type?.completed ?? competition?.status?.type?.completed,
        ),
        seasonType: Number.isFinite(seasonType) ? seasonType : null,
        home: competitorToTeam(home),
        away: competitorToTeam(away),
      },
    ];
  });

  return games.sort((a, b) => a.tipoffAt.localeCompare(b.tipoffAt));
}
