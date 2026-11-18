# Brawl2 — Attack & React

Play https://www.brht.ai/brawl2. This replaces Brawl2 only. Original `/brawl` is preserved. The previous six-Hero reveal rules are archived in `archive/reveal-2` and the prior release commit `9537498`.

Six complete Heroes, each with a passive, four draftable Attacks, four draftable Reactions, and one Fury Attack. 76 designs: 10 Basics, 48 Hero, 6 Fury, 12 Loot. All cards have new action illustrations; Hero moves depict that Hero, while generic cards use generic art.

Draft 10 Basics and 5 Hero cards, maximum two copies of a design, including at least 4 Attacks and 3 Reactions. Sort into separate Attack and Reaction draw piles. Start with 4 Attacks and 3 Reactions, 18 Health, 0 Coins, on spaces 3 and 5. Suggested and random drafts, mirror matches, solo, private online and pass-and-play are supported.

Commit two Attacks face down in order. Reveal first pair together, higher Speed activates first (Edge breaks ties). Printed movement/healing/Block before the hit happens on activation. Defender gets first reaction. Alternate one Reaction or Loot, or pass. Reactions resolve immediately. Playing a card resets passes; passing once does not lock you out. Two consecutive passes resolve the active attack using current positions, Block and bonuses. Optional printed Attack payments happen at this point and must leave 1 Health. Then activate the other Attack and give it a new reaction exchange. Repeat for the second pair.

No automatic draw after a Reaction or individual Attack. Explicit card effects can draw Reactions, at most one draw effect per player per active attack. After all four attacks, keep unused cards, refill Attacks to 4 and draw at most 2 new Reactions, stopping at 3 held. Fury may temporarily give a fifth Attack. Block clears per attack except Helga banks it until the end of all four. Maximum Block 6; attack bonuses expire after that attack. Movement is chosen on the arena at resolution: up to, either direction, crossing allowed, never land together. Push/pull distances are optional. No facing bookkeeping.

Only resolved Basic Attacks earn 1 Coin; including misses; Reactions earn none. Cap 8. After all four attacks, buy one blind Loot for 2 Coins or save; hold two. Loot uses the same alternating reaction turns. Twelve unique Loot cards form a finite shared pile; spent Loot reshuffles when needed. No events.

Gain 1 Fury per opposing damaging card play, not per damage point. Attack and wall share a source. Full Block and self-damage give none. At 3, the Hero's Fury Attack enters hand once and cycles thereafter; at 5, the permanent passive upgrades. Immediate KO ends play. At round-10 cleanup, both lose 2 Health ignoring Block, rising by 1 each later round (cap 18).

## Reproduce

- `node brawl2/tools/build-reactions.mjs` builds the current card database.
- `node --test brawl2/tests/*.test.mjs` runs 51 rule/network/UI-forecast tests, including the user's exact move/chase/block example and all 15 matchups.
- `GAMES_PER_PAIR=60 node brawl2/tools/simulate-reactions.mjs` runs 5,400 deterministic games across all non-mirror pairs, both seats, suggested/random drafts, three public-state heuristic weightings.
- `node brawl2/tools/serve.mjs` serves localhost:8779/brawl2.
- `node brawl2/tools/smoke-reactions.mjs` exercises three two-seat rooms covering all six Heroes.
- `node brawl2/tools/prepare-release.mjs` copies only Brawl2 release files.
- `node brawl2/tools/verify-reactions-live.mjs` checks published files, artwork and both API versions.

Engine `brawl2-reactions-4`. New browser save and seat keys isolate older saves/rooms. Existing room storage uses an exact engine-version filter; no database schema, RLS, permissions, existing room or scheduler data changes.

The bots do not read opposing hidden hands or future draws. Results are diagnostic, not proof of human balance, match duration in minutes, or fun. See `outputs/brawl2-loot2/Simulation.json` and `outputs/brawl2-loot2/Debrief.md`. Current authoritative sources are `tools/build-reactions.mjs`, `dist/engine.js`, `dist/reaction-ai.js` and `dist/app.js`. Older builders and simulators are historical.

## Implemented economy and clarity update

Implemented at the user's request. Keep the seven-space linear arena. Start a fresh match for the new rules.

- Loot now costs 2 Coins. Only resolved Basic Attacks earn 1 Coin; Reactions earn no Coins, including Basic Reactions.
- Start with 3 Reactions. Keep unused Reactions; after all four committed attacks, draw at most 2 new Reactions, stopping at 3 held. Explicit card draw effects remain exceptions. Attack hand remains refill to 4, commit 2.
- Explain the current combat step persistently: active attacker/card, whose reaction turn, projected damage if both pass, and a clear last-chance message after one pass.
- Highlight the active Attack, dim the waiting Attack, and show currently threatened arena spaces.
- Show a short reaction/movement trail, explicit damage-minus-Block resolution, reasons cards are unavailable, a kept/drawn refill summary, Basic Attack Coin rewards and Loot purchase availability.
- Re-tested economy, defensive-card scarcity, Hero matchups and fight length after these changes. The latest 5,400-game results describe these new rules and the targeted card adjustments below.
- Seven-space arena retained. No terrain or extra components added.

Targeted card adjustments after the first economy test: Alf Quick Shot 5 → 4 damage; Double Arrow 3 twice → 2 twice; Shealer Stitch Up heals 3 instead of 2 before her passive; Franc Battle Cry adds 3 damage instead of 2 and grants no Coin. Current turn and consequence guidance, range highlighting, unavailable-card reasons, public result math, exchange trail and kept/drawn refill summaries are implemented in `dist/app.js` and `dist/combat-view.js`.
