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
    const firstWeek = Math.max(1, Math.min(17, Number(league.status?.currentMatchupPeriod ?? 1) || 1));
    const matchups = all.filter((m) => Number(m.matchupPeriodId) >= firstWeek && Number(m.matchupPeriodId) < firstWeek + 6);
    return NextResponse.json({
      ok: true,
      leagueId: Number(config.leagueId),
      myTeamId: Number(config.teamId),
      firstWeek,
      scheduleRows: all.length,
      matchupPeriods: extra.settings?.scheduleSettings?.matchupPeriods ?? null,
      teams: (league.teams ?? []).map((t) => ({
        id: t.id, name: teamDisplayName(t), players: t.roster?.entries?.length ?? 0,
        roster: (t.roster?.entries ?? []).map((e) => ({ id: e.playerId ?? e.playerPoolEntry?.player?.id ?? null, slot: e.lineupSlotId ?? null })).filter((e) => e.id != null),
      })),
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
