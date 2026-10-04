import { fableAsset } from "@/lib/fableFuryStorage";

export type SkillColor = "red" | "blue" | "green" | "yellow";
export type TokenKind = "healing" | "lucky" | "crystal";

export type FableHero = {
  id: string;
  shortId: string;
  name: string;
  race: string;
  role: string;
  mat: string;
  startingHealth: number;
  startingArmor: number;
  startingAttackDice: number;
  maxHealth: number;
  maxArmor: number;
  maxAttackDice: number;
  coreSkill: { name: string; text: string };
  skillSlots: SkillColor[];
};

const heroMat = (number: number) =>
  fableAsset(`Hero Mats & Bag/Digital Hero Mats/CUTS - Hero Mats (For Digital Games)${number === 1 ? "" : number}.png`);

export const FABLE_HEROES: FableHero[] = [
  {
    id: "hero-alf-featherbottom",
    shortId: "alf",
    name: "Alf Featherbottom",
    race: "Elf",
    role: "Archer",
    mat: heroMat(1),
    startingHealth: 7,
    startingArmor: 1,
    startingAttackDice: 1,
    maxHealth: 10,
    maxArmor: 4,
    maxAttackDice: 4,
    coreSkill: { name: "Hangry Birds", text: "Whenever an Enemy Location is Cleared, gain 1 Crystal Ball." },
    skillSlots: ["yellow", "red", "green"],
  },
  {
    id: "hero-dr-shealer",
    shortId: "shealer",
    name: "Dr. Shealer",
    race: "Human",
    role: "Priest",
    mat: heroMat(2),
    startingHealth: 8,
    startingArmor: 1,
    startingAttackDice: 0,
    maxHealth: 10,
    maxArmor: 4,
    maxAttackDice: 3,
    coreSkill: { name: "Field Medicine", text: "Whenever an Enemy Location is Cleared, gain 1 Healing Potion." },
    skillSlots: ["green", "yellow", "green"],
  },
  {
    id: "hero-friar-franc",
    shortId: "franc",
    name: "Friar Franc",
    race: "Human",
    role: "Monk",
    mat: heroMat(3),
    startingHealth: 10,
    startingArmor: 0,
    startingAttackDice: 1,
    maxHealth: 10,
    maxArmor: 3,
    maxAttackDice: 4,
    coreSkill: { name: "Paying Respects", text: "Whenever an Enemy Location is Cleared, gain 1 Coin." },
    skillSlots: ["yellow", "green", "red"],
  },
  {
    id: "hero-helga",
    shortId: "helga",
    name: "Helga",
    race: "Dwarf",
    role: "Tank",
    mat: heroMat(4),
    startingHealth: 5,
    startingArmor: 2,
    startingAttackDice: 0,
    maxHealth: 10,
    maxArmor: 5,
    maxAttackDice: 3,
    coreSkill: { name: "Holding Space", text: "Whenever a Targeted Attack targets you, Core Roll 5+ to gain 1 Armor." },
    skillSlots: ["blue", "green", "blue"],
  },
  {
    id: "hero-lord-smasherton",
    shortId: "smasherton",
    name: "Lord Smasherton",
    race: "Dwarf",
    role: "Barbarian",
    mat: heroMat(5),
    startingHealth: 8,
    startingArmor: 1,
    startingAttackDice: 2,
    maxHealth: 10,
    maxArmor: 4,
    maxAttackDice: 5,
    coreSkill: { name: "Smite Club", text: "Whenever an Enemy deals damage to you, deal 1 damage." },
    skillSlots: ["red", "blue", "red"],
  },
  {
    id: "hero-raven-madison",
    shortId: "raven",
    name: "Raven Madison",
    race: "Elf",
    role: "Rogue",
    mat: heroMat(6),
    startingHealth: 6,
    startingArmor: 1,
    startingAttackDice: 1,
    maxHealth: 10,
    maxArmor: 3,
    maxAttackDice: 5,
    coreSkill: { name: "Loot Lust", text: "Whenever a Shrine Location is Cleared, draw 1 Loot." },
    skillSlots: ["red", "yellow", "blue"],
  },
];

export const TOKEN_LABELS: Record<TokenKind, string> = {
  healing: "Healing Potion",
  lucky: "Lucky Charm",
  crystal: "Crystal Ball",
};

export function getHero(heroId: string | null | undefined) {
  return FABLE_HEROES.find((hero) => hero.id === heroId) ?? FABLE_HEROES[0];
}
