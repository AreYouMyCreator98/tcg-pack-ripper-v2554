# Development workflow

## Run locally

```bash
npm install
npm run dev
```

## Before a release

```bash
npm run release:check
```

This regenerates the asset hash manifest, checks the runtime layout, runs save/structure tests, and performs a Vite production build.

## Architecture rule

New work goes into `src/`. Existing code in `public/runtime/` is the compatibility runtime inherited from V245 and should be extracted gradually, one system at a time. Do not add new giant patch blocks to the compatibility runtime unless fixing an urgent production issue.

## Save safety

The live player state remains legacy-format for 0.250.0. `src/state/` provides the migration framework but does not rewrite a player's save. Introduce the first real schema conversion only behind a tested migration and a recovery backup.
