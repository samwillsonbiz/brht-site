"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  FABLE_CARD_BACKS,
  cardFrontArt,
  mapArt,
} from "@/lib/fableFuryAssets";
import {
  FABLE_HEROES,
  TOKEN_LABELS,
  getHero,
  type TokenKind,
} from "@/lib/fableFuryHeroes";
import {
  getEventPlan,
  requirementMet,
  type EventEffect,
  type EventPlan,
} from "@/lib/fableFuryEventEngine";

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

type GamePhase = "hero" | "gear" | "realm";
type EventStatus = "pending" | "resolving" | "resolved";
type EventState = {
  key: string;
  plan: EventPlan;
  status: EventStatus;
  messages: string[];
  roll?: number;
  pick?: number;
};

type TokenCounts = Record<TokenKind, number>;

const REALM_RECIPES: Record<number, string> = {
  1: "1 Portal · 1 Shrine · 1 Trap · 4 Easy Enemies · 7 Events",
  2: "1 Portal · 1 Shrine · 2 Traps · 4 Medium Enemies · 6 Events",
  3: "1 Portal · 1 Shrine · 3 Traps · 4 Hard Enemies · 5 Events",
};

const EMPTY_TOKENS: TokenCounts = { healing: 0, lucky: 0, crystal: 0 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isAdjacent(a: string, b: string) {
  const ax = a.charCodeAt(0) - 65;
  const ay = Number(a.slice(1));
  const bx = b.charCodeAt(0) - 65;
  const by = Number(b.slice(1));
  return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
}

function cardPosition(cell: string) {
  const columnIndex = cell.charCodeAt(0) - 65;
  const rowIndex = Number(cell.slice(1)) - 1;
  return {
    left: `${((columnIndex + 0.5) / 6) * 100}%`,
    top: `${((rowIndex + 0.5) / 5) * 100}%`,
  };
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

function FlipCard({ card, back }: { card: FableCard; back: string }) {
  const [faceUp, setFaceUp] = useState(false);
  const front = cardFrontArt(card);

  useEffect(() => {
    setFaceUp(false);
    const timer = window.setTimeout(() => setFaceUp(true), 120);
    return () => window.clearTimeout(timer);
  }, [card.id]);

  return (
    <div className="mx-auto w-full max-w-[430px] [perspective:1400px]">
      <div
        className="relative aspect-[746/1039] w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 700ms cubic-bezier(.2,.72,.18,1)",
        }}
      >
        <img
          src={back}
          alt="Card back"
          className="absolute inset-0 h-full w-full rounded-[24px] object-cover shadow-[0_35px_90px_rgba(0,0,0,.55)]"
          style={{ backfaceVisibility: "hidden" }}
        />
        <div
          className="absolute inset-0 overflow-hidden rounded-[24px] bg-[#111821] shadow-[0_35px_90px_rgba(0,0,0,.55)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {front ? (
            <img src={front} alt={card.title} className="h-full w-full object-cover" />
          ) : (
            <CardImage card={card} className="h-full w-full" />
          )}
        </div>
      </div>
    </div>
  );
}

function RevealModal({
  card,
  back,
  onClose,
  canClose,
  footer,
}: {
  card: FableCard;
  back: string;
  onClose: () => void;
  canClose: boolean;
  footer?: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-[#05070b]/88 p-4 py-8 backdrop-blur-xl"
      onMouseDown={() => canClose && onClose()}
    >
      <section
        className="relative grid w-full max-w-[1080px] gap-6 md:grid-cols-[minmax(260px,430px)_1fr]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute -right-1 -top-12 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-xl text-white"
          >
            ×
          </button>
        )}
        <FlipCard card={card} back={back} />
        <div className="flex min-w-0 flex-col justify-center rounded-[28px] border border-white/10 bg-[#111821]/95 p-6 shadow-2xl md:p-8">
          <div className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">
            {card.card_type}{card.difficulty ? ` · ${card.difficulty}` : ""}
          </div>
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

function StatPill({ icon, label, value, max }: { icon: string; label: string; value: number; max?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-[.12em] text-white/35">{icon} {label}</div>
      <div className="mt-1 text-lg font-black text-[#fff4d8]">{value}{typeof max === "number" ? <span className="text-xs text-white/30">/{max}</span> : null}</div>
    </div>
  );
}

export default function FableFurySoloRun() {
  const [phase, setPhase] = useState<GamePhase>("hero");
  const [heroId, setHeroId] = useState(FABLE_HEROES[0].id);
  const [startingToken, setStartingToken] = useState<TokenKind | null>(null);
  const hero = useMemo(() => getHero(heroId), [heroId]);

  const [health, setHealth] = useState(hero.startingHealth);
  const [armor, setArmor] = useState(hero.startingArmor);
  const [attackDice, setAttackDice] = useState(hero.startingAttackDice);
  const [coins, setCoins] = useState(0);
  const [tokens, setTokens] = useState<TokenCounts>({ ...EMPTY_TOKENS });
  const [backpack, setBackpack] = useState<Array<FableCard | null>>([null, null, null]);
  const [lootInbox, setLootInbox] = useState<FableCard[]>([]);

  const [run, setRun] = useState<RunSetup | null>(null);
  const [realm, setRealm] = useState(1);
  const [revealed, setRevealed] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [] });
  const [cardsByCell, setCardsByCell] = useState<Record<string, FableCard>>({});
  const [scoutedByCell, setScoutedByCell] = useState<Record<string, FableCard>>({});
  const [scoutRemaining, setScoutRemaining] = useState(0);
  const [selectedCard, setSelectedCard] = useState<FableCard | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [lootRemaining, setLootRemaining] = useState(60);
  const [skillRemaining, setSkillRemaining] = useState<Record<string, number>>({ red: 18, blue: 18, green: 18, yellow: 18 });
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [resolvedEventKeys, setResolvedEventKeys] = useState<string[]>([]);
  const [eventHistory, setEventHistory] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const map = run?.maps[realm - 1] ?? null;
  const mapImage = mapArt(map?.id);
  const realmRevealed = revealed[realm] ?? [];
  const remainingLocations = 14 - realmRevealed.length;
  const inventoryLocked = lootInbox.length > 0;
  const encounterLocked = eventState?.status === "pending" || eventState?.status === "resolving";

  function eventContext() {
    return {
      health,
      armor,
      attackDice,
      coins,
      lootCount: backpack.filter(Boolean).length,
      lootNames: backpack.flatMap((card) => card ? [card.title] : []),
    };
  }

  function resetAdventure() {
    setPhase("hero");
    setRun(null);
    setStartingToken(null);
    setHealth(hero.startingHealth);
    setArmor(hero.startingArmor);
    setAttackDice(hero.startingAttackDice);
    setCoins(0);
    setTokens({ ...EMPTY_TOKENS });
    setBackpack([null, null, null]);
    setLootInbox([]);
    setRealm(1);
    setRevealed({ 1: [], 2: [], 3: [] });
    setCardsByCell({});
    setScoutedByCell({});
    setScoutRemaining(0);
    setSelectedCard(null);
    setSelectedCell(null);
    setShowReveal(false);
    setEventState(null);
    setResolvedEventKeys([]);
    setEventHistory({});
    setError(null);
  }

  async function drawLootCards(runId: string, count: number) {
    const cards: FableCard[] = [];
    let remaining = lootRemaining;
    for (let index = 0; index < count; index += 1) {
      const result = await postJson<{ card: FableCard | null; remaining: number }>("/api/fablefury/draw", {
        runId,
        deckKey: "loot",
      });
      if (result.card) cards.push(result.card);
      remaining = result.remaining;
    }
    setLootRemaining(remaining);
    if (cards.length) setLootInbox((current) => [...current, ...cards]);
    return cards;
  }

  async function lockHeroAndDeal() {
    if (!startingToken) return;
    setLoading("setup");
    setError(null);
    try {
      const setup = await postJson<RunSetup>("/api/fablefury/run", { heroIds: [hero.id] });
      setRun(setup);
      setRealm(1);
      setRevealed({ 1: [], 2: [], 3: [] });
      setCardsByCell({});
      setScoutedByCell({});
      setResolvedEventKeys([]);
      setEventHistory({});
      setHealth(hero.startingHealth);
      setArmor(hero.startingArmor);
      setAttackDice(hero.startingAttackDice);
      setCoins(2);
      setTokens({ ...EMPTY_TOKENS, [startingToken]: 1 });
      setBackpack([null, null, null]);
      setLootInbox([]);
      setLootRemaining(setup.deck_counts.loot ?? 60);
      setSkillRemaining({
        red: setup.deck_counts["skills-red"] ?? 18,
        blue: setup.deck_counts["skills-blue"] ?? 18,
        green: setup.deck_counts["skills-green"] ?? 18,
        yellow: setup.deck_counts["skills-yellow"] ?? 18,
      });

      const result = await postJson<{ card: FableCard | null; remaining: number }>("/api/fablefury/draw", {
        runId: setup.run_id,
        deckKey: "loot",
      });
      if (result.card) setLootInbox([result.card]);
      setLootRemaining(result.remaining);
      setPhase("gear");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the solo run.");
    } finally {
      setLoading(null);
    }
  }

  function packLoot(inboxIndex: number, slot: number) {
    const card = lootInbox[inboxIndex];
    if (!card) return;
    setBackpack((current) => current.map((item, index) => index === slot ? card : item));
    setLootInbox((current) => current.filter((_, index) => index !== inboxIndex));
  }

  function discardInboxLoot(inboxIndex: number) {
    setLootInbox((current) => current.filter((_, index) => index !== inboxIndex));
  }

  async function applyEffects(effects: EventEffect[], sourceKey: string) {
    let nextHealth = health;
    let nextArmor = armor;
    let nextAttackDice = attackDice;
    let nextCoins = coins;
    let nextTokens = { ...tokens };
    let nextBackpack = [...backpack];
    const messages: string[] = [];

    for (const effect of effects) {
      if (effect.type === "health") {
        const before = nextHealth;
        nextHealth = clamp(nextHealth + effect.amount, 0, hero.maxHealth);
        const delta = nextHealth - before;
        messages.push(delta === 0 ? "Health did not change (already at its limit)." : `Health ${delta > 0 ? "+" : ""}${delta} → ${nextHealth}/${hero.maxHealth}`);
      } else if (effect.type === "armor") {
        const before = nextArmor;
        nextArmor = clamp(nextArmor + effect.amount, 0, hero.maxArmor);
        const delta = nextArmor - before;
        messages.push(delta === 0 ? "Armor did not change (already at its limit)." : `Armor ${delta > 0 ? "+" : ""}${delta} → ${nextArmor}/${hero.maxArmor}`);
      } else if (effect.type === "attackDice") {
        const before = nextAttackDice;
        nextAttackDice = clamp(nextAttackDice + effect.amount, 0, hero.maxAttackDice);
        const delta = nextAttackDice - before;
        messages.push(delta === 0 ? "Attack Dice did not change (already at capacity)." : `Attack Dice ${delta > 0 ? "+" : ""}${delta} → ${nextAttackDice}/${hero.maxAttackDice}`);
      } else if (effect.type === "coins") {
        const before = nextCoins;
        nextCoins = Math.max(0, nextCoins + effect.amount);
        const delta = nextCoins - before;
        messages.push(`Coins ${delta > 0 ? "+" : ""}${delta} → ${nextCoins}`);
      } else if (effect.type === "token") {
        nextTokens = { ...nextTokens, [effect.token]: Math.max(0, nextTokens[effect.token] + effect.amount) };
        messages.push(`${TOKEN_LABELS[effect.token]} ${effect.amount > 0 ? "+" : ""}${effect.amount} → ${nextTokens[effect.token]}`);
      } else if (effect.type === "discardLoot") {
        for (let index = 0; index < effect.count; index += 1) {
          const slot = nextBackpack.findIndex(Boolean);
          if (slot >= 0) {
            const discarded = nextBackpack[slot];
            nextBackpack[slot] = null;
            messages.push(`Discarded ${discarded?.title ?? "1 Loot"}.`);
          } else {
            messages.push("No Loot was available to discard.");
          }
        }
      } else if (effect.type === "drawLoot") {
        if (run) {
          const drawn = await drawLootCards(run.run_id, effect.count);
          if (drawn.length) {
            messages.push(`Drew ${drawn.map((card) => card.title).join(", ")}${effect.immediate ? " — immediate-use Loot" : ""}.`);
          }
        }
      } else if (effect.type === "scout") {
        setScoutRemaining((current) => current + effect.count);
        messages.push(`Reveal ${effect.count} unexplored Location${effect.count === 1 ? "" : "s"} without travelling there.`);
      } else if (effect.type === "resetRealm") {
        if (run) {
          const [, cell = selectedCell ?? map?.start_cell ?? ""] = sourceKey.split(":");
          const result = await postJson<{ revealed: string[] }>("/api/fablefury/reset-realm", {
            runId: run.run_id,
            realm,
            currentCell: cell,
          });
          setRevealed((current) => ({ ...current, [realm]: result.revealed }));
          setScoutedByCell((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${realm}:`))));
          setResolvedEventKeys((current) => current.filter((key) => !key.startsWith(`${realm}:`) || key === sourceKey));
          messages.push("The Realm was scrambled back to Unexplored. This Event and any Shrine you had already found stay revealed.");
        }
      } else if (effect.type === "note") {
        messages.push(effect.text);
      }
    }

    setHealth(nextHealth);
    setArmor(nextArmor);
    setAttackDice(nextAttackDice);
    setCoins(nextCoins);
    setTokens(nextTokens);
    setBackpack(nextBackpack);
    return messages;
  }

  function markEventResolved(key: string, messages: string[], roll?: number, pick?: number) {
    setResolvedEventKeys((current) => current.includes(key) ? current : [...current, key]);
    setEventHistory((current) => ({ ...current, [key]: messages }));
    setEventState((current) => current ? { ...current, status: "resolved", messages, roll, pick } : current);
  }

  async function prepareEvent(card: FableCard, key: string) {
    const plan = getEventPlan(card.id, eventContext());
    if (resolvedEventKeys.includes(key)) {
      setEventState({ key, plan, status: "resolved", messages: eventHistory[key] ?? ["This Event has already been resolved."] });
      return;
    }
    if (plan.kind === "auto") {
      setEventState({ key, plan, status: "resolving", messages: [] });
      const messages = await applyEffects(plan.effects, key);
      markEventResolved(key, messages);
      return;
    }
    setEventState({ key, plan, status: "pending", messages: [] });
  }

  async function resolveEventEffects(effects: EventEffect[], roll?: number, pick?: number) {
    if (!eventState) return;
    setLoading("event");
    setEventState((current) => current ? { ...current, status: "resolving" } : current);
    try {
      const messages = await applyEffects(effects, eventState.key);
      markEventResolved(eventState.key, messages, roll, pick);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resolve Event.");
      setEventState((current) => current ? { ...current, status: "pending" } : current);
    } finally {
      setLoading(null);
    }
  }

  async function rollEvent() {
    if (!eventState || eventState.status !== "pending") return;
    const plan = eventState.plan;
    if (plan.kind !== "roll") return;
    const roll = Math.floor(Math.random() * 6) + 1;
    await resolveEventEffects(plan.resolve(roll), roll);
  }

  async function rollPickedNumber() {
    if (!eventState || eventState.status !== "pending" || eventState.plan.kind !== "pickNumber" || !eventState.pick) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    await resolveEventEffects(eventState.plan.resolve(eventState.pick, roll), roll, eventState.pick);
  }

  async function payAndRollOptional() {
    if (!eventState || eventState.status !== "pending" || eventState.plan.kind !== "optionalRoll") return;
    const plan = eventState.plan;
    if (!requirementMet(plan.requires, eventContext())) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    await resolveEventEffects([...plan.cost, ...plan.resolve(roll)], roll);
  }

  async function skipOptionalRoll() {
    if (!eventState || eventState.status !== "pending" || eventState.plan.kind !== "optionalRoll") return;
    await resolveEventEffects(eventState.plan.skipEffects ?? []);
  }

  async function revealLocation(cell: string) {
    if (!run || !map || phase !== "realm") return;

    const cellKey = `${realm}:${cell}`;
    if (scoutRemaining > 0 && !realmRevealed.includes(cell)) {
      setLoading(`peek-${cellKey}`);
      setError(null);
      try {
        const result = await postJson<{ cell: string; card: FableCard }>("/api/fablefury/peek", {
          runId: run.run_id,
          realm,
          cell,
        });
        setScoutedByCell((current) => ({ ...current, [cellKey]: result.card }));
        setScoutRemaining((current) => Math.max(0, current - 1));
        setSelectedCard(result.card);
        setSelectedCell(cell);
        setEventState(null);
        setShowReveal(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reveal that Location.");
      } finally {
        setLoading(null);
      }
      return;
    }

    if (inventoryLocked || encounterLocked || scoutRemaining > 0) return;

    const existing = cardsByCell[cellKey];
    if (realmRevealed.includes(cell) && existing) {
      setSelectedCard(existing);
      setSelectedCell(cell);
      setShowReveal(true);
      if (existing.card_type === "event") await prepareEvent(existing, cellKey);
      else setEventState(null);
      return;
    }

    const allowed = realmRevealed.length === 0
      ? cell === map.start_cell
      : realmRevealed.some((seenCell) => isAdjacent(seenCell, cell));
    if (!allowed) return;

    setLoading(`cell-${cellKey}`);
    setError(null);
    try {
      const result = await postJson<RevealResult>("/api/fablefury/reveal", {
        runId: run.run_id,
        realm,
        cell,
      });
      setRevealed((current) => ({ ...current, [realm]: result.revealed }));
      setCardsByCell((current) => ({ ...current, [cellKey]: result.card }));
      setSelectedCard(result.card);
      setSelectedCell(cell);
      setShowReveal(true);
      if (result.card.card_type === "event") await prepareEvent(result.card, cellKey);
      else setEventState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reveal location.");
    } finally {
      setLoading(null);
    }
  }

  function closeReveal() {
    if (eventState && eventState.status !== "resolved") return;
    setShowReveal(false);
    setSelectedCard(null);
    setSelectedCell(null);
    setEventState(null);
  }

  function renderEventControls() {
    if (!eventState) return null;
    const plan = eventState.plan;

    if (eventState.status === "resolving") {
      return <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">Resolving Event…</div>;
    }

    if (eventState.status === "resolved") {
      return (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {typeof eventState.roll === "number" && (
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/40 bg-amber-300/10 text-2xl font-black text-amber-100">{eventState.roll}</div>
            )}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">Resolved</div>
              {eventState.pick && <div className="mt-1 text-xs text-white/45">Picked {eventState.pick}</div>}
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {eventState.messages.map((message, index) => (
              <div key={`${message}-${index}`} className="rounded-xl border border-white/[.07] bg-black/20 px-3 py-2 text-xs leading-5 text-white/65">{message}</div>
            ))}
          </div>
          <button type="button" onClick={closeReveal} className="mt-4 w-full rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-[#241707]">Continue</button>
        </div>
      );
    }

    if (plan.kind === "choice") {
      return (
        <div>
          <div className="mb-3 text-sm font-bold text-white/75">{plan.prompt}</div>
          <div className="grid gap-2">
            {plan.options.map((option) => {
              const enabled = requirementMet(option.requires, eventContext());
              return (
                <button
                  key={option.label}
                  type="button"
                  disabled={!enabled || loading === "event"}
                  onClick={() => resolveEventEffects(option.effects)}
                  className="rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3 text-left transition hover:border-amber-300/40 hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <strong className="text-sm text-[#fff4d8]">{option.label}</strong>
                  {option.description && <span className="mt-1 block text-xs leading-5 text-white/45">{option.description}</span>}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (plan.kind === "roll") {
      return (
        <div>
          <p className="text-sm font-bold leading-6 text-white/70">{plan.prompt}</p>
          <button type="button" onClick={rollEvent} disabled={loading === "event"} className="mt-4 w-full rounded-2xl bg-amber-300 px-5 py-4 text-sm font-black text-[#241707] shadow-lg shadow-amber-500/10">🎲 Roll Core Die</button>
        </div>
      );
    }

    if (plan.kind === "pickNumber") {
      return (
        <div>
          <p className="text-sm font-bold leading-6 text-white/70">{plan.prompt}</p>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setEventState((current) => current ? { ...current, pick: value } : current)}
                className={`aspect-square rounded-xl border text-sm font-black ${eventState.pick === value ? "border-amber-300 bg-amber-300 text-[#241707]" : "border-white/10 bg-white/5 text-white/70"}`}
              >
                {value}
              </button>
            ))}
          </div>
          <button type="button" onClick={rollPickedNumber} disabled={!eventState.pick || loading === "event"} className="mt-3 w-full rounded-2xl bg-amber-300 px-5 py-4 text-sm font-black text-[#241707] disabled:opacity-35">🎲 Roll Core Die</button>
        </div>
      );
    }

    if (plan.kind === "optionalRoll") {
      const canPay = requirementMet(plan.requires, eventContext());
      return (
        <div>
          <p className="text-sm font-bold leading-6 text-white/70">{plan.prompt}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" disabled={!canPay || loading === "event"} onClick={payAndRollOptional} className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-[#241707] disabled:opacity-35">🎲 {plan.payLabel}</button>
            <button type="button" disabled={loading === "event"} onClick={skipOptionalRoll} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70">{plan.skipLabel}</button>
          </div>
        </div>
      );
    }

    return null;
  }

  const selectedBack = selectedCard?.card_type === "loot" ? FABLE_CARD_BACKS.loot : FABLE_CARD_BACKS.location;

  return (
    <main className="min-h-screen bg-[#0b1017] px-4 py-6 text-[#f8f0dc] md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1540px]">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">Fable Fury · Solo Adventure Prototype</div>
            <h1 className="mt-1 text-4xl font-black tracking-[-.05em] md:text-6xl">{phase === "hero" ? "Choose Your Hero" : phase === "gear" ? "Pack Your Bag" : `Realm ${realm}`}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
              {phase === "hero" ? "Lock in one Hero, choose your starting Token, then the game deals your 2 Coins and first Loot card." : phase === "gear" ? "Your Hero is locked. Pack the starting Loot card, then enter the first Realm." : "Explore the real map, flip the real cards, and resolve Events directly against your Hero state."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/fablefury/deckbuilder" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/65">Hero Lab</a>
            {phase !== "hero" && <button type="button" onClick={resetAdventure} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/65">New Adventure</button>}
          </div>
        </header>

        {error && <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}

        {phase === "hero" && (
          <section className="mt-7">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {FABLE_HEROES.map((candidate) => {
                const active = candidate.id === heroId;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => setHeroId(candidate.id)}
                    className={`overflow-hidden rounded-[26px] border text-left transition ${active ? "border-amber-300/70 bg-amber-300/10 shadow-[0_0_45px_rgba(252,211,77,.12)]" : "border-white/10 bg-white/[.035] hover:border-white/20"}`}
                  >
                    <div className="aspect-[1.52/1] overflow-hidden bg-black/20">
                      <img src={candidate.mat} alt={`${candidate.name} hero mat`} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="text-[9px] font-black uppercase tracking-[.15em] text-amber-300">{candidate.role} · {candidate.race}</div>
                      <div className="mt-1 text-xl font-black">{candidate.name}</div>
                      <div className="mt-3 flex gap-2 text-[10px] font-bold text-white/55">
                        <span>❤️ {candidate.startingHealth}</span><span>🛡️ {candidate.startingArmor}</span><span>🎲 {candidate.startingAttackDice}</span>
                      </div>
                      <div className="mt-3 rounded-xl border border-white/[.07] bg-black/15 p-3 text-xs leading-5 text-white/50"><strong className="text-white/75">{candidate.coreSkill.name}</strong><br />{candidate.coreSkill.text}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[.035] p-5 md:p-6">
              <div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Starting Token · choose 1</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(["healing", "lucky", "crystal"] as TokenKind[]).map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setStartingToken(token)}
                    className={`rounded-2xl border p-4 text-left transition ${startingToken === token ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                  >
                    <div className="text-2xl">{token === "healing" ? "🧪" : token === "lucky" ? "🍀" : "🔮"}</div>
                    <strong className="mt-2 block text-sm">{TOKEN_LABELS[token]}</strong>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[.07] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs leading-5 text-white/50">Setup will give <strong className="text-white/80">{hero.name}</strong> your chosen Token, <strong className="text-white/80">2 Coins</strong>, and <strong className="text-white/80">1 random Loot</strong> from the persistent shuffled deck.</div>
                <button type="button" onClick={lockHeroAndDeal} disabled={!startingToken || loading === "setup"} className="shrink-0 rounded-2xl bg-amber-300 px-6 py-4 text-sm font-black text-[#241707] disabled:opacity-35">{loading === "setup" ? "Building Run…" : "Lock Hero & Deal Gear →"}</button>
              </div>
            </div>
          </section>
        )}

        {phase === "gear" && run && (
          <section className="mt-7 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[.035] p-5">
              <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20"><img src={hero.mat} alt={`${hero.name} hero mat`} className="w-full" /></div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatPill icon="❤️" label="Health" value={health} max={hero.maxHealth} />
                <StatPill icon="🛡️" label="Armor" value={armor} max={hero.maxArmor} />
                <StatPill icon="🎲" label="Attack Dice" value={attackDice} max={hero.maxAttackDice} />
                <StatPill icon="🪙" label="Coins" value={coins} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <StatPill icon="🧪" label="Potion" value={tokens.healing} />
                <StatPill icon="🍀" label="Lucky" value={tokens.lucky} />
                <StatPill icon="🔮" label="Crystal" value={tokens.crystal} />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[.035] p-5 md:p-6">
              <div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Starting Loot Draw</div>
              {lootInbox[0] ? (
                <div className="mt-4 grid gap-5 sm:grid-cols-[210px_1fr]">
                  <CardImage card={lootInbox[0]} className="w-full rounded-2xl shadow-2xl" />
                  <div>
                    <h2 className="text-2xl font-black">{lootInbox[0].title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">{lootInbox[0].rules_text}</p>
                    <div className="mt-5 text-[10px] font-black uppercase tracking-[.14em] text-white/35">Place it in your Backpack</div>
                    <div className="mt-2 grid gap-2">
                      {backpack.map((slotCard, slot) => (
                        <button key={slot} type="button" onClick={() => packLoot(0, slot)} className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-left text-xs font-black text-amber-100">Slot {slot + 1}<span className="ml-2 font-medium text-white/40">{slotCard?.title ?? "Empty"}</span></button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5 text-sm text-emerald-100">Starting gear packed. You are ready.</div>
              )}
              <button type="button" disabled={lootInbox.length > 0} onClick={() => setPhase("realm")} className="mt-6 w-full rounded-2xl bg-amber-300 px-6 py-4 text-sm font-black text-[#241707] disabled:opacity-30">Enter Realm 1 →</button>
            </div>
          </section>
        )}

        {phase === "realm" && run && map && (
          <>
            <section className="mt-5 grid gap-4 xl:grid-cols-[.78fr_1.45fr_.77fr]">
              <aside className="grid content-start gap-4">
                <div className="rounded-[24px] border border-white/10 bg-white/[.035] p-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"><img src={hero.mat} alt={`${hero.name} hero mat`} className="w-full" /></div>
                  <div className="mt-3 flex items-end justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[.14em] text-amber-300">Your Hero</div><div className="text-lg font-black">{hero.name}</div></div><div className="text-[10px] text-white/35">{hero.role}</div></div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <StatPill icon="❤️" label="Health" value={health} max={hero.maxHealth} />
                    <StatPill icon="🛡️" label="Armor" value={armor} max={hero.maxArmor} />
                    <StatPill icon="🎲" label="Attack Dice" value={attackDice} max={hero.maxAttackDice} />
                    <StatPill icon="🪙" label="Coins" value={coins} />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <StatPill icon="🧪" label="Potion" value={tokens.healing} />
                    <StatPill icon="🍀" label="Lucky" value={tokens.lucky} />
                    <StatPill icon="🔮" label="Crystal" value={tokens.crystal} />
                  </div>
                  <div className="mt-3 rounded-xl border border-white/[.07] bg-black/20 p-3 text-[11px] leading-5 text-white/45"><strong className="text-white/70">{hero.coreSkill.name}:</strong> {hero.coreSkill.text}</div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[.035] p-4">
                  <div className="text-[9px] font-black uppercase tracking-[.14em] text-amber-300">Backpack · Loot</div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {backpack.map((card, index) => (
                      <div key={index} className="grid min-h-[120px] place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/20 p-1 text-center text-[9px] text-white/30">
                        {card ? <CardImage card={card} className="h-full w-full rounded-lg" /> : `Slot ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              <section className="rounded-[28px] border border-white/10 bg-white/[.035] p-4 md:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div><div className="text-[9px] font-black uppercase tracking-[.15em] text-white/35">Realm map</div><h2 className="mt-1 text-2xl font-black">Realm {realm}: {map.name}</h2><p className="mt-1 text-xs text-white/40">{remainingLocations} unexplored · Start {map.start_cell}</p></div>
                  <div className="flex gap-2">{[1, 2, 3].map((value) => <button key={value} type="button" onClick={() => { if (!encounterLocked && !inventoryLocked && scoutRemaining === 0) { setRealm(value); setSelectedCard(null); setShowReveal(false); setEventState(null); } }} className={`rounded-xl px-3 py-2 text-[10px] font-black ${realm === value ? "bg-amber-300 text-[#241707]" : "border border-white/10 bg-white/5 text-white/50"}`}>R{value}</button>)}</div>
                </div>

                {scoutRemaining > 0 && <div className="mt-4 rounded-2xl border border-violet-300/35 bg-violet-400/10 px-4 py-3 text-xs font-bold text-violet-100">🔮 Reveal mode: choose {scoutRemaining} unexplored Location{scoutRemaining === 1 ? "" : "s"}. These are peeks only—you do not travel there.</div>}
                {inventoryLocked && <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-xs font-bold text-amber-100">🎒 You have unassigned Loot. Pack or discard it before travelling.</div>}

                <div className="mt-5 flex justify-center overflow-hidden rounded-[24px] border border-white/10 bg-black/30 p-2 shadow-2xl">
                  <div className="relative w-full max-w-[820px]">
                    {mapImage ? <img src={mapImage} alt={`${map.name} map card`} className="block w-full rounded-[18px]" /> : <div className="aspect-square rounded-[18px] bg-[#efe0b7]" />}
                    {map.grid.active_cells.map((cell) => {
                      const key = `${realm}:${cell}`;
                      const explored = realmRevealed.includes(cell);
                      const card = cardsByCell[key];
                      const scouted = scoutedByCell[key];
                      const normallyReachable = realmRevealed.length === 0 ? cell === map.start_cell : realmRevealed.some((prior) => isAdjacent(prior, cell));
                      const clickable = scoutRemaining > 0 ? !explored : (!inventoryLocked && !encounterLocked && (explored || normallyReachable));
                      const artCard = explored ? card : scouted;
                      return (
                        <button
                          key={cell}
                          type="button"
                          onClick={() => revealLocation(cell)}
                          disabled={!clickable || loading === `cell-${key}` || loading === `peek-${key}`}
                          className={`absolute w-[11.2%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[9px] border text-left shadow-xl transition duration-200 ${explored ? "z-20 border-amber-200/60" : scouted ? "z-10 border-violet-300/60" : clickable ? "z-10 border-amber-200/55 hover:-translate-y-[55%] hover:scale-105 hover:shadow-[0_0_28px_rgba(252,211,77,.45)]" : "border-white/10 opacity-48"}`}
                          style={cardPosition(cell)}
                        >
                          <div className="relative aspect-[746/1039] bg-[#202936]">
                            {artCard ? <CardImage card={artCard} className="h-full w-full" /> : <img src={FABLE_CARD_BACKS.location} alt="Unexplored Location" className="h-full w-full object-cover" />}
                            <span className="absolute left-1 top-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[7px] font-black text-white/75">{cell}</span>
                            {cell === map.start_cell && <span className="absolute right-1 top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[6px] font-black text-[#241707]">START</span>}
                            {scouted && !explored && <span className="absolute inset-x-1 bottom-1 rounded bg-violet-500/85 py-1 text-center text-[6px] font-black uppercase tracking-[.12em] text-white">Peeked</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/[.07] bg-black/20 p-3 text-[11px] leading-5 text-white/40"><strong className="text-white/65">Realm {realm}:</strong> {REALM_RECIPES[realm]}. Cards were shuffled and secretly assigned when your run was created.</div>
              </section>

              <aside className="grid content-start gap-4">
                {lootInbox.length > 0 && (
                  <div className="rounded-[24px] border border-amber-300/30 bg-amber-300/[.07] p-4">
                    <div className="text-[9px] font-black uppercase tracking-[.14em] text-amber-300">Loot waiting · {lootInbox.length}</div>
                    <div className="mt-3 grid gap-4">
                      {lootInbox.map((card, inboxIndex) => (
                        <div key={`${card.id}-${inboxIndex}`} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="grid grid-cols-[90px_1fr] gap-3"><CardImage card={card} className="w-full rounded-lg" /><div><strong className="text-sm">{card.title}</strong><p className="mt-1 line-clamp-4 text-[10px] leading-4 text-white/45">{card.rules_text}</p></div></div>
                          <div className="mt-3 grid grid-cols-3 gap-1">{backpack.map((slotCard, slot) => <button key={slot} type="button" onClick={() => packLoot(inboxIndex, slot)} className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-2 text-[9px] font-black text-amber-100">{slotCard ? `Replace ${slot + 1}` : `Slot ${slot + 1}`}</button>)}</div>
                          <button type="button" onClick={() => discardInboxLoot(inboxIndex)} className="mt-2 w-full rounded-lg border border-white/10 px-2 py-2 text-[9px] font-bold text-white/40">Discard</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-[24px] border border-white/10 bg-white/[.035] p-4">
                  <div className="text-[9px] font-black uppercase tracking-[.14em] text-white/35">Persistent decks</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/[.07] bg-black/20 p-3"><div className="text-[9px] uppercase text-white/35">Loot</div><div className="mt-1 text-xl font-black">{lootRemaining}</div></div>
                    {Object.entries(skillRemaining).map(([color, count]) => <div key={color} className="rounded-xl border border-white/[.07] bg-black/20 p-3"><div className="text-[9px] uppercase text-white/35">{color} Skills</div><div className="mt-1 text-xl font-black">{count}</div></div>)}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[.035] p-4">
                  <div className="text-[9px] font-black uppercase tracking-[.14em] text-emerald-300">Event engine</div>
                  <p className="mt-2 text-xs leading-5 text-white/45">Events now resolve against this Hero: Health, Armor, Attack Dice, Coins, Tokens, Loot draws, Loot costs, Core Rolls, choices, solo highest/lowest rules, scouting and Sense of Direction map resets.</p>
                  <p className="mt-2 text-[10px] leading-4 text-white/30">Enemies, Traps, Shrines, Portals and individual Loot effects are intentionally the next systems.</p>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>

      {showReveal && selectedCard && (
        <RevealModal
          card={selectedCard}
          back={selectedBack}
          onClose={closeReveal}
          canClose={!eventState || eventState.status === "resolved"}
          footer={
            selectedCard.card_type === "event" && eventState ? renderEventControls() : (
              <div>
                <div className="flex flex-wrap gap-2 text-xs text-white/45">
                  <span className="rounded-full border border-white/10 px-3 py-2">Realm {realm}</span>
                  {selectedCell && <span className="rounded-full border border-white/10 px-3 py-2">Location {selectedCell}</span>}
                </div>
                {selectedCard.card_type === "enemy" && <div className="mt-4 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">Enemy combat is the next rules system. The real Enemy card and data are already locked to this Location.</div>}
                {selectedCard.card_type === "trap" && <div className="mt-4 rounded-xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs leading-5 text-orange-100">Trap rolling/resolution is next after Events.</div>}
                {selectedCard.card_type === "special" && <div className="mt-4 rounded-xl border border-violet-300/20 bg-violet-400/10 p-3 text-xs leading-5 text-violet-100">Shrine / Portal resolution will plug into this same interaction layer next.</div>}
                <button type="button" onClick={closeReveal} className="mt-4 w-full rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-[#241707]">Continue</button>
              </div>
            )
          }
        />
      )}
    </main>
  );
}
