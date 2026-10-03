# Trade Hub identity update

Build: `v256-trade-hub-2`. Cache: `tcg-pack-ripper-0.256.0-4`.

Status: implemented and verified locally; publication and the matching database migration are pending GitHub authentication. The previously published game remains unchanged.

## Changes

- Global chat shows the collector's saved photo and equipped, owned rank frame. Missing photos use initials. Each collector's photo is transmitted once per snapshot, rather than once per message. Blocking removes both messages and their profile data.
- Success feedback describes the action. Chat sends and card reveals no longer leave an “Action complete” notice; changing tabs clears old notices.
- Background heartbeats keep their persisted recovery receipt and collection synchronization safeguards. They no longer show a saving banner or disable the identity editor/chat. A foreground action waits for an in-flight heartbeat; failed maintenance must recover before a new mutation. Account changes cancel queued work.
- The ranked summary places the profile photo inside the current rank frame. The banner and chat use the equipped earned frame from Profile.
- The identity editor previews the same banner renderer opponents see in active rooms. Name, title, style, earned badges, record visibility and up to three stat trackers update immediately in the preview. Save publishes the identity. Tracker values come from server-ranked wins, losses, ties, best RP and streak; submitted values cannot alter results.
- Ranked matchmaking chooses one shared set from Paldean Fates, Crown Zenith, Shining Fates, Surging Sparks and Obsidian Flames. Both packs use the chosen set's real catalogue, identical rarity rules and no starter rarity bonus. Regular collection/private-battle unlock requirements remain intact. Starter packs, credits, cash and card retention are unchanged.
- Local-shop buttons use opaque pearl-glass surfaces, readable text and keyboard focus states. Four source emojis are replaced with consistent SVG line icons; existing button IDs and actions remain intact.

## Verification

`pnpm run release:check` passed 134 tests, project validation, the static resource check, production build and production resource check. See `IDENTITY-RELEASE-CHECK.txt` for the complete output. Tests exercise the actual controller, DOM events and authenticated PostgreSQL command boundary using Linkedom and PGlite.

New regression coverage includes all five real ranked card pools, both-ready gates, sequential reveals, retained cards/results, private-set restrictions, avatar/frame ownership, exact preview/opponent banner equality, badge/tracker limits, live preview edits, privacy, forged tracker rejection, older profile payloads, deduplicated chat profiles, quiet maintenance, uncertain-response recovery and account switching during queued work.

Read-only production preflight confirmed all five sets are already installed (245, 230, 195, 252 and 230 cards respectively). The public repository still points to `d8f74b905ebdffe656e22807b4ca2cfe2d996bc5`.

No browser or cursor was used for this update. Pixel rendering, physical-device interaction and real two-account Supabase Auth/Realtime sessions are not verified by these tests. Local database tests run PostgreSQL 18.3; production is PostgreSQL 17.11.

## Deployment

1. Restore normal GitHub write authentication for `AreYouMyCreator98/tcg-pack-ripper-v2554`. The connected GitHub app currently returns HTTP 403 for writes and Git has no stored authentication.
2. Once frontend publication is available, apply only `supabase/migrations/20261003101824_trade_hub_identity_ranked.sql` to the existing database, through the migration API. It adds a profile preference and replaces private functions; it preserves all rooms, player saves, ranks and receipts. Existing clients tolerate the additive snapshot fields. Do not replay the historical migrations.
3. Push the prepared frontend commit to the repository, wait for the Pages validation/deployment workflow, then verify the public build marker, cache version and changed resource hashes over HTTP.
4. Record the applied migration version and successful Pages run before marking this update deployed. Two-account live-service checks remain a separate gap until test accounts are available.
