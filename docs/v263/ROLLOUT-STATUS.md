# Production rollout checkpoint — 9 October 2026

Production has **not** been updated by this rollout attempt. Live `build-info.json` reports `0.262.7` / `v262-card-prices-1`. V263 remains on `feat/v263-ai-ranked-fallback`.

## Verified

- Both authorized isolated QA accounts authenticate successfully; neither is queued or in an active match.
- Existing frontend resumes League on `visibilitychange`, `pageshow` and network `online`, fetching the authoritative snapshot. Those mobile timers/handlers were not changed.
- Reviewed backend retains human-priority queue transaction locks and durable action/reward idempotency; local regression tests pass.
- Production activation SQL is prepared and tested: refuses activation without a healthy scheduler and twenty completed QA AI matches, then sets server-configurable 3-second initial human search / 7-second AI fallback.
- Fresh full automated suite and `pnpm run release:check`: 358 passed, zero failed; production smoke passed.

## Blocked production operations

No Supabase management access token or database connection credential is available in this environment. The available service-role API key is not a SQL-management credential. No cached CLI access token or linked database connection was found. `api.supabase.com` is blocked by the environment network proxy (CONNECT 403). GitHub repository secret-list access also returns 403; existing GitHub source/deploy access remains available.

Consequently, migration application, scheduler installation/heartbeat verification, 20 live AI matches, production flag activation, main merge and Pages deployment remain pending. None is reported as completed.

The live Hub snapshot omits `stakes_enabled`; a read-only snapshot with a zero-valued stake field was accepted, so that call does not establish an explicit Stakes guard. No Stakes feature, Casual mode or player data was modified. Confirm the backend guard through administrative SQL before claiming a production OFF flag.

## Resume

Preferred: provide `SUPABASE_ACCESS_TOKEN` securely in environment settings and allow `api.supabase.com`. Do not paste secrets in chat. A supported direct database credential is another administrative option.

Manual alternative, in order:

1. Review/apply `supabase/migrations/20261009010000_league_ai_fallback.sql`.
2. Review/apply `docs/v263/INSTALL-SCHEDULER.sql`.
3. Review/apply `docs/v263/ENABLE-QA-ONLY.sql`.
4. Run the prepared authenticated QA runner and physical browser checks. Keep public AI disabled meanwhile.
5. Once all checks pass, apply `docs/v263/ENABLE-PRODUCTION.sql` and read `VERIFY-PRODUCTION.sql` twice to confirm the worker advances without a human client.
6. Merge/deploy only after those backend/live checks pass, then verify the production build and authenticated AI flow.

User authorization to carry out the rollout is already recorded; no further permission is needed once administrative access is available.
