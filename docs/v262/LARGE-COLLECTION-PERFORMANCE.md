# V262.2 — large-collection rendering

The user reported approximately four-second actions on the isolated QA account, while their ordinary account in Chrome remained responsive. QA Hotfix 1 contains 4,809 Binder identities plus 315 Bulk identities. The full app CPU profile confirmed repeated collection scans in Profile: chase requirements, max card value, Binder totals and Master Set totals. A legacy Hub activation also rendered hidden Profile, and Profile navigation rendered it twice.

Changes:
- One synchronous Profile render shares its collection reads and a normalized chase index. The cache is discarded in `finally`; no ownership/value cache survives the action, account change, sale or reload.
- Boolean set-access checks return early for permanently retained sets or insufficient XP. Detailed requirements and first-time unlock migration retain their previous logic.
- Unchanged Hub rating/escrow snapshots no longer redraw Profile; actual rank, record and escrow changes still do.
- Hub activation does not redraw hidden Profile. Profile navigation uses the existing navigation renderer once. The level reward road is rendered once per Profile refresh instead of twice.

Measured with the complete app, 390×844 Chromium, 4× CPU throttle, the same large QA dataset: median Profile rendering **5,451.8ms → 785.7ms** (85.6% reduction). Four repeated Profile renders became one in the navigation sample. End-to-end navigation also improved but includes automation/network/layout variability; it is not a server latency or physical Samsung benchmark. Evidence: `verification/large-profile-performance.json`.

The full-app test uses certificate-verified HTTPS forwarding; native WebSockets are restricted in this environment. Some large-account navigation/layout tasks still exceed 50ms under CPU throttling, so this is not a claim that every action is instantaneous. Physical-device confirmation remains necessary.

Validation: **332 tests passed**, `pnpm run release:check` passed, production smoke 62 resources. Smaller synthetic-account 390×844 browser checks passed set cycling/locked sets, Rip quick actions, 1/10 mode, Profile avatar persistence and layout. New tests verify indexed/scanned chase ownership parity, within-render memoization and exception cleanup, retained/XP/migration access rules, and unchanged-versus-changed Hub identity rendering.

No SQL migration, save reset, QA inventory reduction, pull-rate change, rank calculation change or feature-flag change. Build `v262-large-collection-1`, version 0.262.2; service-worker cache incremented.
