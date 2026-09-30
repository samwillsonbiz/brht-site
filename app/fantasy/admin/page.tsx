"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Database,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

const appleFont =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

type EspnStatus = {
  ok: boolean;
  authenticated?: boolean;
  league?: {
    name?: string | null;
    scoringPeriodId?: number | null;
    currentMatchupPeriod?: number | null;
    teamCount?: number;
  };
  draft?: { drafted?: boolean; inProgress?: boolean };
  rosterStatus?: string;
  myTeam?: { id?: number; name?: string; abbreviation?: string } | null;
};

type EspnPlayer = {
  id: number | null;
  name: string | null;
  fantasyTeamId: number;
  proTeamId: number | null;
  defaultPositionId: number | null;
  eligibleSlots: number[];
  injuryStatus: string | null;
  percentOwned: number | null;
};

type PlayerPoolResponse = {
  ok: boolean;
  count?: number;
  players?: EspnPlayer[];
};

type NbaTeam = {
  id: number;
  abbreviation: string | null;
  displayName: string | null;
};

type ScheduleResponse = {
  ok: boolean;
  from?: string;
  to?: string;
  gameCount?: number;
  teams?: NbaTeam[];
};

type DbStatus = {
  ok: boolean;
  configured?: boolean;
  counts?: {
    leagues?: number;
    fantasyTeams?: number;
    players?: number;
    nbaTeams?: number;
    nbaGames?: number;
    rosterAssignments?: number;
  };
  lastSync?: {
    sync_type?: string;
    started_at?: string;
    completed_at?: string;
    success?: boolean;
    detail?: Record<string, unknown>;
  } | null;
  message?: string;
};

type SyncResponse = {
  ok: boolean;
  message?: string;
  synced?: {
    fantasyTeams?: number;
    players?: number;
    nbaTeams?: number;
    nbaGames?: number;
  };
};

function formatTimestamp(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FantasyAdminPage() {
  const [status, setStatus] = useState<EspnStatus | null>(null);
  const [pool, setPool] = useState<PlayerPoolResponse | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [db, setDb] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const [statusRes, poolRes, scheduleRes, dbRes] = await Promise.all([
        fetch("/api/fantasy/espn", { cache: "no-store" }),
        fetch("/api/fantasy/espn/players?limit=500", { cache: "no-store" }),
        fetch("/api/fantasy/espn/nba-schedule", { cache: "no-store" }),
        fetch("/api/fantasy/db/status", { cache: "no-store" }),
      ]);
      setStatus(await statusRes.json());
      setPool(await poolRes.json());
      setSchedule(await scheduleRes.json());
      setDb(await dbRes.json());
    } finally {
      setLoading(false);
    }
  }

  async function syncDatabase() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/fantasy/sync/bootstrap", {
        method: "POST",
        cache: "no-store",
      });
      const body = (await response.json()) as SyncResponse;
      if (!response.ok || !body.ok) {
        throw new Error(body.message || "Database sync failed.");
      }
      setSyncMessage(
        `Synced ${body.synced?.players ?? 0} players, ${body.synced?.nbaGames ?? 0} NBA games and ${body.synced?.fantasyTeams ?? 0} fantasy teams.`,
      );
      await refresh();
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Database sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const teamById = useMemo(
    () => new Map((schedule?.teams ?? []).map((team) => [team.id, team])),
    [schedule],
  );

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const players = pool?.players ?? [];
    if (!q) return players.slice(0, 80);
    return players
      .filter((player) => player.name?.toLowerCase().includes(q))
      .slice(0, 80);
  }, [pool, query]);

  const databaseReady = Boolean(db?.ok && db?.configured);
  const persistedPlayers = db?.counts?.players ?? 0;
  const lastSyncAt = db?.lastSync?.completed_at ?? db?.lastSync?.started_at ?? null;

  return (
    <main
      className="min-h-screen bg-[#f5f5f7] pb-14 text-[#1d1d1f]"
      style={{ fontFamily: appleFont }}
    >
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/fantasy" className="shrink-0 text-sm font-semibold tracking-tight">
              Fantasy Lab
            </Link>
            <nav className="hidden items-center gap-1 rounded-full bg-black/[0.04] p-1 md:flex">
              <Link href="/fantasy" className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black">Matchup</Link>
              <Link href="/fantasy/draft" className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black">Draft</Link>
              <Link href="/fantasy/outlook" className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black">6-Week Outlook</Link>
              <Link href="/fantasy/admin" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">Admin</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading || syncing}
              className="hidden items-center gap-2 rounded-full bg-[#f2f2f7] px-4 py-2 text-xs font-semibold text-black/60 disabled:opacity-50 sm:inline-flex"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh view
            </button>
            <button
              onClick={syncDatabase}
              disabled={syncing || !status?.authenticated || !databaseReady}
              className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              <Cloud className={`h-3.5 w-3.5 ${syncing ? "animate-pulse" : ""}`} />
              {syncing ? "Syncing…" : "Sync database"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8 md:py-10">
        <section className="overflow-hidden rounded-[30px] border border-black/[0.05] bg-white shadow-[0_16px_60px_rgba(0,0,0,0.05)]">
          <div className="grid gap-8 p-7 md:grid-cols-[1.2fr_.8fr] md:p-10">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0071e3]">
                <Database className="h-4 w-4" /> Data Control Center
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                ESPN in. Fantasy Lab out.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/50">
                ESPN remains the live source for players, league data and scheduling. Supabase now stores the durable history we need for results, ownership changes, projections and future scenarios.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                <span className={`rounded-full px-3 py-1.5 ${status?.authenticated ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  ESPN {status?.authenticated ? "connected" : "offline"}
                </span>
                <span className={`rounded-full px-3 py-1.5 ${databaseReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  Database {databaseReady ? "connected" : "not ready"}
                </span>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-black/60">
                  {status?.draft?.drafted ? "Rosters live" : "Pre-draft mode"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 self-end">
              <HeroMetric label="Players persisted" value={String(persistedPlayers)} />
              <HeroMetric label="NBA games stored" value={String(db?.counts?.nbaGames ?? 0)} />
              <HeroMetric label="Fantasy teams" value={String(db?.counts?.fantasyTeams ?? 0)} />
              <HeroMetric label="Last database sync" value={lastSyncAt ? formatTimestamp(lastSyncAt) : "Not yet"} compact />
            </div>
          </div>
        </section>

        {syncMessage && (
          <section className="rounded-[20px] border border-[#0071e3]/15 bg-[#f7fbff] px-5 py-4 text-sm font-medium text-[#005bb5]">
            {syncMessage}
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatusCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="ESPN connection"
            value={status?.ok && status?.authenticated ? "Authenticated" : "Offline"}
            detail={status?.league?.name ?? "Fantasy league"}
          />
          <StatusCard
            icon={<Database className="h-5 w-5" />}
            label="Supabase"
            value={databaseReady ? "Connected" : "Offline"}
            detail={db?.message ?? "Fantasy Lab database"}
          />
          <StatusCard
            icon={<Users className="h-5 w-5" />}
            label="Fantasy teams"
            value={String(status?.league?.teamCount ?? "—")}
            detail={status?.myTeam?.name ?? "Your team"}
          />
          <StatusCard
            icon={<Activity className="h-5 w-5" />}
            label="ESPN player pool"
            value={String(pool?.count ?? "—")}
            detail={`${persistedPlayers} stored in database`}
          />
          <StatusCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="NBA schedule"
            value={String(schedule?.gameCount ?? "—")}
            detail={`${db?.counts?.nbaGames ?? 0} games persisted`}
          />
        </section>

        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {status?.draft?.drafted ? "In-season mode" : "Preseason mode"}
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {status?.draft?.drafted ? "Roster ownership can now sync from ESPN" : "Build the database before the draft"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">
                {status?.draft?.drafted
                  ? "Fantasy ownership is now another dated layer on top of the permanent player and NBA schedule records."
                  : "ESPN ownership is intentionally empty until your league drafts. Player identity, NBA-team assignment and the NBA schedule can already be stored now. Once the draft finishes, ownership can begin without rebuilding the database."}
              </p>
            </div>
            <button
              onClick={syncDatabase}
              disabled={syncing || !status?.authenticated || !databaseReady}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {persistedPlayers > 0 ? "Sync ESPN → Database" : "Run first database sync"}
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-black/[0.06] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-black/45">
                <Database className="h-4 w-4" /> ESPN Player Database
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Players</h2>
              <p className="mt-1 text-sm text-black/50">
                Ownership will populate automatically after the draft. NBA team assignment stays independent from fantasy ownership.
              </p>
            </div>
            <label className="flex min-w-[280px] items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2.5 text-sm">
              <Search className="h-4 w-4 text-black/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search players"
                className="w-full bg-transparent outline-none placeholder:text-black/35"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-black/40">
                <tr>
                  <th className="px-6 py-3 font-medium">Player</th>
                  <th className="px-4 py-3 font-medium">NBA Team</th>
                  <th className="px-4 py-3 font-medium">Fantasy Owner</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Owned</th>
                  <th className="px-6 py-3 text-right font-medium">ESPN ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const nbaTeam = player.proTeamId ? teamById.get(player.proTeamId) : null;
                  return (
                    <tr key={player.id ?? player.name} className="border-b border-black/[0.045] last:border-0">
                      <td className="px-6 py-4 font-medium">{player.name ?? "Unknown"}</td>
                      <td className="px-4 py-4 text-black/60">
                        {nbaTeam?.abbreviation ?? (player.proTeamId ? `Team ${player.proTeamId}` : "—")}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs text-black/55">
                          {player.fantasyTeamId ? `Team ${player.fantasyTeamId}` : "Unassigned"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-black/60">{player.injuryStatus ?? "Active"}</td>
                      <td className="px-4 py-4 text-right text-black/60">
                        {player.percentOwned == null ? "—" : `${player.percentOwned.toFixed(1)}%`}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-black/40">
                        {player.id ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function HeroMetric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[20px] bg-[#f5f5f7] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/35">{label}</div>
      <div className={`mt-2 font-semibold tracking-tight ${compact ? "text-lg" : "text-3xl"}`}>{value}</div>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.035)]">
      <div className="flex items-center gap-2 text-sm text-black/45">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 truncate text-sm text-black/45">{detail}</div>
    </div>
  );
}
