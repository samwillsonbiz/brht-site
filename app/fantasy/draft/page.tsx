"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  RefreshCw,
  Search,
  Sparkles,
  Star,
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
  weeks?: WeekDef[];
  teams?: TeamSchedule[];
  gameCount?: number;
};
type Player = {
  id: number | null;
  name: string | null;
  fantasyTeamId: number;
  proTeamId: number | null;
  defaultPositionId: number | null;
  eligibleSlots: number[];
  injuryStatus: string | null;
  percentOwned: number | null;
  percentStarted?: number | null;
  averageDraftPosition?: number | null;
  auctionValueAverage?: number | null;
};
type PlayerPoolResponse = { ok: boolean; count?: number; players?: Player[] };
type LeagueResponse = {
  ok: boolean;
  authenticated?: boolean;
  league?: { name?: string | null; teamCount?: number };
  draft?: { drafted?: boolean; inProgress?: boolean };
  myTeam?: { id?: number; name?: string | null } | null;
};

type SortKey = "market" | "schedule" | "owned" | "name";

const POSITION_LABELS: Record<number, string> = {
  1: "PG",
  2: "SG",
  3: "SF",
  4: "PF",
  5: "C",
};

function shortDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function schedulePremium(total: number, average: number) {
  const delta = total - average;
  if (delta >= 2) return { label: `+${delta.toFixed(0)} games`, tone: "text-emerald-700 bg-emerald-50" };
  if (delta <= -2) return { label: `${delta.toFixed(0)} games`, tone: "text-amber-700 bg-amber-50" };
  return { label: "Neutral", tone: "text-black/50 bg-[#f5f5f7]" };
}

export default function FantasyDraftPage() {
  const [outlook, setOutlook] = useState<OutlookResponse | null>(null);
  const [pool, setPool] = useState<PlayerPoolResponse | null>(null);
  const [league, setLeague] = useState<LeagueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("ALL");
  const [sort, setSort] = useState<SortKey>("market");
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());
  const [watchOnly, setWatchOnly] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [outlookRes, poolRes, leagueRes] = await Promise.all([
        fetch("/api/fantasy/espn/schedule-outlook?weeks=6", { cache: "no-store" }),
        fetch("/api/fantasy/espn/players?limit=700", { cache: "no-store" }),
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
    try {
      const saved = JSON.parse(window.localStorage.getItem("fantasy-lab-watchlist") || "[]") as number[];
      setWatchlist(new Set(saved));
    } catch {
      setWatchlist(new Set());
    }
  }, []);

  const teamById = useMemo(
    () => new Map((outlook?.teams ?? []).map((team) => [team.id, team])),
    [outlook],
  );

  const averageSixWeekGames = useMemo(() => {
    const teams = outlook?.teams ?? [];
    return teams.length ? teams.reduce((sum, team) => sum + team.total, 0) / teams.length : 0;
  }, [outlook]);

  const players = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = (pool?.players ?? []).filter((player) => {
      if (!player.id || !player.proTeamId || !teamById.has(player.proTeamId)) return false;
      if (q && !player.name?.toLowerCase().includes(q)) return false;
      if (watchOnly && !watchlist.has(player.id)) return false;
      if (position !== "ALL") {
        const label = POSITION_LABELS[player.defaultPositionId ?? 0] ?? "";
        if (label !== position) return false;
      }
      return true;
    });

    return rows.sort((a, b) => {
      if (sort === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      if (sort === "schedule") {
        const aGames = a.proTeamId ? teamById.get(a.proTeamId)?.total ?? 0 : 0;
        const bGames = b.proTeamId ? teamById.get(b.proTeamId)?.total ?? 0 : 0;
        return bGames - aGames || (a.averageDraftPosition ?? 9999) - (b.averageDraftPosition ?? 9999);
      }
      if (sort === "owned") return (b.percentOwned ?? 0) - (a.percentOwned ?? 0);
      return (a.averageDraftPosition ?? 9999) - (b.averageDraftPosition ?? 9999);
    });
  }, [pool, position, query, sort, teamById, watchOnly, watchlist]);

  function toggleWatch(playerId: number) {
    setWatchlist((current) => {
      const next = new Set(current);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      window.localStorage.setItem("fantasy-lab-watchlist", JSON.stringify(Array.from(next)));
      return next;
    });
  }

  const scheduleLeaders = useMemo(
    () => [...(outlook?.teams ?? [])].sort((a, b) => b.total - a.total).slice(0, 5),
    [outlook],
  );

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: appleFont }}>
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/fantasy" className="shrink-0 text-sm font-semibold tracking-tight">Fantasy Lab</Link>
            <nav className="hidden items-center gap-1 rounded-full bg-black/[0.04] p-1 md:flex">
              <Link href="/fantasy" className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black">Matchup</Link>
              <Link href="/fantasy/draft" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">Draft Board</Link>
              <Link href="/fantasy/outlook" className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black">6-Week Outlook</Link>
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
          <div className="grid gap-8 p-7 md:grid-cols-[1.3fr_.7fr] md:p-10">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0071e3]">
                <Sparkles className="h-4 w-4" /> Preseason Draft Room
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Draft for the season you are actually going to play.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-black/50 md:text-lg">
                ESPN market data plus the real six-week NBA schedule. Use this alongside your player rankings to spot schedule premiums before draft night.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">ESPN authenticated</span>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 font-medium text-black/60">{league?.league?.name ?? "Fantasy League One"}</span>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 font-medium text-black/60">{league?.draft?.drafted ? "Draft complete" : "Draft not started"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 self-end">
              <HeroMetric label="Players indexed" value={String(pool?.count ?? "—")} />
              <HeroMetric label="Fantasy teams" value={String(league?.league?.teamCount ?? "—")} />
              <HeroMetric label="Weeks scanned" value={String(outlook?.weeks?.length ?? 6)} />
              <HeroMetric label="Watchlist" value={String(watchlist.size)} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <div className="rounded-[26px] border border-black/[0.05] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,.04)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
              <CalendarDays className="h-4 w-4" /> Six-week schedule leaders
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              {scheduleLeaders.map((team) => (
                <div key={team.id} className="rounded-[18px] bg-[#f5f5f7] p-4">
                  <div className="text-sm font-semibold">{team.abbreviation ?? "—"}</div>
                  <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{team.total}</div>
                  <div className="mt-1 text-[11px] font-medium text-black/40">games</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] bg-[#1d1d1f] p-6 text-white shadow-[0_12px_40px_rgba(0,0,0,.10)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              <TrendingUp className="h-4 w-4" /> Draft lens
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Schedule is a tiebreaker, not the ranking.</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">The board keeps ESPN ADP as the market signal and shows six-week game volume separately. A player is not promoted just because his NBA team has more games.</p>
          </div>
        </section>

        <section className="rounded-[26px] border border-black/[0.05] bg-white shadow-[0_12px_40px_rgba(0,0,0,.04)]">
          <div className="border-b border-black/[0.06] p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">Live player board</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Draft research</h2>
                <p className="mt-1 text-sm text-black/50">Star players you want to revisit. The watchlist stays on this browser for now and can move into your database once admin writes are connected.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex min-w-[250px] items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2.5 text-sm">
                  <Search className="h-4 w-4 text-black/35" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search players" className="w-full bg-transparent outline-none placeholder:text-black/35" />
                </label>
                <Select value={position} onChange={setPosition} options={["ALL", "PG", "SG", "SF", "PF", "C"]} />
                <Select value={sort} onChange={(value) => setSort(value as SortKey)} options={["market", "schedule", "owned", "name"]} labels={{ market: "ESPN ADP", schedule: "6W schedule", owned: "Owned %", name: "Name" }} />
                <button onClick={() => setWatchOnly((value) => !value)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition ${watchOnly ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-black/60"}`}>
                  <Star className={`h-3.5 w-3.5 ${watchOnly ? "fill-current" : ""}`} /> Watchlist
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-black/40">
                <tr>
                  <th className="w-12 px-4 py-3" />
                  <th className="px-3 py-3 text-left font-medium">Player</th>
                  <th className="px-3 py-3 text-left font-medium">NBA</th>
                  <th className="px-3 py-3 text-center font-medium">Pos</th>
                  <th className="px-3 py-3 text-right font-medium">ESPN ADP</th>
                  <th className="px-3 py-3 text-right font-medium">Owned</th>
                  {(outlook?.weeks ?? []).map((week) => <th key={week.index} className="px-2 py-3 text-center font-medium">W{week.index}</th>)}
                  <th className="px-3 py-3 text-right font-medium">6W</th>
                  <th className="px-6 py-3 text-right font-medium">Schedule</th>
                </tr>
              </thead>
              <tbody>
                {players.slice(0, 180).map((player) => {
                  const team = player.proTeamId ? teamById.get(player.proTeamId) : undefined;
                  const premium = schedulePremium(team?.total ?? 0, averageSixWeekGames);
                  const watched = player.id ? watchlist.has(player.id) : false;
                  return (
                    <tr key={player.id ?? player.name} className="border-b border-black/[0.045] last:border-0 hover:bg-black/[0.015]">
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => player.id && toggleWatch(player.id)} className={`grid h-8 w-8 place-items-center rounded-full transition ${watched ? "bg-amber-50 text-amber-500" : "text-black/20 hover:bg-[#f5f5f7] hover:text-black/50"}`} aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}>
                          <Star className={`h-4 w-4 ${watched ? "fill-current" : ""}`} />
                        </button>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-semibold">{player.name ?? "Unknown"}</div>
                        <div className="mt-0.5 text-[11px] text-black/35">ESPN #{player.id}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-semibold text-black/70">{team?.abbreviation ?? "—"}</div>
                      </td>
                      <td className="px-3 py-3.5 text-center text-black/55">{POSITION_LABELS[player.defaultPositionId ?? 0] ?? "—"}</td>
                      <td className="px-3 py-3.5 text-right font-semibold">{player.averageDraftPosition == null ? "—" : player.averageDraftPosition.toFixed(1)}</td>
                      <td className="px-3 py-3.5 text-right text-black/55">{player.percentOwned == null ? "—" : `${player.percentOwned.toFixed(0)}%`}</td>
                      {(team?.weeks ?? []).map((games, index) => <td key={index} className="px-2 py-3.5 text-center"><span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${games >= 4 ? "bg-[#e8f2ff] text-[#0071e3]" : games <= 2 ? "bg-amber-50 text-amber-700" : "bg-[#f5f5f7] text-black/55"}`}>{games}</span></td>)}
                      <td className="px-3 py-3.5 text-right font-semibold">{team?.total ?? "—"}</td>
                      <td className="px-6 py-3.5 text-right"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${premium.tone}`}>{premium.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && players.length === 0 && <div className="p-10 text-center text-sm text-black/45">No players match these filters.</div>}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <ActionCard icon={<Users className="h-5 w-5" />} title="League ownership" body="After the draft ESPN will automatically assign every drafted player to the correct fantasy team. No manual roster entry." />
          <ActionCard icon={<CalendarDays className="h-5 w-5" />} title="Schedule fit" body="The same six-week engine will later measure usable games against your exact roster, not just raw NBA games." />
          <ActionCard icon={<Check className="h-5 w-5" />} title="Next phase" body="Persist watchlists, manual ownership overrides and draft notes in Supabase so this board follows you across devices." />
        </section>
      </div>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[20px] bg-[#f5f5f7] p-4"><div className="text-[11px] font-medium text-black/40">{label}</div><div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</div></div>;
}

function ActionCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-[22px] border border-black/[0.05] bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,.03)]"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7] text-black/55">{icon}</div><h3 className="mt-4 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-black/45">{body}</p></div>;
}

function Select({ value, onChange, options, labels = {} }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  return <label className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="appearance-none rounded-full bg-[#f5f5f7] py-2.5 pl-4 pr-9 text-xs font-semibold text-black/60 outline-none">{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" /></label>;
}
