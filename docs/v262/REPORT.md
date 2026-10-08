# V262 internal QA report — NOT approved for main

Branch: `feat/v262-collector-league`. Build: `v262-league-internal-qa1`. Saves remain schema 1.

## Implemented

- Additive server-authoritative Draft Duel: same-set pack purchase/awards, hidden monotonic reveals, five-card draft, budget validation, simultaneous tactical turns, server deadlines, atomic RP settlement, permanent highest rank and bounded match review.
- Reuses optimized pack generation, ownership transactions, authenticated Hub profiles, card resolver and cloud transaction barrier. Casual/current Ranked remain available; no Stakes changes.
- Seven deterministic abilities, limited rarity influence, explicit derived affinities when printed metadata is missing. Squad budget adapts only when a high-rarity pool otherwise admits no legal five-card squad.
- Account-scoped Realtime signals, compact snapshots, coalesced rapid reveals, persisted receipts/draft selections, stale-read rejection, reconnect/backoff and subscription cleanup.
- Shared competitive banner in queue, Collectors Clash, Profile Studio and equipped public profiles. Actual avatar, original smoke composition, earned rank frames, three existing earned badges, three privacy-filtered trackers; save-on-confirm editor. Existing saved looks/title/photos survive.
- Thumbnail draft/bench art; medium active cards. Scoped dark-silver layout, explicit contrast, safe-area/action-bar spacing and reduced motion.

## Local evidence

- Full suite and `pnpm run release:check`: **323 passed**, no skipped tests. Production smoke: 62 resources. The final run is recorded in `docs/v262/verification/release-check.txt`.
- Ten complete LOCAL PGlite role-authenticated simulations, including the widening RP search window, passed ownership, costs/credits, stale and duplicate commands, hidden information, result and RP idempotency. These do **not** satisfy live QA.
- 10,000-card collection plus 2,000 historical matches: snapshot about **6.4KB**, local median **1.7–2.0ms**, max **2.8–3.2ms** across the recorded runs. Timing is local PGlite, not Supabase/network latency.
- Forty controlled counterfactual balance simulations: common fire squads beat max-rarity grass squads **39/40**, averaging **13.75 turns**. This tests type-counter viability, not overall balance or real player skill.
- Chromium mobile/touch fixture pass, using the app's actual styles: 360×800, 390×844, 393×873, 412×915, 430×932, 768×1024, 1440×900, each in light/dark browser preference. No horizontal overflow; action targets at least 44px; draft selection/confirm, four battle actions, swaps and clash readiness exercised.
- Existing app navigation regression passed all seven sizes: Rip, set arrows/unlock rules, pack mode, quick actions, Profile/avatar persistence, settings/overlays and Collection entry.
- Repeated account switching removes subscriptions/timers; deferred snapshots cannot overwrite a submitted action. No full collection in turn RPCs. Diagnostics retain only the latest 100 timing/size rows.

## Not yet verified / remaining gates

- User applied the migration and isolated QA allowlist. **Ten authenticated live RPC matches passed**; additional live mobile UI matches are recorded below. No SQL was auto-applied by this agent. Public enablement was not requested or changed by this agent.
- Live RPC, authenticated Realtime, reconnect and large-account checks now passed (see evidence below). Actual OS suspension/network switching and full-app cloud-save handoff still require physical-device QA.
- No physical Samsung/Android testing or Safari/WebKit run was available in this environment. Chromium light/dark/touch tests do not simulate Samsung forced-darkening or Safari's engine.
- Collection-value, grading and tournament banner trackers are not added; only existing authoritative Ranked/Draft counters are offered. New seasonal resets/rewards are not activated. Existing rank-frame artwork is reused inside the new composition.
- Broad human balance, draft efficiency coaching and successful-swap outcome attribution remain future tuning work. Current result metrics accurately report damage/blocking/type advantages, swaps used, ability damage/healing, cost efficiency, damage/turn and pack values.

## SQL review and next step

The user reviewed/applied `supabase/migrations/20261008040000_collector_league.sql` and `QA-ALLOWLIST.sql`. No SQL was auto-applied. The live RPC runner is `scripts/verify-league-live.py`; it requires the private isolated-account credential file via environment, prints no credentials and never publishes. It complements, not replaces, websocket/mobile checks.

**Do not merge/publish to main.** The ten-match backend gate passed; finish physical-device validation before rollout. Recommend internal QA first, then an optional beta only after measured results. Do not make Draft Duel the primary live Ranked mode yet.

## Live migration preflight (8 October 2026)

User applied the migration. At initial preflight, both accounts received version 262 but returned `enabled=false` (0/10). The user subsequently applied the allowlist; this historical preflight is superseded by the successful live results below. Existing full Hub and compact battle snapshots succeeded for both accounts without statement timeouts. QA1 retains 5,030 card copies and three packs; QA2 retains 30 copies and three packs. The full suite/release check was rerun: 323 passed. Measurements and gate status are in `verification/live-preflight.json`. Main remains unchanged.

## Authenticated live verification after QA allowlisting

- **10/10 full authenticated RPC Draft Duel matches passed**, using only QA Hotfix 1 and QA Hotfix 2. The large account began with 5,030 owned card copies. Every match awarded exactly ten cards/player, charged the expected credit/cash once, settled RP according to the server formula, and returned identical combat/results to both participants. Replayed requests did not repeat awards. Reauthenticated reconnects were exercised in matches 3/6/9; match 8 exercised the server deadline/default Defend.
- 1,085 measured RPCs: turn-submit median **211.7ms**, p95 **239.8ms**, max **558.4ms**; snapshots median **208.5ms**, p95 **234.1ms**, max **1,072.3ms** (initial request). Ready/pack commit max **755ms**. These are HTTPS round trips, not server-only execution. No statement timeouts occurred. Largest live payload **9,432 bytes**; turn/result payloads ≤9,337 bytes. Evidence: `verification/live-matches.json`.
- Actual authenticated Supabase Realtime subscription and a fresh resubscription each received eight private user/revision signals. Measured commit-to-receipt delay **173–599ms**, 492 bytes/event. Out-of-order events were observed; authoritative refetch, rather than applying event contents, is intentional.
- **Two additional complete live mobile UI matches passed (12 total live matches).** Real LeagueController/LeagueView, actual app styles, separate authenticated sessions at **390×844 and 360×800**, Chromium with **4× CPU throttling**. Exercised queue, clash, ready, live opponent reveal without unrevealed-card leaks, rapid reveal-all, draft selection, Attack/Defend/Ability/Swap, reconnect/resubscription, combat agreement and result. Persisted saves gained exactly ten cards/one pack and spent $8 per player per match; profile RP equaled the result.
- The browser harness forwards real authenticated HTTPS and real Supabase Realtime through a local certificate-verifying adapter. This avoids this environment's browser CA limitation without disabling TLS checks. First match exercised image fallback; second used verified remote artwork with no image request failures. This is a component integration test, not a complete app boot/cloud-save handoff or native mobile network certification.
- No JS page errors, no horizontal overflow, 70 DOM nodes at result. Observed maximum long task **66ms** in fallback run, **57ms** with artwork (4× CPU throttled); no multi-second freezes. These short two-match measurements do not establish a long-session memory benchmark. Evidence: `verification/live-mobile.json`.
- Full automated suite/release check after migration: **323 tests passed**, production smoke **62 resources**, offline manifest **50 resources**. No implementation changed after this check; this follow-up updates evidence only.

### Rollout status

Review branch only; main and production remain unchanged. Public Draft Duel remains disabled in the reviewed configuration; the user-applied QA allowlist now grants the two isolated accounts access. The private live configuration cannot be independently enumerated with the available API, so no claim is made that `qa_users` is empty (it intentionally is not). Stakes is unchanged and not enabled by this update. No existing player account was accessed or reset. Only isolated QA accounts received match costs/cards/RP changes.

The ten-match authenticated backend gate is satisfied. Before public rollout, test physical Samsung/Chrome and Safari suspension/resume, actual full-app cloud handoff and longer mobile sessions. Keep the public flag off and Casual/current Ranked available during this final device pass.
