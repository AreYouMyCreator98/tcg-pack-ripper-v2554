# Baseline save schema and authority (before V260 mutations)

The live game stores a plain JSON object at localStorage `tcgRipperSave`. `APP_CONFIG.saveSchemaVersion=1` describes the optional envelope adapter, not a conversion of the live object. Cloud `public.user_saves.save_data` contains `{state,prefs,audio,selectedSetId,saved_at}` and a separate integer `save_version`. Cloud pulls replace the whole state object. Bound-account recovery, financial receipts and save-version checks must be preserved. Preferences/audio also use `tcgPrefsV160` and `tcgAudioV68`; artwork IndexedDB stores are caches only.

## Assets and progress
- `coins`: currency in dollars; `xp`, `packs`, `hits`: progression counters.
- `binder` and `bulkV64`: maps keyed by card identity; each value includes id/name/set/setId/number/rarity/finish/market/img/thumb/qty plus optional condition/history metadata. Existing records aggregate copies and do not distinguish physical-copy condition.
- `gradingV44`: submissions, graded slabs, openedForGrading, tierV56, achV56, mintPityV81. Submissions have uid, card identity, raw value, condition, startOpen, dueOpen, tier and history. Slabs retain grade/cert/revealedAt. Existing grade outcomes must not be recomputed.
- `sealedV161`: inventory, display/shelf and packCredits. Credits are used before cash during pack payment.
- `masterV57`: seen and claimed; totals also live in masterTotalsV66/masterTotalsV195. Completion measures current ownership, not only seen history. Hub escrow is owned and must count once.
- `marketV57`: local listings/history/sold; `marketV161`: day/pricing data. Server listings are separate private escrow rows.
- `tradeV154`, `collectorNetV161`: NPC trade completions and daily keys.
- `starterV199`, `setUnlocksV259`: onboarding packs and retained unlocks.
- `badges`, `achievements`, `chaseBadges`, `levelRewardsV197`, `mythicRewards`, `specialCollectionV198`, `specialStatsV198`: earned rewards and ownership.
- `binderOwned`, `binderTheme`, `profileV227`, `profileFramesV228`, `profileStudioV257`: cosmetics and saved looks. Existing ownership checks remain mandatory.
- `rankedV221`: cached RP/history/seasonHigh/record; authoritative online values come from Hub.
- `history`, `packStatsV253`, `polishV163`, `recentHitsV188`: historical/session/quest counters.
- `jobs`, `miniStats`, `jobCareer`, `earnV83`, `shopV84`, `trashed`: historical local jobs, reputation and discard counters; preserve these even after UI deprecation.
- `gameClockV170`, `dailyV221`: game clock and daily claims.
- `cloudV190`, `hubEscrowV256`, `hubTotalsV256`, `mpBattleReceiptsV220`, `economyV216` and audit/migration fields: reconciliation and compatibility metadata; never reset generically.

Unknown fields must round-trip unchanged. V260 additions belong under `collectorV260`, with an explicit version and one-time migration marker. Migration is additive, idempotent and rerun against the current state after account/cloud changes. No schema-envelope rewrite or destructive season reset.

## Authority map
| Action | Current authority | Security boundary |
|---|---|---|
| Ordinary packs, Binder/Bulk, grading, NPC purchases/sales, sealed, XP | Client runtime; saved to cloud | Local guards and cloud barriers help races, but a modified client can forge state |
| Hub listing create/buy/cancel | PostgreSQL hub_command | Authenticated user, locked save revisions, private escrow, receipts, atomic transfer |
| P2P trade | PostgreSQL hub_command | Reserved cards, same room revision, both confirmations, atomic transfer |
| Battle generation, score, forfeit, ranked RP | PostgreSQL hub_private | Hidden opponent packs; authoritative result and idempotent rank update |
| Profile public fields and badges | Hub + saved ownership validation | Private helper permissions; earned badge checks |
| Local clock/daily NPC offers | Client | Not suitable for secure cash escrow or server reward eligibility |
| Stakes | No current authoritative Stakes implementation | Never invent client escrow/payouts or treat client-uploaded cash as secured funds |

## Staged migration plan
1. Route local mutations through a validated, receipt-bearing transaction layer with account and cloud barriers; maintain compatibility with existing saves.
2. Harden existing server listing/trade boundaries and deny locked cards; additive SQL tested against PGlite and rehearsed on staging before deployment.
3. Introduce a server-owned ledger and inventory provenance, reconcile legacy assets without deleting them, prevent generic cloud saves from overwriting ledger balances.
4. Move pack purchase/generation, grading/sealed and major rewards behind the ledger. Client predictions reconcile to server receipts.
5. Only enable cash Stakes after both deposits use that protected ledger. Require fixed tier eligibility, atomic two-party reserve, authoritative result, exactly-once payout/refund and expiry/forfeit rules. Keep Ranked RP separate. No live deployment without review.

The V256 database fixture is a representative Hub bootstrap, not a complete empty production database. Production baseline includes earlier historical migrations not fully reproducible from this checkout. Physical device testing and authenticated two-account staging tests remain release gates.
