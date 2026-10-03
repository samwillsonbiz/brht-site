import type { EventContext, EventEffect, EventPlan } from "@/lib/fableFuryEventEngine";

export type TrapContext = EventContext & {
  race: string;
  trapRequirementDelta?: number;
  trapRequirementOverride?: number | null;
  trapDamageDelta?: number;
};

type TrapRule = {
  requirement: number;
  damage: number;
  raceRequirement?: { race: "Elf" | "Human" | "Dwarf"; requirement: number };
  autoDodgeArmorAtOrBelow?: number;
  spendArmorToDodge?: boolean;
  autoDodgeLoot?: string;
  failCoins?: number;
  failAttackDice?: number;
  disabledSkillColor?: "blue" | "green";
  partyFailTogether?: boolean;
};

const TRAPS: Record<string, TrapRule> = {
  "trap-cake": { requirement: 4, damage: 5, disabledSkillColor: "blue" },
  "trap-clawed": { requirement: 4, damage: 3, failCoins: 3 },
  "trap-bone-breaker": { requirement: 4, damage: 7, spendArmorToDodge: true },
  "trap-hopscotch": { requirement: 6, damage: 4, autoDodgeArmorAtOrBelow: 2 },
  "trap-fireballs": { requirement: 3, damage: 4, raceRequirement: { race: "Dwarf", requirement: 5 } },
  "trap-flame-darts": { requirement: 3, damage: 4, raceRequirement: { race: "Elf", requirement: 5 } },
  "trap-blow-darts": { requirement: 6, damage: 5, raceRequirement: { race: "Dwarf", requirement: 3 }, autoDodgeLoot: "Blowgun" },
  "trap-muddy-mud": { requirement: 4, damage: 3, failAttackDice: 1 },
  "trap-trip-wire": { requirement: 3, damage: 5, partyFailTogether: true },
  "trap-pressure-plate": { requirement: 5, damage: 7, autoDodgeArmorAtOrBelow: 3 },
  "trap-cushion": { requirement: 3, damage: 6, partyFailTogether: true },
  "trap-super-fan": { requirement: 5, damage: 6, spendArmorToDodge: true },
  "trap-merry-go-round": { requirement: 5, damage: 5, disabledSkillColor: "green" },
  "trap-tesla-coil": { requirement: 4, damage: 5, disabledSkillColor: "green" },
  "trap-hot-coals": { requirement: 3, damage: 4, raceRequirement: { race: "Human", requirement: 5 } },
  "trap-login": { requirement: 6, damage: 5, raceRequirement: { race: "Human", requirement: 3 } },
  "trap-special-delivery": { requirement: 6, damage: 5, raceRequirement: { race: "Elf", requirement: 3 } },
  "trap-wrecking-ball": { requirement: 3, damage: 6, disabledSkillColor: "blue" },
};

const note = (text: string): EventEffect => ({ type: "note", text });

function hasLoot(ctx: TrapContext, name: string) {
  return ctx.lootNames.some((lootName) => lootName.toLowerCase() === name.toLowerCase());
}

function effectiveRequirement(rule: TrapRule, ctx: TrapContext) {
  const base = rule.raceRequirement && ctx.race.toLowerCase() === rule.raceRequirement.race.toLowerCase()
    ? rule.raceRequirement.requirement
    : rule.requirement;
  if (typeof ctx.trapRequirementOverride === "number") return Math.min(6, Math.max(1, ctx.trapRequirementOverride));
  return Math.min(6, Math.max(1, base + (ctx.trapRequirementDelta ?? 0)));
}

function effectiveDamage(rule: TrapRule, ctx: TrapContext) {
  return Math.max(0, rule.damage + (ctx.trapDamageDelta ?? 0));
}

function skillDisableText(rule: TrapRule) {
  return rule.disabledSkillColor
    ? `${rule.disabledSkillColor[0].toUpperCase()}${rule.disabledSkillColor.slice(1)} Skills are disabled while resolving this Trap. `
    : "";
}

function failEffects(rule: TrapRule, requirement: number, ctx: TrapContext): EventEffect[] {
  const damage = effectiveDamage(rule, ctx);
  const blocked = Math.min(damage, Math.max(0, ctx.armor));
  const healthDamage = Math.max(0, damage - blocked);
  const effects: EventEffect[] = [
    note(
      `Failed Core Roll ${requirement}+. The Trap deals ${damage} damage. ` +
      `${blocked > 0 ? `Armor ${ctx.armor} blocks ${blocked}. ` : ""}` +
      `${healthDamage > 0 ? `${healthDamage} Health gets through.` : "Armor blocks all damage."} ` +
      `Armor stays at ${ctx.armor}.`,
    ),
  ];

  if (healthDamage > 0) effects.push({ type: "health", amount: -healthDamage });
  if (rule.failCoins) effects.push({ type: "coins", amount: -rule.failCoins });
  if (rule.failAttackDice) effects.push({ type: "attackDice", amount: -rule.failAttackDice });
  if (rule.partyFailTogether) effects.push(note("Solo: the party-wide failure clause has no additional effect because you are the only Hero."));
  if (rule.disabledSkillColor) effects.push(note(`${rule.disabledSkillColor[0].toUpperCase()}${rule.disabledSkillColor.slice(1)} Skills were disabled for this Trap resolution.`));
  return effects;
}

function passEffects(rule: TrapRule, requirement: number) {
  const effects: EventEffect[] = [note(`Dodged! Core Roll met the ${requirement}+ requirement. No damage taken.`)];
  if (rule.partyFailTogether) effects.push(note("Solo: the party-wide failure clause does not affect anyone else."));
  if (rule.disabledSkillColor) effects.push(note(`${rule.disabledSkillColor[0].toUpperCase()}${rule.disabledSkillColor.slice(1)} Skills were disabled for this Trap resolution.`));
  return effects;
}

function rollPlan(rule: TrapRule, ctx: TrapContext): EventPlan {
  const requirement = effectiveRequirement(rule, ctx);
  const raceText = rule.raceRequirement
    ? ctx.race.toLowerCase() === rule.raceRequirement.race.toLowerCase()
      ? `${ctx.race} rule applies: Core Roll ${requirement}+. `
      : `${ctx.race} uses the normal Core Roll ${requirement}+. `
    : `Core Roll ${requirement}+. `;

  return {
    kind: "roll",
    prompt: `${skillDisableText(rule)}${raceText}Meet or beat the requirement to dodge. On a miss, Armor blocks damage without being spent.`,
    resolve: (roll) => roll >= requirement ? passEffects(rule, requirement) : failEffects(rule, requirement, ctx),
  };
}

export function getTrapPlan(trapId: string, ctx: TrapContext): EventPlan {
  const rule = TRAPS[trapId];
  if (!rule) {
    return {
      kind: "auto",
      effects: [note("This Trap is missing a digital rule mapping. No automatic result was applied.")],
    };
  }

  const requirement = effectiveRequirement(rule, ctx);

  if (rule.autoDodgeLoot && hasLoot(ctx, rule.autoDodgeLoot)) {
    return {
      kind: "auto",
      effects: [note(`${rule.autoDodgeLoot} lets ${ctx.race} dodge this Trap automatically. No damage taken.`)],
    };
  }

  if (typeof rule.autoDodgeArmorAtOrBelow === "number" && ctx.armor <= rule.autoDodgeArmorAtOrBelow) {
    return {
      kind: "auto",
      effects: [
        note(
          `Party Leader Armor is ${ctx.armor}, which is ${rule.autoDodgeArmorAtOrBelow} or lower. ` +
          "In this solo run, the Trap is dodged automatically. No damage taken.",
        ),
      ],
    };
  }

  if (rule.spendArmorToDodge && ctx.armor > 0) {
    return {
      kind: "optionalRoll",
      prompt: `${skillDisableText(rule)}Choose how to dodge. Roll Core Die ${requirement}+, or permanently lose 1 Armor to dodge automatically.`,
      payLabel: `Roll Core Die · ${requirement}+`,
      skipLabel: "Lose 1 Armor & Dodge",
      cost: [],
      resolve: (roll) => roll >= requirement ? passEffects(rule, requirement) : failEffects(rule, requirement, ctx),
      skipEffects: [
        { type: "armor", amount: -1 },
        note("Spent 1 Armor to dodge the Trap automatically. No Trap damage taken."),
      ],
    };
  }

  return rollPlan(rule, ctx);
}

export function getTrapSummary(trapId: string, ctx: TrapContext) {
  const rule = TRAPS[trapId];
  if (!rule) return null;
  const requirement = effectiveRequirement(rule, ctx);
  return {
    requirement,
    damage: effectiveDamage(rule, ctx),
    disabledSkillColor: rule.disabledSkillColor ?? null,
    armorIsPermanent: true,
  };
}

export const FABLE_TRAP_IDS = Object.freeze(Object.keys(TRAPS));
