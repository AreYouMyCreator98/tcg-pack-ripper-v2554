# Profile Studio

Build `v256-profile-5`, 2026-10-03.

The Profile page now uses the Trade Hub and Bulk Tub pearlescent palette with
opaque glass controls. Five sections replace the long stacked page: Overview,
Customise, Trophies, Journey and Stats. All original profile targets and features
remain: daily rewards and challenges, ranked ladder, milestones, Hall of Hits,
badges, achievement search/filter/sort/pinning, all 50 collector levels and reward
claims, set requirements and Master Sets, collection/career/session stats, rank
frames, account/cloud settings, audio, experience preferences and data backups.
Long collections are paged and secondary groups collapse independently.

Customise previews the actual shared multiplayer banner. It offers six finishes,
a title, the original name/photo editor, eight generated collector avatars, three
earned badge slots, three ranked tracker slots, record visibility, earned rank
frames and three saved looks. Loading a look is a preview until equipped. Looks
include banner/title/badges/trackers/visibility, not photos or names. Public changes
use the existing authenticated profile command. Stats and ownership stay under
existing authority. Local presets are account scoped, cloud holds block writes,
and account changes invalidate pending updates. No migration or save reset.

New-player initialisation now retains cosmetics even before the first pack,
without losing starter eligibility. Photo processing rechecks the save owner and
cloud hold after asynchronous compression. The service worker cache is version 8.

Validation: 162 automated tests pass, with static (55 resources) and production
(44 resources) smoke checks. Profile tests cover ownership, cloud holds, failed
commands, earned-only badge selection, authority-field exclusion, avatar validation,
new-player persistence, original render targets, pagination and draft refresh.

Manual browser checks used local new-player data and an existing QA account:
look editing/equipping/loading/saving, avatar persistence after reload, shared Ranked
banner updates, cloud sync/reload, frame removal/re-equip and all eight frame pages,
record visibility, achievement search/pinning/paging, level paging/current-level
navigation, settings and Escape. The QA account kept exactly the same currency,
Binder and bulk collection. No browser errors were recorded in the completed run.
Layouts checked at 360x800, 390x844 and 1280x1000; neither phone layout overflowed
horizontally. These are Chromium viewport checks, not physical iPhone Safari or
Samsung Internet certification.
