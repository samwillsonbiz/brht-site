"use client";

import { useMemo, useState } from "react";

type FableCard = {
  id: string;
  card_type: "loot" | "event" | "trap" | "enemy" | "special" | "skill" | "monster" | "hero";
  title: string;
  subtype?: string | null;
  difficulty?: string | null;
  race?: string | null;
  rules_text?: string | null;
  story_text?: string | null;
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

const TYPE_STYLES: Record<string, string> = {
  loot: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  event: "border-sky-300/40 bg-sky-300/10 text-sky-100",
  trap: "border-rose-300/40 bg-rose-300/10 text-rose-100",
  enemy: "border-red-400/45 bg-red-500/10 text-red-100",
  special: "border-violet-300/40 bg-violet-400/10 text-violet-100",
  skill: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
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

export default function FableFuryRunLab() {
  const [run, setRun] = useState<RunSetup | null>(null);
  const [realm, setRealm] = useState(1);
  const [revealed, setRevealed] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [] });
  const [cardsByCell, setCardsByCell] = useState<Record<string, FableCard>>({});
  const [selectedCard, setSelectedCard] = useState<FableCard | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
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
  const realmRevealed = revealed[realm] ?? [];

  const remainingLocations = 14 - realmRevealed.length;
  const deckSummary = useMemo(() => run?.deck_counts ?? {}, [run]);

  async function startRun() {
    setLoading("setup");
    setError(null);
    try {
      const setup = await postJson<RunSetup>("/api/fablefury/run", { heroIds: ["hero-alf-featherbottom"] });
      setRun(setup);
      setRealm(1);
      setRevealed({ 1: [], 2: [], 3: [] });
      setCardsByCell({});
      setSelectedCard(null);
      setSelectedCell(null);
      setLootRemaining(setup.deck_counts.loot ?? 60);
      setBackpack([null, null, null]);
      setPendingLoot(null);
      setLearnedSkills([]);
      setSkillChoices([]);
      setSkillColor(null);
      setSkillRemaining({
        red: setup.deck_counts["skills-red"] ?? 18,
        blue: setup.deck_counts["skills-blue"] ?? 18,
        green: setup.deck_counts["skills-green"] ?? 18,
        yellow: setup.deck_counts["skills-yellow"] ?? 18,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start run.");
    } finally {
      setLoading(null);
    }
  }

  async function revealLocation(cell: string) {
    if (!run || !map) return;
    const seen = realmRevealed;
    const allowed = seen.includes(cell)
      || (seen.length === 0 ? cell === map.start_cell : seen.some((seenCell) => isAdjacent(seenCell, cell)));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reveal location.");
    } finally {
      setLoading(null);
    }
  }

  async function drawLoot() {
    if (!run || lootRemaining <= 0) return;
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

  return (
    <main className="min-h-screen bg-[#0d1118] px-4 py-7 text-[#f8f0dc] md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">Fable Fury · Real Deck Engine</div>
            <h1 className="mt-2 text-4xl font-black tracking-[-.05em] md:text-6xl">Run Lab</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">A run now creates persistent shuffled Loot, Skill, and Realm decks from the real base-game database. Realm cards are secretly dealt to the selected Map at setup, so a location keeps the same hidden card until you reveal it.</p>
          </div>
          <div className="flex gap-2">
            <a href="/fablefury/deckbuilder" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/70 hover:bg-white/10">← Hero Lab</a>
            <button onClick={startRun} disabled={loading === "setup"} className="rounded-xl bg-amber-300 px-5 py-3 text-xs font-black text-[#241707] shadow-lg shadow-amber-500/10 disabled:opacity-40">{run ? "New Run" : "Start Run"}</button>
          </div>
        </header>

        {error && <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}

        {!run ? (
          <section className="mt-12 grid min-h-[430px] place-items-center rounded-[30px] border border-white/10 bg-white/[.035] p-8 text-center">
            <div className="max-w-xl">
              <div className="text-6xl">🃏</div>
              <h2 className="mt-5 text-3xl font-black tracking-[-.04em]">Build the run once. Then play from it.</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Starting a run shuffles the physical source decks, builds all three 14-card Realms with the correct recipes, chooses three Map cards, secretly places every Realm card on its map, and creates independent Loot and Skill draw piles.</p>
              <button onClick={startRun} className="mt-7 rounded-2xl bg-amber-300 px-7 py-4 text-sm font-black text-[#241707]">Create a real shuffled run</button>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-5 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[.16em] text-white/40">Realm map</div>
                    <h2 className="mt-1 text-2xl font-black">Realm {realm}: {map?.name}</h2>
                    <p className="mt-1 text-xs text-white/45">Start at <strong className="text-amber-300">{map?.start_cell}</strong> · {remainingLocations} hidden locations remain</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((value) => <button key={value} onClick={() => { setRealm(value); setSelectedCard(null); setSelectedCell(null); }} className={`rounded-xl px-4 py-2 text-xs font-black ${realm === value ? "bg-amber-300 text-[#241707]" : "border border-white/10 bg-white/5 text-white/60"}`}>Realm {value}</button>)}
                  </div>
                </div>

                {map && (
                  <div className="mt-7 overflow-x-auto pb-2">
                    <div className="grid min-w-[620px] grid-cols-6 gap-3">
                      {Array.from({ length: map.grid.rows }).flatMap((_, rowIndex) => map.grid.columns.map((column) => {
                        const cell = `${column}${rowIndex + 1}`;
                        const active = map.grid.active_cells.includes(cell);
                        const seen = realmRevealed.includes(cell);
                        const canEnter = active && (seen || (realmRevealed.length === 0 ? cell === map.start_cell : realmRevealed.some((prior) => isAdjacent(prior, cell))));
                        const card = cardsByCell[`${realm}:${cell}`];
                        if (!active) return <div key={cell} className="aspect-[4/3] rounded-2xl border border-dashed border-white/[.035] bg-black/10" />;
                        return (
                          <button key={cell} onClick={() => revealLocation(cell)} disabled={!canEnter || loading === `cell-${realm}-${cell}`} className={`relative aspect-[4/3] overflow-hidden rounded-2xl border p-3 text-left transition ${seen ? "border-amber-300/45 bg-amber-300/10" : canEnter ? "border-white/20 bg-white/[.07] hover:-translate-y-1 hover:border-amber-300/60" : "border-white/[.07] bg-white/[.02] opacity-35"}`}>
                            <span className="text-[9px] font-black uppercase tracking-[.12em] text-white/35">{cell}</span>
                            {cell === map.start_cell && <span className="absolute right-2 top-2 rounded-full bg-amber-300 px-2 py-1 text-[8px] font-black text-[#241707]">START</span>}
                            <div className="mt-3 text-sm font-black leading-tight">{seen ? card?.title ?? "Revealed" : "?"}</div>
                            {seen && <div className="mt-1 text-[9px] font-bold uppercase text-white/40">{card?.card_type}</div>}
                          </button>
                        );
                      }))}
                    </div>
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-white/[.07] bg-black/20 p-4 text-xs leading-5 text-white/50">
                  <strong className="text-white/75">Realm {realm} recipe:</strong> {realm === 1 ? "1 Portal · 1 Shrine · 1 Trap · 4 Easy Enemies · 7 Events" : realm === 2 ? "1 Portal · 1 Shrine · 2 Traps · 4 Medium Enemies · 6 Events" : "1 Portal · 1 Shrine · 3 Traps · 4 Hard Enemies · 5 Events"}. The 14 cards were shuffled and assigned to these 14 cells when the run was created.
                </div>
              </div>

              <aside className="grid content-start gap-4">
                <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-5">
                  <div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Loot deck</div><h3 className="mt-1 text-xl font-black">{lootRemaining} cards left</h3></div><button onClick={drawLoot} disabled={loading === "loot" || lootRemaining <= 0 || !!pendingLoot} className="rounded-xl bg-amber-300 px-4 py-3 text-xs font-black text-[#241707] disabled:opacity-30">Draw Loot</button></div>
                  <p className="mt-3 text-xs leading-5 text-white/45">This is the actual shuffled 60-card base Loot deck. Every draw removes that card from this run&apos;s draw pile.</p>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-5">
                  <div className="text-[10px] font-black uppercase tracking-[.16em] text-white/40">Backpack · Loot pockets</div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {backpack.map((card, index) => <button key={index} onClick={() => card && setSelectedCard(card)} className="min-h-28 rounded-2xl border border-white/10 bg-black/20 p-3 text-left"><span className="text-[9px] font-black uppercase text-white/30">Slot {index + 1}</span><strong className="mt-2 block text-xs leading-tight">{card?.title ?? "Empty"}</strong><span className="mt-2 block text-[9px] text-white/35">{card?.subtype ?? "1 Loot card or coins"}</span></button>)}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-5">
                  <div className="text-[10px] font-black uppercase tracking-[.16em] text-white/40">Skill decks</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {SKILL_COLORS.map((color) => <button key={color} onClick={() => drawSkillChoices(color)} disabled={loading === `skill-${color}` || skillRemaining[color] < 3} className={`rounded-xl border px-3 py-3 text-left text-xs font-black capitalize disabled:opacity-30 ${color === "red" ? "border-red-400/30 bg-red-500/10" : color === "blue" ? "border-sky-400/30 bg-sky-500/10" : color === "green" ? "border-emerald-400/30 bg-emerald-500/10" : "border-yellow-400/30 bg-yellow-500/10"}`}>{color}<span className="block text-[9px] font-medium text-white/40">{skillRemaining[color]} left · draw 3</span></button>)}
                  </div>
                  {learnedSkills.length > 0 && <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/55"><strong className="text-white/80">Learned:</strong> {learnedSkills.map((card) => card.title).join(" · ")}</div>}
                </div>

                <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
                  <div className="text-[10px] font-black uppercase tracking-[.16em] text-white/35">Run ID</div>
                  <code className="mt-2 block break-all text-[10px] text-white/45">{run.run_id}</code>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-white/45">{Object.entries(deckSummary).map(([key, value]) => <div key={key} className="rounded-lg bg-white/[.04] px-2 py-2"><strong className="text-white/70">{key}</strong><span className="float-right">{value}</span></div>)}</div>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={() => { if (!pendingLoot) setSelectedCard(null); }}>
          <section onMouseDown={(event) => event.stopPropagation()} className={`w-full max-w-xl rounded-[28px] border p-6 shadow-2xl ${TYPE_STYLES[selectedCard.card_type] ?? "border-white/15 bg-[#151b24]"}`}>
            <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[.15em] opacity-55">{selectedCell ? `${selectedCell} · ` : ""}{selectedCard.card_type}{selectedCard.difficulty ? ` · ${selectedCard.difficulty}` : ""}</div><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">{selectedCard.title}</h2></div>{!pendingLoot && <button onClick={() => setSelectedCard(null)} className="rounded-full border border-white/15 px-3 py-1 text-lg">×</button>}</div>
            {selectedCard.story_text && <p className="mt-5 whitespace-pre-line text-sm italic leading-6 opacity-65">{selectedCard.story_text}</p>}
            {selectedCard.rules_text && <div className="mt-5 whitespace-pre-line rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-bold leading-6">{selectedCard.rules_text}</div>}
            {selectedCard.card_type === "enemy" && selectedCard.data && <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs"><Stat label="HP" value={selectedCard.data.health} /><Stat label="Damage" value={selectedCard.data.damage} /><Stat label="Agility" value={selectedCard.data.agility} /><Stat label="Reward" value={selectedCard.data.rewards} /></div>}
            {selectedCard.card_type === "trap" && selectedCard.data && <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs"><Stat label="Dodge" value={selectedCard.data.dodge} /><Stat label="Damage" value={selectedCard.data.damage} /></div>}
            {pendingLoot && (
              <div className="mt-6 border-t border-white/10 pt-5"><div className="text-xs font-black uppercase tracking-[.12em] opacity-55">Put this Loot in your backpack</div><div className="mt-3 grid grid-cols-3 gap-2">{backpack.map((card, index) => <button key={index} onClick={() => putLootInSlot(index)} className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 text-xs font-black">Slot {index + 1}<span className="mt-1 block text-[9px] font-medium opacity-50">{card ? `Replace ${card.title}` : "Empty"}</span></button>)}</div></div>
            )}
          </section>
        </div>
      )}

      {skillChoices.length > 0 && skillColor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <section className="w-full max-w-4xl rounded-[28px] border border-white/15 bg-[#151b24] p-6 shadow-2xl">
            <div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Shrine draw · {skillColor}</div>
            <h2 className="mt-2 text-3xl font-black">Choose 1 of 3</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">{skillChoices.map((card) => <button key={card.id} onClick={() => chooseSkill(card)} className="min-h-56 rounded-2xl border border-white/10 bg-white/[.04] p-5 text-left hover:border-amber-300/50"><div className="text-lg font-black">{card.title}</div><p className="mt-4 whitespace-pre-line text-xs leading-5 text-white/60">{card.rules_text}</p><strong className="mt-6 block text-xs text-amber-300">Learn this Skill →</strong></button>)}</div>
          </section>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><span className="block text-[9px] uppercase opacity-40">{label}</span><strong className="mt-1 block text-sm">{String(value ?? "—")}</strong></div>;
}
