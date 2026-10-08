# V260.2B verification and rollout status

## Status

The complete current catalogue is mirrored in the dedicated public Supabase
`card-assets` bucket. Every card's three tier objects were read back and checksum
verified before its runtime manifest entry was published. Upload credentials are
build-side only. The populated manifest and resolver are on the review branch;
**the live GitHub Pages site has not been changed**.

No new sets, cards, odds, ownership rules, unlocks or save migrations were added.
Legacy source URLs for subsets such as Galarian Gallery now resolve through the
manifest’s source index, preserving their actual catalogue identities.

## Final catalogue audit

| Metric | Result |
| --- | ---: |
| Playable sets | 32 |
| Catalogue cards | 6,889 |
| Custom Specials | 19 |
| Prepared artwork identities | 6,908 |
| Valid tier files | 20,724 |
| Missing source references / failed assets / invalid prepared cards | 0 / 0 / 0 |
| Uploaded / mirrored | **6,908** |
| Runtime fallback-only identities | 0 |

There are no separate printing records in this catalogue; existing gameplay
finishes remain unchanged. Prepared and verified uploaded payload sizes match (excluding other buckets
and Storage metadata):

| Tier | Prepared bytes | Average bytes/card | Supabase uploaded bytes |
| --- | ---: | ---: | ---: |
| thumb | 73,875,166 | 10,694 | 73,875,166 |
| medium | 422,354,460 | 61,140 | 422,354,460 |
| high | 528,422,086 | 76,494 | 528,422,086 |
| Total | 1,024,651,712 | — | 1,024,651,712 |

Full machine-readable results: [catalogue audit](CATALOG-AUDIT.json) and
[12-card bandwidth sample](BANDWIDTH-SAMPLE.json). No full-library images are in Git.

## Automated checks

- `pnpm run release:check`: 280 Node tests passed; static and production smoke
  checks passed (52 production resources).
- The importer test wrapper includes twelve Python cases: validation, dry-run,
  resume/repair, credentials, upload/remote resume, failed publication and
  same-card PNG recovery, gateway error handling, preserved error bodies and
  bounded header negotiation. Interrupted publication and verified-resume paths
  are covered without overwriting existing objects.
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

The final browser runs used stubbed external services and the complete runtime
manifest after catalogue upload had finished. These are functional stress measurements,
not a controlled before/after CDN benchmark.

| Test | Median 10-pack result | Range | Largest observed long task | Result DOM nodes |
| --- | ---: | ---: | ---: | ---: |
| Samsung-style, ordinary collection | 456 ms | 424–629 ms | 105 ms | 545 throughout |
| iPhone-style, 2,500-card initial collection | 962 ms | 796–1,398 ms | 350 ms | 545 throughout |

Listener counts stayed stable after reload (818 / 1028 respectively). There was
no duplicate inventory or accumulating recap DOM. Some large-collection results remain
above the desired one-second target; this task does not claim to solve
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

Live browser before/after timings for Rip image load, set switching, Specials,
Binder, Collection and ten-pack grid remain **unmeasured**. Chromium rejects the
environment proxy certificate; automatic approval review rejected adding that
certificate to its persistent trust store. TLS verification was not disabled.
Independent TLS-verified public HTTP requests fetched and decoded modern,
historical and custom pilot images in all nine tiers, with matching byte counts
and 200/500/native-high dimensions. Cloud fetch-plus-decode times were 480–770 ms;
these are not physical-phone timings. A final independent sample of 198 bare
public URLs (first/last mirrored card in all 32 sets plus Specials, all three
tiers) passed HTTPS, CORS, byte-count, checksum and image-decode checks. See
[LIVE-ASSET-CHECK.json](LIVE-ASSET-CHECK.json). Existing
pack/set-logo assets are not part of the card-only mirror. Binder prewarming is
now limited to neighbouring pages rather than the whole collection.

## Rollout and remaining checks

The uploader encountered intermittent gateway authorization-context errors.
Bounded retries preserve the same configured key and respond to the specific
missing-header/JWT-format error; unrelated permission errors remain failures.
The final repair pass cleared every failed record. Public readers need no key.

1. Review the completed branch and populated asset manifest.
2. Test real Android Chrome/Samsung Internet and iPhone/iPad Safari before merging.
3. Measure actual phone/CDN latency; do not infer it from cloud fixture timing.

The service-worker version is `0.261.0-6`, build ID `v261-assets-2`.
No new set or player-save migration was introduced. No image-library files are
committed. Prepared sources and resumable checkpoints remain under ignored
`.temp/card-mirror`; the complete public runtime manifest is committed.
