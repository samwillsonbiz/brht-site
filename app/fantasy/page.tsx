"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, CalendarDays, ChevronRight, RefreshCw, ShieldAlert, Target, Users, Zap } from "lucide-react";

type Stats = { id: string | null; statSourceId: number | null; statSplitTypeId: number | null; appliedAverage: number | null };
type EspnPlayer = { id: number; name: string; fantasyTeamId: number; proTeamId: number | null; eligibleSlots: number[]; defaultPositionId: number | null; injuryStatus: string | null; stats: Stats[] };
type Matchup = { id: number | null; week: number; homeId: number | null; awayId: number | null; home: string | null; away: string | null };
type EspnTeams = { ok: boolean; leagueId: number; myTeamId: number; teams: { id: number; name: string; players: number }[]; matchups: Matchup[] };
type Game = { id: string; gameDateEt: string; home: { id: number }; away: { id: number } };
type Feed = { league: EspnTeams; players: EspnPlayer[]; games: Game[]; updated: string; cachedGames: number };
type PlannedPlayer = { player: EspnPlayer; ppg: number; source: "ESPN 2027" | "2026 actual" | "missing"; days: boolean[] };
type Start = { player: PlannedPlayer; slot: string };
type DayPlan = { date: string; starters: Start[]; benchGames: PlannedPlayer[]; scheduled: number; projected: number };
type TeamPlan = { teamId: number; players: PlannedPlayer[]; days: DayPlan[]; projected: number; starts: number; scheduled: number; lost: number; missing: number; flagged: number };
type WeekPlan = { week: number; start: string; end: string; opponentId: number | null; opponentName: string; mine: TeamPlan; opponent: TeamPlan; validMatchup: boolean };

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
  const annual = (player.stats ?? []).find((s) => s.id === "102027" && s.statSourceId === 1 && s.statSplitTypeId === 0 && Number(s.appliedAverage) > 0);
  if (annual) return { ppg: Number(annual.appliedAverage), source: "ESPN 2027" as const };
  const actual = (player.stats ?? []).find((s) => s.id === "002026" && s.statSourceId === 0 && Number(s.appliedAverage) > 0);
  if (actual) return { ppg: Number(actual.appliedAverage), source: "2026 actual" as const };
  return { ppg: 0, source: "missing" as const };
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
  const playing = team.filter((p) => p.days[index] && !["OUT", "INJURY_RESERVE", "IR", "SUSPENSION"].includes((p.player.injuryStatus ?? "").toUpperCase()));
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
  return { date, starters: best.starters, benchGames: playing.filter((p) => !used.has(p.player.id)), scheduled: playing.length, projected: best.score };
}
function teamPlan(teamId: number, weekStart: string, players: EspnPlayer[], games: Game[]): TeamPlan {
  const schedule = new Map<number, Set<string>>();
  for (const game of games) {
    if (game.gameDateEt < weekStart || game.gameDateEt > datePlus(weekStart, 6)) continue;
    for (const team of [game.home.id, game.away.id]) {
      if (!team) continue;
      const dates = schedule.get(team) ?? new Set<string>();
      dates.add(game.gameDateEt);
      schedule.set(team, dates);
    }
  }
  const owned = players.filter((p) => p.fantasyTeamId === teamId);
  const mapped: PlannedPlayer[] = owned.map((p) => {
    const projection = ppgFor(p);
    return { player: p, ppg: projection.ppg, source: projection.source, days: Array.from({ length: 7 }, (_, d) => schedule.get(p.proTeamId ?? -1)?.has(datePlus(weekStart, d)) ?? false) };
  });
  const days = Array.from({ length: 7 }, (_, d) => optimizeDay(datePlus(weekStart, d), mapped, d));
  return {
    teamId, players: mapped, days,
    projected: days.reduce((sum, d) => sum + d.projected, 0),
    starts: days.reduce((sum, d) => sum + d.starters.length, 0),
    scheduled: days.reduce((sum, d) => sum + d.scheduled, 0),
    lost: days.reduce((sum, d) => sum + d.benchGames.length, 0),
    missing: mapped.filter((p) => p.source !== "ESPN 2027").length,
    flagged: mapped.filter((p) => p.player.injuryStatus && !["ACTIVE", "NORMAL"].includes(p.player.injuryStatus.toUpperCase())).length,
  };
}
function makeWeeks(feed: Feed): WeekPlan[] {
  const names = new Map(feed.league.teams.map((t) => [t.id, t.name.trim()]));
  const me = feed.league.myTeamId;
  return Array.from({ length: 6 }, (_, idx) => {
    const week = idx + 1, start = datePlus(OPENING_MONDAY, idx * 7);
    const matchup = feed.league.matchups.find((m) => m.week === week && (m.homeId === me || m.awayId === me));
    const opponentId = matchup ? (matchup.homeId === me ? matchup.awayId : matchup.homeId) : null;
    return {
      week, start, end: datePlus(start, 6), opponentId,
      opponentName: opponentId ? names.get(opponentId) ?? "Team " + opponentId : "Unavailable",
      mine: teamPlan(me, start, feed.players, feed.games),
      opponent: teamPlan(opponentId ?? -1, start, feed.players, feed.games),
      validMatchup: opponentId !== null,
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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setPending(true);
      setError(null);
      try {
        const [matchRes, poolRes, scheduleRes] = await Promise.all([
          fetch("/api/fantasy/espn/matchups", { cache: "no-store" }),
          fetch("/api/fantasy/espn/players?limit=500", { cache: "no-store" }),
          fetch("/api/fantasy/forecast/schedule", { cache: "no-store" }),
        ]);
        if (!matchRes.ok || !poolRes.ok || !scheduleRes.ok) throw new Error("The ESPN matchups, player projections, or six-week NBA schedule could not be loaded.");
        const [league, pool, schedule] = await Promise.all([matchRes.json(), poolRes.json(), scheduleRes.json()]);
        if (!league.ok || !pool.ok || !schedule.ok) throw new Error("One of the ESPN data sources reported an error.");
        const owned: EspnPlayer[] = pool.players.filter((p: EspnPlayer) => p.fantasyTeamId > 0);
        if (league.teams.length !== 12 || new Set(owned.map((p) => p.fantasyTeamId)).size !== 12 || owned.filter((p) => p.fantasyTeamId === league.myTeamId).length < 10)
          throw new Error("ESPN has not returned enough current roster data for all 12 teams.");
        if (!schedule.games.length || league.matchups.filter((m: Matchup) => m.week <= 6).length !== 36)
          throw new Error("The first six weeks of matchups or games are incomplete.");
        if (!cancelled) setFeed({ league, players: pool.players, games: schedule.games, updated: new Date().toISOString(), cachedGames: schedule.cachedGames });
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

  const edge = week ? week.mine.projected - week.opponent.projected : 0;
  const available = !pending && !!feed && !error;
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
          <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0071e3]"><Target className="h-4 w-4" /> 2026–27 season</div><h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">Your next six matchups.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">Your real ESPN opponents, drafted rosters, NBA game dates, and projected fantasy points with ten-slot daily lineup optimization.</p></div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white px-3 py-2 text-black/60"><Users className="mr-1 inline h-3.5 w-3.5" /> {feed?.league.teams.length ?? "—"} teams</span><span className="rounded-full bg-white px-3 py-2 text-black/60"><CalendarDays className="mr-1 inline h-3.5 w-3.5" /> {feed?.games.length ?? "—"} NBA games</span><span className="rounded-full bg-white px-3 py-2 text-black/60">{feed ? "Current rosters loaded" : "Awaiting ESPN"}</span></div>
        </section>
        {pending && !feed && <div className="rounded-2xl bg-white p-7 text-sm text-black/55"><RefreshCw className="mr-2 inline h-4 w-4 animate-spin" />Loading ESPN opponents, drafted rosters and game schedule…</div>}
        {error && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900"><ShieldAlert className="mr-2 inline h-4 w-4" />{error}{feed ? " Last synced data remains displayed." : " No fictional roster data is substituted."}</div>}
        {!!weeks.length && <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {weeks.map((w, i) => {
              const delta = w.mine.projected - w.opponent.projected;
              return <button type="button" key={w.week} onClick={() => {setSelectedWeek(i);setSelectedDay(1);setRosterTab("mine");}} className={"rounded-[22px] border p-4 text-left transition hover:shadow-md " + (selectedWeek === i ? "border-[#0071e3]/35 bg-[#eaf4ff] ring-1 ring-[#0071e3]/15" : "border-black/[0.06] bg-white")}>
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#0071e3]">WEEK {w.week}</span><span className="text-xs text-black/45">{formatDate(w.start)} – {formatDate(w.end)}</span></div>
                <div className="mt-2 truncate text-[15px] font-semibold">{w.opponentName}</div>
                <div className="mt-3 flex items-center justify-between"><span className="text-2xl font-semibold text-[#0071e3]">{fmt(w.mine.projected)}</span><span className="text-xs text-black/30">vs</span><span className="text-2xl font-semibold text-[#f05b52]">{fmt(w.opponent.projected)}</span></div>
                <div className={"mt-2 text-xs font-semibold " + (delta >= 0 ? "text-emerald-700" : "text-red-600")}>{delta >= 0 ? "+" : ""}{fmt(delta)} edge · {w.mine.starts} vs {w.opponent.starts} starts</div>
              </button>;
            })}
          </section>
          {week && <section className="space-y-5">
            <div className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div><div className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Week {week.week} · {formatDate(week.start)}–{formatDate(week.end)}</div><h2 className="mt-1 text-xl font-semibold md:text-2xl">{mineName} vs {otherName}</h2></div>
                <span className={"rounded-full px-3 py-2 text-xs font-semibold " + (edge >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{edge >= 0 ? <ArrowUp className="mr-1 inline h-3 w-3" /> : <ArrowDown className="mr-1 inline h-3 w-3" />}{edge >= 0 ? "+" : ""}{fmt(edge)} projected edge</span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y border-black/[0.06] py-5">
                <div><p className="truncate text-xs font-medium text-black/45">{mineName}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-[#0071e3] md:text-4xl">{fmt(week.mine.projected)}</p><p className="mt-1 text-xs text-black/45">{week.mine.starts} optimized starts · {week.mine.scheduled} scheduled</p></div>
                <div className="text-right"><p className="truncate text-xs font-medium text-black/45">{otherName}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-[#f05b52] md:text-4xl">{fmt(week.opponent.projected)}</p><p className="mt-1 text-xs text-black/45">{week.opponent.starts} optimized starts · {week.opponent.scheduled} scheduled</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-black/65">My bench conflicts: {week.mine.lost} games</span>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-black/65">Opponent bench conflicts: {week.opponent.lost}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">Injury flags: {week.mine.flagged} mine · {week.opponent.flagged} opponent</span>
                {(week.mine.missing + week.opponent.missing > 0) && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">{week.mine.missing + week.opponent.missing} players use prior-season fallback / have no projection</span>}
              </div>
              <p className="mt-3 text-xs leading-5 text-black/45">Projected scores, not guarantees. ESPN 2026–27 per-game forecasts are used in your league’s scoring system. All non-OUT/day-to-day players are assumed available; actual absences, minutes limits and lineup decisions may materially change results. Missing ESPN projections use last season’s actual average when available. No season results are being treated as actuals yet.</p>
            </div>
            <div className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <h3 className="text-lg font-semibold">Day-by-day game plan</h3>
              <p className="mt-1 text-xs text-black/45">Tap a day to see the optimal ten-slot lineup. Daily scores assume ESPN-projected production when active.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {week.mine.days.map((d, i) => {
                  const their = week.opponent.days[i];
                  const diff = d.projected - their.projected;
                  return <button type="button" key={d.date} onClick={() => setSelectedDay(i)} className={"rounded-[16px] border px-3 py-3 text-left " + (selectedDay === i ? "border-[#0071e3] bg-[#eef6ff]" : "border-black/[0.06] bg-[#fafafa]")}>
                    <div className="flex justify-between gap-1 text-xs font-semibold">{DAY_NAMES[i]}<span className="font-normal text-black/35">{formatDate(d.date)}</span></div>
                    <div className="mt-2 text-base font-semibold text-[#0071e3]">{fmt(d.projected)}</div><div className="text-xs font-medium text-[#f05b52]">{fmt(their.projected)}</div>
                    <div className={"mt-2 text-[11px] font-semibold " + (diff >= 0 ? "text-emerald-700" : "text-red-600")}>{diff >= 0 ? "+" : ""}{fmt(diff)} edge</div>
                    <div className="mt-1 text-[10px] text-black/40">{d.starters.length} vs {their.starters.length} starts</div>
                  </button>;
                })}
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {([{ label: mineName, plan: week.mine, color: "text-[#0071e3]" }, { label: otherName, plan: week.opponent, color: "text-[#f05b52]" }]).map((item) => {
                  const d = item.plan.days[selectedDay];
                  return <div key={item.label} className="rounded-[18px] bg-[#f7f7f9] p-4">
                    <div className="flex items-center justify-between"><p className="min-w-0 truncate font-semibold">{item.label}</p><p className={"font-semibold " + item.color}>{fmt(d.projected)} pts</p></div>
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
                <div><h3 className="text-lg font-semibold">Roster game volume and projected contributions</h3><p className="mt-1 text-xs text-black/45">Find heavy weeks, inactive players and potential streaming opportunities.</p></div>
                <div className="flex gap-2">{(["mine","opp"] as const).map((side) => <button key={side} type="button" onClick={() => setRosterTab(side)} className={"rounded-full px-4 py-2 text-xs font-semibold " + (rosterTab === side ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-black/60")}>{side === "mine" ? "My roster" : "Opponent"}</button>)}</div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b border-black/[0.07] bg-[#fbfbfd] text-xs uppercase text-black/40"><tr><th className="px-3 py-3">Player</th><th className="px-3 py-3 text-right">ESPN PPG</th><th className="px-3 py-3 text-center">NBA games</th><th className="px-3 py-3 text-center">Usable starts</th><th className="px-3 py-3 text-right">Week pts</th></tr></thead>
                  <tbody>{rankedPlayerRows.map((p) => <tr key={p.player.id} className="border-b border-black/[0.05] last:border-0"><td className="px-3 py-3"><div className="font-semibold">{p.player.name}</div><div className="mt-0.5 text-xs text-black/40">{p.player.injuryStatus ?? "ACTIVE"}{p.source !== "ESPN 2027" ? " · " + p.source + " fallback" : ""}</div></td><td className="px-3 py-3 text-right font-medium">{p.ppg ? p.ppg.toFixed(1) : "—"}</td><td className="px-3 py-3 text-center">{p.scheduled}</td><td className="px-3 py-3 text-center">{p.starts}</td><td className="px-3 py-3 text-right font-semibold">{fmt(p.weekly)}</td></tr>)}</tbody>
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
        <footer className="border-t border-black/[0.06] pt-5 text-xs leading-5 text-black/40">Planning model: maximum projected fantasy points across PG, SG, SF, PF, C, G, F and three UTIL slots each day. Out/IR players excluded; DTD assumes available. Projections are preseason estimates, not ESPN official matchup probabilities.</footer>
      </div>
    </main>
  );
}
