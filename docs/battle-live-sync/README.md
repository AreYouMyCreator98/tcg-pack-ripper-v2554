# Battle synchronization fix

Build: `v261-battle-sync-1`. Review branch: `fix/battle-live-sync`.

## Changes

- Matched collectors see their actual two profile cards in a short, reduced-motion-aware clash presentation before confirming readiness. Both confirmations still precede charges and generation.
- Reveals no longer wait behind full collection restoration. Rapid taps use monotonic, bounded progress acknowledgements, retaining durable intent and receipt-based retry.
- New authenticated `hub_battle_update` RPC returns room/profile updates instead of the inventory, market, leaderboard, chat and set catalogue for every reveal.
- The server exposes only the opponent's acknowledged card prefix while playing. Future cards and final scores remain hidden. The server still awards cards, calculates scores and settles RP exactly once.
- Existing realtime notifications trigger immediate refreshes. Active battle fallback polling is 750 ms; waiting ranked queues re-evaluate eligibility every 3 seconds instead of waiting for the 25-second heartbeat. Compatible waiting players still match directly on joining. RP matching bands and pack costs/odds are unchanged; no fake opponents or promise of a match in an empty queue.
- Lightweight opponent thumbnails use the shared artwork resolver. Saves, inventory identity, pack generation and rating formulas are unchanged.
- Old servers remain supported through capability detection and slower full snapshots/sequential acknowledgements.

## Server deployment required

Apply `supabase/migrations/20261008010000_battle_live_sync.sql` using Supabase SQL Editor or an authorized database migration connection, then deploy this branch's client build. The migration is transactional and additive; its definition checks abort if server functions differ unexpectedly. Do not rerun a successful migration. Follow the existing migration order; do not reset any database or replay all historical migrations blindly.

The environment currently has a Storage service-role credential, but no SQL-management connector, database password/connection string or Supabase management token. Storage access does not permit arbitrary schema migrations. This migration has been rehearsed using the repository's PostgreSQL/PGlite harness, not applied to production. Main and the live game are unchanged by this task.

Client rollback to the prior version is supported after this migration. Older clients retain sequential reveal validation; server-revealed opponent cards may still be ignored by the older UI. Do not drop live room or receipt tables to roll back.

## Validation

Full release check passed: **284 automated tests, zero failures**, production build and 52-resource smoke check.

- Database tests: authenticated participants only; non-battle actions rejected; unrevealed cards remain private; bounded progress; backwards acknowledgements cannot reduce progress; exact request retry succeeds, altered receipt reuse fails; completion/retry does not duplicate inventory, money or rating; other users cannot read a room; compatible players match at join; widened eligibility is checked by queue tick.
- Controller tests: blocked collection synchronization cannot stall reveal delivery; ten immediate taps coalesce into at most two requests; queue rechecks do not flush collection data; existing account switching, stale responses, recovery and trading tests remain in place.
- 2,500-card payload comparison: full snapshot 326,449 bytes; battle update 2,868 bytes (99% reduction). This is a controlled payload measurement, not a production latency guarantee.
- Chromium mobile layout pass: 360x800, 390x844, 393x873, 412x915, 430x932. Both profile cards and readiness controls render without horizontal overflow. Opponent confirmed card uses a lazy thumbnail.
- Physical Android/Samsung Internet and Safari two-player testing is still required after migration and deployment. No live player account or production match was used in tests.
