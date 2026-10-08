# Current-catalogue artwork mirror

This maintenance pipeline does not add sets or change gameplay, card ownership,
pull rates, Master Set requirements or saves. Its source of truth is the `SETS`
registry in `public/runtime/core.js`, the matching `public/catalog/*.json` files,
and the 19 existing custom Specials in `special-collection.js`.

Inventory: 32 playable sets, 6,889 catalogue identities and 19 custom Specials:
6,908 artwork identities. There are no separate printing records in these
catalogues; gameplay finishes are not additional artwork identities. All records
have source artwork references. Reference completeness does not prove that every
provider URL currently returns an image.

## Explicit maintenance commands

Prerequisites: Node/pnpm, Python 3 and ImageMagick (`magick` or `convert`).

```sh
pnpm run cards:sync -- --dry-run
pnpm run cards:sync -- --local-only --concurrency 3
pnpm run cards:sync -- --set sv04.5 --local-only
pnpm run cards:sync -- --retry-failed --local-only --concurrency 2
pnpm run cards:audit
```

Preparation, source downloads and checkpoints live in ignored
`.temp/card-mirror/`. Preserve that directory when moving machines to retain
local-only progress. Preparation uses at most six workers; verified uploads permit at most thirty-two.
Valid tier hashes are reused; existing source downloads are
reused when a tier needs repairing. One sync process may run at a time. `--resume-verified` skips remote revalidation
of complete, previously checksum-verified manifest entries; use it to continue
an interrupted bulk upload. Omit it when auditing/revalidating existing objects.
`--card <id>` can be repeated; `--set specials` selects custom art. No command
imports a set outside the current registry. Dry-run/audit do not mutate files or
contact Storage; uploaded figures reflect the verified manifest, not a live
bucket inventory.

For upload, configure **build-side** environment secrets, never Vite variables:

- `CARD_ASSET_SUPABASE_URL`: existing project HTTPS URL
- `CARD_ASSET_BUCKET`: `card-assets`
- `SUPABASE_SERVICE_ROLE_KEY`: privileged upload credential, kept outside Git

```sh
# Verify a small representative pilot before the full upload.
pnpm run cards:sync -- --set sv04.5 --limit 3 --create-bucket
pnpm run cards:sync -- --set xy12 --limit 3
pnpm run cards:sync -- --set specials --limit 3
pnpm run cards:sync -- --concurrency 3
pnpm run cards:sync -- --retry-failed --concurrency 2
pnpm run cards:audit
pnpm run release:check
```

`--create-bucket` creates a dedicated public WebP bucket only when missing. An
existing private bucket is rejected, not made public. The default prepared-tier
budget is 2 GiB; `--max-total-mb` changes it after a storage review. Do not run a full release check while a sync is publishing the manifest;
finish the sync first so read-only snapshot assertions see a stable file.
Normal CI/build
never runs the catalogue sync. CI only converts a local sample during importer
tests. Do not commit `.temp`, source images, credentials or the generated image
library.

## Validation and publication

Downloads must have an image content type, sensible byte size, full decodability,
a single frame and card-like dimensions/aspect ratio. ImageMagick strips metadata
and produces widths up to 200/500/1000 at WebP quality 75/85/92. Smaller originals
are **not upscaled**. An already suitable native WebP is retained when it is
smaller than a redundant re-encode, preserving its original detail. Most TCGdex originals are 600px wide; the high tier preserves
that genuine source resolution instead of claiming invented 1000px detail.

Objects are immutable:
`cards/<set-id>/<card-id>/<content-hash>/<thumb|medium|high>.webp`.
Uploads receive a one-year immutable cache header. All three public objects are
read back and their SHA-256 hashes verified before a card entry is published to
`public/card-assets.json`. Partial uploads do not publish partial cards. Subsequent
syncs HEAD-check complete mirrored cards and can skip without downloading their
source again. Interrupted uploads recover by checking existing hashed objects.
Failed publication never adds an incomplete card. Uploads use the build-side
Supabase API key in the `apikey` header. If the gateway requests authorization
context, a bounded retry adds the same key in `Authorization`; an invalid-JWT
response removes that header on the next retry. The key never enters runtime code.
A resumed duplicate is accepted only after public content passes its checksum.
Verification bypasses cached missing-object responses and tolerates a short
read-after-write delay. The observed intermittent gateway `Invalid Compact JWS`
response has bounded retries using the same API key; other authorization failures
are reported, not retried as though they succeeded. Failures record set, immutable card ID, source URL and reason in the checkpoint.
A missing TCGdex high WebP may use the same card’s PNG export; card identity and
catalogue source data are not changed.

## Runtime

`src/artwork/card-assets.js` owns resolution: explicit custom override, verified
Supabase manifest tier, existing provider/custom source, local placeholder.
Original custom art is preserved. A node-local error chain advances through these
sources. The manifest is presentation data, not player state; no Supabase URLs are
written into card identity or saves. Existing legacy source metadata in old saves
is intentionally left unchanged.

Collection, Bulk, market lists, grading queues, Specials and the 100-card grid use
thumbs; recaps/trade offers/physical Binder use medium or appropriately sized
thumbnails; reveals, full slabs and Inspector request high. The legacy image
observer bridges older renderers, while primary renderers resolve before setting
`src`. The Binder no longer prewarms its entire collection. Browser lazy loading
and asynchronous decode are used; full-screen art is loaded on demand.

The service worker does not precache the card library. Separate cache-first
artwork caches are capped at 1,000/300/100 entries (thumb/medium/high), using FIFO
cleanup. IndexedDB artwork caches have corresponding bounds. Cache/quota failure
falls back to network and does not block game state. Cached art works offline;
uncached artwork shows the bundled placeholder. The service-worker version and
build ID were advanced to avoid mixed runtime assets.

## Verification and limits

- Node tests exercise priority, overrides, URL safety, tier contexts, fallback,
  source enumeration, dry-run and manifest invariants.
- Python tests cover conversion, resume, corruption repair, missing credentials,
  mocked verified upload, remote skip and failed publication.
- `verify-card-mirror-browser.cjs` uses a mocked Storage mirror to test real
  browser requests, high-art Inspector, fallback and save independence.
- `verify-card-cache-browser.cjs` tests actual service-worker bounds and offline
  behaviour against fixture artwork.
- Existing mobile stress tests cover ten consecutive 10-pack openings, charging,
  ownership, reload, listeners, heap and Specials fallback.

Mocked Storage tests are not a live upload certification. The complete manifest now contains 6,908 verified cards. Live phone performance
measurements remain a release acceptance check. Native Safari,
Samsung Internet and real-device performance still require physical testing.
