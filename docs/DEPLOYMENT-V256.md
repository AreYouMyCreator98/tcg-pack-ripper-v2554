# V256 deployment and live verification

This release was built and tested locally. **The live database and public V255.4 site have not been updated.** The supplied web build needs the V256 database service before online tabs can work. Local shops remain usable if that service is absent.

## Coordinated cutover

1. Back up the database and retain the current source/web release. Restore a staging copy and connect two test accounts. This repository records earlier migrations in a manifest; it is not a complete empty-project bootstrap for the whole game.
2. Run `supabase/preflight-hub.sql`. Resolve missing sale receipts or invalid listings. Let current players finish live battles/trades. Review stale unfinished rooms separately; their records remain in the legacy tables. Old offers were references, so they must not be refunded as additional copies.
3. Apply `20261003073323_trade_hub_v256.sql` to the staging/current existing schema, then run `supabase/seed-hub-catalog.sql`. Do not run the old historical migrations again.
4. Test two-account purchase, cancellation, trade, offer editing, block/unblock, chat, private battle, ranked match, reconnect and concurrent cloud-save behavior on staging. Verify a third account cannot read another private room or call internal helpers. Verify Realtime publication and fallback polling.
5. In the maintenance window, apply `20261003082036_trade_hub_v256_cutover.sql` and publish the matching frontend. The migration refuses recent unfinished legacy sessions, missing sale receipts and invalid legacy listings. It imports active listings without deducting cards again, refreshes existing ranks, and revokes old online mutations. Legacy records remain available for audit.
6. Publish `dist/` to the existing Pages repository, or serve `deploy/` as the unbundled static build. Test both accounts on the public URL and verify old clients are prompted to update by your release communication. An old open tab cannot continue using retired RPCs.

Do not automatically roll the frontend back to V255 after the cutover: its old commands have been retired. A rollback needs a reviewed database plan that preserves any new transactions already completed in V256. The safest initial recovery is a forward fix or maintenance mode while reconciling receipts and escrow.

## Read-only production preflight

The inspection on 2026-10-03 found no missing sale receipts and no out-of-range/inconsistent active listings. Five listings were active at that observation; three legacy trades and four legacy battles were unfinished. These counts can change while players are active. No production rows or schema were changed by this work.

## Moderation and operations

`hub_private.reports` stores reports for an administrator to review. Set `hub_private.chat.hidden` or `hub_private.profiles.muted_until` using an administrator connection after review. There is no public moderation RPC and no automatic moderation service in this release.

Retain `hub_private.requests` receipt keys for idempotency; do not delete them blindly. Archive chat/activity according to the operator's retention policy. Monitor latency, SQL errors, failed save recovery, Realtime disconnects and advisory-lock waits. The current global mutation lock requires a real multi-connection load test before scaling to a large audience.

## Remaining live checks

- Actual Supabase Auth, JWT refresh, Realtime, RLS behavior and network outages using two accounts.
- PostgreSQL 17.11 deployment compatibility; local SQL tests ran in PGlite/PostgreSQL 18.3.
- Parallel database sessions, latency and lock behavior under production load.
- Mobile Safari/Chrome layout, image loading, touch, keyboard and screen-reader behavior. No browser, webview, pointer automation or screenshots were used for V256, as requested.
- External card-art availability and current monetary card quotes.

Local tests provide reproducible evidence, not a guarantee of zero defects.
