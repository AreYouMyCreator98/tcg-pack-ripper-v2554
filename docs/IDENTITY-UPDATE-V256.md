# Trade Hub identity update

Build: `v256-trade-hub-2`. Cache: `tcg-pack-ripper-0.256.0-4`.

Status: merged through [PR #2](https://github.com/AreYouMyCreator98/tcg-pack-ripper-v2554/pull/2) as `59cfb9bb046aae91c1df13b47d1ef7c515769fdd`. The matching database migration was applied as `20261003104948`. [Pages release run](https://github.com/AreYouMyCreator98/tcg-pack-ripper-v2554/actions/runs/37117766122) succeeded. The public build marker, main bundle, dynamically loaded Trade Hub bundle, shop stylesheet, trade screen and service-worker cache match the tested build. A signed-out browser check confirmed the live pearl-glass shop controls and preserved local balance.

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

Read-only production preflight confirmed all five sets are already installed (245, 230, 195, 252 and 230 cards respectively). The 20 browser-uploaded files exactly matched the tested local commit before merge. GitHub push and pull-request validation both passed.

Implementation and local tests used no browser or cursor. The user then authorized browser publication. Physical-device interaction and real two-account Supabase Auth/Realtime sessions are not verified by these tests. Local database tests run PostgreSQL 18.3; production is PostgreSQL 17.11.

## Deployment record

The database update was installed before merging the frontend. Production PostgreSQL returned five eligible ranked sets, valid ten-card packs from every set, the chat profile map and tracker preferences. Player access to the internal pack-award function remains denied. The five existing profiles and combined 309 RP were unchanged by the migration; no rooms were active during installation.

The GitHub connector could read but could not write this repository. The release was uploaded through the already signed-in GitHub browser, without changing account permissions. Nine upload commits were reviewed in PR #2 and merged only after both GitHub validation runs passed.

This migration is additive and preserves rooms, player saves, ranks and receipts. Existing clients tolerate its extra snapshot fields. Do not replay historical migrations. Two-account live-service checks remain a separate gap until test accounts are available.
