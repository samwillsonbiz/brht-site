# Brawl2 release debrief

## What changed

All six Heroes now use the tested extremes card pools: 20 designs × 2 copies, draft any 24. There are no point values or Basic/Hero quotas. Each pool has only 3 attack-only designs, 13 Dual designs and 4 reaction-only designs. Even the most attack-heavy legal draft therefore includes at least 18 reaction-capable cards. Fury remains separate.

- Smasherton: huge hits, shield-breaking, discard-fueled force and pushes that can work through Block.
- Alf: positioning, Scry and prepared shots that break shields or widen range.
- Shealer: pay Health before reactions for risky burst, heal and trade cards for survival.
- Helga: bank up to 3 Block (5 upgraded), spend it on speed, mobility or damage.
- Raven: crossing offense, hand disruption and stealing Coins; no defensive crossing Block.
- Franc: 2 Coins from Basic Attacks, paid speed/draw/recovery, and upgraded damage while holding 3 Coins.

## Alf’s release tuning

**Prepared Shot:** Move up to 2, Scry 2, prepare the top card, then hit for 4 at Range 2–4 (before his passive). **Perfect Preparation:** Scry 2, prepare, then ignore 2 additional Block. Preparation reveals and bottoms the top card: an Attack-capable card grants +2 damage and ignores 2 Block; a Reaction-only card makes minimum Range 1 and adds 2 maximum Range. **Pinning Shot:** on a Health-damaging hit, pushes up to 1 and removes up to 2 enemy Coins. Full Block or a miss prevents the on-hit denial.

This improves his specialist tools, not every Alf card. Helga retains her large shield bank. Franc retains double Basic income. Both can still answer with movement, hand pressure and timing.

## Game flow and presentation

- Optional automatic reveal/result pacing; it always stops for reactions, movement and private decisions. Manual pace remains available. Online host controls automatic pacing; guests can still advance manually. Pass-and-play stays manual.
- Round progress strip, highlighted active attack, resolved-card dimming, clearer damage forecast and actual modified Speed.
- Private Scry panel with click-to-order cards; separate discard/recover choices; explicit resource costs for speed and damage payments.
- Public preparation reveal, clearer coin/payment/effect logs, corrected Franc coin labels and damage forecast when spending loses his upgrade bonus.
- Compact HUD, larger fighters on normal desktop heights, mobile sticky action controls and horizontally scrollable hands. Existing artwork, animated arena and audio retained.
- New match/save version prevents old rules from being mixed with the new deck system. Original Brawl is untouched.

## Balance evidence

Final varied-draft test: **5,040 games**. Final fixed strong-build test: **3,600 games**. Both use the same seeds and matchup/deck selection as their pre-tuning comparisons. Policies are three weightings of one heuristic, not three independent agents. Their resource and positioning judgment is imperfect; results are diagnostic, not proof of human balance or fun.

| Hero | Previous strong-build win % | Final strong-build win % | Final varied-draft win % |

|---|---:|---:|---:|

| Lord Smasherton | 52.5 | 51.33 | 50.36 |

| Alf Featherbottom | 33.33 | 42.17 | 50.06 |

| Dr. Shealer | 45.92 | 44 | 47.44 |

| Helga Stonewall | 58.42 | 55.25 | 43.1 |

| Raven Madison | 49.92 | 48.08 | 57.5 |

| Friar Franc | 59.92 | 59.17 | 51.55 |

Alf vs Helga in fixed strong builds: **22.5% → 38.33%**. Alf vs Franc: **24.17% → 27.92%**. Alf overall: **33.33% → 42.17%**. This is a meaningful improvement, but Franc’s strong package remains an unresolved pressure point.

Final varied drafts average **4.02 rounds**, 95% finish by round 6. Average reactions 18.56 and Loot played 2.24 per fight. Planning hands with at least four attack-only cards: released old system 47.01%, new release 3.63%. This is a system/AI comparison, not an isolated single-card experiment.

## Counter search

Screened 16 candidate drafts each for Smasherton, Shealer and Raven; 22 for Alf (including three purpose-built counter concepts with two Fury choices), against the fixed Helga/Franc packages. Each screening candidate played 24 games. Best screened candidates then played 180 fresh-seed games per target. Alf’s final counter search was rerun after his second tuning pass. Screening is deliberately shallow and can overfit.

| Challenger | Holdout vs Helga | Holdout vs Franc |

|---|---:|---:|

| SMA | 67.2% | 48.9% |

| ALF | 41.1% | 33.3% |

| SHE | 33.3% | 35.6% |

| RAV | 43.3% | 40.6% |

Smasherton’s discovered counter beats Helga but only breaks even against Franc; the other searches did not find reliable answers to Franc. Preserve the distinct identities for this playtest, but do not label this tournament-balanced. Human tests should compare Franc’s income/draw/recovery with his opponents’ ability to deny positioning and force resource spending.

## Next human playtest

Play Alf vs Helga and Alf vs Franc with both players swapping Heroes. Track whether Scry creates a satisfying decision, whether Franc’s extra Coins leave meaningful tradeoffs, whether movement counters remain available, and whether the new Dual-heavy hands avoid the old attack-only backlog. Also test Raven against less-specialized builds: her mixed-draft result remains high. Do not infer enjoyment from simulator round count.

## Verification

83 engine, construction, presentation and room tests pass. Includes private Scry projection, reconnect, no hidden-hand/deck access, reveal-speed ordering, payment safety, Coins, Block, Fury, movement, card conservation and forecast correctness. Next production build passes. Local complete HTTP matches cover all six Heroes; live release checks are recorded separately after publishing. Original Brawl’s 58 recorded hashes are unchanged.

## Reproduction

`node --test brawl2/tests/*.test.mjs`

`LABEL=mixed-final COUNT=112 SEED=final-comparison node brawl2/experiments/extremes-release/audit.mjs`

`CHAMPIONS=1 SEARCH_DECKS=1 LABEL=champions-final COUNT=80 SEED=champions-fresh node brawl2/experiments/extremes-release/audit.mjs`

`ONLY=ALF node brawl2/experiments/extremes-release/counters.mjs`

Raw results, seeds, individual matches, selected drafts and test transcripts are beside this file. The earlier experiment is preserved in `brawl2/experiments/extremes-v1`; prior playable source in `brawl2/archive/one-deck-2`.
