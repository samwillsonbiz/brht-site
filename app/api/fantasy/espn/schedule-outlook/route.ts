import { NextRequest, NextResponse } from "next/server";
import { fetchNbaSchedule, type NbaScheduleGame } from "@/lib/espnNba";

export const dynamic = "force-dynamic";

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function mondayOf(dateString: string) {
  const date = parseDateOnly(dateString);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function regularSeasonGames(games: NbaScheduleGame[]) {
  const explicitlyRegular = games.filter((game) => game.seasonType === 2);
  // ESPN normally returns season.type=2 for regular-season games. If that field is
  // ever absent, retain the schedule rather than returning an empty dashboard.
  return explicitlyRegular.length ? explicitlyRegular : games;
}

export async function GET(request: NextRequest) {
  const requestedFrom = request.nextUrl.searchParams.get("from");
  const weeksParam = Number(request.nextUrl.searchParams.get("weeks") ?? 6);
  const weeks = Number.isFinite(weeksParam)
    ? Math.min(Math.max(Math.floor(weeksParam), 1), 12)
    : 6;
  const today = new Date().toISOString().slice(0, 10);

  try {
    let firstMonday: Date;
    let seasonStart: string | null = null;

    if (requestedFrom && /^\d{4}-\d{2}-\d{2}$/.test(requestedFrom)) {
      firstMonday = mondayOf(requestedFrom);
    } else {
      // Before opening night, a naive "next six weeks" window is mostly preseason.
      // Probe around today to locate the first regular-season game, then start the
      // outlook on that fantasy week. Once the regular season has begun, use the
      // current Monday so the page naturally rolls forward every week.
      const todayDate = parseDateOnly(today);
      const probeFrom = formatDateOnly(addDays(todayDate, -45));
      const probeTo = formatDateOnly(addDays(todayDate, 100));
      const probe = regularSeasonGames(await fetchNbaSchedule(probeFrom, probeTo));
      const firstRegular = probe.find((game) => game.seasonType === 2) ?? probe[0];
      seasonStart = firstRegular?.gameDateEt ?? null;

      if (seasonStart && parseDateOnly(seasonStart) > todayDate) {
        firstMonday = mondayOf(seasonStart);
      } else {
        firstMonday = mondayOf(today);
      }
    }

    const from = formatDateOnly(firstMonday);
    const to = formatDateOnly(addDays(firstMonday, weeks * 7 - 1));
    const games = regularSeasonGames(await fetchNbaSchedule(from, to));

    const weekDefinitions = Array.from({ length: weeks }, (_, index) => {
      const start = addDays(firstMonday, index * 7);
      const end = addDays(start, 6);
      return {
        index: index + 1,
        start: formatDateOnly(start),
        end: formatDateOnly(end),
      };
    });

    const teams = new Map<
      number,
      {
        id: number;
        abbreviation: string | null;
        displayName: string | null;
        total: number;
        weeks: number[];
      }
    >();

    for (const game of games) {
      const gameDate = parseDateOnly(game.gameDateEt);
      const daysFromStart = Math.floor(
        (gameDate.getTime() - firstMonday.getTime()) / 86_400_000,
      );
      const weekIndex = Math.floor(daysFromStart / 7);
      if (weekIndex < 0 || weekIndex >= weeks) continue;

      for (const team of [game.home, game.away]) {
        if (team.id === null) continue;
        if (!teams.has(team.id)) {
          teams.set(team.id, {
            id: team.id,
            abbreviation: team.abbreviation,
            displayName: team.displayName,
            total: 0,
            weeks: Array.from({ length: weeks }, () => 0),
          });
        }
        const row = teams.get(team.id)!;
        row.weeks[weekIndex] += 1;
        row.total += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      source: "espn",
      regularSeasonOnly: true,
      seasonStart,
      from,
      to,
      weeks: weekDefinitions,
      teams: Array.from(teams.values()).sort((a, b) =>
        (a.abbreviation ?? "").localeCompare(b.abbreviation ?? ""),
      ),
      gameCount: games.length,
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status) || 502
        : 502;
    return NextResponse.json(
      { ok: false, source: "espn", message: "Unable to build schedule outlook." },
      { status },
    );
  }
}
