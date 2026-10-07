# V261 review report

Review branch: `v261-dark-silver`. Production main remains unchanged. Build: `0.261.0`, `v261-silver-1`.

## Rip and reference composition

The compact collector header, centered serif set hero, Pull Rates/calendar row, selected-set panel, framed pack, circular arrows, connected 1/10 capsule, four quick actions and four-destination bottom capsule follow the reference composition. The actual official booster art replaces the reference's generated illustration. The compact Fast Reveal control and accessible Open Pack button retain working input alternatives. Background geometry uses a restrained Poké Ball motif rather than generated character artwork.

Cash and Collector Level come from live state. The avatar and equipped rank frame use Profile Studio's identity/ownership snapshot; avatar change, return to Rip and reload are tested. The existing clock node is moved, preserving its real day/countdown and rotation behavior.

Arrows cycle only unlocked sets via the existing `sel` / `fastSelect` controller. Locked selection is rejected and requirements remain available. A pre-existing capture-handler bug that left the drawer obstructing the requirements flow is fixed. Selected-set names, series, logos, pack art, guide and Master Set destination are live. All 32 packs and set logos are bundled locally; the set drawer lazily loads logos. Source URLs are recorded in ARTWORK-SOURCES.json.

Set Info uses actual ownership totals, availability and opening cost, with real requirements/rates actions. Chase Cards opens the existing guide/inspector/pinning flow. Master Set opens the selected checklist. Sealed opens the existing general sealed collection/shop. No new economy or generator implementation was introduced.

## Theme coverage and consolidation

A shared token/surface stylesheet covers Collection cards, Master Sets, grading, slabs, Bulk, Specials, sealed, Hub market/trades/battles/district/social, Profile overview/progress/customise/stats, Journal, settings, account controls, calendar, set selector, rates, inspector and loading UI. Physical Binder skins, card artwork, rarity effects and rank assets retain their meaning and ownership. Profile banner selections retain their distinct accents on the new neutral base.

The old Rip title/featured/pinned/session chrome and floating cash display no longer compete with the showcase. Chases and progress remain accessible through their quick actions, and detailed session analytics remain in recap details. Existing hidden bridge nodes are retained where legacy runtimes still depend on their IDs. High-specificity legacy stylesheet extraction remains technical debt; the new theme has a deliberately scoped specificity boundary.

No player data, save fields, cosmetics, achievements, ownership, unlocks, pull rates or God Pack probabilities were changed. No save migration or SQL migration is required. Ranked RP and Stakes architecture are unchanged; unavailable backend features remain unavailable.

## Automated validation

- `pnpm test`: **269 passed, 0 failed, 0 skipped**.
- `pnpm run release:check`: **passed**, including the complete suite, static smoke, production build and 50-resource production smoke.
- Rip interaction suite: all seven viewports passed arrow cycling/wrap, locked-set rejection, title synchronization, actual local pack decoding, Pull Rates, chase guide, selected Master Set, sealed, 1/10 selection and nav. Avatar persistence tested at 390×844.
- Existing Collection/Hub/Profile navigation regression: all seven viewports passed, including inspector, favourites/chases, physical Binder, Bulk, grading, slabs, sealed, Master Set, Profile tabs, settings and reload.
- Single-pack results: no internal vertical scrolling at 360×800, 390×844, 393×873, 412×915, 430×932, 768×1024 and 1440×900.
- Each stress scenario opens ten consecutive ten-packs: exactly 1,000 new copies, $800 cash cost, correct discovery/Master Set totals, no duplicate charge on rapid activation, retained committed results after reload/background, and valid starter/sealed-credit payment routes.
- Built-production gameplay regression: 1 + 10 packs retained 110 cards with exactly $88 charged; grading submission/return/slab, contract claim, walk-in, auction and mystery collection passed.
- All 19 Specials decode from real local WebP files; failure/retry behavior is exercised.

## Measured ten-pack behavior

Chromium simulation with fixture API responses; these are environment measurements, not physical-phone benchmarks.

| Scenario | Total range | Median | Result nodes | Listeners after reload → final | Heap after reload → final |
| --- | --- | --- | --- | --- | --- |
| Samsung-style | 382–457 ms | 416 ms | 545, constant | 823 → 823 | 7.97 → 8.56 MB |
| iPhone-style | 375–520 ms | 418 ms | 545, constant | 823 → 823 | 7.96 → 8.57 MB |
| Samsung-style, 2,500 initial cards | 624–748 ms | 678 ms | 545, constant | 1,033 → 1,033 | 9.43 → 10.12 MB |

Measured longest tasks: 58 ms / 76 ms / 591 ms respectively. The strict ~50 ms aspiration is not fully met for large saves; further profiling of synchronous save/progression work remains warranted. No multi-second freeze or runaway listener/DOM growth occurred in these runs. Save writes stayed controlled (1–6 observed around each opening, including legacy reconciliation); inventory commit remains the existing single durable batch transaction.

## Known limitations and device follow-up

- Android/Samsung and iPhone tests are viewport, touch and user-agent simulations in Chromium. **Physical-device verification required.** Actual Samsung Internet, Safari/WebKit, Dynamic Island/home-indicator behavior, audio unlock, background suspension and thermal/memory behavior are not certified.
- Authenticated multiplayer/market UI needs account-based device review. Local browser tests stub external services; database transaction behavior is covered by existing automated integration tests. Existing backend deployment prerequisites are unchanged.
- The isolated preview disables account/cloud writes and uses its own local save. It cannot certify live cloud synchronization or online matches.
- This is a visual review build, not a claim of pixel-identical reproduction of the generated reference. Use the phone preview to review proportions, touch comfort and readability.
- Temporary preview URLs stop working when the tunnel/workspace stops. A separate static-host upload package is also prepared.

The next recommended work is physical-device acceptance and any resulting V261 corrections, followed by review of the existing server-authority rollout. No V262 feature work is included.

## Review delivery

Review source commit: `d76f2c4899d43a4f7e6bcd30d8885c30c40d8424`, pushed to `v261-dark-silver`. Remote main was verified unchanged at `ff7f248cf713c9bbccebd8e8602b264e80fd1be7`.

The generated preview passed boot, health, separate-save, production-sentinel, blocked-cloud-write, no-account-request and service-worker offline-reload checks. Public tunnel creation was blocked by refused DNS; an alternate static-preview host was denied by the network proxy. No usable public preview URL is claimed. The self-contained ZIP in `preview/` is the approved fallback, with Android upload instructions in `preview/README.md`.
