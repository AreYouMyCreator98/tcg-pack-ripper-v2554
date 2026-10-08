# V262 audit and implementation map

Main remains at the tested sealed release. Development branch: feat/v262-collector-league.

| Current system | Reuse | Extend / replace | Backend migration risk |
|---|---|---|---|
| HubController / hub_command | authentication, pending receipts, cloud economic hold | dedicated league transport; no full Hub snapshots per turn | avoid concurrent legacy rooms and save writes |
| hub_battle_update / hub_signals | signal-only Realtime; compact fetch; resume/coalescing pattern | private Draft Duel command/snapshot with separate version | old timeout/finish routines must not settle new matches |
| rooms / match_waiting | serialized queue and indexed participation pattern | additive league tables, RP window, short deadlines | no alterations to existing room statuses/data |
| make_pack_mode / battle_award_mode | existing server generation and exactly-once ownership/cost application | call only when both collectors ready | save rows locked in UUID order; never during turns |
| hub_private.profiles | authoritative RP, records, season_high, privacy, badges, title/style/trackers | additive league stats and competitive presentation | no RP reset; existing Rookie/Apex IDs retained |
| public_profile_brief | compact public identity | competitive banner without base64 photo | public trackers must respect show_record |
| Profile Studio | save-on-confirm, saved looks, 3 badge/tracker slots, cosmetics checks | shared competitive renderer and earned-frame aliases | never migrate/delete old saved looks |
| save schema 1 | all existing state and cloud optimistic versions | server league state stays outside save | no card/inventory migration |
| PGlite / Hub tests | role/auth harness, battle integrity tests | replay/stale/hidden-action/draft/timer/settlement tests | local tests are NOT authenticated production certification |

## Existing authority

Supabase owns multiplayer generation, awards, room state, marketplace/trades and Hub RP. Local single-player cash/inventory remain save-based. Current live legacy rating rules differ from the optional V260 boundary migration; V262 must define its own tested rating helper rather than assume that migration is installed. Stakes stays disabled.

Current read stream returns active/latest battle only and uses materialized set aggregation to avoid per-card unlock scans. Retain those patches. Existing read-only snapshots must not acquire global advisory locks. Realtime currently wakes clients through public.hub_signals; it is not the state authority. Client saves must be held across pack award and fetched afterward.

Profile names/photos: profileV227. Frames: profileFramesV228. Saved looks and preferences: profileStudioV257. Server banner metadata: hub_private.profiles (style/title/badges/trackers/show_record). Existing rank IDs are rookie, bronze, silver, gold, platinum, diamond, master, apex. Competitive presentation may label the legacy apex tier Grandmaster; do not delete the owned Apex frame or reset thresholds.

Catalogue card records generally retain identity, rarity and price but not printed HP/types. Battle stats are a separate versioned layer. Missing printed metadata must use explicitly derived game affinities/roles, never be represented as factual printed Pokémon stats.

## Release gates

1. Default feature flag OFF, isolated QA allowlist only after reviewed SQL is applied.
2. Show the additive SQL and exact changes before production execution. No migration will be auto-applied.
3. At least 10 complete matches between TWO authenticated isolated QA accounts, including reconnects, deadline/default actions and correct RP settlement.
4. No desync, statement timeout, duplicate award or RP replay. Measure compact payloads and mobile performance.
5. Full tests + release check + physical-device limitations disclosed.
6. No merge/publish to main until all user-required gates pass. Even green local simulations do not substitute for authenticated QA.

## V1 competitive model

One server-generated pack each, same randomly selected existing Ranked set. First three selected cards are active order, last two are reserves. One card fights at a time; swapping to another living squad slot consumes the action. Three KOs ends the match. After 20 turns, fewer KOs wins, then total remaining squad HP; exact ties give 0 RP. Twelve-second simultaneous turns; missing action defaults Defend. Three consecutive missed turns forfeits; two long-disconnected players settle an abandoned draw with no RP.

Card ID derives stable role/ability and modest stat variation. Available source HP/types are retained in match-only metadata; absent types are explicitly labelled **game affinity**. Rarity adds at most three power, never health or speed. Seven abilities: Blaze, Guard, Quick Strike, Heal, Piercing, Counter, Disrupt. Two uses/card and two-turn cooldown. Damage advantage +20%, reverse resistance −15%; Defend halves damage. RP uses 400-point expected score: win +12..28, loss −10..24 (floor zero), draw 0. Existing rank IDs/owned assets remain; competitive display calls Apex Grandmaster. No season reset.

## Client and identity extension

`src/league` has a separate explicit phase controller, coalesced reveal writer, receipt retry, stale-read rejection, Realtime wakeups and 1.5-second fallback. The existing Hub pauses background polling while the League view is open. Server deadlines use an offset from server_time, not client-authored deadlines. Collection writes remain held between Ready and authoritative pack sync; receipt/hold survive reload.

The shared banner renderer is used in Profile Studio, League queue/clash and public Hub profiles with an equipped competitive look. Existing title, three earned badges, privacy and saved looks remain in Profile Studio. A save-on-confirm competitive editor adds four themes (two rank-earned), earned rank frames and three tracker slots. Supported server-backed trackers: Ranked wins/losses/ties/streak/high RP, Draft wins/matches/streak, current RP. Unimplemented Tournament wins are not fabricated. Collection-value and grading trackers are deferred rather than adding collection scans to battle updates.

Banner art reuses approved smoke assets, original composition and existing rank frames. Profile photos fetch once per participant via a separate authenticated RPC, cached up to eight identities; no base64 photos in live snapshots. Public show_record suppresses record trackers/highest-rank stats. Existing selected avatar remains the source.
