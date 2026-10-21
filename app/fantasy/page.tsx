"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, CalendarDays, ChevronRight, RefreshCw, ShieldAlert, Target, Users, Zap } from "lucide-react";

type Stats = { id: string | null; statSourceId: number | null; statSplitTypeId: number | null; appliedAverage: number | null; appliedTotal: number | null; scoringPeriodId: number | null };
type EspnPlayer = { id: number; name: string; fantasyTeamId: number; rosterSlotId?: number | null; proTeamId: number | null; eligibleSlots: number[]; defaultPositionId: number | null; injuryStatus: string | null; stats: Stats[] };
type Matchup = { id: number | null; week: number; homeId: number | null; awayId: number | null; home: string | null; away: string | null; homeActual?: number | null; awayActual?: number | null };
type EspnTeams = { ok: boolean; leagueId: number; myTeamId: number; firstWeek: number; teams: { id: number; name: string; players: number; roster: { id: number; slot: number | null }[] }[]; matchups: Matchup[] };
type Game = { id: string; gameDateEt: string; home: { id: number }; away: { id: number }; status: string | null; completed: boolean };
type Feed = { league: EspnTeams; players: EspnPlayer[]; games: Game[]; updated: string; cachedGames: number };
type PlannedPlayer = { player: EspnPlayer; ppg: number; source: "ESPN 2027" | "2026 actual" | "missing"; days: boolean[]; nbaScheduled: number; nbaPlayed: number; seasonActual: number | null; seasonGames: number; actualByDay: Record<string, number> };
type Start = { player: PlannedPlayer; slot: string };
type DayPlan = { date: string; starters: Start[]; benchGames: PlannedPlayer[]; scheduled: number; projected: number; nbaActual: number; completedPlayerGames: number };
type TeamPlan = { teamId: number; players: PlannedPlayer[]; days: DayPlan[]; projected: number; starts: number; scheduled: number; lost: number; missing: number; flagged: number; nbaActual: number };
type WeekPlan = { week: number; start: string; end: string; opponentId: number | null; opponentName: string; mine: TeamPlan; opponent: TeamPlan; validMatchup: boolean; actualMine: number | null; actualOpponent: number | null };

const OPENING_MONDAY = "2026-10-19";
const SLOTS = ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL", "UTIL", "UTIL"];
const POSITION: Record<number, string> = { 0: "PG", 1: "SG", 2: "SF", 3: "PF", 4: "C" };
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function datePlus(iso: string, days: number) {
  return new Date(Date.parse(iso + "T12:00:00Z") + days * 86400000).toISOString().slice(0, 10);
}
function formatDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
function fmt(n: number) { return Math.round(n).toLocaleString("en-US"); }
function ppgFor(player: EspnPlayer) {
  const season = (player.stats ?? []).find((s) => s.id === "002027" && s.statSourceId === 0 && s.statSplitTypeId === 0);
  const gameStats = (player.stats ?? []).filter((s) => s.statSourceId === 0 && s.statSplitTypeId === 5 && s.id?.startsWith("05") && s.appliedTotal != null);
  const seasonGames = gameStats.length;
  const seasonActual = seasonGames > 0 && season?.appliedAverage != null ? Number(season.appliedAverage) : null;
  const annual = (player.stats ?? []).find((s) => s.id === "102027" && s.statSourceId === 1 && s.statSplitTypeId === 0 && Number(s.appliedAverage) > 0);
  const previous = (player.stats ?? []).find((s) => s.id === "002026" && s.statSourceId === 0 && Number(s.appliedAverage) > 0);
  const baseline = annual ? Number(annual.appliedAverage) : previous ? Number(previous.appliedAverage) : seasonActual ?? 0;
  // Show raw current-season average immediately, but wait for a useful sample
  // before allowing it to overwhelm ESPN's preseason forward projection.
  const weight = seasonActual != null && seasonGames >= 2
    ? Math.min(0.75, (seasonGames - 1) / (seasonGames + 5)) : 0;
  const ppg = baseline * (1 - weight) + (seasonActual ?? baseline) * weight;
  const source = annual ? "ESPN 2027" as const : previous ? "2026 actual" as const : seasonActual != null ? "ESPN 2027" as const : "missing" as const;
  return { ppg, source, seasonActual, seasonGames };
}
function eligible(p: PlannedPlayer, slot: string) {
  const ppos = (p.player.eligibleSlots ?? []).filter((id) => id >= 0 && id <= 4).map((id) => POSITION[id]);
  if (!ppos.length && p.player.defaultPositionId !== null) ppos.push(POSITION[p.player.defaultPositionId] ?? "");
  if (slot === "UTIL") return ppos.length > 0;
  if (slot === "G") return ppos.includes("PG") || ppos.includes("SG");
  if (slot === "F") return ppos.includes("SF") || ppos.includes("PF");
  return ppos.includes(slot);
}
function optimizeDay(date: string, team: PlannedPlayer[], index: number): DayPlan {
  const playing = team.filter((p) => p.days[index] && p.player.rosterSlotId !== 13 && !["OUT", "INJURY_RESERVE", "IR", "SUSPENSION"].includes((p.player.injuryStatus ?? "").toUpperCase()));
  type State = { score: number; starters: Start[] };
  let states = new Map<number, State>([[0, { score: 0, starters: [] }]]);
  for (const player of playing) {
    const next = new Map(states);
    for (const [mask, state] of states) {
      for (let k = 0; k < SLOTS.length; k++) {
        const bit = 1 << k;
        if ((mask & bit) || !eligible(player, SLOTS[k])) continue;
        const nextMask = mask | bit;
        const score = state.score + player.ppg;
        if (!next.has(nextMask) || next.get(nextMask)!.score < score) {
          next.set(nextMask, { score, starters: [...state.starters, { player, slot: SLOTS[k] }] });
        }
      }
    }
    states = next;
  }
  let best: State = { score: 0, starters: [] };
  for (const state of states.values()) if (state.score > best.score) best = state;
  const used = new Set(best.starters.map((s) => s.player.player.id));
  return { date, starters: best.starters, benchGames: playing.filter((p) => !used.has(p.player.id)), scheduled: playing.length, projected: best.score,
    nbaActual: team.reduce((sum, p) => sum + (p.actualByDay[date] ?? 0), 0),
    completedPlayerGames: team.filter((p) => p.actualByDay[date] !== undefined).length };
}
function teamPlan(teamId: number, weekStart: string, players: EspnPlayer[], games: Game[]): TeamPlan {
  const schedule = new Map<number, Game[]>();
  for (const game of games) {
    if (game.gameDateEt < weekStart || game.gameDateEt > datePlus(weekStart, 6)) continue;
    for (const team of [game.home.id, game.away.id]) {
      if (!team) continue;
      const events = schedule.get(team) ?? [];
      events.push(game);
      schedule.set(team, events);
    }
  }
  const owned = players.filter((p) => p.fantasyTeamId === teamId);
  const mapped: PlannedPlayer[] = owned.map((p) => {
    const projection = ppgFor(p);
    const nbaGames = schedule.get(p.proTeamId ?? -1) ?? [];
    const remaining = nbaGames.filter((g) => !g.completed && !g.status?.includes("IN_PROGRESS") && !g.status?.includes("HALFTIME") && g.status !== "STATUS_END_PERIOD");
    const actualByDay: Record<string, number> = {};
    for (const game of nbaGames) {
      const stat = (p.stats ?? []).find((s) => s.id === "05" + game.id && s.statSourceId === 0 && s.statSplitTypeId === 5);
      if (stat && stat.appliedTotal != null) actualByDay[game.gameDateEt] = Number(stat.appliedTotal);
    }
    return {
      player: p, ppg: projection.ppg, source: projection.source,
      seasonActual: projection.seasonActual, seasonGames: projection.seasonGames,
      nbaScheduled: nbaGames.length, nbaPlayed: Object.keys(actualByDay).length,
      actualByDay, days: Array.from({ length: 7 }, (_, d) => remaining.some((g) => g.gameDateEt === datePlus(weekStart, d))),
    };
  });
  const days = Array.from({ length: 7 }, (_, d) => optimizeDay(datePlus(weekStart, d), mapped, d));
  return {
    teamId, players: mapped, days,
    projected: days.reduce((sum, d) => sum + d.projected, 0),
    starts: days.reduce((sum, d) => sum + d.starters.length, 0),
    scheduled: days.reduce((sum, d) => sum + d.scheduled, 0),
    lost: days.reduce((sum, d) => sum + d.benchGames.length, 0),
    missing: mapped.filter((p) => p.source === "missing").length,
    flagged: mapped.filter((p) => p.player.injuryStatus && !["ACTIVE", "NORMAL"].includes(p.player.injuryStatus.toUpperCase())).length,
    nbaActual: days.reduce((sum, d) => sum + d.nbaActual, 0),
  };
}

function makeWeeks(feed: Feed): WeekPlan[] {
  const names = new Map(feed.league.teams.map((t) => [t.id, t.name.trim()]));
  const me = feed.league.myTeamId;
  return Array.from({ length: 6 }, (_, idx) => {
    const week = feed.league.firstWeek + idx, start = datePlus(OPENING_MONDAY, (week - 1) * 7);
    const matchup = feed.league.matchups.find((m) => m.week === week && (m.homeId === me || m.awayId === me));
    const opponentId = matchup ? (matchup.homeId === me ? matchup.awayId : matchup.homeId) : null;
    return {
      week, start, end: datePlus(start, 6), opponentId,
      opponentName: opponentId ? names.get(opponentId) ?? "Team " + opponentId : "Unavailable",
      mine: teamPlan(me, start, feed.players, feed.games),
      opponent: teamPlan(opponentId ?? -1, start, feed.players, feed.games),
      validMatchup: opponentId !== null,
      actualMine: matchup ? (matchup.homeId === me ? matchup.homeActual ?? null : matchup.awayActual ?? null) : null,
      actualOpponent: matchup ? (matchup.homeId === me ? matchup.awayActual ?? null : matchup.homeActual ?? null) : null,
    };
  });
}

export default function FantasyPage() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [refreshId, setRefreshId] = useState(0);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [rosterTab, setRosterTab] = useState<"mine" | "opp">("mine");

  // Once games begin, update the live scoreboard while the tab is open.
  useEffect(() => {
    const interval = window.setInterval(() => setRefreshId((current) => current + 1), 120_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setPending(true);
      setError(null);
      try {
        const [matchRes, poolRes] = await Promise.all([
          fetch("/api/fantasy/espn/matchups", { cache: "no-store" }),
          fetch("/api/fantasy/espn/players?limit=500&status=ONTEAM", { cache: "no-store" }),
        ]);
        if (!matchRes.ok || !poolRes.ok) throw new Error("The ESPN matchups or current roster projections could not be loaded.");
        const [league, pool] = await Promise.all([matchRes.json(), poolRes.json()]);
        const scheduleRes = await fetch(`/api/fantasy/forecast/schedule?startWeek=${league.firstWeek ?? 1}`, { cache: "no-store" });
        if (!scheduleRes.ok) throw new Error("The six-week NBA schedule could not be loaded.");
        const schedule = await scheduleRes.json();
        if (!league.ok || !pool.ok || !schedule.ok) throw new Error("One of the ESPN data sources reported an error.");
        const roster = new Map<number, { owner: number; slot: number | null }>();
        for (const team of league.teams as EspnTeams["teams"]) {
          for (const entry of team.roster ?? []) {
            if (entry.id) roster.set(entry.id, { owner: team.id, slot: entry.slot });
          }
        }
        let currentPlayers: EspnPlayer[] = pool.players;
        let covered = currentPlayers.filter((p) => roster.has(p.id)).length;
        if (covered < roster.size) {
          const fallbackRes = await fetch("/api/fantasy/espn/players?limit=1000", { cache: "no-store" });
          if (fallbackRes.ok) {
            const fallback = await fallbackRes.json();
            if (fallback.ok && Array.isArray(fallback.players)) {
              currentPlayers = [...new Map([...currentPlayers, ...fallback.players].map((p: EspnPlayer): [number, EspnPlayer] => [p.id, p])).values()];
              covered = currentPlayers.filter((p) => roster.has(p.id)).length;
            }
          }
        }
        const currentRoster: EspnPlayer[] = currentPlayers.filter((p) => roster.has(p.id)).map((p) => ({
          ...p, fantasyTeamId: roster.get(p.id)!.owner, rosterSlotId: roster.get(p.id)!.slot,
        }));
        const teamIds = new Set(currentRoster.map((p) => p.fantasyTeamId));
        if (league.teams.length !== 12 || teamIds.size !== league.teams.length || currentRoster.filter((p) => p.fantasyTeamId === league.myTeamId).length < 10)
          throw new Error(`ESPN roster feed is incomplete: ${covered}/${roster.size} roster slots loaded across ${teamIds.size}/12 teams. Refresh ESPN to retry.`);
        if (!schedule.games.length || league.matchups.filter((m: Matchup) => m.week >= league.firstWeek && m.week < league.firstWeek + 6).length !== 36)
          throw new Error("The first six weeks of matchups or games are incomplete.");
        if (!cancelled) setFeed({ league, players: currentRoster, games: schedule.games, updated: new Date().toISOString(), cachedGames: schedule.cachedGames });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Fantasy data unavailable.");
      } finally {
        if (!cancelled) setPending(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshId]);

  const weeks = useMemo(() => feed ? makeWeeks(feed) : [], [feed]);
  const week = weeks[selectedWeek] ?? null;
  const mineName = feed?.league.teams.find((t) => t.id === feed.league.myTeamId)?.name.trim() ?? "My Team";
  const otherName = week?.opponentName ?? "Opponent";
  const displayPlan = rosterTab === "mine" ? week?.mine : week?.opponent;

  const rankedPlayerRows = useMemo(() => {
    if (!displayPlan) return [];
    return displayPlan.players.map((p) => {
      const scheduled = p.days.filter(Boolean).length;
      const starts = displayPlan.days.filter((d) => d.starters.some((s) => s.player.player.id === p.player.id)).length;
      return { ...p, scheduled, starts, weekly: displayPlan.days.reduce((sum, d) => sum + d.starters.filter((s) => s.player.player.id === p.player.id).reduce((tot, s) => tot + s.player.ppg, 0), 0) };
    }).sort((a, b) => b.weekly - a.weekly);
  }, [displayPlan]);

  // Official ESPN scores are authoritative for completed and in-progress games.
  // Add only not-yet-started games for the forward-looking final forecast.
  const finalMine = week ? (week.actualMine ?? 0) + week.mine.projected : 0;
  const finalOpp = week ? (week.actualOpponent ?? 0) + week.opponent.projected : 0;
  const edge = finalMine - finalOpp;
  return (
    <main className="min-h-screen bg-[#f5f5f7] pb-14 text-[#1d1d1f]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 md:px-8">
          <div><p className="text-sm font-semibold">Fantasy Lab</p><p className="text-[11px] text-black/40">Six-week matchup forecast</p></div>
          <button type="button" onClick={() => setRefreshId((i) => i + 1)} disabled={pending} className="inline-flex h-9 items-center gap-2 rounded-full bg-[#1d1d1f] px-4 text-xs font-semibold text-white disabled:opacity-40"><RefreshCw className={pending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />Refresh ESPN</button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 md:px-8">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0071e3]"><Target className="h-4 w-4" /> 2026–27 season</div><h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">Your next six matchups.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">Actual ESPN matchup scores plus a forward forecast for games yet to start. Current-season player averages update as ESPN posts results.</p></div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white px-3 py-2 text-black/60"><Users className="mr-1 inline h-3.5 w-3.5" /> {feed?.league.teams.length ?? "—"} teams</span><span className="rounded-full bg-white px-3 py-2 text-black/60"><CalendarDays className="mr-1 inline h-3.5 w-3.5" /> {feed?.games.length ?? "—"} NBA games</span><span className="rounded-full bg-white px-3 py-2 text-black/60">{feed ? `${feed.players.length} currently rostered` : "Awaiting ESPN"}</span></div>
        </section>
        {pending && !feed && <div className="rounded-2xl bg-white p-7 text-sm text-black/55"><RefreshCw className="mr-2 inline h-4 w-4 animate-spin" />Loading ESPN opponents, drafted rosters and game schedule…</div>}
        {error && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900"><ShieldAlert className="mr-2 inline h-4 w-4" />{error}{feed ? " Last synced data remains displayed." : " No fictional roster data is substituted."}</div>}
        {!!weeks.length && <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {weeks.map((w, i) => {
              const delta = (w.actualMine ?? 0) + w.mine.projected - (w.actualOpponent ?? 0) - w.opponent.projected;
              const mineForecast = (w.actualMine ?? 0) + w.mine.projected;
              const oppForecast = (w.actualOpponent ?? 0) + w.opponent.projected;
              return <button type="button" key={w.week} onClick={() => {setSelectedWeek(i);setSelectedDay(1);setRosterTab("mine");}} className={"rounded-[22px] border p-4 text-left transition hover:shadow-md " + (selectedWeek === i ? "border-[#0071e3]/35 bg-[#eaf4ff] ring-1 ring-[#0071e3]/15" : "border-black/[0.06] bg-white")}>
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#0071e3]">WEEK {w.week}</span><span className="text-xs text-black/45">{formatDate(w.start)} – {formatDate(w.end)}</span></div>
                <div className="mt-2 truncate text-[15px] font-semibold">{w.opponentName}</div>
                <div className="mt-3 flex items-center justify-between"><span className="text-2xl font-semibold text-[#0071e3]">{fmt(mineForecast)}</span><span className="text-xs text-black/30">vs</span><span className="text-2xl font-semibold text-[#f05b52]">{fmt(oppForecast)}</span></div>
                {(w.actualMine != null && w.actualOpponent != null && (w.actualMine > 0 || w.actualOpponent > 0)) && <div className="mt-1 text-xs font-bold text-emerald-700">LIVE ESPN: {fmt(w.actualMine)} – {fmt(w.actualOpponent)}</div>}
                <div className={"mt-2 text-xs font-semibold " + (delta >= 0 ? "text-emerald-700" : "text-red-600")}>{delta >= 0 ? "+" : ""}{fmt(delta)} final forecast edge · {w.mine.starts} vs {w.opponent.starts} starts left</div>
              </button>;
            })}
          </section>
          {week && <section className="space-y-5">
            <div className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div><div className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Week {week.week} · {formatDate(week.start)}–{formatDate(week.end)}</div><h2 className="mt-1 text-xl font-semibold md:text-2xl">{mineName} vs {otherName}</h2></div>
                <span className={"rounded-full px-3 py-2 text-xs font-semibold " + (edge >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{edge >= 0 ? <ArrowUp className="mr-1 inline h-3 w-3" /> : <ArrowDown className="mr-1 inline h-3 w-3" />}{edge >= 0 ? "+" : ""}{fmt(edge)} final forecast edge</span>
              </div>
              <div className="rounded-2xl border border-[#0071e3]/15 bg-[#f3f9ff] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wider text-[#0066cc]">Official ESPN score so far</span><span className="text-[10px] font-medium text-black/45">Auto-refreshes every 2 minutes</span></div>
                <div className="mt-2 flex items-center justify-between gap-3 text-center">
                  <div className="min-w-0 flex-1"><p className="truncate text-xs text-black/55">{mineName}</p><p className="text-3xl font-bold text-[#0071e3]">{fmt(week.actualMine ?? 0)}</p></div>
                  <span className="text-base font-medium text-black/25">–</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs text-black/55">{otherName}</p><p className="text-3xl font-bold text-[#f05b52]">{fmt(week.actualOpponent ?? 0)}</p></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-y border-black/[0.06] py-5">
                <div><p className="truncate text-xs font-medium text-black/45">Estimated final · {mineName}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-[#0071e3] md:text-4xl">{fmt(finalMine)}</p><p className="mt-1 text-xs text-black/45">+{fmt(week.mine.projected)} future pts · {week.mine.starts} starts left</p></div>
                <div className="text-right"><p className="truncate text-xs font-medium text-black/45">Estimated final · {otherName}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-[#f05b52] md:text-4xl">{fmt(finalOpp)}</p><p className="mt-1 text-xs text-black/45">+{fmt(week.opponent.projected)} future pts · {week.opponent.starts} starts left</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {(week.actualMine !== null && week.actualOpponent !== null && (week.actualMine > 0 || week.actualOpponent > 0)) && <span className="rounded-full bg-[#eef6ff] px-3 py-1.5 font-semibold text-[#0066cc]">ESPN score so far: {fmt(week.actualMine)} – {fmt(week.actualOpponent)}</span>}
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-black/65">My bench conflicts: {week.mine.lost} games</span>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-black/65">Opponent bench conflicts: {week.opponent.lost}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">Injury flags: {week.mine.flagged} mine · {week.opponent.flagged} opponent</span>
                {(week.mine.missing + week.opponent.missing > 0) && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">{week.mine.missing + week.opponent.missing} players use prior-season fallback / have no projection</span>}
              </div>
              <p className="mt-3 text-xs leading-5 text-black/45">The live score comes directly from ESPN and follows your real starting lineup. The final forecast adds only NBA games that have not begun. Current-season actual averages appear in the player table and gradually influence future-game forecasts from a two-game sample. ESPN projections remain a stabilizing baseline early in the season. Your opponents, injuries, lineup choices and late adjustments can still change the final result.</p>
            </div>
            <div className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <h3 className="text-lg font-semibold">Day-by-day game plan</h3>
              <p className="mt-1 text-xs text-black/45">Tap a day to see projected points from games that have not started. Completed player NBA box scores are displayed separately; the official fantasy score above determines which lineup points actually counted.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {week.mine.days.map((d, i) => {
                  const their = week.opponent.days[i];
                  const diff = d.projected - their.projected;
                  return <button type="button" key={d.date} onClick={() => setSelectedDay(i)} className={"rounded-[16px] border px-3 py-3 text-left " + (selectedDay === i ? "border-[#0071e3] bg-[#eef6ff]" : "border-black/[0.06] bg-[#fafafa]")}>
                    <div className="flex justify-between gap-1 text-xs font-semibold">{DAY_NAMES[i]}<span className="font-normal text-black/35">{formatDate(d.date)}</span></div>
                    <div className="mt-2 text-base font-semibold text-[#0071e3]">{fmt(d.projected)}</div><div className="text-xs font-medium text-[#f05b52]">{fmt(their.projected)}</div>
                    {(d.completedPlayerGames + their.completedPlayerGames > 0) && <p className="mt-1 text-[10px] font-medium text-black/45">{d.completedPlayerGames + their.completedPlayerGames} NBA player results posted</p>
                    <div className={"mt-2 text-[11px] font-semibold " + (diff >= 0 ? "text-emerald-700" : "text-red-600")}>{diff >= 0 ? "+" : ""}{fmt(diff)} edge</div>
                    <div className="mt-1 text-[10px] text-black/40">{d.starters.length} vs {their.starters.length} starts</div>
                  </button>;
                })}
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {([{ label: mineName, plan: week.mine, color: "text-[#0071e3]" }, { label: otherName, plan: week.opponent, color: "text-[#f05b52]" }]).map((item) => {
                  const d = item.plan.days[selectedDay];
                  return <div key={item.label} className="rounded-[18px] bg-[#f7f7f9] p-4">
                    <div className="flex items-center justify-between"><p className="min-w-0 truncate font-semibold">{item.label}</p><p className={"font-semibold " + item.color}>{fmt(d.projected)} pts still projected</p></div>
                    {d.completedPlayerGames > 0 && <p className="mt-1 text-xs text-black/50">{fmt(d.nbaActual)} NBA fantasy points from {d.completedPlayerGames} player box scores (includes bench players; not necessarily counted in ESPN matchup)</p>}
                    <div className="mt-3 space-y-1.5">
                      {[...d.starters].sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot)).map((entry, i) => <div key={entry.player.player.id + "-" + i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs"><div className="min-w-0"><span className="mr-2 text-black/40">{entry.slot}</span><span className="font-semibold">{entry.player.player.name}</span></div><span className="shrink-0 font-semibold">{entry.player.ppg.toFixed(1)}</span></div>)}
                      {d.starters.length === 0 && <p className="py-5 text-sm text-black/40">No starters scheduled.</p>}
                    </div>
                    {d.benchGames.length > 0 && <p className="mt-3 text-xs leading-5 text-amber-800">Bench conflicts: {d.benchGames.map((p) => p.player.name).join(", ")}</p>}
                  </div>;
                })}
              </div>
            </div>
            <div className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-lg font-semibold">2026–27 actuals and remaining games</h3><p className="mt-1 text-xs text-black/45">Current-season averages update directly from ESPN. NBA game box scores can include benched players; only the official matchup score above counts points toward your fantasy matchup.</p></div>
                <div className="flex gap-2">{(["mine","opp"] as const).map((side) => <button key={side} type="button" onClick={() => setRosterTab(side)} className={"rounded-full px-4 py-2 text-xs font-semibold " + (rosterTab === side ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-black/60")}>{side === "mine" ? "My roster" : "Opponent"}</button>)}</div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b border-black/[0.07] bg-[#fbfbfd] text-xs uppercase text-black/40"><tr><th className="px-3 py-3">Player</th><th className="px-3 py-3 text-right">2027 actual AVG</th><th className="px-3 py-3 text-right">Forecast AVG</th><th className="px-3 py-3 text-center">NBA games played / left</th><th className="px-3 py-3 text-center">Future starts</th><th className="px-3 py-3 text-right">NBA actual pts</th><th className="px-3 py-3 text-right">Future pts</th></tr></thead>
                  <tbody>{rankedPlayerRows.map((p) => <tr key={p.player.id} className="border-b border-black/[0.05] last:border-0"><td className="px-3 py-3"><div className="font-semibold">{p.player.name}</div><div className="mt-0.5 text-xs text-black/40">{p.player.injuryStatus ?? "ACTIVE"} · {p.seasonGames} season game{p.seasonGames === 1 ? "" : "s"}{p.source !== "ESPN 2027" ? " · " + p.source + " fallback" : ""}</div></td><td className="px-3 py-3 text-right font-semibold text-[#0071e3]">{p.seasonActual == null ? "—" : p.seasonActual.toFixed(1)}</td><td className="px-3 py-3 text-right font-medium">{p.ppg ? p.ppg.toFixed(1) : "—"}</td><td className="px-3 py-3 text-center">{p.nbaPlayed} / {p.scheduled}</td><td className="px-3 py-3 text-center">{p.starts}</td><td className="px-3 py-3 text-right">{fmt(Object.values(p.actualByDay).reduce((sum, v) => sum + v, 0))}</td><td className="px-3 py-3 text-right font-semibold">{fmt(p.weekly)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </section>}
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/fantasy/outlook" className="group rounded-[20px] bg-[#1d1d1f] p-5 text-white"><p className="text-xs font-medium text-white/55">NBA schedule heatmap</p><div className="mt-2 flex justify-between font-semibold">Explore every team’s six-week games<ChevronRight className="h-5 w-5" /></div></Link>
            <Link href="/fantasy/draft/live" className="group rounded-[20px] border border-black/[0.06] bg-white p-5"><p className="text-xs text-black/40">Your draft research</p><div className="mt-2 flex justify-between font-semibold">Revisit player value and notes<ChevronRight className="h-5 w-5" /></div></Link>
          </div>
        </>}
        {!feed && !pending && <p className="py-5 text-sm text-black/45">Refresh ESPN to retry. The matchup dashboard never displays simulated team identities or fabricated scores.</p>}
        <footer className="border-t border-black/[0.06] pt-5 text-xs leading-5 text-black/40">Actual scores and player averages: live ESPN. Future game scores: weighted ESPN projections with the current season's real results as the sample grows. Ten-slot daily lineup optimization uses all eligible active roster players, including those presently on the bench, but excludes IR slots. Refreshed automatically every two minutes while the dashboard is open.</footer>
      </div>
    </main>
  );
}
