# Supplied smoke artwork — V261 follow-up

Replaces the hand-drawn decorative character SVG with assets from the user's
`pokemon_inspired_smoke_assets.zip`. The archive contained six PNG images and no
instruction files. Source names and SHA-256 hashes are recorded in `assets.json`.
No card artwork, pack artwork, account avatars, owned skins or save data changed.

## Placement

- Rip: spectral fox at the right of the pack, ghost at the lower left.
- Collection: faint silver orb behind the collection UI.
- Hub: smoke vortex along the page edge.
- Profile: ethereal fox behind the showcase panels.
- Grading: smoke vortex under a dark text-protecting gradient.
- Specials: gold smoke flourish in the hero's corner.

The old `collector-atmosphere.svg` is removed. Actual collectible art remains
unchanged. Background characters are decorative rather than set-specific claims.

## Asset preparation and safeguards

Convert the supplied PNGs to transparent WebP, quality 82, at a maximum 720px
edge. No artwork regeneration, recolouring, cropping or background replacement.
The six shipped assets total 662,010 bytes versus approximately 9.2 MB of source
PNGs. Paths are local and relative, suitable for GitHub Pages and the existing
media cache. Build/cache identity advances to `v261-silver-4` / `0.261.0-4`.

Static CSS only: no new JavaScript, listeners, animation loops or filters.
Layers ignore pointer input, remain behind the content and have bounded paint
areas. Rip art hides during opening/reveal/results. Additional screen art is
subtle; foreground panel surfaces retain the readability fixes. High-contrast
preferences and forced colours hide the decorative layers.

## Validation

- Full release check passed: 269 tests, zero failed/skipped, static smoke, build and 50-resource production smoke.
- Existing V261 browser interaction suite across seven viewport sizes.
- Existing all-page visual audit: 26 destinations/sheets, including Collection,
  Hub, Profile, Grading, Specials and settings.
- Readability regression: light, dark, Chromium automatic darkening and forced
  colours, including the corrected Set Info dialog.
- Visual review of phone Rip and Profile captures; bundled asset alpha retained.

These are Chromium simulations with isolated fixture saves, not physical Samsung
Internet or Safari certification. Main/production is unchanged by this branch.
