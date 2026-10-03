# Backend baseline

Supabase project: `ddeuwrnfmdgvizkrjhii`

The production database currently includes these applied migrations (captured 2026-10-02):

- 20261001041136 create_user_saves
- 20261002061630 v218_multiplayer_market_trades_battles
- 20261002062044 v218_multiplayer_security_hardening
- 20261002064555 v219_market_atomic_reconcile
- 20261002080054 v220_fast_rooms_battle_progress
- 20261002091933 v224_cancel_multiplayer_room
- 20261002092246 v224_cancel_room_guard
- 20261002092901 v225_allow_ongoing_battle_cancel
- 20261002094643 v226_matchmaking_private_rooms
- 20261002101217 v229_multiplayer_rank_frames
- 20261002113512 v236_account_authoritative_saves
- 20261002121126 enable_pg_net_for_auth_recovery_v238

Production Edge Function `card-art-v239` is deployed and should be treated as part of the release. Its deployment metadata is stored under `supabase/functions/card-art-v239/`.

Never put Supabase service-role keys or other secrets in this repository. The browser may only contain publishable/anon credentials.
