# Migration report

## From
- One ~1.8 MB `index.html`
- 131 inline `<style>` blocks
- 75 `<script>` blocks
- 27 rank/Special images embedded as base64 JavaScript strings

## To
- ~1.6 KB `index.html`
- UI split into screen/component HTML fragments
- CSS split into 6 ordered files
- Runtime split into 8 named classic-script chunks (compatibility-safe)
- 8 ranked frames + 19 Special cards stored as normal WebP assets
- Browser-native ES-module app shell
- Critical vs deferred runtime loading
- PWA manifest + service worker
- iOS/Android/in-app browser performance detection
- lazy image decode/load policy
- Web Animations API screen transitions
- Web Worker foundation for collection calculations
- Vite dev/build config
- Capacitor Android/iOS-ready config
- GitHub Actions Pages workflow

## Compatibility
No deliberate changes were made to the persisted `state` schema, localStorage save keys, Supabase account table/RPC usage, pack odds, economy, collection ownership, grading, or multiplayer rules.
