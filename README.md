# TCG Pack Ripper+ — V256 Trade Hub

Rebuilt marketplace, trading, multiplayer, global chat, pack battles, matchmaking and ranked play. Start with [the system guide](docs/TRADE-HUB-V256.md), [verification](docs/VERIFICATION-V256.md), and [deployment instructions](docs/DEPLOYMENT-V256.md). The new online backend has not yet been installed on the public deployment.

Requires Node 22.12+ and pnpm 11.19.0. Run `pnpm install --frozen-lockfile --ignore-scripts`, then `pnpm run release:check`. `dist/` is the production build; `deploy/` is the unbundled static build. Serve over HTTP(S).

## Earlier architecture notes


The playable game is maintained as a modular Vite/static-Pages project while preserving compatibility with existing player saves and the current Supabase backend.

## V253.2 mobile polish
- Combines FAST, SESSION, SIR+ and GOD into one opaque-glass collector pill positioned directly above the 1 PACK / 10 PACK selector.
- Hides the collector pill automatically during extraction, live card reveals and the completed-pack summary so it never overlays card art.
- Reorders the completed-pack experience to begin with the card fan at the very top, followed by recap stats and then the Open Another Pack CTA lower in the scroll.
- Adds explicit extraction-layer compositor ordering so Android Chrome keeps pulled cards behind the pack wrapper until they clear the opening.

## V253 focus — Pack Engine + Reveal 2.0
V253 puts pack-session orchestration, reveal profiles, recap UI, streak tracking and 10-pack quality-of-life features into real ES modules. The proven V252 probability generator remains the source of truth behind a tiny compatibility bridge, so this update does **not** rebalance pull rates.

### Pack architecture
- `src/packs/` — pack engine, generator contract, rates snapshot, session stats, results, costs and HUD.
- `src/animations/packs/` — rarity profiles, reveal controller, 10-pack controller and recap renderer.
- `public/runtime/pack-bridge.js` — tiny bridge into the existing generator/collection globals.
- `runtime/packs.js` remains loaded for compatibility while later releases continue extracting historical pack-specific patches.

### Reveal 2.0
- Card-specific reveal keys prevent stale-card presentation in the new layer.
- Rarity-specific reveal intensity from base/foil through chase/apex/God Pack.
- **Fast Reveal** skips the long cinematic while keeping hit feedback.
- **Reveal All** in 10-pack mode uses a two-tap safety guard and routes every remaining card exactly once.
- Current mobile performance mode automatically tones down extra blend effects.

### Session stats
- Packs opened, hit packs, SIR+ packs and God Packs.
- Cash spent, starter packs used, sealed credits used and generated value.
- Binder/Bulk additions and unique cards added this session.
- Persistent packs-since-SIR+, packs-since-God-Pack and hit-streak counters.
- Enhanced end-of-opening recap with best pull and rarity breakdown.

## Development
```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm run dev
```

## Validation
```bash
pnpm run test
pnpm run validate
```

## Production
GitHub Actions builds Vite `dist/` and deploys it to GitHub Pages. `pnpm run deploy:static` also creates a directly servable static build for diagnostics. `pnpm run serve:static` previews the built `dist/`; `pnpm run smoke:production` checks its local resources.

Existing save schema: **1**. V253 adds only optional state fields and does not reset or migrate existing player data.
