# Authenticated live verification — 8 October 2026

The user confirmed applying the required SQL patch and authorized two isolated QA accounts. Authenticated `hub_command('snapshot')` returns `battle_sync_version: 2`, confirming the follow-up functions are installed. The optional receipt index was not assumed installed.

## Passed against the deployed Supabase backend

- Created and signed into `QA Hotfix 1` and `QA Hotfix 2`; no existing player account was used. Credentials are stored privately outside the repository and are not included in this report.
- Initialized the first account with 5,000 cards through the normal authenticated account-save RPC. The Hub initially returned 4,808 Binder entries; quantities across Binder/Bulk were checked using the account's own RLS-protected save.
- Initial authenticated Hub snapshots succeeded for both accounts. The first large response took 1,228 ms including network/serialization and contained approximately 1.39 MB. Subsequent large snapshots were around 1–1.35 seconds, with one 2.14-second observation. No statement-timeout response occurred.
- Private Casual room creation, invite join, both confirmations and card generation succeeded.
- Live opponent card prefixes advanced at acknowledged positions. Unrevealed cards and final scores remained private until completion.
- Ranked queue entry, waiting `queue_tick`, QA-to-QA matching, both confirmations, live reveals and settlement succeeded. The queue was entered when only the QA accounts were marked recently online; both participant IDs were checked before readiness, and no non-QA match was confirmed.
- A TLS-verified real Supabase Realtime WebSocket subscribed to `hub_signals` PostgreSQL changes. It received notifications for revealed cards and settlement. The harness first needed to wait for PostgreSQL subscription readiness, and allow asynchronous notifications to arrive after HTTP responses; those corrected assertions passed. This is not a claim of zero notification latency.
- The actual hotfix HubController was exercised against live authenticated RPCs. Ten rapid taps coalesced into two reveal RPCs; suspend/resume preserved progress. Completion took about 876 ms in that run. Sixteen controller RPCs completed without API errors or timeouts. Browser backgrounding and physical-device lifecycle are not certified by this controller simulation.
- Exact receipt retries did not duplicate cards, resource charges, or Ranked settlement.

## Timing samples (network included)

| Sample | Battle RPC calls / observations | Median | Range |
|---|---|---:|---:|
| Private battle / repeated snapshots | 29 total RPC calls in report | 229 ms | 215–282 ms |
| Final Ranked verification segment | 10 total RPC calls in report | 252.5 ms | 218–573 ms |
| Actual client-controller exercise | 16 total RPC calls | 291 ms | 259–325 ms |

Medians/ranges include only `hub_battle_update` observations in each report. Initial/full Hub snapshots are larger and slower; these figures do not represent those snapshots. Transport overhead includes the cloud test environment. Production's original timeout cannot be retrospectively timed without its logs; local pre/post profiling remains in REPORT.md.

## Final integrity

Both accounts completed two private battles and one Ranked battle, with zero active rooms afterward:

- QA 1: 5,000 → 5,030 total cards; three packs opened.
- QA 2: 0 → 30 total cards; three packs opened.
- Each: cash unchanged at $2,500; starter packs 10 → 7; one Ranked result recorded despite replay testing.
- The live backend retains its existing legacy rating rules; the tested Ranked tie resulted in 8 RP each. This hotfix did not change rating formulas or apply the separate V260 economy/rating migration.
- No marketplace listings or player trades were created by QA. No existing player's save, cash, inventory or rank was edited. The clearly labelled QA records are retained, with no unfinished matches.
- Stakes was not enabled or exercised.

## Automated gate and remaining limits

A fresh `pnpm run release:check` passed after the user confirmed applying the SQL patch: **288 tests passed, zero failed**, plus production build and 52-resource smoke. No source changes followed that run; this report records additional live verification.

Physical Samsung Internet/Android and native Safari testing remain necessary. The live large-collection check used a new QA account; a 2,000-room history was tested locally, not manufactured on production. No production log/SQL-management connector is available, so absence of timeouts applies to the observed requests, not every live account.
