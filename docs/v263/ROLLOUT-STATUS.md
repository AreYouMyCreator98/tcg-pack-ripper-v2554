# Production rollout checkpoint — 9 October 2026

Production has **not** been updated by this rollout attempt. Live `build-info.json` reports `0.262.7` / `v262-card-prices-1`. V263 remains on `feat/v263-ai-ranked-fallback`.

## Verified

- Both authorized isolated QA accounts authenticate successfully; neither is queued or in an active match.
- Existing frontend resumes League on `visibilitychange`, `pageshow` and network `online`, fetching the authoritative snapshot. Those mobile timers/handlers were not changed.
- Reviewed backend retains human-priority queue transaction locks and durable action/reward idempotency; local regression tests pass.
- Production activation SQL is prepared and tested: refuses activation without a healthy scheduler and twenty completed QA AI matches, then sets server-configurable 3-second initial human search / 7-second AI fallback.
- Fresh full automated suite and `pnpm run release:check`: 359 passed, zero failed; production smoke passed.

## Blocked production operations

The management token and network access now work. However, the Management API executes queries as `supabase_read_only_user` (`session_user` is also that role), with transaction read-only enabled even when `read_only:false` is explicitly requested using the documented API field. Supabase rejected the V263 migration with SQLSTATE 25006: cannot execute CREATE TABLE in a read-only transaction.

The transaction rolled back: `hub_private.league_ai_config` remains absent. Verification before/after: 13 save rows, 14 League matches, aggregate human RP 916. No pack was opened in the cancelled isolated QA queue probe. No migration, scheduler or public AI enablement was completed.

Both existing QA accounts have fresh temporary administrative magic-link sessions; no email was sent and their passwords were not changed. Session material remains outside Git and is never printed.

The live Hub wrapper differs from the fixture: it retains a grant to its private command. The migration now preserves that grant and restricts only newly added AI objects; a regression test passes against that exact wrapper pattern. No other live system was changed.

## Resume

Required: use a Supabase account/token with database-write access for this project, replacing the existing secure `SUPABASE_ACCESS_TOKEN` binding if necessary. Network access is now working and needs no duplicate request. Do not paste tokens in chat. A supported administrative database connection or manual SQL Editor application is another option.

Manual alternative, in order:

1. Review/apply `supabase/migrations/20261009010000_league_ai_fallback.sql`.
2. Review/apply `docs/v263/INSTALL-SCHEDULER.sql`.
3. Review/apply `docs/v263/ENABLE-QA-ONLY.sql`.
4. Run the prepared authenticated QA runner and physical browser checks. Keep public AI disabled meanwhile.
5. Once all checks pass, apply `docs/v263/ENABLE-PRODUCTION.sql` and read `VERIFY-PRODUCTION.sql` twice to confirm the worker advances without a human client.
6. Merge/deploy only after those backend/live checks pass, then verify the production build and authenticated AI flow.

User authorization to carry out the rollout is already recorded; no further permission is needed once administrative access is available.
