"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  Check,
  ChevronDown,
  CircleDot,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Target,
  UserPlus,
  X,
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
  averageDraftPosition?: number | null;
};
type PlayerPoolResponse = { ok: boolean; count?: number; players?: Player[] };

type DraftStatus = "available" | "gone" | "mine";
type PlayerMark = {
  status?: DraftStatus;
  target?: boolean;
  dnd?: boolean;
  boost?: number;
  note?: string;
  draftedAt?: number;
};
type Marks = Record<string, PlayerMark>;
type ViewKey = "available" | "targets" | "mine" | "dnd" | "gone" | "all";
type SortKey = "priority" | "adp" | "schedule" | "name";

const MY_PICKS = [9, 16, 33, 40, 57, 64, 81, 88, 105, 112, 129, 136, 153];

const POSITION_LABELS: Record<number, string> = {
  1: "PG",
  2: "SG",
  3: "SF",
  4: "PF",
  5: "C",
};

const ELIGIBLE_SLOT_LABELS: Record<number, string> = {
  0: "PG",
  1: "SG",
  2: "SF",
  3: "PF",
  4: "C",
  5: "G",
  6: "F",
  7: "UTIL",
};

const LINEUP = [
  { key: "PG", label: "PG", accepts: ["PG"] },
  { key: "SG", label: "SG", accepts: ["SG"] },
  { key: "SF", label: "SF", accepts: ["SF"] },
  { key: "PF", label: "PF", accepts: ["PF"] },
  { key: "C", label: "C", accepts: ["C"] },
  { key: "G", label: "G", accepts: ["PG", "SG"] },
  { key: "F", label: "F", accepts: ["SF", "PF"] },
  { key: "UTIL1", label: "UTIL", accepts: ["PG", "SG", "SF", "PF", "C"] },
  { key: "UTIL2", label: "UTIL", accepts: ["PG", "SG", "SF", "PF", "C"] },
  { key: "UTIL3", label: "UTIL", accepts: ["PG", "SG", "SF", "PF", "C"] },
] as const;

function loadMarks(): Marks {
  try {
    return JSON.parse(window.localStorage.getItem("fantasy-lab-live-draft-v1") || "{}") as Marks;
  } catch {
    return {};
  }
}

function saveMarks(marks: Marks) {
  window.localStorage.setItem("fantasy-lab-live-draft-v1", JSON.stringify(marks));
}

function primaryPosition(player: Player) {
  return POSITION_LABELS[player.defaultPositionId ?? 0] ?? "—";
}

function eligiblePositions(player: Player) {
  const positions = new Set<string>();
  const primary = primaryPosition(player);
  if (primary !== "—") positions.add(primary);

  for (const slot of player.eligibleSlots ?? []) {
    const label = ELIGIBLE_SLOT_LABELS[slot];
    if (!label) continue;
    if (label === "G") {
      positions.add("PG");
      positions.add("SG");
    } else if (label === "F") {
      positions.add("SF");
      positions.add("PF");
    } else if (label !== "UTIL") {
      positions.add(label);
    }
  }

  return Array.from(positions);
}

function boardPriority(
  player: Player,
  mark: PlayerMark,
  totalGames: number,
  averageGames: number,
) {
  if (mark.dnd) return Number.POSITIVE_INFINITY;
  const adp = player.averageDraftPosition ?? 999;
  const scheduleMove = (totalGames - averageGames) * 3;
  const manualMove = mark.boost ?? 0;
  const targetMove = mark.target ? 6 : 0;
  return adp - scheduleMove - manualMove - targetMove;
}

function assignRoster(players: Player[]) {
  const assigned = new Map<string, Player>();
  const used = new Set<number>();

  const ordered = [...players].sort(
    (a, b) => eligiblePositions(a).length - eligiblePositions(b).length,
  );

  for (const player of ordered) {
    const positions = eligiblePositions(player);
    const primary = primaryPosition(player);
    const candidates = LINEUP
      .map((slot, index) => ({
        slot,
        index,
        score:
          slot.label === primary
            ? 0
            : slot.label === "G" || slot.label === "F"
              ? 1
              : slot.label === "UTIL"
                ? 2
                : 3,
      }))
      .filter(({ slot, index }) => !assigned.has(slot.key) && slot.accepts.some((pos) => positions.includes(pos)))
      .sort((a, b) => a.score - b.score || a.index - b.index);

    const best = candidates[0];
    if (best) {
      assigned.set(best.slot.key, player);
      if (player.id) used.add(player.id);
    }
  }

  const bench = players.filter((player) => player.id && !used.has(player.id));
  return { assigned, bench };
}

function shortName(name?: string | null) {
  if (!name) return "—";
  const parts = name.split(" ");
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

export default function LiveDraftPage() {
  const [pool, setPool] = useState<PlayerPoolResponse | null>(null);
  const [outlook, setOutlook] = useState<OutlookResponse | null>(null);
  const [marks, setMarks] = useState<Marks>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("ALL");
  const [view, setView] = useState<ViewKey>("available");
  const [sort, setSort] = useState<SortKey>("priority");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [poolRes, outlookRes] = await Promise.all([
        fetch("/api/fantasy/espn/players?limit=1000", { cache: "no-store" }),
        fetch("/api/fantasy/espn/schedule-outlook?weeks=6", { cache: "no-store" }),
      ]);
      setPool(await poolRes.json());
      setOutlook(await outlookRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMarks(loadMarks());
    refresh();
  }, []);

  const teamById = useMemo(
    () => new Map((outlook?.teams ?? []).map((team) => [team.id, team])),
    [outlook],
  );

  const averageGames = useMemo(() => {
    const teams = outlook?.teams ?? [];
    return teams.length
      ? teams.reduce((sum, team) => sum + team.total, 0) / teams.length
      : 0;
  }, [outlook]);

  const allPlayers = useMemo(
    () => (pool?.players ?? []).filter((player): player is Player & { id: number } => Boolean(player.id && player.name)),
    [pool],
  );

  const playerById = useMemo(
    () => new Map(allPlayers.map((player) => [player.id, player])),
    [allPlayers],
  );

  const myPlayers = useMemo(() => {
    return Object.entries(marks)
      .filter(([, mark]) => mark.status === "mine")
      .sort((a, b) => (a[1].draftedAt ?? 0) - (b[1].draftedAt ?? 0))
      .map(([id]) => playerById.get(Number(id)))
      .filter((player): player is Player & { id: number } => Boolean(player));
  }, [marks, playerById]);

  const draftedCount = useMemo(
    () => Object.values(marks).filter((mark) => mark.status === "gone" || mark.status === "mine").length,
    [marks],
  );

  const nextMyPick = MY_PICKS[Math.min(myPlayers.length, MY_PICKS.length - 1)];
  const { assigned, bench } = useMemo(() => assignRoster(myPlayers), [myPlayers]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allPlayers
      .filter((player) => {
        const mark = marks[String(player.id)] ?? {};
        const status = mark.status ?? "available";

        if (q && !player.name?.toLowerCase().includes(q)) return false;
        if (position !== "ALL" && !eligiblePositions(player).includes(position)) return false;
        if (view === "available" && status !== "available") return false;
        if (view === "targets" && !mark.target) return false;
        if (view === "mine" && status !== "mine") return false;
        if (view === "dnd" && !mark.dnd) return false;
        if (view === "gone" && status !== "gone") return false;
        return true;
      })
      .map((player) => {
        const mark = marks[String(player.id)] ?? {};
        const team = player.proTeamId ? teamById.get(player.proTeamId) : undefined;
        const totalGames = team?.total ?? 0;
        return {
          player,
          mark,
          team,
          totalGames,
          priority: boardPriority(player, mark, totalGames, averageGames),
        };
      })
      .sort((a, b) => {
        if (sort === "name") return (a.player.name ?? "").localeCompare(b.player.name ?? "");
        if (sort === "schedule") return b.totalGames - a.totalGames || a.priority - b.priority;
        if (sort === "adp") return (a.player.averageDraftPosition ?? 9999) - (b.player.averageDraftPosition ?? 9999);
        return a.priority - b.priority || (a.player.averageDraftPosition ?? 9999) - (b.player.averageDraftPosition ?? 9999);
      });
  }, [allPlayers, averageGames, marks, position, query, sort, teamById, view]);

  const selected = selectedId ? playerById.get(selectedId) ?? null : null;
  const selectedMark = selected ? marks[String(selected.id)] ?? {} : {};
  const selectedTeam = selected?.proTeamId ? teamById.get(selected.proTeamId) : undefined;

  function patchMark(playerId: number, patch: Partial<PlayerMark>) {
    setMarks((current) => {
      const next = {
        ...current,
        [String(playerId)]: { ...(current[String(playerId)] ?? {}), ...patch },
      };
      saveMarks(next);
      return next;
    });
  }

  function setStatus(playerId: number, status: DraftStatus) {
    patchMark(playerId, {
      status,
      draftedAt: status === "mine" ? Date.now() : undefined,
    });
  }

  function clearPlayer(playerId: number) {
    setMarks((current) => {
      const next = { ...current };
      delete next[String(playerId)];
      saveMarks(next);
      return next;
    });
  }

  function resetDraft() {
    if (!window.confirm("Reset every draft status, target, DND flag, boost and note?")) return;
    setMarks({});
    saveMarks({});
    setSelectedId(null);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: appleFont }}>
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 md:px-8">
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">Draft Room</div>
            <div className="text-[11px] text-black/40">Pick #9 · 12-team snake</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#f5f5f7] px-3 text-xs font-semibold text-black/60 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-5 md:px-8">
        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Next pick" value={`#${nextMyPick}`} detail={`Round ${Math.min(myPlayers.length + 1, 13)}`} />
          <Metric label="Overall" value={`#${draftedCount + 1}`} detail="Marked picks" />
          <Metric label="My roster" value={String(myPlayers.length)} detail="13 rounds" />
          <Metric label="Available" value={String(allPlayers.length - draftedCount)} detail="Player pool" />
          <Metric label="6W average" value={averageGames ? averageGames.toFixed(1) : "—"} detail="Games per NBA team" />
        </section>

        <section className="mb-5 overflow-x-auto rounded-[22px] border border-black/[0.05] bg-white px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,.035)]">
          <div className="flex min-w-max items-center gap-2">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/35">My picks</span>
            {MY_PICKS.map((pick, index) => {
              const made = index < myPlayers.length;
              const next = index === myPlayers.length;
              return (
                <div
                  key={pick}
                  className={`flex h-8 min-w-11 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                    made
                      ? "bg-[#1d1d1f] text-white"
                      : next
                        ? "bg-[#e8f2ff] text-[#0071e3] ring-1 ring-[#0071e3]/20"
                        : "bg-[#f5f5f7] text-black/40"
                  }`}
                >
                  {pick}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_380px]">
          <section className="overflow-hidden rounded-[26px] border border-black/[0.05] bg-white shadow-[0_12px_40px_rgba(0,0,0,.04)]">
            <div className="border-b border-black/[0.06] p-4 md:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2.5 text-sm">
                  <Search className="h-4 w-4 text-black/35" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search players"
                    className="w-full bg-transparent outline-none placeholder:text-black/35"
                  />
                  {query ? (
                    <button onClick={() => setQuery("")} aria-label="Clear search">
                      <X className="h-3.5 w-3.5 text-black/35" />
                    </button>
                  ) : null}
                </label>
                <div className="flex flex-wrap gap-2">
                  <Select value={view} onChange={(value) => setView(value as ViewKey)} options={["available", "targets", "mine", "dnd", "gone", "all"]} labels={{ available: "Available", targets: "Targets", mine: "My team", dnd: "Do not draft", gone: "Gone", all: "All players" }} />
                  <Select value={position} onChange={setPosition} options={["ALL", "PG", "SG", "SF", "PF", "C"]} />
                  <Select value={sort} onChange={(value) => setSort(value as SortKey)} options={["priority", "adp", "schedule", "name"]} labels={{ priority: "My board", adp: "ESPN ADP", schedule: "6W games", name: "Name" }} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] text-sm">
                <thead className="border-b border-black/[0.06] bg-[#fbfbfd] text-[11px] uppercase tracking-wide text-black/40">
                  <tr>
                    <th className="w-14 px-3 py-3 text-center font-medium">Rank</th>
                    <th className="px-3 py-3 text-left font-medium">Player</th>
                    <th className="px-3 py-3 text-center font-medium">Pos</th>
                    <th className="px-3 py-3 text-right font-medium">ADP</th>
                    <th className="px-3 py-3 text-right font-medium">Move</th>
                    <th className="px-3 py-3 text-center font-medium">6W</th>
                    {(outlook?.weeks ?? []).map((week) => (
                      <th key={week.index} className="px-2 py-3 text-center font-medium">W{week.index}</th>
                    ))}
                    <th className="px-3 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 250).map((row, index) => {
                    const { player, mark, team, totalGames, priority } = row;
                    const status = mark.status ?? "available";
                    const premium =
                      player.averageDraftPosition == null || !Number.isFinite(priority)
                        ? null
                        : player.averageDraftPosition - priority;

                    return (
                      <tr
                        key={player.id}
                        onClick={() => setSelectedId(player.id)}
                        className={`cursor-pointer border-b border-black/[0.045] last:border-0 hover:bg-black/[0.015] ${
                          status !== "available" ? "opacity-55" : ""
                        } ${selectedId === player.id ? "bg-[#f7fbff]" : ""}`}
                      >
                        <td className="px-3 py-3 text-center font-semibold text-black/45">
                          {sort === "priority" && status === "available" && !mark.dnd ? index + 1 : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{player.name}</div>
                            {mark.target ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null}
                            {mark.dnd ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">DND</span> : null}
                            {(mark.boost ?? 0) > 0 ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0071e3]">+{mark.boost}</span> : null}
                          </div>
                          <div className="mt-0.5 text-[11px] text-black/35">
                            {team?.abbreviation ?? "—"} · {player.injuryStatus ?? "Active"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-black/55">{primaryPosition(player)}</td>
                        <td className="px-3 py-3 text-right font-semibold">
                          {player.averageDraftPosition == null ? "—" : player.averageDraftPosition.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {premium == null || Math.abs(premium) < 0.5 ? (
                            <span className="text-black/30">—</span>
                          ) : premium > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                              <ArrowUp className="h-3 w-3" /> {Math.round(premium)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                              <ArrowDown className="h-3 w-3" /> {Math.abs(Math.round(premium))}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center font-semibold">{totalGames || "—"}</td>
                        {(team?.weeks ?? Array.from({ length: outlook?.weeks?.length ?? 6 }, () => 0)).map((games, weekIndex) => (
                          <td key={weekIndex} className="px-2 py-3 text-center">
                            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                              games >= 4
                                ? "bg-[#e8f2ff] text-[#0071e3]"
                                : games <= 2
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-[#f5f5f7] text-black/55"
                            }`}>
                              {games}
                            </span>
                          </td>
                        ))}
                        <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            {status === "available" ? (
                              <>
                                <button
                                  onClick={() => setStatus(player.id, "mine")}
                                  className="rounded-full bg-[#1d1d1f] px-3 py-1.5 text-[11px] font-semibold text-white"
                                >
                                  Mine
                                </button>
                                <button
                                  onClick={() => setStatus(player.id, "gone")}
                                  className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[11px] font-semibold text-black/55"
                                >
                                  Gone
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => patchMark(player.id, { status: "available", draftedAt: undefined })}
                                className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[11px] font-semibold text-black/55"
                              >
                                Undo
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!loading && rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-black/40">No players match this view.</div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-black/[0.05] bg-white p-5 shadow-[0_10px_34px_rgba(0,0,0,.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/35">My team</div>
                  <div className="mt-1 text-xl font-semibold tracking-tight">{myPlayers.length}/13</div>
                </div>
                <div className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-black/50">
                  Pick #{nextMyPick}
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {LINEUP.map((slot) => {
                  const player = assigned.get(slot.key);
                  return (
                    <div key={slot.key} className="flex items-center gap-3 rounded-[14px] bg-[#f7f7f9] px-3 py-2.5">
                      <div className="w-10 text-[11px] font-semibold text-black/35">{slot.label}</div>
                      <div className={`min-w-0 flex-1 truncate text-sm ${player ? "font-semibold" : "text-black/25"}`}>
                        {player ? shortName(player.name) : "—"}
                      </div>
                      {player ? (
                        <button
                          onClick={() => setSelectedId(player.id)}
                          className="text-[10px] font-semibold text-[#0071e3]"
                        >
                          View
                        </button>
                      ) : null}
                    </div>
                  );
                })}
                {[0, 1, 2].map((index) => {
                  const player = bench[index];
                  return (
                    <div key={index} className="flex items-center gap-3 rounded-[14px] bg-[#f7f7f9] px-3 py-2.5">
                      <div className="w-10 text-[11px] font-semibold text-black/35">BN</div>
                      <div className={`min-w-0 flex-1 truncate text-sm ${player ? "font-semibold" : "text-black/25"}`}>
                        {player ? shortName(player.name) : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/[0.05] bg-white p-5 shadow-[0_10px_34px_rgba(0,0,0,.04)]">
              {selected ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold tracking-tight">{selected.name}</div>
                      <div className="mt-1 text-xs text-black/40">
                        {selectedTeam?.abbreviation ?? "—"} · {primaryPosition(selected)} · ADP {selected.averageDraftPosition?.toFixed(1) ?? "—"}
                      </div>
                    </div>
                    <button onClick={() => setSelectedId(null)} className="grid h-8 w-8 place-items-center rounded-full bg-[#f5f5f7] text-black/45">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setStatus(selected.id, "mine")}
                      className={`rounded-[13px] px-2 py-2.5 text-xs font-semibold ${
                        selectedMark.status === "mine" ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-black/60"
                      }`}
                    >
                      My pick
                    </button>
                    <button
                      onClick={() => setStatus(selected.id, "gone")}
                      className={`rounded-[13px] px-2 py-2.5 text-xs font-semibold ${
                        selectedMark.status === "gone" ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-black/60"
                      }`}
                    >
                      Gone
                    </button>
                    <button
                      onClick={() => patchMark(selected.id, { status: "available", draftedAt: undefined })}
                      className="rounded-[13px] bg-[#f5f5f7] px-2 py-2.5 text-xs font-semibold text-black/60"
                    >
                      Available
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => patchMark(selected.id, { target: !selectedMark.target })}
                      className={`inline-flex items-center justify-center gap-2 rounded-[13px] px-3 py-2.5 text-xs font-semibold ${
                        selectedMark.target ? "bg-amber-50 text-amber-700" : "bg-[#f5f5f7] text-black/60"
                      }`}
                    >
                      <Target className="h-3.5 w-3.5" /> Target
                    </button>
                    <button
                      onClick={() => patchMark(selected.id, { dnd: !selectedMark.dnd })}
                      className={`inline-flex items-center justify-center gap-2 rounded-[13px] px-3 py-2.5 text-xs font-semibold ${
                        selectedMark.dnd ? "bg-red-50 text-red-600" : "bg-[#f5f5f7] text-black/60"
                      }`}
                    >
                      <Ban className="h-3.5 w-3.5" /> DND
                    </button>
                  </div>

                  <div className="mt-4 rounded-[16px] bg-[#f7f7f9] p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/35">Move above ADP</div>
                        <div className="mt-1 text-2xl font-semibold tracking-tight">+{selectedMark.boost ?? 0}</div>
                      </div>
                      <div className="flex gap-1.5">
                        {[0, 5, 10, 15, 20].map((value) => (
                          <button
                            key={value}
                            onClick={() => patchMark(selected.id, { boost: value })}
                            className={`h-8 min-w-8 rounded-full px-2 text-[11px] font-semibold ${
                              (selectedMark.boost ?? 0) === value
                                ? "bg-[#1d1d1f] text-white"
                                : "bg-white text-black/45"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/35">Notes</label>
                    <textarea
                      value={selectedMark.note ?? ""}
                      onChange={(event) => patchMark(selected.id, { note: event.target.value })}
                      placeholder="Role, injury, first-6-week reason, trade plan…"
                      rows={4}
                      className="mt-2 w-full resize-none rounded-[15px] bg-[#f5f5f7] px-3 py-2.5 text-sm outline-none placeholder:text-black/25"
                    />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => clearPlayer(selected.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-black/50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Clear player
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <CircleDot className="mx-auto h-6 w-6 text-black/20" />
                  <div className="mt-3 text-sm font-semibold">Select a player</div>
                  <div className="mt-1 text-xs text-black/40">Flags, rank adjustments and notes appear here.</div>
                </div>
              )}
            </section>

            <button
              onClick={resetDraft}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold text-black/35 transition hover:bg-white hover:text-black/55"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset draft board
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[20px] border border-black/[0.05] bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,.03)]">
      <div className="text-[11px] font-medium text-black/40">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</div>
      <div className="mt-1 text-xs text-black/35">{detail}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  labels = {},
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-full bg-[#f5f5f7] py-2.5 pl-4 pr-9 text-xs font-semibold text-black/60 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" />
    </label>
  );
}
