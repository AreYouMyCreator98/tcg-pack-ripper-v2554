# V260 phone preview

This is an isolated review build, not the live GitHub Pages release. Online accounts, cloud-save writes, player trades and online battles are disabled in this preview. Card catalogs and artwork still use read-only network requests. The source branch retains online functionality; its migration is tested separately and is not applied to production.

## Open on your phone
1. Extract `v260-preview.zip` on a computer with Python 3.
2. Run `python serve.py` (or `python3 serve.py`) inside the extracted folder.
3. Connect your phone to the same Wi-Fi. Open `http://YOUR-COMPUTER-LAN-IP:8080` in the phone browser. Use the computer's Wi-Fi IP address, not localhost.
4. For HTTPS/PWA installation tests, upload the contents to a **separate preview hostname** on a static host. Do not replace the live GitHub Pages deployment.

The preview starts a new, separate local save. You may import a *copy* of an exported save through the settings gear to test migration. Keep the original export. Preview keys use `tcgPreviewV260_`; the production save key is unchanged. Export progress before moving between preview hosts because browser saves are origin-specific. Removing this folder does not remove the production save.

## Phone acceptance checklist
- Open RIP, COLLECTION, HUB and PROFILE. Confirm one stable bottom bar above the home indicator.
- Open/close settings from each destination; rotate the phone and return from the background.
- Open 1 pack and 10 packs, use Fast Reveal, inspect the recap and change sets.
- Pin up to three chases from a Master Set checklist or chase guide; reload and verify persistence.
- Search/filter Cards; use Gallery and Physical Binder; open Bulk and the physical tub.
- Inspect a card, favourite/lock it, move a copy, review a sale and cancel a sale.
- Review a Collector Contract, deliver duplicates and verify cash/XP/copies after reloading.
- Submit grading, open the required packs, reveal the slab and inspect local population.
- Check Master Set progress, reward claims, Sealed shelf, Profile tabs and Journal.
- Test sound after a tap, reduced motion, long press, scrolling and touch cancellation.

Physical-device verification is required for Chrome Android, Samsung Internet, iPhone/iPad Safari and standalone PWA behavior. Chromium viewport simulation is not physical-device or WebKit certification. A plain HTTP LAN preview cannot certify secure-context service-worker installation.

## Build again
On the review branch: `pnpm run release:check`, then `node scripts/make-v260-preview.mjs`. The build is written to `.temp/v260-preview/`. No deployment or database mutation occurs.
