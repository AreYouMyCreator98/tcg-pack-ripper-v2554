# V260 verification report — 2026-10-07

**Automated review checks pass. This is ready for isolated preview review, not yet production/physical-device certification.** Main and live GitHub Pages have not been merged or published. Production Supabase SQL has not been changed.

## Environment and baseline
Repository baseline: `f24644d150799d7eb66c08a91eee074729859fc9`. Backup branch: `backup/pre-v260-f24644d`. Review branch: `v260-collector-overhaul`. Node 24.19.0, pnpm 11.19.0; frozen lockfile installation with lifecycle scripts disabled. Initial active baseline: 215 tests passed. Two archived V255 tests still expected obsolete live runtime links; those assertions now verify that archived code remains available but excluded from the active V260 bundle. All 12 archived tests are included in `pnpm test` and release validation.

Read-only live checks through the cloud environment proxy:
- Supabase Auth `/auth/v1/health`: HTTP 200, JSON.
- TCGdex `sets/sv10`: HTTP 200, JSON.
- TCGdex `sv10/001/low.webp`: HTTP 200, WebP.

These prove service reachability. No production account mutation, live trade, live battle or migration was used as a test. Direct Node fetch does not inherit this environment's proxy routing; browser regression services are explicitly stubbed.

## Automated results
`pnpm run release:check` **PASS**:
- Project/asset validation passed.
- **253 tests passed, 0 failed, 0 skipped**, including archived tests.
- Static deployment assembly and smoke checks passed.
- Vite production build and precache generation passed.
- Production smoke passed: **49 resources**.

Evidence: [release log](verification/release-check.txt).

New/expanded coverage includes additive migration and unknown-field preservation, cash-only saves, account changes, locks, sale/reward replay, atomic multi-line Bulk deductions, keep-one contracts/expiry, grading cost/condition, Master rewards/Master Set+, local value/population, monotonic server clock, daily District stock/purchase limits loader observer idempotence, cross-account cosmetic ownership and secure receipt IDs on HTTP LAN browsers. Existing suites continue to cover cloud handoff/CAS, account switching, multiplayer revisions, disconnect/forfeit, escrow conservation, ranked outcomes, input cancellation, cosmetics and artwork identity.

All **32 supported sets** have checked catalog identity, artwork references, rarity, unlock and pack-art entries. The actual God Pack generator produced ten real in-set cards for every set; exposed odds remain **1 in 1,000**. This is catalog/reference integrity, not a visual inspection of all 6,889 remote images.

## Browser/mobile results
Chromium with mobile/touch contexts, reduced motion and isolated synthetic saves:

| Viewport | Result |
|---|---|
| 360 × 800 | Pass |
| 390 × 844 | Pass |
| 393 × 873 | Pass |
| 412 × 915 | Pass |
| 430 × 932 | Pass |
| 768 × 1024 | Pass |
| 1440 × 900 | Pass; 2,500-card fixture |

Verified four destinations, one bottom navigation bar, viewport bounds, settings, six Collection sections, Gallery/Physical Binder, shared inspector, favourite/chase persistence after reload, sealed modal, paged Master checklist, four Profile tabs and no horizontal overflow or JavaScript page errors. A simulated persisted pagehide/pageshow cycle also advances day content correctly. Gallery/checklist pages stay at 36 images.

Additional 390 × 844 gameplay regression passed: grading submission/payment; **1 pack + 10 packs = 110 retained cards and $88 charged exactly once**; Fast Reveal and Reveal All; smart recaps with 10/100 cards; grading wait/return/slab; contract delivery; universal walk-in inspector; walk-in purchase; auction reveal/collection; mystery collection purchase. Tests use real generators and local catalog data with stubbed network responses.

Evidence: [viewports](verification/chromium-viewports.json), [gameplay](verification/gameplay.txt). Reproduce against a served production build with `V260_TEST_URL=http://127.0.0.1:PORT node scripts/verify-v260-browser.cjs`; add `V260_TEST_PACKS=1` for gameplay. Playwright and Chromium are provided by the cloud environment, not added to the application runtime dependencies.

The isolated preview also passed browser checks for healthy startup, separate preview save keys, an unchanged production-save sentinel, zero account network requests, rejected cloud writes, secure receipt creation with `randomUUID` unavailable, and service-worker offline reload. Evidence: [preview isolation](verification/preview-isolation.txt). Offline checking used Chromium on a secure localhost context, not physical mobile PWA certification.

**Simulated/viewport testing passed; physical-device verification required.** No Samsung Internet, iPhone/iPad Safari or native Android physical certification is claimed. WebKit download was blocked, so even a simulated WebKit-engine pass is not claimed. See [phone instructions](PHONE-PREVIEW.md) and [release limits](KNOWN-ISSUES.md).

## What changed / consolidated / removed / migrated
Four destinations replace the crowded nav. Collection unifies cards, Master Sets, grading, slabs, Bulk and sealed access. Hub groups Market/Trades/Battles/District/Social. Profile exposes Overview/Progress/Customise/Stats, Journal and a collection dashboard. One card inspector connects the main collection workflows; significant notices combine without blocking the recap.

Removed active duplicate navigation handlers and normal Trash handling; removed the unused destructive broken-artwork inventory-removal export. Old History, Settings and Bulk are no longer primary destinations. Duplicate Binder section tabs and career tiles are hidden where runtime IDs remain dependencies. Physical Binder, Bulk, grading, sealed and multiplayer remain.

Additive migration preserves inventory, cash, currency/progression, profile cosmetics, earned achievements, Master progress and unknown save fields. Shop Rep/Jobs become legacy records; retained unlocks and a one-time XP/title conversion are documented in [migration notes](MIGRATION.md).

New systems: three chases, smart recap, collector metadata/filters, Master rewards/graded prestige, daily/weekly contracts, daily District stock, receipt-bearing local transactions, condition-aware inspector, local population, Journal, featured XP, server-clock adaptation and preview isolation.

Economy: reviewed mutations validate before committing; listed/escrow value counts once; NPC auto-buy probability is zero above 135% reference value. New listing cap/locked-card rules are in staged SQL. Full server-ledger authority remains staged.

Ranked: staged SQL computes bounded opponent-based RP (even win +20, wins +12–28, losses −10–24 before zero-floor clipping, ties 0). No chosen RP wager. Seasons advertise continuity with no reset.

Stakes: not enabled; the existing game lacks the protected server ledger required to secure funds. No client payout system is introduced.

Next recommended update: server ledger/provenance and authenticated staging rehearsal, plus real-device/PWA acceptance before production release.
