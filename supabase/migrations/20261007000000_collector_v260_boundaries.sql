-- V260 additive Hub boundaries. Review and rehearse before applying to production.
-- No balances, inventory or RP are reset. Cash Stakes remains disabled until a
-- server-owned ledger prevents generic client saves from supplying wager funds.
begin;
create or replace function public.hub_command(p_action text,p_payload jsonb default '{}',p_request_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); s jsonb; k text; result jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'INVALID_PAYLOAD'; end if;
 perform pg_advisory_xact_lock(256,1);
 -- Let the original receipt checker recover completed actions even after their
 -- card has moved. It also rejects request IDs reused with different payloads.
 if not exists(select 1 from hub_private.requests where user_id=u and request_id=p_request_id) then
   if p_payload ?| array['rp_wager','wager_rp','stake','stake_amount'] or p_action in ('deposit_stake','settle_stake','stakes_create') then raise exception 'STAKES_NOT_ENABLED'; end if;
   if p_action='listing_create' then
     if hub_private.integer_value(p_payload->'price',10,100000000)>1000000 then raise exception 'PRICE_LIMIT'; end if;
     s:=hub_private.save_state(u);k:=p_payload->>'card_id';
     if coalesce(s#>>array['collectorV260','cards',k,'locked'],'false')='true' then raise exception 'CARD_LOCKED'; end if;
   elsif p_action='trade_offer' then
     s:=hub_private.save_state(u);
     if jsonb_typeof(p_payload->'cards')='array' then
       for k in select jsonb_array_elements_text(p_payload->'cards') loop
         if coalesce(s#>>array['collectorV260','cards',k,'locked'],'false')='true' then raise exception 'CARD_LOCKED'; end if;
       end loop;
     end if;
   end if;
 end if;
 result:=hub_private.command(p_action,p_payload,p_request_id);
 return result||jsonb_build_object('collector_api',260,'stakes_enabled',false,'season',jsonb_build_object('id','legacy-continuity','reset_scheduled',false));
end $$;
revoke all on function public.hub_command(text,jsonb,uuid) from public,anon;
grant execute on function public.hub_command(text,jsonb,uuid) to authenticated;
-- The private command must no longer be an alternative authenticated entry point.
revoke execute on function hub_private.command(text,jsonb,uuid) from authenticated;

create or replace function hub_private.rating_delta(player_rp integer,opponent_rp integer,result numeric) returns integer
language sql immutable set search_path='' as $$
 select case when result=0.5 then 0 when result=1 then greatest(12,least(28,round(40*(1-1/(1+power(10::numeric,(opponent_rp-player_rp)::numeric/400))))::integer))
 else -greatest(10,least(24,round(40/(1+power(10::numeric,(opponent_rp-player_rp)::numeric/400)))::integer)) end;
$$;
revoke all on function hub_private.rating_delta(integer,integer,numeric) from public,anon,authenticated;
create or replace function hub_private.finish_battle(rid uuid,winner uuid,why text) returns void language plpgsql set search_path='' as $$
declare r hub_private.rooms; p hub_private.profiles; d integer; newrp integer; hostrp integer; guestrp integer;
begin
 select * into r from hub_private.rooms where id=rid for update;
 if not found or r.status<>'playing' then return; end if;
 if winner is not null and winner not in(r.host_id,r.guest_id) then raise exception 'INVALID_WINNER'; end if;
 perform 1 from hub_private.profiles where user_id in(r.host_id,r.guest_id) order by user_id for update;
 select rp into hostrp from hub_private.profiles where user_id=r.host_id;
 select rp into guestrp from hub_private.profiles where user_id=r.guest_id;
 update hub_private.rooms set status='completed',winner_id=winner,reason=why,completed_at=now(),revision=revision+1,host_score=hub_private.score(host_cards),guest_score=hub_private.score(guest_cards) where id=rid;
 for p in select * from hub_private.profiles where user_id in(r.host_id,r.guest_id) order by user_id loop
   d:=0;
   if r.ranked and why<>'abandoned' then
     d:=hub_private.rating_delta(p.rp,case when p.user_id=r.host_id then guestrp else hostrp end,case when winner is null then 0.5 when winner=p.user_id then 1 else 0 end);
     newrp:=greatest(0,p.rp+d);d:=newrp-p.rp;
     update hub_private.profiles set rp=newrp,wins=wins+case when winner=p.user_id then 1 else 0 end,
       losses=losses+case when winner is not null and winner<>p.user_id then 1 else 0 end,
       ties=ties+case when winner is null then 1 else 0 end,
       streak=case when winner=p.user_id then streak+1 else 0 end,season_high=greatest(season_high,newrp) where user_id=p.user_id;
   end if;
   if p.user_id=r.host_id then update hub_private.rooms set host_delta=d where id=rid;
   else update hub_private.rooms set guest_delta=d where id=rid; end if;
   perform hub_private.log(p.user_id,'battle_result',jsonb_build_object('room',rid,'ranked',r.ranked,'delta',d,'result',case when winner is null then 'tie' when winner=p.user_id then 'win' else 'loss' end,'reason',why,'season','legacy-continuity'));
 end loop;
end $$;
commit;
