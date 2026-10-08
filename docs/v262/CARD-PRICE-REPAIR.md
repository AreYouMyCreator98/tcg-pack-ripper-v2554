# V262.7 card price repair

The reported Paldean Fates Charizard ex (`sv04.5-234`) had two saved grade-9.5 slabs with raw=0.10. The inspector displayed the legacy daily game multiplier applied to that placeholder, producing $0.11. Unlike the prior Binder inspector, the Universal Inspector did not hydrate pricing when opening a card.

The exact provider response inspected during diagnosis contained TCGplayer USD marketPrice=256.74, alongside Cardmarket EUR trend=242.20. These are observations, not hardcoded prices. USD quotes now come from positive finite TCGplayer price fields for the selected finish; EUR is not silently labeled USD. Missing provider prices do not overwrite existing valid raw/market values during hydration or artwork repair.

On opening the inspector, fetch/hydrate that card only, validate provider identity, then update price metadata for matching owned raw cards, slabs and grading submissions. Account changes, replaced save objects and transaction holds invalidate the response. Grades, certificates, quantities and cash are not changed. Price-dependent inspector actions wait for a valid quote, and stale dialogs cannot apply a reply from another card.

Display source raw USD price separately from the existing fluctuating in-game raw sell value and graded game estimate. The slab estimate is explicitly not a verified real-world graded-card market quote. Non-inspector legacy valuations are not all fetched in a background catalog sweep; a stored placeholder is repaired when that card is inspected or hydrated through existing pack flows. The existing grading multipliers are unchanged.
