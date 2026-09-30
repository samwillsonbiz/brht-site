import { NextRequest, NextResponse } from "next/server";
import { fetchNbaSchedule } from "@/lib/espnNba";

export const dynamic = "force-dynamic";

function validDate(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function defaultWindow() {
  const start = new Date();
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 42);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export async function GET(request: NextRequest) {
  const defaults = defaultWindow();
  const fromParam = request.nextUrl.searchParams.get("from");
  const toParam = request.nextUrl.searchParams.get("to");
  const from = validDate(fromParam) ? fromParam! : defaults.from;
  const to = validDate(toParam) ? toParam! : defaults.to;

  try {
    const games = await fetchNbaSchedule(from, to);
    const teams = new Map<
      number,
      { id: number; abbreviation: string | null; displayName: string | null }
    >();

    for (const game of games) {
      for (const team of [game.home, game.away]) {
        if (team.id !== null && !teams.has(team.id)) {
          teams.set(team.id, {
            id: team.id,
            abbreviation: team.abbreviation,
            displayName: team.displayName,
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      source: "espn",
      from,
      to,
      gameCount: games.length,
      teams: Array.from(teams.values()).sort((a, b) =>
        (a.abbreviation ?? "").localeCompare(b.abbreviation ?? ""),
      ),
      games,
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status) || 502
        : 502;
    return NextResponse.json(
      { ok: false, source: "espn", message: "Unable to load NBA schedule." },
      { status },
    );
  }
}
