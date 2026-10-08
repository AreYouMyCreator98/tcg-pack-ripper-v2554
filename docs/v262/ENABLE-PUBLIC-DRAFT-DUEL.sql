-- User-authorized public rollout. Apply in Supabase SQL Editor.
-- Existing QA allowlist, saves, rooms, RP and cosmetics are unchanged.
-- Stakes remains disabled. No schema changes.
begin;
update hub_private.league_config set enabled=true where id=true;
select enabled from hub_private.league_config where id=true;
commit;
