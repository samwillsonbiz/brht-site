"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const appleFont =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

type WeekDef = { index: number; start: string; end: string };
type TeamSchedule = {
  id: number;
  abbreviation: string | null;
  displayName: string | null;
  total: number;
  weeks: number[];
};
type OutlookResponse = {
  ok: boolean;
  from?: string;
  to?: string;
  weeks?: WeekDef[];
  teams?: TeamSchedule[];
  gameCount?: number;
};
type Player = {
  id: number | null;
  name: string | null;
  fantasyTeamId: number;
  proTeamId: number | null;
  injuryStatus: string | null;
  percentOwned: number | null;
  averageDraftPosition?: number | null;
};
type PlayerPoolResponse = { ok: boolean; count?: number; players?: Player[] };
type LeagueResponse = {
  ok: boolean;
  authenticated?: boolean;
  league?: { name?: string | null; teamCount?: number };
  draft?: { drafted?: boolean };
  myTeam?: { id?: number; name?: string | null } | null;
  teams?: Array<{ id?: number; name?: string | null }>;
};

function shortDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function gameTone(games: number) {
  if (games >= 5) return "bg-emerald-500 text-white";
  if (games === 4) return "bg-[#0071e3] text-white";
  if (games === 3) return "bg-[#f5f5f7] text-black/70";
  if (games === 2) return "bg-amber-100 text-amber-800";
  if (games <= 1) return "bg-red-50 text-red-700";
  return "bg-[#f5f5f7] text-black/60";
}

export default function FantasyOutlookPage() {
  const [outlook, setOutlook] = useState<OutlookResponse | null>(null);
  const [pool, setPool] = useState<PlayerPoolResponse | null>(null);
  const [league, setLeague] = useState<LeagueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);

  async function refresh() {
    setLoading(true);
    try {
      const [outlookRes, poolRes, leagueRes] = await Promise.all([
        fetch("/api/fantasy/espn/schedule-outlook?weeks=6", { cache: "no-store" }),
        fetch("/api/fantasy/espn/players?limit=500", { cache: "no-store" }),
        fetch("/api/fantasy/espn", { cache: "no-store" }),
      ]);
      setOutlook(await outlookRes.json());
      setPool(await poolRes.json());
      setLeague(await leagueRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const teamById = useMemo(
    () => new Map((outlook?.teams ?? []).map((team) => [team.id, team])),
    [outlook],
  );
  const fantasyTeamById = useMemo(
    () => new Map((league?.teams ?? []).map((team) => [team.id, team.name])),
    [league],
  );

  const week = outlook?.weeks?.[selectedWeek];
  const rankedTeams = useMemo(() => {
    return [...(outlook?.teams ?? [])].sort(
      (a, b) => (b.weeks[selectedWeek] ?? 0) - (a.weeks[selectedWeek] ?? 0) || (a.abbreviation ?? "").localeCompare(b.abbreviation ?? ""),
    );
  }, [outlook, selectedWeek]);

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const players = pool?.players ?? [];
    const filtered = q ? players.filter((player) => player.name?.toLowerCase().includes(q)) : players;
    return filtered
      .filter((player) => player.proTeamId && teamById.has(player.proTeamId))
      .sort((a, b) => {
        const teamA = a.proTeamId ? teamById.get(a.proTeamId) : undefined;
        const teamB = b.proTeamId ? teamById.get(b.proTeamId) : undefined;
        return (teamB?.total ?? 0) - (teamA?.total ?? 0) || (a.name ?? "").localeCompare(b.name ?? "");
      })
      .slice(0, q ? 80 : 36);
  }, [pool, query, teamById]);

  const fourGameTeams = rankedTeams.filter((team) => (team.weeks[selectedWeek] ?? 0) >= 4).length;
  const lightTeams = rankedTeams.filter((team) => (team.weeks[selectedWeek] ?? 0) <= 2).length;

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: appleFont }}>
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/fantasy" className="shrink-0 text-sm font-semibold tracking-tight">
              Fantasy Lab
            </Link>
            <nav className="hidden items-center gap-1 rounded-full bg-black/[0.04] p-1 md:flex">
              <Link href="/fantasy" className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black">Matchup</Link>
              <Link href="/fantasy/outlook" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">6-Week Outlook</Link>
              <Link href="/fantasy/admin" className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black">Admin</Link>
            </nav>
          </div>
          <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync ESPN
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8 md:py-10">
        <section className="overflow-hidden rounded-[30px] border border-black/[0.05] bg-white shadow-[0_16px_60px_rgba(0,0,0,0.05)]">
          <div className="grid gap-8 p-7 md:grid-cols-[1.35fr_.65fr] md:p-10">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0071e3]">
                <Sparkles className="h-4 w-4" /> Season Planning
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                See the schedule advantage before everyone else does.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-black/50 md:text-lg">
                ESPN now supplies the NBA schedule automatically. This view looks six weeks ahead so trades, draft choices and future streams can be judged by usable opportunity—not just player average.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">ESPN connected</span>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 font-medium text-black/60">{league?.league?.name ?? "Fantasy league"}</span>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 font-medium text-black/60">{league?.draft?.drafted ? "Rosters live" : "Pre-draft mode"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 self-end">
              <HeroMetric label="NBA games loaded" value={String(outlook?.gameCount ?? "—")} />
              <HeroMetric label="Players indexed" value={String(pool?.count ?? "—")} />
              <HeroMetric label="Fantasy teams" value={String(league?.league?.teamCount ?? "—")} />
              <HeroMetric label="Weeks ahead" value={String(outlook?.weeks?.length ?? 6)} />
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-6">
          {(outlook?.weeks ?? Array.from({ length: 6 }, (_, i) => ({ index: i + 1, start: "", end: "" }))).map((item, index) => (
            <button
              key={item.index}
              onClick={() => setSelectedWeek(index)}
              className={`rounded-[20px] border p-4 text-left transition ${selectedWeek === index ? "border-[#0071e3]/25 bg-white shadow-[0_8px_30px_rgba(0,113,227,.10)]" : "border-black/[0.05] bg-white/70 hover:bg-white"}`}
            >
              <div className={`text-xs font-semibold ${selectedWeek === index ? "text-[#0071e3]" : "text-black/40"}`}>WEEK {item.index}</div>
              <div className="mt-1 text-sm font-semibold">{item.start ? `${shortDate(item.start)} – ${shortDate(item.end)}` : "Loading…"}</div>
            </button>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InsightCard icon={<CalendarDays className="h-5 w-5" />} label="Selected week" value={week ? `${shortDate(week.start)} – ${shortDate(week.end)}` : "—"} detail="Monday through Sunday" />
          <InsightCard icon={<TrendingUp className="h-5 w-5" />} label="High-volume teams" value={String(fourGameTeams)} detail="4+ games this week" />
          <InsightCard icon={<CircleDot className="h-5 w-5" />} label="Low-volume teams" value={String(lightTeams)} detail="2 or fewer games" />
        </section>

        <section className="rounded-[26px] border border-black/[0.05] bg-white shadow-[0_12px_40px_rgba(0,0,0,.04)]">
          <div className="flex flex-col gap-2 border-b border-black/[0.06] p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">Schedule map</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">NBA teams by week</h2>
              <p className="mt-1 text-sm text-black/50">A quick heatmap of future game volume. Four-game weeks are blue; five-game weeks are green.</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-black/45">
              <span className="h-2.5 w-2.5 rounded-full bg-red-100" /> 0–1
              <span className="ml-2 h-2.5 w-2.5 rounded-full bg-amber-100" /> 2
              <span className="ml-2 h-2.5 w-2.5 rounded-full bg-[#0071e3]" /> 4
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-black/40">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">NBA Team</th>
                  {(outlook?.weeks ?? []).map((item) => <th key={item.index} className="px-3 py-3 text-center font-medium">W{item.index}</th>)}
                  <th className="px-6 py-3 text-right font-medium">6W Total</th>
                </tr>
              </thead>
              <tbody>
                {[...(outlook?.teams ?? [])].sort((a, b) => (a.abbreviation ?? "").localeCompare(b.abbreviation ?? "")).map((team) => (
                  <tr key={team.id} className="border-b border-black/[0.045] last:border-0">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold">{team.abbreviation ?? "—"}</div>
                      <div className="text-xs text-black/40">{team.displayName ?? ""}</div>
                    </td>
                    {team.weeks.map((games, index) => (
                      <td key={index} className="px-3 py-3 text-center">
                        <button onClick={() => setSelectedWeek(index)} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${gameTone(games)} ${selectedWeek === index ? "ring-2 ring-black/10 ring-offset-2" : ""}`}>{games}</button>
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right text-base font-semibold">{team.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[26px] border border-black/[0.05] bg-white shadow-[0_12px_40px_rgba(0,0,0,.04)]">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">Player schedule fit</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Look up any player</h2>
              <p className="mt-1 max-w-2xl text-sm text-black/50">Before the draft this is a schedule research tool. After the draft, the same table will also know who owns each player.</p>
            </div>
            <label className="flex min-w-[290px] items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2.5 text-sm">
              <Search className="h-4 w-4 text-black/35" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Maxey, Jokic, Curry…" className="w-full bg-transparent outline-none placeholder:text-black/35" />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-black/40">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Player</th>
                  <th className="px-3 py-3 text-left font-medium">NBA</th>
                  {(outlook?.weeks ?? []).map((item) => <th key={item.index} className="px-3 py-3 text-center font-medium">W{item.index}</th>)}
                  <th className="px-3 py-3 text-center font-medium">Total</th>
                  <th className="px-6 py-3 text-right font-medium">Fantasy owner</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const team = player.proTeamId ? teamById.get(player.proTeamId) : undefined;
                  const owner = player.fantasyTeamId ? fantasyTeamById.get(player.fantasyTeamId) ?? `Team ${player.fantasyTeamId}` : "Unassigned";
                  return (
                    <tr key={player.id ?? player.name} className="border-b border-black/[0.045] last:border-0">
                      <td className="px-6 py-3.5">
                        <div className="font-semibold">{player.name ?? "Unknown"}</div>
                        <div className="text-xs text-black/40">{player.injuryStatus ?? "Active"}{player.percentOwned == null ? "" : ` · ${player.percentOwned.toFixed(0)}% owned`}</div>
                      </td>
                      <td className="px-3 py-3 font-medium text-black/60">{team?.abbreviation ?? "—"}</td>
                      {(team?.weeks ?? Array.from({ length: outlook?.weeks?.length ?? 6 }, () => 0)).map((games, index) => (
                        <td key={index} className="px-3 py-3 text-center"><span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${gameTone(games)}`}>{games}</span></td>
                      ))}
                      <td className="px-3 py-3 text-center text-base font-semibold">{team?.total ?? 0}</td>
                      <td className="px-6 py-3 text-right"><span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs text-black/55">{owner}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link href="/fantasy" className="group rounded-[24px] bg-[#1d1d1f] p-6 text-white">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Current week</div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div><h3 className="text-2xl font-semibold">Matchup Forecast</h3><p className="mt-1 text-sm text-white/50">Lineups, projections and streaming scenarios.</p></div>
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>
          </Link>
          <Link href="/fantasy/admin" className="group rounded-[24px] border border-black/[0.06] bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Data management</div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div><h3 className="text-2xl font-semibold">Admin Console</h3><p className="mt-1 text-sm text-black/45">ESPN sync, ownership and manual overrides.</p></div>
              <ChevronRight className="h-5 w-5 text-black/35 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </section>

        <footer className="flex flex-col gap-2 border-t border-black/[0.06] py-6 text-xs text-black/35 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Schedule data supplied automatically by ESPN.</div>
          <div>{outlook?.from && outlook?.to ? `${shortDate(outlook.from)} through ${shortDate(outlook.to)}` : "Loading schedule…"}</div>
        </footer>
      </div>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[20px] bg-[#f5f5f7] p-4"><div className="text-2xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-xs text-black/45">{label}</div></div>;
}

function InsightCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-[22px] border border-black/[0.05] bg-white p-5"><div className="flex items-center justify-between"><div className="text-black/35">{icon}</div><div className="text-xs text-black/35">{label}</div></div><div className="mt-5 text-2xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-xs text-black/40">{detail}</div></div>;
}
