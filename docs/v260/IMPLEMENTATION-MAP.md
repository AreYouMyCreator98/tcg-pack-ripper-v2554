# V260 implementation map

Baseline: f24644d150799d7eb66c08a91eee074729859fc9. Backup reference: backup/pre-v260-f24644d. Development: v260-collector-overhaul. Main and live Pages must remain untouched. Audit inventory covers all 311 repository files, including classic runtime, modules, tests, SQL, assets, workflows and historical documents. Historical documentation is not evidence of current runtime authority.

| Current system / source of truth | New location | Reused code | Refactor required | Migration risk |
|---|---|---|---|---|
| Navigation: chrome.html, core.js navigation handlers | RIP / COLLECTION / HUB / PROFILE | Existing section IDs and renderers | One router and safe-area nav; universal settings gear | Avoid breaking hard-coded legacy navigation |
| Rip: core.js generator, pack-bridge.js, src/packs | RIP | Pull rates, set gates, audio, 1/10 packs, Fast Reveal, God Packs | Pack-specific recap, contextual inspector, chases; remove destructive discard | Exactly-once card routing |
| Binder: src/screens/binder, binder-bridge | Collection / Cards | Gallery paging, physical book, cosmetics, cache | Unified metadata filters and inspector | Card IDs, quantities and regular-ex Bulk routing |
| Bulk: src/screens/bulk, bulk-bridge | Collection / Bulk | Keep-one, sale preview, tub and library | Shared transaction validation, contracts | Never consume locked or escrowed copies |
| Master Sets: masterMapV57/masterProgressV58 in core.js | Collection / Master Sets | Ownership across Binder/Bulk/slabs/submissions/listings/escrow | Dedicated pages, reward receipts, Master Set+ | Existing claimed milestones and official/subset totals |
| Grading: gradingV44, conditionV161 in core/progression | Collection / Grading / Slabs | Queue, service costs, condition, light inspection, return animations | Grade from condition; labelled local population | Preserve old submitted and graded cards, existing outcomes |
| Sealed: progression.js sealedV161 | Collection / Sealed | Shelf, 3D inspection, credit redemption, shop | Navigation consolidation | Quantity, shelf reservations, set credits |
| Market: hub_command SQL / HubController; local marketV57 | Hub / Market and District | Server escrow, receipts, sale history; local NPC listings | Price bounds, single transaction entry points, paging | Local state is not equivalent to authoritative inventory |
| NPC trades, walk-ins, auctions, dealers, lots: core/progression | Hub / District | Existing negotiations and generation | Contracts, Collector Level gates, daily stock | Preserve accepted deal receipts and unlocks |
| P2P trades: hub_private rooms, hub_command | Hub / Trades | Server revision, offer escrow, both-ready gate | Give/receive values and shared inspector | Never transfer on unilateral confirmation |
| Battles / Ranked: hub_private SQL, HubController | Hub / Battles | Server packs, scores, rank, forfeit, request receipts | Rating explanation and season boundary; evaluate Stakes separately | Client-authored cash must not secure a wager |
| Friends/chat/messages/invites: social.js + SQL | Hub / Social | Auth, blocked users, presence and private threads | Consolidated subnavigation | Preserve privacy and subscriptions |
| Profile: profile studio, rank frames | Profile / Overview, Progress, Customise, Stats | Ownership-checked badges/frames and saved looks | Merge trophies into Progress, journal/dashboard | No invented ownership or public rank overrides |
| Achievements/Collector Road: core/progression | Profile / Progress | Existing award predicates, pagination, levels | Group categories, retain earned IDs | Do not delete historical achievements |
| History: state.history / Hub activity | Profile / Collector Journal | Actual recorded pull and transaction events | Significant events only; bounded history | Do not fabricate past events or discard old history |
| Settings: shared settings overlay | Universal gear | Audio/haptics, graphics, accessibility, account, import/export | Remove primary-nav entry | Focus, Safari scrolling, account switching |
| Jobs/Shop Rep: jobs, miniStats, jobCareer, shopV84 | Contracts + legacy statistics | Preserve old counters and ledger | Additive one-time migration, retained gates | No reset, repeated XP claims or reward loss |
| Day: gameClockV170; real-day quests/dailyV221 | Day display / featured set / contracts | Existing game-day anchor and daily claim logic | Shared rotation keys; server time when available | Local clock is not a secure economy source |
| Save: tcgRipperSave and cloud save_data.state | Existing persistence + additive collectorV260 | Bound-account snapshots, versioned cloud CAS | Idempotent migration and transaction receipts | Cloud pulls replace state; never retain stale object references |
| Artwork/PWA/platform: src/artwork, platform, sw.js | Shared infrastructure | Identity checks, IndexedDB low-res cache, lazy loading, safe areas | Precache new modules; bounded galleries and modal focus | No previous-card artwork; no API caching |

## Checkpoints
1. Audit, backup, unchanged baseline tests.
2. Navigation and safe-area layout with regression tests.
3–7. Shared inspector, Collection, Master Sets, contracts, grading; persistence tests.
8–12. Hub/Profile/day/economy consolidation, authority tests and staged SQL.
13–15. Performance, mobile simulation, obsolete UI cleanup, full release check and review preview.

## Publication boundary
No production SQL, production player mutations, main merge or live Pages publication is part of this implementation. An isolated preview build must be offered before release. Physical Android/Samsung Internet/Safari certification requires real devices.
