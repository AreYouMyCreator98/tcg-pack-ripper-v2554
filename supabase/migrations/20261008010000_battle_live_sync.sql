-- Additive battle transport. No pack generation, costs, awards or rating changes.
begin;
alter function hub_private.snapshot(uuid) rename to snapshot_full;
create function hub_private.snapshot(u uuid) returns jsonb language plpgsql stable set search_path='' as $$
begin
 if current_setting('hub.battle_stream',true)='on' then
  return jsonb_build_object('version',256,'battle_stream',true,'partial',true,'user_id',u,
   'server_time',clock_timestamp(),'save_version',(select save_version from public.user_saves where user_id=u),
   'profile',hub_private.public_profile(u),
   'rooms',coalesce((select jsonb_agg(hub_private.room_view(r,u)) from
     (select * from hub_private.rooms where u in(host_id,guest_id) order by created_at desc limit 20) r),'[]'::jsonb));
 end if;
 return hub_private.snapshot_full(u)||jsonb_build_object('battle_stream',true);
end $$;
revoke all on function hub_private.snapshot(uuid),hub_private.snapshot_full(uuid) from public,anon,authenticated;

do $patch$
declare original text; patched text;
begin
 original:=pg_get_functiondef('hub_private.room_view(hub_private.rooms,uuid)'::regprocedure);
 patched:=replace(original,'''opponent_cards'',case when r.status=''completed'' then case when r.host_id=u then r.guest_cards else r.host_cards end else ''[]''::jsonb end',
 '''opponent_cards'',case when r.status=''completed'' then case when r.host_id=u then r.guest_cards else r.host_cards end when r.status=''playing'' then coalesce((select jsonb_agg(c.value order by c.ordinality) from jsonb_array_elements(case when r.host_id=u then r.guest_cards else r.host_cards end) with ordinality c where c.ordinality<=case when r.host_id=u then r.guest_progress else r.host_progress end),''[]''::jsonb) else ''[]''::jsonb end');
 if original=patched then raise exception 'Opponent visibility patch did not match'; end if;
 execute patched;
 -- Reveal progress is a bounded, monotonic acknowledgement of already-awarded
 -- cards. Coalesce rapid taps instead of requiring ten sequential round trips.
 original:=pg_get_functiondef('hub_private.command(text,jsonb,uuid)'::regprocedure);
 patched:=replace(original,'if n>v+1 then raise exception ''REVEAL_IN_ORDER''; end if;',
 'if n>v+1 and current_setting(''hub.battle_stream'',true) is distinct from ''on'' then raise exception ''REVEAL_IN_ORDER''; end if;');
 if original=patched then raise exception 'Reveal progress patch did not match'; end if;
 execute patched;
end $patch$;

create function public.hub_battle_update(p_action text,p_payload jsonb default '{}',p_request_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null or not exists(select 1 from auth.users where id=u) then raise exception 'AUTH_REQUIRED'; end if;
 if p_action not in('snapshot','battle_reveal','queue_tick') then raise exception 'INVALID_ACTION'; end if;
 if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'INVALID_PAYLOAD'; end if;
 perform set_config('hub.battle_stream','on',true);
 if p_action='snapshot' then result:=hub_private.snapshot(u);
 elsif p_action='queue_tick' then
  -- Same matchmaking lock and eligibility as queue_join; no inventory/save sync.
  perform pg_advisory_xact_lock(256,1);
  update hub_private.profiles set last_seen=now() where user_id=u;
  update hub_private.rooms set expires_at=now()+interval '60 seconds' where host_id=u and ranked and status='waiting' and expires_at>now();
  perform hub_private.match_waiting(u);
  result:=hub_private.snapshot(u);
  if exists(select 1 from hub_private.rooms where u in(host_id,guest_id) and ranked and status='ready') then
   update public.hub_signals set revision=revision+1 where topic='hub';
  end if;
 else result:=hub_private.command(p_action,p_payload,p_request_id);
 end if;
 perform set_config('hub.battle_stream','off',true);
 return result;
end $$;
revoke all on function public.hub_battle_update(text,jsonb,uuid) from public,anon;
grant execute on function public.hub_battle_update(text,jsonb,uuid) to authenticated;
commit;
