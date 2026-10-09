begin;
-- Review separately after the V263 migration. Supabase pg_cron must support
-- second-based schedules. If this fails, leave AI disabled; human Ranked works.
create extension if not exists pg_cron;
select cron.schedule('collector-league-ai-v263','1 second','select hub_private.league_ai_worker();');
-- Named schedule is updated on reapplication. No public/QA enablement here.
commit;
