# V263 implementation and verification report

**Status: user authorized deployment after stopping further AI tests.**
**Authenticated full live AI matches: 14 passed; the 20-match gate was explicitly waived.**
Migration and independent one-second pg_cron scheduler are installed in production.
Public AI activation is separately controlled; see ROLLOUT-STATUS.md for deployment status.

## Latest live verification

- All 14 completed matches passed pack/cash/card-count checks, all four action types, reveal bounds, authentication refresh/reconnect, retry idempotency and expected RP settlement, including a human win.
- No further AI matches are being run. An interrupted later match is not counted as fully verified. Both QA accounts were confirmed idle afterward.
- Human-only search is configured at 3 seconds and fallback at 7 seconds. Measured queue response: 7.524–8.332 seconds including network/poll cadence. Average full match: 80.5 seconds.
- RPC median 284.7 ms, p95 356.9 ms; maximum 5,285.1 ms on one turn submission. These are end-to-end timings, not server compute. The outlier's cause is unconfirmed.
- Worker heartbeat advances independently, recent cron runs succeeded, zero worker errors at checks. Browser roles cannot execute the private worker directly.
- Both authenticated Realtime subscriptions joined successfully and received live League signals (23 and 10 during the observation window).
- Fresh automated suite: 359/359 passed; release:check and production smoke passed. Fourteen additional Chromium mobile/desktop layout/input cases passed.
- Physical Android/Safari timing and a truly concurrent live human/AI queue race are not certified. Existing resume handlers and human-priority locks are retained; local tests pass.
- `ENABLE-PRODUCTION-APPROVED.sql` is the user-authorized activation alternative to the standard 20-match gate. It still requires healthy cron, a fresh heartbeat and enabled public League. No Stakes or player-save mutation.

## Source changes

- 20 persistent, private AI collectors, stable names/initials avatars, existing competitive banners and verified private AI rank history. No login accounts, fake badges or social profiles.
- Human-only near-RP search for 3 seconds, then wider search; fallback threshold 7 seconds, with existing 1.5-second client queue tick. Measured 7.524–8.332 seconds including network/poll cadence.
- Existing queue transaction lock protects human selection/cancel. AI rechecks eligible humans before insertion. Local both-order/cancel/idempotency checks pass; genuinely concurrent live races still need QA.
- Prefer AI within 200 RP, widen to 400; Grandmaster may widen farther to Master+ only. Avoid the last five opponents where suitable alternatives exist; relax within the RP band when necessary.
- AI skill derives from persistent rating: Bronze .24, Silver .42, Gold .60, Platinum .75, Diamond .86, Master .92, Grandmaster .96.
- Drafts enumerate up to 252 legal five-card subsets, score power/defense/speed/HP, cost efficiency, type/role/ability diversity and healing support, then choose within a rank-scaled top fraction. Same `league_draft` and adaptive God Pack budget as humans.
- Battle heuristics score Attack, Defend, Ability and Swap from legal public state. Tactical choices consider health, type, speed, uses/cooldowns, guard and previous public actions. Same SQL turn resolver, 3 KOs / 20-turn limit. High-rank strategy is a heuristic, not a proven optimal search.
- Reveal requests are paced .4–1.2s, occasional 1.2–2s; first .5–1.4s. Draft target 3–10s. Reaction ranges: Bronze 1.5–3.5s, Silver 1.3–3s, Gold 1.1–2.7s, Platinum .9–2.4s, Diamond .8–2.2s, Master/Grandmaster .7–2s. One-second scheduler granularity can add up to about one second.
- Independent private worker, persisted due times, bounded batches, skip-locked rooms, safe missing-action timers, heartbeat-based admission control. Private DEBUG diagnostics cover candidate/selected score, skill, phase and scheduled time; not exposed to player snapshots.
- Human charge/award unchanged and exactly once. AI has match-only cards; no player-economy injection. Normal server RP formula; positive win modifiers: Bronze–Gold 100%, Platinum 98%, Diamond 95%, Master/Grandmaster 90%. Losses retain the normal formula. Modifier is persisted and disclosed in results.
- AI badges appear in Clash, battle/profile disclosure and results. Uses existing rendering, thumbnail/medium art tiers, controller and Realtime signals. No social/Marketplace/Casual AI changes.

## Final SQL simulation

1,400 complete battles (200/rank), real current catalog metadata and the production SQL resolver. Equal-rank self-play with paired swapped seats and matching decision seeds. This measures symmetry and rules stability, **not beginner/human win rates**. No simulated result is counted as authenticated live QA.

| Rank | Matches | AI score % | Avg turns | Avg draft cost | Aggregate AI RP delta | Draft ms | Action ms | Resolve ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| bronze | 200 | 50.50 | 15.23 | 63.13 | 40 | 7.710 | 0.199 | 1.690 |
| silver | 200 | 52.00 | 15.13 | 62.90 | 160 | 7.628 | 0.190 | 1.837 |
| gold | 200 | 50.00 | 15.08 | 62.68 | 0 | 8.933 | 0.212 | 2.328 |
| platinum | 200 | 51.50 | 15.22 | 63.55 | 120 | 10.780 | 0.267 | 3.112 |
| diamond | 200 | 52.00 | 15.40 | 61.67 | 160 | 10.210 | 0.248 | 3.165 |
| master | 200 | 52.50 | 15.61 | 62.05 | 200 | 9.005 | 0.225 | 3.081 |
| apex | 200 | 48.00 | 15.41 | 62.42 | -160 | 7.778 | 0.192 | 2.700 |

Timings are local PGlite PostgreSQL/WASM averages, excluding artificial reaction delays, network and human decision time. See `simulation-results.json` for the exact migration SHA-256, action distribution and maximum draft timings. Live QA averaged 80.5 seconds per full match; simulation averaged about 15 turns. Initial unpaired run is retained separately and had Gold 44.5% / Diamond 56%; the paired protocol controls seat/pool variance rather than tuning to those samples.

## Verification

- Full automated suite: **359 passing, zero failures**; includes 11 new AI database/activation tests.
- `pnpm run release:check`: **PASS**, including static and production smoke.
- Human-vs-human completes on extended schema with original settlement; no AI history created.
- AI full flow, paced revealed-card bounds, legal budget, hidden-action independence, illegal-action rejection, stale scheduler, idle/background worker progress, cancellation, repeated ready/result requests, permanent RP highs and transparent modifier checks pass locally.
- 10,000-entry collection snapshot: about **6.5 KB**; no collection rows in payload. `EXPLAIN ANALYZE` selects the new partial due-work index with 2,000 historical rooms.
- Chromium isolated layouts: all five match phases at **360×800, 390×844, 412×915, 430×932**; AI disclosure present, no horizontal overflow.
- Existing account isolation, recovery and pricing regression tests pass. No saves or ownership migrated.

## Live compatibility check

The production Hub uses a SECURITY INVOKER wrapper with an explicit authenticated grant on `hub_private.command`. V263 now revokes access only to its new AI objects, preserving that existing grant. A regression test exercises the exact live wrapper pattern. The user subsequently installed the migration through SQL Editor because the Management API binding remains read-only. The earlier simulation still covers the unchanged AI engine; its recorded whole-file hash predates this privilege-only correction.

## SQL review/application order

1. `supabase/migrations/20261009010000_league_ai_fallback.sql` — private AI tables/config/history, optional AI participant FK and due fields, worker/heuristics, compatible command/snapshot/settlement extensions. Keeps existing human auth FK. Only schema relaxation: nullable human guest paired with exactly-one-guest-kind constraint. Existing rows untouched. Transactional/reapplicable. AI defaults off; AI QA list empty. V262 access and Stakes unchanged.
2. `docs/v263/INSTALL-SCHEDULER.sql` — separately installs/updates named one-second pg_cron job. Requires supported Supabase pg_cron. No public enablement.
3. `docs/v263/ENABLE-QA-ONLY.sql` — only the two previously authorized isolated QA IDs; does not enable public AI.
4. Run `LEAGUE_QA_CREDENTIALS=<private-file> python scripts/verify-league-ai-live.py` using existing server-side environment credentials. Requires accounts idle; refuses to play an unexpected human match. Completes twenty real matches and records timing, reveal samples, reconnect, save/RP integrity, idempotency. Physical browser/Realtime checks are separate.

5. After every live gate passes, run `docs/v263/ENABLE-PRODUCTION.sql`; it requires a healthy one-second scheduler and at least twenty completed isolated QA matches before enabling the seven-second fallback. Then run `VERIFY-PRODUCTION.sql` twice to confirm an advancing heartbeat.

The user subsequently waived the remaining live-match gate and requested deployment; use the explicit approved activation script for this rollout. `ROLLBACK.sql` disables public and QA fallback without dropping data or interrupting human Ranked. Keep scheduler running for already-started AI matches.

## Remaining gates / known limitations

- Public activation still requires the SQL Editor step while Management API access remains read-only.
- **14 full authenticated matches passed**; Realtime delivery passed. Concurrent live queue races and physical Android/Safari backgrounding/frame performance remain unverified.
- Pure self-play cannot establish human-equivalent skill. Beginner usability and high-rank farming need live calibration.
- Finite persistent roster can drift out of a lower-rank RP band over time. Admission retains human search if no appropriate AI is eligible; monitor/tune roster coverage before claiming an unconditional always-available guarantee.
- Worker is single-job, bounded throughput. Sustained concurrent load/production compute targets need measurement; existing timeouts remain recovery fallback.
- Initials-based avatars reuse current renderer. No new AI creature/profile artwork or unrelated system changes.

Recommended next step: deploy the user-approved release, apply the approved activation SQL, and verify the production flag. Monitor latency outliers and roster coverage.
