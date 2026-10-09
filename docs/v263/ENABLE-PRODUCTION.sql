begin;
-- Execute only after successful authenticated/mobile QA. This does not install
-- schema, alter Stakes/Casual, reset ratings, or touch any player save.
do $$
declare completed integer;
begin
 if not exists(select 1 from hub_private.league_config where id and enabled) then
  raise exception 'Public Draft Duel must already be enabled';
 end if;
 if not exists(select 1 from cron.job where jobname='collector-league-ai-v263' and active and schedule='1 second') then
  raise exception 'AI scheduler is not active at the reviewed cadence';
 end if;
 if not exists(select 1 from hub_private.league_ai_config where id and worker_heartbeat>clock_timestamp()-interval '10 seconds') then
  raise exception 'AI worker heartbeat is stale';
 end if;
 select count(*) into completed
 from hub_private.league_ai_history h join hub_private.league_matches m on m.id=h.match_id
 where h.human_id in('a247f0f3-0a7b-44c4-ac19-6a2f8c03de91'::uuid,'cb6bc783-c1f4-4c14-b95a-98a7e61e1682'::uuid)
 and m.phase='result' and m.result->>'reason' in('knockouts','turn_limit') and m.ai_errors=0;
 if completed<20 then raise exception 'Only % full isolated QA AI matches recorded; require at least 20',completed;end if;
end $$;
update hub_private.league_ai_config
set human_only_ms=3000,ai_fallback_ms=7000,ai_ranked_fallback_enabled=true
where id=true;
select ai_ranked_fallback_enabled,human_only_ms,ai_fallback_ms,worker_heartbeat
from hub_private.league_ai_config where id=true;
commit;
