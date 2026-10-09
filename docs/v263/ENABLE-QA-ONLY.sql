begin;
-- Apply only after reviewing/installing the V263 migration and scheduler.
-- These are the two previously authorized isolated QA accounts; no real players.
update hub_private.league_ai_config
set qa_users=array['a247f0f3-0a7b-44c4-ac19-6a2f8c03de91'::uuid,'cb6bc783-c1f4-4c14-b95a-98a7e61e1682'::uuid]
where id=true;
-- This script does NOT enable public AI or change the separate V262 gate.
select ai_ranked_fallback_enabled,cardinality(qa_users) as qa_accounts,
 worker_heartbeat,clock_timestamp()-worker_heartbeat as worker_age
from hub_private.league_ai_config where id=true;
commit;
