import type { TokenKind } from "@/lib/fableFuryHeroes";
import { fableAsset } from "@/lib/fableFuryStorage";

const driveThumb = (id: string, size = 420) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

export const FABLE_BOARD_ART = fableAsset("Game Box and Board/Game Board.png");
export const FABLE_BACKPACK_ART = fableAsset("Hero Mats & Bag/Player Bag.png");

export const FABLE_TOKEN_ART: Record<TokenKind, string> = {
  lucky: fableAsset("Token/Tokens.png"),
  crystal: fableAsset("Token/Tokens2.png"),
  healing: fableAsset("Token/Tokens3.png"),
};

// Armor exists in the uploaded Storage library. The three small UI-only stat
// icons remain on their original source until those files are added to Storage.
export const FABLE_STAT_ART = {
  health: driveThumb("12s11V8Vzl63TGMGpnnLdPuNgp_DB191L"),
  armor: fableAsset("Token/Armor/Armor - Transparent.png"),
  attackDice: driveThumb("1oUn6NpzKa8lkWnViMZZpvlKtF-AQuSgR"),
  coins: driveThumb("1p4_zR5zyRx381bVXvc_GlyskLyFRFP1d"),
} as const;

export const FABLE_SHOP_ART = {
  crystal: FABLE_TOKEN_ART.crystal,
  lucky: FABLE_TOKEN_ART.lucky,
  healing: FABLE_TOKEN_ART.healing,
  attackDice: FABLE_STAT_ART.attackDice,
  armor: FABLE_STAT_ART.armor,
} as const;
