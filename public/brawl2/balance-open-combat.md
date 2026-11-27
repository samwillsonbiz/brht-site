# Brawl2: open movement and prepared Block

Rules version: `brawl2-open-1`. Published playtest revision, not a claim of final competitive balance.

## What changed

- All printed Move effects and Hero movement now allow either direction, partial movement, staying and legal crossing. Activation/on-hit/reaction timing is retained. Push and pull retain their meaning; occupied and closed spaces remain illegal.
- Defensive and resource/utility reactions can be played on either player’s reaction turn. Offensive attack modifiers still require your active attack. Mixed Loot packages containing an offensive modifier retain that requirement; bonuses are not stored for a future attack.
- Prepare Block while attacking; keep it until the next enemy attack finishes, or round end. Cap remains 6. Damage and printed costs consume it normally. This expiry applies even if the enemy attack misses.
- Helga may Brace on either reaction turn, once per active attack. Shield Dividend can spend Block for Coins in either role.
- Hold Your Ground now waits for the next enemy attack this round. No reward after your own attack. Copies stack, Coin cap stays 8, attack wall damage cancels the reward, independent Loot damage is separate, unused promises expire at round end. The pending count is visible.

## Narrow balance adjustments

- Marcus: Walking Wall moves in either direction, once per enemy attack. March On Reaction: Move 2 + 1 Block (was Move 3 + 1 Block).
- Vera: normal Technique earning is first damaging attack per round. Measured Cut Reaction grants 2 Block (was 3); printed token exceptions remain.
- Mei: Flying Swallow and Falling Blossom attacks deal 3 (was 4). Both retain Move 2, their ranges and Reaction movement. Sky-Cutting Sword remains an 8-damage signature attack.

## Matched prepared-deck test

1,620 candidate fights versus 1,620 control fights: identical seeds, complete prepared loadouts, alternating seats and three heuristic policy conditions. Each Hero has 324 appearances. These are bots, not expert or human play.

| Hero | Published control | Candidate |
|---|---:|---:|
| Marcus Ironheart | 46% | 49.1% |
| Sibu Stormspear | 47.5% | 44.4% |
| Vera Vendetta | 56.8% | 53.4% |
| Mei Windwalker | 59.6% | 58.6% |
| Lord Smasherton | 54% | 48.8% |
| Alf Featherbottom | 48.5% | 49.4% |
| Dr. Shealer | 40.1% | 41.7% |
| Helga Stonewall | 55.9% | 57.1% |
| Raven Madison | 42.6% | 46.9% |
| Friar Franc | 47.8% | 48.5% |

Candidate mean rounds: **3.98**, control 3.96. Mean Loot plays: 2.63 vs 2.57. Miss rate: 27% vs 26.1%. Candidate fights reaching round 10: 4/1620. Rounds do not establish human duration or handling time.

## Counter-build and exploit checks

Separate populations: 1,440 style-screen games; 2,880 counter-selection games; 1,080 fresh-seed selected-counter games; 6,156 adaptive-search training games; 648 fresh-seed adaptive-counter validation games. Search samples are training results and must not be pooled into roster win rates. Styles cover kite/economy, pursuit, burst, piercing, fortress, cycle and defaults.

The final screen did not establish a universal movement-plus-Basic-economy exploit. This does not prove one cannot exist. Card/token/Loot conservation, resource limits, closed-space legality and bounded completion are checked throughout. The repetition detector now includes Spike Walls and new round/pending fields, avoiding a false repeat on a meaningful terrain placement. Counter selection now filters to the intended challenge rather than mixing reverse challenges.

## Remaining balance risks

Prepared decks span 41.7–58.6%, but specialized builds expose larger disparities. In 24-game fresh-seed adaptive-counter checks, counter-player wins against Mei pursuit were Sibu 38%, Vera 25%, Smasherton 25%, Shealer 50%, Helga 29%. Against Alf pursuit: Marcus 25%, Sibu 17%, Vera 21%, Shealer 58%, Franc 50%. These are small samples selected after search, with limited reactive AI. They are warning signals, not reliable matchup percentages or proof that human counters are absent.

Prioritize human Mei–Smasherton, Mei–Vera, Alf–Sibu and Alf–Marcus; swap players and seats, retain exact decks, and record cards/tokens/Coins spent to approach or escape. Check whether the player saw a useful answer, not only who won. No human or physical sessions were performed in this update.

## Verification

198 automated rules/UI/server tests. Five complete local two-client matches, all ten Heroes, 561 authoritative commands, including market/blind purchases and hidden-hand checks. Production build passed. Live multiplayer verification is recorded separately after deployment.

## Files

`final.json` and `control.json` contain exact configurations, seeds and per-game rows. Candidate and control engines are frozen under `brawl2/experiments/open-combat/` and `pre-open-combat/`. The printable review kit and `brawl2/README.md` reflect the same current rules.
