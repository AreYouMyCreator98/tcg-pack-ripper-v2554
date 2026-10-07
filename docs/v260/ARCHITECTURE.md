# V260 collector architecture

`src/app/collector-navigation.js` owns the four primary destinations and Collection tabs. Existing screen IDs survive as compatibility aliases. One fixed navigation bar uses safe-area padding and one settings overlay; old competing navigation handlers are removed.

`src/collector/index.js` connects existing pack events, day rotation, Profile, journal and notifications. `collector-bridge.js` is the only new classic-runtime boundary. Modules obtain current state through the bridge on each operation because cloud pulls and account changes replace the state object.

| Module | Responsibility |
|---|---|
| model.js | Additive migration, merged ownership, filters, value, local population, journal |
| transactions.js | Review/account/revision checks; validate complete cloned state before commit; durable claims and bounded replay receipts |
| inspector.js | Shared card identity/artwork, ownership, lock/favourite/chase, condition light, contextual confirmation and focus management |
| collection.js | 36-card gallery/checklist pages, physical Binder reuse, Master Set rewards and grading prestige |
| contracts.js | Frozen achievable Bulk requests; keep-one, expiry and daily/weekly rotation |
| district.js | Frozen per-day NPC stock; consumed offers cannot be purchased again |
| clock.js | Account-bound server timestamp advanced with monotonic elapsed time; explicit local fallback |
| notifications.js | Combined nonblocking live-region notices |
| public/catalog | Lightweight metadata from the checked-in authoritative Hub seed; no full-size artwork preload |

The shared inspector is used by reveals/recap, gallery and physical Binder, Bulk, Master Sets/chase guide, grading queue/slabs, market listings, trade offers, walk-ins, profile hit showcases and Special Collection. Sealed products retain their existing product-specific 3D inspector rather than pretending a sealed product is a raw card.

Local sales, multi-card Bulk delivery, routing, grading payment, slab sales, contracts, NPC swaps, District purchases and Master rewards use the collector transaction service. Online listings/purchases/trades/battles keep the existing PostgreSQL command, receipt and escrow pipeline. The local service is validation and race protection, not a claim of server authority. See [authority and ledger migration](SAVE-AND-AUTHORITY.md).

Hub keeps its existing controller and server revision protocol under Market/Trades/Battles/District/Social. Public watchlists are account-scoped local preferences. The server retains exact-revision two-party trade confirmation and authoritative battle generation/result. New server capabilities are advertised; existing V256 servers continue to display their existing ranked explanation until the migration is deployed.

## Retained compatibility
The runtime is still a staged modular extraction. Existing rarity generation, God Packs, physical Binder, Bulk physics, grading/slab returns, sealed product renderer, social subscriptions and save/cloud barriers are reused. Historical data fields and initialized compatibility DOM IDs stay in place where removing them would break surviving handlers. Old raw/Bulk/Special inspector code remains a boot fallback, but V260 user entry points use the shared inspector. Legacy profile counters remain stored; duplicate visible career tiles are hidden in favor of the unified Stats panel.

The loader observer now performs idempotent class changes, avoiding a MutationObserver microtask loop on established saves. Artificial splash hold is removed; first-frame preparation and short exit transition remain. Artwork uses the existing identity-aware resolver, lazy thumbnails and request tokens to prevent a previous card's asynchronous image from replacing the current card.
