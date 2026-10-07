# V261 implementation map

Baseline: ff7f248 (V260.1). No V260.2 is present on fetched main. Development branch: v261-dark-silver. User subsequently authorized main publication after validation.

| Current system | New location/presentation | Reused code | Refactor | Migration risk |
| --- | --- | --- | --- | --- |
| Rip studio | Reference composition | Pack engine / studio controls | Silver shell, adaptive showcase | UI only; generator unchanged |
| Set tiles | Change Set + unlocked arrows | fastSelect, sel, setUnlocked | Narrow bridge selection | No unlock migration |
| Cash / level | Header | state.coins, levelFromXP | Event-driven display | No writes |
| Profile identity | Header avatar / Profile | Profile Studio snapshot and ownership | Shared identity projection | No migration |
| Clock | Rip status row | gameClockV170 | Move existing node | No clock change |
| Master Sets | Quick tile / Collection | setTotalsV57, collection.loadSet | Expose selected-set navigation | No calculation change |
| Chase guide | Quick tile | setChaseOverlayV186 / inspector | Reuse existing trigger | None |
| Sealed | Quick tile / Collection | sealedModalV161 | Existing action | None |
| Single / ten-pack | Existing result state | V260.1 batch transaction / compact recap | Theme only | No outcome change |
| Collection / physical Binder / Specials | Collector vault theme | Existing panels and image policy | Shared surfaces | Preserve owned skins/art |
| Hub / Market / Trades / Battles / District / Social | Collector exchange theme | Existing hub/server calls | Shared controls and panels | No economy mutations |
| Profile / Settings / Journal / account | Same theme | Existing identity/account/save flows | Shared controls and panels | No persistence changes |

The save schema and authority map remain those documented in docs/v260. No save keys are removed, reset or migrated in V261. Pending backend rollout and unavailable Stakes remain explicitly unavailable. CSS must not recolor actual card artwork, rank assets or owned Binder skins. Device testing is simulation unless explicitly reported otherwise.
