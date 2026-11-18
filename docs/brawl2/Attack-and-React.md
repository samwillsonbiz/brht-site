# Brawl2 — Attack & React

Play https://www.brht.ai/brawl2. This replaces Brawl2 only. Original `/brawl` is preserved. The previous six-Hero reveal rules are archived in `archive/reveal-2` and the prior release commit `9537498`.

Six complete Heroes, each with a passive, four draftable Attacks, four draftable Reactions, and one Fury Attack. 76 designs: 10 Basics, 48 Hero, 6 Fury, 12 Loot. All cards have new action illustrations; Hero moves depict that Hero, while generic cards use generic art.

Draft 10 Basics and 5 Hero cards, maximum two copies of a design, including at least 2 Attacks and 3 Reactions. Sort into separate Attack and Reaction draw piles. Start with 2 Attacks and 3 Reactions, 18 Health, 0 Coins, on spaces 3 and 5. Suggested and random drafts, mirror matches, solo, private online and pass-and-play are supported.

Commit two Attacks face down in order. Reveal first pair together, higher Speed activates first (Edge breaks ties). Printed movement/healing/Block before the hit happens on activation. Defender gets first reaction. Alternate one Reaction or Loot, or pass. Reactions resolve immediately. Playing a card resets passes; passing once does not lock you out. Two consecutive passes resolve the active attack using current positions, Block and bonuses. Optional printed Attack payments happen at this point and must leave 1 Health. Then activate the other Attack and give it a new reaction exchange. Repeat for the second pair.

No automatic draw after a Reaction or individual Attack. Explicit card effects can draw Reactions, at most one draw effect per player per active attack. After all four attacks, refill to 2 Attacks and 3 Reactions, keeping unused cards. Fury may temporarily give a third Attack. Block clears per attack except Helga banks it until the end of all four. Maximum Block 6; attack bonuses expire after that attack. Movement is chosen on the arena at resolution: up to, either direction, crossing allowed, never land together. Push/pull distances are optional. No facing bookkeeping.

Resolved Basics earn 1 Coin, including misses; cap 8. After all four attacks, buy one blind Loot for 3 Coins or save; hold two. Loot uses the same alternating reaction turns. Twelve unique Loot cards form a finite shared pile; spent Loot reshuffles when needed. No events.

Gain 1 Fury per opposing damaging card play, not per damage point. Attack and wall share a source. Full Block and self-damage give none. At 3, the Hero's Fury Attack enters hand once and cycles thereafter; at 5, the permanent passive upgrades. Immediate KO ends play. At round-10 cleanup, both lose 2 Health ignoring Block, rising by 1 each later round (cap 18).

## Reproduce

- `node brawl2/tools/build-reactions.mjs` builds the current card database.
- `node --test brawl2/tests/*.test.mjs` runs 36 rule/network tests, including the user's exact move/chase/block example and all 15 matchups.
- `GAMES_PER_PAIR=60 node brawl2/tools/simulate-reactions.mjs` runs 5,400 deterministic games across all non-mirror pairs, both seats, suggested/random drafts, three public-state heuristic weightings.
- `node brawl2/tools/serve.mjs` serves localhost:8779/brawl2.
- `node brawl2/tools/smoke-reactions.mjs` exercises three two-seat rooms covering all six Heroes.
- `node brawl2/tools/prepare-release.mjs` copies only Brawl2 release files.
- `node brawl2/tools/verify-reactions-live.mjs` checks published files, artwork and both API versions.

Engine `brawl2-reactions-1`. New browser save and seat keys isolate older saves/rooms. Existing room storage uses an exact engine-version filter; no database schema, RLS, permissions, existing room or scheduler data changes.

The bots do not read opposing hidden hands or future draws. Results are diagnostic, not proof of human balance, match duration in minutes, or fun. See `outputs/brawl2-reactions/Simulation.json` and `Debrief.md`. Current authoritative sources are `tools/build-reactions.mjs`, `dist/engine.js`, `dist/reaction-ai.js` and `dist/app.js`. Older builders and simulators are historical.
