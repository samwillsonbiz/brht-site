"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  Gauge,
  RefreshCw,
  RotateCcw,
  Settings2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserRoundPlus,
  Users,
  Zap,
} from "lucide-react";

type Side = "mine" | "opp" | "fa";
type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
type TabKey = "matchup" | "players" | "planner";

type Player = {
  id: string;
  side: Side;
  owner: string;
  name: string;
  slot: string;
  eligible: string[];
  season: number;
  d30: number | null;
  d7: number | null;
  games: Record<DayKey, boolean>;
  actuals: Record<DayKey, number | null>;
  status: string;
  rosterFrom: DayKey | null;
  rosterTo: DayKey | null;
};

type Assignment = {
  player: Player;
  slot: string;
};

type DayResult = {
  day: DayKey;
  assignments: Assignment[];
  projected: number;
  actual: number;
  forecast: number;
  scheduled: number;
  overflow: number;
  openSlots: number;
};

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};
const LINEUP_SLOTS = ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL", "UTIL", "UTIL"];
const MODEL_WEIGHTS = { season: 0.45, d30: 0.35, d7: 0.2 };
const appleFont =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const schedule = (...days: DayKey[]) =>
  DAYS.reduce(
    (acc, day) => ({ ...acc, [day]: days.includes(day) }),
    {} as Record<DayKey, boolean>,
  );
const noActuals = () =>
  DAYS.reduce(
    (acc, day) => ({ ...acc, [day]: null }),
    {} as Record<DayKey, number | null>,
  );

const seedPlayers: Player[] = [
  {
    id: "mine-maxey",
    side: "mine",
    owner: "SkyWalker",
    name: "Maxey",
    slot: "PG",
    eligible: ["PG", "SG"],
    season: 41,
    d30: null,
    d7: 43.8,
    games: schedule("Tue", "Thu", "Sat", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-henderson",
    side: "mine",
    owner: "SkyWalker",
    name: "Henderson",
    slot: "SG",
    eligible: ["PG", "SG"],
    season: 28.3,
    d30: null,
    d7: 27.3,
    games: schedule("Mon", "Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-harris",
    side: "mine",
    owner: "SkyWalker",
    name: "Harris",
    slot: "SF",
    eligible: ["SF", "PF"],
    season: 32.6,
    d30: null,
    d7: 32.3,
    games: schedule("Tue", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-kennard",
    side: "mine",
    owner: "SkyWalker",
    name: "Kennard",
    slot: "PF",
    eligible: ["SG", "SF"],
    season: 29.5,
    d30: null,
    d7: 29.5,
    games: schedule("Tue", "Wed", "Thu", "Fri", "Sat"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-holmgren",
    side: "mine",
    owner: "SkyWalker",
    name: "Holmgren",
    slot: "C",
    eligible: ["PF", "C"],
    season: 36.9,
    d30: null,
    d7: 20.8,
    games: schedule("Tue", "Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-curry",
    side: "mine",
    owner: "SkyWalker",
    name: "Curry",
    slot: "G",
    eligible: ["PG", "SG"],
    season: 38.5,
    d30: null,
    d7: 36,
    games: schedule("Tue", "Thu", "Fri"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-thompson",
    side: "mine",
    owner: "SkyWalker",
    name: "Thompson",
    slot: "F",
    eligible: ["SG", "SF"],
    season: 36.4,
    d30: null,
    d7: 36.8,
    games: schedule("Tue", "Thu", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-tatum",
    side: "mine",
    owner: "SkyWalker",
    name: "Tatum",
    slot: "UTIL",
    eligible: ["SF", "PF"],
    season: 54.8,
    d30: null,
    d7: 48.7,
    games: schedule("Mon", "Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-hauser",
    side: "mine",
    owner: "SkyWalker",
    name: "Hauser",
    slot: "UTIL",
    eligible: ["SF", "PF"],
    season: 34.4,
    d30: null,
    d7: 29.7,
    games: schedule("Mon", "Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-reaves",
    side: "mine",
    owner: "SkyWalker",
    name: "Reaves",
    slot: "UTIL",
    eligible: ["SG", "SF"],
    season: 35.9,
    d30: null,
    d7: 45.3,
    games: schedule("Tue", "Wed", "Sat", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-jokic",
    side: "mine",
    owner: "SkyWalker",
    name: "Jokic",
    slot: "BE",
    eligible: ["C"],
    season: 57.6,
    d30: null,
    d7: 61,
    games: schedule("Tue", "Thu", "Sat"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-vanvleet",
    side: "mine",
    owner: "SkyWalker",
    name: "VanVleet",
    slot: "BE",
    eligible: ["PG", "SG"],
    season: 47.1,
    d30: null,
    d7: 49.8,
    games: schedule("Tue", "Thu", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-olynyk",
    side: "mine",
    owner: "SkyWalker",
    name: "Olynyk",
    slot: "BE",
    eligible: ["PF", "C"],
    season: 28.3,
    d30: null,
    d7: 35.3,
    games: schedule("Tue", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "mine-mobley",
    side: "mine",
    owner: "SkyWalker",
    name: "Mobley",
    slot: "IR",
    eligible: ["PF", "C"],
    season: 36,
    d30: null,
    d7: 36,
    games: schedule("Wed", "Sat"),
    actuals: noActuals(),
    status: "IR",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-garland",
    side: "opp",
    owner: "Connor",
    name: "Garland",
    slot: "PG",
    eligible: ["PG"],
    season: 29,
    d30: null,
    d7: 31.5,
    games: schedule("Tue", "Wed", "Sat", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-hield",
    side: "opp",
    owner: "Connor",
    name: "Hield",
    slot: "SG",
    eligible: ["SG", "SF"],
    season: 18.6,
    d30: null,
    d7: 21.8,
    games: schedule("Tue", "Thu", "Sat"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-bridges",
    side: "opp",
    owner: "Connor",
    name: "Bridges",
    slot: "SF",
    eligible: ["SF", "PF"],
    season: 30,
    d30: null,
    d7: 28.7,
    games: schedule("Fri", "Sat"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-gobert",
    side: "opp",
    owner: "Connor",
    name: "Gobert",
    slot: "PF",
    eligible: ["C"],
    season: 37.3,
    d30: null,
    d7: 40,
    games: schedule("Tue", "Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-doncic",
    side: "opp",
    owner: "Connor",
    name: "Doncic",
    slot: "C",
    eligible: ["PG", "SG"],
    season: 56.3,
    d30: null,
    d7: 58.3,
    games: schedule("Tue", "Thu", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-washington",
    side: "opp",
    owner: "Connor",
    name: "Washington",
    slot: "G",
    eligible: ["PF", "C"],
    season: 24.2,
    d30: null,
    d7: 28,
    games: schedule("Tue", "Thu", "Fri"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-lively",
    side: "opp",
    owner: "Connor",
    name: "Lively",
    slot: "F",
    eligible: ["C"],
    season: 23.2,
    d30: null,
    d7: 25.3,
    games: schedule("Thu", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-booker",
    side: "opp",
    owner: "Connor",
    name: "Booker",
    slot: "UTIL",
    eligible: ["SG", "SF"],
    season: 44.4,
    d30: null,
    d7: 35.7,
    games: schedule("Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-sexton",
    side: "opp",
    owner: "Connor",
    name: "Sexton",
    slot: "UTIL",
    eligible: ["PG", "SG"],
    season: 41.3,
    d30: null,
    d7: 45,
    games: schedule("Tue", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-brown",
    side: "opp",
    owner: "Connor",
    name: "Brown",
    slot: "UTIL",
    eligible: ["SF", "PF"],
    season: 49.8,
    d30: null,
    d7: 37,
    games: schedule("Wed", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-mccollum",
    side: "opp",
    owner: "Connor",
    name: "McCollum",
    slot: "BE",
    eligible: ["PG", "SG"],
    season: 42.9,
    d30: null,
    d7: 42.8,
    games: schedule("Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-murphy",
    side: "opp",
    owner: "Connor",
    name: "Murphy",
    slot: "BE",
    eligible: ["SF", "PF"],
    season: 31.4,
    d30: null,
    d7: 33.8,
    games: schedule("Wed", "Fri", "Sun"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-isaac",
    side: "opp",
    owner: "Connor",
    name: "Isaac",
    slot: "BE",
    eligible: ["PF", "C"],
    season: 31,
    d30: null,
    d7: 26,
    games: schedule("Wed", "Fri"),
    actuals: noActuals(),
    status: "Active",
    rosterFrom: null,
    rosterTo: null,
  },
  {
    id: "opp-johnson",
    side: "opp",
    owner: "Connor",
    name: "Johnson",
    slot: "IR",
    eligible: ["SF", "PF"],
    season: 25.3,
    d30: null,
    d7: 30.5,
    games: schedule("Sun"),
    actuals: noActuals(),
    status: "IR",
    rosterFrom: null,
    rosterTo: null,
  },
];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

function numberOrNull(value: string | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function boolFromCell(value: string | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return ["1", "y", "yes", "true", "x", "✓", "game"].includes(normalized);
}

function dayFromCell(value: string | undefined): DayKey | null {
  const normalized = value?.trim().slice(0, 3).toLowerCase();
  return DAYS.find((day) => day.toLowerCase() === normalized) ?? null;
}

function playersFromCsv(text: string): Player[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((value) => value.trim().toLowerCase());
  const indexOf = (...names: string[]) => names.map((name) => headers.indexOf(name.toLowerCase())).find((index) => index >= 0) ?? -1;
  const cell = (values: string[], ...names: string[]) => {
    const index = indexOf(...names);
    return index >= 0 ? values[index] : undefined;
  };

  const playerIndex = indexOf("player", "name");
  const sideIndex = indexOf("side");
  const seasonIndex = indexOf("season avg", "season", "season average");
  if (playerIndex < 0 || sideIndex < 0 || seasonIndex < 0) return [];

  return rows.slice(1).flatMap((values, rowIndex) => {
    const name = values[playerIndex]?.trim();
    if (!name) return [];
    const rawSide = values[sideIndex]?.trim().toLowerCase() ?? "mine";
    const side: Side = rawSide.startsWith("opp")
      ? "opp"
      : rawSide.startsWith("fa") || rawSide.startsWith("free")
        ? "fa"
        : "mine";
    const season = numberOrNull(values[seasonIndex]) ?? 0;
    const eligibleRaw = cell(values, "eligible", "eligibility", "positions") ?? cell(values, "slot") ?? "UTIL";
    const eligible = eligibleRaw
      .split(/[|/,]/)
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
    const games = DAYS.reduce(
      (acc, day) => ({ ...acc, [day]: boolFromCell(cell(values, day)) }),
      {} as Record<DayKey, boolean>,
    );
    const actuals = DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day]: numberOrNull(cell(values, `${day} actual`, `${DAY_NAMES[day]} actual`)),
      }),
      {} as Record<DayKey, number | null>,
    );

    return [
      {
        id: `sheet-${side}-${rowIndex}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        side,
        owner: cell(values, "owner", "team name", "fantasy team")?.trim() || (side === "opp" ? "Opponent" : side === "fa" ? "Free Agents" : "My Team"),
        name,
        slot: cell(values, "slot")?.trim().toUpperCase() || "UTIL",
        eligible,
        season,
        d30: numberOrNull(cell(values, "30 day avg", "30 day", "30d", "30 day average")),
        d7: numberOrNull(cell(values, "7 day avg", "7 day", "7d", "7 day average")),
        games,
        actuals,
        status: cell(values, "status")?.trim() || "Active",
        rosterFrom: dayFromCell(cell(values, "roster from", "from")),
        rosterTo: dayFromCell(cell(values, "roster to", "to")),
      },
    ];
  });
}

function trueAverage(player: Player) {
  const parts = [
    { value: player.season, weight: MODEL_WEIGHTS.season },
    { value: player.d30, weight: MODEL_WEIGHTS.d30 },
    { value: player.d7, weight: MODEL_WEIGHTS.d7 },
  ].filter((part) => part.value !== null && Number.isFinite(part.value));
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  if (!totalWeight) return 0;
  return parts.reduce((sum, part) => sum + Number(part.value) * part.weight, 0) / totalWeight;
}

function canFill(player: Player, slot: string) {
  const eligible = player.eligible.map((value) => value.toUpperCase());
  if (slot === "UTIL") return eligible.length > 0;
  if (slot === "G") return eligible.some((value) => value === "PG" || value === "SG" || value === "G");
  if (slot === "F") return eligible.some((value) => value === "SF" || value === "PF" || value === "F");
  return eligible.includes(slot);
}

function activeForDay(player: Player, day: DayKey) {
  const dayIndex = DAYS.indexOf(day);
  const fromIndex = player.rosterFrom ? DAYS.indexOf(player.rosterFrom) : 0;
  const toIndex = player.rosterTo ? DAYS.indexOf(player.rosterTo) : DAYS.length - 1;
  const status = player.status.toLowerCase();
  if (status === "ir" || status.includes("inactive")) return false;
  return dayIndex >= fromIndex && dayIndex <= toIndex;
}

function optimizeDay(players: Player[], day: DayKey): DayResult {
  const candidates = players.filter((player) => player.games[day] && activeForDay(player, day));
  type State = { score: number; assignments: Assignment[] };
  let states = new Map<number, State>([[0, { score: 0, assignments: [] }]]);

  candidates.forEach((player) => {
    const next = new Map(states);
    states.forEach((state, mask) => {
      LINEUP_SLOTS.forEach((slot, slotIndex) => {
        const bit = 1 << slotIndex;
        if (mask & bit || !canFill(player, slot)) return;
        const nextMask = mask | bit;
        const score = state.score + trueAverage(player);
        const existing = next.get(nextMask);
        if (!existing || score > existing.score) {
          next.set(nextMask, {
            score,
            assignments: [...state.assignments, { player, slot }],
          });
        }
      });
    });
    states = next;
  });

  const best = Array.from(states.values()).reduce(
    (winner, state) => (state.score > winner.score ? state : winner),
    { score: 0, assignments: [] } as State,
  );
  const actual = best.assignments.reduce(
    (sum, assignment) => sum + (assignment.player.actuals[day] ?? 0),
    0,
  );
  const forecast = best.assignments.reduce(
    (sum, assignment) => sum + (assignment.player.actuals[day] ?? trueAverage(assignment.player)),
    0,
  );

  return {
    day,
    assignments: best.assignments,
    projected: best.score,
    actual,
    forecast,
    scheduled: candidates.length,
    overflow: Math.max(0, candidates.length - best.assignments.length),
    openSlots: Math.max(0, LINEUP_SLOTS.length - best.assignments.length),
  };
}

function weekResults(players: Player[]) {
  return DAYS.map((day) => optimizeDay(players, day));
}

function sumResults(results: DayResult[], field: "projected" | "actual" | "forecast") {
  return results.reduce((sum, result) => sum + result[field], 0);
}

function formatPoints(value: number, digits = 0) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function trend(player: Player) {
  const recent = player.d7 ?? player.d30 ?? player.season;
  const delta = recent - player.season;
  if (Math.abs(delta) < 1.5) return "flat";
  return delta > 0 ? "up" : "down";
}

function Sparkline({ player }: { player: Player }) {
  const values = [player.season, player.d30 ?? player.season, player.d7 ?? player.d30 ?? player.season];
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const y = (value: number) => 28 - ((value - min) / Math.max(1, max - min)) * 22;
  const points = values.map((value, index) => `${index * 24 + 2},${y(value)}`).join(" ");
  const direction = trend(player);
  const stroke = direction === "up" ? "#34c759" : direction === "down" ? "#ff453a" : "#86868b";

  return (
    <svg width="54" height="30" viewBox="0 0 54 30" aria-hidden="true">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CumulativeChart({ mine, opp, mineName, oppName }: { mine: DayResult[]; opp: DayResult[]; mineName: string; oppName: string }) {
  const mineCum = mine.map((_, index) => mine.slice(0, index + 1).reduce((sum, item) => sum + item.forecast, 0));
  const oppCum = opp.map((_, index) => opp.slice(0, index + 1).reduce((sum, item) => sum + item.forecast, 0));
  const max = Math.max(100, ...mineCum, ...oppCum) * 1.08;
  const width = 760;
  const height = 260;
  const left = 42;
  const right = 16;
  const top = 18;
  const bottom = 34;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const x = (index: number) => left + (index / (DAYS.length - 1)) * plotW;
  const y = (value: number) => top + plotH - (value / max) * plotH;
  const minePoints = mineCum.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const oppPoints = oppCum.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const gridValues = [0.25, 0.5, 0.75, 1].map((ratio) => max * ratio);

  return (
    <div className="overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_32px_rgba(0,0,0,0.035)]">
      <div className="flex flex-col gap-3 border-b border-black/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[12px] font-semibold text-[#0071e3]">Week trajectory</p>
          <h3 className="mt-1 text-[21px] font-semibold tracking-[-0.03em]">Projected cumulative score</h3>
        </div>
        <div className="flex items-center gap-4 text-[12px] font-semibold text-[#6e6e73]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0071e3]" />{mineName}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ff453a]" />{oppName}</span>
        </div>
      </div>
      <div className="p-3 sm:p-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Projected cumulative fantasy points by day">
          {gridValues.map((value) => (
            <g key={value}>
              <line x1={left} y1={y(value)} x2={width - right} y2={y(value)} stroke="#e5e5ea" strokeWidth="1" />
              <text x={left - 8} y={y(value) + 4} textAnchor="end" fontSize="10" fill="#86868b">{Math.round(value)}</text>
            </g>
          ))}
          <polyline points={oppPoints} fill="none" stroke="#ff453a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={minePoints} fill="none" stroke="#0071e3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {mineCum.map((value, index) => <circle key={`m-${DAYS[index]}`} cx={x(index)} cy={y(value)} r="4" fill="#0071e3" stroke="white" strokeWidth="2" />)}
          {oppCum.map((value, index) => <circle key={`o-${DAYS[index]}`} cx={x(index)} cy={y(value)} r="3.5" fill="#ff453a" stroke="white" strokeWidth="2" />)}
          {DAYS.map((day, index) => <text key={day} x={x(index)} y={height - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#6e6e73">{day}</text>)}
        </svg>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_28px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#86868b]">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f2f2f7] text-[#6e6e73]">{icon}</span>
      </div>
      <p className="mt-5 text-[30px] font-semibold tracking-[-0.045em] text-[#1d1d1f]">{value}</p>
      <p className="mt-1 text-[12px] font-medium leading-5 text-[#86868b]">{detail}</p>
    </div>
  );
}

export default function FantasyPage() {
  const [players, setPlayers] = useState<Player[]>(seedPlayers);
  const [source, setSource] = useState<"snapshot" | "live">("snapshot");
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabKey>("matchup");
  const [selectedDay, setSelectedDay] = useState<DayKey>("Tue");
  const [copied, setCopied] = useState(false);
  const [scenarioEnabled, setScenarioEnabled] = useState(false);
  const [scenarioStart, setScenarioStart] = useState<DayKey>("Thu");
  const [dropId, setDropId] = useState("mine-olynyk");
  const [streamerName, setStreamerName] = useState("Streamer");
  const [streamerAvg, setStreamerAvg] = useState(34);
  const [streamerDays, setStreamerDays] = useState<Record<DayKey, boolean>>(schedule("Thu", "Fri", "Sun"));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setRefreshing(true);
      try {
        const response = await fetch(`/api/fantasy?_=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Feed unavailable");
        const parsed = playersFromCsv(await response.text());
        if (!cancelled && parsed.some((player) => player.side === "mine") && parsed.some((player) => player.side === "opp")) {
          setPlayers(parsed);
          setSource("live");
        }
      } catch {
        if (!cancelled) setSource("snapshot");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };
    load();
    const interval = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const mineBase = useMemo(() => players.filter((player) => player.side === "mine"), [players]);
  const oppPlayers = useMemo(() => players.filter((player) => player.side === "opp"), [players]);
  const freeAgents = useMemo(() => players.filter((player) => player.side === "fa"), [players]);
  const mineName = mineBase[0]?.owner || "My Team";
  const oppName = oppPlayers[0]?.owner || "Opponent";

  const simulatedMine = useMemo(() => {
    if (!scenarioEnabled) return mineBase;
    const startIndex = DAYS.indexOf(scenarioStart);
    const adjusted = mineBase.map((player) => {
      if (player.id !== dropId) return player;
      const previousDay = startIndex > 0 ? DAYS[startIndex - 1] : null;
      return { ...player, rosterTo: previousDay };
    });
    const added: Player = {
      id: "scenario-streamer",
      side: "mine",
      owner: mineName,
      name: streamerName || "Streamer",
      slot: "BE",
      eligible: ["PG", "SG", "SF", "PF", "C"],
      season: streamerAvg,
      d30: streamerAvg,
      d7: streamerAvg,
      games: streamerDays,
      actuals: noActuals(),
      status: "Active",
      rosterFrom: scenarioStart,
      rosterTo: null,
    };
    return [...adjusted, added];
  }, [dropId, mineBase, mineName, scenarioEnabled, scenarioStart, streamerAvg, streamerDays, streamerName]);

  const mineResults = useMemo(() => weekResults(simulatedMine), [simulatedMine]);
  const baseMineResults = useMemo(() => weekResults(mineBase), [mineBase]);
  const oppResults = useMemo(() => weekResults(oppPlayers), [oppPlayers]);
  const mineForecast = sumResults(mineResults, "forecast");
  const baseMineForecast = sumResults(baseMineResults, "forecast");
  const oppForecast = sumResults(oppResults, "forecast");
  const edge = mineForecast - oppForecast;
  const scenarioDelta = mineForecast - baseMineForecast;
  const mineGames = mineResults.reduce((sum, result) => sum + result.assignments.length, 0);
  const oppGames = oppResults.reduce((sum, result) => sum + result.assignments.length, 0);
  const mineScheduled = mineResults.reduce((sum, result) => sum + result.scheduled, 0);
  const oppScheduled = oppResults.reduce((sum, result) => sum + result.scheduled, 0);
  const mineOverflow = mineResults.reduce((sum, result) => sum + result.overflow, 0);
  const selectedMine = mineResults[DAYS.indexOf(selectedDay)];
  const selectedOpp = oppResults[DAYS.indexOf(selectedDay)];

  const playerRows = useMemo(() => {
    const selectedIdsByDay = new Map<DayKey, Set<string>>();
    mineResults.forEach((result) => selectedIdsByDay.set(result.day, new Set(result.assignments.map((assignment) => assignment.player.id))));
    return simulatedMine
      .map((player) => {
        const starts = DAYS.filter((day) => selectedIdsByDay.get(day)?.has(player.id));
        const weekly = starts.reduce((sum, day) => sum + (player.actuals[day] ?? trueAverage(player)), 0);
        return { player, starts, weekly };
      })
      .sort((a, b) => b.weekly - a.weekly);
  }, [mineResults, simulatedMine]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const resetScenario = () => {
    setScenarioEnabled(false);
    setScenarioStart("Thu");
    setDropId(mineBase.find((player) => player.slot === "BE")?.id ?? mineBase[0]?.id ?? "");
    setStreamerName("Streamer");
    setStreamerAvg(34);
    setStreamerDays(schedule("Thu", "Fri", "Sun"));
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] pb-14 text-[#1d1d1f] antialiased" style={{ fontFamily: appleFont }}>
      <div className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/72">
        <div className="mx-auto flex h-[62px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#0071e3] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
              <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </div>
            <div>
              <p className="text-[15px] font-semibold leading-4 tracking-[-0.01em]">Fantasy Lab</p>
              <p className="mt-0.5 text-[11px] font-medium text-[#86868b]">Basketball Forecast</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={copyLink} className="hidden h-8 items-center gap-1.5 rounded-full bg-[#f2f2f7] px-3 text-[11px] font-semibold text-[#6e6e73] transition hover:bg-[#e9e9ee] sm:flex">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Share"}
            </button>
            <div className="flex h-8 items-center gap-2 rounded-full bg-[#f2f2f7] px-3 text-[11px] font-semibold text-[#6e6e73]">
              <span className={`h-2 w-2 rounded-full ${source === "live" ? "bg-[#34c759]" : "bg-[#ff9f0a]"}`} />
              <span>{source === "live" ? "Live" : "Snapshot"}</span>
              {refreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-11 lg:px-8">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0071e3]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              Weekly matchup intelligence
            </div>
            <h1 className="mt-2 text-[36px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[52px]">Win the week before it happens.</h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-6 tracking-[-0.01em] text-[#6e6e73] sm:text-[17px] sm:leading-7">
              Form-weighted projections, automatic daily lineup optimization, schedule congestion, and streamer what-if planning in one view.
            </p>
          </div>
          <div className="inline-flex self-start rounded-full bg-[#e9e9ee] p-1 lg:self-end">
            {(["matchup", "players", "planner"] as TabKey[]).map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-[12px] font-semibold capitalize transition ${tab === item ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73]"}`}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_14px_44px_rgba(0,0,0,0.04)]">
          <div className="grid lg:grid-cols-[1fr_auto_1fr]">
            <div className="p-6 sm:p-8">
              <p className="text-[12px] font-semibold text-[#86868b]">{mineName}</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-[48px] font-semibold leading-none tracking-[-0.055em] text-[#0071e3] sm:text-[62px]">{formatPoints(mineForecast)}</p>
                <p className="pb-1.5 text-[12px] font-semibold text-[#86868b]">forecast pts</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef6ff] px-3 py-1.5 text-[11px] font-semibold text-[#0066cc]">{mineGames} optimized starts</span>
                <span className="rounded-full bg-[#f2f2f7] px-3 py-1.5 text-[11px] font-semibold text-[#6e6e73]">{mineScheduled} scheduled games</span>
              </div>
            </div>
            <div className="flex items-center justify-center border-y border-black/[0.06] px-6 py-5 lg:border-x lg:border-y-0">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868b]">Projected edge</p>
                <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold ${edge >= 0 ? "bg-[#ecf8ef] text-[#23753a]" : "bg-[#fff0ef] text-[#b42318]"}`}>
                  {edge >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {edge >= 0 ? "+" : ""}{formatPoints(edge)}
                </div>
                <p className="mt-2 text-[11px] font-medium text-[#86868b]">model forecast</p>
              </div>
            </div>
            <div className="p-6 text-right sm:p-8">
              <p className="text-[12px] font-semibold text-[#86868b]">{oppName}</p>
              <div className="mt-2 flex items-end justify-end gap-3">
                <p className="pb-1.5 text-[12px] font-semibold text-[#86868b]">forecast pts</p>
                <p className="text-[48px] font-semibold leading-none tracking-[-0.055em] text-[#ff453a] sm:text-[62px]">{formatPoints(oppForecast)}</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <span className="rounded-full bg-[#f2f2f7] px-3 py-1.5 text-[11px] font-semibold text-[#6e6e73]">{oppGames} optimized starts</span>
                <span className="rounded-full bg-[#f2f2f7] px-3 py-1.5 text-[11px] font-semibold text-[#6e6e73]">{oppScheduled} scheduled games</span>
              </div>
            </div>
          </div>
        </section>

        {tab === "matchup" && (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Schedule edge" value={`${mineGames - oppGames >= 0 ? "+" : ""}${mineGames - oppGames}`} detail={`${mineGames} usable starts vs ${oppGames}`} icon={<CalendarDays className="h-4 w-4" />} />
              <StatCard label="Overflow games" value={String(mineOverflow)} detail={mineOverflow ? "Games at risk of sitting on your bench" : "No projected lineup waste"} icon={<AlertTriangle className="h-4 w-4" />} />
              <StatCard label="Model form" value="45 / 35 / 20" detail="Season / 30-day / 7-day weighting" icon={<Gauge className="h-4 w-4" />} />
              <StatCard label="Scenario impact" value={`${scenarioDelta >= 0 ? "+" : ""}${formatPoints(scenarioDelta, 1)}`} detail={scenarioEnabled ? "Current streamer what-if vs base roster" : "Open Planner to test a streamer"} icon={<Zap className="h-4 w-4" />} />
            </section>

            <section className="mt-5">
              <CumulativeChart mine={mineResults} opp={oppResults} mineName={mineName} oppName={oppName} />
            </section>

            <section className="mt-5">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-[#0071e3]">Daily map</p>
                  <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Where the week is won</h2>
                </div>
                <p className="hidden text-[12px] font-medium text-[#86868b] sm:block">Tap a day to inspect the lineup</p>
              </div>
              <div className="grid gap-3 md:grid-cols-7">
                {DAYS.map((day, index) => {
                  const mineDay = mineResults[index];
                  const oppDay = oppResults[index];
                  const dailyEdge = mineDay.forecast - oppDay.forecast;
                  const selected = selectedDay === day;
                  return (
                    <button key={day} type="button" onClick={() => { setSelectedDay(day); setTab("planner"); }} className={`rounded-[20px] border p-4 text-left transition active:scale-[0.985] ${selected ? "border-[#0071e3] bg-[#f7fbff] ring-1 ring-[#0071e3]/10" : "border-black/[0.07] bg-white hover:-translate-y-0.5 hover:shadow-md"}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-[#6e6e73]">{day}</p>
                        {mineDay.overflow > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#fff2d6] px-1 text-[9px] font-bold text-[#8a6400]">+{mineDay.overflow}</span>}
                      </div>
                      <p className="mt-4 text-[23px] font-semibold tracking-[-0.04em] text-[#0071e3]">{formatPoints(mineDay.forecast)}</p>
                      <p className="mt-0.5 text-[13px] font-semibold text-[#ff453a]">{formatPoints(oppDay.forecast)}</p>
                      <div className="mt-4 border-t border-black/[0.06] pt-3">
                        <p className={`text-[11px] font-semibold ${dailyEdge >= 0 ? "text-[#23753a]" : "text-[#b42318]"}`}>{dailyEdge >= 0 ? "+" : ""}{formatPoints(dailyEdge)} edge</p>
                        <p className="mt-1 text-[10px] font-medium text-[#86868b]">{mineDay.assignments.length} vs {oppDay.assignments.length} starts</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {tab === "players" && (
          <section className="mt-5 overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_32px_rgba(0,0,0,0.035)]">
            <div className="flex flex-col gap-3 border-b border-black/[0.06] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div>
                <p className="text-[12px] font-semibold text-[#0071e3]">{mineName}</p>
                <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Player projection board</h2>
              </div>
              <p className="max-w-lg text-[12px] leading-5 text-[#86868b]">True Avg blends season, 30-day, and 7-day form. Missing windows are automatically reweighted instead of treated as zero.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#fafafa] text-[10px] font-bold uppercase tracking-[0.08em] text-[#86868b]">
                    <th className="px-5 py-3">Player</th>
                    <th className="px-3 py-3">Season</th>
                    <th className="px-3 py-3">30D</th>
                    <th className="px-3 py-3">7D</th>
                    <th className="px-3 py-3">True Avg</th>
                    <th className="px-3 py-3">Form</th>
                    <th className="px-3 py-3">Starts</th>
                    <th className="px-5 py-3 text-right">Week Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {playerRows.map(({ player, starts, weekly }) => {
                    const direction = trend(player);
                    return (
                      <tr key={player.id} className="border-b border-black/[0.05] last:border-b-0 hover:bg-[#fafafa]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f7] text-[11px] font-bold text-[#6e6e73]">{player.eligible[0] ?? "U"}</span>
                            <div>
                              <p className="text-[14px] font-semibold tracking-[-0.01em]">{player.name}</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-[#86868b]">{player.status}{player.rosterFrom ? ` · from ${player.rosterFrom}` : ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-[13px] font-medium">{formatPoints(player.season, 1)}</td>
                        <td className="px-3 py-4 text-[13px] font-medium text-[#6e6e73]">{player.d30 === null ? "—" : formatPoints(player.d30, 1)}</td>
                        <td className="px-3 py-4 text-[13px] font-medium text-[#6e6e73]">{player.d7 === null ? "—" : formatPoints(player.d7, 1)}</td>
                        <td className="px-3 py-4 text-[14px] font-semibold text-[#0071e3]">{formatPoints(trueAverage(player), 1)}</td>
                        <td className="px-3 py-4"><div className="flex items-center gap-2"><Sparkline player={player} />{direction === "up" ? <TrendingUp className="h-4 w-4 text-[#34c759]" /> : direction === "down" ? <TrendingDown className="h-4 w-4 text-[#ff453a]" /> : <CircleDot className="h-4 w-4 text-[#86868b]" />}</div></td>
                        <td className="px-3 py-4 text-[12px] font-semibold text-[#6e6e73]">{starts.length} <span className="font-medium text-[#aeaeb2]">/ {DAYS.filter((day) => player.games[day] && activeForDay(player, day)).length}</span></td>
                        <td className="px-5 py-4 text-right text-[15px] font-semibold">{formatPoints(weekly, 1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "planner" && (
          <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
            <div className="rounded-[24px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_32px_rgba(0,0,0,0.035)]">
              <div className="border-b border-black/[0.06] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-[#0071e3]">Daily optimizer</p>
                    <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Best lineup for {DAY_NAMES[selectedDay]}</h2>
                  </div>
                  <div className="flex flex-wrap gap-1 rounded-full bg-[#f2f2f7] p-1">
                    {DAYS.map((day) => <button key={day} type="button" onClick={() => setSelectedDay(day)} className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${selectedDay === day ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#86868b]"}`}>{day}</button>)}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="border-b border-black/[0.06] p-5 md:border-b-0 md:border-r sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-[#6e6e73]">{mineName}</p>
                      <p className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[#0071e3]">{formatPoints(selectedMine.forecast, 1)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-[#86868b]">{selectedMine.scheduled} scheduled</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#86868b]">{selectedMine.assignments.length} starting</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    {LINEUP_SLOTS.map((slot, index) => {
                      const assignment = selectedMine.assignments.find((item) => item.slot === slot && selectedMine.assignments.indexOf(item) === index) ?? selectedMine.assignments[index];
                      return (
                        <div key={`${slot}-${index}`} className="flex items-center justify-between rounded-[14px] bg-[#f7f7f9] px-3 py-2.5">
                          <span className="w-9 text-[10px] font-bold text-[#86868b]">{slot}</span>
                          {assignment ? <><span className="flex-1 truncate text-[12px] font-semibold">{assignment.player.name}</span><span className="text-[12px] font-semibold text-[#0071e3]">{formatPoints(assignment.player.actuals[selectedDay] ?? trueAverage(assignment.player), 1)}</span></> : <span className="flex-1 text-[12px] font-medium text-[#aeaeb2]">Open slot</span>}
                        </div>
                      );
                    })}
                  </div>
                  {selectedMine.overflow > 0 && <div className="mt-4 flex items-start gap-2 rounded-[14px] bg-[#fff8e8] p-3 text-[11px] font-medium leading-5 text-[#8a6400]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{selectedMine.overflow} scheduled player{selectedMine.overflow > 1 ? "s" : ""} cannot fit after positional optimization.</div>}
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-[#6e6e73]">{oppName}</p>
                      <p className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[#ff453a]">{formatPoints(selectedOpp.forecast, 1)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-[#86868b]">{selectedOpp.scheduled} scheduled</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#86868b]">{selectedOpp.assignments.length} starting</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    {selectedOpp.assignments.map((assignment, index) => (
                      <div key={`${assignment.player.id}-${index}`} className="flex items-center justify-between rounded-[14px] bg-[#f7f7f9] px-3 py-2.5">
                        <span className="w-9 text-[10px] font-bold text-[#86868b]">{assignment.slot}</span>
                        <span className="flex-1 truncate text-[12px] font-semibold">{assignment.player.name}</span>
                        <span className="text-[12px] font-semibold text-[#ff453a]">{formatPoints(assignment.player.actuals[selectedDay] ?? trueAverage(assignment.player), 1)}</span>
                      </div>
                    ))}
                    {selectedOpp.openSlots > 0 && Array.from({ length: selectedOpp.openSlots }).map((_, index) => <div key={`open-${index}`} className="flex items-center rounded-[14px] bg-[#f7f7f9] px-3 py-2.5 text-[12px] font-medium text-[#aeaeb2]">Open slot</div>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_32px_rgba(0,0,0,0.035)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[#0071e3]"><UserRoundPlus className="h-4 w-4" />Streamer lab</div>
                  <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Test the move first.</h2>
                </div>
                <button type="button" onClick={resetScenario} className="grid h-8 w-8 place-items-center rounded-full bg-[#f2f2f7] text-[#86868b]" aria-label="Reset scenario"><RotateCcw className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-[#86868b]">Drop a player from a chosen day, add a hypothetical streamer, and the entire week re-optimizes instantly.</p>

              <label className="mt-5 flex items-center justify-between rounded-[16px] bg-[#f7f7f9] p-3">
                <span>
                  <span className="block text-[12px] font-semibold">Enable scenario</span>
                  <span className="mt-0.5 block text-[10px] font-medium text-[#86868b]">Local only — it never changes your sheet</span>
                </span>
                <button type="button" onClick={() => setScenarioEnabled((value) => !value)} className={`relative h-7 w-12 rounded-full transition ${scenarioEnabled ? "bg-[#34c759]" : "bg-[#d1d1d6]"}`} aria-pressed={scenarioEnabled}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${scenarioEnabled ? "left-6" : "left-1"}`} /></button>
              </label>

              <div className={`mt-4 space-y-4 ${scenarioEnabled ? "" : "pointer-events-none opacity-45"}`}>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#86868b]">Drop</label>
                  <select value={dropId} onChange={(event) => setDropId(event.target.value)} className="mt-1.5 w-full rounded-[14px] border border-black/[0.08] bg-white px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-[#0071e3]">
                    {mineBase.filter((player) => player.status.toLowerCase() !== "ir").map((player) => <option key={player.id} value={player.id}>{player.name} · {formatPoints(trueAverage(player), 1)} avg</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#86868b]">Starting</label>
                    <select value={scenarioStart} onChange={(event) => setScenarioStart(event.target.value as DayKey)} className="mt-1.5 w-full rounded-[14px] border border-black/[0.08] bg-white px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-[#0071e3]">{DAYS.map((day) => <option key={day} value={day}>{DAY_NAMES[day]}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#86868b]">Streamer avg</label>
                    <input type="number" min="0" max="100" step="0.5" value={streamerAvg} onChange={(event) => setStreamerAvg(Number(event.target.value) || 0)} className="mt-1.5 w-full rounded-[14px] border border-black/[0.08] bg-white px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-[#0071e3]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#86868b]">Streamer name</label>
                  <input value={streamerName} onChange={(event) => setStreamerName(event.target.value)} className="mt-1.5 w-full rounded-[14px] border border-black/[0.08] bg-white px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-[#0071e3]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#86868b]">Games this week</label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {DAYS.map((day) => <button key={day} type="button" onClick={() => setStreamerDays((current) => ({ ...current, [day]: !current[day] }))} className={`h-8 min-w-9 rounded-full px-2 text-[10px] font-semibold transition ${streamerDays[day] ? "bg-[#0071e3] text-white" : "bg-[#f2f2f7] text-[#6e6e73]"}`}>{day}</button>)}
                  </div>
                </div>
              </div>

              <div className={`mt-5 rounded-[18px] p-4 ${scenarioDelta >= 0 ? "bg-[#ecf8ef]" : "bg-[#fff0ef]"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.08em] ${scenarioDelta >= 0 ? "text-[#23753a]" : "text-[#b42318]"}`}>Projected change</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className={`text-[30px] font-semibold tracking-[-0.045em] ${scenarioDelta >= 0 ? "text-[#23753a]" : "text-[#b42318]"}`}>{scenarioDelta >= 0 ? "+" : ""}{formatPoints(scenarioDelta, 1)}</p>
                  <p className="pb-1 text-[11px] font-semibold text-[#6e6e73]">week points</p>
                </div>
              </div>

              {freeAgents.length > 0 && (
                <div className="mt-5 border-t border-black/[0.06] pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#86868b]">Sheet free agents</p>
                  <div className="mt-2 space-y-2">
                    {freeAgents.slice(0, 4).map((player) => <div key={player.id} className="flex items-center justify-between rounded-[12px] bg-[#f7f7f9] px-3 py-2"><span className="text-[11px] font-semibold">{player.name}</span><span className="text-[11px] font-semibold text-[#0071e3]">{formatPoints(trueAverage(player), 1)}</span></div>)}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[22px] border border-black/[0.07] bg-white p-5 lg:col-span-2">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#eef6ff] text-[#0071e3]"><Activity className="h-4 w-4" /></span>
              <div>
                <p className="text-[13px] font-semibold">How the forecast works</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6e6e73]">Each player gets a form-weighted True Avg. The optimizer then solves every day against PG, SG, SF, PF, C, G, F and three UTIL slots, so a 12-game schedule does not falsely count 12 usable games when only 10 players can actually start.</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setTab("planner")} className="group flex items-center justify-between rounded-[22px] bg-[#1d1d1f] p-5 text-left text-white transition hover:bg-black">
            <div>
              <p className="text-[11px] font-semibold text-white/55">Next move</p>
              <p className="mt-1 text-[15px] font-semibold">Open the streamer planner</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition group-hover:translate-x-0.5"><ChevronRight className="h-4 w-4" /></span>
          </button>
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-black/[0.06] pt-5 text-[10px] font-medium text-[#86868b] sm:flex-row sm:items-center sm:justify-between">
          <span>Fantasy Lab · read-only public dashboard</span>
          <span>Refreshes every 60 seconds when a live sheet feed is connected.</span>
        </footer>
      </div>
    </main>
  );
}
