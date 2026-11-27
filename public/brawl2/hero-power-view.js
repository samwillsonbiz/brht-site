// Player-facing reference for existing mechanics; no resolver logic.
export const HERO_POWER_VIEW={
  "MAR": {
    "start": 0,
    "cap": 3,
    "gain": "After surviving an enemy attack, gain 1 if Block prevented strike damage.",
    "actions": [
      [
        "Advance · 1 Formation",
        "Your attacking reaction",
        "Move up to 1 in either direction. Once per attack."
      ]
    ]
  },
  "SIB": {
    "start": 3,
    "cap": 3,
    "gain": "At round end, ready 1 spent War Spear.",
    "actions": [
      [
        "Commit · 1 War Spear",
        "At attack activation, before movement",
        "+1 damage. At most 1 spear per attack; spent even on a miss. Special card uses stay on their cards."
      ]
    ]
  },
  "VER": {
    "start": 1,
    "cap": 3,
    "gain": "After your first damaging attack each round, gain 1 Technique.",
    "actions": [
      [
        "Technique · 1 token",
        "Your attacking reaction",
        "Use the active Dual attack’s Reaction half, paying normal costs and following its restrictions. Once per attack."
      ]
    ]
  },
  "MEI": {
    "start": 3,
    "cap": 3,
    "gain": "After your first damaging attack each round, place Wind on your space. If all three are placed, relocate one. If Wind is already beneath you, it stays.",
    "actions": [
      [
        "Ride the Wind · consume the marker beneath you",
        "Your reaction turn, once per round",
        "Move up to 1. Wind starts this move; it never extends another Move."
      ]
    ]
  },
  "SMA": {
    "start": 2,
    "cap": 3,
    "gain": "After printed attack effects, gain 1 if the strike dealt Health damage.",
    "actions": [
      [
        "Finishing shove · 1 Impact",
        "After printed effects of a strike that was in range",
        "Push the rival 1 space. Once per attack. Existing Impact can pay even after a fully blocked strike."
      ]
    ]
  },
  "ALF": {
    "start": 1,
    "cap": 2,
    "gain": "After your attack deals Health damage at distance 3 or more, gain 1 Aim.",
    "actions": [
      [
        "Line Up · 1 Aim",
        "Your attacking reaction",
        "+2 maximum Range and ignore 1 additional Block. Once per attack; minimum Range is unchanged."
      ]
    ]
  },
  "SHE": {
    "start": 2,
    "cap": 3,
    "gain": "After each Health payment for a card, gain 1 Research. Enemy damage does not count.",
    "actions": [
      [
        "Treatment · 2 Research",
        "Your reaction turn, once per attack",
        "Heal 3, up to 20 Health. There is no automatic Research draw."
      ]
    ]
  },
  "HEL": {
    "start": 3,
    "cap": 3,
    "gain": "After your first damaging Hero attack each round, repair 1 Armour.",
    "actions": [
      [
        "Brace · 1 Armour",
        "Your reaction turn, once per attack",
        "Gain 2 Block. Keep Block until the next enemy attack finishes, or round end. Hold the Line offers paid push resistance."
      ]
    ]
  },
  "RAV": {
    "start": 1,
    "cap": 2,
    "gain": "The first card Move that crosses the rival during an attack earns 1 Trick. Token movement and swaps never earn Tricks.",
    "actions": [
      [
        "Slip Through · 1 Trick",
        "Your reaction turn, once per attack",
        "Move up to 1, or cross an adjacent rival into the empty space directly beyond them."
      ]
    ]
  },
  "FRA": {
    "start": 1,
    "cap": 3,
    "gain": "After a Basic attack deals Health damage, gain 1 Profit.",
    "actions": [
      [
        "Inside Deal · 2 Profit",
        "Once on your shopping turn, before a normal Coin purchase",
        "Buy 1 face-up Loot. Hold at most 2 Loot. No default market replacement or cash-out; follow printed card effects."
      ]
    ]
  }
};
export function selectedFuryIds(hero,selected,inFight){return inFight&&hero.furies.includes(selected)?[selected]:hero.furies;}
