-- V262 isolated QA only. Run AFTER reviewing/applying the V262 migration.
-- These UUIDs identify the two existing isolated QA accounts; no credentials.
begin;
update hub_private.league_config set enabled=false,qa_users=array['a247f0f3-0a7b-44c4-ac19-6a2f8c03de91','cb6bc783-c1f4-4c14-b95a-98a7e61e1682']::uuid[] where id=true;
commit;
