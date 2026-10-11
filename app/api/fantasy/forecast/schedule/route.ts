import { NextResponse } from "next/server";
import { fetchNbaSchedule } from "@/lib/espnNba";
import { selectRows } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

const FIRST = "2026-10-19";
const LAST = "2026-11-29";
type CachedGame = {
  espn_event_id: string;
  game_date_et: string;
  home_team_espn_id: number;
  away_team_espn_id: number;
};

export async function GET() {
  try {
    const cached = await selectRows("nba_games", {
      select: "espn_event_id,game_date_et,home_team_espn_id,away_team_espn_id",
      game_date_et: "gte." + FIRST,
      order: "game_date_et.asc",
      limit: "1000",
    }) as CachedGame[];
    const byId = new Map<string, { id: string; gameDateEt: string; home: { id: number }; away: { id: number } }>();
    for (const g of cached) {
      if (g.game_date_et > LAST) continue;
      byId.set(g.espn_event_id, {
        id: g.espn_event_id, gameDateEt: g.game_date_et,
        home: { id: g.home_team_espn_id }, away: { id: g.away_team_espn_id },
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
          home: { id: game.home.id }, away: { id: game.away.id },
        });
      }
    }
    const games = Array.from(byId.values()).sort((a, b) => a.gameDateEt.localeCompare(b.gameDateEt));
    if (games.length < 220) throw new Error("Incomplete six-week NBA schedule");
    return NextResponse.json({
      ok: true, from: FIRST, to: LAST, games, gameCount: games.length,
      cachedGames: cached.filter((g) => g.game_date_et <= LAST).length,
      updatedThrough: LAST,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({
      ok: false, message: "Complete six-week NBA schedule is unavailable. Projections are not safe to use.",
    }, { status: 502 });
  }
}
