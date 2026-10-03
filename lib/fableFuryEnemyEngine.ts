import type { SkillColor } from "@/lib/fableFuryHeroes";

export type EnemyAttack = {
  name: string;
  type: "[TA]" | "[AA]" | "[BA]" | string;
  effects?: string[];
};

export type EnemyData = {
  haste: boolean;
  health: number;
  damage: number;
  agility: number;
  attacks: EnemyAttack[];
  rewards: string;
  action_name?: string;
};

export type EnemyCardLike = {
  id: string;
  title: string;
  race?: string | null;
  rules_text?: string | null;
  data?: Record<string, unknown> | null;
};

export type EnemyContext = {
  race: string;
  health: number;
  armor: number;
  attackDice: number;
  coins: number;
  lootNames: string[];
};

export type EnemyEffect =
  | { type: "health"; amount: number }
  | { type: "armor"; amount: number }
  | { type: "attackDice"; amount: number }
  | { type: "coins"; amount: number }
  | { type: "drawLoot"; count: number }
  | { type: "discardLoot"; count: number }
  | { type: "enemyDamage"; amount: number }
  | { type: "enemyAgility"; amount: number }
  | { type: "enemyHeal"; amount: number }
  | { type: "disableSkills"; colors: SkillColor[] }
  | { type: "note"; text: string };

export type EnemySetupStep =
  | { kind: "auto"; effects: EnemyEffect[] }
  | { kind: "choice"; prompt: string; options: Array<{ label: string; effects: EnemyEffect[]; requiresCoins?: number; requiresArmor?: number; requiresLoot?: number }> }
  | { kind: "roll"; prompt: string; requirement: number; fail: EnemyEffect[]; pass?: EnemyEffect[] };

const note = (text: string): EnemyEffect => ({ type: "note", text });
const hasLoot = (ctx: EnemyContext, name: string) => ctx.lootNames.some((value) => value.toLowerCase() === name.toLowerCase());

export function enemyData(card: EnemyCardLike): EnemyData {
  const data = card.data ?? {};
  return {
    haste: Boolean(data.haste),
    health: Number(data.health ?? 1),
    damage: Number(data.damage ?? 1),
    agility: Number(data.agility ?? 6),
    attacks: Array.isArray(data.attacks) ? data.attacks as EnemyAttack[] : [],
    rewards: String(data.rewards ?? ""),
    action_name: typeof data.action_name === "string" ? data.action_name : undefined,
  };
}

export function setupSteps(card: EnemyCardLike, ctx: EnemyContext): EnemySetupStep[] {
  switch (card.id) {
    case "enemy-ashling":
    case "enemy-ashenfury":
      return [{ kind: "choice", prompt: `${card.title} demands a price during Setup.`, options: [
        { label: "Lose 1 Coin", effects: [{ type: "coins", amount: -1 }], requiresCoins: 1 },
        { label: "Lose 1 Health", effects: [{ type: "health", amount: -1 }] },
      ] }];
    case "enemy-snifflesnout":
      return [{ kind: "roll", prompt: "Setup: Core Roll 4+. Miss it and lose 1 Health.", requirement: 4, fail: [{ type: "health", amount: -1 }] }];
    case "enemy-vilefang":
    case "enemy-stormfork-grumlok":
      return [{ kind: "auto", effects: [{ type: "health", amount: -1 }] }];
    case "enemy-lethargic-larry":
    case "enemy-caveborn-conrad":
      return [{ kind: "auto", effects: [{ type: "drawLoot", count: 1 }] }];
    case "enemy-bossy-betty":
      return [{ kind: "auto", effects: [{ type: "health", amount: 1 }] }];
    case "enemy-bouldergut-grumlok":
      return [{ kind: "auto", effects: [{ type: "attackDice", amount: 1 }] }];
    case "enemy-rockscale":
      return [{ kind: "auto", effects: [{ type: "armor", amount: 1 }] }];
    case "enemy-watatsumi":
      return [{ kind: "auto", effects: [{ type: "disableSkills", colors: ["green", "blue"] }] }];
    case "enemy-zappscale":
      return [{ kind: "choice", prompt: "Setup: pay Zappscale or take the shock.", options: [
        { label: "Lose 1 Coin", effects: [{ type: "coins", amount: -1 }], requiresCoins: 1 },
        { label: "Lose 3 Health", effects: [{ type: "health", amount: -3 }] },
      ] }];
    case "enemy-bonecollector-bobby":
      return [{ kind: "choice", prompt: "Setup: give up Armor or take 4 Health damage.", options: [
        { label: "Lose 1 Armor", effects: [{ type: "armor", amount: -1 }], requiresArmor: 1 },
        { label: "Lose 4 Health", effects: [{ type: "health", amount: -4 }] },
      ] }];
    case "enemy-neanderthal-ned":
      return [{ kind: "auto", effects: [{ type: "disableSkills", colors: ["red", "yellow", "blue"] }] }];
    case "enemy-ironheart-vorgh":
      return [{ kind: "auto", effects: [{ type: "disableSkills", colors: ["green", "red"] }] }];
    case "enemy-jackhammer-urgosh":
      return hasLoot(ctx, "Jackhammer") ? [{ kind: "auto", effects: [{ type: "attackDice", amount: 1 }, note("Jackhammer Loot bonus: +1 Attack Die.")] }] : [];
    case "enemy-toxiclard":
      return [{ kind: "auto", effects: [{ type: "disableSkills", colors: ["yellow"] }] }];
    case "enemy-bonecrusher-bert":
      return [{ kind: "auto", effects: [{ type: "disableSkills", colors: ["blue"] }] }];
    case "enemy-fearsome-fred":
      return [{ kind: "choice", prompt: "Setup: discard Loot or lose 3 Health.", options: [
        { label: "Discard 1 Loot", effects: [{ type: "discardLoot", count: 1 }], requiresLoot: 1 },
        { label: "Lose 3 Health", effects: [{ type: "health", amount: -3 }] },
      ] }];
    case "enemy-stonebowler-steve":
      return [{ kind: "auto", effects: [{ type: "disableSkills", colors: ["red"] }] }];
    case "enemy-bonechewer-thrag":
      return [{ kind: "auto", effects: [{ type: "disableSkills", colors: ["green"] }] }];
    case "enemy-bonesmoker-slagg":
      return hasLoot(ctx, "Roast Boar") ? [{ kind: "auto", effects: [{ type: "health", amount: 5 }, note("Roast Boar bonus: +5 Health.")] }] : [];
    default:
      return [];
  }
}

export function targetIsDirected(card: EnemyCardLike) {
  const text = card.rules_text ?? "";
  return /\[TA\]\s*targets/i.test(text);
}

export function armorBlocksEnemy(card: EnemyCardLike) {
  return card.id !== "enemy-gorgeous-gilbert";
}

export function enemyTurnStart(card: EnemyCardLike): { kind: "auto"; effects: EnemyEffect[] } | { kind: "choice"; prompt: string; options: Array<{ label: string; effects: EnemyEffect[]; requiresAttackDice?: number }> } | null {
  switch (card.id) {
    case "enemy-snapdragon":
      return { kind: "auto", effects: [{ type: "health", amount: -1 }, note("Snapdragon: each Hero loses 1 Health when the Enemy turn begins.")] };
    case "enemy-youthful-yuri":
      return { kind: "auto", effects: [{ type: "enemyDamage", amount: 1 }, note("Youthful Yuri: Damage increases by 1 at the start of its turn.")] };
    case "enemy-rockmuncher-ron":
      return { kind: "choice", prompt: "Rockmuncher Ron: lose 1 Attack Die to heal 4 Health?", options: [
        { label: "Lose 1 Attack Die · Heal 4", effects: [{ type: "attackDice", amount: -1 }, { type: "health", amount: 4 }], requiresAttackDice: 1 },
        { label: "No thanks", effects: [] },
      ] };
    default:
      return null;
  }
}

export function buffEffects(attack: EnemyAttack): EnemyEffect[] {
  const effects: EnemyEffect[] = [];
  for (const raw of attack.effects ?? []) {
    const text = String(raw).trim();
    let match = text.match(/^(-?\d+)\s*\[S\]$/i);
    if (match) { effects.push({ type: "enemyDamage", amount: Number(match[1]) }); continue; }
    match = text.match(/^(-?\d+)\s*\[AG\]$/i);
    if (match) { effects.push({ type: "enemyAgility", amount: Number(match[1]) }); continue; }
    match = text.match(/^(\d+)\s*\[H\]$/i);
    if (match) { effects.push({ type: "enemyHeal", amount: Number(match[1]) }); continue; }
    effects.push(note(`Unmapped Enemy action effect: ${text}`));
  }
  return effects;
}

export type HeroRollReaction = {
  auto: EnemyEffect[];
  choice?: { prompt: string; options: Array<{ label: string; effects: EnemyEffect[]; requiresCoins?: number }> };
};

function hasDoubles(dice: number[]) {
  const counts = new Map<number, number>();
  for (const die of dice) counts.set(die, (counts.get(die) ?? 0) + 1);
  return [...counts.values()].some((count) => count >= 2);
}

export function heroRollReaction(card: EnemyCardLike, dice: number[], misses: number): HeroRollReaction {
  const auto: EnemyEffect[] = [];
  let choice: HeroRollReaction["choice"];
  if (card.id === "enemy-dreadfire" && misses > 0) auto.push({ type: "health", amount: -misses }, note(`Dreadfire: ${misses} missed die${misses === 1 ? "" : "s"} costs ${misses} Health.`));
  if (card.id === "enemy-warcaller-vorgh" && hasDoubles(dice)) auto.push({ type: "enemyDamage", amount: 1 }, note("Warcaller Vorgh: doubles increase Enemy Damage by 1."));
  if (card.id === "enemy-luckbeard") {
    const sixes = dice.filter((die) => die === 6).length;
    if (sixes) auto.push({ type: "health", amount: -sixes }, note(`Luckbeard: ${sixes} rolled 6${sixes === 1 ? "" : "s"} costs ${sixes} Health.`));
  }
  if (card.id === "enemy-frostfire" && hasDoubles(dice)) {
    choice = { prompt: "Frostfire: you rolled doubles. Lose 1 Coin or 2 Health.", options: [
      { label: "Lose 1 Coin", effects: [{ type: "coins", amount: -1 }], requiresCoins: 1 },
      { label: "Lose 2 Health", effects: [{ type: "health", amount: -2 }] },
    ] };
  }
  return { auto, choice };
}

export function afterEnemyAction(card: EnemyCardLike, attack: EnemyAttack, targetedMiss: boolean): { effects: EnemyEffect[]; killNoReward?: boolean } {
  const effects: EnemyEffect[] = [];
  if (card.id === "enemy-horned-harold" && attack.type === "[AA]") effects.push({ type: "enemyDamage", amount: 1 }, note("Horned Harold: All Attack ended, Damage +1."));
  if (card.id === "enemy-darkhide-shankul" && attack.type === "[TA]" && targetedMiss) effects.push({ type: "enemyDamage", amount: 1 }, note("Darkhide Shankul: Targeted Attack missed, Damage +1."));
  if (card.id === "enemy-unstable-grok" && attack.type === "[AA]") return { effects: [note("Go Boom: Unstable Grok dies after its All Attack and drops no reward.")], killNoReward: true };
  return { effects };
}

export type Reward = { kind: "coins" | "healing" | "crystal" | "lucky" | "loot" | "armor" | "attackDice" | "none"; amount: number };

export function parseReward(card: EnemyCardLike): Reward {
  const text = enemyData(card).rewards.trim();
  const match = text.match(/^(\d+)\s*\[([^\]]+)\]$/);
  if (!match) return { kind: "none", amount: 0 };
  const amount = Number(match[1]);
  const token = match[2].toUpperCase();
  if (token === "C") return { kind: "coins", amount };
  if (token === "HP") return { kind: "healing", amount };
  if (token === "CB") return { kind: "crystal", amount };
  if (token === "LC") return { kind: "lucky", amount };
  if (token === "L") return { kind: "loot", amount };
  if (token === "A") return { kind: "armor", amount };
  if (token === "D") return { kind: "attackDice", amount };
  return { kind: "none", amount: 0 };
}
