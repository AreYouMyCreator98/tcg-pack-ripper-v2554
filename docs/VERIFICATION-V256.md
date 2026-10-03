# V256 verification — 2026-10-03

Current update: **v256-trade-hub-2 was merged through [PR #2](https://github.com/AreYouMyCreator98/tcg-pack-ripper-v2554/pull/2)** after all 134 tests passed locally and in GitHub. The matching database migration is installed. See [identity update](IDENTITY-UPDATE-V256.md) and [Pages deployment](https://github.com/AreYouMyCreator98/tcg-pack-ripper-v2554/actions/runs/37117766122). The earlier deployment records below describe the preceding release.

**125 tests passed in each of three consecutive complete runs; zero failures, skips or cancellations.** The release check also passed project integrity, the Vite production build, the unbundled static resource smoke test (55 resources), and the production resource/cache smoke test (38 resources).

The publication follow-up added a build-metadata consistency check and made the cache-preservation fixture independent of the release suffix. **The final local release check passed all 126 tests**, the build and both resource checks. [Final log](FINAL-RELEASE-CHECK.txt).

Initial development verification used code tests. The user subsequently authorized browser publishing and live visual checks. The same 125-test suite, build and resource checks also passed in GitHub Actions. This does not cover every possible live-service failure.

Production verification on 2026-10-03: PostgreSQL 17.11 accepted both migrations; 32 expansions and 6,889 catalog cards loaded with zero invalid identity/tier rows; all 32 expansions generated valid ten-card packs. Five existing listings and ranked records transferred with zero mismatches. Private table RLS and helper grants passed inspection, retired RPC access is revoked, and missing authentication was rejected. The signed-out live game opened the rebuilt hub with the existing local cash balance intact. The browser check found and corrected a legacy theme heading/button contrast conflict and stale build metadata. Two-account online gameplay, real reconnects and concurrent-device behavior remain unverified.

## Evidence

| Run | Passed | Failed | Test duration |
| --- | ---: | ---: | ---: |
| Release check | 125 | 0 | 14.69 s |
| Independent repeat 2 | 125 | 0 | 14.53 s |
| Independent repeat 3 | 125 | 0 | 14.66 s |

The three complete logs are in `docs/verification/`. Tests are repeatable with `pnpm run release:check` or `node --test tests/*.test.mjs`. Historical V255 assertions moved to `tests/legacy/` and are excluded because they describe code that is no longer loaded.

## Coverage

There are **51 new Trade Hub tests** and **74 retained game tests**. The Hub tests execute the actual SQL migration and RPC dispatcher in isolated PGlite/PostgreSQL 18.3 databases, with separate synthetic player identities and the authenticated/anonymous role boundary. DOM tests run the actual view and controller against that database through a small RPC adapter; they do not substitute fake purchase or trade logic.

- Authentication, private-table/helper permissions, participant checks and the waiting-room NULL-guest boundary.
- Escrow reservation/return, price validation, insufficient cash, stale save versions, purchase contention, receipt replay and card/cash conservation.
- Two-sided trading, stale offer revisions, draft changes, ready resets, cancellation and expiry.
- Ranked matchmaking, blocked collectors, private-code boundaries, fixed ranked pool, set changes, both-ready gate, and account room limits.
- Server packs/scores, sequential reveals, opponent-card privacy, rank updates once, private rank isolation, forfeits and abandoned-match handling.
- Starter/credit/cash ordering in three-pack battles; atomic rollback when one player cannot pay; pack history and collection counters.
- Chat limits, duplicate sends, blocking, reporting, text injection protection, identity privacy and earned badge validation.
- Lost-response recovery, persisted request keys, double clicks, stale polls, authentication changes, storage failures and startup autosync barriers.
- Keyboard/input barriers, cloud-pull failures, unfinished normal packs, installation idempotence and local-shop access while signed out.
- Preservation of existing listing escrow during cutover, refusal to cut over active legacy battles, and rejection of legacy commands after cutover.
- Real 6,889-card catalog installation, all 32 set definitions, Gallery/Vault identities, six complete ranked tiers and existing XP/prestige unlock checks.

Each full run also generates 100 battle packs from real catalog data and retains the previous test that generates 4,000 ordinary packs across four eras. The existing game tests cover pack failures/refunds, Reveal All recovery, save migrations, collection models, artwork identity, UI contracts, boot ordering and offline cache behavior.

Representative main-set, Gallery and Vault image URLs returned HTTP 200 in six header-only checks. This checks selected URL availability, not the visual quality or availability of every image.

## Important limits

PGlite is real PostgreSQL compiled to WebAssembly, but its single database connection queues test requests. The contention tests prove repeat safety and conservation in those interleavings; they do not replace a multi-connection production lock/load test. The deployed Supabase database uses PostgreSQL 17.11 and still needs a staging migration rehearsal.

No live accounts were used for gameplay mutations, and no production migration or frontend deployment occurred. Supabase Auth refresh, Realtime delivery, two-device cloud-save timing, mobile layout and touch behavior require the staging/live checks in [DEPLOYMENT-V256.md](DEPLOYMENT-V256.md).

Card price metadata without a quote uses the existing $0.10 fallback. External card art is a separate service. The broader game's client-authored economy is not made cheat-proof by this Hub rebuild.

## Main integration fixes

The replacement removes competing online handlers and client-submitted ranked scores. It advances save versions for server collection changes, retains action receipts across lost responses, prevents stale UI responses from crossing accounts, resets confirmations after offers or battle sets change, and keeps reserved cards in collection progress. Card transfers neutralize metadata before it reaches older collection renderers. Existing rank thresholds, daily rewards, profile frames, and the offline collector district are preserved.
