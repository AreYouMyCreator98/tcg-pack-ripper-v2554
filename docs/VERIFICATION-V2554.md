# V255.4 verification report

Date: 3 October 2026. Input: user-supplied `tcg-pack-ripper-v255.3-source.zip`.
Output: version **0.255.4**, build **v2554-system-reliability-1**, save schema **1**.

This is a broad local reliability update with targeted code review, automated regression tests and hands-on browser testing. It is not a certification that every interaction is defect-free, a full security audit, or a completed live multiplayer test. The user requested local testing first and a report of live-service gaps. No deployment or database migration was performed.

## Measured results

| Check | Result | Scope |
|---|---|---|
| Automated suite | 86 passed, 0 failed, 0 skipped | Existing structural checks plus behavioral regression cases |
| Generator stress case | 4,000 generations / 40,000 cards | Ten valid cards and one charge per pack across SV, SWSH, SM and XY synthetic pools |
| JavaScript syntax | 66 files passed | All maintained src and public/runtime JavaScript files |
| Project integrity | Passed | Required files and runtime asset/size safeguards |
| Unbundled HTTP smoke | 50 resources passed | Static entry points, modules, runtime, UI and assets |
| Production build | Passed | Vite output and generated precache containing 35 resources plus root |
| Production HTTP smoke | 38 requests passed | Generated precache resources, root and service worker |
| Fresh production startup | Passed | Game and Binder loaded; captured console had no errors or warnings before outage testing |
| Production server outage | Passed | After a normal load, stopped the local HTTP server, reloaded, and opened Binder from the cached app |
| Mobile UI | 390 × 844 | Pack opening, recaps, grading, collection, trading and sealed flows |
| Desktop UI | Normal browser viewport | Production startup, Binder and cache recovery |

The stress case executes the actual core generator with synthetic card pools and stubbed external collaborators. It does not establish live API correctness or the statistical accuracy of every rarity rate. Several inherited tests are source assertions rather than end-to-end gameplay. Vite reports public stylesheet references that resolve at runtime; those files exist and pass the production HTTP checks.

## Changes included

1. **Binder taps:** pointer capture now starts after horizontal movement, preserving card clicks. The broken inspector was reproduced and the repair retested in the browser.
2. **Invisible notification blockers:** noninteractive toast layers ignore taps, including after fading out. This repaired mobile Vault navigation after grading.
3. **Selling races:** lock an in-flight sale per card, recheck ownership and quantity after price hydration, reject invalid prices, and release the lock after failure. Tests cover double taps, removed inventory and retries.
4. **Batch rollback:** restore scoped payment/progression fields and clear partial cards when ten-pack generation fails. Publish provisional pack events only after the whole batch succeeds. Test both false returns and exceptions after partial generation.
5. **Generator failure paths:** empty pools and incomplete fallback data terminate safely; rejected generation releases the opening UI. A minimal fallback catalog still produces ten cards.
6. **Reveal All retries:** track collected indices so a retry after finish/render failure cannot award them twice. Test a partially completed batch, locked decisions and finish failure.
7. **Recap estimates:** explicitly label totals containing minimum fallback prices. This avoids presenting 100 unpriced cards as a confirmed $10 value. Card inspection remains the route to refresh market detail; the recap does not wait for 100 price requests.
8. **Market counters:** listing count, active-listing hint and exchange cash refresh with market rendering. Retested immediate 1 active then 0 active on cancellation.
9. **Artwork:** preserve inventory on artwork HTTP 404; ignore a delayed pack-art response after set selection changes; avoid an unhandled rejected promise during artwork-task cleanup.
10. **Progression audit:** include expansion subsets, wait for critical startup, and treat unavailable network data as unknown instead of caching a false failure.
11. **Save/numeric guards:** retain current save-envelope metadata, reject future schemas instead of downgrading them, and prevent invalid numeric metadata from poisoning counters and totals.
12. **Runtime readiness:** report script completion separately from pending loads.
13. **Account client:** account and multiplayer reuse one Supabase client; pin its CDN version. The earlier duplicate-client warning was absent in fresh production startup.
14. **Production cache:** generate the precache from actual bundled output, use that cache for hashed bundles during outages, and preserve unrelated origin caches during cleanup.
15. **Build tooling:** fix Windows paths, pin dependencies with a pnpm lockfile, align version metadata and add production resource checks to CI.

## Hands-on gameplay record

Tests used a disposable local browser save, not a signed-in account. All money below is in-game currency.

| System | Observed result |
|---|---|
| Single pack / gestures | Rip, extract and finish ten cards: one Binder hit and nine Bulk cards; one starter credit used |
| Save reload | Completed inventory, balances and later the graded slab persisted |
| Inspector | Card tap opened inspector after the pointer fix |
| Grading | $12 standard submission removed the raw card; later pack openings completed the wait; return revealed one 9.5 Iron Treads ex slab; Keep in Vault left one slab after reload |
| Bulk | Nine cards displayed; sale added $1.30 and emptied Bulk |
| Starter/cash batch | 100 cards: 9 Binder / 91 Bulk; nine starter credits plus $8 charged |
| Daily reward | Added $25 and one Paldean Fates credit; button became disabled Already Claimed Today |
| Buy single | Forretress ex bought for $0.71; balance changed accordingly |
| Listing/cancel | Listed one card and cancelled; returned card was available for the subsequent local trade |
| Local trade | Forretress ex exchanged for Great Tusk ex; trade count became one; cash unchanged |
| Sealed purchase/display | Bought one $8.35 booster and displayed it; opening was blocked until removed from display |
| Sealed opening | Removed display then opened product; owned/shelf inventory emptied and credits increased from one to two |
| Final batch recheck | 100 cards: 2 Binder / 98 Bulk; two sealed credits plus $64 charged; $77.24 became $13.24; recap labelled 99 minimum estimates |
| Final listing recheck | Great Tusk ex listing immediately showed 1 active; cancellation immediately showed 0 active |
| Profile/progression | Level, pack counts, history, rewards and unlocked-set count rendered; Surging Sparks unlocked after the first batch |
| Specials | Locked collection, challenge progress, filters and disabled zero-key Vault control rendered |
| Online entry points | Signed-out player-market and multiplayer prompts appeared; no match, chat message or external trade was submitted |

Screenshot evidence is in the verification ZIP. Key files: `04-card-inspector-fixed.jpg`, `09-grading-return.jpg`, `10-vault-after-reload.jpg`, `12-sealed-credit-conversion.jpg`, `14-production-server-offline.jpg`, `15-final-ten-pack-recap.jpg`, and `16-listing-counter-fixed.jpg`. Earlier images show intermediate states; screenshot 15 includes the final recap fix.

## Live-service gaps and source findings

These are outstanding release checks. The archive's old instructions claimed a migration had already been applied; that claim was not treated as proof of the current backend state.

| Priority | Gap / finding | Follow-up |
|---|---|---|
| High | Ranked results accept a client-supplied score in mp_submit_battle_result | Design/test server-authoritative scoring or authenticated server-generated results before trusting competitive rankings |
| High | Supplied SQL returns early only for completed rooms; a cancelled room can proceed to the update setting playing | Add and test terminal-state rejection in a forward migration; also test null-score rejection, since the current numeric range check does not reject NULL |
| High | No two-account staging match | Test matchmaking, both READY gates, set choice, duplicate results, disconnect/reconnect, cancellation, rank updates and profile banners |
| High | Cloud save/authentication unverified | Test sign-in/out, expired sessions, offline writes, device conflicts, save versions and account isolation |
| High | Player market/private trade unverified | Test permissions, ownership, concurrent purchases, insufficient funds, duplicates, accept/cancel races and reconnects |
| Medium | Chat/presence unverified | Test real-time updates, unread/mute behavior, reconnects, access rules, rate limits and moderation |

The supplied SQL was inspected but not executed or changed. Client-score authority needs backend design and database tests; frontend assertions do not establish backend safety.

## Other limits

- No Android/iOS native build, real touch device, Safari/WebView matrix, physical haptic check or listening test.
- The outage test stopped the local app server. External card services and browser-cached third-party scripts remained available. This does not prove first launch or full play with the whole device offline.
- Reloads were tested after completed actions. Force-close during a paid opening, multi-tab save collisions, storage exhaustion and a long-running soak remain unverified.
- Special unlocks, every reward/set/chase, God Pack presentation, every auction/dealer/customer variant, completed timed market sales and all season transitions were not played end to end.
- External catalogs supply art, rarity and prices; some details remain provisional until hydration.
- The historical runtime still contains interdependent wrappers. This release provides targeted safeguards rather than replacing every subsystem. Code-review depth is concentrated on the failures listed above.

## Reproduce

Use Node 22.12+ and pnpm 11.19.0:

```text
pnpm install --frozen-lockfile --ignore-scripts
pnpm run release:check
pnpm run serve:static
```

The release check runs tests, integrity checks, static HTTP smoke, production build and production HTTP smoke. Keep the site's origin/path to retain browser-local saves. Back up a real player's save before replacing a deployed build. Complete staging checks before an online rollout.
