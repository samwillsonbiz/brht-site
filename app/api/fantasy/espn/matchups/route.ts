import { NextResponse } from "next/server";
import { fetchEspnFantasyLeague, getEspnFantasyConfig, teamDisplayName } from "@/lib/espnFantasy";

export const dynamic = "force-dynamic";

type Participant = { teamId?: number; totalPoints?: number; totalPointsLive?: number };
type EspnMatchup = {
  id?: number;
  matchupPeriodId?: number;
  home?: Participant;
  away?: Participant;
  winner?: string;
  playoffTierType?: string;
};
type ExtendedLeague = {
  schedule?: EspnMatchup[];
  settings?: { scheduleSettings?: { matchupPeriods?: Record<string, number[]> } };
};

export async function GET() {
  try {
    const config = getEspnFantasyConfig();
    const { league } = await fetchEspnFantasyLeague(config);
    const extra = league as typeof league & ExtendedLeague;
    const names = new Map((league.teams ?? []).map((team) => [team.id, teamDisplayName(team)]));
    const all = extra.schedule ?? [];
    const matchups = all.filter((m) => Number(m.matchupPeriodId) >= 1 && Number(m.matchupPeriodId) <= 6);
    return NextResponse.json({
      ok: true,
      leagueId: Number(config.leagueId),
      myTeamId: Number(config.teamId),
      scheduleRows: all.length,
      matchupPeriods: extra.settings?.scheduleSettings?.matchupPeriods ?? null,
      teams: (league.teams ?? []).map((t) => ({ id: t.id, name: teamDisplayName(t), players: t.roster?.entries?.length ?? 0 })),
      matchups: matchups.map((m) => ({
        id: m.id ?? null,
        week: m.matchupPeriodId,
        homeId: m.home?.teamId ?? null,
        awayId: m.away?.teamId ?? null,
        home: names.get(m.home?.teamId) ?? null,
        away: names.get(m.away?.teamId) ?? null,
        homeActual: m.home?.totalPointsLive ?? m.home?.totalPoints ?? null,
        awayActual: m.away?.totalPointsLive ?? m.away?.totalPoints ?? null,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, message: "ESPN matchup schedule unavailable." }, { status: 502 });
  }
}
