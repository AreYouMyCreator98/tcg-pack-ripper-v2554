# Cinematic collector loader

Review branch: `feat/cinematic-loader`. Build: `v261-cinematic-loader-1`.

## Presentation

The static HTML renders branding above a three-pack fan, a metallic ellipse and a compact progress capsule. Crown Zenith (`swsh12.5`), Paldean Fates (`sv04.5`) and Lost Origin (`swsh11`) use the existing real pack WebPs. The supplied smoke-vortex, smoke-ghost and smoke-gold WebPs supply the atmosphere. Six assets total 370,364 bytes (362 KiB); no generated or placeholder packaging. Branding remains text with a small crown mark.

Motion uses slow transform/opacity smoke drift, pack float, staggered foil sweeps, four restrained sparkle points, pointer parallax and a 360ms exit. No canvas, animated blur, autoplay audio, device-motion permission or passive haptics. Pointer handling is frame-coalesced and removed on exit/failure. Failed presentation images are hidden; remaining real artwork and branding remain available.

## Startup contract

Progress reflects existing actual boot milestones, not elapsed-time estimates or random percentages. Regressing/late stage values cannot move the bar backwards; ARIA progress matches the displayed percentage. Friendly stage messages replace runtime filenames. Nothing waits for the cinematic entrance to finish. Under-one-second startup and reduced motion use a 120ms exit. There is no minimum intro duration.

Existing bounded first-frame/image/optional-runtime waits and the 28-second actionable boot watchdog remain. Failure presents a keyboard-accessible retry button without exposing debug text. Saves are untouched. The Supabase library now defers execution so HTML presentation can be parsed first; normal boot and navigation tests passed.

Existing `tcgPrefsV160` preferences are read without writes: reduced motion selects static/low presentation; reduced cinematics selects medium (fewer smoke layers); disabled pack tilt disables parallax. OS reduced motion is also respected. No additional saved preference or save migration is introduced.

The app root stays hidden during loading; the opaque top-level layer shields underlying UI until its exit. Offline status uses the browser's real connectivity flag. The six assets and loader CSS are included in both static and production service-worker shell manifests. Cache version advances to `0.261.0-9`; no card catalogue images were added to precache.

## Verification

- Full release check: 290 tests passed, zero failures/skips; build and production smoke (59 resources) passed.
- Loader browser check: 360×800, 390×844, 393×873, 412×915, 430×932, 768×1024, 1440×900 and 844×390. Pack art decoded, composition fit, no UI bleed, monotonic progress, offline label, failed image continuation and teardown passed.
- Normal exit measured 369–397ms in initial Chromium simulation, including frame scheduling.
- Reduced-motion CSS and accessible failure/retry passed. Warm/reduced exit is tested separately with a 300ms bound.
- Existing Rip interaction/navigation suite passed seven phone/tablet/desktop viewports, including avatar persistence/reload, set selection, arrows, quick actions and 1/10 selector.
- Actual local service-worker offline fetches succeeded for loader CSS and all six WebPs after installation.
- Screenshot inspected at 390×844; fixed legacy text-colour interference and confined glints to pack bounds.

Reproduce browser checks with `V260_TEST_URL=<local static deployment URL> node scripts/verify-cinematic-loader.cjs` using installed Playwright/Chromium. Use the static deployment to avoid Vite live-reload interference while holding boot for screenshots. The regular test suite covers loader contracts; this explicit browser check adds rendered/layout assertions.

## Limitations

These are Chromium simulations, not physical Samsung/Android or iPhone/iPad certification. WebKit/Safari execution, real-device frame rates, aggressive browser night-mode transformations and an installed-app update from the previous production worker still require device testing. Offline checks establish cached loader resources, not a new guarantee that every network-dependent gameplay feature works offline. Progress is staged startup completion, not exact downloaded bytes or a claimed successful cloud synchronization. Existing 512px pack assets are retained rather than fabricated/upscaled artwork.

No main merge or production deployment is included in this change.
