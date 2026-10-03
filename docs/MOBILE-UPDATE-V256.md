# Mobile navigation and matchmaking update

Build `v256-mobile-3`, 2026-10-03.

Bottom navigation accepts completed pointer/touch taps without depending on a
browser-generated compatibility click. Background collection saves no longer
make navigation inert; economic controls retain their transaction protection.

Active matches and readiness controls precede setup panels and identity banners.
Other Hub tabs show an Open battle notice. Returning from phone suspension
refreshes the room and renews the queue. Valid snapshots display before a slow
collection pull completes.

Ranked queues reconsider waiting rivals as the RP range widens, expire stale
entries on rejoin, and allow five minutes for readiness. Simultaneous ranked
Ready confirmations no longer invalidate one another: immutable ranked terms
retain their revision until play begins. Trade/private-room change guards remain.

Entry and readiness show the existing pack cost: starter packs, then matching
set credits, then $8 in-game cash per pack. Players without resources cannot
enter an unaffordable ranked match. Ranked still uses the first five sets.

Validation: 145 automated tests pass, along with static and production smoke
checks. Two existing QA accounts connected through authenticated Realtime,
matched through the phone-sized UI, and completed ranked battles. A focused
live test verified simultaneous Ready requests from the same room revision,
one starter debit and ten cards per player, matching results and no active QA
rooms afterward. Phone layouts checked at 390x844 and 360x800; visible bottom
targets were 54px high with no horizontal page overflow.

Supabase migrations `20261003115512_mobile_matchmaking.sql` and
`20261003120858_ranked_ready_race.sql` were applied as remote versions
`20261003120606` and `20261003121028`. New helpers cannot be called by anonymous
or authenticated API roles. No player saves were reset.

Physical Samsung Internet and iPhone Safari are not available in this test
environment. Real-device confirmation remains necessary; Chromium viewport
checks and simulated touch-event regression tests do not certify those engines.
