# V260 save migration

V260 leaves the live `tcgRipperSave` object and cloud envelope at their existing schema versions. It adds `collectorV260.version = 1`; it does not replace the save or reset any existing fields. See [the baseline schema](SAVE-AND-AUTHORITY.md).

## Additive fields
- `cards`: favourite, lock and discovery metadata keyed by existing card ID.
- `chases`: at most three saved card identities.
- `revision`, bounded `receipts`: reviewed local transactions, account checks and replay protection.
- `masterRewards`, `masterPlus`, `cosmetics`, `titles`: durable claim markers and earned rewards.
- `contracts`, `contractRotation`, `lastDay`: frozen daily/weekly requests, expiry and keep-one delivery rules.
- `district`: daily walk-in, dealer, auction and mystery stock, with durable purchase markers. Purchased auction cards are credited atomically before the presentation animation, so leaving/reloading cannot lose the paid collection.
- `featured`, `shopXP`, `tradeXP`: featured-set choice and bounded daily XP grants.
- `journal` (200 entries), `stats`, `seenSlabs`: significant events and explicitly labelled V260-era counters.
- `legacy`: original Shop Rep, job/career counters and retained Card Show entitlement.

The migration converts each whole legacy Shop Rep point to 20 Collector XP, capped at 2,000 XP, exactly once. Rep 10 earns the Legacy Dealer title/badge. Rep 5 Card Show access is retained; new access uses Collector Level 10. Original reputation, jobs, earnings, achievements and other unknown fields remain in the save. New District activity uses capped Collector XP; it does not extend Shop Rep as a primary progression system.

## Inventory and grading
Binder/Bulk remain existing ID→quantity maps. Slab/submission UIDs, set IDs, cosmetics, sealed products/credits, rank records, saved looks and cloud recovery receipts remain intact. Manual V260 routing is marked so historical automatic repair does not move a deliberately bulked hit back to Binder on reload. Existing regular-ex Bulk routing remains in force.

Existing submitted/graded outcomes retain compatibility behavior. New V260 submissions preserve condition at submission and derive the returned grade from it. Standard/Priority/Express change fee and pack wait only. Local population counts actual currently owned slabs. Copy-level condition and complete variant enumeration cannot be reconstructed from historical aggregate quantities.

Owned value includes raw cards, submissions, slabs, local listings, server escrow and sealed products exactly once. An asset leaves owned totals after the completed sale/transfer, not when it is listed. Special one-of-one reward cards remain permanent rewards outside normal sale inventory and normal Master Set requirements.

## Server migration
`supabase/migrations/20261007000000_collector_v260_boundaries.sql` is additive and **not applied to production**. It preserves balances, escrow, request receipts, existing matches and RP; adds locked-card/listing safeguards, a $10,000 cap on new listings, automatic opponent-based RP and explicit disabled-Stakes/season capability metadata. Direct authenticated execution of the private command is revoked; the authenticated public wrapper is the entry point.

Rehearse against the actual staging schema, inspect grants and run two-account acceptance tests before production application. The checkout's PGlite bootstrap represents the active Hub schema, not every historical production migration. No destructive season reset or ledger cutover is included.

## Review and rollback
The pre-change Git reference is `backup/pre-v260-f24644d`. Review work is on `v260-collector-overhaul`; main/Pages are untouched. Export a copy of a save for preview testing. The preview uses separate local keys and disables online account writes. Do not replace a newer cloud save with an older export to roll back code. Keep V260 metadata when moving a save between compatible builds, preserving durable reward and transaction markers.
