# V261 collector atmosphere polish

Focused visual follow-up on `v261-collector-polish`. Existing layout, state bindings,
set switching, transactions, save schema and gameplay are unchanged. Build identity
is `v261-silver-2`; the service-worker cache increments to `0.261.0-2`.

## Visual changes

- Local 3.6 KB SVG: original decorative Pikachu/Gengar outlines, painted smoke
  ribbons, four small champagne star points and faint Poké Ball geometry.
  This is a fixed iconic composition, not selected-set-specific artwork.
- Rip-only, non-interactive pseudo-element sits behind the existing content;
  edge masking suppresses central detail. Hidden outside IDLE, including results.
- Warm selected-set trim, pack rim/halo, active pack selector and navigation,
  Chase icon and quick-action inner highlights. No controls moved or resized.
- Global graphite/smoke background and warm panel reflection carry through
  Collection, Hub, Profile, grading, Bulk, settings and modal surfaces.
- Specials/Mythical/Prismatic panels receive a quiet warm/rarity accent. The old
  broad moving Specials sweep becomes a static corner gleam; the old selector
  white hotspot becomes a faint top reflection so labels remain readable.

## Performance and accessibility

No new JavaScript, listeners, DOM elements, animated filters, particle loops,
remote image requests or backdrop blurs. One cacheable SVG with gradients and
paths; no SVG filters. Static art respects reduced-motion without a fallback
animation; increased-contrast mode lowers its opacity further. `pointer-events:
none` prevents decorative art from taking taps. Existing safe-area/layout rules
and actual collectible art/cosmetics remain intact.

## Validation

- `pnpm run release:check`: 269 passed, zero failed/skipped; static smoke, build
  and production smoke passed. Initial check caught mismatched build IDs; the
  app config was corrected before the passing rerun.
- Final paint refinements: production build and 50-resource smoke passed again.
- Existing V261 functional browser script plus temporary geometry assertions:
  360×800, 390×844, 393×873, 412×915, 430×932, tablet and desktop passed.
  Compared header, hero, set panel, stage, pack, arrows, pack selector, quick
  actions and navigation rectangles with polish rules removed: identical.
  Decorative SVG decoded locally, with non-interactive pseudo-element verified.
- Existing V260 gameplay browser regression passed: single/ten packs, grading
  submit/return/slab, district transactions, navigation and settings.
- All-page screenshot audit passed; visually reviewed Rip and Specials captures.
- Existing large-collection Samsung-UA Chromium stress test passed: 2,500 starting
  cards, ten consecutive ten-packs, exactly 1,000 cards and $800 charged;
  cash/starter/sealed funding, reload and all 19 Special artworks checked.
  Ten-pack totals 635–1,630 ms. Largest observed task 662 ms (below the existing
  1-second guard, not the aspirational 50 ms target). Result DOM 545 throughout;
  listeners 1,063 initially then 1,028 for all remaining runs. These are cloud
  measurements with concurrent checks, not real-device performance guarantees.

## Reference limits

The layout remains unchanged as requested. This adds the reference's warm trim,
character presence and collector atmosphere using lightweight line-art rather
than reproducing its detailed painted character/smoke illustration. No per-set
character art or floating animation added. Browser checks use Chromium with
mobile viewports; real Samsung Internet, Android Chrome and Safari device
verification remains necessary. Backend endpoints were fixture-backed in these
UI checks; no new live-backend certification is claimed.

Production has not been updated by this polish pass.
