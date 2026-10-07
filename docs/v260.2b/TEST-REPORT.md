# V260.2B verification and rollout status

## Status

Implementation and local preparation are ready for review. **Live mirror upload
is blocked**: this environment has no build-side `SUPABASE_SERVICE_ROLE_KEY`.
The cloud environment configuration draft requests that secret securely. No key
belongs in browser code or chat. `public/card-assets.json` remains empty until
uploads are publicly readable and checksum verified. Production was not changed.

No new sets, cards, odds, ownership rules, unlocks or save migrations were added.

## Final catalogue audit

| Metric | Result |
| --- | ---: |
| Playable sets | 32 |
| Catalogue cards | 6,889 |
| Custom Specials | 19 |
| Prepared artwork identities | 6,908 |
| Valid tier files | 20,724 |
| Missing source references / failed assets / invalid prepared cards | 0 / 0 / 0 |
| Uploaded / mirrored | **0 — credential unavailable** |
| Runtime fallback-only identities | 6,908 |

There are no separate printing records in this catalogue; existing gameplay
finishes remain unchanged. Prepared size is not Supabase usage:

| Tier | Prepared bytes | Average bytes/card | Supabase uploaded bytes |
| --- | ---: | ---: | ---: |
| thumb | 73,875,166 | 10,694 | 0 |
| medium | 422,354,460 | 61,140 | 0 |
| high | 528,422,086 | 76,494 | 0 |
| Total | 1,024,651,712 | — | 0 |

Full machine-readable results: [catalogue audit](CATALOG-AUDIT.json) and
[12-card bandwidth sample](BANDWIDTH-SAMPLE.json). No full-library images are in Git.

## Automated checks

- `pnpm run release:check`: 279 Node tests passed; static and production smoke
  checks passed (52 production resources).
- The importer test wrapper includes seven Python cases: validation, dry-run,
  resume/repair, credentials, upload/remote resume, failed publication and
  same-card PNG recovery.
- Browser fixture: mirror thumbs in Collection, high Inspector, source/custom
  fallback and no Storage URL coupling in saves passed.
- Real service-worker test: image-element requests cached; bounds 1000/300/100;
  cached offline images, uncached offline placeholder and quota-failure network
  fallback passed. Storage responses were fixtures, not live uploads.
- Seven viewport layouts passed: 360x800, 390x844, 393x873, 412x915, 430x932,
  768x1024 and 1440x900. Single-pack recap fit its allocated viewport.
- Ten consecutive 10-pack openings passed with Samsung-style Chromium input and
  again with an iPhone user agent plus 2,500-card initial collection. Each run
  checked 1,000 cards, correct charges, reload, Master Set counts, artwork IDs,
  cash/starter/sealed funding, stable listeners and bounded heap growth.
- All 19 actual local Specials decoded, including the injected failure state.

The iPhone test uses Chromium with an iPhone user agent, **not native WebKit**.
Neither Android nor Safari has been physically certified.

## Measured performance

Local browser runs used stubbed external services while catalogue maintenance
and tests shared the cloud machine. These are functional stress measurements,
not a controlled before/after CDN benchmark.

| Test | Median 10-pack result | Range | Largest observed long task | Result DOM nodes |
| --- | ---: | ---: | ---: | ---: |
| Samsung-style, ordinary collection | 541 ms | 416–969 ms | 115 ms | 545 throughout |
| iPhone-style, 2,500-card initial collection | 2,008 ms | 842–2,487 ms | 787 ms | 545 throughout |

Listener counts stayed stable after reload (818 / 1028 respectively). There was
no duplicate inventory or accumulating recap DOM. The large-collection run is
above the desired one-second result target; this task does not claim to solve
all existing progression/serialization costs. Actual phone testing is required.

A 12-card sample spanning different source sets measured provider thumbnails at
17,935 bytes on average and prepared thumbs at 9,820 bytes: about **45% smaller**.
This measures payload, not network latency. The high tier retains a smaller
native WebP when possible; it does not invent detail by upscaling the original.

Cold-image estimates from that sample, before cache reuse:

| View | Existing source thumbs | Prepared mirror thumbs |
| --- | ---: | ---: |
| All 100 grid cards | 1.79 MB | 0.98 MB |
| Collection, 40 tiles | 717 KB | 393 KB |
| Binder, 9 tiles | 161 KB | 88 KB |

High reveal images, medium hit previews and inspector requests are additional,
on demand. The sample medium average is approximately 55 KB. A single pack may
load up to ten high images and its medium recap; caching avoids repeating the
same tier URL, but switching tiers is an additional request.

Live before/after timings for Rip image load, set switching, Specials, Binder,
Collection and ten-pack grid remain **unmeasured pending upload**. Existing
pack/set-logo assets are not part of the card-only mirror. Binder prewarming is
now limited to neighbouring pages rather than the whole collection.

## Remaining rollout work

1. Publish the secure environment configuration with the upload credential.
2. Upload/verify representative modern, historical and custom cards.
3. Resume the full upload from `.temp/card-mirror` using the documented command.
4. Audit the populated manifest and Storage sizes, run release check, then measure
   real CDN/phone behaviour before deployment.

No image-library files are committed. Local preparation is recoverable from the
ignored checkpoint on this machine. If the machine is discarded, source
preparation must be restored from that directory or repeated; already uploaded
assets can be resumed through the committed manifest.
