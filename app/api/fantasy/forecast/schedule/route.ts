import { NextRequest, NextResponse } from "next/server";
import { fetchNbaSchedule } from "@/lib/espnNba";
import { selectRows } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

const OPENING = "2026-10-19";
function plusDays(date: string, days: number) {
  return new Date(Date.parse(date + "T12:00:00Z") + days * 86400000).toISOString().slice(0, 10);
}
type CachedGame = {
  espn_event_id: string;
  game_date_et: string;
  home_team_espn_id: number;
  away_team_espn_id: number;
  status: string | null;
  completed: boolean;
};

export async function GET(request: NextRequest) {
  const startWeek = Math.max(1, Math.min(22, Math.floor(Number(request.nextUrl.searchParams.get("startWeek")) || 1)));
  const FIRST = plusDays(OPENING, (startWeek - 1) * 7);
  const LAST = plusDays(FIRST, 41);
  try {
    const cached = await selectRows("nba_games", {
      select: "espn_event_id,game_date_et,home_team_espn_id,away_team_espn_id,status,completed",
      game_date_et: "gte." + FIRST,
      order: "game_date_et.asc",
      limit: "1000",
    }) as CachedGame[];
    const byId = new Map<string, { id: string; gameDateEt: string; home: { id: number }; away: { id: number }; completed: boolean; status: string | null }>();
    for (const g of cached) {
      if (g.game_date_et > LAST) continue;
      byId.set(g.espn_event_id, {
        id: g.espn_event_id, gameDateEt: g.game_date_et,
        home: { id: g.home_team_espn_id }, away: { id: g.away_team_espn_id }, completed: Boolean(g.completed), status: g.status,
      });
    }
    const coveredThrough = cached.reduce((max, g) => g.game_date_et > max ? g.game_date_et : max, "");
    const start = coveredThrough >= FIRST
      ? new Date(new Date(coveredThrough + "T12:00:00Z").getTime() + 86400000).toISOString().slice(0, 10)
      : FIRST;
    if (start <= LAST) {
      for (const game of await fetchNbaSchedule(start, LAST)) {
        if (game.seasonType !== 2 && game.seasonType !== null) continue;
        if (game.home.id === null || game.away.id === null) continue;
        byId.set(game.id, {
          id: game.id, gameDateEt: game.gameDateEt,
          home: { id: game.home.id }, away: { id: game.away.id }, completed: game.completed, status: game.status,
        });
      }
    }
    // Existing cached NBA games contain reliable dates but often stale statuses.
    // Refresh this week’s completed/live statuses directly from ESPN without
    // fetching all 42 days again on each client refresh.
    const nowEastern = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
    const statusUntil = nowEastern < LAST ? nowEastern : LAST;
    const statusFrom = FIRST > plusDays(nowEastern, -7) ? FIRST : plusDays(nowEastern, -7);
    if (statusFrom <= statusUntil) {
      const recent = await fetchNbaSchedule(statusFrom, statusUntil);
      for (const game of recent) {
        if (game.seasonType !== 2 && game.seasonType !== null) continue;
        if (!byId.has(game.id) || game.home.id === null || game.away.id === null) continue;
        byId.set(game.id, {
          id: game.id, gameDateEt: game.gameDateEt,
          home: { id: game.home.id }, away: { id: game.away.id },
          completed: game.completed, status: game.status,
        });
      }
    }
    const games = Array.from(byId.values()).sort((a, b) => a.gameDateEt.localeCompare(b.gameDateEt));
    if (games.length < 220) throw new Error("Incomplete six-week NBA schedule");
    return NextResponse.json({
      ok: true, from: FIRST, to: LAST, startWeek, games, gameCount: games.length,
      lastStatusRefresh: new Date().toISOString(),
      completedGames: games.filter((g) => g.completed).length,
      cachedGames: cached.filter((g) => g.game_date_et <= LAST).length,
      updatedThrough: LAST,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({
      ok: false, message: "Complete six-week NBA schedule is unavailable. Projections are not safe to use.",
    }, { status: 502 });
  }
}
