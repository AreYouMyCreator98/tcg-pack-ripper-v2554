# V264 — Ten more expansions

This release extends the existing 32 playable expansions to **42**, retaining all previous set order, unlock XP requirements, player ownership and save schema.

| Set | ID | Cards | Availability |
| --- | --- | ---: | --- |
| Pitch Black | `me05` | 120 | Starter |
| Black Bolt | `sv10.5b` | 172 | Level 4 |
| White Flare | `sv10.5w` | 173 | Level 4 |
| Prismatic Evolutions | `sv08.5` | 180 | Level 10 |
| Jungle | `base2` | 64 | Level 26 |
| Fossil | `base3` | 62 | Level 28 |
| Team Rocket | `base5` | 83 | Level 32 |
| Neo Genesis | `neo1` | 111 | Level 36 |
| 30th Celebration | `30th` | 188 (includes 30 Classic Collection) | Reach Diamond (1,000 RP) |
| Base Set — 1st Edition | `base1` | 102 | Level 50, Diamond, 5 completed Master Sets, 1,000 opened packs |

Total: **1,255 new card records**. The 30th Classic Collection is a subset of the anniversary expansion, not an eleventh standalone set. New local checklists, packs and logos are included in the installable site's cache.

## Pull behavior

- The five vintage expansions use a dedicated six-common, three-uncommon, one-rare format. Rare holos are treated separately from non-holo rares, with a roughly one-third holo chance in the rare slot.
- Modern expansions inherit the existing Scarlet & Violet-style ten-card generator. New Mega Hyper Rare, Black White Rare, Pikachu Rare, and Futuristic Rare identities remain in their source checklists and can be chased via hit/wildcard slots.
- The 30th Classic Collection has a separate 10% chance in one reverse slot; all thirty classics also remain in the Master Set checklist.
- Existing God Pack rate remains **1 in 1,000**; the global starter-pack guarantees are unchanged.

## Images and values

- Card metadata came from [TCGdex cards-database](https://github.com/tcgdex/cards-database), with each first-edition and holo marker derived from a literal source field. All local artwork links point to the TCGdex image CDN.
- The thirty Classic Collection's anniversary-stamped images were unavailable at import time. They use verified, corresponding historical printing artwork (see each card's `_historicalArtId`); this **does not reproduce the 30th stamp**. Those images can be replaced once the real scans are available.
- Pack art is based on documented [SealedDex](https://sealeddex.com/) sources. These remain third-party copyrighted artworks; confirm reuse permissions before commercial distribution.
- New card prices are balanced **in-game estimates**, not actual trading-card valuations. They are deterministic, so the game works even without a pricing endpoint.

## Backend migration and seed

Only these two files need applying to the existing Supabase Trade Hub, in order:

1. `supabase/migrations/20261029000000_v264_prestige_set_unlocks.sql` — checks the Diamond/Collector Level/pack-count/Master Set requirements against saved and ranked profile data. Already-unlocked sets remain unlocked permanently.
2. `supabase/seed-v264-sets.sql` — upserts exactly ten expansion definitions and 1,255 card rows. It does **not** modify existing player saves or legacy catalog entries.

The local game awards one free Base Set — 1st Edition sealed pack credit when its requirements are first satisfied. Subsequent checks do not grant extra credits.

Rebuild reproducibly with:

```bash
node scripts/import-v264-sets.mjs /path/to/tcgdex-cards-database
node scripts/generate-v264-seed.mjs
pnpm run release:check
```

Do not execute the metadata import script against unreviewed third-party directories. The source files are read as text, never executed.
