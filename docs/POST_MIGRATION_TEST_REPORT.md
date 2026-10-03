# V251 Post-Migration Hardening Report

## Automated checks

- 11/11 Node tests passing.
- All classic runtime chunks parse with `vm.Script`.
- Essential UI/nav contract preserved after HTML extraction.
- Legacy save migration tests remain non-destructive.
- Artwork and multiplayer remain outside the startup critical path.
- Binder module now talks to artwork through a modular facade.
- Static deploy smoke-tested across 22 critical resources.

## Runtime architecture changes

- UI fragments are versioned, timed out, and retried once.
- Runtime chunks are versioned, timed out, and retried once.
- A failed optional/secondary system can be retried later without poisoning the loader cache.
- Binder secondary runtime is warmed on Binder interaction, not required for Rip Packs startup.
- `TCG_HEALTH.run()` checks essential mounted UI/navigation at runtime.
- `tcg:runtime-progress`, `tcg:secondary-failed`, `tcg:artwork-status`, and `tcg:health` events provide diagnostic hooks.

## Deliberately unchanged

- Save schema/version: still schema 1.
- Pack odds and pack generation.
- Economy, card ownership, grading, marketplace and multiplayer data.
- Supabase tables/RPCs/functions.
- Existing IndexedDB artwork cache format.

## Manual device regression pass after deployment

Test on Android and iPhone/Safari:

1. Rip one pack and one 10-pack.
2. Open Binder and flip at least three pages.
3. Inspect a Binder card, close it, reopen it.
4. Open Bulk Tub.
5. Open Trade and Multiplayer.
6. Open Profile, Ranked and Season frames.
7. Open Specials.
8. Force Sync while signed in, reload, confirm state returns.
9. Background/resume the browser and re-open Binder.
