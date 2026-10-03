# Architecture

## Critical boot
1. `index.html` loads CSS and Supabase.
2. `src/main.js` mounts UI fragments.
3. `runtime/core.js`, `runtime/progression.js`, `runtime/special-collection.js`, and `runtime/packs.js` load in their original order.
4. The game becomes interactive.

## Deferred systems
Multiplayer, rank frames, ranked profile decoration, and Binder artwork caching load during browser idle time or immediately when their navigation destination is touched.

## Why classic runtime chunks?
The existing game has years of global functions and patch wrappers. Converting those directly into ES-module scope would change semantics and risk save/game regressions. The loader keeps their original classic-script semantics while giving each system a named file. New code should be written as ES modules under `src/` and gradually replace the classic chunks.

## Assets
Rank frames and Special Collection artwork are now normal WebP files under `assets/`, not base64 strings inside JavaScript. This allows browser caching and prevents large JavaScript parses on iOS.

## PWA
`sw.js` caches local assets only. Supabase/API requests are deliberately excluded so cloud save and multiplayer data are never served stale by the service worker.

## V252 Binder boundary

Binder UI and card artwork no longer depend on `public/runtime/artwork.js`. The only classic-script Binder dependency is `public/runtime/binder-bridge.js`, which exposes narrow hooks into the existing save/economy/grading globals. Everything else is maintained as ES modules under `src/screens/binder/` and `src/artwork/`.

Artwork is view/cache data only. Cache failures must never delete cards, decrement quantities, or alter ownership. Low-resolution fronts are cached persistently in IndexedDB; high-resolution images are requested only for inspection. Existing V239 cache keys are intentionally retained for player cache continuity.
