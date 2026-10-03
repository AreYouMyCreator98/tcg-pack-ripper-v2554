# Bulk Tub+ upgrade

Build `v256-bulk-4`, 2026-10-03.

The Bulk Tub uses the Trade Hub's white pearlescent background, lavender accents
and opaque glass controls. The physical tub and card inspector share the same
palette. Bottom navigation remains visible on this page.

Card library is the default view. It includes name/number/set search, set and
rarity filters, duplicates-only filtering, name/copy-count/stack-value sorting,
24-card progressive pages, collection totals, selection of visible cards or
matching duplicates, and card inspection with the existing Binder transfer.
Selections persist across filters and reset when the signed-in account changes.

Sales require a preview and confirmation. Keep one of each is on by default and
retains one bulk copy of every selected card. Turning it off explicitly allows
selling last copies. The physical tub's former immediate whole-tub sale also
opens this preview. The confirmation checks the account, every quantity, each
unit price, cloud transaction barriers and the total before mutating anything.
Repeated confirmations cannot sell the same reviewed inventory twice. Existing
collection saves, Binder routing, master-set recalculation and prices are used.

Validation: 153 tests and static/production build smoke checks pass. New tests
cover filters, sorting, duplicate retention, atomic validation, repeated sales,
changed account/price/inventory, cloud holds, full-copy sales, escaping and paging.

An existing QA account was tested through the production preview UI: search,
combined filters, sorting, selection, Escape/cancel, confirmed spare sale,
inspection, move to Binder, reload and paging from 24 to 48 to all 71 card types.
Cloud verification confirmed exactly two Buizel copies sold for $0.20 and one
remaining copy moved to Binder with manual retention; all other bulk quantities
were unchanged. Layouts were checked at 390x844, 360x800 and 1280x1000, with no
horizontal overflow on either phone size and no browser errors in the completed
test session. Physical Samsung Internet and iPhone Safari were not available.

No database migration or player-save reset is required. Service-worker cache
version is `tcg-pack-ripper-0.256.0-6`.
