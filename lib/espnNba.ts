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

function parseEvents(events: any[] = []) {
  return events.flatMap((event): NbaScheduleGame[] => {
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
}

function dateKeys(from: string, to: string) {
  const start = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new Error("Invalid NBA schedule date range.");
  }

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && dates.length < 91) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  if (cursor <= end) {
    throw new Error("NBA schedule requests are limited to 90 days at a time.");
  }
  return dates;
}

async function fetchScoreboardDate(date: string) {
  const url = new URL(NBA_SCOREBOARD_URL);
  url.searchParams.set("dates", date.replaceAll("-", ""));
  url.searchParams.set("limit", "100");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/151 Safari/537.36",
      Referer: "https://www.espn.com/nba/schedule",
      Origin: "https://www.espn.com",
    },
  });

  if (!response.ok) {
    const error = new Error(
      `ESPN NBA schedule request failed for ${date} (${response.status})`,
    );
    Object.assign(error, { status: response.status, date });
    throw error;
  }

  const body = (await response.json()) as { events?: any[] };
  return parseEvents(body.events ?? []);
}

export async function fetchNbaSchedule(from: string, to: string) {
  // ESPN's scoreboard date-range behavior changed in September 2026. Single-day
  // requests remain reliable, so fetch the requested window in small concurrent
  // batches and de-duplicate by ESPN event ID.
  const dates = dateKeys(from, to);
  const byId = new Map<string, NbaScheduleGame>();
  const batchSize = 7;

  for (let index = 0; index < dates.length; index += batchSize) {
    const batch = dates.slice(index, index + batchSize);
    const results = await Promise.all(batch.map(fetchScoreboardDate));
    for (const games of results) {
      for (const game of games) byId.set(game.id, game);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.tipoffAt.localeCompare(b.tipoffAt),
  );
}
