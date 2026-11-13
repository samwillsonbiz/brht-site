import { fableAsset } from "@/lib/fableFuryStorage";

export type FableCardLike = {
  card_type?: string | null;
  source_sheet?: string | null;
  source_row?: number | null;
  subtype?: string | null;
  id?: string | null;
};

function numberedPng(prefix: string, number: number) {
  return `${prefix}${number === 1 ? "" : number}.png`;
}

export const FABLE_CARD_BACKS = {
  location: fableAsset("Card Back/Card Backs.png"),
  map: fableAsset("Card Back/Card Backs2.png"),
  modifier: fableAsset("Card Back/Card Backs3.png"),
  loot: fableAsset("Card Back/Card Backs4.png"),
  red: fableAsset("Card Back/Card Backs5.png"),
  blue: fableAsset("Card Back/Card Backs6.png"),
  green: fableAsset("Card Back/Card Backs7.png"),
  yellow: fableAsset("Card Back/Card Backs8.png"),
} as const;

const SHEET_ASSETS: Record<string, { folder: string; prefix: string }> = {
  loot: { folder: "Loot", prefix: "Loot Cards" },
  event: { folder: "Event", prefix: "Event Cards" },
  skill: { folder: "Skill", prefix: "Skill Cards" },
  enemy: { folder: "Enemy", prefix: "Enemy Cards" },
  trap: { folder: "Trap", prefix: "Trap Cards" },
  special: { folder: "Special", prefix: "Special Cards" },
  monster: { folder: "Monster Mats", prefix: "Monster Mats" },
};

export function mapArt(mapId?: string | null) {
  if (!mapId) return null;
  const match = mapId.match(/(\d+)$/);
  const number = match ? Number(match[1]) : 0;
  if (!number || number < 1 || number > 15) return null;
  return fableAsset(`Map/${numberedPng("Map Cards", number)}`);
}

export function cardFrontArt(card?: FableCardLike | null) {
  if (!card) return null;
  const sheet = (card.source_sheet || card.card_type || "").toLowerCase();
  const asset = SHEET_ASSETS[sheet];
  const row = Number(card.source_row);
  if (!asset || !Number.isFinite(row) || row < 2) return null;

  const number = row - 1;
  return fableAsset(`${asset.folder}/${numberedPng(asset.prefix, number)}`);
}

export function cardBackArt(card?: FableCardLike | null, skillColor?: "red" | "blue" | "green" | "yellow") {
  if (card?.card_type === "loot") return FABLE_CARD_BACKS.loot;
  if (card?.card_type === "skill") return FABLE_CARD_BACKS[skillColor || "yellow"];
  return FABLE_CARD_BACKS.location;
}

export function skillBackArt(color: "red" | "blue" | "green" | "yellow") {
  return FABLE_CARD_BACKS[color];
}
