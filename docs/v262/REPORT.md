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

- **Live authenticated Draft Duel matches: 0/10.** SQL has NOT been applied by this agent. Public feature flag remains OFF in the migration; two isolated QA accounts require the separate allowlist.
- Live matchmaking/turn latency, websocket propagation, actual background/resume, timeout-free large-account play, simultaneous network submissions and end-to-end browser RP/collection persistence require the deployed backend.
- No physical Samsung/Android testing or Safari/WebKit run was available in this environment. Chromium light/dark/touch tests do not simulate Samsung forced-darkening or Safari's engine.
- Collection-value, grading and tournament banner trackers are not added; only existing authoritative Ranked/Draft counters are offered. New seasonal resets/rewards are not activated. Existing rank-frame artwork is reused inside the new composition.
- Broad human balance, draft efficiency coaching and successful-swap outcome attribution remain future tuning work. Current result metrics accurately report damage/blocking/type advantages, swaps used, ability damage/healing, cost efficiency, damage/turn and pack values.

## SQL review and next step

Read `SQL-REVIEW.md`, then review/apply `supabase/migrations/20261008040000_collector_league.sql` and `QA-ALLOWLIST.sql`. No SQL was auto-applied. The live RPC runner is `scripts/verify-league-live.py`; it requires the private isolated-account credential file via environment, prints no credentials and never publishes. It complements, not replaces, websocket/mobile checks.

**Do not merge/publish to main.** After SQL application, complete at least ten authenticated matches and all required live checks. Recommend internal QA first, then an optional beta only after measured results. Do not make Draft Duel the primary live Ranked mode yet.
