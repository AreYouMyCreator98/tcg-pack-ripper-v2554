# V260.1 mobile hotfix — review candidate

V260.1 addresses the Samsung-device report against deployed V260. It does not start V261, change pack odds, deploy database migrations or reset existing saves. Production publication requires separate approval.

## Root causes and changes

- **10-pack freeze:** the V260 card-collected listener called the complete save/progression stack for each card. The measured 100-card collection call took 6,994 ms, including 112 main-save writes; the browser reported a 7,095 ms task. Generation's earlier save suppression did not cover collection or the 10 pack-generated events. Unlock checks also repeatedly scanned every owned card for each of the 32 sets; a 2,500-card test exposed a second 1,210 ms task.
- **Batch transaction:** the same generator, starter guarantees, anti-repeat state, God Pack roll and payment rules run with one cached pool, yielding between packs. Collection yields every ten cards. The same per-pack XP/hit/history reward function now yields between groups. Saves and cloud uploads are blocked while the batch is provisional. One durable commit includes resources, cards, discoveries, progression and the last result. Generation/storage failures restore the checkpoint. Reload restores only the presentation, without generating, charging or collecting again. Session statistics also roll back on failure.
- **Progression:** Master Set checks reuse one ownership snapshot per pass instead of rescanning it for each set. Percentages, membership sources and milestone conditions are unchanged. Special unlock metrics are evaluated once per category per pass. Hidden Specials are no longer reconstructed on every save.
- **Recap:** the original legacy summary, session recap and V260 vertical duplicate rows were stacked together. They are replaced by one result view. Ten single-pack thumbnails, best pull, value, hits, discoveries, duplicates, Master Set change and grade candidates fit at 360×800. Duplicate details and session analytics open secondary sheets. The session/open-pack panel is hidden in OPENING, REVEALING and COMPLETE. Open Another returns to IDLE. The legacy completed-scene nav pointer lock is overridden, so all four destinations remain tappable and the result can be revisited. The summary sits outside the old stage's fixed-position containing block, above the screen and above neither the navigation nor inspector.
- **10-pack presentation:** direct complete results; no mandatory 100-card cinematic chain. Hits are prioritized, with All/Hits/New/Duplicates and Show All 100. Cards use low-resolution sources, async decoding and native lazy loading. One delegated result handler is cleared on reset. Old result nodes and batch arrays are released. Premium effects remain in the inspector/single reveal, not 100 simultaneously animated tiles.
- **Specials artwork:** tiles were constructed without `src`; their deferred hydrator required an active panel. V260's direct Specials button activated the panel without rerendering/hydrating it. An older iOS switch-away timer additionally removed `src`. All 19 local files existed with correct case and decoded successfully: this was a source-assignment lifecycle failure, not missing images or a remote CORS failure. Tiles now receive their Pages-relative source at construction and rely on browser lazy loading. The destructive iOS source-removal hook is removed. Shared error handling provides artwork-unavailable/retry text in Specials, collection, recap and inspector. Special inspector art uses its local source without waiting behind remote card-art requests.
- **Cache:** app/build IDs and service-worker namespaces advance to 0.260.1 / v2601-mobile-1. Existing activation cleanup removes V260 caches; executable resources retain the existing network-first policy. The save schema remains version 1. The optional lastPackResultV2601 field is additive and is cleared when dismissed.

## Verification and reproduction

Run `pnpm run release:check` for all 263 unit/integration/database checks, static validation, production build and production smoke. Run `scripts/verify-v260-browser.cjs` against a served build for the existing navigation/collection/profile checks; `V260_TEST_PACKS=1` also covers real single/ten pack, grading and District gameplay. The V260.1 script uses Playwright/Chromium supplied by the cloud environment, not a new production dependency:

```sh
V260_TEST_URL='http://127.0.0.1:5180/?debug' node scripts/verify-v2601-mobile.cjs
V260_TEST_URL='http://127.0.0.1:5180/?debug' V2601_DEVICE=iphone node scripts/verify-v2601-mobile.cjs
V260_TEST_URL='http://127.0.0.1:5180/?debug' V2601_LARGE=1 node scripts/verify-v2601-mobile.cjs
```

The fixture stubs external card APIs and remote card images. Local Special WebP files are actually loaded and decoded. It exercises Fast Reveal, all single-pack cards/inspector, all requested viewports, 1↔10 switching, double activation, ten consecutive batches, exactly 1,000 retained cards/$800 charge, Master Set/discovery counts, result reload, simulated background/resume, filter grids, image identity, Special filters and error fallback. CDP records long tasks, post-GC JS heap and event listeners. `?debug` enables generation/state/progression/save/render and image-load timings; normal gameplay has no timing logs.

## Limits

- This is simulated/viewport testing, not physical Samsung Internet, Android Chrome or Safari certification. The iPhone configuration runs in Chromium; WebKit is not installed in this environment. Physical-device verification remains required, including toolbar/safe-area changes, touch cancellation, audio, background suspension and standalone PWA upgrade.
- The approximately 50 ms task target is not universally met: legacy synchronous save/progression work still produces shorter long tasks, especially on large saves. Measurements are cloud-host results, not guarantees for mid-range phones or CPU-throttled certification. No multi-second task remains in the passing stress scenarios.
- Incomplete remote prices retain the existing minimum-estimate behaviour, now labelled EST. PACK VALUE. Network-dependent artwork is progressive and does not gate card delivery. The summary is not proof of live TCGdex/Supabase availability.
- Pack ownership and cash remain within the existing client/save authority model. This hotfix does not apply the staged V260 SQL, enable Stakes, or change Ranked behaviour. Existing database tests cover those regressions; no authenticated production transaction was performed.
- Total result node count is higher than the old text-only recap because all 100 thumbnails are now available: 545 in the measured all-card view versus 371 in the old stacked recap. These are lightweight, lazy image tiles, with no active per-card foil/tilt listeners. Node count stays constant across repeat openings; growing inventory naturally increases saved-state memory.

## Measured before / after

V260 baseline: 3,932 ms to generated cards (including startup/network fixture work), then 6,994 ms for the synchronous collect-remaining call; longest task 7,095 ms; 127 main-save writes across opening, 112 during collection. The V260.1 figures below are end-to-end tap-to-committed-results on the cloud host with synthetic catalog/remote-image responses, not physical-device benchmarks.

| Production-build scenario | Median complete | Range | Longest observed task | Main-save writes in observation window |
|---|---:|---:|---:|---:|
| Typical save, iPhone configuration (Chromium) | 396 ms | 377–435 ms | none ≥50 ms recorded | 1–5 |
| 2,500-card save, Samsung configuration (Chromium) | 611 ms | 547–1105 ms | 340 ms | 1–6 |

Each batch makes one transaction commit; the observation window also captures existing delayed maintenance writes. Phase timings (generation, state apply, progression, save, render and image load) are retained in the JSON reports. Yielded phase durations include time spent returning control to the browser.

- Typical save, iPhone configuration (Chromium): stable settled listeners 799 → 799; post-GC JS heap 6.01 → 6.59 MiB as inventory grew. Result nodes stayed at 545.
- 2,500-card save, Samsung configuration (Chromium): stable settled listeners 1013 → 1013; post-GC JS heap 7.42 → 7.89 MiB as inventory grew. Result nodes stayed at 545.

JS heap measurements exclude native decoded-image/GPU memory. All remote image fixtures are tiny; real-card image memory and thermal behaviour require physical-device testing. Single-pack recap client height equalled scroll height at every tested viewport: 360×800, 390×844, 393×873, 412×915, 430×932, tablet 768×1024 and desktop 1440×900.

## Final regression result

- `pnpm run release:check`: 263 passed, 0 failed/skipped; static smoke and production smoke (49 resources) passed.
- Existing browser suite: all seven mobile/tablet/desktop viewports passed, including Collection, physical Binder, Bulk, Master Sets, Universal Inspector, Profile and save/reload.
- Existing gameplay suite: 1 + 10 packs, 110 retained cards, $88 pack charge; grading submission/return/slab and District contract/walk-in/auction/mystery workflows passed.
- Cash, ten starter credits and ten sealed set credits each delivered 100 cards with the expected resource deduction.
- Complete-result navigation: Collection opens and the same recap returns when RIP is tapped.
- Isolated preview: separate local save, production-save sentinel unchanged, accounts disabled, attempted cloud write blocked and service-worker offline reload passed.

Production remains on V260 until this review release is explicitly approved.

## Phone preview

The downloadable `v2601-preview.zip` contains an isolated static build. Extract it on a computer and run `python serve.py`; from a phone on the same Wi-Fi, open `http://YOUR-COMPUTER-LAN-IP:8080`. It uses a separate preview save namespace and disables online accounts. It does not overwrite production progress. LAN HTTP cannot certify install/offline PWA behaviour; that needs HTTPS or a physical deployment after approval. The automated preview test separately passed a `/tcg-pack-ripper-v2554/` subdirectory and service-worker offline reload on localhost.
