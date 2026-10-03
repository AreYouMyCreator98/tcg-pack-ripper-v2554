# V256 deployment and live verification

Current local update: **v256-trade-hub-2 is tested but not yet deployed**. See [identity update](IDENTITY-UPDATE-V256.md) for changes, 134-test verification and the publishing blocker. The deployment records below describe the preceding live release.

**V256 is deployed to the existing GitHub Pages site and Supabase project as of 2026-10-03.** [Release PR #1](https://github.com/AreYouMyCreator98/tcg-pack-ripper-v2554/pull/1) merged as `8f7c40f0cbc953a241732f46b928a763629ff912`. [The Pages deployment](https://github.com/AreYouMyCreator98/tcg-pack-ripper-v2554/actions/runs/37113073698) passed its build, 125 tests, resource checks and deployment.

Production applied migration versions are `20261003091126` (schema) and `20261003092631` (cutover). The catalog seed was loaded in 29 idempotent client-side batches: 32 expansions and 6,889 cards. All 32 expansions generated valid ten-card packs on PostgreSQL 17.11 without touching player saves. Five active listings and existing ranked records transferred with zero mismatches. Legacy mutation RPCs are revoked; private tables have RLS and internal helpers are inaccessible to player roles. A request without a valid user identity was rejected with `AUTH_REQUIRED`.

The signed-out public page loaded, opened the rebuilt Trade Hub, and retained the existing local cash balance. Browser inspection identified a legacy theme contrast conflict; the follow-up CSS scopes headings and buttons to the new hub and refreshes the offline cache. Two-account online gameplay remains unverified.

## Coordinated cutover

1. Back up the database and retain the current source/web release. Restore a staging copy and connect two test accounts. This repository records earlier migrations in a manifest; it is not a complete empty-project bootstrap for the whole game.
2. Run `supabase/preflight-hub.sql`. Resolve missing sale receipts or invalid listings. Let current players finish live battles/trades. Review stale unfinished rooms separately; their records remain in the legacy tables. Old offers were references, so they must not be refunded as additional copies.
3. Apply `20261003073323_trade_hub_v256.sql` to the staging/current existing schema, then run `supabase/seed-hub-catalog.sql`. Do not run the old historical migrations again.
4. Test two-account purchase, cancellation, trade, offer editing, block/unblock, chat, private battle, ranked match, reconnect and concurrent cloud-save behavior on staging. Verify a third account cannot read another private room or call internal helpers. Verify Realtime publication and fallback polling.
5. In the maintenance window, apply `20261003082036_trade_hub_v256_cutover.sql` and publish the matching frontend. The migration refuses recent unfinished legacy sessions, missing sale receipts and invalid legacy listings. It imports active listings without deducting cards again, refreshes existing ranks, and revokes old online mutations. Legacy records remain available for audit.
6. Publish `dist/` to the existing Pages repository, or serve `deploy/` as the unbundled static build. Test both accounts on the public URL and verify old clients are prompted to update by your release communication. An old open tab cannot continue using retired RPCs.

Do not automatically roll the frontend back to V255 after the cutover: its old commands have been retired. A rollback needs a reviewed database plan that preserves any new transactions already completed in V256. The safest initial recovery is a forward fix or maintenance mode while reconciling receipts and escrow.

## Read-only production preflight

The pre-cutover inspection on 2026-10-03 found no missing sale receipts or invalid listings. Five listings were active. Three legacy trades and four legacy battles were unfinished but none had been active in the previous 30 minutes. Their records remain archived; no duplicate offer cards were refunded. A private local snapshot retained profiles, active listings, original grants and save fingerprints before the migration; this is not a full point-in-time database backup.

## Moderation and operations

`hub_private.reports` stores reports for an administrator to review. Set `hub_private.chat.hidden` or `hub_private.profiles.muted_until` using an administrator connection after review. There is no public moderation RPC and no automatic moderation service in this release.

Retain `hub_private.requests` receipt keys for idempotency; do not delete them blindly. Archive chat/activity according to the operator's retention policy. Monitor latency, SQL errors, failed save recovery, Realtime disconnects and advisory-lock waits. The current global mutation lock requires a real multi-connection load test before scaling to a large audience.

## Remaining live checks

- Actual Supabase Auth, JWT refresh, Realtime, RLS behavior and network outages using two accounts.
- Full gameplay parity between production PostgreSQL 17.11 and local PGlite/PostgreSQL 18.3; deployment and pure pack-generation checks passed on production.
- Parallel database sessions, latency and lock behavior under production load.
- Mobile Safari/Chrome, touch, keyboard and screen-reader behavior. Initial development used code tests; the user subsequently authorized browser publishing and live visual checks.
- External card-art availability and current monetary card quotes.

Local tests provide reproducible evidence, not a guarantee of zero defects.
