import type { SkillColor } from "@/lib/fableFuryHeroes";

export type SkillBehavior = "manual" | "conditional" | "automatic" | "ongoing" | "solo-unavailable";

export type SkillCardLike = {
  id: string;
  title: string;
  subtype?: string | null;
  rules_text?: string | null;
};

export const SKILL_BEHAVIORS: Record<string, SkillBehavior> = {
  "skill-bloody-blade": "conditional",
  "skill-boomerwrong": "manual",
  "skill-bottled-rage": "automatic",
  "skill-bougie-bludgeoner": "manual",
  "skill-champion-of-the-sun": "automatic",
  "skill-choosing-violence": "conditional",
  "skill-coin-blaster": "manual",
  "skill-dangerous-mathsss": "automatic",
  "skill-diamond-coated": "manual",
  "skill-fawesome-luck": "automatic",
  "skill-gym-candy": "ongoing",
  "skill-hammer-time": "manual",
  "skill-limp-poke": "manual",
  "skill-nzt-48": "manual",
  "skill-rent-a-sword": "manual",
  "skill-shedding-weight": "manual",
  "skill-slap": "automatic",
  "skill-sucker-punch": "automatic",

  "skill-absorb": "automatic",
  "skill-atrophy": "manual",
  "skill-attention-seeker": "conditional",
  "skill-danger-nerd": "manual",
  "skill-designer-parry": "ongoing",
  "skill-distract": "solo-unavailable",
  "skill-gaelic-guardian": "automatic",
  "skill-trap-expert": "manual",
  "skill-ice-block": "manual",
  "skill-intimidation": "manual",
  "skill-mind-over-metal": "solo-unavailable",
  "skill-organ-donor": "solo-unavailable",
  "skill-pain-aversion": "manual",
  "skill-rickety-reflex": "manual",
  "skill-ice-wall": "solo-unavailable",
  "skill-thorny-wood": "manual",
  "skill-questionable-reflex": "manual",
  "skill-unusual-hat": "ongoing",

  "skill-be-better": "conditional",
  "skill-capital-care": "manual",
  "skill-extra-inch": "manual",
  "skill-gaming-the-system": "manual",
  "skill-group-therapy": "automatic",
  "skill-high-five": "automatic",
  "skill-life-tap": "automatic",
  "skill-mediocre": "manual",
  "skill-mighty-medic": "ongoing",
  "skill-polymorph": "conditional",
  "skill-reanimate": "solo-unavailable",
  "skill-do-over": "manual",
  "skill-second-aid": "manual",
  "skill-sluggish-recovery": "automatic",
  "skill-the-fource": "automatic",
  "skill-tp-bandages": "automatic",
  "skill-transfusion": "manual",
  "skill-benevolent-exchange": "manual",

  "skill-5-finger-discount": "automatic",
  "skill-boosting": "ongoing",
  "skill-cash-dash": "automatic",
  "skill-incantation": "automatic",
  "skill-triple-threat": "automatic",
  "skill-grave-robber": "automatic",
  "skill-hand-torch": "manual",
  "skill-lemonade-stand": "automatic",
  "skill-missed-opportunity": "solo-unavailable",
  "skill-golden-opportunity": "automatic",
  "skill-mortician-magician": "automatic",
  "skill-palm-reader": "ongoing",
  "skill-prolonged-stare": "conditional",
  "skill-pure-intentions": "automatic",
  "skill-reflex-flex": "automatic",
  "skill-self-bless": "automatic",
  "skill-supplement-guru": "automatic",
  "skill-tripping-balls": "automatic",
};

export function skillBehavior(card: SkillCardLike | null | undefined): SkillBehavior {
  if (!card) return "ongoing";
  return SKILL_BEHAVIORS[card.id] ?? (/\[F\]/.test(card.rules_text ?? "") ? "manual" : "ongoing");
}

export function skillUsesFlip(card: SkillCardLike | null | undefined) {
  return !!card && /\[F\]/.test(card.rules_text ?? "");
}

export function skillColor(card: SkillCardLike | null | undefined) {
  return (card?.subtype ?? "").toLowerCase() as SkillColor;
}

export function skillBackLabel(card: SkillCardLike | null | undefined) {
  const color = skillColor(card);
  return color ? `${color[0].toUpperCase()}${color.slice(1)} Skill` : "Skill";
}

export function diceCounts(dice: number[]) {
  const counts = new Map<number, number>();
  for (const die of dice) counts.set(die, (counts.get(die) ?? 0) + 1);
  return counts;
}

export function hasTriples(dice: number[]) {
  return [...diceCounts(dice).values()].some((count) => count >= 3);
}

export function hasDouble(dice: number[], face: number) {
  return (diceCounts(dice).get(face) ?? 0) >= 2;
}

export const ALL_SKILL_IDS = Object.freeze(Object.keys(SKILL_BEHAVIORS));
