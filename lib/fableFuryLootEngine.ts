import type { SkillColor } from "@/lib/fableFuryHeroes";

export type LootContext = {
  race: string;
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  attackDice: number;
  maxAttackDice: number;
  coins: number;
  hasCoreRoll: boolean;
  trapPending: boolean;
  skillCount: number;
};

export type LootEffect =
  | { type: "health"; amount: number }
  | { type: "armor"; amount: number }
  | { type: "attackDice"; amount: number }
  | { type: "coins"; amount: number | "all" }
  | { type: "scout"; count: number }
  | { type: "damage"; amount: number; targetRace?: "Dragon" | "Orc" | "Giant"; targetRaceAmount?: number; everyone?: boolean }
  | { type: "rerollCore" }
  | { type: "increaseCore"; amount: number }
  | { type: "dodgeTrap" }
  | { type: "attackDiceThisTurn"; amount: number }
  | { type: "attackRollBonus"; amount: number }
  | { type: "rerollAttack" }
  | { type: "targeting"; mode: "anyHero" | "self" }
  | { type: "enemyStat"; stat: "damage" | "agility"; amount: number }
  | { type: "rewardBonus"; amount: number }
  | { type: "recoverLoot"; count: number }
  | { type: "replaceSkill"; color: SkillColor | "any" }
  | { type: "note"; text: string };

export type LootOption = {
  label: string;
  effects: LootEffect[];
  requires?: (ctx: LootContext) => boolean;
  unavailableText?: string;
};

export type LootPlan = {
  prompt?: string;
  options: LootOption[];
};

const heal = (amount: number): LootEffect => ({ type: "health", amount });
const damage = (amount: number): LootEffect => ({ type: "damage", amount });
const note = (text: string): LootEffect => ({ type: "note", text });

function raceIs(ctx: LootContext, race: string) {
  return ctx.race.toLowerCase() === race.toLowerCase();
}

function one(label: string, effects: LootEffect[], requires?: LootOption["requires"], unavailableText?: string): LootPlan {
  return { options: [{ label, effects, requires, unavailableText }] };
}

export function getLootPlan(lootId: string, ctx: LootContext): LootPlan {
  switch (lootId) {
    case "loot-alarm-clock":
    case "loot-locket":
      return one("Use Loot", [{ type: "targeting", mode: "anyHero" }, note("The next Targeted Attack may target any Hero. In solo, this is stored for the next multiplayer-capable combat interaction.")]);
    case "loot-ale":
      return one(`Heal ${raceIs(ctx, "Dwarf") ? 4 : 2} Health`, [heal(raceIs(ctx, "Dwarf") ? 4 : 2)]);
    case "loot-attack-kitten":
      return one("Deal damage", [{ type: "damage", amount: 1, targetRace: "Dragon", targetRaceAmount: 3 }]);
    case "loot-ball-bearings":
    case "loot-flash-bang":
      return one("Deal 2 damage", [damage(2)]);
    case "loot-banquet":
    case "loot-feast":
      return one("Heal each Hero 1 Health", [heal(1), note("Solo: you are the only Hero, so you heal 1 Health.")]);
    case "loot-binoculars":
      return one("Reveal 2 Locations", [{ type: "scout", count: 2 }]);
    case "loot-blowgun":
    case "loot-jackhammer":
      return one("Deal damage", [{ type: "damage", amount: 1, targetRace: "Orc", targetRaceAmount: 3 }]);
    case "loot-beads-of-power":
      return one("Replace a Skill", [{ type: "replaceSkill", color: "any" }], (value) => value.skillCount > 0, "You need a Skill before you can replace one.");
    case "loot-charcuterie":
      return one(`Heal ${raceIs(ctx, "Human") ? 4 : 2} Health`, [heal(raceIs(ctx, "Human") ? 4 : 2)]);
    case "loot-chicken-rice":
    case "loot-lentils":
    case "loot-sundae":
    case "loot-tuna-melt":
      return one("Heal 2 Health", [heal(2)]);
    case "loot-cleats":
      return one("Dodge current Trap", [{ type: "dodgeTrap" }], (value) => value.trapPending, "Cleats can only be used while a Trap is waiting to resolve.");
    case "loot-coin-shrapnel":
      return one("Lose 1 Coin · Deal 2 damage", [{ type: "coins", amount: -1 }, damage(2)], (value) => value.coins >= 1, "You need at least 1 Coin.");
    case "loot-creatine":
      return one("Replace a Skill with Red", [{ type: "replaceSkill", color: "red" }], (value) => value.skillCount > 0, "You need a Skill before you can replace one.");
    case "loot-desk-job":
      return one("Lose 2 Health · Gain 4 Coins", [heal(-2), { type: "coins", amount: 4 }], (value) => value.health >= 2, "You need at least 2 Health.");
    case "loot-dueling-pickles":
      return one("Attack with 2 extra dice this turn", [{ type: "attackDiceThisTurn", amount: 2 }]);
    case "loot-earplugs":
    case "loot-headphones":
      return one("Gain 1 Armor", [{ type: "armor", amount: 1 }]);
    case "loot-eggs-bacon":
    case "loot-p-b-cheese":
      return one("Heal 3 Health", [heal(3)]);
    case "loot-enchantment":
      return one("Gain 1 Attack Die", [{ type: "attackDice", amount: 1 }]);
    case "loot-explosive-barrel":
      return one("Deal 4 damage to Everyone", [{ type: "damage", amount: 4, everyone: true }, note("Queued as an all-participants combat effect. The Enemy combat system will apply both sides when it is active.")]);
    case "loot-extra-limbs":
      return one("Increase all your attack dice by 1", [{ type: "attackRollBonus", amount: 1 }]);
    case "loot-foghorn":
      return ctx.hasCoreRoll
        ? one("Reroll current die", [{ type: "rerollCore" }, { type: "rerollAttack" }])
        : one("Arm an attack reroll", [{ type: "rerollAttack" }, note("No Core Roll is staged, so Foghorn is stored for your next combat roll.")]);
    case "loot-gold-dust":
      return one("Gain 3 Coins", [{ type: "coins", amount: 3 }]);
    case "loot-gum-string":
      return one("Recover top Loot from discard", [{ type: "recoverLoot", count: 1 }]);
    case "loot-gunpowder":
      return one("Deal 3 damage to Everyone", [{ type: "damage", amount: 3, everyone: true }, note("Queued as an all-participants combat effect. The Enemy combat system will apply both sides when it is active.")]);
    case "loot-gym-membership":
      return one("Replace a Skill with Yellow", [{ type: "replaceSkill", color: "yellow" }], (value) => value.skillCount > 0, "You need a Skill before you can replace one.");
    case "loot-herbal-tincture":
      return one("Heal 4 Health", [heal(4)]);
    case "loot-holy-hand-grenade":
    case "loot-roman-candle":
      return one("Deal damage", [{ type: "damage", amount: 1, targetRace: "Giant", targetRaceAmount: 3 }]);
    case "loot-homing-pigeons":
      return one("Reveal 3 Locations", [{ type: "scout", count: 3 }]);
    case "loot-coin-finder":
      return one("Gain 4 Coins", [{ type: "coins", amount: 4 }]);
    case "loot-magnet":
      return one("Increase next reward by 1", [{ type: "rewardBonus", amount: 1 }]);
    case "loot-zen-candles":
      return one("Reroll missed attack dice", [{ type: "rerollAttack" }]);
    case "loot-muffin":
    case "loot-baked-potato":
    case "loot-toast":
      return { prompt: "Choose one.", options: [{ label: "Heal 1 Health", effects: [heal(1)] }, { label: "Deal 1 damage", effects: [damage(1)] }] };
    case "loot-nurse-s-hat":
      return one("Replace a Skill with Green", [{ type: "replaceSkill", color: "green" }], (value) => value.skillCount > 0, "You need a Skill before you can replace one.");
    case "loot-pay-to-win":
      return one("Lose 2 Coins · Gain 1 Attack Die", [{ type: "coins", amount: -2 }, { type: "attackDice", amount: 1 }], (value) => value.coins >= 2, "You need at least 2 Coins.");
    case "loot-pinwheel":
    case "loot-sneeze":
      return one("Make next Targeted Attack target you", [{ type: "targeting", mode: "self" }]);
    case "loot-pool-noodles":
      return { prompt: "Choose one.", options: [{ label: "Gain 1 Armor", effects: [{ type: "armor", amount: 1 }] }, { label: "Deal 2 damage", effects: [damage(2)] }] };
    case "loot-protein-shake":
      return one("Replace a Skill with Blue", [{ type: "replaceSkill", color: "blue" }], (value) => value.skillCount > 0, "You need a Skill before you can replace one.");
    case "loot-rabbit-s-foot":
      return ctx.hasCoreRoll
        ? one("Increase current die by 1", [{ type: "increaseCore", amount: 1 }])
        : one("Increase next attack dice by 1", [{ type: "attackRollBonus", amount: 1 }, note("No Core Roll is staged, so Rabbit's Foot is stored for your next combat roll.")]);
    case "loot-roast-boar":
      return one(`Heal ${raceIs(ctx, "Dwarf") ? 2 : 1} Health`, [heal(raceIs(ctx, "Dwarf") ? 2 : 1)]);
    case "loot-snack-pack":
      return one(`Heal ${raceIs(ctx, "Human") ? 2 : 1} Health`, [heal(raceIs(ctx, "Human") ? 2 : 1)]);
    case "loot-stunner-glasses":
      return one("Reduce an Enemy damage stat by 1", [{ type: "enemyStat", stat: "damage", amount: -1 }]);
    case "loot-super-glue":
      return one("Reduce an Enemy agility stat by 1", [{ type: "enemyStat", stat: "agility", amount: -1 }]);
    case "loot-tomato-soup":
      return one(`Heal ${raceIs(ctx, "Elf") ? 2 : 1} Health`, [heal(raceIs(ctx, "Elf") ? 2 : 1)]);
    case "loot-torch":
      return { prompt: "Choose one.", options: [{ label: "Deal 3 damage", effects: [damage(3)] }, { label: "Reveal 3 Locations", effects: [{ type: "scout", count: 3 }] }] };
    case "loot-fruit-salad":
      return one(`Heal ${raceIs(ctx, "Elf") ? 4 : 2} Health`, [heal(raceIs(ctx, "Elf") ? 4 : 2)]);
    case "loot-wand-of-orcus":
      return one("Deal damage", [{ type: "damage", amount: 1, targetRace: "Dragon", targetRaceAmount: 3 }]);
    case "loot-yeet":
      return one(`Lose all ${ctx.coins} Coins · Deal ${ctx.coins} damage`, [{ type: "coins", amount: "all" }, { type: "damage", amount: ctx.coins }], (value) => value.coins > 0, "You need at least 1 Coin.");
    default:
      return one("Use Loot", [note("This Loot card is present in the deck but has no digital resolver yet.")]);
  }
}

export const FABLE_LOOT_IDS = Object.freeze([
  "loot-alarm-clock", "loot-ale", "loot-attack-kitten", "loot-ball-bearings", "loot-banquet", "loot-binoculars", "loot-blowgun", "loot-beads-of-power", "loot-charcuterie", "loot-chicken-rice", "loot-cleats", "loot-coin-shrapnel", "loot-creatine", "loot-desk-job", "loot-dueling-pickles", "loot-earplugs", "loot-eggs-bacon", "loot-enchantment", "loot-explosive-barrel", "loot-extra-limbs", "loot-feast", "loot-flash-bang", "loot-foghorn", "loot-gold-dust", "loot-gum-string", "loot-gunpowder", "loot-gym-membership", "loot-headphones", "loot-herbal-tincture", "loot-holy-hand-grenade", "loot-homing-pigeons", "loot-jackhammer", "loot-lentils", "loot-locket", "loot-coin-finder", "loot-magnet", "loot-zen-candles", "loot-muffin", "loot-nurse-s-hat", "loot-baked-potato", "loot-p-b-cheese", "loot-pay-to-win", "loot-pinwheel", "loot-pool-noodles", "loot-protein-shake", "loot-rabbit-s-foot", "loot-roast-boar", "loot-roman-candle", "loot-snack-pack", "loot-sneeze", "loot-stunner-glasses", "loot-sundae", "loot-super-glue", "loot-toast", "loot-tomato-soup", "loot-torch", "loot-tuna-melt", "loot-fruit-salad", "loot-wand-of-orcus", "loot-yeet",
]);
