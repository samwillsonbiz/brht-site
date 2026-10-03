"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  FABLE_CARD_BACKS,
  cardFrontArt,
  mapArt,
  skillBackArt,
} from "@/lib/fableFuryAssets";

type FableCard = {
  id: string;
  card_type: "loot" | "event" | "trap" | "enemy" | "special" | "skill" | "monster" | "hero";
  title: string;
  subtype?: string | null;
  difficulty?: string | null;
  race?: string | null;
  rules_text?: string | null;
  story_text?: string | null;
  source_sheet?: string | null;
  source_row?: number | null;
  data?: Record<string, unknown> | null;
};

type MapInfo = {
  id: string;
  name: string;
  start_cell: string;
  grid: { rows: number; columns: string[]; active_cells: string[] };
};

type RunSetup = {
  run_id: string;
  realm: number;
  maps: MapInfo[];
  deck_counts: Record<string, number>;
};

type RevealResult = {
  cell: string;
  already_revealed: boolean;
  card: FableCard;
  map: MapInfo;
  revealed: string[];
};

const SKILL_COLORS = ["red", "blue", "green", "yellow"] as const;
type SkillColor = (typeof SKILL_COLORS)[number];

const REALM_RECIPES: Record<number, string> = {
  1: "1 Portal · 1 Shrine · 1 Trap · 4 Easy Enemies · 7 Events",
  2: "1 Portal · 1 Shrine · 2 Traps · 4 Medium Enemies · 6 Events",
  3: "1 Portal · 1 Shrine · 3 Traps · 4 Hard Enemies · 5 Events",
};

const SKILL_LABELS: Record<SkillColor, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  yellow: "Yellow",
};

function isAdjacent(a: string, b: string) {
  const ax = a.charCodeAt(0) - 65;
  const ay = Number(a.slice(1));
  const bx = b.charCodeAt(0) - 65;
  const by = Number(b.slice(1));
  return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

function CardImage({ card, className = "" }: { card: FableCard; className?: string }) {
  const src = cardFrontArt(card);
  if (!src) {
    return (
      <div className={`grid place-items-center rounded-2xl border border-white/10 bg-[#151b25] p-5 text-center ${className}`}>
        <div>
          <div className="text-[9px] font-black uppercase tracking-[.16em] text-amber-300">{card.card_type}</div>
          <div className="mt-2 text-lg font-black">{card.title}</div>
          {card.rules_text && <p className="mt-3 text-xs leading-5 text-white/55">{card.rules_text}</p>}
        </div>
      </div>
    );
  }
  return <img src={src} alt={card.title} className={`block object-contain ${className}`} />;
}

function DeckPile({
  back,
  count,
  label,
  onClick,
  disabled,
}: {
  back: string;
  count: number;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick, disabled } : {})}
      className="group relative flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-amber-200/30 hover:bg-white/[.04] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <div className="relative h-[92px] w-[66px] shrink-0">
        <div className="absolute inset-0 translate-x-2 translate-y-1 rounded-lg border border-white/10 bg-[#262c35]" />
        <div className="absolute inset-0 translate-x-1 rounded-lg border border-white/10 bg-[#1a2028]" />
        <img src={back} alt={`${label} card back`} className="absolute inset-0 h-full w-full rounded-lg object-cover shadow-xl transition group-hover:-translate-y-1" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[10px] font-black uppercase tracking-[.14em] text-white/40">{label}</div>
        <div className="mt-1 text-xl font-black text-[#fff4d8]">{count}</div>
        <div className="text-[10px] text-white/35">cards left</div>
      </div>
    </Wrapper>
  );
}

function RevealModal({
  card,
  back,
  onClose,
  footer,
}: {
  card: FableCard;
  back: string;
  onClose: () => void;
  footer?: ReactNode;
}) {
  const front = cardFrontArt(card);
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-[#05070b]/85 p-4 py-8 backdrop-blur-xl" onMouseDown={onClose}>
      <section className="relative grid w-full max-w-[980px] gap-6 md:grid-cols-[minmax(260px,430px)_1fr]" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute -right-1 -top-12 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-xl text-white">×</button>
        <div className="mx-auto w-full max-w-[430px] [perspective:1400px]">
          <div className="ff-flip-card relative aspect-[746/1039] w-full [transform-style:preserve-3d]">
            <img src={back} alt="Card back" className="absolute inset-0 h-full w-full rounded-[24px] object-cover shadow-[0_35px_90px_rgba(0,0,0,.55)] [backface-visibility:hidden]" />
            <div className="absolute inset-0 overflow-hidden rounded-[24px] shadow-[0_35px_90px_rgba(0,0,0,.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              {front ? <img src={front} alt={card.title} className="h-full w-full object-cover" /> : <CardImage card={card} className="h-full w-full" />}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center rounded-[28px] border border-white/10 bg-[#111821]/90 p-6 shadow-2xl md:p-8">
          <div className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">{card.card_type}{card.difficulty ? ` · ${card.difficulty}` : ""}</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#fff6df] md:text-5xl">{card.title}</h2>
          {card.race && <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-white/40">{card.race}</div>}
          {card.rules_text && <p className="mt-5 whitespace-pre-line text-sm font-semibold leading-6 text-white/75">{card.rules_text}</p>}
          {card.story_text && <p className="mt-4 whitespace-pre-line border-t border-white/10 pt-4 text-sm italic leading-6 text-white/45">{card.story_text}</p>}
          {footer && <div className="mt-6 border-t border-white/10 pt-5">{footer}</div>}
        </div>
      </section>
    </div>
  );
}

export default function FableFuryRunLab() {
  const [run, setRun] = useState<RunSetup | null>(null);
  const [realm, setRealm] = useState(1);
  const [revealed, setRevealed] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [] });
  const [cardsByCell, setCardsByCell] = useState<Record<string, FableCard>>({});
  const [selectedCard, setSelectedCard] = useState<FableCard | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [lootRemaining, setLootRemaining] = useState(60);
  const [pendingLoot, setPendingLoot] = useState<FableCard | null>(null);
  const [backpack, setBackpack] = useState<Array<FableCard | null>>([null, null, null]);
  const [skillRemaining, setSkillRemaining] = useState<Record<SkillColor, number>>({ red: 18, blue: 18, green: 18, yellow: 18 });
  const [skillChoices, setSkillChoices] = useState<FableCard[]>([]);
  const [skillColor, setSkillColor] = useState<SkillColor | null>(null);
  const [learnedSkills, setLearnedSkills] = useState<FableCard[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const map = run?.maps[realm - 1] ?? null;
  const mapImage = mapArt(map?.id);
  const realmRevealed = revealed[realm] ?? [];
  const remainingLocations = 14 - realmRevealed.length;
  const deckSummary = useMemo(() => run?.deck_counts ?? {}, [run]);

  function resetTransient() {
    setSelectedCard(null);
    setSelectedCell(null);
    setShowReveal(false);
    setSkillChoices([]);
    setSkillColor(null);
    setPendingLoot(null);
  }

  async function startRun() {
    setLoading("setup");
    setError(null);
    try {
      const setup = await postJson<RunSetup>("/api/fablefury/run", { heroIds: ["hero-alf-featherbottom"] });
      setRun(setup);
      setRealm(1);
      setRevealed({ 1: [], 2: [], 3: [] });
      setCardsByCell({});
      setLootRemaining(setup.deck_counts.loot ?? 60);
      setBackpack([null, null, null]);
      setLearnedSkills([]);
      setSkillRemaining({
        red: setup.deck_counts["skills-red"] ?? 18,
        blue: setup.deck_counts["skills-blue"] ?? 18,
        green: setup.deck_counts["skills-green"] ?? 18,
        yellow: setup.deck_counts["skills-yellow"] ?? 18,
      });
      resetTransient();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start run.");
    } finally {
      setLoading(null);
    }
  }

  async function revealLocation(cell: string) {
    if (!run || !map) return;
    const seen = realmRevealed;
    const existing = cardsByCell[`${realm}:${cell}`];
    if (seen.includes(cell) && existing) {
      setSelectedCard(existing);
      setSelectedCell(cell);
      setShowReveal(true);
      return;
    }
    const allowed = seen.length === 0 ? cell === map.start_cell : seen.some((seenCell) => isAdjacent(seenCell, cell));
    if (!allowed) return;

    setLoading(`cell-${realm}-${cell}`);
    setError(null);
    try {
      const result = await postJson<RevealResult>("/api/fablefury/reveal", {
        runId: run.run_id,
        realm,
        cell,
      });
      setRevealed((current) => ({ ...current, [realm]: result.revealed }));
      setCardsByCell((current) => ({ ...current, [`${realm}:${cell}`]: result.card }));
      setSelectedCard(result.card);
      setSelectedCell(cell);
      setShowReveal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reveal location.");
    } finally {
      setLoading(null);
    }
  }

  async function drawLoot() {
    if (!run || lootRemaining <= 0 || pendingLoot) return;
    setLoading("loot");
    setError(null);
    try {
      const result = await postJson<{ card: FableCard | null; remaining: number }>("/api/fablefury/draw", {
        runId: run.run_id,
        deckKey: "loot",
      });
      if (result.card) {
        setPendingLoot(result.card);
        setSelectedCard(result.card);
        setSelectedCell(null);
        setShowReveal(true);
      }
      setLootRemaining(result.remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw Loot.");
    } finally {
      setLoading(null);
    }
  }

  function putLootInSlot(slot: number) {
    if (!pendingLoot) return;
    setBackpack((current) => current.map((card, index) => (index === slot ? pendingLoot : card)));
    setPendingLoot(null);
    setSelectedCard(null);
    setShowReveal(false);
  }

  async function drawSkillChoices(color: SkillColor) {
    if (!run || skillRemaining[color] < 3) return;
    setLoading(`skill-${color}`);
    setError(null);
    try {
      const cards: FableCard[] = [];
      let remaining = skillRemaining[color];
      for (let index = 0; index < 3; index += 1) {
        const result = await postJson<{ card: FableCard | null; remaining: number }>("/api/fablefury/draw", {
          runId: run.run_id,
          deckKey: `skills-${color}`,
        });
        if (result.card) cards.push(result.card);
        remaining = result.remaining;
      }
      setSkillRemaining((current) => ({ ...current, [color]: remaining }));
      setSkillChoices(cards);
      setSkillColor(color);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw Skills.");
    } finally {
      setLoading(null);
    }
  }

  function chooseSkill(card: FableCard) {
    setLearnedSkills((current) => [...current, card]);
    setSkillChoices([]);
    setSkillColor(null);
  }

  const revealFooter = pendingLoot && selectedCard?.id === pendingLoot.id ? (
    <div>
      <div className="mb-3 text-[10px] font-black uppercase tracking-[.15em] text-white/40">Put this Loot in your Backpack</div>
      <div className="grid gap-2 sm:grid-cols-3">
        {backpack.map((slotCard, index) => (
          <button key={index} type="button" onClick={() => putLootInSlot(index)} className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-left text-xs font-black text-amber-100 hover:bg-amber-300/20">
            Slot {index + 1}<span className="mt-1 block truncate text-[10px] font-medium text-white/45">{slotCard ? `Replace ${slotCard.title}` : "Empty"}</span>
          </button>
        ))}
      </div>
    </div>
  ) : selectedCell ? (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/55">Realm {realm}</span>
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/55">Location {selectedCell}</span>
      {selectedCard?.card_type === "enemy" && <span className="rounded-full border border-red-300/20 bg-red-400/10 px-3 py-2 font-bold text-red-100">Combat comes next</span>}
    </div>
  ) : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080b10] text-[#f8f0dc]">
      <style>{`
        @keyframes ffFlip { 0% { transform: rotateY(0deg) scale(.88); opacity:.92 } 48% { transform: rotateY(90deg) scale(1.04); } 100% { transform: rotateY(180deg) scale(1); opacity:1 } }
        .ff-flip-card { animation: ffFlip 820ms cubic-bezier(.2,.72,.2,1) forwards; }
        @keyframes ffPulse { 0%,100% { filter: drop-shadow(0 0 4px rgba(255,205,102,.16)); transform:translateY(0) scale(.82); } 50% { filter: drop-shadow(0 0 16px rgba(255,205,102,.72)); transform:translateY(-3px) scale(.86); } }
        .ff-reachable { animation: ffPulse 1.9s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(104,139,197,.13),transparent_35rem),radial-gradient(circle_at_78%_18%,rgba(238,177,70,.10),transparent_30rem),linear-gradient(160deg,#111722_0%,#080b10_70%)]" />

      <div className="relative mx-auto max-w-[1600px] px-4 py-6 md:px-8 lg:px-12 lg:py-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">Fable Fury · Digital Table</div>
            <h1 className="mt-2 text-4xl font-black tracking-[-.055em] md:text-6xl">Realm Explorer</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">The rules engine is now wearing the real game. Maps, hidden locations, Loot and Skills use the production Fable Fury artwork from your shared asset library.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/fablefury/deckbuilder" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/70 hover:bg-white/10">← Hero Lab</a>
            <button onClick={startRun} disabled={loading === "setup"} className="rounded-xl bg-amber-300 px-5 py-3 text-xs font-black text-[#241707] shadow-lg shadow-amber-500/10 disabled:opacity-40">{run ? "Deal New Run" : "Start Run"}</button>
          </div>
        </header>

        {error && <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}

        {!run ? (
          <section className="mt-10 grid min-h-[540px] place-items-center overflow-hidden rounded-[34px] border border-white/10 bg-white/[.03] p-8 text-center shadow-2xl">
            <div className="relative max-w-2xl">
              <div className="mx-auto flex w-fit -space-x-8">
                <img src={FABLE_CARD_BACKS.location} alt="Location back" className="h-48 w-36 -rotate-6 rounded-2xl object-cover shadow-2xl" />
                <img src={FABLE_CARD_BACKS.map} alt="Map back" className="z-10 h-48 w-36 rotate-2 rounded-2xl object-cover shadow-2xl" />
                <img src={FABLE_CARD_BACKS.loot} alt="Loot back" className="h-48 w-36 rotate-6 rounded-2xl object-cover shadow-2xl" />
              </div>
              <h2 className="mt-8 text-3xl font-black tracking-[-.045em] md:text-5xl">Deal the Realm.</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/50">A new run shuffles the real source decks, selects three Maps, secretly deals all 14 Realm locations, and keeps those hidden cards fixed until you explore them.</p>
              <button onClick={startRun} className="mt-7 rounded-2xl bg-amber-300 px-8 py-4 text-sm font-black text-[#241707] shadow-xl shadow-amber-500/15">Create a shuffled adventure</button>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[30px] border border-white/10 bg-white/[.035] p-4 shadow-2xl md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[.16em] text-white/35">Current Map</div>
                    <h2 className="mt-1 text-2xl font-black md:text-3xl">Realm {realm} · {map?.name}</h2>
                    <p className="mt-1 text-xs text-white/45">Begin at <strong className="text-amber-300">{map?.start_cell}</strong> · {remainingLocations} face-down locations remain</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((value) => (
                      <button key={value} type="button" onClick={() => { setRealm(value); resetTransient(); }} className={`rounded-xl px-4 py-2 text-xs font-black ${realm === value ? "bg-amber-300 text-[#241707]" : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}>Realm {value}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-[26px] border border-white/[.08] bg-[#05070a] p-3 md:p-5">
                  {map && mapImage ? (
                    <div className="relative mx-auto w-full max-w-[760px] select-none">
                      <img src={mapImage} alt={`${map.name} map`} className="block h-auto w-full rounded-[22px] object-contain shadow-[0_30px_90px_rgba(0,0,0,.48)]" />
                      <div className="absolute left-[6.2%] top-[33.2%] grid h-[43.8%] w-[86.2%] grid-cols-6 grid-rows-5">
                        {map.grid.active_cells.map((cell) => {
                          const column = cell.charCodeAt(0) - 64;
                          const row = Number(cell.slice(1));
                          const seen = realmRevealed.includes(cell);
                          const canEnter = seen || (realmRevealed.length === 0 ? cell === map.start_cell : realmRevealed.some((prior) => isAdjacent(prior, cell)));
                          const card = cardsByCell[`${realm}:${cell}`];
                          const front = card ? cardFrontArt(card) : null;
                          return (
                            <button
                              key={cell}
                              type="button"
                              onClick={() => revealLocation(cell)}
                              disabled={!canEnter || loading === `cell-${realm}-${cell}`}
                              aria-label={seen ? `View ${card?.title || cell}` : canEnter ? `Explore ${cell}` : `${cell} is not reachable yet`}
                              className={`relative z-10 grid place-items-center transition duration-200 ${canEnter && !seen ? "ff-reachable" : "scale-[.82]"} ${!canEnter ? "opacity-40 grayscale-[.25]" : ""}`}
                              style={{ gridColumn: column, gridRow: row }}
                            >
                              <span className="absolute -top-1 left-1/2 z-30 -translate-x-1/2 rounded-full border border-black/30 bg-black/70 px-1.5 py-0.5 text-[7px] font-black text-white/75 backdrop-blur">{cell}</span>
                              <div className="relative h-[116%] w-[74%] min-w-[34px] overflow-hidden rounded-[9px] border border-black/35 bg-black shadow-[0_8px_18px_rgba(0,0,0,.45)]">
                                <img src={seen && front ? front : FABLE_CARD_BACKS.location} alt="" className="h-full w-full object-cover" />
                                {loading === `cell-${realm}-${cell}` && <div className="absolute inset-0 grid place-items-center bg-black/60 text-[8px] font-black uppercase tracking-widest text-amber-200">Flip</div>}
                              </div>
                              {cell === map.start_cell && !seen && <span className="absolute bottom-0 rounded-full bg-amber-300 px-1.5 py-0.5 text-[7px] font-black text-[#251605] shadow">START</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid min-h-[500px] place-items-center text-sm text-white/45">Map art unavailable for this card.</div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[.07] bg-black/20 px-4 py-3 text-xs text-white/45">
                  <span><strong className="text-white/70">Realm recipe:</strong> {REALM_RECIPES[realm]}</span>
                  <span className="text-[10px] uppercase tracking-[.12em] text-white/30">Hidden cards were fixed when this run was dealt</span>
                </div>
              </div>

              <aside className="grid content-start gap-4">
                <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div><div className="text-[10px] font-black uppercase tracking-[.15em] text-amber-300">Draw piles</div><h3 className="mt-1 text-xl font-black">Your table</h3></div>
                    <div className="text-right text-[9px] text-white/30">Run<br/><span className="font-mono">{run.run_id.slice(0, 8)}</span></div>
                  </div>
                  <div className="grid gap-3">
                    <DeckPile back={FABLE_CARD_BACKS.loot} count={lootRemaining} label="Loot" onClick={drawLoot} disabled={loading === "loot" || lootRemaining <= 0 || !!pendingLoot} />
                    <div className="grid grid-cols-2 gap-2">
                      {SKILL_COLORS.map((color) => <DeckPile key={color} back={skillBackArt(color)} count={skillRemaining[color]} label={`${SKILL_LABELS[color]} Skill`} onClick={() => drawSkillChoices(color)} disabled={loading === `skill-${color}` || skillRemaining[color] < 3} />)}
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-5">
                  <div className="text-[10px] font-black uppercase tracking-[.15em] text-white/35">Backpack · Loot spaces</div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {backpack.map((card, index) => (
                      <button key={index} type="button" disabled={!card} onClick={() => { if (card) { setSelectedCard(card); setSelectedCell(null); setShowReveal(true); } }} className="relative aspect-[746/1039] overflow-hidden rounded-xl border border-white/10 bg-black/25 disabled:cursor-default">
                        {card ? <CardImage card={card} className="h-full w-full" /> : <div className="grid h-full place-items-center text-center text-[9px] font-black uppercase tracking-[.12em] text-white/25">Empty<br/>slot {index + 1}</div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-5">
                  <div className="text-[10px] font-black uppercase tracking-[.15em] text-white/35">Learned Skills</div>
                  {learnedSkills.length ? (
                    <div className="mt-3 flex -space-x-8 overflow-x-auto pb-2 pr-8">
                      {learnedSkills.map((card, index) => <button key={`${card.id}-${index}`} type="button" onClick={() => { setSelectedCard(card); setSelectedCell(null); setShowReveal(true); }} className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black shadow-xl transition hover:z-20 hover:-translate-y-2"><CardImage card={card} className="h-full w-full" /></button>)}
                    </div>
                  ) : <p className="mt-3 text-xs leading-5 text-white/35">Draw three from a colored Skill deck and choose one. The real card art is now used for every choice.</p>}
                </div>

                <details className="rounded-[22px] border border-white/[.07] bg-black/20 p-4 text-xs text-white/40">
                  <summary className="cursor-pointer font-black uppercase tracking-[.12em] text-white/50">Run diagnostics</summary>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {Object.entries(deckSummary).map(([key, value]) => <div key={key} className="rounded-lg bg-white/[.04] px-2 py-2"><span className="block text-[9px] uppercase text-white/30">{key}</span><strong className="text-white/65">{value}</strong></div>)}
                  </div>
                </details>
              </aside>
            </section>
          </>
        )}
      </div>

      {showReveal && selectedCard && (
        <RevealModal
          card={selectedCard}
          back={selectedCard.card_type === "loot" ? FABLE_CARD_BACKS.loot : FABLE_CARD_BACKS.location}
          onClose={() => { if (!pendingLoot) { setShowReveal(false); setSelectedCard(null); setSelectedCell(null); } }}
          footer={revealFooter}
        />
      )}

      {skillChoices.length > 0 && skillColor && (
        <div className="fixed inset-0 z-[190] grid place-items-center overflow-y-auto bg-[#05070b]/88 p-4 py-8 backdrop-blur-xl" onMouseDown={() => { setSkillChoices([]); setSkillColor(null); }}>
          <section className="relative w-full max-w-[1180px] rounded-[30px] border border-white/10 bg-[#101721]/95 p-5 shadow-2xl md:p-8" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => { setSkillChoices([]); setSkillColor(null); }} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-xl">×</button>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">Shrine-style Skill draw</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Choose 1 of 3 {SKILL_LABELS[skillColor]} Skills</h2>
            <p className="mt-2 text-sm text-white/45">These are the actual cards drawn from this run&apos;s persistent shuffled Skill deck.</p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {skillChoices.map((card) => (
                <button key={card.id} type="button" onClick={() => chooseSkill(card)} className="group text-left">
                  <div className="mx-auto aspect-[746/1039] w-full max-w-[330px] overflow-hidden rounded-[20px] border border-white/10 bg-black shadow-[0_25px_65px_rgba(0,0,0,.45)] transition duration-200 group-hover:-translate-y-2 group-hover:border-amber-300/50 group-hover:shadow-[0_30px_80px_rgba(232,171,63,.16)]">
                    <CardImage card={card} className="h-full w-full" />
                  </div>
                  <div className="mx-auto mt-3 max-w-[330px] rounded-xl bg-amber-300 px-4 py-3 text-center text-xs font-black text-[#241707] opacity-85 transition group-hover:opacity-100">Learn {card.title}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
