# V260.2A three-set admission audit — blocked, not implemented

Audit date: 8 October 2026 (Australia/Adelaide).
Existing game remains V261. No downgrade, new selectable set, reward, migration,
price change, Storage upload or production deployment was performed.

The user's first instruction is the admission gate: **if a set cannot be obtained
in full, including hits and pack art, do not add it.** The later custom-set
fallback does not override that completeness requirement.

## Source results

| Requested content | Source classification | Records | Image endpoint checks | Admission |
| --- | --- | ---: | ---: | --- |
| Pitch Black | OFFICIAL SOURCE-BACKED, TCGdex `me05` | 120/120 | 120/120 HTTP 200 image responses | Blocked: no verified pack art |
| 30th Anniversary | Closest OFFICIAL SOURCE-BACKED candidate: `30th`, named **30th Celebration** | 158/158 | 158/158 HTTP 200 image responses | Blocked: exact requested scope and pack art unverified |
| Base Set 1st Edition | OFFICIAL SOURCE-BACKED Base Set `base1`, with First Edition variants | 102/102 | 102/102 HTTP 200 image responses | Blocked: pack art and complete printing-specific art verification |

All 380 card detail responses contain rarity metadata. Full per-card evidence is
in `source-audit.json`. Image checks are HTTP HEAD/content-type checks, **not**
a claim that every file was downloaded and decoded or visually certified.

Pitch Black includes Common, Uncommon, Rare, Double rare, Illustration rare,
Ultra Rare, Special illustration rare and Mega Hyper Rare. The last card is
Mega Darkrai ex (`me05-120`); its image was downloaded and decoded successfully.
Do not map Mega Hyper Rare through the old modern-set model without explicit
rarity mapping and generator/economy tests.

The English set listing has no exact "30th Anniversary" label. It lists
`30th Celebration` (158) and `30th Classic Collection` (`30th-c`, 30). The latter
has **30/30 missing image URLs** in the set listing. Do not silently combine the
two or describe the combined pool as complete. The main candidate includes
Pikachu Rare and Futuristic Rare, which require deliberate generator mapping.

All 102 Base Set records advertise First Edition support, but none supplies a
separate image field on a First Edition detailed variant. Downloaded samples
Charizard #4, Pikachu #58 and Water Energy #102 visibly carry First Edition stamps.
That is encouraging evidence, not certification of the other 99 images. Existing
Unlimited identities must not be overwritten. Samples from Pitch Black and Base
Set are 600x825: do not manufacture an 800–1200px-wide "high quality" source by
upscaling these and claiming extra detail.

## Pack-art sourcing attempts

TCGdex set payloads do not supply pack-art fields. The following requests were
blocked by HTTP 403 / CONNECT access errors:

- `tcg.pokemon.com` (Pitch Black expansion page)
- `www.pokemon.com` (TCG source index)
- `bulbapedia.bulbagarden.net` (Pitch Black and Base Set articles)
- `www.pokebeach.com`
- `www.sealeddex.com`, `api.sealeddex.com`, `images.sealeddex.com`
- `tcgdex.dev` (asset documentation)

An existing known-good pack URL from the current game was also denied by the
pack image host. These results establish an access limitation here, **not** that
packaging does not exist. No proxy workaround or generated official packaging
was used. The supplied smoke ZIP contains decorative assets, not set packaging.

To continue sourcing, make these source hosts accessible in environment network
settings or provide a verified downloadable pack-art source. A complete set must
pass the card/printing/pack-art gate before integration.

## Current integration map

| System | Current source of truth | Required implementation after admission |
| --- | --- | --- |
| Set registry, chases, pack images | `public/runtime/core.js`: SETS, CHASE_CARDS, OFFICIAL_PACK_ART | Manifest-backed definitions, verified pack/logo assets, explicit display order |
| Set/card catalogue | `public/catalog`, `supabase/catalog`, `src/collector/catalog-counts.js`, `scripts/import-hub-catalog.mjs` | Matching client/server catalogues and integrity checks; preserve current IDs |
| Ranked authority | `hub_private.profiles.rp`, `season_high`; server battle settlement | Diamond at 1,000 RP; durable entitlement and atomic one-time rewards |
| Historical rank | V256 cutover copies `mp_profiles.ranked_season_high` | Reliable recorded high only; no invented missing historical ranks |
| Collection/progression | `src/collector/model.js`, collector bridge | Starter eligibility only for eligible accounts; milestone/Journal integration |
| Card identity | `src/artwork/card-identity.js` | Explicit edition-safe identity; current parsing derives set from last hyphen |
| Artwork | `src/artwork/artwork-resolver.js`, APP_CONFIG card-art-v239, cache/queue/DB modules | Custom override → controlled Storage → source → fallback, tier-specific keys |
| Marketplace/trades | hub private catalogue and transactional SQL RPCs | Server catalogue/edition identity and trade/listing escrow validation |

Do not use client-supplied `season_high` or local rank as proof. Existing collector
levels, Master Set totals and packs-opened counters are not automatically trusted
server evidence just because they are included in a cloud save. Define validation
before granting server entitlements from those legacy fields.

Proposed requirements remain as requested, not silently tuned: Pitch Black starter;
Anniversary highest verified Diamond; Legacy level 50 AND verified Diamond AND
five normal Master Sets AND 1,000 packs. No live QA account distribution was
available to justify tuning. One-time rewards (3 / 1 packs) require atomic receipts.
No entitlement or reward was issued during this audit.

## Storage pilot status

No files mirrored: thumb 0 bytes, medium 0 bytes, high 0 bytes, total **0 bytes
uploaded by this task**. This is not a measurement of existing project storage.
No provider configuration or storage write credentials were found in environment
variable names. Only the public client project configuration is established.
A read-only Supabase CLI project listing failed before authentication because it
attempted to create `/home/agent/.supabase` on a read-only filesystem. Consequently
CLI account/project or Storage write readiness is **unverified**, not established
by the frontend's publishable key. No production bucket/RLS was changed.

`cards:sync`, three-tier mirroring, custom manifests, new unlock UI, achievements,
Master Set rewards and new-set economy simulations were not implemented: there
is no admitted complete pilot set to enable yet. No whole-library mirror started.

## Validation and recommendation

The unchanged game's full release check was run to verify the baseline. See the
validation result below. New-set opening, Master Sets, marketplace, grading,
10-pack timings, collection timings and Legacy/Diamond unlock tests are **not
run**, because none of these sets was enabled. Existing tests must not be passed
off as new-set certification.

Recommendation: do not start full catalogue mirroring. First resolve pack-art
access, settle the Anniversary set scope, finish Base First Edition art checks,
then provision a scoped Storage uploader and validate one admitted set end-to-end.

Baseline result: `pnpm run release:check` passed — 269 tests, zero failures or
skips, static smoke, production build and 50-resource production smoke passed.
