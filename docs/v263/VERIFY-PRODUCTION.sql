-- Read-only administrative verification. Run after activation and again after
-- at least two seconds to verify the heartbeat advances without a player client.
select ai_ranked_fallback_enabled,human_only_ms,ai_fallback_ms,
 worker_heartbeat,clock_timestamp()-worker_heartbeat as worker_age
from hub_private.league_ai_config where id=true;
select jobname,schedule,active from cron.job where jobname='collector-league-ai-v263';
select d.status,d.start_time,d.end_time,d.return_message
from cron.job_run_details d join cron.job j on j.jobid=d.jobid
where j.jobname='collector-league-ai-v263' order by d.start_time desc limit 10;
select count(*) as active_ai_matches,coalesce(sum(ai_errors),0) as worker_errors
from hub_private.league_matches where ai_profile_id is not null and phase not in('result','cancelled');
-- Stakes must additionally report false through the authenticated hub_command
-- snapshot; a private configuration query alone is not a live RPC verification.
