import type { TokenKind } from "@/lib/fableFuryHeroes";

const thumb = (id: string, size = 1600) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

export const FABLE_BOARD_ART = thumb("1HJ36G-XDFal5VCHLzg2-ZUA8YnEzhaId", 2200);
export const FABLE_BACKPACK_ART = thumb("16RqDmbyxMq5Kq9fi_CP9H55uMvXxxenz", 1800);

// Production token art from the shared base-game asset folder.
// Tokens.png = Lucky Charm, Tokens2.png = Crystal Ball, Tokens3.png = Health Potion.
export const FABLE_TOKEN_ART: Record<TokenKind, string> = {
  lucky: thumb("1gIPmVauDKsMRspgc9IHUGWZAFzXNHd-S", 500),
  crystal: thumb("1qIqeuoYyQ3eTHMHe09Tj34fltPpO_aDF", 500),
  healing: thumb("1Mj0wbD8U4fMgeq9c8KV9VEHvh22soKpw", 500),
};

// Existing Fable Fury art used in place of generic emoji/stat icons.
export const FABLE_STAT_ART = {
  health: thumb("1jmhQaKjlXD5Po6rqBPaMOkaFbBsqpcVJ", 420),
  armor: thumb("17oUGJEVTDVuoA9z3YxxXdGy1-G7do-VE", 420),
  attackDice: thumb("13LsgS8yU4vinqpgD8azCmpVo9mLqE1BH", 420),
  coins: thumb("1p4_zR5zyRx381bVXvc_GlyskLyFRFP1d", 420),
} as const;

export const FABLE_SHOP_ART = {
  crystal: FABLE_TOKEN_ART.crystal,
  lucky: FABLE_TOKEN_ART.lucky,
  healing: FABLE_TOKEN_ART.healing,
  attackDice: FABLE_STAT_ART.attackDice,
  armor: FABLE_STAT_ART.armor,
} as const;
