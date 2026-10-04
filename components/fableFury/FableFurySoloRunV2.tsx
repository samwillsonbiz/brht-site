"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { FABLE_CARD_BACKS, cardFrontArt, mapArt } from "@/lib/fableFuryAssets";
import { FABLE_BACKPACK_ART, FABLE_BOARD_ART, FABLE_SHOP_ART, FABLE_STAT_ART, FABLE_TOKEN_ART } from "@/lib/fableFuryBoardAssets";
import { FABLE_HEROES, TOKEN_LABELS, getHero, type SkillColor, type TokenKind } from "@/lib/fableFuryHeroes";
import { getEventPlan, requirementMet, type EventEffect, type EventPlan } from "@/lib/fableFuryEventEngine";
import { getLootPlan, type LootEffect } from "@/lib/fableFuryLootEngine";
import { getTrapSummary } from "@/lib/fableFuryTrapEngine";
import { hasDouble, hasTriples, skillBehavior, skillUsesFlip } from "@/lib/fableFurySkillEngine";
import {
  afterEnemyAction,
  armorBlocksEnemy,
  buffEffects,
  enemyData,
  enemyTurnStart,
  heroRollReaction,
  parseReward,
  setupSteps,
  targetIsDirected,
  type EnemyAttack,
  type EnemyEffect,
  type EnemySetupStep,
} from "@/lib/fableFuryEnemyEngine";
import {
  allAttackEndedTriggers,
  clearTriggers,
  hasSkill,
  heroAttackRollTriggers,
  targetedAttackTriggers,
  type TriggerEffect,
} from "@/lib/fableFuryTriggerEngine";

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

type MapInfo = { id: string; name: string; start_cell: string; grid: { rows: number; columns: string[]; active_cells: string[] } };
type RunSetup = { run_id: string; realm: number; maps: MapInfo[]; deck_counts: Record<string, number> };
type RevealResult = { cell: string; already_revealed: boolean; card: FableCard; map: MapInfo; revealed: string[] };
type GamePhase = "hero" | "gear" | "realm";
type EventStatus = "pending" | "resolving" | "resolved";
type RollMode = "roll" | "pickNumber" | "optionalRoll";
type EventState = { key: string; card: FableCard; plan: EventPlan; status: EventStatus; messages: string[]; roll?: number; rollMode?: RollMode; pick?: number };
type TokenCounts = Record<TokenKind, number>;
type SkillDraft = { mode: "shrine" | "replace"; color: SkillColor | "any"; choices: FableCard[]; slot?: number; sourceKey?: string; title: string; stage: "slot" | "color" | "choices" };
type CombatMods = { attackDiceBonus: number; attackRollBonus: number; rerollAttack: boolean; forceAttackDiceHit: boolean; targeting: "anyHero" | "self" | null; enemyDamageDelta: number; enemyAgilityDelta: number; rewardBonus: number };
type TrapMods = { requirementDelta: number; requirementOverride: number | null; damageDelta: number };
type SkillUse = { slot: number; card: FableCard };
type SkillRollState = { slot: number; card: FableCard; requirement: number; effect: "enemyAgilityDown" | "damageDown" | "attentionSeeker"; roll?: number };
type DieTarget = { source: "event" | "enemySetup" | "enemyTarget" | "enemyAttack" | "reaction" | "skillRoll"; index?: number; value: number; label: string };
type EnemyChoice = { prompt: string; options: Array<{ label: string; effects: EnemyEffect[]; disabled?: boolean }> };
type EnemyCombatState = {
  key: string;
  card: FableCard;
  maxHealth: number;
  health: number;
  damage: number;
  agility: number;
  actionIndex: number;
  phase: "setup" | "hero" | "enemyStart" | "enemy" | "victory" | "defeat";
  setup: EnemySetupStep[];
  setupIndex: number;
  setupRoll?: number;
  dice?: number[];
  targetRoll?: number;
  targetPending?: boolean;
  disabledSkillColors: SkillColor[];
  noReward: boolean;
  messages: string[];
  choice?: EnemyChoice;
};

type LootUse = { slot: number; card: FableCard };

const EMPTY_TOKENS: TokenCounts = { healing: 0, lucky: 0, crystal: 0 };
const EMPTY_COMBAT_MODS: CombatMods = { attackDiceBonus: 0, attackRollBonus: 0, rerollAttack: false, forceAttackDiceHit: false, targeting: null, enemyDamageDelta: 0, enemyAgilityDelta: 0, rewardBonus: 0 };
const EMPTY_TRAP_MODS: TrapMods = { requirementDelta: 0, requirementOverride: null, damageDelta: 0 };
const PARTY_COUNT = 1;

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function totalCoins(slots: number[]) { return slots.reduce((sum, value) => sum + value, 0); }
function rollD6() { return Math.floor(Math.random() * 6) + 1; }
function isAdjacent(a: string, b: string) { const ax = a.charCodeAt(0) - 65; const ay = Number(a.slice(1)); const bx = b.charCodeAt(0) - 65; const by = Number(b.slice(1)); return Math.abs(ax - bx) + Math.abs(ay - by) === 1; }
function boardCellPosition(cell: string) { const columnIndex = cell.charCodeAt(0) - 65; const rowIndex = Number(cell.slice(1)) - 1; return { left: `${16.45 + columnIndex * 12.86}%`, top: `${19.45 + rowIndex * 16.12}%` }; }
function typeLabel(card: FableCard) { return card.card_type === "trap" || card.id.startsWith("trap-") ? "TRAP" : card.card_type.toUpperCase(); }
function skillColor(card: FableCard | null) { return (card?.subtype ?? "").toLowerCase() as SkillColor; }
function diceCounts(dice: number[]) { const map = new Map<number, number>(); dice.forEach((die) => map.set(die, (map.get(die) ?? 0) + 1)); return map; }

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

function adjustCoinSlots(current: number[], loot: Array<FableCard | null>, delta: number) {
  const next = [...current]; let remaining = Math.abs(delta);
  if (delta >= 0) {
    for (let i = 0; i < next.length && remaining > 0; i += 1) { if (next[i] <= 0) continue; const add = Math.min(6 - next[i], remaining); next[i] += add; remaining -= add; }
    for (let i = 0; i < next.length && remaining > 0; i += 1) { if (next[i] > 0 || loot[i]) continue; const add = Math.min(6, remaining); next[i] = add; remaining -= add; }
    return { slots: next, applied: delta - remaining, overflow: remaining };
  }
  for (let i = next.length - 1; i >= 0 && remaining > 0; i -= 1) { if (next[i] <= 0) continue; const remove = Math.min(next[i], remaining); next[i] -= remove; remaining -= remove; }
  return { slots: next, applied: -(Math.abs(delta) - remaining), overflow: 0 };
}

function CardImage({ card, className = "" }: { card: FableCard; className?: string }) {
  const src = cardFrontArt(card);
  if (src) return <img src={src} alt={card.title} className={`block object-contain ${className}`} />;
  return <div className={`grid place-items-center rounded-2xl border border-white/10 bg-[#151b25] p-4 text-center ${className}`}><div><div className="text-[9px] font-black uppercase tracking-[.16em] text-amber-300">{typeLabel(card)}</div><div className="mt-2 text-lg font-black">{card.title}</div>{card.rules_text && <p className="mt-3 text-xs leading-5 text-white/55">{card.rules_text}</p>}</div></div>;
}

function FlipCard({ card }: { card: FableCard }) {
  const [faceUp, setFaceUp] = useState(false); const front = cardFrontArt(card);
  useEffect(() => { setFaceUp(false); const timer = window.setTimeout(() => setFaceUp(true), 100); return () => window.clearTimeout(timer); }, [card.id]);
  return <div className="mx-auto w-full max-w-[410px] [perspective:1400px]"><div className="relative aspect-[746/1039] w-full" style={{ transformStyle: "preserve-3d", transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 650ms cubic-bezier(.2,.72,.18,1)" }}><img src={FABLE_CARD_BACKS.location} alt="Location card back" className="absolute inset-0 h-full w-full rounded-[24px] object-cover shadow-2xl" style={{ backfaceVisibility: "hidden" }} /><div className="absolute inset-0 overflow-hidden rounded-[24px] bg-[#111821] shadow-2xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>{front ? <img src={front} alt={card.title} className="h-full w-full object-cover" /> : <CardImage card={card} className="h-full w-full" />}</div></div></div>;
}

function ModalShell({ children, z = "z-[250]" }: { children: ReactNode; z?: string }) { return <div className={`fixed inset-0 ${z} grid place-items-center overflow-y-auto bg-[#05070b]/92 p-4 py-8 backdrop-blur-xl`}>{children}</div>; }
function Stat({ art, label, value, max }: { art: string; label: string; value: number; max?: number }) { return <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2"><img src={art} alt="" className="h-8 w-8 object-contain" /><div><div className="text-[9px] font-black uppercase tracking-[.12em] text-white/35">{label}</div><div className="font-black text-[#fff4d8]">{value}{max != null && <span className="text-xs text-white/30">/{max}</span>}</div></div></div>; }
function Die({ value, hit, onLucky, lucky, extra }: { value: number; hit?: boolean; onLucky?: () => void; lucky?: number; extra?: ReactNode }) { return <div className={`rounded-2xl border p-2 text-center ${hit ? "border-emerald-300/60 bg-emerald-300/10" : "border-white/15 bg-white/5"}`}><div className="grid h-14 w-14 place-items-center rounded-xl bg-[#fff4d8] text-3xl font-black text-[#23180c]">{value}</div>{onLucky && <button type="button" disabled={!lucky} onClick={onLucky} className="mt-2 text-[9px] font-black uppercase tracking-[.1em] text-amber-300 disabled:opacity-30">Lucky reroll</button>}{extra}</div>; }

function Backpack({ backpack, coinSlots, tokens, onUseLoot, onUseToken }: { backpack: Array<FableCard | null>; coinSlots: number[]; tokens: TokenCounts; onUseLoot: (slot: number) => void; onUseToken: (token: TokenKind) => void }) {
  const tokenSlots: Array<{ token: TokenKind; left: string }> = [{ token: "lucky", left: "17%" }, { token: "crystal", left: "50%" }, { token: "healing", left: "83%" }]; const lootLeft = ["17%", "50%", "83%"];
  return <div className="rounded-[24px] border border-white/10 bg-white/[.035] p-4"><div className="flex justify-between"><div><div className="text-[9px] font-black uppercase tracking-[.14em] text-amber-300">Backpack</div><div className="text-sm font-black">3 Token · 3 Loot/Coin spaces</div></div><div className="text-[9px] text-white/35">Click to use</div></div><div className="relative mt-3 aspect-[3/2] overflow-hidden rounded-2xl"><img src={FABLE_BACKPACK_ART} alt="Backpack" className="absolute inset-0 h-full w-full object-cover" />{tokenSlots.map(({ token, left }) => <button key={token} onClick={() => onUseToken(token)} disabled={tokens[token] <= 0} className="absolute top-[18%] z-10 w-[18%] -translate-x-1/2 transition hover:scale-110 disabled:opacity-25" style={{ left }}>{tokens[token] > 0 && <img src={FABLE_TOKEN_ART[token]} alt={TOKEN_LABELS[token]} className="w-full object-contain drop-shadow-lg" />}<span className="absolute -right-1 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-amber-300 px-1 text-[10px] font-black text-[#241707]">{tokens[token]}</span></button>)}{lootLeft.map((left, index) => <div key={left} className="absolute top-[53%] z-10 flex h-[35%] w-[20%] -translate-x-1/2 items-center justify-center" style={{ left }}>{backpack[index] ? <button onClick={() => onUseLoot(index)} className="h-full transition hover:scale-110"><CardImage card={backpack[index] as FableCard} className="h-full rounded-lg drop-shadow-lg" /></button> : coinSlots[index] > 0 ? <div className="relative"><img src={FABLE_STAT_ART.coins} alt="Coins" className="w-16" /><span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-2 py-1 text-xs font-black text-[#241707]">{coinSlots[index]}</span></div> : <span className="rounded-full bg-black/40 px-2 py-1 text-[9px] font-black uppercase text-white/40">Empty</span>}</div>)}</div></div>;
}

function SkillRack({ skills, faceUp, disabledColors = [], onUse, compact = false }: { skills: Array<FableCard | null>; faceUp: boolean[]; disabledColors?: SkillColor[]; onUse: (slot: number) => void; compact?: boolean }) {
  return <div className={`grid grid-cols-3 ${compact ? "gap-1.5" : "gap-2"}`}>{skills.map((skill, i) => {
    if (!skill) return <div key={i} className="grid aspect-[2/3] place-items-center rounded-xl border border-dashed border-white/10 text-[8px] uppercase text-white/20">Empty</div>;
    const color = skillColor(skill);
    const colorDisabled = disabledColors.includes(color) && !/can't be disabled/i.test(skill.rules_text ?? "");
    const flipped = !faceUp[i];
    const back = FABLE_CARD_BACKS[color];
    return <button key={skill.id} type="button" onClick={() => onUse(i)} className={`relative overflow-hidden rounded-xl border border-white/10 bg-black/20 p-1 text-left transition hover:border-amber-300/50 ${colorDisabled ? "opacity-30 grayscale" : ""}`}>
      {flipped && back ? <img src={back} alt={`${skill.title} flipped`} className="w-full rounded-lg object-contain" /> : <CardImage card={skill} className="w-full rounded-lg" />}
      <div className="mt-1 truncate px-1 text-center text-[8px] font-black">{skill.title}</div>
      {flipped && <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-black/75 px-2 py-1 text-[7px] font-black uppercase tracking-[.12em] text-white">Flipped</span>}
      {!flipped && colorDisabled && <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-black/75 px-2 py-1 text-[7px] font-black uppercase tracking-[.12em] text-white">Disabled</span>}
    </button>;
  })}</div>;
}

function PortalControls({ canLeave, onStay, onLeave }: { canLeave: boolean; onStay: () => void; onLeave: () => void }) {
  return <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
    {canLeave ? <>
      <div className="font-black text-cyan-100">The Realm Rune is active.</div>
      <p className="mt-1 text-sm text-white/55">You may keep exploring, or leave through the Portal now. Leaving heals 1 Health and opens the Gift Shop.</p>
      <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={onStay} className="rounded-xl border border-white/10 px-4 py-3 font-bold">Stay in Realm</button><button onClick={onLeave} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-[#231707]">Leave Realm</button></div>
    </> : <>
      <div className="font-black text-cyan-100">The Portal is dormant.</div>
      <p className="mt-1 text-sm text-white/55">Find and activate this Realm's Shrine first. Once its Rune is active, return here to leave the Realm.</p>
      <button onClick={onStay} className="mt-4 w-full rounded-xl bg-amber-300 px-4 py-3 font-black text-[#231707]">Continue Exploring</button>
    </>}
  </div>;
}

function ShopModal({ realm, coins, armor, maxArmor, armorCost, attackDice, maxAttackDice, backpack, coinSlots, lootInbox, onBuyToken, onBuyLoot, onBuyAttackDice, onBuyArmor, onSellLoot, onPackLoot, onDiscardLoot, onFinish }: { realm: number; coins: number; armor: number; maxArmor: number; armorCost: number; attackDice: number; maxAttackDice: number; backpack: Array<FableCard | null>; coinSlots: number[]; lootInbox: FableCard[]; onBuyToken: (token: TokenKind) => void; onBuyLoot: () => void; onBuyAttackDice: () => void; onBuyArmor: () => void; onSellLoot: (slot: number) => void; onPackLoot: (inboxIndex: number, slot: number) => void; onDiscardLoot: (inboxIndex: number) => void; onFinish: () => void }) {
  const itemClass = "rounded-2xl border border-white/10 bg-black/20 p-3 text-center transition hover:border-amber-300/50 disabled:opacity-30";
  return <ModalShell z="z-[425]"><section className="w-full max-w-[1080px] rounded-[30px] border border-amber-300/20 bg-[#111821] p-6 shadow-2xl">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-amber-300">Gift Shop · After Realm {realm}</div><h2 className="mt-1 text-4xl font-black text-[#fff2cf]">Spend your Coins</h2><p className="mt-2 text-sm text-white/50">Buy as much as you can afford. Loot may be sold back for 1 Coin each.</p></div><div className="flex items-center gap-2 rounded-2xl bg-amber-300/10 px-4 py-3"><img src={FABLE_STAT_ART.coins} alt="Coins" className="h-9 w-9 object-contain" /><div><div className="text-[9px] font-black uppercase text-white/35">Coins</div><div className="text-2xl font-black text-amber-200">{coins}</div></div></div></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {(["crystal","lucky","healing"] as TokenKind[]).map((token) => <button key={token} disabled={coins < 1} onClick={() => onBuyToken(token)} className={itemClass}><img src={FABLE_TOKEN_ART[token]} alt={TOKEN_LABELS[token]} className="mx-auto h-20 w-20 object-contain" /><div className="mt-2 text-sm font-black">{TOKEN_LABELS[token]}</div><div className="text-xs text-amber-300">1 Coin</div></button>)}
      <button disabled={coins < 2} onClick={onBuyLoot} className={itemClass}><img src={FABLE_CARD_BACKS.loot} alt="Loot" className="mx-auto h-24 rounded-lg object-contain" /><div className="mt-2 text-sm font-black">Random Loot</div><div className="text-xs text-amber-300">2 Coins</div></button>
      <button disabled={coins < 4 || attackDice >= maxAttackDice} onClick={onBuyAttackDice} className={itemClass}><img src={FABLE_STAT_ART.attackDice} alt="Attack Die" className="mx-auto h-20 w-20 object-contain" /><div className="mt-2 text-sm font-black">Attack Die</div><div className="text-xs text-amber-300">4 Coins · {attackDice}/{maxAttackDice}</div></button>
      <button disabled={coins < armorCost || armor >= maxArmor} onClick={onBuyArmor} className={itemClass}><img src={FABLE_STAT_ART.armor} alt="Armor" className="mx-auto h-20 w-20 object-contain" /><div className="mt-2 text-sm font-black">Armor</div><div className="text-xs text-amber-300">{armorCost} Coins · {armor}/{maxArmor}</div></button>
    </div>
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-white/35">Sell Loot · 1 Coin each</div><div className="mt-3 grid grid-cols-3 gap-3">{backpack.map((card, slot) => <div key={slot} className="rounded-xl border border-white/10 bg-black/20 p-2">{card ? <><CardImage card={card} className="mx-auto h-36 rounded-lg" /><div className="mt-2 truncate text-center text-xs font-black">{card.title}</div><button onClick={() => onSellLoot(slot)} className="mt-2 w-full rounded-lg bg-amber-300 px-2 py-2 text-xs font-black text-[#231707]">Sell +1 Coin</button></> : <div className="grid h-44 place-items-center text-xs text-white/25">No Loot</div>}</div>)}</div></div>
    {lootInbox.length > 0 && <div className="mt-5 rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/10 p-4"><div className="font-black text-fuchsia-100">Purchased Loot — store it before leaving the shop.</div>{lootInbox.map((card, index) => <div key={`${card.id}-${index}`} className="mt-3 grid gap-3 sm:grid-cols-[110px_1fr]"><CardImage card={card} className="w-full rounded-lg" /><div><div className="font-black">{card.title}</div><div className="mt-2 flex flex-wrap gap-2">{[0,1,2].map((slot) => <button key={slot} disabled={coinSlots[slot] > 0 || !!backpack[slot]} onClick={() => onPackLoot(index, slot)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold disabled:opacity-25">Pocket {slot+1}</button>)}<button onClick={() => onDiscardLoot(index)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50">Discard</button></div></div></div>)}</div>}
    <button disabled={lootInbox.length > 0} onClick={onFinish} className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-4 text-lg font-black text-[#231707] disabled:opacity-30">{realm < 3 ? `Finish Shopping · Enter Realm ${realm + 1}` : "Finish Shopping"}</button>
  </section></ModalShell>;
}

export default function FableFurySoloRunV2() {
  const [phase, setPhase] = useState<GamePhase>("hero");
  const [heroId, setHeroId] = useState(FABLE_HEROES[0].id);
  const hero = useMemo(() => getHero(heroId), [heroId]);
  const [startingToken, setStartingToken] = useState<TokenKind | null>(null);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);

  const [health, setHealth] = useState(hero.startingHealth);
  const [armor, setArmor] = useState(hero.startingArmor);
  const [attackDice, setAttackDice] = useState(hero.startingAttackDice);
  const [coinSlots, setCoinSlots] = useState([0, 0, 0]);
  const coins = totalCoins(coinSlots);
  const [tokens, setTokens] = useState<TokenCounts>({ ...EMPTY_TOKENS });
  const [backpack, setBackpack] = useState<Array<FableCard | null>>([null, null, null]);
  const [lootInbox, setLootInbox] = useState<FableCard[]>([]);
  const [lootDiscard, setLootDiscard] = useState<FableCard[]>([]);
  const [lootUse, setLootUse] = useState<LootUse | null>(null);
  const [skills, setSkills] = useState<Array<FableCard | null>>([null, null, null]);
  const [skillFaceUp, setSkillFaceUp] = useState<boolean[]>([true, true, true]);
  const [skillDraft, setSkillDraft] = useState<SkillDraft | null>(null);
  const [skillUse, setSkillUse] = useState<SkillUse | null>(null);
  const [skillPaymentSlots, setSkillPaymentSlots] = useState<number[]>([]);
  const [skillRoll, setSkillRoll] = useState<SkillRollState | null>(null);
  const [combatMods, setCombatMods] = useState<CombatMods>({ ...EMPTY_COMBAT_MODS });
  const [trapMods, setTrapMods] = useState<TrapMods>({ ...EMPTY_TRAP_MODS });
  const [lastEnemyDamagedHero, setLastEnemyDamagedHero] = useState(false);
  const [knockoutHandled, setKnockoutHandled] = useState(false);

  const [run, setRun] = useState<RunSetup | null>(null);
  const [realm, setRealm] = useState(1);
  const [revealed, setRevealed] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [] });
  const [cardsByCell, setCardsByCell] = useState<Record<string, FableCard>>({});
  const [scoutedByCell, setScoutedByCell] = useState<Record<string, FableCard>>({});
  const [scoutRemaining, setScoutRemaining] = useState(0);
  const [selectedCard, setSelectedCard] = useState<FableCard | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [resolvedKeys, setResolvedKeys] = useState<string[]>([]);
  const [eventHistory, setEventHistory] = useState<Record<string, string[]>>({});
  const [specialHistory, setSpecialHistory] = useState<Record<string, string[]>>({});
  const [shrineStarted, setShrineStarted] = useState<string[]>([]);
  const [realmThreeShrineId, setRealmThreeShrineId] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [enemy, setEnemy] = useState<EnemyCombatState | null>(null);
  const [gameWon, setGameWon] = useState<FableCard | null>(null);
  const [reactionRoll, setReactionRoll] = useState<{ label: string; requirement: number; roll?: number; onPass: "armor" | "attackDice" } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const map = run?.maps[realm - 1] ?? null;
  const mapImage = mapArt(map?.id);
  const realmRevealed = revealed[realm] ?? [];
  const activeEnemyColors = enemy?.disabledSkillColors ?? [];
  const activeTrapSummary = eventState?.card.id.startsWith("trap-") && eventState.status !== "resolved"
    ? getTrapSummary(eventState.card.id, { race: hero.race, health, armor, attackDice, coins, lootCount: backpack.filter(Boolean).length, lootNames: backpack.flatMap((card) => card ? [card.title] : []), trapRequirementDelta: trapMods.requirementDelta, trapRequirementOverride: trapMods.requirementOverride, trapDamageDelta: trapMods.damageDelta })
    : null;
  const disabledSkillColors = [...new Set<SkillColor>([...activeEnemyColors, ...(activeTrapSummary?.disabledSkillColor ? [activeTrapSummary.disabledSkillColor] : [])])];
  const triggerSkills = skills.map((skill, index) => skillFaceUp[index] ? skill : null);
  const triggerCtx = { heroId: hero.id, skills: triggerSkills, disabledSkillColors };
  const skillActive = (card: FableCard | null) => {
    if (!card) return false;
    const index = skills.findIndex((candidate) => candidate?.id === card.id);
    if (index >= 0 && !skillFaceUp[index]) return false;
    return !disabledSkillColors.includes(skillColor(card)) || /can't be disabled/i.test(card.rules_text ?? "");
  };
  const effectiveMaxArmor = hero.maxArmor + (skills.some((s) => s?.id === "skill-unusual-hat" && skillActive(s)) ? 1 : 0);
  const effectiveMaxDice = hero.maxAttackDice + (skills.some((s) => s?.id === "skill-gym-candy" && skillActive(s)) ? 2 : 0);
  const inventoryLocked = lootInbox.length > 0;
  const portalCanLeave = resolvedKeys.some((key) => key.startsWith(`${realm}:`) && cardsByCell[key]?.subtype === "shrine");
  const shopArmorCost = hasSkill(triggerCtx, "skill-designer-parry") ? 4 : 6;

  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 2600); return () => window.clearTimeout(t); }, [toast]);
  useEffect(() => {
    if (health > 0) { if (knockoutHandled) setKnockoutHandled(false); return; }
    if (knockoutHandled) return;
    setKnockoutHandled(true);
    if (hasSkill(triggerCtx, "skill-mortician-magician")) setCoinSlots((slots) => adjustCoinSlots(slots, backpack, 1).slots);
    if (hasSkill(triggerCtx, "skill-pure-intentions")) void drawLootCards(1);
    setSkillFaceUp([false, false, false]);
  }, [health, knockoutHandled]);
  function notify(message: string) { setToast(message); }

  function currentContext() { return { health, armor, attackDice, coins, lootCount: backpack.filter(Boolean).length, lootNames: backpack.flatMap((card) => card ? [card.title] : []), trapRequirementDelta: trapMods.requirementDelta, trapRequirementOverride: trapMods.requirementOverride, trapDamageDelta: trapMods.damageDelta }; }
  function enemyContext() { return { race: hero.race, health, armor, attackDice, coins, lootNames: backpack.flatMap((card) => card ? [card.title] : []) }; }

  async function drawLootCards(count: number) {
    if (!run) return [] as FableCard[];
    const cards: FableCard[] = [];
    for (let i = 0; i < count; i += 1) {
      const result = await postJson<{ card: FableCard | null; remaining: number }>("/api/fablefury/draw", { runId: run.run_id, deckKey: "loot" });
      if (result.card) cards.push(result.card);
    }
    if (cards.length) setLootInbox((current) => [...current, ...cards]);
    return cards;
  }

  async function drawSkills(color: SkillColor, count = 3) {
    if (!run) return [] as FableCard[];
    const cards: FableCard[] = [];
    for (let i = 0; i < count; i += 1) {
      const result = await postJson<{ card: FableCard | null; remaining: number }>("/api/fablefury/draw", { runId: run.run_id, deckKey: `skills-${color}` });
      if (result.card) cards.push(result.card);
    }
    return cards;
  }

  async function lockHeroAndDeal() {
    if (!startingToken || !targetNumber) return;
    setLoading("setup"); setError(null);
    try {
      const setup = await postJson<RunSetup>("/api/fablefury/run", { heroIds: [hero.id] });
      setRun(setup); setHealth(hero.startingHealth); setArmor(hero.startingArmor); setAttackDice(hero.startingAttackDice); setCoinSlots([2, 0, 0]); setTokens({ ...EMPTY_TOKENS, [startingToken]: 1 }); setBackpack([null, null, null]); setSkills([null, null, null]); setSkillFaceUp([true, true, true]); setSkillUse(null); setSkillRoll(null); setTrapMods({ ...EMPTY_TRAP_MODS }); setLastEnemyDamagedHero(false); setKnockoutHandled(false); setRevealed({ 1: [], 2: [], 3: [] }); setCardsByCell({}); setScoutedByCell({}); setResolvedKeys([]); setCombatMods({ ...EMPTY_COMBAT_MODS }); setLootDiscard([]); setRealmThreeShrineId(null); setGameWon(null); setEnemy(null);
      const result = await postJson<{ card: FableCard | null }>("/api/fablefury/draw", { runId: setup.run_id, deckKey: "loot" });
      setLootInbox(result.card ? [result.card] : []); setPhase("gear");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not start run."); }
    finally { setLoading(null); }
  }

  function packLoot(inboxIndex: number, slot: number) { const card = lootInbox[inboxIndex]; if (!card || coinSlots[slot] > 0 || backpack[slot]) return; setBackpack((current) => current.map((v, i) => i === slot ? card : v)); setLootInbox((current) => current.filter((_, i) => i !== inboxIndex)); }
  function discardInbox(inboxIndex: number) { setLootDiscard((current) => [...current, lootInbox[inboxIndex]].filter(Boolean)); setLootInbox((current) => current.filter((_, i) => i !== inboxIndex)); }


  function refreshSkills() { setSkillFaceUp([true, true, true]); }
  function flipSkill(slot: number) { setSkillFaceUp((current) => current.map((value, index) => index === slot ? false : value)); }
  function openSkill(slot: number) {
    const card = skills[slot];
    if (!card) return;
    setSkillPaymentSlots([]);
    setSkillUse({ slot, card });
  }

  function payCoins(amount: number) {
    if (coins < amount) return false;
    setCoinSlots((slots) => adjustCoinSlots(slots, backpack, -amount).slots);
    return true;
  }

  function payLootSlots(slots: number[], count: number) {
    const unique = [...new Set(slots)].filter((slot) => !!backpack[slot]);
    if (unique.length < count) return false;
    const chosen = unique.slice(0, count);
    const cards = chosen.map((slot) => backpack[slot]).filter((card): card is FableCard => !!card);
    setBackpack((items) => items.map((card, index) => chosen.includes(index) ? null : card));
    setLootDiscard((discard) => [...discard, ...cards]);
    return true;
  }

  function dealSkillDamage(amount: number, label: string) {
    setEnemy((current) => {
      if (!current) return current;
      const nextHealth = Math.max(0, current.health - amount);
      return { ...current, health: nextHealth, phase: nextHealth <= 0 ? "victory" : current.phase, messages: [...current.messages, `${label}: ${amount} damage.`] };
    });
  }

  function currentDieTargets(): DieTarget[] {
    if (skillRoll?.roll != null) return [{ source: "skillRoll", value: skillRoll.roll, label: `${skillRoll.card.title} Core Die` }];
    if (reactionRoll?.roll != null) return [{ source: "reaction", value: reactionRoll.roll, label: "Core Die" }];
    if (eventState?.roll != null && eventState.status === "pending") return [{ source: "event", value: eventState.roll, label: eventState.card.id.startsWith("trap-") ? "Trap Core Die" : "Event Core Die" }];
    if (enemy?.setupRoll != null && enemy.phase === "setup") return [{ source: "enemySetup", value: enemy.setupRoll, label: "Setup Core Die" }];
    if (enemy?.targetPending && enemy.targetRoll != null) return [{ source: "enemyTarget", value: enemy.targetRoll, label: "Target Die" }];
    if (enemy?.dice?.length && enemy.phase === "hero") return enemy.dice.map((value, index) => ({ source: "enemyAttack" as const, index, value, label: index === 0 ? "Core Die" : `Attack Die ${index}` }));
    return [];
  }

  function updateDieTarget(target: DieTarget, transform: (value: number) => number) {
    if (target.source === "event") setEventState((state) => state?.roll != null ? { ...state, roll: clamp(transform(state.roll), 1, 6) } : state);
    else if (target.source === "enemySetup") setEnemy((state) => state?.setupRoll != null ? { ...state, setupRoll: clamp(transform(state.setupRoll), 1, 6) } : state);
    else if (target.source === "enemyTarget") setEnemy((state) => state?.targetRoll != null ? { ...state, targetRoll: clamp(transform(state.targetRoll), 1, 6) } : state);
    else if (target.source === "enemyAttack") setEnemy((state) => state?.dice ? { ...state, dice: state.dice.map((die, index) => index === target.index ? clamp(transform(die), 1, 6) : die) } : state);
    else if (target.source === "reaction") setReactionRoll((state) => state?.roll != null ? { ...state, roll: clamp(transform(state.roll), 1, 6) } : state);
    else if (target.source === "skillRoll") setSkillRoll((state) => state?.roll != null ? { ...state, roll: clamp(transform(state.roll), 1, 6) } : state);
  }

  function skillLootCost(cardId: string) {
    if (["skill-bougie-bludgeoner", "skill-ice-block", "skill-pain-aversion", "skill-second-aid"].includes(cardId)) return 1;
    if (cardId === "skill-thorny-wood") return 2;
    return 0;
  }

  function currentEnemyMove() {
    if (!enemy) return null;
    return enemyData(enemy.card).attacks[enemy.actionIndex] ?? null;
  }

  function targetWillHitHero() {
    if (!enemy?.targetPending || enemy.targetRoll == null) return false;
    return targetIsDirected(enemy.card) || combatMods.targeting === "self" || enemy.targetRoll === targetNumber;
  }

  function isSkillColorDisabled(card: FableCard) {
    return disabledSkillColors.includes(skillColor(card)) && !/can't be disabled/i.test(card.rules_text ?? "");
  }

  function skillUseStatus(slot: number, card: FableCard) {
    const behavior = skillBehavior(card);
    if (!skillFaceUp[slot]) return { enabled: false, reason: "This Skill is flipped. It refreshes when the current Location is Cleared." };
    if (isSkillColorDisabled(card)) return { enabled: false, reason: "This Skill color is disabled by the current Location." };
    if (health <= 0) return { enabled: false, reason: "Knocked Out Heroes cannot use Skill Cards." };
    if (enemy?.phase === "setup") return { enabled: false, reason: "Skills cannot be used during Enemy Setup." };
    const trapPending = !!eventState?.card.id.startsWith("trap-") && eventState.status === "pending";
    const lootCount = backpack.filter(Boolean).length;
    const move = currentEnemyMove();
    const dice = currentDieTargets();

    switch (card.id) {
      case "skill-bloody-blade": return { enabled: !!enemy?.dice && enemy.phase === "hero" && hasTriples(enemy.dice), reason: "Requires triples on your current attack roll." };
      case "skill-boomerwrong": return { enabled: !!enemy && tokens.lucky > 0, reason: "Requires an active Enemy and 1 Lucky Charm." };
      case "skill-bougie-bludgeoner": return { enabled: !!enemy && lootCount >= 1, reason: "Requires an active Enemy and 1 Loot to discard." };
      case "skill-choosing-violence": return { enabled: !!enemy && targetWillHitHero(), reason: "Use when a Targeted Attack is currently targeting you." };
      case "skill-coin-blaster": return { enabled: !!enemy && coins >= 1, reason: "Requires an active Enemy and 1 Coin." };
      case "skill-diamond-coated": return { enabled: !!enemy && enemy.phase === "hero", reason: "Use during your attack turn." };
      case "skill-hammer-time": return { enabled: !!enemy && enemy.phase === "hero", reason: "Use during your attack turn." };
      case "skill-limp-poke": return { enabled: !!enemy, reason: "Requires an active Enemy." };
      case "skill-nzt-48": return { enabled: !!enemy, reason: "Requires an active Enemy." };
      case "skill-rent-a-sword": return { enabled: coins >= 3 && attackDice < effectiveMaxDice, reason: "Requires 3 Coins and room for another Attack Die." };
      case "skill-shedding-weight": return { enabled: armor >= 1 && attackDice < effectiveMaxDice, reason: "Requires 1 Armor and room for another Attack Die." };

      case "skill-atrophy": return { enabled: !!enemy && attackDice >= 1, reason: "Requires an active Enemy and 1 Attack Die." };
      case "skill-attention-seeker": return { enabled: !!enemy && enemy.phase === "enemy" && move?.type === "[AA]", reason: "Use when the Enemy is about to make an Area Attack." };
      case "skill-danger-nerd": return { enabled: trapPending, reason: "Requires an active Trap before its Core Roll is accepted." };
      case "skill-trap-expert": return { enabled: trapPending && armor >= 1, reason: "Requires an active Trap and 1 Armor." };
      case "skill-ice-block": return { enabled: (!!enemy || trapPending) && lootCount >= 1, reason: "Requires an active Enemy/Trap and 1 Loot." };
      case "skill-intimidation": return { enabled: !!enemy || trapPending, reason: "Requires an active Enemy or Trap Damage stat." };
      case "skill-pain-aversion": return { enabled: trapPending && lootCount >= 1, reason: "Requires an active Trap and 1 Loot." };
      case "skill-rickety-reflex": return { enabled: trapPending && coins >= 2, reason: "Requires an active Trap and 2 Coins." };
      case "skill-thorny-wood": return { enabled: lootCount >= 2 && armor < effectiveMaxArmor, reason: "Requires 2 Loot and room for Armor." };
      case "skill-questionable-reflex": return { enabled: trapPending, reason: "Requires an active Trap." };

      case "skill-be-better": return { enabled: dice.some((die) => die.value === 1), reason: "Requires a visible die showing 1." };
      case "skill-capital-care": return { enabled: coins >= 1 && health < hero.maxHealth, reason: "Requires 1 Coin and missing Health." };
      case "skill-extra-inch": return { enabled: dice.some((die) => die.value < 6), reason: "Requires a visible die below 6." };
      case "skill-gaming-the-system": return { enabled: coins >= 1 && dice.length > 0, reason: "Requires 1 Coin and a visible die." };
      case "skill-mediocre": return { enabled: dice.length > 0, reason: "Requires a visible die." };
      case "skill-polymorph": return { enabled: dice.some((die) => die.value === 2), reason: "Requires a visible die showing 2." };
      case "skill-do-over": return { enabled: !!enemy?.dice && enemy.phase === "hero" && enemy.dice.slice(1).some((die) => Math.min(6, die + combatMods.attackRollBonus) < enemy.agility), reason: "Requires at least one missed Attack Die." };
      case "skill-second-aid": return { enabled: lootCount >= 1 && health < hero.maxHealth, reason: "Requires 1 Loot and missing Health." };
      case "skill-transfusion": return { enabled: health >= 3 && skills.some(Boolean), reason: "Requires 3 Health and a Skill to replace." };
      case "skill-benevolent-exchange": return { enabled: armor >= 1 && skills.some(Boolean), reason: "Requires 1 Armor and a Skill to replace." };

      case "skill-hand-torch": return { enabled: phase === "realm" && !shopOpen && coins >= 1 && !enemy, reason: "Requires 1 Coin while exploring a Realm." };
      case "skill-prolonged-stare": return { enabled: lastEnemyDamagedHero && lootDiscard.length > 0, reason: "Use after an Enemy damages you; the Loot discard pile must not be empty." };

      case "skill-distract": return { enabled: !!enemy && enemy.phase === "enemy" && move?.type === "[TA]", reason: "Use while the Enemy is making a Targeted Attack. In solo, redirecting means choosing yourself." };
      case "skill-mind-over-metal": return { enabled: !!enemy && enemy.phase === "enemy" && move?.type === "[TA]" && coins >= 1, reason: "Requires 1 Coin while the Enemy is making a Targeted Attack. In solo, redirecting means choosing yourself." };
      case "skill-organ-donor":
      case "skill-ice-wall":
      case "skill-reanimate":
      case "skill-missed-opportunity":
        return { enabled: false, reason: "This Skill requires another Hero (or another eligible Hero) and has no valid target in a solo run." };
      default:
        if (behavior === "automatic") return { enabled: false, reason: "Automatic Skill — the game applies it when its trigger occurs." };
        if (behavior === "ongoing") return { enabled: false, reason: "Ongoing Skill — its benefit is already active." };
        return { enabled: false, reason: "This Skill does not currently have a valid action window." };
    }
  }

  function rebuildTrapPlan(nextMods: TrapMods) {
    setTrapMods(nextMods);
    if (!eventState?.card.id.startsWith("trap-")) return;
    const id = `${eventState.card.id}::${hero.race.toLowerCase()}`;
    const plan = getEventPlan(id, { ...currentContext(), trapRequirementDelta: nextMods.requirementDelta, trapRequirementOverride: nextMods.requirementOverride, trapDamageDelta: nextMods.damageDelta });
    setEventState((state) => state ? { ...state, plan } : state);
  }

  function beginSkillRoll(slot: number, card: FableCard, effect: SkillRollState["effect"]) {
    setSkillUse(null);
    setSkillRoll({ slot, card, requirement: 5, effect });
  }

  async function resolveSkillRoll() {
    if (!skillRoll?.roll) return;
    const passed = skillRoll.roll >= skillRoll.requirement;
    if (passed) {
      if (skillRoll.effect === "enemyAgilityDown") setEnemy((state) => state ? { ...state, agility: clamp(state.agility - 1, 1, 6), messages: [...state.messages, `${skillRoll.card.title}: Agility -1.`] } : state);
      else if (skillRoll.effect === "damageDown") {
        if (enemy) setEnemy((state) => state ? { ...state, damage: Math.max(0, state.damage - 1), messages: [...state.messages, `${skillRoll.card.title}: Damage -1.`] } : state);
        else if (eventState?.card.id.startsWith("trap-")) rebuildTrapPlan({ ...trapMods, damageDelta: trapMods.damageDelta - 1 });
      } else if (skillRoll.effect === "attentionSeeker") setCombatMods((mods) => ({ ...mods, targeting: "self" }));
      notify(`${skillRoll.card.title}: Core Roll passed.`);
    } else notify(`${skillRoll.card.title}: Core Roll failed.`);
    setSkillRoll(null);
  }

  function applyDieSkill(slot: number, target: DieTarget) {
    const card = skills[slot];
    if (!card) return;
    const status = skillUseStatus(slot, card);
    if (!status.enabled) return notify(status.reason);
    if (card.id === "skill-be-better" && target.value !== 1) return notify("Be Better only rerolls a 1.");
    if (card.id === "skill-polymorph" && target.value !== 2) return notify("Polymorph only changes a 2.");
    if (card.id === "skill-extra-inch" && target.value >= 6) return notify("That die is already a 6.");
    if (card.id === "skill-gaming-the-system" && !payCoins(1)) return notify("Need 1 Coin.");
    if (skillUsesFlip(card)) flipSkill(slot);

    if (card.id === "skill-extra-inch") updateDieTarget(target, (value) => value + 1);
    else if (card.id === "skill-polymorph") updateDieTarget(target, () => 6);
    else updateDieTarget(target, () => rollD6());

    setSkillUse(null);
    setSkillPaymentSlots([]);
    notify(`${card.title} used.`);
  }

  async function executeSkillUse(slot: number) {
    const card = skills[slot];
    if (!card) return;
    const status = skillUseStatus(slot, card);
    if (!status.enabled) return notify(status.reason);

    const dieSkill = ["skill-be-better", "skill-extra-inch", "skill-gaming-the-system", "skill-mediocre", "skill-polymorph"].includes(card.id);
    if (dieSkill) {
      const targets = currentDieTargets().filter((target) => card.id === "skill-be-better" ? target.value === 1 : card.id === "skill-polymorph" ? target.value === 2 : card.id === "skill-extra-inch" ? target.value < 6 : true);
      if (targets.length === 1) return applyDieSkill(slot, targets[0]);
      return notify("Choose the die in the Skill window.");
    }

    const lootCost = skillLootCost(card.id);
    if (lootCost > 0 && skillPaymentSlots.length < lootCost) return notify(`Choose ${lootCost} Loot card${lootCost === 1 ? "" : "s"} to pay.`);

    if (card.id === "skill-boomerwrong") {
      if (tokens.lucky <= 0) return notify("Need 1 Lucky Charm.");
      setTokens((value) => ({ ...value, lucky: value.lucky - 1 }));
    }
    if (card.id === "skill-coin-blaster" || card.id === "skill-capital-care" || card.id === "skill-hand-torch") {
      if (!payCoins(1)) return notify("Need 1 Coin.");
    }
    if (card.id === "skill-rent-a-sword") {
      if (!payCoins(3)) return notify("Need 3 Coins.");
    }
    if (card.id === "skill-rickety-reflex") {
      if (!payCoins(2)) return notify("Need 2 Coins.");
    }
    if (lootCost > 0 && !payLootSlots(skillPaymentSlots, lootCost)) return notify("Choose valid Loot to pay.");

    if (skillUsesFlip(card)) flipSkill(slot);

    switch (card.id) {
      case "skill-bloody-blade":
      case "skill-choosing-violence":
        setEnemy((state) => state ? { ...state, agility: clamp(state.agility - 1, 1, 6), messages: [...state.messages, `${card.title}: Agility -1.`] } : state);
        break;
      case "skill-boomerwrong": dealSkillDamage(3, card.title); break;
      case "skill-bougie-bludgeoner": dealSkillDamage(2, card.title); break;
      case "skill-coin-blaster": dealSkillDamage(1, card.title); break;
      case "skill-diamond-coated":
        if (enemy?.dice?.length) setEnemy((state) => state?.dice ? { ...state, dice: [...state.dice, rollD6(), rollD6()] } : state);
        else setCombatMods((mods) => ({ ...mods, attackDiceBonus: mods.attackDiceBonus + 2 }));
        break;
      case "skill-hammer-time": setCombatMods((mods) => ({ ...mods, forceAttackDiceHit: true })); break;
      case "skill-limp-poke": dealSkillDamage(2, card.title); break;
      case "skill-nzt-48": beginSkillRoll(slot, card, "enemyAgilityDown"); return;
      case "skill-rent-a-sword": setAttackDice((value) => Math.min(effectiveMaxDice, value + 1)); break;
      case "skill-shedding-weight": setArmor((value) => Math.max(0, value - 1)); setAttackDice((value) => Math.min(effectiveMaxDice, value + 1)); break;

      case "skill-atrophy": setAttackDice((value) => Math.max(0, value - 1)); setEnemy((state) => state ? { ...state, damage: Math.max(0, state.damage - 1), messages: [...state.messages, "Atrophy: Damage -1."] } : state); break;
      case "skill-attention-seeker": beginSkillRoll(slot, card, "attentionSeeker"); return;
      case "skill-distract": setCombatMods((mods) => ({ ...mods, targeting: "self" })); break;
      case "skill-mind-over-metal": if (!payCoins(1)) return notify("Need 1 Coin."); setCombatMods((mods) => ({ ...mods, targeting: "self" })); break;
      case "skill-danger-nerd": rebuildTrapPlan({ ...trapMods, requirementDelta: trapMods.requirementDelta - 1 }); break;
      case "skill-trap-expert": setArmor((value) => Math.max(0, value - 1)); rebuildTrapPlan({ ...trapMods, damageDelta: trapMods.damageDelta - 3 }); break;
      case "skill-ice-block":
        if (enemy) setEnemy((state) => state ? { ...state, damage: Math.max(0, state.damage - 1), messages: [...state.messages, "Ice Block: Damage -1."] } : state);
        else rebuildTrapPlan({ ...trapMods, damageDelta: trapMods.damageDelta - 1 });
        break;
      case "skill-intimidation": beginSkillRoll(slot, card, "damageDown"); return;
      case "skill-pain-aversion":
        if (eventState?.card.id.startsWith("trap-")) await completeEvent(eventState.key, eventState.card, ["Pain Aversion: paid 1 Loot and dodged the Trap."]);
        break;
      case "skill-rickety-reflex":
        if (eventState?.card.id.startsWith("trap-")) await completeEvent(eventState.key, eventState.card, ["Rickety Reflex: paid 2 Coins and dodged the Trap."]);
        break;
      case "skill-thorny-wood": setArmor((value) => Math.min(effectiveMaxArmor, value + 1)); break;
      case "skill-questionable-reflex": rebuildTrapPlan({ ...trapMods, requirementOverride: 4 }); break;

      case "skill-capital-care": setHealth((value) => Math.min(hero.maxHealth, value + 1)); break;
      case "skill-do-over":
        setEnemy((state) => state?.dice ? { ...state, dice: state.dice.map((die, index) => index > 0 && Math.min(6, die + combatMods.attackRollBonus) < state.agility ? rollD6() : die), messages: [...state.messages, "Do-Over: rerolled missed Attack Dice."] } : state);
        break;
      case "skill-second-aid": setHealth((value) => Math.min(hero.maxHealth, value + 2)); break;
      case "skill-transfusion":
        setHealth((value) => Math.max(0, value - 3)); setSkillUse(null); setSkillDraft({ mode: "replace", color: "any", choices: [], title: "Transfusion · Replace one Skill", stage: "slot" }); return;
      case "skill-benevolent-exchange":
        setArmor((value) => Math.max(0, value - 1)); setSkillUse(null); setSkillDraft({ mode: "replace", color: "any", choices: [], title: "Benevolent Exchange · Replace one Skill", stage: "slot" }); return;

      case "skill-hand-torch": setScoutRemaining((value) => value + 1); break;
      case "skill-prolonged-stare": {
        const recovered = lootDiscard[lootDiscard.length - 1];
        if (recovered) {
          setLootDiscard((value) => value.slice(0, -1));
          setLootInbox((value) => [...value, recovered]);
          setLastEnemyDamagedHero(false);
        }
        break;
      }
    }

    setSkillUse(null);
    setSkillPaymentSlots([]);
    notify(`${card.title} used.`);
  }

  async function applyTriggerEffects(effects: TriggerEffect[]) {
    for (const effect of effects) {
      if (effect.type === "health") setHealth((v) => clamp(v + effect.amount, 0, hero.maxHealth));
      else if (effect.type === "armor") setArmor((v) => clamp(v + effect.amount, 0, effectiveMaxArmor));
      else if (effect.type === "attackDice") setAttackDice((v) => clamp(v + effect.amount, 0, effectiveMaxDice));
      else if (effect.type === "coins") setCoinSlots((slots) => adjustCoinSlots(slots, backpack, effect.amount).slots);
      else if (effect.type === "token") setTokens((v) => ({ ...v, [effect.token]: Math.max(0, v[effect.token] + effect.amount) }));
      else if (effect.type === "drawLoot") await drawLootCards(effect.count);
      else if (effect.type === "enemyDamage") setEnemy((v) => v ? { ...v, health: Math.max(0, v.health - effect.amount), messages: [...v.messages, `Skill dealt ${effect.amount} damage.`] } : v);
      else if (effect.type === "enemyAgility") setEnemy((v) => v ? { ...v, agility: clamp(v.agility + effect.amount, 1, 6) } : v);
    }
  }

  async function useToken(token: TokenKind) {
    if (tokens[token] <= 0) return;
    if (token === "healing") {
      const amount = hasSkill(triggerCtx, "skill-mighty-medic") ? 2 : 1;
      if (health >= hero.maxHealth) return notify("Already at full Health.");
      setTokens((v) => ({ ...v, healing: v.healing - 1 })); setHealth((v) => Math.min(hero.maxHealth, v + amount)); return notify(`Healing Potion: +${amount} Health.`);
    }
    if (token === "crystal") {
      if (!run || phase !== "realm" || enemy) return notify("Crystal Ball can be used while exploring a Realm.");
      const count = hasSkill(triggerCtx, "skill-palm-reader") ? 2 : 1;
      setTokens((v) => ({ ...v, crystal: v.crystal - 1 })); setScoutRemaining((v) => v + count); return notify(`Crystal Ball: reveal ${count} Location${count > 1 ? "s" : ""}.`);
    }
    if (skillRoll?.roll != null) { setTokens((v) => ({ ...v, lucky: v.lucky - 1 })); setSkillRoll((v) => v ? { ...v, roll: rollD6() } : v); return; }
    if (reactionRoll?.roll != null) { setTokens((v) => ({ ...v, lucky: v.lucky - 1 })); setReactionRoll((v) => v ? { ...v, roll: rollD6() } : v); return; }
    if (enemy?.setupRoll != null && enemy.phase === "setup") { setTokens((v) => ({ ...v, lucky: v.lucky - 1 })); setEnemy((v) => v ? { ...v, setupRoll: rollD6() } : v); return; }
    if (enemy?.targetPending && enemy.targetRoll != null) { setTokens((v) => ({ ...v, lucky: v.lucky - 1 })); setEnemy((v) => v ? { ...v, targetRoll: rollD6() } : v); return; }
    if (enemy?.dice?.length && enemy.phase === "hero") return notify("Click the Lucky reroll under the specific combat die you want to reroll.");
    if (eventState?.roll != null && eventState.status === "pending") { setTokens((v) => ({ ...v, lucky: v.lucky - 1 })); setEventState((v) => v ? { ...v, roll: rollD6() } : v); return; }
    notify("Lucky Charm needs a visible die result.");
  }

  async function applyEventEffects(effects: EventEffect[], sourceKey: string) {
    const messages: string[] = [];
    for (const effect of effects) {
      if (effect.type === "health") { setHealth((v) => clamp(v + effect.amount, 0, hero.maxHealth)); messages.push(`Health ${effect.amount >= 0 ? "+" : ""}${effect.amount}.`); }
      else if (effect.type === "armor") { setArmor((v) => clamp(v + effect.amount, 0, effectiveMaxArmor)); messages.push(`Armor ${effect.amount >= 0 ? "+" : ""}${effect.amount}.`); }
      else if (effect.type === "attackDice") { setAttackDice((v) => clamp(v + effect.amount, 0, effectiveMaxDice)); messages.push(`Attack Dice ${effect.amount >= 0 ? "+" : ""}${effect.amount}.`); }
      else if (effect.type === "coins") { setCoinSlots((slots) => adjustCoinSlots(slots, backpack, effect.amount).slots); messages.push(`Coins ${effect.amount >= 0 ? "+" : ""}${effect.amount}.`); }
      else if (effect.type === "token") { setTokens((v) => ({ ...v, [effect.token]: Math.max(0, v[effect.token] + effect.amount) })); messages.push(`${TOKEN_LABELS[effect.token]} ${effect.amount >= 0 ? "+" : ""}${effect.amount}.`); }
      else if (effect.type === "drawLoot") { const cards = await drawLootCards(effect.count); messages.push(`Drew ${cards.map((c) => c.title).join(", ") || "no Loot"}.`); }
      else if (effect.type === "discardLoot") { setBackpack((items) => { const next = [...items]; for (let i = 0; i < effect.count; i += 1) { const slot = next.findIndex(Boolean); if (slot >= 0) { const card = next[slot] as FableCard; setLootDiscard((d) => [...d, card]); next[slot] = null; } } return next; }); messages.push(`Discarded ${effect.count} Loot.`); }
      else if (effect.type === "scout") { setScoutRemaining((v) => v + effect.count); messages.push(`Reveal ${effect.count} Location${effect.count === 1 ? "" : "s"}.`); }
      else if (effect.type === "resetRealm" && run) { const [, cell = selectedCell ?? map?.start_cell ?? ""] = sourceKey.split(":"); const result = await postJson<{ revealed: string[] }>("/api/fablefury/reset-realm", { runId: run.run_id, realm, currentCell: cell }); setRevealed((v) => ({ ...v, [realm]: result.revealed })); messages.push("Realm reset to Unexplored."); }
      else if (effect.type === "note") messages.push(effect.text);
    }
    return messages;
  }

  async function completeEvent(key: string, card: FableCard, messages: string[], roll?: number, pick?: number) {
    setResolvedKeys((v) => v.includes(key) ? v : [...v, key]);
    setEventHistory((v) => ({ ...v, [key]: messages }));
    setEventState((v) => v ? { ...v, status: "resolved", messages, roll, pick, rollMode: undefined } : v);

    if (card.id.startsWith("trap-")) {
      await applyTriggerEffects(clearTriggers("trap", triggerCtx));
      if (hasSkill(triggerCtx, "skill-reflex-flex")) setReactionRoll({ label: "Reflex Flex · Core Roll 5+ to gain 1 Attack Die", requirement: 5, onPass: "attackDice" });
    } else {
      await applyTriggerEffects(clearTriggers("event", triggerCtx));
    }
    refreshSkills();
    setTrapMods({ ...EMPTY_TRAP_MODS });
  }

  async function prepareEvent(card: FableCard, key: string) {
    const isTrap = card.id.startsWith("trap-");
    const freshTrapMods = isTrap ? { ...EMPTY_TRAP_MODS } : trapMods;
    if (isTrap) setTrapMods(freshTrapMods);
    const id = isTrap ? `${card.id}::${hero.race.toLowerCase()}` : card.id;
    const plan = getEventPlan(id, isTrap ? { ...currentContext(), trapRequirementDelta: 0, trapRequirementOverride: null, trapDamageDelta: 0 } : currentContext());
    if (resolvedKeys.includes(key)) { setEventState({ key, card, plan, status: "resolved", messages: eventHistory[key] ?? ["Already resolved."] }); return; }
    if (plan.kind === "auto") { setEventState({ key, card, plan, status: "resolving", messages: [] }); const messages = await applyEventEffects(plan.effects, key); await completeEvent(key, card, messages); return; }
    setEventState({ key, card, plan, status: "pending", messages: [] });
  }

  async function resolveEvent(effects: EventEffect[], roll?: number, pick?: number) { if (!eventState) return; const messages = await applyEventEffects(effects, eventState.key); await completeEvent(eventState.key, eventState.card, messages, roll, pick); }

  async function startSkillChoices(color: SkillColor, draft: Omit<SkillDraft, "color" | "choices" | "stage">) { const choices = await drawSkills(color, 3); setSkillDraft({ ...draft, color, choices, stage: "choices" }); }

  async function prepareShrine(card: FableCard, key: string) {
    if (resolvedKeys.includes(key) || shrineStarted.includes(key)) return;
    if (realm === 3) setRealmThreeShrineId(card.id);
    setShrineStarted((v) => [...v, key]); const messages: string[] = [];
    setHealth((v) => Math.min(hero.maxHealth, v + 1)); messages.push("Shrine: +1 Health.");
    if (card.id === "special-dragon-sanctuary") { setCoinSlots((v) => adjustCoinSlots(v, backpack, 1).slots); messages.push("Dragon Sanctuary: +1 Coin."); }
    if (card.id === "special-giant-monolith") { setTokens((v) => ({ ...v, crystal: v.crystal + 1 })); messages.push("Giant Monolith: +1 Crystal Ball."); }
    if (card.id === "special-orc-temple") { setTokens((v) => ({ ...v, lucky: v.lucky + 1 })); messages.push("Orc Temple: +1 Lucky Charm."); }
    await applyTriggerEffects(clearTriggers("shrine", triggerCtx));
    setSpecialHistory((v) => ({ ...v, [key]: messages }));
    await startSkillChoices(hero.skillSlots[realm - 1], { mode: "shrine", sourceKey: key, title: `Realm ${realm} Shrine · ${hero.skillSlots[realm - 1]} Skill` });
  }

  async function chooseSkill(card: FableCard) {
    if (!skillDraft) return;
    if (skillDraft.mode === "shrine") {
      const slot = realm - 1;
      setSkills((v) => v.map((s, i) => i === slot ? card : s));
      setSkillFaceUp((v) => v.map((face, i) => i === slot ? true : face));
      if (skillDraft.sourceKey) setResolvedKeys((v) => v.includes(skillDraft.sourceKey as string) ? v : [...v, skillDraft.sourceKey as string]);
      setSkillDraft(null); setSelectedCard(null); setSelectedCell(null);
      refreshSkills();
      notify(`${card.title} equipped.`);
      return;
    }
    if (skillDraft.slot != null) {
      const slot = skillDraft.slot;
      setSkills((v) => v.map((s, i) => i === slot ? card : s));
      setSkillFaceUp((v) => v.map((face, i) => i === slot ? true : face));
      setSkillDraft(null);
      notify(`${card.title} equipped.`);
    }
  }

  async function applyLoot(use: LootUse, effects: LootEffect[]) {
    let consumed = true;
    for (const effect of effects) {
      if (effect.type === "health") setHealth((v) => clamp(v + effect.amount, 0, hero.maxHealth));
      else if (effect.type === "armor") setArmor((v) => clamp(v + effect.amount, 0, effectiveMaxArmor));
      else if (effect.type === "attackDice") setAttackDice((v) => clamp(v + effect.amount, 0, effectiveMaxDice));
      else if (effect.type === "coins") { const amount = effect.amount === "all" ? -coins : effect.amount; setCoinSlots((v) => adjustCoinSlots(v, backpack, amount).slots); }
      else if (effect.type === "scout") setScoutRemaining((v) => v + effect.count);
      else if (effect.type === "damage") {
        if (enemy) {
          const amount = enemy.card.race && effect.targetRace === enemy.card.race ? (effect.targetRaceAmount ?? effect.amount) : effect.amount;
          setEnemy((v) => v ? { ...v, health: Math.max(0, v.health - amount), messages: [...v.messages, `${use.card.title}: ${amount} damage.`] } : v);
          if (effect.everyone) { const blocked = Math.min(armor, amount); setHealth((v) => Math.max(0, v - Math.max(0, amount - blocked))); }
        } else { setCombatMods((v) => ({ ...v })); notify(`${use.card.title} needs an Enemy target.`); consumed = false; }
      }
      else if (effect.type === "rerollCore") { if (eventState?.roll != null) setEventState((v) => v ? { ...v, roll: rollD6() } : v); else if (enemy?.setupRoll != null) setEnemy((v) => v ? { ...v, setupRoll: rollD6() } : v); else setCombatMods((v) => ({ ...v, rerollAttack: true })); }
      else if (effect.type === "increaseCore") { if (eventState?.roll != null) setEventState((v) => v && v.roll != null ? { ...v, roll: Math.min(6, v.roll + effect.amount) } : v); else if (enemy?.setupRoll != null) setEnemy((v) => v && v.setupRoll != null ? { ...v, setupRoll: Math.min(6, v.setupRoll + effect.amount) } : v); else setCombatMods((v) => ({ ...v, attackRollBonus: v.attackRollBonus + effect.amount })); }
      else if (effect.type === "dodgeTrap") { if (eventState?.card.id.startsWith("trap-") && eventState.status === "pending") await completeEvent(eventState.key, eventState.card, ["Cleats: Trap dodged automatically."]); else { notify("Cleats needs a pending Trap."); consumed = false; } }
      else if (effect.type === "attackDiceThisTurn") setCombatMods((v) => ({ ...v, attackDiceBonus: v.attackDiceBonus + effect.amount }));
      else if (effect.type === "attackRollBonus") setCombatMods((v) => ({ ...v, attackRollBonus: v.attackRollBonus + effect.amount }));
      else if (effect.type === "rerollAttack") setCombatMods((v) => ({ ...v, rerollAttack: true }));
      else if (effect.type === "targeting") setCombatMods((v) => ({ ...v, targeting: effect.mode }));
      else if (effect.type === "enemyStat") { if (!enemy) { notify(`${use.card.title} needs an Enemy.`); consumed = false; } else if (effect.stat === "damage") setEnemy((v) => v ? { ...v, damage: Math.max(0, v.damage + effect.amount) } : v); else setEnemy((v) => v ? { ...v, agility: clamp(v.agility + effect.amount, 1, 6) } : v); }
      else if (effect.type === "rewardBonus") setCombatMods((v) => ({ ...v, rewardBonus: v.rewardBonus + effect.amount }));
      else if (effect.type === "recoverLoot") { const recovered = lootDiscard[lootDiscard.length - 1]; if (recovered) { setLootDiscard((v) => v.slice(0, -1)); setBackpack((v) => v.map((c, i) => i === use.slot ? recovered : c)); consumed = false; } }
      else if (effect.type === "replaceSkill") { const existing = skills.findIndex(Boolean); if (existing < 0) { notify("You need a Skill to replace."); consumed = false; } else if (effect.color === "any") setSkillDraft({ mode: "replace", color: "any", choices: [], title: "Replace a Skill", stage: "slot" }); else { const choices = await drawSkills(effect.color, 3); setSkillDraft({ mode: "replace", color: effect.color, choices, title: `Replace a Skill with ${effect.color}`, stage: "slot" }); } }
    }
    if (consumed) { setBackpack((v) => v.map((c, i) => i === use.slot ? null : c)); setLootDiscard((v) => [...v, use.card]); setLootUse(null); }
    if (enemy && enemy.health <= 0) setEnemy((v) => v ? { ...v, phase: "victory" } : v);
  }

  function openLoot(slot: number) { const card = backpack[slot]; if (card) setLootUse({ slot, card }); }

  async function applyEnemyEffects(effects: EnemyEffect[]) {
    const messages: string[] = [];
    for (const effect of effects) {
      if (effect.type === "health") setHealth((v) => clamp(v + effect.amount, 0, hero.maxHealth));
      else if (effect.type === "armor") setArmor((v) => clamp(v + effect.amount, 0, effectiveMaxArmor));
      else if (effect.type === "attackDice") setAttackDice((v) => clamp(v + effect.amount, 0, effectiveMaxDice));
      else if (effect.type === "coins") setCoinSlots((v) => adjustCoinSlots(v, backpack, effect.amount).slots);
      else if (effect.type === "drawLoot") await drawLootCards(effect.count);
      else if (effect.type === "discardLoot") setBackpack((items) => { const next = [...items]; for (let i = 0; i < effect.count; i += 1) { const slot = next.findIndex(Boolean); if (slot >= 0) { const card = next[slot] as FableCard; setLootDiscard((d) => [...d, card]); next[slot] = null; } } return next; });
      else if (effect.type === "enemyDamage") setEnemy((v) => v ? { ...v, damage: Math.max(0, v.damage + effect.amount) } : v);
      else if (effect.type === "enemyAgility") setEnemy((v) => v ? { ...v, agility: clamp(v.agility + effect.amount, 1, 6) } : v);
      else if (effect.type === "enemyHeal") setEnemy((v) => v ? { ...v, health: Math.min(v.maxHealth, v.health + effect.amount) } : v);
      else if (effect.type === "disableSkills") setEnemy((v) => v ? { ...v, disabledSkillColors: [...new Set([...v.disabledSkillColors, ...effect.colors])] } : v);
      else if (effect.type === "note") messages.push(effect.text);
    }
    if (messages.length) setEnemy((v) => v ? { ...v, messages: [...v.messages, ...messages] } : v);
  }

  async function prepareEnemy(card: FableCard, key: string) {
    if (resolvedKeys.includes(key)) { notify(`${card.title} has already been defeated.`); return; }
    setLastEnemyDamagedHero(false);
    const data = enemyData(card); const setup = setupSteps(card, enemyContext());
    const damageMod = data.isBoss ? 0 : combatMods.enemyDamageDelta;
    const agilityMod = data.isBoss ? 0 : combatMods.enemyAgilityDelta;
    setEnemy({ key, card, maxHealth: data.health * PARTY_COUNT, health: data.health * PARTY_COUNT, damage: Math.max(0, data.damage + damageMod), agility: clamp(data.agility + agilityMod, 1, 6), actionIndex: 0, phase: "setup", setup, setupIndex: 0, disabledSkillColors: [], noReward: false, messages: [`${data.isBoss ? "FINAL MONSTER · " : ""}${data.haste ? "Haste — Monster attacks first." : "Heroes attack first."}`] });
  }

  async function startFinalMonster() {
    const fallbackShrine = Object.entries(cardsByCell).find(([key, card]) => key.startsWith("3:") && card.subtype === "shrine" && resolvedKeys.includes(key))?.[1];
    const shrineId = realmThreeShrineId ?? fallbackShrine?.id ?? null;
    if (!shrineId) {
      setError("Could not determine the Realm 3 Shrine for the final Monster.");
      return;
    }
    setLoading("monster");
    setError(null);
    try {
      const result = await postJson<{ card: FableCard }>("/api/fablefury/monster", { shrineId });
      await prepareEnemy(result.card, `final:${result.card.id}`);
      notify(`Final Monster: ${result.card.title}. Defeat it to win!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the final Monster.");
    } finally {
      setLoading(null);
    }
  }

  async function advanceEnemySetup(effects?: EnemyEffect[]) {
    if (!enemy) return;
    if (effects) await applyEnemyEffects(effects);
    const nextIndex = enemy.setupIndex + 1;
    if (nextIndex < enemy.setup.length) { setEnemy((v) => v ? { ...v, setupIndex: nextIndex, setupRoll: undefined } : v); return; }
    const haste = enemyData(enemy.card).haste;
    setEnemy((v) => v ? { ...v, setupIndex: nextIndex, setupRoll: undefined, phase: haste ? "enemyStart" : "hero" } : v);
  }

  async function resolveSetupRoll() {
    if (!enemy || enemy.setupRoll == null) return; const step = enemy.setup[enemy.setupIndex]; if (!step || step.kind !== "roll") return;
    await advanceEnemySetup(enemy.setupRoll >= step.requirement ? (step.pass ?? []) : step.fail);
  }

  function rollHeroAttack() {
    if (!enemy || enemy.phase !== "hero") return;
    setLastEnemyDamagedHero(false);
    const count = 1 + attackDice + combatMods.attackDiceBonus;
    setEnemy((v) => v ? { ...v, dice: Array.from({ length: count }, () => rollD6()), messages: [...v.messages, `Rolled ${count} dice: 1 Core + ${count - 1} Attack.`] } : v);
  }

  function rerollCombatDie(index: number, free = false) { if (!enemy?.dice) return; if (!free) { if (tokens.lucky <= 0) return; setTokens((v) => ({ ...v, lucky: v.lucky - 1 })); } setEnemy((v) => v?.dice ? { ...v, dice: v.dice.map((die, i) => i === index ? rollD6() : die) } : v); }
  function polymorphDie(index: number) { setEnemy((v) => v?.dice ? { ...v, dice: v.dice.map((die, i) => i === index && die === 2 ? 6 : die) } : v); }

  async function resolveHeroAttack() {
    if (!enemy?.dice) return;
    const raw = enemy.dice;
    const adjusted = raw.map((die) => Math.min(6, die + combatMods.attackRollBonus));
    const coreHits = adjusted.length > 0 && adjusted[0] >= enemy.agility ? 1 : 0;
    const attackHits = combatMods.forceAttackDiceHit
      ? Math.max(0, adjusted.length - 1)
      : adjusted.slice(1).filter((die) => die >= enemy.agility).length;
    const hits = coreHits + attackHits;
    const misses = adjusted.length - hits;

    const reaction = heroRollReaction(enemy.card, raw, misses);
    await applyEnemyEffects(reaction.auto);
    await applyTriggerEffects(heroAttackRollTriggers(raw, triggerCtx));

    if (hasSkill(triggerCtx, "skill-the-fource") && hasDouble(raw, 4) && skills.some(Boolean)) {
      setSkillDraft({ mode: "replace", color: "any", choices: [], title: "The Fource · Double 4 — optionally replace a Skill", stage: "slot" });
    }

    const remainingHp = Math.max(0, enemy.health - hits);
    setEnemy((v) => v ? { ...v, health: remainingHp, dice: undefined, messages: [...v.messages, `${hits} hit${hits === 1 ? "" : "s"} at Agility ${v.agility}+ → ${hits} damage.`] } : v);
    setCombatMods((v) => ({ ...v, attackDiceBonus: 0, attackRollBonus: 0, rerollAttack: false, forceAttackDiceHit: false }));

    if (reaction.choice) {
      setEnemy((v) => v ? { ...v, choice: { prompt: reaction.choice!.prompt, options: reaction.choice!.options.map((o) => ({ label: o.label, effects: o.effects, disabled: !!o.requiresCoins && coins < o.requiresCoins })) } } : v);
      return;
    }
    if (remainingHp <= 0) { setEnemy((v) => v ? { ...v, phase: "victory" } : v); return; }
    if (health <= 0) { setEnemy((v) => v ? { ...v, phase: "defeat" } : v); return; }
    setEnemy((v) => v ? { ...v, phase: "enemyStart" } : v);
  }

  async function beginEnemyTurn() {
    if (!enemy) return; const start = enemyTurnStart(enemy.card);
    if (!start) { setEnemy((v) => v ? { ...v, phase: "enemy" } : v); return; }
    if (start.kind === "auto") { await applyEnemyEffects(start.effects); setEnemy((v) => v ? { ...v, phase: "enemy" } : v); return; }
    setEnemy((v) => v ? { ...v, choice: { prompt: start.prompt, options: start.options.map((o) => ({ label: o.label, effects: o.effects, disabled: !!o.requiresAttackDice && attackDice < o.requiresAttackDice })) } } : v);
  }

  async function applyEnemyChoice(index: number) {
    if (!enemy?.choice) return; const option = enemy.choice.options[index]; if (!option || option.disabled) return; await applyEnemyEffects(option.effects);
    const wasSetup = enemy.phase === "setup"; const wasEnemyStart = enemy.phase === "enemyStart"; setEnemy((v) => v ? { ...v, choice: undefined } : v);
    if (wasSetup) await advanceEnemySetup(); else if (wasEnemyStart) setEnemy((v) => v ? { ...v, phase: "enemy" } : v);
  }

  function enemyDamageHero(amount: number) {
    if (!enemy) return 0;
    const blocked = armorBlocksEnemy(enemy.card) ? Math.min(armor, amount) : 0;
    const lost = Math.max(0, amount - blocked);
    if (enemy.card.id === "monster-massive-max" && health - lost <= 0) setArmor(0);
    setHealth((v) => Math.max(0, v - lost));
    return lost;
  }

  async function finishEnemyAction(attack: EnemyAttack, targetedMiss: boolean, heroWasDamaged: boolean) {
    if (!enemy) return;
    setLastEnemyDamagedHero(heroWasDamaged);
    const after = afterEnemyAction(enemy.card, attack, targetedMiss);
    await applyEnemyEffects(after.effects);
    if (attack.type === "[TA]") await applyTriggerEffects(targetedAttackTriggers(triggerCtx, !targetedMiss));
    if (attack.type === "[AA]") await applyTriggerEffects(allAttackEndedTriggers(triggerCtx));

    let enemyKilled = after.killNoReward || (enemy.health <= 0);
    if (after.killNoReward) setEnemy((v) => v ? { ...v, health: 0, noReward: true } : v);
    if (heroWasDamaged && hero.id === "hero-lord-smasherton") {
      setEnemy((v) => v ? { ...v, health: Math.max(0, v.health - 1), messages: [...v.messages, "Smite Club: 1 damage back to the Enemy."] } : v);
      enemyKilled = enemyKilled || enemy.health <= 1;
    }
    if (enemyKilled) { setEnemy((v) => v ? { ...v, phase: "victory", targetPending: false, targetRoll: undefined } : v); return; }
    if (health <= 0) { setEnemy((v) => v ? { ...v, phase: "defeat" } : v); return; }
    setEnemy((v) => v ? (v.health <= 0 ? { ...v, phase: "victory", targetPending: false, targetRoll: undefined } : { ...v, actionIndex: (v.actionIndex + 1) % Math.max(1, enemyData(v.card).attacks.length), phase: "hero", targetPending: false, targetRoll: undefined }) : v);
  }

  async function resolveTargetedAttack() {
    if (!enemy || !enemy.targetPending || enemy.targetRoll == null) return;
    const originalAttack = enemyData(enemy.card).attacks[enemy.actionIndex];
    const convertedAreaAttack = originalAttack?.type === "[AA]" && combatMods.targeting === "self";
    const attack = convertedAreaAttack ? { ...originalAttack, type: "[TA]", name: `${originalAttack.name} (redirected)` } : originalAttack;
    const directed = convertedAreaAttack || targetIsDirected(enemy.card) || combatMods.targeting === "self";
    const hit = directed || enemy.targetRoll === targetNumber;
    let lost = 0;
    if (hit) lost = enemyDamageHero(enemy.damage);
    setCombatMods((v) => ({ ...v, targeting: null }));
    if (hit && hero.id === "hero-helga") setReactionRoll({ label: "Holding Space · Core Roll 5+ to gain 1 Armor", requirement: 5, onPass: "armor" });
    await finishEnemyAction(attack, !hit, lost > 0);
  }

  async function executeEnemyAction() {
    if (!enemy || enemy.phase !== "enemy") return;
    const attack = enemyData(enemy.card).attacks[enemy.actionIndex] ?? { name: "Attack", type: "[TA]", effects: [] };

    if (attack.type === "[TA]") {
      if (targetIsDirected(enemy.card) || combatMods.targeting === "self") setEnemy((v) => v ? { ...v, targetRoll: targetNumber ?? 1, targetPending: true } : v);
      else setEnemy((v) => v ? { ...v, targetRoll: rollD6(), targetPending: true } : v);
      return;
    }
    if (attack.type === "[AA]" && combatMods.targeting === "self") {
      setEnemy((v) => v ? { ...v, targetRoll: targetNumber ?? 1, targetPending: true } : v);
      return;
    }
    if (attack.type === "[AA]") {
      const lost = enemyDamageHero(enemy.damage);
      await finishEnemyAction(attack, false, lost > 0);
      return;
    }
    if (attack.type === "[BA]") {
      await applyEnemyEffects(buffEffects(attack));
      await finishEnemyAction(attack, false, false);
    }
  }

  async function resolveReactionRoll() {
    if (!reactionRoll?.roll) return;
    if (reactionRoll.roll >= reactionRoll.requirement) {
      if (reactionRoll.onPass === "armor") setArmor((v) => Math.min(effectiveMaxArmor, v + 1));
      else if (reactionRoll.onPass === "attackDice") setAttackDice((v) => Math.min(effectiveMaxDice, v + 1));
    }
    setReactionRoll(null);
  }

  async function claimReward() {
    if (!enemy) return;
    if (enemy.card.card_type === "monster") {
      const defeatedMonster = enemy.card;
      setResolvedKeys((v) => v.includes(enemy.key) ? v : [...v, enemy.key]);
      setCombatMods({ ...EMPTY_COMBAT_MODS });
      setEnemy(null);
      setSelectedCard(null);
      setSelectedCell(null);
      setLastEnemyDamagedHero(false);
      setGameWon(defeatedMonster);
      return;
    }
    const reward = parseReward(enemy.card);
    const boosting = skills.some((s) => s?.id === "skill-boosting" && skillActive(s)) ? 1 : 0;
    const bonus = combatMods.rewardBonus + boosting;
    const amount = enemy.noReward ? 0 : reward.amount + (reward.amount > 0 ? bonus : 0);

    if (amount > 0) {
      if (reward.kind === "coins") setCoinSlots((v) => adjustCoinSlots(v, backpack, amount).slots);
      else if (reward.kind === "healing") setTokens((v) => ({ ...v, healing: v.healing + amount }));
      else if (reward.kind === "crystal") setTokens((v) => ({ ...v, crystal: v.crystal + amount }));
      else if (reward.kind === "lucky") setTokens((v) => ({ ...v, lucky: v.lucky + amount }));
      else if (reward.kind === "loot") await drawLootCards(amount);
      else if (reward.kind === "armor") setArmor((v) => Math.min(effectiveMaxArmor, v + amount));
      else if (reward.kind === "attackDice") setAttackDice((v) => Math.min(effectiveMaxDice, v + amount));
    }

    if ((enemy.noReward || reward.kind === "none" || amount <= 0) && hasSkill(triggerCtx, "skill-self-bless")) await drawLootCards(1);
    await applyTriggerEffects(clearTriggers("enemy", triggerCtx));
    refreshSkills();
    setResolvedKeys((v) => v.includes(enemy.key) ? v : [...v, enemy.key]);
    setCombatMods((v) => ({ ...v, enemyDamageDelta: 0, enemyAgilityDelta: 0, rewardBonus: 0, forceAttackDiceHit: false }));
    setEnemy(null); setSelectedCard(null); setSelectedCell(null); setLastEnemyDamagedHero(false);
    notify(enemy.noReward ? "Enemy cleared — no reward." : `${reward.kind === "none" ? "Enemy cleared" : `Reward: ${amount} ${reward.kind}`}.`);
  }

  function spendShopCoins(amount: number) {
    if (coins < amount) { notify(`Need ${amount} Coins.`); return false; }
    setCoinSlots((slots) => adjustCoinSlots(slots, backpack, -amount).slots);
    return true;
  }

  function buyShopToken(token: TokenKind) {
    if (!spendShopCoins(1)) return;
    setTokens((current) => ({ ...current, [token]: current[token] + 1 }));
    notify(`${TOKEN_LABELS[token]} purchased.`);
  }

  async function buyShopLoot() {
    if (!spendShopCoins(2)) return;
    const cards = await drawLootCards(1);
    if (cards.length) notify(`${cards[0].title} purchased.`);
  }

  function buyShopAttackDie() {
    if (attackDice >= effectiveMaxDice) return notify("Attack Dice are already at capacity.");
    if (!spendShopCoins(4)) return;
    setAttackDice((value) => Math.min(effectiveMaxDice, value + 1));
    notify("+1 Attack Die purchased.");
  }

  function buyShopArmor() {
    if (armor >= effectiveMaxArmor) return notify("Armor is already at capacity.");
    if (!spendShopCoins(shopArmorCost)) return;
    setArmor((value) => Math.min(effectiveMaxArmor, value + 1));
    notify(`+1 Armor purchased for ${shopArmorCost} Coins.`);
  }

  function sellShopLoot(slot: number) {
    const card = backpack[slot];
    if (!card) return;
    const nextBackpack = backpack.map((item, index) => index === slot ? null : item);
    setBackpack(nextBackpack);
    setLootDiscard((current) => [...current, card]);
    setCoinSlots((slots) => adjustCoinSlots(slots, nextBackpack, 1).slots);
    notify(`${card.title} sold for 1 Coin.`);
  }

  function leaveThroughPortal() {
    if (!portalCanLeave) return notify("Activate the Realm Shrine before using the Portal.");
    setHealth((value) => Math.min(hero.maxHealth, value + 1));
    void applyTriggerEffects(clearTriggers("portal", triggerCtx));
    refreshSkills();
    if (hasSkill(triggerCtx, "skill-lemonade-stand")) setCoinSlots((slots) => adjustCoinSlots(slots, backpack, 2).slots);
    setSelectedCard(null); setSelectedCell(null); setEventState(null);
    setShopOpen(true);
    notify(hasSkill(triggerCtx, "skill-lemonade-stand") ? "Portal: +1 Health. Lemonade Stand: +2 Coins. Welcome to the Gift Shop." : "Portal: +1 Health. Welcome to the Gift Shop.");
  }

  async function finishShopping() {
    if (lootInbox.length > 0) return notify("Store or discard purchased Loot first.");
    setShopOpen(false);
    setSelectedCard(null); setSelectedCell(null); setEventState(null); setEnemy(null); setScoutRemaining(0);
    setCombatMods({ ...EMPTY_COMBAT_MODS }); setTrapMods({ ...EMPTY_TRAP_MODS }); setLastEnemyDamagedHero(false);
    if (realm < 3) {
      setRealm((value) => value + 1);
      notify(`Realm ${realm + 1} begins.`);
    } else {
      await startFinalMonster();
    }
  }

  async function revealLocation(cell: string) {
    if (!run || !map || phase !== "realm" || inventoryLocked || enemy) return; const key = `${realm}:${cell}`;
    if (scoutRemaining > 0 && !realmRevealed.includes(cell)) { const result = await postJson<{ card: FableCard }>("/api/fablefury/peek", { runId: run.run_id, realm, cell }); setScoutedByCell((v) => ({ ...v, [key]: result.card })); setScoutRemaining((v) => Math.max(0, v - 1)); setSelectedCard(result.card); setSelectedCell(cell); return; }
    if (realmRevealed.includes(cell) && cardsByCell[key]) { const card = cardsByCell[key]; setSelectedCard(card); setSelectedCell(cell); if (card.card_type === "event" || card.id.startsWith("trap-")) await prepareEvent(card, key); else if (card.card_type === "enemy") await prepareEnemy(card, key); else if (card.card_type === "special" && card.subtype === "shrine") await prepareShrine(card, key); return; }
    const allowed = realmRevealed.length === 0 ? cell === map.start_cell : realmRevealed.some((seen) => isAdjacent(seen, cell)); if (!allowed) return;
    const result = await postJson<RevealResult>("/api/fablefury/reveal", { runId: run.run_id, realm, cell }); setRevealed((v) => ({ ...v, [realm]: result.revealed })); setCardsByCell((v) => ({ ...v, [key]: result.card })); setSelectedCard(result.card); setSelectedCell(cell);
    if (result.card.card_type === "event" || result.card.id.startsWith("trap-")) await prepareEvent(result.card, key); else if (result.card.card_type === "enemy") await prepareEnemy(result.card, key); else if (result.card.card_type === "special" && result.card.subtype === "shrine") await prepareShrine(result.card, key);
  }

  function resetRun() { setPhase("hero"); setRun(null); setStartingToken(null); setTargetNumber(null); setHealth(hero.startingHealth); setArmor(hero.startingArmor); setAttackDice(hero.startingAttackDice); setCoinSlots([0,0,0]); setTokens({ ...EMPTY_TOKENS }); setBackpack([null,null,null]); setSkills([null,null,null]); setSkillFaceUp([true,true,true]); setSkillUse(null); setSkillRoll(null); setSkillDraft(null); setSkillPaymentSlots([]); setTrapMods({ ...EMPTY_TRAP_MODS }); setLastEnemyDamagedHero(false); setKnockoutHandled(false); setLootInbox([]); setRealmThreeShrineId(null); setGameWon(null); setEnemy(null); setSelectedCard(null); setEventState(null); setShopOpen(false); }

  const activeCells = map?.grid.active_cells ?? [];

  return <main className="min-h-screen bg-[#090d13] text-white">
    <div className="mx-auto max-w-[1500px] p-4 md:p-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[.22em] text-amber-300">Fable Fury · Solo Run</div><h1 className="text-2xl font-black tracking-[-.04em] text-[#fff2cf] md:text-4xl">Digital Table Prototype</h1></div>{phase !== "hero" && <button onClick={resetRun} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/55">New Run</button>}</header>
      {error && <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</div>}

      {phase === "hero" && <section className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{FABLE_HEROES.map((candidate) => <button key={candidate.id} onClick={() => setHeroId(candidate.id)} className={`overflow-hidden rounded-[24px] border text-left transition ${heroId === candidate.id ? "border-amber-300/70 bg-amber-300/10" : "border-white/10 bg-white/[.03]"}`}><img src={candidate.mat} alt={candidate.name} className="aspect-[4/3] w-full object-cover" /><div className="p-3"><div className="font-black">{candidate.name}</div><div className="text-xs text-white/45">{candidate.race} · {candidate.role}</div></div></button>)}</div><div className="rounded-[28px] border border-white/10 bg-white/[.035] p-5"><h2 className="text-2xl font-black text-[#fff2cf]">Set up {hero.name}</h2><p className="mt-2 text-sm text-white/50">Pick your starting Token and your Target Spot. In solo, an Enemy Targeted Attack only hits when its d6 matches your number unless its card overrides targeting.</p><div className="mt-5 grid grid-cols-3 gap-2">{(["lucky","crystal","healing"] as TokenKind[]).map((token) => <button key={token} onClick={() => setStartingToken(token)} className={`rounded-2xl border p-3 ${startingToken === token ? "border-amber-300 bg-amber-300/10" : "border-white/10"}`}><img src={FABLE_TOKEN_ART[token]} className="mx-auto h-16" alt={TOKEN_LABELS[token]} /><div className="mt-2 text-xs font-black">{TOKEN_LABELS[token]}</div></button>)}</div><div className="mt-5"><div className="text-[10px] font-black uppercase tracking-[.14em] text-white/40">Target Spot</div><div className="mt-2 grid grid-cols-6 gap-2">{[1,2,3,4,5,6].map((n) => <button key={n} onClick={() => setTargetNumber(n)} className={`grid aspect-square place-items-center rounded-xl border text-xl font-black ${targetNumber === n ? "border-amber-300 bg-amber-300 text-[#221607]" : "border-white/10 bg-black/20"}`}>{n}</button>)}</div></div><button disabled={!startingToken || !targetNumber || loading === "setup"} onClick={lockHeroAndDeal} className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-4 font-black text-[#231707] disabled:opacity-30">Lock Hero & Deal Starting Loot</button></div></section>}

      {phase === "gear" && <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div><img src={hero.mat} alt={hero.name} className="w-full rounded-[28px]" /><div className="mt-3 grid grid-cols-4 gap-2"><Stat art={FABLE_STAT_ART.health} label="Health" value={health} max={hero.maxHealth} /><Stat art={FABLE_STAT_ART.armor} label="Armor" value={armor} max={effectiveMaxArmor} /><Stat art={FABLE_STAT_ART.attackDice} label="Attack" value={attackDice} max={effectiveMaxDice} /><Stat art={FABLE_STAT_ART.coins} label="Target" value={targetNumber ?? 0} /></div></div><div><Backpack backpack={backpack} coinSlots={coinSlots} tokens={tokens} onUseLoot={openLoot} onUseToken={useToken} />{lootInbox.map((card, index) => <div key={`${card.id}-${index}`} className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-white/[.04] p-4 sm:grid-cols-[130px_1fr]"><CardImage card={card} className="w-full rounded-xl" /><div><div className="font-black">Starting Loot: {card.title}</div><div className="mt-3 grid grid-cols-3 gap-2">{[0,1,2].map((slot) => <button key={slot} disabled={coinSlots[slot] > 0 || !!backpack[slot]} onClick={() => packLoot(index, slot)} className="rounded-xl border border-white/10 p-2 text-xs font-bold disabled:opacity-25">Pocket {slot + 1}</button>)}</div><button onClick={() => discardInbox(index)} className="mt-2 text-xs text-white/40">Discard</button></div></div>)}<button disabled={lootInbox.length > 0} onClick={() => setPhase("realm")} className="mt-5 w-full rounded-2xl bg-amber-300 px-5 py-4 font-black text-[#231707] disabled:opacity-30">Enter Realm 1</button></div></section>}

      {phase === "realm" && run && map && <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"><div><div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#d7c293] shadow-2xl"><img src={FABLE_BOARD_ART} alt="Fable Fury game board" className="w-full" />{activeCells.map((cell) => { const key = `${realm}:${cell}`; const card = cardsByCell[key] ?? scoutedByCell[key]; const explored = realmRevealed.includes(cell); const scouted = !!scoutedByCell[key] && !explored; const reachable = realmRevealed.length === 0 ? cell === map.start_cell : realmRevealed.some((seen) => isAdjacent(seen, cell)); return <button key={cell} onClick={() => revealLocation(cell)} disabled={!explored && !scouted && !reachable && scoutRemaining <= 0} className={`absolute z-20 w-[8.4%] -translate-x-1/2 -translate-y-1/2 transition hover:scale-110 disabled:opacity-35 ${reachable || scoutRemaining > 0 ? "drop-shadow-[0_0_10px_rgba(255,226,111,.95)]" : ""}`} style={boardCellPosition(cell)}>{card && (explored || scouted) ? <CardImage card={card} className="w-full rounded-md" /> : <img src={FABLE_CARD_BACKS.location} alt="Hidden Location" className="w-full rounded-md" />}<span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-1.5 py-0.5 text-[7px] font-black">{cell}</span></button>; })}</div>{mapImage && <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-3"><img src={mapImage} alt={map.name} className="w-28 rounded-lg" /><div><div className="text-[10px] font-black uppercase tracking-[.14em] text-amber-300">Realm {realm} Map</div><div className="font-black">{map.name}</div><div className="text-xs text-white/40">Start {map.start_cell} · {realmRevealed.length}/14 explored</div></div></div>}</div><aside className="space-y-4"><div className="rounded-[24px] border border-white/10 bg-white/[.035] p-4"><div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[.14em] text-amber-300">{hero.name}</div><div className="text-xs text-white/45">{hero.race} · Target Spot {targetNumber}</div></div><div className="text-xs font-black text-white/40">1 Core + {attackDice} Attack = {1 + attackDice} dice</div></div><div className="mt-3 grid grid-cols-3 gap-2"><Stat art={FABLE_STAT_ART.health} label="Health" value={health} max={hero.maxHealth} /><Stat art={FABLE_STAT_ART.armor} label="Armor" value={armor} max={effectiveMaxArmor} /><Stat art={FABLE_STAT_ART.attackDice} label="Attack" value={attackDice} max={effectiveMaxDice} /></div><div className="mt-4"><SkillRack skills={skills} faceUp={skillFaceUp} disabledColors={disabledSkillColors} onUse={openSkill} /></div></div><Backpack backpack={backpack} coinSlots={coinSlots} tokens={tokens} onUseLoot={openLoot} onUseToken={useToken} />{lootInbox.length > 0 && <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3"><div className="text-xs font-black text-amber-100">Loot waiting — store or discard before travelling.</div>{lootInbox.map((card, i) => <div key={`${card.id}-${i}`} className="mt-2 flex items-center gap-2"><CardImage card={card} className="h-20 rounded" /><div className="flex-1"><div className="text-xs font-black">{card.title}</div><div className="mt-1 flex gap-1">{[0,1,2].map((slot) => <button key={slot} disabled={coinSlots[slot] > 0 || !!backpack[slot]} onClick={() => packLoot(i, slot)} className="rounded bg-white/10 px-2 py-1 text-[9px] disabled:opacity-20">P{slot+1}</button>)}<button onClick={() => discardInbox(i)} className="rounded bg-white/5 px-2 py-1 text-[9px]">Discard</button></div></div></div>)}</div>}<div className="rounded-2xl border border-white/10 bg-white/[.03] p-3"><div className="text-[9px] font-black uppercase tracking-[.14em] text-white/35">Board Supply</div><div className="mt-2 grid grid-cols-5 gap-2">{Object.entries(FABLE_SHOP_ART).map(([name, art]) => <img key={name} src={art} alt={name} className="h-10 w-10 object-contain" />)}</div></div></aside></section>}
    </div>

    {toast && <div className="fixed bottom-5 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-[#fff0bd] px-5 py-3 text-sm font-black text-[#271a0c] shadow-2xl">{toast}</div>}

    {selectedCard && !enemy && !skillDraft && <ModalShell z="z-[200]"><section className="grid w-full max-w-[1120px] gap-6 md:grid-cols-[410px_1fr]"><FlipCard card={selectedCard} /><div className="rounded-[28px] border border-white/10 bg-[#111821] p-6"><div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">{typeLabel(selectedCard)}</div><h2 className="mt-2 text-4xl font-black text-[#fff2cf]">{selectedCard.title}</h2>{selectedCard.rules_text && <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-white/70">{selectedCard.rules_text}</p>}{eventState ? <EventControls state={eventState} coins={coins} tokens={tokens} onRoll={() => setEventState((v) => v ? { ...v, roll: rollD6() } : v)} onLucky={() => useToken("lucky")} onAccept={async () => { const s = eventState; if (s.roll == null) return; if (s.plan.kind === "roll") await resolveEvent(s.plan.resolve(s.roll), s.roll); else if (s.plan.kind === "pickNumber" && s.pick) await resolveEvent(s.plan.resolve(s.pick, s.roll), s.roll, s.pick); else if (s.plan.kind === "optionalRoll") await resolveEvent([...s.plan.cost, ...s.plan.resolve(s.roll)], s.roll); }} onChoice={(effects) => resolveEvent(effects)} onSkip={() => eventState.plan.kind === "optionalRoll" && resolveEvent(eventState.plan.skipEffects ?? [])} onPick={(n) => setEventState((v) => v ? { ...v, pick: n } : v)} onContinue={() => { setSelectedCard(null); setSelectedCell(null); setEventState(null); }} /> : selectedCard.id === "special-portal" ? <PortalControls canLeave={portalCanLeave} onStay={() => { setSelectedCard(null); setSelectedCell(null); }} onLeave={leaveThroughPortal} /> : selectedCard.card_type === "special" && selectedCard.subtype === "shrine" ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">Shrine rewards applied. Choose your Skill from the Skill draft.</div> : <button onClick={() => { setSelectedCard(null); setSelectedCell(null); }} className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-3 font-black text-[#231707]">Continue</button>}<div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3"><div className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-white/35">Skills · click to use</div><SkillRack skills={skills} faceUp={skillFaceUp} disabledColors={disabledSkillColors} onUse={openSkill} compact /></div></div></section></ModalShell>}

    {lootUse && <ModalShell z="z-[350]"><section className="grid w-full max-w-[850px] gap-5 md:grid-cols-[300px_1fr]"><CardImage card={lootUse.card} className="w-full rounded-[24px]" /><div className="rounded-[28px] border border-white/10 bg-[#111821] p-6"><div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Use Loot</div><h2 className="mt-2 text-3xl font-black">{lootUse.card.title}</h2><p className="mt-3 text-sm text-white/60">{lootUse.card.rules_text}</p><div className="mt-5 grid gap-2">{getLootPlan(lootUse.card.id, { race: hero.race, health, maxHealth: hero.maxHealth, armor, maxArmor: effectiveMaxArmor, attackDice, maxAttackDice: effectiveMaxDice, coins, hasCoreRoll: !!eventState?.roll || !!enemy?.setupRoll, trapPending: !!eventState?.card.id.startsWith("trap-") && eventState.status === "pending", skillCount: skills.filter(Boolean).length }).options.map((option, index) => { const ctx = { race: hero.race, health, maxHealth: hero.maxHealth, armor, maxArmor: effectiveMaxArmor, attackDice, maxAttackDice: effectiveMaxDice, coins, hasCoreRoll: !!eventState?.roll || !!enemy?.setupRoll, trapPending: !!eventState?.card.id.startsWith("trap-") && eventState.status === "pending", skillCount: skills.filter(Boolean).length }; const disabled = option.requires ? !option.requires(ctx) : false; return <button key={index} disabled={disabled} onClick={() => applyLoot(lootUse, option.effects)} className="rounded-2xl bg-amber-300 px-4 py-3 text-left font-black text-[#231707] disabled:opacity-30">{option.label}{disabled && option.unavailableText ? <span className="block text-[10px] font-semibold opacity-60">{option.unavailableText}</span> : null}</button>; })}</div><button onClick={() => setLootUse(null)} className="mt-3 w-full rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/50">Cancel</button></div></section></ModalShell>}

    {skillUse && (() => {
      const status = skillUseStatus(skillUse.slot, skillUse.card);
      const behavior = skillBehavior(skillUse.card);
      const lootCost = skillLootCost(skillUse.card.id);
      const dieSkill = ["skill-be-better", "skill-extra-inch", "skill-gaming-the-system", "skill-mediocre", "skill-polymorph"].includes(skillUse.card.id);
      const targets = currentDieTargets().filter((target) => skillUse.card.id === "skill-be-better" ? target.value === 1 : skillUse.card.id === "skill-polymorph" ? target.value === 2 : skillUse.card.id === "skill-extra-inch" ? target.value < 6 : true);
      const enoughLootSelected = lootCost === 0 || [...new Set(skillPaymentSlots)].filter((slot) => !!backpack[slot]).length >= lootCost;
      return <ModalShell z="z-[650]"><section className="grid w-full max-w-[920px] gap-5 md:grid-cols-[300px_1fr]"><div><CardImage card={skillUse.card} className="w-full rounded-[24px]" /><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[.12em] text-white/50">{behavior}</span>{skillUsesFlip(skillUse.card) && <span className="rounded-full bg-fuchsia-300/15 px-3 py-1 text-[9px] font-black uppercase tracking-[.12em] text-fuchsia-200">Flip when used</span>}</div></div><div className="rounded-[28px] border border-white/10 bg-[#111821] p-6"><div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Skill</div><h2 className="mt-2 text-3xl font-black text-[#fff2cf]">{skillUse.card.title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/65">{skillUse.card.rules_text}</p>{!status.enabled && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/50">{status.reason}</div>}{lootCost > 0 && <div className="mt-5"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/40">Choose {lootCost} Loot to pay</div><div className="mt-2 grid grid-cols-3 gap-2">{backpack.map((card, slot) => <button key={slot} disabled={!card} onClick={() => setSkillPaymentSlots((current) => current.includes(slot) ? current.filter((value) => value !== slot) : current.length < lootCost ? [...current, slot] : current)} className={`rounded-xl border p-2 disabled:opacity-20 ${skillPaymentSlots.includes(slot) ? "border-amber-300 bg-amber-300/10" : "border-white/10"}`}>{card ? <><CardImage card={card} className="mx-auto h-28 rounded-lg" /><div className="mt-1 truncate text-[9px] font-black">{card.title}</div></> : <div className="grid h-28 place-items-center text-[9px] text-white/20">Empty</div>}</button>)}</div></div>}{dieSkill && <div className="mt-5"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/40">Choose a die</div>{targets.length ? <div className="mt-2 flex flex-wrap gap-2">{targets.map((target, index) => <button key={`${target.source}-${target.index ?? 0}-${index}`} disabled={!status.enabled} onClick={() => applyDieSkill(skillUse.slot, target)} className="rounded-xl border border-white/10 bg-black/20 p-3 text-left disabled:opacity-30"><div className="text-[9px] text-white/40">{target.label}</div><div className="mt-1 text-3xl font-black text-[#fff2cf]">{target.value}</div></button>)}</div> : <div className="mt-2 text-xs text-white/40">No eligible die is visible right now.</div>}</div>}{!dieSkill && <button disabled={!status.enabled || !enoughLootSelected} onClick={() => executeSkillUse(skillUse.slot)} className="mt-5 w-full rounded-2xl bg-amber-300 px-5 py-4 font-black text-[#231707] disabled:opacity-30">Use Skill</button>}<button onClick={() => { setSkillUse(null); setSkillPaymentSlots([]); }} className="mt-3 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/50">Cancel</button></div></section></ModalShell>;
    })()}

    {skillDraft && <ModalShell z="z-[400]"><section className="w-full max-w-[1050px] rounded-[28px] border border-white/10 bg-[#111821] p-6"><h2 className="text-3xl font-black text-[#fff2cf]">{skillDraft.title}</h2>{skillDraft.stage === "slot" && <div className="mt-5 grid grid-cols-3 gap-3">{skills.map((skill, i) => <button key={i} disabled={!skill} onClick={async () => { if (!skillDraft) return; if (skillDraft.color === "any") setSkillDraft({ ...skillDraft, slot: i, stage: "color" }); else { const choices = await drawSkills(skillDraft.color as SkillColor, 3); setSkillDraft({ ...skillDraft, slot: i, choices, stage: "choices" }); } }} className="rounded-2xl border border-white/10 p-3 disabled:opacity-25">{skill ? <CardImage card={skill} className="mx-auto h-48 rounded" /> : "Empty"}</button>)}</div>}{skillDraft.stage === "color" && <div className="mt-5 grid grid-cols-4 gap-2">{(["red","blue","green","yellow"] as SkillColor[]).map((color) => <button key={color} onClick={async () => { const choices = await drawSkills(color, 3); setSkillDraft((v) => v ? { ...v, color, choices, stage: "choices" } : v); }} className="rounded-2xl border border-white/10 p-4 font-black capitalize">{color}</button>)}</div>}{skillDraft.stage === "choices" && <div className="mt-5 grid gap-4 md:grid-cols-3">{skillDraft.choices.map((card) => <button key={card.id} onClick={() => chooseSkill(card)} className="rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-amber-300/60"><CardImage card={card} className="mx-auto max-h-[480px] rounded-xl" /></button>)}</div>}{skillDraft.mode === "replace" && <button onClick={() => setSkillDraft(null)} className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/55">Keep current Skills</button>}</section></ModalShell>}

    {enemy && <EnemyModal enemy={enemy} heroName={hero.name} heroHealth={health} heroArmor={armor} heroAttackDice={attackDice} targetNumber={targetNumber ?? 1} tokens={tokens} combatMods={combatMods} skills={skills} skillFaceUp={skillFaceUp} onUseSkill={openSkill} triggerCtx={triggerCtx} coins={coins} onUseLoot={openLoot} backpack={backpack} coinSlots={coinSlots} onUseToken={useToken} onAdvanceSetup={advanceEnemySetup} onSetupRoll={() => setEnemy((v) => v ? { ...v, setupRoll: rollD6() } : v)} onResolveSetupRoll={resolveSetupRoll} onRollHero={rollHeroAttack} onRerollDie={rerollCombatDie} onPolymorph={polymorphDie} onResolveHero={resolveHeroAttack} onBeginEnemy={beginEnemyTurn} onEnemyAction={executeEnemyAction} onResolveTarget={resolveTargetedAttack} onChoice={applyEnemyChoice} onClaim={claimReward} />}

    {shopOpen && <ShopModal realm={realm} coins={coins} armor={armor} maxArmor={effectiveMaxArmor} armorCost={shopArmorCost} attackDice={attackDice} maxAttackDice={effectiveMaxDice} backpack={backpack} coinSlots={coinSlots} lootInbox={lootInbox} onBuyToken={buyShopToken} onBuyLoot={buyShopLoot} onBuyAttackDice={buyShopAttackDie} onBuyArmor={buyShopArmor} onSellLoot={sellShopLoot} onPackLoot={packLoot} onDiscardLoot={discardInbox} onFinish={finishShopping} />}

    {skillRoll && <ModalShell z="z-[600]"><section className="grid w-full max-w-[850px] gap-5 md:grid-cols-[280px_1fr]"><CardImage card={skillRoll.card} className="w-full rounded-[24px]" /><div className="rounded-[28px] border border-white/10 bg-[#111821] p-6"><div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Skill Core Roll</div><h2 className="mt-2 text-3xl font-black">{skillRoll.card.title}</h2><p className="mt-2 text-sm text-white/50">Core Roll {skillRoll.requirement}+ to apply this Skill.</p>{skillRoll.roll == null ? <button onClick={() => setSkillRoll((state) => state ? { ...state, roll: rollD6() } : state)} className="mt-5 rounded-2xl bg-amber-300 px-6 py-3 font-black text-[#231707]">Roll Core Die</button> : <><div className="mt-5 flex items-center gap-3"><div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#fff2cf] text-4xl font-black text-[#231707]">{skillRoll.roll}</div><button disabled={tokens.lucky <= 0} onClick={() => useToken("lucky")} className="rounded-xl border border-white/10 px-4 py-3 text-xs font-black text-amber-300 disabled:opacity-30">Lucky reroll</button></div><div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3"><div className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-white/35">Dice Skills may modify this roll</div><SkillRack skills={skills} faceUp={skillFaceUp} disabledColors={disabledSkillColors} onUse={openSkill} compact /></div><button onClick={resolveSkillRoll} className="mt-4 w-full rounded-2xl bg-amber-300 px-5 py-3 font-black text-[#231707]">Accept {skillRoll.roll}</button></>}</div></section></ModalShell>}

    {reactionRoll && <ModalShell z="z-[500]"><div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#111821] p-6 text-center"><h3 className="text-xl font-black">{reactionRoll.label}</h3>{reactionRoll.roll == null ? <button onClick={() => setReactionRoll((v) => v ? { ...v, roll: rollD6() } : v)} className="mt-5 rounded-2xl bg-amber-300 px-6 py-3 font-black text-[#231707]">Roll Core Die</button> : <><div className="mx-auto mt-5 grid h-20 w-20 place-items-center rounded-2xl bg-[#fff2cf] text-4xl font-black text-[#231707]">{reactionRoll.roll}</div><div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-left"><div className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-white/35">Dice Skills may modify this roll</div><SkillRack skills={skills} faceUp={skillFaceUp} disabledColors={disabledSkillColors} onUse={openSkill} compact /></div><div className="mt-4 grid grid-cols-2 gap-2"><button disabled={tokens.lucky <= 0} onClick={() => useToken("lucky")} className="rounded-xl border border-white/10 p-3 font-bold disabled:opacity-30">Lucky reroll</button><button onClick={resolveReactionRoll} className="rounded-xl bg-amber-300 p-3 font-black text-[#231707]">Accept</button></div></>}</div></ModalShell>}
  </main>;
}

function EventControls({ state, coins, tokens, onRoll, onLucky, onAccept, onChoice, onSkip, onPick, onContinue }: { state: EventState; coins: number; tokens: TokenCounts; onRoll: () => void; onLucky: () => void; onAccept: () => void; onChoice: (effects: EventEffect[]) => void; onSkip: () => void; onPick: (n: number) => void; onContinue: () => void }) {
  const plan = state.plan;
  if (state.status === "resolved") return <div className="mt-5"><div className="grid gap-2">{state.messages.map((m,i) => <div key={i} className="rounded-xl bg-black/20 p-3 text-xs text-white/60">{m}</div>)}</div><button onClick={onContinue} className="mt-4 w-full rounded-2xl bg-amber-300 p-3 font-black text-[#231707]">Continue</button></div>;
  if (state.status === "resolving") return <div className="mt-5 rounded-xl bg-amber-300/10 p-4 text-sm font-bold">Resolving…</div>;
  if (state.roll != null) return <div className="mt-5"><div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#fff2cf] text-4xl font-black text-[#231707]">{state.roll}</div><div className="mt-3 grid grid-cols-2 gap-2"><button disabled={tokens.lucky <= 0} onClick={onLucky} className="rounded-xl border border-white/10 p-3 font-bold disabled:opacity-25">Lucky reroll</button><button onClick={onAccept} className="rounded-xl bg-amber-300 p-3 font-black text-[#231707]">Accept {state.roll}</button></div></div>;
  if (plan.kind === "choice") return <div className="mt-5"><div className="text-sm text-white/55">{plan.prompt}</div><div className="mt-3 grid gap-2">{plan.options.map((option, i) => <button key={i} disabled={!requirementMet(option.requires, { health: 99, armor: 99, attackDice: 99, coins, lootCount: 99, lootNames: [] })} onClick={() => onChoice(option.effects)} className="rounded-xl bg-amber-300 p-3 text-left font-black text-[#231707] disabled:opacity-25">{option.label}</button>)}</div></div>;
  if (plan.kind === "pickNumber") return <div className="mt-5"><div className="text-sm text-white/55">{plan.prompt}</div><div className="mt-3 grid grid-cols-6 gap-2">{[1,2,3,4,5,6].map((n) => <button key={n} onClick={() => onPick(n)} className={`rounded-xl border p-3 font-black ${state.pick === n ? "border-amber-300 bg-amber-300 text-[#231707]" : "border-white/10"}`}>{n}</button>)}</div><button disabled={!state.pick} onClick={onRoll} className="mt-3 w-full rounded-xl bg-amber-300 p-3 font-black text-[#231707] disabled:opacity-25">Roll Core Die</button></div>;
  if (plan.kind === "optionalRoll") return <div className="mt-5"><div className="text-sm text-white/55">{plan.prompt}</div><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={onRoll} className="rounded-xl bg-amber-300 p-3 font-black text-[#231707]">{plan.payLabel}</button><button onClick={onSkip} className="rounded-xl border border-white/10 p-3 font-bold">{plan.skipLabel}</button></div></div>;
  return <button onClick={onRoll} className="mt-5 w-full rounded-xl bg-amber-300 p-3 font-black text-[#231707]">Roll Core Die</button>;
}

function EnemyModal({ enemy, heroName, heroHealth, heroArmor, heroAttackDice, targetNumber, tokens, combatMods, skills, skillFaceUp, onUseSkill, triggerCtx, coins, onUseLoot, backpack, coinSlots, onUseToken, onAdvanceSetup, onSetupRoll, onResolveSetupRoll, onRollHero, onRerollDie, onPolymorph, onResolveHero, onBeginEnemy, onEnemyAction, onResolveTarget, onChoice, onClaim }: {
  enemy: EnemyCombatState; heroName: string; heroHealth: number; heroArmor: number; heroAttackDice: number; targetNumber: number; tokens: TokenCounts; combatMods: CombatMods; skills: Array<FableCard | null>; skillFaceUp: boolean[]; onUseSkill: (slot: number) => void; triggerCtx: { heroId: string; skills: Array<FableCard | null>; disabledSkillColors?: SkillColor[] }; coins: number; onUseLoot: (slot:number)=>void; backpack:Array<FableCard|null>; coinSlots:number[]; onUseToken:(token:TokenKind)=>void; onAdvanceSetup:(effects?:EnemyEffect[])=>void; onSetupRoll:()=>void; onResolveSetupRoll:()=>void; onRollHero:()=>void; onRerollDie:(index:number,free?:boolean)=>void; onPolymorph:(index:number)=>void; onResolveHero:()=>void; onBeginEnemy:()=>void; onEnemyAction:()=>void; onResolveTarget:()=>void; onChoice:(index:number)=>void; onClaim:()=>void;
}) {
  const data = enemyData(enemy.card); const attack = data.attacks[enemy.actionIndex]; const step = enemy.setup[enemy.setupIndex]; const counts = enemy.dice ? diceCounts(enemy.dice) : new Map<number,number>(); const hasBeBetter = hasSkill(triggerCtx, "skill-be-better"); const hasPolymorph = hasSkill(triggerCtx, "skill-polymorph");
  return <ModalShell z="z-[300]"><section className="grid w-full max-w-[1320px] gap-5 xl:grid-cols-[380px_1fr_340px]"><div className="rounded-[28px] border border-white/10 bg-[#111821] p-4"><CardImage card={enemy.card} className="w-full rounded-[22px]" /><div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-xl bg-red-400/10 p-3 text-center"><div className="text-[9px] font-black uppercase text-red-200/60">Health × Party</div><div className="text-2xl font-black text-red-200">{enemy.health}/{enemy.maxHealth}</div></div><div className="rounded-xl bg-orange-400/10 p-3 text-center"><div className="text-[9px] font-black uppercase text-orange-200/60">Damage</div><div className="text-2xl font-black text-orange-200">{enemy.damage}</div></div><div className="rounded-xl bg-cyan-400/10 p-3 text-center"><div className="text-[9px] font-black uppercase text-cyan-200/60">Agility</div><div className="text-2xl font-black text-cyan-200">{enemy.agility}+</div></div></div><div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 p-3"><div><div className="text-[9px] font-black uppercase text-white/30">Initiative</div><div className="font-black">{data.haste ? "⚡ Haste — Enemy first" : "Heroes first"}</div></div><div className="text-right"><div className="text-[9px] font-black uppercase text-white/30">Reward</div><div className="font-black text-amber-300">{data.rewards || "None"}</div></div></div></div><div className="rounded-[28px] border border-white/10 bg-[#111821] p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">{enemy.card.difficulty} {enemy.card.race}</div><h2 className="text-4xl font-black text-[#fff2cf]">{enemy.card.title}</h2></div><div className={`rounded-full px-4 py-2 text-xs font-black uppercase ${enemy.phase === "hero" ? "bg-emerald-300 text-[#102319]" : enemy.phase.startsWith("enemy") ? "bg-red-300 text-[#291010]" : "bg-amber-300 text-[#271a0b]"}`}>{enemy.phase}</div></div><div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-white/35">{data.action_name ?? "Special Action"}</div><div className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-white/70">{enemy.card.rules_text || "No special action."}</div></div><div className="mt-4 grid grid-cols-3 gap-2">{data.attacks.map((a,i) => <div key={`${a.name}-${i}`} className={`rounded-2xl border p-3 ${i === enemy.actionIndex && enemy.phase !== "setup" ? "border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-black/20"}`}><div className="text-[9px] font-black uppercase text-white/35">Turn {i+1} · {a.type}</div><div className="mt-1 font-black">{a.name}</div><div className="mt-1 text-[10px] text-white/45">{(a.effects ?? []).join(" · ") || (a.type === "[TA]" ? "Targeted Attack" : a.type === "[AA]" ? "Attack Everyone" : "Stat action")}</div></div>)}</div>
      {enemy.phase === "setup" && <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">{step ? <>{step.kind === "auto" && <><div className="font-black">Setup effect</div><button onClick={() => onAdvanceSetup(step.effects)} className="mt-3 rounded-xl bg-amber-300 px-4 py-3 font-black text-[#231707]">Apply & Continue</button></>}{step.kind === "choice" && <><div className="font-black">{step.prompt}</div><div className="mt-3 grid gap-2">{step.options.map((o,i) => <button key={i} disabled={(o.requiresCoins ?? 0) > coins || (o.requiresArmor ?? 0) > heroArmor || (o.requiresLoot ?? 0) > backpack.filter(Boolean).length} onClick={() => onAdvanceSetup(o.effects)} className="rounded-xl bg-amber-300 p-3 text-left font-black text-[#231707] disabled:opacity-25">{o.label}</button>)}</div></>}{step.kind === "roll" && <><div className="font-black">{step.prompt}</div>{enemy.setupRoll == null ? <button onClick={onSetupRoll} className="mt-3 rounded-xl bg-amber-300 px-4 py-3 font-black text-[#231707]">Roll Core Die</button> : <div className="mt-3 flex items-center gap-3"><Die value={enemy.setupRoll} onLucky={() => onUseToken("lucky")} lucky={tokens.lucky} /><button onClick={onResolveSetupRoll} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-[#231707]">Accept {enemy.setupRoll}</button></div>}</>}</> : <button onClick={() => onAdvanceSetup()} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-[#231707]">Begin Combat</button>}</div>}
      {enemy.choice && <div className="mt-5 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-4"><div className="font-black">{enemy.choice.prompt}</div><div className="mt-3 grid gap-2">{enemy.choice.options.map((o,i) => <button key={i} disabled={o.disabled} onClick={() => onChoice(i)} className="rounded-xl bg-fuchsia-200 p-3 text-left font-black text-[#2a1430] disabled:opacity-25">{o.label}</button>)}</div></div>}
      {enemy.phase === "hero" && !enemy.choice && <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4"><div className="font-black">{heroName}'s turn · Roll 1 Core Die + {heroAttackDice + combatMods.attackDiceBonus} Attack Dice</div>{!enemy.dice ? <button onClick={onRollHero} className="mt-3 rounded-xl bg-emerald-300 px-5 py-3 font-black text-[#102319]">Roll {1 + heroAttackDice + combatMods.attackDiceBonus} Dice</button> : <><div className="mt-3 flex flex-wrap gap-2">{enemy.dice.map((die,i) => <Die key={i} value={Math.min(6, die + combatMods.attackRollBonus)} hit={Math.min(6, die + combatMods.attackRollBonus) >= enemy.agility} onLucky={() => onRerollDie(i)} lucky={tokens.lucky} extra={<div className="mt-1 space-y-1">{hasBeBetter && die === 1 && <button onClick={() => onRerollDie(i,true)} className="block w-full text-[8px] font-black uppercase text-emerald-300">Be Better: reroll</button>}{hasPolymorph && die === 2 && <button onClick={() => onPolymorph(i)} className="block w-full text-[8px] font-black uppercase text-cyan-300">Polymorph → 6</button>}</div>} />)}</div>{combatMods.rerollAttack && <div className="mt-2 text-xs text-amber-200">A Loot reroll is armed; Lucky Charm and passive rerolls are also available before resolving.</div>}<button onClick={onResolveHero} className="mt-3 rounded-xl bg-emerald-300 px-5 py-3 font-black text-[#102319]">Resolve Attack</button></>}</div>}
      {enemy.phase === "enemyStart" && !enemy.choice && <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/10 p-4"><div className="font-black">Enemy turn begins.</div><button onClick={onBeginEnemy} className="mt-3 rounded-xl bg-red-200 px-5 py-3 font-black text-[#291010]">Begin Enemy Turn</button></div>}
      {enemy.phase === "enemy" && !enemy.choice && <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/10 p-4"><div className="font-black">Turn {enemy.actionIndex + 1}: {attack?.name} {attack?.type}</div>{enemy.targetPending && enemy.targetRoll != null ? <div className="mt-3"><div className="text-xs text-white/55">Target Spot is {targetNumber}. The Enemy rolled:</div><div className="mt-2 flex items-center gap-3"><Die value={enemy.targetRoll} onLucky={() => onUseToken("lucky")} lucky={tokens.lucky} /><button onClick={onResolveTarget} className="rounded-xl bg-red-200 px-5 py-3 font-black text-[#291010]">Resolve Target</button></div></div> : <button onClick={onEnemyAction} className="mt-3 rounded-xl bg-red-200 px-5 py-3 font-black text-[#291010]">Resolve Enemy Action</button>}</div>}
      {enemy.phase === "victory" && <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5"><div className="text-2xl font-black text-amber-100">Enemy defeated!</div><p className="mt-2 text-sm text-white/55">In solo, the Party Leader receives the full reward. Clear-trigger Core Skills and Shrine Skills also fire now.</p><button onClick={onClaim} className="mt-4 rounded-xl bg-amber-300 px-5 py-3 font-black text-[#231707]">Claim Reward & Clear Location</button></div>}
      {enemy.phase === "defeat" && <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-5"><div className="text-2xl font-black text-red-100">{heroName} is knocked out.</div><div className="mt-2 text-sm text-white/50">KO flow/revival will be wired with the next systems pass.</div></div>}
      {enemy.messages.length > 0 && <div className="mt-5 max-h-36 space-y-1 overflow-y-auto">{enemy.messages.slice(-8).map((m,i) => <div key={i} className="rounded-lg bg-black/20 px-3 py-2 text-[11px] text-white/50">{m}</div>)}</div>}</div><div className="space-y-4"><div className="rounded-[24px] border border-white/10 bg-[#111821] p-4"><div className="text-[9px] font-black uppercase tracking-[.14em] text-amber-300">Your Hero</div><div className="mt-2 grid gap-2"><Stat art={FABLE_STAT_ART.health} label="Health" value={heroHealth} /><Stat art={FABLE_STAT_ART.armor} label="Armor" value={heroArmor} /><Stat art={FABLE_STAT_ART.attackDice} label="Attack Dice" value={heroAttackDice} /><Stat art={FABLE_STAT_ART.coins} label="Target Spot" value={targetNumber} /></div></div><Backpack backpack={backpack} coinSlots={coinSlots} tokens={tokens} onUseLoot={onUseLoot} onUseToken={onUseToken} /><div className="rounded-[24px] border border-white/10 bg-[#111821] p-4"><div className="text-[9px] font-black uppercase tracking-[.14em] text-white/35">Skills · click to use</div><div className="mt-2"><SkillRack skills={skills} faceUp={skillFaceUp} disabledColors={enemy.disabledSkillColors} onUse={onUseSkill} compact /></div></div></div></section></ModalShell>;
}
