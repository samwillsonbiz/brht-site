import type { SkillColor } from "@/lib/fableFuryHeroes";

export type TriggerCard = {
  id: string;
  title: string;
  subtype?: string | null;
  rules_text?: string | null;
};

export type TriggerEffect =
  | { type: "health"; amount: number }
  | { type: "armor"; amount: number }
  | { type: "attackDice"; amount: number }
  | { type: "coins"; amount: number }
  | { type: "token"; token: "healing" | "lucky" | "crystal"; amount: number }
  | { type: "drawLoot"; count: number }
  | { type: "enemyDamage"; amount: number }
  | { type: "enemyAgility"; amount: number }
  | { type: "note"; text: string };

export type TriggerContext = {
  heroId: string;
  skills: Array<TriggerCard | null>;
  disabledSkillColors?: SkillColor[];
};

function activeSkills(ctx: TriggerContext) {
  const disabled = new Set(ctx.disabledSkillColors ?? []);
  return ctx.skills.filter((skill): skill is TriggerCard => {
    if (!skill) return false;
    const color = (skill.subtype ?? "").toLowerCase() as SkillColor;
    if (!disabled.has(color)) return true;
    return /can't be disabled/i.test(skill.rules_text ?? "");
  });
}

export function clearTriggers(kind: "event" | "enemy" | "trap" | "shrine" | "portal", ctx: TriggerContext): TriggerEffect[] {
  const effects: TriggerEffect[] = [];
  if (kind === "enemy") {
    if (ctx.heroId === "hero-alf-featherbottom") effects.push({ type: "token", token: "crystal", amount: 1 });
    if (ctx.heroId === "hero-dr-shealer") effects.push({ type: "token", token: "healing", amount: 1 });
    if (ctx.heroId === "hero-friar-franc") effects.push({ type: "coins", amount: 1 });
  }
  if (kind === "shrine" && ctx.heroId === "hero-raven-madison") effects.push({ type: "drawLoot", count: 1 });

  for (const skill of activeSkills(ctx)) {
    if (skill.id === "skill-life-tap") effects.push({ type: "token", token: "healing", amount: 1 });
    switch (skill.id) {
      case "skill-champion-of-the-sun": if (kind === "shrine") effects.push({ type: "attackDice", amount: 1 }); break;
      case "skill-absorb": if (kind === "shrine") effects.push({ type: "armor", amount: 1 }); break;
      case "skill-group-therapy": if (kind === "trap") effects.push({ type: "health", amount: 1 }); break;
      case "skill-sluggish-recovery": if (kind === "enemy") effects.push({ type: "health", amount: 1 }); break;
      case "skill-tp-bandages": if (kind === "shrine") effects.push({ type: "health", amount: 4 }); break;
      case "skill-5-finger-discount": if (kind === "shrine") effects.push({ type: "drawLoot", count: 1 }); break;
      case "skill-cash-dash": if (kind === "trap") effects.push({ type: "coins", amount: 2 }); break;
      case "skill-grave-robber": if (kind === "enemy") effects.push({ type: "coins", amount: 1 }); break;
      case "skill-tripping-balls": if (kind === "trap") effects.push({ type: "token", token: "crystal", amount: 2 }); break;
    }
  }
  return effects;
}

function counts(dice: number[]) {
  const map = new Map<number, number>();
  for (const die of dice) map.set(die, (map.get(die) ?? 0) + 1);
  return map;
}

export function heroAttackRollTriggers(dice: number[], ctx: TriggerContext): TriggerEffect[] {
  const effects: TriggerEffect[] = [];
  const c = counts(dice);
  const triples = [...c.values()].some((value) => value >= 3);
  for (const skill of activeSkills(ctx)) {
    switch (skill.id) {
      case "skill-dangerous-mathsss": if (triples) effects.push({ type: "attackDice", amount: 1 }); break;
      case "skill-fawesome-luck": if ((c.get(4) ?? 0) >= 2) effects.push({ type: "attackDice", amount: 1 }); break;
      case "skill-gaelic-guardian": if (triples) effects.push({ type: "armor", amount: 1 }); break;
      case "skill-high-five": if ((c.get(5) ?? 0) >= 2) effects.push({ type: "health", amount: 5 }); break;
      case "skill-supplement-guru": if (triples) effects.push({ type: "coins", amount: 3 }); break;
    }
  }
  return effects;
}

export function targetedAttackTriggers(ctx: TriggerContext, hit: boolean): TriggerEffect[] {
  const effects: TriggerEffect[] = [];
  for (const skill of activeSkills(ctx)) {
    switch (skill.id) {
      case "skill-slap": if (hit) effects.push({ type: "enemyDamage", amount: 1 }); break;
      case "skill-sucker-punch": if (!hit) effects.push({ type: "enemyDamage", amount: 1 }); break;
      case "skill-incantation": if (hit) effects.push({ type: "drawLoot", count: 1 }); break;
      case "skill-triple-threat": if (hit) effects.push({ type: "drawLoot", count: 1 }); break;
      case "skill-golden-opportunity": if (hit) effects.push({ type: "coins", amount: 1 }); break;
    }
  }
  return effects;
}

export function allAttackEndedTriggers(ctx: TriggerContext): TriggerEffect[] {
  const effects: TriggerEffect[] = [];
  for (const skill of activeSkills(ctx)) if (skill.id === "skill-bottled-rage") effects.push({ type: "enemyDamage", amount: 2 });
  return effects;
}

export function hasSkill(ctx: TriggerContext, id: string) {
  return activeSkills(ctx).some((skill) => skill.id === id);
}
