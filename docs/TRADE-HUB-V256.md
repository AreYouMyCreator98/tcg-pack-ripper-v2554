# Trade Hub V256

The online Trade Hub has been rebuilt as four ES modules and a transactional PostgreSQL service. The old online runtimes are archived under `archive/v255/` and are neither loaded nor shipped in the web build. Profile identity, daily rewards, earned frames and the offline collector district remain available.

## Systems

| System | Behavior |
| --- | --- |
| Marketplace | Search, sort, own listings, explicit purchase confirmation, cancel/return, 30 listings per seller, integer-cent prices and reserved inventory. Buyer debit, seller credit and card transfer commit together. |
| Trading | Private invite codes, up to six distinct cards per player, actual escrow, revision checks, two confirmations, automatic confirmation reset after edits, atomic exchange and refunds on cancellation/expiry. |
| Multiplayer | Authenticated accounts, private rooms, Realtime refresh with polling recovery, recently active count, account isolation, block controls and a persistent action receipt for reconnects. |
| Global chat | Recent history, unread counts, mute alerts, block/unblock, reporting, length and rate limits, server mute support and escaped rendering. Reports require an administrator to review them. |
| Pack battles | Server-generated packs and scores, both-ready gate, one or three private packs, sequential reveals, hidden opponent cards until completion, private rematch, forfeits and timeouts. Both players keep their cards. |
| Matchmaking | Oldest compatible unblocked opponent first; the RP window widens with waiting time. One active room per account. |
| Ranked | Existing RP and records migrate. Rookie 0, Bronze 120, Silver 250, Gold 450, Platinum 700, Diamond 1000, Master 1400, Apex 1900. Win +30 and up to +12 streak bonus; tie +8; loss −6/−9/−12 by tier, clamped at zero. Private battles do not change RP. Dual abandonment grants no points. |
| Identity | Collector name, title, six banner styles, up to three earned badges, record privacy, existing avatar and equipped frame. |

Ranked uses the same Paldean Fates pool for both players. Private battles offer all unlocked expansions. The catalog contains **6,889 cards across 32 expansions**, including Gallery/Vault subsets. XP, badges and required chase cards are checked on the server before private battle packs can be awarded. Starter packs, sealed credits and then cash pay for battle packs, in that order. Starter rarity boosts do not affect competitive packs.

Battle cards are awarded once into Binder/Bulk, and pack counts, hits, XP, chase badges and pack history update in the same transaction. Escrow still counts toward collection progress until a sale or trade completes. Profile sales/trade totals include online activity.

## Code map

- `src/trade-hub/model.js`: shared validation, formatting, ranks and inventory selection.
- `src/trade-hub/controller.js`: authenticated requests, subscription lifecycle, polling, action receipts and recovery.
- `src/trade-hub/view.js`: tabs, forms, room state, card reveals and input handling.
- `src/trade-hub/index.js`: installation and connection to game/cloud state.
- `public/runtime/hub-bridge.js`: mirrors authoritative ranks and collection summaries into the existing game.
- `public/runtime/progression.js`: cloud-save transaction barrier, including recovery before startup autosync.
- `supabase/migrations/20261003073323_trade_hub_v256.sql`: private schema, validation, transactions and authenticated dispatcher.
- `supabase/migrations/20261003082036_trade_hub_v256_cutover.sql`: listing/rank preservation and retirement of legacy commands.
- `supabase/seed-hub-catalog.sql`: reproducible real card metadata and set requirements.

## Reliability boundaries

Every mutation carries a UUID. Successful receipts are retained so a lost response can be retried without charging or awarding twice. Receipts store compact result identifiers; replay returns a fresh snapshot. SQL failures roll back. Transport failures remain pending until their result is recovered.

Cloud save versions advance for collection changes. During a financial operation the game pauses autosync and outside collection input; it resumes after a verified server pull. An existing pending receipt restores that barrier before startup reconciliation. A stale local save cannot overwrite a newer version through the normal account-save path. Account changes discard old in-flight UI responses.

Private tables and helpers are denied to API roles. The public dispatcher checks the authenticated user and participant membership. Incoming card metadata is whitelisted and neutralized before it reaches older collection renderers. A single advisory lock currently serializes Hub mutations. This is a deliberate correctness choice for a small community; high-volume operation needs load testing and more granular locking.

The broader game's save remains client-authored. This rebuild does **not** make its entire economy cheat-proof against modified clients. Trusted ranked results are separate from client saves, but external balance/inventory cheating needs a wider server-owned economy redesign.

## Catalog provenance

Metadata comes from [TCGdex](https://tcgdex.dev/) and its [official source database](https://github.com/tcgdex/cards-database). The archive checksum is recorded in `supabase/catalog/provenance.json`. External TypeScript was read as literal data and was never executed. Images remain remote URLs. Catalog imports are not required during a match.

Where no API price quote was available, metadata retains the game's $0.10 fallback; these are not verified market valuations. Listing prices are chosen by sellers, and battle scores use rarity rather than monetary value. Private battle rarity weights are the new Hub rules, rather than the old client generator's per-era rates.

Rebuild the SQL seed from checked-in metadata with `node scripts/import-hub-catalog.mjs --all`. `scripts/import-hub-source.py` can refresh literal metadata from an official source ZIP; the API importer has a bounded fallback for unavailable card endpoints.
