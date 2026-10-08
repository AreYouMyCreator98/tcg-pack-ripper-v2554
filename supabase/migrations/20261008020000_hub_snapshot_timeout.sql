-- REVIEW BEFORE APPLYING. Follow-up to 20261008010000_battle_live_sync.sql.
-- Transactional function replacements only: no player-data writes, deletes,
-- rating/cost changes, timeout increase, or Stakes enablement.
begin;
set local lock_timeout='3s';
do $patch$
declare original text; patched text;
begin
 original:=pg_get_functiondef('hub_private.snapshot_full(uuid)'::regprocedure);
 patched:=replace(original,
 '(select set_id,min(card->>''set'') as name,count(*) as cards from hub_private.catalog where enabled group by set_id having count(*)>=10 and hub_private.set_unlocked(u,set_id)) s)',
 '(with grouped as materialized (select set_id,min(card->>''set'') as name,count(*) as cards from hub_private.catalog where enabled group by set_id having count(*)>=10) select * from grouped where hub_private.set_unlocked(u,set_id)) s)');
 if original=patched then raise exception 'Set aggregation patch did not match; no changes applied'; end if;
 execute patched;

 original:=pg_get_functiondef('public.hub_command(text,jsonb,uuid)'::regprocedure);
 -- Read-only snapshots must not wait behind every marketplace/trade/battle
 -- writer. First-use profile creation still goes through the existing command.
 patched:=replace(original,'perform pg_advisory_xact_lock(256,1);',
 'if p_action=''snapshot'' then
   if p_payload ?| array[''rp_wager'',''wager_rp'',''stake'',''stake_amount''] then raise exception ''STAKES_NOT_ENABLED''; end if;
   if exists(select 1 from hub_private.profiles where user_id=u) then result:=hub_private.snapshot(u);
   else result:=hub_private.command(p_action,p_payload,p_request_id); end if;
   return result||jsonb_build_object(''collector_api'',260,''stakes_enabled'',false,''season'',jsonb_build_object(''id'',''legacy-continuity'',''reset_scheduled'',false));
 end if;
 perform pg_advisory_xact_lock(256,1);');
 if position('stakes_enabled' in original)>0 and original<>patched then
  execute patched;
 elsif position('select hub_private.command(p_action,p_payload,p_request_id);' in original)>0 then
  null; -- Known legacy invoker already has no public snapshot advisory lock.
 else raise exception 'Unknown Hub boundary; no changes applied'; end if;
end $patch$;

-- Historical room banners do not need to reopen their participants' large saves.
create function hub_private.public_profile_brief(u uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('user_id',p.user_id,'name',p.name,'rp',p.rp,'title',p.title,'style',p.style,'badges',p.badges,'show_record',p.show_record,'trackers',p.trackers,
 'stat_values',case when p.show_record then jsonb_build_object('wins',p.wins,'losses',p.losses,'ties',p.ties,'season_high',p.season_high,'streak',p.streak) else '{}'::jsonb end,
 'wins',case when p.show_record then p.wins end,'losses',case when p.show_record then p.losses end,'ties',case when p.show_record then p.ties end)
 from hub_private.profiles p where p.user_id=u;
$$;
revoke all on function hub_private.public_profile_brief(uuid) from public,anon,authenticated;
do $patch$
declare original text; patched text;
begin
 original:=pg_get_functiondef('hub_private.room_view(hub_private.rooms,uuid)'::regprocedure);
 patched:=replace(original,'hub_private.public_profile(r.host_id)-''avatar''','hub_private.public_profile_brief(r.host_id)');
 patched:=replace(patched,'hub_private.public_profile(r.guest_id)-''avatar''','hub_private.public_profile_brief(r.guest_id)');
 if original=patched then raise exception 'Room history patch did not match; no changes applied'; end if;
 execute patched;
end $patch$;

create or replace function hub_private.snapshot(u uuid) returns jsonb language plpgsql stable set search_path='' as $$
begin
 if current_setting('hub.battle_stream',true)='on' then
  return jsonb_build_object('version',256,'battle_stream',true,'battle_sync_version',2,'partial',true,'user_id',u,
   'server_time',clock_timestamp(),'save_version',(select save_version from public.user_saves where user_id=u),
   'profile',hub_private.public_profile_brief(u)||(select to_jsonb(p)-'muted_until' from hub_private.profiles p where p.user_id=u),
   'rooms',coalesce((select jsonb_agg(hub_private.room_view(r,u) order by r.created_at desc) from
     (select * from hub_private.rooms where kind='battle' and u in(host_id,guest_id)
      and (status in('waiting','ready','playing') or id=(select id from hub_private.rooms
       where kind='battle' and u in(host_id,guest_id) and status in('completed','cancelled','expired')
       order by created_at desc,id desc limit 1))) r),'[]'::jsonb));
 end if;
 return hub_private.snapshot_full(u)||jsonb_build_object('battle_stream',true,'battle_sync_version',2);
end $$;

-- A no-match queue tick must not wake the entire Hub. Signal only the real
-- waiting -> ready transition, retaining the existing serialized matcher.
do $patch$
declare original text; patched text;
begin
 original:=pg_get_functiondef('public.hub_battle_update(text,jsonb,uuid)'::regprocedure);
 patched:=replace(original,'result jsonb;','result jsonb; matched uuid;');
 patched:=replace(patched,'perform hub_private.match_waiting(u);','matched:=hub_private.match_waiting(u);');
 patched:=replace(patched,'where u in(host_id,guest_id) and ranked and status=''ready''','where id=matched and ranked and status=''ready''');
 if original=patched then raise exception 'Queue patch did not match; no changes applied'; end if;
 execute patched;
end $patch$;
commit;
