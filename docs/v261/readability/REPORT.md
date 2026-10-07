# V261 browser colour/readability fix

Build: `v261-silver-3`, cache `tcg-pack-ripper-0.261.0-3`.

The supplied Samsung screenshots exposed a native Set Info dialog outside the
normal screen/theme scope. Legacy heading colours and purple button styling
survived on its dark surface. Browser page-darkening then altered portions of
this mixed theme independently.

Changes:
- Include `.silver-info` in shared heading, text, button and form theme rules.
- Give Set Info an opaque dark surface, explicit bright text and neutral buttons.
- Declare `color-scheme: only dark` and early HTML colour-scheme metadata. This
  retains the game's intended dark theme under either light or dark OS/browser
  preference and opts out of automatic recolouring in supporting browsers.
- Make native controls consistent, including Hub inputs that previously declared
  a light scheme. Preserve accessibility forced-colour support; no global
  `forced-color-adjust: none` or text recolouring via JavaScript.
- Give the tear arrow and Prismatic Vault key badge explicit colour pairs rather
  than relying on pale gradients. No gameplay or save changes.

Validation:
- `pnpm run release:check`: 269 passed, zero failures; production smoke passed.
- Final additional paint fixes rebuilt successfully; production smoke passed
  again (50 resources).
- New `scripts/verify-v261-readability.cjs`: Set Info's 15 text elements have
  contrast >= 10.08:1 in light preference, dark preference and Chromium's CDP
  auto-darkening mode. Forced-colour mode is 21:1. Modal close and four primary
  destinations work in all four modes.
- Existing all-page audit visited 26 screens/overlays in both light and dark
  preferences. Final dark-mode scan found no visible dark-on-dark leaf text.
  This heuristic is a spot audit, not an exhaustive WCAG certification; gradient
  backgrounds and artwork are not reducible to computed backgroundColor alone.
- Existing V261 interaction suite checks seven mobile/tablet/desktop sizes,
  set arrows/unlocks, quick actions, avatar persistence and 1/10 selection.

Reproduce locally: build, serve `dist`, set `V260_TEST_URL` to the local server
and run `node scripts/verify-v261-readability.cjs` using Playwright and Chromium.
Network services use fixtures and test saves are isolated.

Limits: Chromium automatic-darkening is not Samsung Internet's proprietary
implementation. Physical Samsung/Chrome Android, Safari and installed-app checks
are still needed. Third-party extensions or browser settings that override site
colours cannot be universally prevented by site CSS. Background content is
intentionally dimmed while a modal is open; the modal itself must remain readable.

This branch does not publish changes to production automatically.
