"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
type PlayerPoolResponse = {
  ok: boolean;
  count?: number;
  players?: Player[];
  persisted?: boolean;
  persistedAt?: string | null;
  message?: string;
};
type DraftIntel = {
  espn_player_id: number;
  recommendation: "priority" | "target" | "neutral" | "fade" | "dnd";
  rank_adjustment: number;
  custom_rank: number | null;
  draft_at_low: number | null;
  draft_at_high: number | null;
  first_six_grade: string | null;
  confidence: "low" | "medium" | "high" | null;
  summary: string | null;
  updated_at: string;
};
type DraftIntelUpdate = {
  id: number;
  observed_at: string;
  source_title: string | null;
  source_url: string | null;
  source_type: string | null;
  analysis: string;
  adjustment_delta: number | null;
  confidence: "low" | "medium" | "high" | null;
};
type DraftIntelResponse = {
  ok: boolean;
  intel?: DraftIntel[];
  updates?: DraftIntelUpdate[];
};

type DraftStatus = "available" | "gone" | "mine";
type PlayerMark = {
  status?: DraftStatus;
  target?: boolean;
  dnd?: boolean;
  boost?: number;
  note?: string;
  draftedAt?: number;
  // Snapshot survives an ESPN player-pool refresh that temporarily omits a pick.
  playerSnapshot?: Player;
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
    const saved = JSON.parse(window.localStorage.getItem("fantasy-lab-live-draft-v1") || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved as Marks : {};
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

function boardPriority(player: Player, mark: PlayerMark, intel: DraftIntel | undefined) {
  if (mark.dnd || intel?.recommendation === "dnd") {
    return Number.POSITIVE_INFINITY;
  }

  const manualMove = mark.boost ?? 0;
  const targetMove = mark.target ? 6 : 0;

  if (intel?.custom_rank != null) {
    return Number(intel.custom_rank) - manualMove - targetMove;
  }

  const adp = player.averageDraftPosition ?? 999;
  const intelMove = Number(intel?.rank_adjustment ?? 0);
  // NBA game counts are a separate tiebreaker, not a talent-rank multiplier.
  return adp - intelMove - manualMove - targetMove;
}

function assignRoster(players: Player[]) {
  // Maximum bipartite matching: a position-flexible pick must not crowd out
  // another pick whose only legal slot is PG, C, etc.
  const bySlot: Array<Player | null> = Array(LINEUP.length).fill(null);

  function place(player: Player, visited: Set<number>): boolean {
    const positions = eligiblePositions(player);
    const primary = primaryPosition(player);
    const candidates = LINEUP
      .map((slot, index) => ({
        index,
        preference: slot.label === primary ? 0 : slot.label === "G" || slot.label === "F" ? 1 : 2,
        accepts: slot.accepts.some((position) => positions.includes(position)),
      }))
      .filter((candidate) => candidate.accepts)
      .sort((a, b) => a.preference - b.preference || a.index - b.index);

    for (const { index } of candidates) {
      if (visited.has(index)) continue;
      visited.add(index);
      const incumbent = bySlot[index];
      if (!incumbent || place(incumbent, visited)) {
        bySlot[index] = player;
        return true;
      }
    }
    return false;
  }

  // Earlier picks take priority; later picks can rearrange existing starters
  // where needed to fill the greatest possible number of legal positions.
  for (const player of players) place(player, new Set<number>());

  const assigned = new Map<string, Player>();
  const used = new Set<number>();
  bySlot.forEach((player, index) => {
    if (player) {
      assigned.set(LINEUP[index].key, player);
      if (player.id) used.add(player.id);
    }
  });
  const bench = players.filter((player) => player.id && !used.has(player.id));
  return { assigned, bench };
}

function shortName(name?: string | null) {
  if (!name) return "—";
  const parts = name.split(" ");
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

export default function LiveDraftPage({ apiBase = "/api/fantasy" }: { apiBase?: string }) {
  const [pool, setPool] = useState<PlayerPoolResponse | null>(null);
  const [outlook, setOutlook] = useState<OutlookResponse | null>(null);
  const [intel, setIntel] = useState<DraftIntel[]>([]);
  const [intelUpdates, setIntelUpdates] = useState<DraftIntelUpdate[]>([]);
  const [marks, setMarks] = useState<Marks>({});
  const marksRef = useRef<Marks>({});
  const [saveError, setSaveError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playerSyncAt, setPlayerSyncAt] = useState<string | null>(null);
  const [intelLoadError, setIntelLoadError] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("ALL");
  const [view, setView] = useState<ViewKey>("available");
  const [sort, setSort] = useState<SortKey>("priority");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setRefreshError(false);
    try {
      const poolPromise = fetch(`${apiBase}/sync/player-market`, {
        method: apiBase === "/api/fantasy" ? "POST" : "GET",
        cache: "no-store",
      }).then(async (response) => {
        if (response.ok) {
          return (await response.json()) as PlayerPoolResponse;
        }

        const fallback = await fetch(`${apiBase}/espn/players?limit=1000`, {
          cache: "no-store",
        });
        return (await fallback.json()) as PlayerPoolResponse;
      });

      const [poolBody, outlookRes, intelRes] = await Promise.all([
        poolPromise,
        fetch(`${apiBase}/espn/schedule-outlook?weeks=6`, { cache: "no-store" }),
        fetch(`${apiBase}/draft-intel`, { cache: "no-store" }),
      ]);

      setPool(poolBody);
      setPlayerSyncAt(poolBody.persistedAt ?? null);
      setOutlook(await outlookRes.json());
      const intelBody = (await intelRes.json()) as DraftIntelResponse;
      setIntelLoadError(!intelRes.ok || !intelBody.ok);
      setIntel(intelRes.ok && intelBody.ok ? intelBody.intel ?? [] : []);
    } catch {
      setRefreshError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = loadMarks();
    marksRef.current = saved;
    setMarks(saved);

    // The standalone /draft-room and /fantasy/draft/live share localStorage.
    // Keep open browser tabs synchronized without making a server write.
    function handleStorage(event: StorageEvent) {
      if (event.key !== "fantasy-lab-live-draft-v1") return;
      const updated = loadMarks();
      marksRef.current = updated;
      setMarks(updated);
      setSaveError(false);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    void refresh();
  }, [apiBase]);

  const teamById = useMemo(
    () => new Map((outlook?.teams ?? []).map((team) => [team.id, team])),
    [outlook],
  );

  const intelById = useMemo(
    () => new Map(intel.map((item) => [Number(item.espn_player_id), item])),
    [intel],
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
      .map(([id, mark]) => playerById.get(Number(id)) ?? mark.playerSnapshot)
      .filter((player): player is Player & { id: number } => Boolean(player && player.id));
  }, [marks, playerById]);

  const draftedCount = useMemo(
    () => Object.values(marks).filter((mark) => mark.status === "gone" || mark.status === "mine").length,
    [marks],
  );

  const nextMyPick = MY_PICKS[myPlayers.length] ?? null;
  const lastMyPlayer = myPlayers.length ? myPlayers[myPlayers.length - 1] : null;
  const { assigned, bench } = useMemo(() => assignRoster(myPlayers), [myPlayers]);

  useEffect(() => {
    if (!selectedId) {
      setIntelUpdates([]);
      return;
    }
    let cancelled = false;
    fetch(`${apiBase}/draft-intel?playerId=${selectedId}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((body: DraftIntelResponse) => {
        if (!cancelled) setIntelUpdates(body.updates ?? []);
      })
      .catch(() => {
        if (!cancelled) setIntelUpdates([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, apiBase]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allPlayers
      .filter((player) => {
        const mark = marks[String(player.id)] ?? {};
        const dbIntel = intelById.get(player.id);
        const status = mark.status ?? "available";
        const isTarget =
          mark.target ||
          dbIntel?.recommendation === "priority" ||
          dbIntel?.recommendation === "target";
        const isDnd = mark.dnd || dbIntel?.recommendation === "dnd";

        if (q && !player.name?.toLowerCase().includes(q)) return false;
        if (position !== "ALL" && !eligiblePositions(player).includes(position)) return false;
        if (view === "available" && status !== "available") return false;
        if (view === "targets" && !isTarget) return false;
        if (view === "mine" && status !== "mine") return false;
        if (view === "dnd" && !isDnd) return false;
        if (view === "gone" && status !== "gone") return false;
        return true;
      })
      .map((player) => {
        const mark = marks[String(player.id)] ?? {};
        const dbIntel = intelById.get(player.id);
        const team = player.proTeamId ? teamById.get(player.proTeamId) : undefined;
        const totalGames = team?.total ?? 0;
        return {
          player,
          mark,
          intel: dbIntel,
          team,
          totalGames,
          priority: boardPriority(player, mark, dbIntel),
        };
      })
      .sort((a, b) => {
        if (sort === "name") return (a.player.name ?? "").localeCompare(b.player.name ?? "");
        if (sort === "schedule") return b.totalGames - a.totalGames || a.priority - b.priority;
        if (sort === "adp") return (a.player.averageDraftPosition ?? 9999) - (b.player.averageDraftPosition ?? 9999);
        return a.priority - b.priority || (a.player.averageDraftPosition ?? 9999) - (b.player.averageDraftPosition ?? 9999);
      });
  }, [allPlayers, intelById, marks, position, query, sort, teamById, view]);

  const selected = selectedId ? playerById.get(selectedId) ?? null : null;
  const selectedMark = selected ? marks[String(selected.id)] ?? {} : {};
  const selectedIntel = selected ? intelById.get(selected.id) : undefined;
  const selectedTeam = selected?.proTeamId ? teamById.get(selected.proTeamId) : undefined;

  function commitMarks(next: Marks) {
    // Write synchronously on click, not from a deferred React state updater.
    marksRef.current = next;
    setMarks(next);
    try {
      saveMarks(next);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }

  function patchMark(playerId: number, patch: Partial<PlayerMark>) {
    const current = marksRef.current;
    commitMarks({
      ...current,
      [String(playerId)]: { ...(current[String(playerId)] ?? {}), ...patch },
    });
  }

  function setStatus(playerId: number, status: DraftStatus) {
    const previous = marksRef.current[String(playerId)] ?? {};
    patchMark(playerId, {
      status,
      draftedAt: status === "mine"
        ? previous.status === "mine" && previous.draftedAt ? previous.draftedAt : Date.now()
        : undefined,
      playerSnapshot: playerById.get(playerId) ?? previous.playerSnapshot,
    });
  }

  function clearPlayer(playerId: number) {
    const next = { ...marksRef.current };
    delete next[String(playerId)];
    commitMarks(next);
  }

  function undoMyPick(playerId: number | null) {
    if (!playerId) return;
    patchMark(playerId, { status: "available", draftedAt: undefined });
    setSelectedId(playerId);
  }

  function resetDraft() {
    if (!window.confirm("Reset every draft status, target, DND flag, boost and note?")) return;
    commitMarks({});
    setSelectedId(null);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: appleFont }}>
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 md:px-8">
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">Draft Room</div>
            <div className="text-[11px] text-black/40">Configured pick #9 · 12-team snake · manual draft marks</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {lastMyPlayer ? (
              <button
                onClick={() => undoMyPick(lastMyPlayer.id)}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-amber-50 px-3 text-xs font-semibold text-amber-700"
                title={`Undo my last pick: ${lastMyPlayer.name ?? "player"}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo last pick
              </button>
            ) : null}
            <div className="hidden text-right sm:block">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/30">ESPN saved</div>
              <div className="text-[11px] font-medium text-black/45">
                {playerSyncAt ? new Date(playerSyncAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Not yet"}
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#f5f5f7] px-3 text-xs font-semibold text-black/60 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh ESPN
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-5 md:px-8">
        {saveError ? (
          <div role="alert" className="mb-5 rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">
            Your picks changed on screen but this browser could not save them. Check that browser storage is enabled before drafting.
          </div>
        ) : null}
        {refreshError || intelLoadError || (pool && !pool.ok) || (outlook && !outlook.ok) ? (
          <div role="alert" className="mb-5 rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
            {intelLoadError
              ? "Fantasy Lab intelligence is unavailable. Current ordering cannot be trusted as the research-adjusted draft board; refresh to retry."
              : refreshError || (pool && !pool.ok)
                ? "ESPN market/player data could not be fully refreshed. Do not rely on the board until refresh succeeds."
                : "Six-week NBA schedule data is unavailable; schedule adjustments are not being applied. Refresh to retry."}
          </div>
        ) : null}
        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Next pick" value={nextMyPick == null ? "Complete" : `#${nextMyPick}`} detail={nextMyPick == null ? "All 13 selections saved" : `Round ${myPlayers.length + 1}`} />
          <Metric label="Overall" value={`#${draftedCount + 1}`} detail="Marked picks" />
          <Metric label="My roster" value={String(myPlayers.length)} detail="13 rounds" />
          <Metric label="Available" value={String(allPlayers.filter((p) => (marks[String(p.id)]?.status ?? "available") === "available").length)} detail="Player pool" />
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
                    const { player, mark, intel: dbIntel, team, totalGames, priority } = row;
                    const status = mark.status ?? "available";
                    const isDnd = mark.dnd || dbIntel?.recommendation === "dnd";
                    const isTarget =
                      mark.target ||
                      dbIntel?.recommendation === "priority" ||
                      dbIntel?.recommendation === "target";
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
                          {sort === "priority" && status === "available" && !isDnd ? index + 1 : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{player.name}</div>
                            {isTarget ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null}
                            {isDnd ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">DND</span> : null}
                            {dbIntel?.recommendation === "priority" ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">PRIORITY</span>
                            ) : null}
                            {dbIntel?.first_six_grade ? (
                              <span className="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[10px] font-semibold text-black/50">6W {dbIntel.first_six_grade}</span>
                            ) : null}
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
                  {nextMyPick == null ? "Draft complete" : `Pick #${nextMyPick}`}
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedId(player.id)}
                            className="text-[10px] font-semibold text-[#0071e3]"
                          >
                            View
                          </button>
                          <button
                            onClick={() => undoMyPick(player.id)}
                            className="text-[10px] font-semibold text-amber-700"
                          >
                            Undo
                          </button>
                        </div>
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
                      {player ? (
                        <button
                          onClick={() => undoMyPick(player.id)}
                          className="text-[10px] font-semibold text-amber-700"
                        >
                          Undo
                        </button>
                      ) : null}
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
                      {selectedIntel ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {selectedIntel.custom_rank != null ? (
                            <span className="rounded-full bg-[#e8f2ff] px-2.5 py-1 text-[11px] font-semibold text-[#0071e3]">
                              Our rank {Number(selectedIntel.custom_rank).toFixed(0)}
                            </span>
                          ) : null}
                          {selectedIntel.draft_at_low != null || selectedIntel.draft_at_high != null ? (
                            <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-semibold text-black/55">
                              Draft {selectedIntel.draft_at_low ?? "—"}–{selectedIntel.draft_at_high ?? "—"}
                            </span>
                          ) : null}
                          {selectedIntel.first_six_grade ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              6W {selectedIntel.first_six_grade}
                            </span>
                          ) : null}
                          {selectedIntel.confidence ? (
                            <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-semibold capitalize text-black/50">
                              {selectedIntel.confidence} confidence
                            </span>
                          ) : null}
                        </div>
                      ) : null}
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
                      onClick={() => undoMyPick(selected.id)}
                      className={`rounded-[13px] px-2 py-2.5 text-xs font-semibold ${
                        selectedMark.status === "mine"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-[#f5f5f7] text-black/60"
                      }`}
                    >
                      {selectedMark.status === "mine" ? "Undo pick" : "Available"}
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

                  {selectedIntel?.summary ? (
                    <div className="mt-4 rounded-[16px] border border-black/[0.05] bg-white p-3.5 shadow-[0_6px_20px_rgba(0,0,0,.03)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/35">Fantasy Lab intel</div>
                      <p className="mt-2 text-sm leading-5 text-black/65">{selectedIntel.summary}</p>
                    </div>
                  ) : null}

                  {intelUpdates.length ? (
                    <div className="mt-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/35">Updates</div>
                      <div className="mt-2 space-y-2">
                        {intelUpdates.slice(0, 4).map((update) => (
                          <div key={update.id} className="rounded-[14px] bg-[#f7f7f9] p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate text-xs font-semibold">{update.source_title ?? update.source_type ?? "Update"}</div>
                              {update.adjustment_delta ? (
                                <span className={`text-[11px] font-semibold ${update.adjustment_delta > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                  {update.adjustment_delta > 0 ? "+" : ""}{update.adjustment_delta}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-black/55">{update.analysis}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/35">Draft-night note</label>
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
