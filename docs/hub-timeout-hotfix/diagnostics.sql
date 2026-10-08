-- Read-only preflight. Does not execute game commands or change player data.
select n.nspname as schema,p.proname,p.prosecdef as security_definer,
 case when p.proname='snapshot_full' then position('grouped as materialized' in pg_get_functiondef(p.oid))>0 end as grouped_unlock_fix
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where (n.nspname='public' and p.proname in('hub_command','hub_battle_update'))
 or (n.nspname='hub_private' and p.proname in('snapshot','snapshot_full','room_view'));
select pg_get_functiondef('public.hub_command(text,jsonb,uuid)'::regprocedure);
select indexname,indexdef from pg_indexes where schemaname='hub_private'
 and tablename in('rooms','requests','catalog');
-- Run while an actual failed request is occurring to distinguish blocking from CPU.
select pid,state,wait_event_type,wait_event,now()-query_start as elapsed,
 pg_blocking_pids(pid) as blockers,left(query,240) as query_prefix
from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid()
 and state='active' and (query ilike '%hub_command%' or query ilike '%hub_battle_update%');
