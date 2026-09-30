"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
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

export default function FantasyAdminPage() {
  const [status, setStatus] = useState<EspnStatus | null>(null);
  const [pool, setPool] = useState<PlayerPoolResponse | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const [statusRes, poolRes, scheduleRes] = await Promise.all([
        fetch("/api/fantasy/espn", { cache: "no-store" }),
        fetch("/api/fantasy/espn/players?limit=500", { cache: "no-store" }),
        fetch("/api/fantasy/espn/nba-schedule", { cache: "no-store" }),
      ]);
      setStatus(await statusRes.json());
      setPool(await poolRes.json());
      setSchedule(await scheduleRes.json());
    } finally {
      setLoading(false);
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

  return (
    <main
      className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]"
      style={{ fontFamily: appleFont }}
    >
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              Fantasy Lab
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Admin Data Console</h1>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh ESPN
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8">
        <section className="grid gap-4 md:grid-cols-4">
          <StatusCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="ESPN connection"
            value={status?.ok && status?.authenticated ? "Authenticated" : "Not connected"}
            detail={status?.league?.name ?? "Fantasy league"}
          />
          <StatusCard
            icon={<Users className="h-5 w-5" />}
            label="Fantasy teams"
            value={String(status?.league?.teamCount ?? "—")}
            detail={status?.myTeam?.name ?? "Your team"}
          />
          <StatusCard
            icon={<Activity className="h-5 w-5" />}
            label="Player pool"
            value={String(pool?.count ?? "—")}
            detail="ESPN player IDs + NBA teams"
          />
          <StatusCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="NBA schedule"
            value={String(schedule?.gameCount ?? "—")}
            detail={
              schedule?.from && schedule?.to
                ? `${schedule.from} → ${schedule.to}`
                : "Next 6–8 weeks"
            }
          />
        </section>

        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Preseason mode
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Build the database before the draft
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">
                ESPN ownership is intentionally empty until your league drafts. Player identity,
                NBA-team assignment and the NBA schedule can already sync now. After the draft,
                roster ownership will become another dated data layer without changing the player
                or schedule records.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm text-black/60">
              <div className="font-medium text-black/80">Draft status</div>
              <div>{status?.draft?.drafted ? "Completed" : "Not drafted"}</div>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-black/[0.06] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-black/45">
                <Database className="h-4 w-4" />
                ESPN Player Database
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Players</h2>
              <p className="mt-1 text-sm text-black/50">
                Ownership will populate automatically after the draft. NBA team assignment is
                independent of fantasy ownership.
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
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 truncate text-sm text-black/45">{detail}</div>
    </div>
  );
}
