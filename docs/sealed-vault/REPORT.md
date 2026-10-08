# Authentic sealed vault

Build: `v261-sealed-vault-1` · review branch `feat/authentic-sealed-vault`.

## Catalogue and imagery

- 192 existing identities (32 sets × six legacy templates) preserved.
- 32 existing source-documented loose booster images reused; misleading “Sleeved Booster” display names corrected without changing keys, price or entitlement.
- 160 other products remain explicitly LEGACY CUSTOM PRODUCT with IMAGE UNAVAILABLE. Their packaging photographs and exact physical product equivalents could not be verified. No AI packaging used to fill gaps.
- The old six-sided CSS packaging generator and continuous inspect animation loop were removed. No shared legacy asset files were deleted.
- [Source/licensing audit](SOURCE-AUDIT.md) records the provenance and blocked verification attempts. Individual booster URLs are in `src/sealed/assets.js` and the earlier artwork source report.
- New image storage: one 558-byte neutral local SVG. New Supabase storage: **0 bytes**. Manifest: approximately 15.3 KiB. No new product photography mirrored or added to Git.
- Resolver supports approved mirrored tier → referenced tier → existing product image → neutral fallback. Existing small pack images serve all sizes; no false high-resolution or new licence claim. Remote box artwork tiers await verified sources and permission.

## Shelf, vault and inspection

Graphite shelves ground product images above a metallic edge. Shelf and inventory are separate. New displays are capped at 12 copies; legacy oversized displays are preserved and paged in groups of 12 identities, with duplicate quantities shown as badges. Reorder buttons avoid unreliable drag gestures. Unknown historical product keys remain visible with unavailable prices and safe display removal.

Vault: owned/unique/value/displayed statistics, most valuable owned product, set/type/value/quantity/favourite filters, six sort choices, favourites first, 18 products per page and lazy images. Categories reflect existing inventory: packs, boxes, ETBs, bundles, tins, collection boxes and special/unknown entries. Legacy category names describe game inventory, not verified official releases. Shop prioritizes the authentic booster art. Extra filters collapse to reduce mobile height.

Inspector: one real front image or clearly labelled neutral fallback; bounded ±12° horizontal/±8° vertical tilt; accessible 1–2× zoom slider; correct set link, ownership, acquisition history where recorded and context-sensitive actions. No fabricated back/side view or fake 360° rotation. Pinch zoom is deliberately omitted in favour of a predictable slider and scroll-compatible pointer handling. Reduced motion and disabled pack tilt suppress tilt. No idle animation loops.

## Transactions and compatibility

All entry points now use the collector transaction service. Buy/open/sell require review and confirmation; validate account, revision, price, ownership, displayed quantity, set unlock and cloud/pack lock; commit once with persisted receipts. Stale confirmations and duplicate receipts cannot repeat payment/rewards. Opening preserves exact historical pack credits for that set. Displayed copies must be removed before opening/selling. In-game daily pricing and 88% resale are unchanged and labelled as game values, not live retail quotes. Existing unlimited shop stock is retained; no new stock rules introduced.

No inventory key migration, value remapping or card-pool change. Existing `sealedV161` inventory, packCredits, display and history remain. Optional favourites/order live inside the existing `collectorV260` extension; top-level save schema stays at 1. The service remains client-authoritative under the existing save architecture; this is not a new server ledger. Sealed value counts inventory once, never shelf copies again. Unpriced unknown items are explicitly excluded from priced totals.

The Rip SEALED shortcut opens the selected set. Inspect set links open the corresponding Master Set context. Generic collection entries continue to work. Local art uses the existing bounded media cache (1,000 entries); only the tiny fallback joins shell precache. Worker cache advances to `0.261.0-10`.

## Validation

- Full automated suite: **304 passed, 0 failed, 0 skipped** (including 14 new sealed regressions).
- `pnpm run release:check`: passed; production smoke checked 61 resources.
- Sealed browser flow passed at 360×800, 390×844, 393×873, 412×915, 430×932, 768×1024 and 1440×900. Covers purchase, duplicate confirmation, shelf, favourite, zoom, tilt/cancellation, opening, selling, failed image, persistence and isolated account switch. Light/dark preference contexts are covered; these do not emulate Samsung proprietary forced darkening.
- Large-collection check: 5,000-card synthetic save completed the same flow. Initial sealed open measured **142ms**; ordinary viewport runs measured **32–111ms** on this execution machine. These are simulated UI timings, not phone FPS certification.
- Existing Rip/navigation acceptance script passed at 390×844: set arrows, selector, Pull Rates, quick actions, Master Set, avatar persistence/reload, 1/10 modes.
- Screenshot review confirmed compact mobile layout, readable labels and no overflow; fixed intrinsic pack image sizing so artwork cannot intercept button taps.
- Reproducible commands: `node scripts/verify-sealed-vault.cjs` against the static deployment via `V260_TEST_URL`; add `V260_TEST_PACKS=1 SEALED_STRESS=1` for the large save. Measurements retained in [BROWSER-RESULTS.json](BROWSER-RESULTS.json).

 Browser scripts use isolated synthetic saves and stub external services; no real player or live economy is modified. Physical Samsung Internet and Safari certification is not implied.

## Remaining limitations

Real ETB, box, bundle and tin photographs remain pending source verification and reuse permission. Official/SealedDex pages returned 403 in this environment. The deliberate fallback-first result is preferable to inaccurate packaging. Real-device Samsung/iPhone/iPad testing remains required, especially forced browser darkening, touch cancellation and installed-PWA update behaviour. Existing prices/contents are intentionally preserved for legacy custom products even where they differ from real-world products.

No deployment or main merge is included in this update.
