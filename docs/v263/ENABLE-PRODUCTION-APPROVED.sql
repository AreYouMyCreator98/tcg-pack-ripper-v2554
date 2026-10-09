begin;
-- 9 October 2026: user explicitly stopped additional AI tests after 14 fully
-- verified matches and requested deployment. This overrides only the 20-match
-- gate in ENABLE-PRODUCTION.sql; scheduler health and public League remain required.
update hub_private.league_ai_config
set human_only_ms = 3000,
    ai_fallback_ms = 7000,
    ai_ranked_fallback_enabled = true
where id = true
  and worker_heartbeat > clock_timestamp() - interval '10 seconds'
  and exists (
    select 1 from hub_private.league_config
    where id = true and enabled = true
  )
  and exists (
    select 1 from cron.job
    where jobname = 'collector-league-ai-v263'
      and active = true
      and schedule = '1 second'
  )
returning ai_ranked_fallback_enabled, ai_fallback_ms;
commit;
