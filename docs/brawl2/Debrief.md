# Brawl2 — Six-Hero single-deck release

20 November 2026 · engine `brawl2-one-deck-2`

## What is playable

All six Heroes now use the same single-deck rules. Each has a 40-card pool (20 designs, two copies each), three Fury choices and three example 24-card builds. Players can customize or randomize their deck; custom selections are saved in this browser. One hand holds Attacks, Reactions and Dual cards. A Dual card can do one job, not both. Solo, pass-and-play, mirror matches and private online duels use the same engine.

The original `/brawl` is preserved. The previous two-Hero one-deck release is archived at `brawl2/archive/one-deck-1`; production rollback commit: `f8f2808d752c548eb129e5817cf6319e1406934c`.

## The six identities

| Hero | Main decision | Passive and low-Health upgrade |
|---|---|---|
| Smasherton | Get close, force the rival into a wall, then cash in a heavy hit. | Wall slams deal 2 instead of 1; upgrade to 3. |
| Alf | Keep distance, spend movement to preserve a firing lane, choose when to stand and shoot. | Ranged cards gain 1 maximum Range; attacks at distance 2+ gain 1 damage, upgrading to 2. |
| Shealer | Trade Health for burst without spending so much that the return attack kills you. | Healing effects restore 1 extra; upgrade discounts Health payments by 1, minimum 1. |
| Helga | Save shield for defense or spend it to hit harder. | Keep up to 2 unused Block between attacks, upgrading to 4; clear it at round end. |
| Raven | Cross the rival at the right moment rather than simply running away. | First crossing before the strike gives 2 damage when attacking or 2 Block when defending; upgrade to 3. |
| Franc | Combine an ordinary Reaction with a signature attack to make the whole hand useful. | First Basic Reaction during a Hero/Fury attack adds 1 damage; upgrade to 2. |

All pools use the same composition: eight Attack-only, eight Dual and four Reaction-only designs, with two copies of each. This makes deck construction recognizable while leaving 24-card selection unrestricted. Hero cards offer identity and stronger effects; resolved Basic attacks fund Loot. Specializing in one reduces access to the other.

## Rules retained and clarified

- 20 Health, zero Coins, seven arena spaces, opening hand seven.
- Choose two attacks. Resolve each with alternating reactions; two consecutive passes settle the hit. Movement is chosen on the arena when it resolves.
- Keep unused cards; draw at most four at round end, stopping at seven. No automatic mid-combat draw. At most one printed draw effect per player per active attack, including printed activation draws.
- Basic attacks earn one Coin, even on a miss. Reactions and Hero/Fury attacks earn none. Loot costs two; buy one blind card at round end and hold at most two.
- Chosen Fury begins beside the Hero, enters hand once at ten Health, then cycles through the deck. The passive upgrades once at five Health. Healing does not reset either unlock.
- Block caps at six. Helga's bank is the explicit exception to clearing Block after each attack. On-hit effects require actual Health damage. Health costs cannot kill the paying player.

## Card and balance work

The initial full-roster trial showed a weak Alf, excessive free offense/defense on Helga, weak crossing rewards for Raven and overly efficient burst/draw on Franc. The final values reflect these adjustments:

- **Shared Basics:** Advance's Attack moves up to two instead of one; its Reaction remains Move 1. Wide Swing deals three instead of two. Flexible Basics should be useful plays as well as a source of Coins.
- **Alf:** Power Shot's minimum Range is two instead of three. Piercing Arrow deals five instead of four. Backflip Shot deals three instead of two; its Move 2 Reaction can be used on either player's attack. Perfect Aim adds two damage and ignores two Block. Long Shot's damage reward begins at actual distance two, while its extra maximum Range still requires a printed minimum of at least two. The upgraded maximum Range stays +1.
- **Helga:** Shield Bash gains one Block and may spend two for +2 damage; Iron Fist starts at three damage and may spend two Block for +3. This leaves a real choice between keeping protection and converting it into damage.
- **Raven:** Crossing rewards two rather than one, upgrading to three; it triggers only once per active attack and never after that attack has already hit. Backstab deals five and ignores two Block.
- **Franc:** Battle Cry adds two damage. Quick Prayer draws two only during his own attack and respects the once-per-attack draw limit. This keeps his combo identity without unlimited defensive draw or free burst.
- **Shealer:** Life Transfusion deals four, restoring one Health on hit before his healing bonus. His other healing effects are deliberately modest; paying Health remains a risk.

The four added Heroes and their card pools are new to this one-deck build; the comparisons above for them describe tuning during development, not changes to cards previously live in the two-Hero version. Existing Loot effects and all existing artwork/audio are reused.

## Interface

The top navigation is now 40px high. Compact Hero panels retain portraits, Health, Coins, Block and Fury status; clicking a portrait opens the Hero guide. One status/action bar explains whose turn it is, what happens if both pass and which button advances play. Revealed attacks use compact illustrated panels, leaving more room for the fighters and mixed hand. Reaction halves become prominent during combat; unavailable cards state why. Mobile keeps cards readable in a horizontally scrollable hand.

## Final balance audit

5,400 completed fights: all 15 different-Hero matchups; all nine example-build combinations plus random decks; both seats; three policy pairings. Each game uses a distinct hashed seed. Every command checks card conservation, valid positions, Health, Block, Coins and Loot counts.

| Hero | Wins / games | Win rate |
|---|---:|---:|
| Lord Smasherton | 923 / 1800 | 51.3% |
| Alf Featherbottom | 919 / 1800 | 51.1% |
| Dr. Shealer | 800 / 1800 | 44.4% |
| Helga Stonewall | 862 / 1800 | 47.9% |
| Raven Madison | 1033 / 1800 | 57.4% |
| Friar Franc | 858 / 1800 | 47.7% |

Five games ended in draws. Average fight: **4.22 rounds**, 95th percentile **7**, longest **13**. Average **18.38 Reactions** and **2.16 Loot plays across both players** per fight. 28.5% of recorded attack attempts missed on range. Only **25 of 45,602 planning steps (0.055%)** supplied fewer than two attacks across these builds. All games terminated; all resource/card checks passed.

This is promising playtest readiness, not final competitive balance. These are three weightings of one public-information heuristic, not independent human opponents. The bot was improved to value future position, saved reactions, Hero passives and optional payments. Earlier win rates are therefore not a controlled before/after comparison, and should not be treated as precise improvements in human balance.

**Remaining watch list:** Raven is high at 57.4%; Shealer is low at 44.4%. Alf beats Shealer 64.7% in this sample. Raven beats Alf and Helga about 61%. Shealer versus Helga averages 6.1 rounds and reaches round ten in 45/360 games; this is the main stall risk. Ninety of all 5,400 games reached round ten, so the sudden-death rule remains useful. These are the first matchups to test with people before another numerical pass.

## Fun assessment and next playtest

The architecture now supports the behavior the earlier successful battle demonstrated: set up a threat, bait movement, decide whether to spend a response, then counterattack. The strongest new distinction is the cost of a Dual card: using it as an attack removes a possible answer from the same hand. Low attack starvation suggests the unified deck need not routinely lock players out, while a four-card refill makes spending every answer consequential.

What the simulation cannot establish is whether those choices feel good, whether children understand them, or whether the remaining passes feel repetitive. Play two games each of Alf–Shealer, Raven–Alf and Shealer–Helga, swap sides, and note: turns with a meaningful alternative; times a saved Reaction mattered; moments Loot reversed a threat; unclear card wording; and real elapsed minutes. Keep the one-deck structure stable during this test. Tune individual cards after observing where players feel powerless or where one answer is always correct.

## Verification and release evidence

Automated rules/network/forecast tests, complete two-seat HTTP games, desktop/phone browser checks, a production build and hosted file comparisons accompany this release. Exact test totals, deployment SHA and hosted results are recorded in the adjacent `Release.json`, `Tests.txt`, `Release_Tests.txt`, `Hosted_Online.json` and `Live_Files.json`. The full balance data is `Release_Independent5400.json`.
