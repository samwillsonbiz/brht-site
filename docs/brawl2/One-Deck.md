# Brawl2 — One Deck, six Heroes

Playable at https://www.brht.ai/brawl2. Original `/brawl` is preserved. The previous two-Hero release is archived in `archive/one-deck-1`; rollback commit `f8f2808d752c548eb129e5817cf6319e1406934c`.

Six 40-card pools (20 designs × two copies), three Fury choices each, eighteen example 24-card builds, random decks and custom drafting. Solo, pass-and-play, mirrors and private online duels. Choose 24 without Basic/Hero quotas; each pool has eight Attack-only, eight Dual and four Reaction-only designs. A Dual card is one physical card with two possible uses. Custom deck selections save locally by Hero and player slot.

## Pool

Each Hero owns 20 designs with two physical copies of each: 40 cards. Choose any 24. You may take 0, 1 or 2 of each design. Each Hero’s pool includes their own physical copies of the ten shared Basic designs. No Basic/Hero quota; no shared Basic draw pile.

## Setup

Choose one of three Fury cards and reveal that choice beside your Hero. It is outside the 24-card deck. Shuffle the 24 and draw 7. Start at 20 Health, 0 Coins, spaces 3 and 5. Randomly give one player Edge; it changes sides after every round.

## Choose attacks

Commit two attack-capable cards in order if able. If you have only one, use the first slot; if none, leave both empty. Empty slots pass. An out-of-range Attack is still an eligible Attack. All other cards remain in hand. A committed dual-use card is locked as an Attack and cannot also react.

## Reveal and react

Reveal the first pair together. Higher Speed activates first; Edge breaks ties. Resolve its Activate text, then the defender reacts first. Alternate one Reaction, one Loot, or pass. Played Reactions and Loot resolve immediately. Two consecutive passes resolve the active Attack using current positions. A card play resets passes; one pass does not prevent reacting later. Give the other Attack its own exchange, then reveal pair 2. If a pair has one Attack, resolve just that Attack; if none, skip the pair.

## Dual-use cards

Play exactly one half, then discard the card after its effect finishes. Reaction text marked Attacking is only usable during your own active Attack; Defending only during your rival’s active Attack; Either in either exchange. Neither Reaction Speed nor a second Attack is created by a Reaction half. You may play a legal Reaction for little or no benefit, such as Move 0, but cannot ignore its printed timing or Range requirement just to empty your hand.

## Movement

All Move values mean up to that many spaces, chosen when the effect resolves. You can stay, move either direction, or cross your rival, but never finish on their space. Push moves the rival away; pull moves them toward you without crossing or sharing your space. Choose the distance when resolving. Range is the difference between the occupied space numbers.

## Range and bonuses

Use the printed Attack range, then modifiers. Alf gets +1 maximum Range on attacks with printed minimum Range 2 or more, even after Trick Shot changes their minimum. His damage bonus uses the actual distance when striking: +1 at distance 2 or more (+2 after his upgrade). Maximum-range bonuses never change minimum Range. Damage bonuses and ignored Block add together and last only for the current Attack. Each Attack hits once. No extra reactions occur between the hit and its on-hit effects.

## Hit and Block

On-hit effects require at least 1 Health damage to the rival. Block is spent preventing damage and is capped at 6. Ignore N Block leaves up to N existing Block unused for this hit; it does not destroy Block. After each active Attack, both players lose unused Block, except Helga: she keeps up to 2 (4 after her upgrade). All Block clears at round end.

## Wall slam

A chosen push that would go beyond space 1 or 7 stops at the edge and deals 1 extra damage ignoring Block (Smasherton: 2, upgraded: 3). Landing exactly on the edge deals none. One push effect causes at most one slam, regardless of unused distance. Combine a single Attack’s printed push and bonus push into one push effect. A Reaction push is a separate effect and can slam immediately; pulls never slam.

## Coins and Loot

A Basic Attack earns 1 Coin when it finishes, including a miss; cap 8 Coins. Basic Reactions, Hero cards and Fury earn none. After the round, each player may buy one blind Loot for 2 Coins if holding fewer than two. Loot stays outside the seven-card hand/refill. The shared Loot pile contains 12 designs, two copies each.

## Refill

After all committed Attacks finish, discard spent cards and keep unused hand cards. Draw up to 4, stopping at a hand of 7. No voluntary discard. If you still have 5 cards, draw 2; if you have 2, draw 4 and begin with 6. A printed draw effect may exceed the limit. No automatic draws during combat. When a draw pile runs out, shuffle its spent discard to continue; never include held or committed cards. Each player can resolve at most one printed draw effect per active Attack, including its Activate text. Fury arriving at 10 Health does not use this allowance.

## Fury at 10

The first time you have 10 or less Health and are still alive, put the chosen Fury into your hand. This is an extra draw and may take you over 7. It can be committed at the next planning step, never inserted into the current round’s locked Attacks. Once played, it goes to your normal discard and can return on a later reshuffle. Its threshold does not trigger twice.

## Upgrade at 5

The first time you have 5 or less Health and are still alive, permanently upgrade the Hero passive. Healing never removes either unlock. If a single damage event crosses both thresholds, unlock both. Health payments also count. Reaching 0 ends the game immediately; there is no Fury rescue.

## End and anti-stall

Health 0 means immediate defeat. At round-10 cleanup both lose 2 Health ignoring Block, increasing by 1 each subsequent round up to 18. Simultaneous defeat is a draw.

## Reproduce and verify

- `node brawl2/tools/build-one-deck.mjs` builds current data from `design/one-deck-proposal.json`, `design/complete-roster.mjs`, tuning overrides in the builder and archived artwork metadata.
- `node --test brawl2/tests/*.test.mjs` runs rule, network, conservation and public UI forecast checks.
- `AUDIT_LABEL=Release_Independent5400 AUDIT_SEED=3691000 GAMES_PER_PAIR=12 ALL_BUILDS=1 node brawl2/tools/audit-roster.mjs` reproduces the 5,400-game six-Hero audit.
- `node brawl2/tools/serve.mjs` serves localhost:8779/brawl2.
- `node brawl2/tools/smoke-one-deck.mjs` plays three complete two-seat HTTP games covering all six Heroes, checking privacy, retries and reconnects. Set `BRAWL2_URL=https://www.brht.ai` and `SMOKE_OUTPUT=Hosted_Online` for production.
- `node brawl2/tools/prepare-release.mjs` copies Brawl2 runtime files to the release repository.
- `node brawl2/tools/verify-one-deck-live.mjs` compares hosted source/artwork and checks both API versions.

Engine `brawl2-one-deck-2`. Versioned saves and rooms isolate older rules. No schema, RLS, scheduler data or access changes. This engine does not import the retained historical `effects.js`. Older builders/simulators and one-time UI migration scripts are historical, not reproduction steps. The current UI sources are `dist/app.js` and `dist/one-deck.css`.

## Balance status

5,400 final games: mean 4.22 rounds, p95 seven, 2.16 Loot and 18.38 Reactions per fight; 25 attack-starved plans / 45,602. Overall simulated win rates: Smasherton 51.3%, Alf 51.1%, Shealer 44.4%, Helga 47.9%, Raven 57.4%, Franc 47.7%. Five draws. Raven's pressure, Shealer against Alf and Shealer–Helga duration remain the watch list. Heuristic variants do not establish human balance or fun. Full decisions, changes, limitations and data: `outputs/brawl2-complete/Debrief.md` and `Release_Independent5400.json`.
