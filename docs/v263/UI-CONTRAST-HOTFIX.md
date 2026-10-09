# V263.1 UI contrast and alignment hotfix

Fixes legacy pale Ranked summary, selected-rank and leaderboard surfaces against the dark collector text. Shared notices, offer panels, message containers, reveal backgrounds and tracker tiles use matching theme surfaces. Progress bars use the champagne accent in Chromium and Firefox.

Competitive portrait frames use proportional centered bounds in League and Profile instead of fixed pixel sizes. Tracker labels/values align vertically; the Clash Ready button and VS label are centered. Narrow embedded previews use smaller names, and the leaderboard wraps long names without pushing RP columns off screen.

The app retains its dark-silver design under both browser light and dark preferences. No player data, battle logic, timing, economy, rank or entitlement changes.

## Validation

- 359 automated tests passed; release:check passed. After the final narrow-preview CSS adjustment, production build/smoke and visual checks passed again.
- 10 Chromium viewport/color-mode cases: 360×800, 390×844, 412×915, 430×932 and 1024×900, each light/dark.
- No document overflow. Frame and portrait centers agree within one pixel; Clash Ready button centered within one pixel.
- Tested rank title, selected rank, leaderboard, notice and tracker text have at least 4.5:1 contrast; minimum measured 8.23:1.
- Frame artwork inspected in an element screenshot. Browser fixtures are not physical Samsung Internet or iPhone Safari certification.
- Build 0.263.1 / v263-ui-contrast-1; service-worker cache bumped to deliver updated styles.
