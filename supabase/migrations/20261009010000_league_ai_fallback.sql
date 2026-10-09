begin;
-- V263: additive Ranked-only AI participants. Existing matches and saves are untouched.
-- Public enablement requires 1,000 simulations and 20 authenticated live QA matches.
create table if not exists hub_private.league_ai_config (
 id boolean primary key default true check(id),
 ai_ranked_fallback_enabled boolean not null default false,
 qa_users uuid[] not null default '{}',
 human_only_ms integer not null default 3000 check(human_only_ms between 1000 and 10000),
 ai_fallback_ms integer not null default 7000 check(ai_fallback_ms between 6000 and 30000),
 repeat_opponent_window integer not null default 5 check(repeat_opponent_window between 0 and 20),
 rp_modifiers jsonb not null default '{"bronze":1,"silver":1,"gold":1,"platinum":0.98,"diamond":0.95,"master":0.90,"apex":0.90}',
 worker_heartbeat timestamptz, check(ai_fallback_ms>human_only_ms)
);
insert into hub_private.league_ai_config(id) values(true) on conflict do nothing;
create table if not exists hub_private.league_ai_profiles (
 id uuid primary key, display_name text not null unique, avatar text not null default '',
 banner jsonb not null default '{"theme":"dark-silver","trackers":["rp","draft_wins","draft_matches"]}',
 rp integer not null check(rp>=0), highest_rp integer not null check(highest_rp>=rp),
 strategy text not null check(strategy in('balanced','aggressive','control')),
 wins integer not null default 0, losses integer not null default 0, ties integer not null default 0,
 enabled boolean not null default true,last_match_at timestamptz
);
-- Stable identities, no auth.users rows, saves, wallets or simulated social accounts.
insert into hub_private.league_ai_profiles(id,display_name,rp,highest_rp,strategy)
select ('a1263000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,name,rp,rp,strategy
from (values
 (1,'BattleAsh',25,'balanced'),(2,'RareRoute',90,'aggressive'),(3,'HoloMason',160,'control'),
 (4,'PackTheory',250,'balanced'),(5,'SilverBinder',330,'control'),(6,'ChaseClub',420,'aggressive'),
 (7,'VaultAce',480,'balanced'),(8,'DraftKing',560,'aggressive'),(9,'CardNomad',640,'control'),
 (10,'FoilHunter',730,'balanced'),(11,'SleeveTheory',820,'control'),(12,'QuietHolo',920,'aggressive'),
 (13,'PrismRoute',1040,'balanced'),(14,'SilverTempo',1150,'control'),(15,'RareRead',1300,'aggressive'),
 (16,'VaultTempo',1450,'balanced'),(17,'CounterFoil',1620,'control'),(18,'DraftAtlas',1820,'aggressive'),
 (19,'HoloSummit',1950,'balanced'),(20,'PrismCrest',2150,'control')
) roster(n,name,rp,strategy) on conflict do nothing;
alter table hub_private.league_matches add column if not exists ai_profile_id uuid references hub_private.league_ai_profiles(id);
alter table hub_private.league_matches add column if not exists ai_due_at timestamptz;
alter table hub_private.league_matches add column if not exists ai_errors integer not null default 0;
-- Keep the human auth FK; AI occupies a separate FK instead of a fake login account.
alter table hub_private.league_matches alter column guest_id drop not null;
do $$begin
 if not exists(select 1 from pg_constraint where conname='league_guest_kind' and conrelid='hub_private.league_matches'::regclass) then
 alter table hub_private.league_matches add constraint league_guest_kind check((guest_id is null)<>(ai_profile_id is null));end if;
end $$;
create table if not exists hub_private.league_ai_history (
 match_id uuid primary key references hub_private.league_matches(id),
 ai_id uuid not null references hub_private.league_ai_profiles(id),
 human_id uuid not null references auth.users(id), winner uuid,
 human_delta integer not null,ai_delta integer not null,finished_at timestamptz not null default now()
);
-- New worker/repeat predicates, restricted to the new AI workload.
create index if not exists league_ai_due on hub_private.league_matches(ai_due_at) where ai_profile_id is not null and phase not in('result','cancelled');
-- Identities may participate in independent concurrent matches; no roster-capacity queue stall.
create index if not exists league_ai_recent on hub_private.league_ai_history(human_id,finished_at desc);
create or replace function hub_private.league_ai_rank(r integer) returns text language sql immutable set search_path='' as $$
 select case when r>=1900 then 'apex' when r>=1400 then 'master' when r>=1000 then 'diamond' when r>=700 then 'platinum' when r>=450 then 'gold' when r>=250 then 'silver' else 'bronze' end;
$$;
create or replace function hub_private.league_ai_skill(r integer) returns numeric language sql immutable set search_path='' as $$
 select case when r>=1900 then .96 when r>=1400 then .92 when r>=1000 then .86 when r>=700 then .75 when r>=450 then .60 when r>=250 then .42 else .24 end;
$$;
create or replace function hub_private.league_ai_delay(r integer) returns interval language sql volatile set search_path='' as $$
 select make_interval(secs=>case when r>=1900 then .7+random()*1.3 when r>=1400 then .7+random()*1.3 when r>=1000 then .8+random()*1.4 when r>=700 then .9+random()*1.5 when r>=450 then 1.1+random()*1.6 when r>=250 then 1.3+random()*1.7 else 1.5+random()*2 end);
$$;
create or replace function hub_private.league_search_window(age_seconds numeric) returns integer language sql stable set search_path='' as $$
 select least(800,case when age_seconds*1000<c.human_only_ms then 100 else 250+floor(greatest(0,age_seconds*1000-c.human_only_ms)/3000)::integer*100 end) from hub_private.league_ai_config c where id;
$$;

create or replace function hub_private.league_identity(u uuid) returns jsonb language sql stable set search_path='' as $$
 select hub_private.public_profile_brief(u)||jsonb_build_object('banner',league_banner,'highest',case when show_record then greatest(season_high,rp,coalesce((league_stats->>'highest')::integer,0)) else null end,
 'league_stats',case when show_record then league_stats else '{}'::jsonb end) from hub_private.profiles where user_id=u
 union all select jsonb_build_object('user_id',id,'name',display_name,'ai_collector',true,'avatar',avatar,'rp',rp,'highest',highest_rp,'title','AI Collector','show_record',true,'badges','[]'::jsonb,'banner',banner||jsonb_build_object('frame',hub_private.league_ai_rank(highest_rp)),'league_stats',jsonb_build_object('wins',wins,'losses',losses,'ties',ties),'wins',wins,'losses',losses,'ties',ties)
 from hub_private.league_ai_profiles where id=u;
$$;
create or replace function hub_private.league_signal(a uuid,b uuid default null) returns void language sql set search_path='' as $$
 insert into public.league_signals(user_id,revision) select id,1 from (values(a),(b)) x(id) where id is not null and exists(select 1 from auth.users where auth.users.id=x.id) on conflict(user_id) do update set revision=league_signals.revision+1;
$$;
create or replace function hub_private.league_snapshot(u uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare m hub_private.league_matches;own_a boolean;out_data jsonb;their jsonb;mycards jsonb;oppcards jsonb;
begin
 out_data:=jsonb_build_object('version',262,'enabled',hub_private.league_allowed(u),'user_id',u,'server_time',clock_timestamp(),'profile',(select hub_private.league_identity(u)||jsonb_build_object('league_banner',p.league_banner,'league_stats',p.league_stats,'wins',p.wins,'losses',p.losses,'ties',p.ties,'streak',p.streak,'season_high',p.season_high)||jsonb_build_object('highest',greatest(p.rp,p.season_high,coalesce((p.league_stats->>'highest')::integer,0))) from hub_private.profiles p where p.user_id=u),'save_version',(select save_version from public.user_saves where user_id=u));
 if not hub_private.league_allowed(u) then return out_data;end if;
 select * into m from hub_private.league_matches where id=(select match_id from hub_private.league_members where user_id=u);
 if not found then select * into m from ((select * from hub_private.league_matches where host_id=u order by created_at desc limit 1) union all (select * from hub_private.league_matches where guest_id=u order by created_at desc limit 1)) recent order by created_at desc limit 1;end if;
 out_data:=out_data||jsonb_build_object('queue',(select jsonb_build_object('joined_at',joined_at,'expires_at',expires_at) from hub_private.league_queue where user_id=u and expires_at>now()));
 if m.id is null then return out_data;end if;
 m.guest_id:=coalesce(m.guest_id,m.ai_profile_id);own_a:=m.host_id=u;mycards:=case when own_a then m.cards_a else m.cards_b end;oppcards:=case when own_a then m.cards_b else m.cards_a end;
 select coalesce(jsonb_agg(value order by ordinality),'[]') into their from jsonb_array_elements(oppcards) with ordinality where ordinality<=case when own_a then m.reveal_b else m.reveal_a end;
 return out_data||jsonb_build_object('match',jsonb_build_object('id',m.id,'phase',m.phase,'rules',m.rules-'cost_a'-'cost_b'-'ai_skill','pack_cost',m.rules->case when own_a then 'cost_a' else 'cost_b' end,'revision',m.revision,'turn',m.turn,'deadline',m.deadline,'host_id',m.host_id,'guest_id',m.guest_id,
 'host_profile',hub_private.league_identity(m.host_id),'guest_profile',hub_private.league_identity(m.guest_id),
 'my_ready',case when own_a then m.ready_a else m.ready_b end,'opponent_ready',case when own_a then m.ready_b else m.ready_a end,
 'cards',case when m.phase in('opening','draft') then mycards else '[]'::jsonb end,'opponent_cards',case when m.phase='opening' then their else '[]'::jsonb end,
 'my_progress',case when own_a then m.reveal_a else m.reveal_b end,'opponent_progress',case when own_a then m.reveal_b else m.reveal_a end,
 'my_draft',case when own_a then m.draft_a else m.draft_b end,'opponent_drafted',case when own_a then m.draft_b is not null else m.draft_a is not null end,
 'combat',case when m.phase in('battle','result') then m.combat else null end,
 'action_locked',case when own_a then m.action_a is not null else m.action_b is not null end,'opponent_locked',case when own_a then m.action_b is not null else m.action_a is not null end,'last_turn',m.last_turn,'result',m.result));
end $$;
create or replace function hub_private.league_resolve(mid uuid) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;state jsonb;side text;other text;actor jsonb;enemy jsonb;act jsonb;enemy_act jsonb;ix integer;jx integer;dmg integer;raw integer;hp integer;ability text;order_a integer;order_b integer;first_side text;events jsonb:='[]';a_hp integer;b_hp integer;winner uuid;target integer;ready_to_resolve boolean;
begin
 select * into m from hub_private.league_matches where id=mid for update;m.guest_id:=coalesce(m.guest_id,m.ai_profile_id);if m.phase<>'battle' then return;end if;
 if (m.action_a is null or m.action_b is null) and now()<m.deadline then return;end if;
 if now()>m.deadline+interval '60 seconds' and m.action_a is null and m.action_b is null then perform hub_private.league_settle(mid,null,'abandoned');return;end if;
 m.idle_a:=case when m.action_a is null then m.idle_a+1 else 0 end;m.idle_b:=case when m.action_b is null then m.idle_b+1 else 0 end;
 if m.idle_a>=3 or m.idle_b>=3 then perform hub_private.league_settle(mid,case when m.idle_a>=3 and m.idle_b>=3 then null when m.idle_a>=3 then m.guest_id else m.host_id end,'idle');return;end if;
 m.action_a:=coalesce(m.action_a,'{"kind":"defend"}');m.action_b:=coalesce(m.action_b,'{"kind":"defend"}');state:=m.combat;
 order_a:=(state#>>array['a','squad',state#>>'{a,active}','stats','speed'])::integer-case when (state#>>array['a','squad',state#>>'{a,active}','slowed'])::boolean then 8 else 0 end;
 order_b:=(state#>>array['b','squad',state#>>'{b,active}','stats','speed'])::integer-case when (state#>>array['b','squad',state#>>'{b,active}','slowed'])::boolean then 8 else 0 end;
 if m.action_a->>'kind'='ability' and state#>>array['a','squad',state#>>'{a,active}','stats','ability']='quick_strike' then order_a:=order_a+100;end if;
 if m.action_b->>'kind'='ability' and state#>>array['b','squad',state#>>'{b,active}','stats','ability']='quick_strike' then order_b:=order_b+100;end if;
 foreach side in array array['a','b'] loop
  act:=case when side='a' then m.action_a else m.action_b end;other:=case when side='a' then 'b' else 'a' end;
  for ix in 0..4 loop
   actor:=state#>array[side,'squad',ix::text];actor:=actor||jsonb_build_object('previous_guard',actor->'guarded','guarded',false,'slowed',false,'cooldown',greatest(0,(actor->>'cooldown')::integer-1));state:=jsonb_set(state,array[side,'squad',ix::text],actor);
  end loop;
  if act->>'kind'='swap' then
   state:=jsonb_set(state,array[side,'active'],act->'target');state:=jsonb_set(state,array[side,'metrics','swaps'],to_jsonb((state#>>array[side,'metrics','swaps'])::integer+1));
  end if;
  ix:=(state#>>array[side,'active'])::integer;actor:=state#>array[side,'squad',ix::text];ability:=actor#>>'{stats,ability}';
  if act->>'kind'='defend' then actor:=actor||'{"guarded":true}';end if;
  if act->>'kind'='ability' then
   actor:=actor||jsonb_build_object('uses',(actor->>'uses')::integer-1,'cooldown',2);
   if ability='guard' then actor:=actor||'{"guarded":true}';
   elsif ability='heal' then hp:=least((actor#>>'{stats,max_hp}')::integer,(actor->>'hp')::integer+24);state:=jsonb_set(state,array[side,'metrics','ability'],to_jsonb((state#>>array[side,'metrics','ability'])::integer+hp-(actor->>'hp')::integer));actor:=actor||jsonb_build_object('hp',hp);end if;
  end if;
  state:=jsonb_set(state,array[side,'squad',ix::text],actor);
 end loop;
 -- Apply control after both sides' status decay, independent of player order.
 foreach side in array array['a','b'] loop
  act:=case when side='a' then m.action_a else m.action_b end;other:=case when side='a' then 'b' else 'a' end;
  if act->>'kind'='ability' and state#>>array[side,'squad',state#>>array[side,'active'],'stats','ability']='disrupt' then state:=jsonb_set(state,array[other,'squad',state#>>array[other,'active'],'slowed'],'true');end if;
 end loop;
 first_side:=case when order_a>order_b or (order_a=order_b and m.turn%2=1) then 'a' else 'b' end;
 foreach side in array array[first_side,case when first_side='a' then 'b' else 'a' end] loop
  other:=case when side='a' then 'b' else 'a' end;act:=case when side='a' then m.action_a else m.action_b end;enemy_act:=case when side='a' then m.action_b else m.action_a end;
  ix:=(state#>>array[side,'active'])::integer;jx:=(state#>>array[other,'active'])::integer;actor:=state#>array[side,'squad',ix::text];enemy:=state#>array[other,'squad',jx::text];ability:=actor#>>'{stats,ability}';
  if (actor->>'hp')::integer<=0 or (enemy->>'hp')::integer<=0 then continue;end if;
  if act->>'kind'='attack' or (act->>'kind'='ability' and ability in('blaze','quick_strike','piercing','counter')) then
   raw:=greatest(4,round((actor#>>'{stats,power}')::integer-(enemy#>>'{stats,defense}')::integer*case when act->>'kind'='ability' and ability='piercing' then .3 else .7 end)::integer);
   if act->>'kind'='ability' then raw:=raw+case when ability='blaze' and (actor->>'hp')::integer*2<=(actor#>>'{stats,max_hp}')::integer then 12 when ability='counter' and (actor->>'previous_guard')::boolean then 14 else 4 end;end if;
   raw:=round(raw*hub_private.league_affinity(actor#>>'{stats,type}',enemy#>>'{stats,type}'))::integer;
   dmg:=case when (enemy->>'guarded')::boolean then greatest(1,round(raw*case when enemy_act->>'kind'='ability' then .35 else .5 end)::integer) else raw end;
   state:=jsonb_set(state,array[other,'metrics','blocked'],to_jsonb((state#>>array[other,'metrics','blocked'])::integer+raw-dmg));
   dmg:=least(dmg,(enemy->>'hp')::integer);hp:=(enemy->>'hp')::integer-dmg;enemy:=enemy||jsonb_build_object('hp',hp);state:=jsonb_set(state,array[other,'squad',jx::text],enemy);
   state:=jsonb_set(state,array[side,'metrics','damage'],to_jsonb((state#>>array[side,'metrics','damage'])::integer+dmg));
   if hub_private.league_affinity(actor#>>'{stats,type}',enemy#>>'{stats,type}')>1 then state:=jsonb_set(state,array[side,'metrics','advantage'],to_jsonb((state#>>array[side,'metrics','advantage'])::integer+1));end if;
   if act->>'kind'='ability' then state:=jsonb_set(state,array[side,'metrics','ability'],to_jsonb((state#>>array[side,'metrics','ability'])::integer+dmg));end if;
   events:=events||jsonb_build_array(jsonb_build_object('side',side,'damage',dmg,'ko',hp=0,'type_multiplier',hub_private.league_affinity(actor#>>'{stats,type}',enemy#>>'{stats,type}')));
   if hp=0 then state:=jsonb_set(state,array[other,'kos'],to_jsonb((state#>>array[other,'kos'])::integer+1));end if;
  end if;
 end loop;
 foreach side in array array['a','b'] loop
  if (state#>>array[side,'squad',state#>>array[side,'active'],'hp'])::integer<=0 then
   select (ordinality-1)::integer into target from jsonb_array_elements(state#>array[side,'squad']) with ordinality where (value->>'hp')::integer>0 order by ordinality limit 1;
   if target is not null then state:=jsonb_set(state,array[side,'active'],to_jsonb(target));end if;
  end if;
 end loop;
 update hub_private.league_matches set combat=state,last_turn=jsonb_build_object('turn',m.turn,'a',m.action_a,'b',m.action_b,'events',events),turn=turn+1,revision=revision+1,action_a=null,action_b=null,idle_a=m.idle_a,idle_b=m.idle_b,deadline=now()+interval '12 seconds' where id=mid;
 if (state#>>'{a,kos}')::integer>=3 or (state#>>'{b,kos}')::integer>=3 then winner:=case when (state#>>'{a,kos}')::integer>=3 then m.guest_id else m.host_id end;perform hub_private.league_settle(mid,winner,'knockouts');
 elsif m.turn>=20 then
  select sum((value->>'hp')::integer) into a_hp from jsonb_array_elements(state#>'{a,squad}');select sum((value->>'hp')::integer) into b_hp from jsonb_array_elements(state#>'{b,squad}');
  -- KO count is primary; remaining squad health breaks the turn-cap tie.
  a_hp:=(3-(state#>>'{a,kos}')::integer)*1000+a_hp;b_hp:=(3-(state#>>'{b,kos}')::integer)*1000+b_hp;
  perform hub_private.league_settle(mid,case when a_hp=b_hp then null when a_hp>b_hp then m.host_id else m.guest_id end,'turn_limit');
 end if;
 perform hub_private.league_signal(m.host_id,m.guest_id);
end $$;
create or replace function hub_private.league_settle(mid uuid,winner uuid,reason text) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;p hub_private.profiles;ar integer;br integer;d integer;nr integer;s jsonb;settlement jsonb:='{}';
begin
 select * into m from hub_private.league_matches where id=mid for update;if m.ai_profile_id is not null then perform hub_private.league_ai_settle(mid,winner,reason);return;end if;if m.phase in('result','cancelled') then return;end if;
 if winner is not null and winner not in(m.host_id,m.guest_id) then raise exception 'INVALID_WINNER';end if;
 perform 1 from hub_private.profiles where user_id in(m.host_id,m.guest_id) order by user_id for update;
 select rp into ar from hub_private.profiles where user_id=m.host_id;select rp into br from hub_private.profiles where user_id=m.guest_id;
 for p in select * from hub_private.profiles where user_id in(m.host_id,m.guest_id) order by user_id loop
  d:=case when reason='abandoned' then 0 else hub_private.league_rating(p.rp,case when p.user_id=m.host_id then br else ar end,case when winner is null then .5 when winner=p.user_id then 1 else 0 end) end;nr:=greatest(0,p.rp+d);d:=nr-p.rp;
  s:=jsonb_build_object('wins',coalesce((p.league_stats->>'wins')::integer,0)+case when winner=p.user_id then 1 else 0 end,'losses',coalesce((p.league_stats->>'losses')::integer,0)+case when winner is not null and winner<>p.user_id then 1 else 0 end,'ties',coalesce((p.league_stats->>'ties')::integer,0)+case when winner is null then 1 else 0 end,'streak',case when winner=p.user_id then coalesce((p.league_stats->>'streak')::integer,0)+1 else 0 end,'highest',greatest(nr,p.season_high,coalesce((p.league_stats->>'highest')::integer,0)));
  update hub_private.profiles set rp=nr,season_high=greatest(season_high,nr),league_stats=s,wins=wins+case when winner=p.user_id then 1 else 0 end,losses=losses+case when winner is not null and winner<>p.user_id then 1 else 0 end,ties=ties+case when winner is null then 1 else 0 end,streak=case when winner=p.user_id then streak+1 else 0 end where user_id=p.user_id;
  settlement:=settlement||jsonb_build_object(p.user_id::text,jsonb_build_object('before',p.rp,'delta',d,'after',nr));
  perform hub_private.log(p.user_id,'draft_duel_result',jsonb_build_object('match',m.id,'winner',winner,'delta',d,'reason',reason));
 end loop;
 update hub_private.league_matches set phase='result',finished_at=now(),result=settlement||jsonb_build_object('winner',winner,'reason',reason,'pack_values',jsonb_build_object(m.host_id::text,(select coalesce(sum((c->>'market')::numeric),0) from jsonb_array_elements(m.cards_a) c),m.guest_id::text,(select coalesce(sum((c->>'market')::numeric),0) from jsonb_array_elements(m.cards_b) c))),revision=revision+1,action_a=null,action_b=null where id=mid;
 delete from hub_private.league_members where match_id=mid;
 perform hub_private.league_signal(m.host_id,m.guest_id);
end $$;
create or replace function hub_private.league_command_core(p_action text,p_payload jsonb default '{}',p_request_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();m hub_private.league_matches;q hub_private.league_queue;op hub_private.league_queue;receipt hub_private.league_requests;mid uuid;sid text;own_a boolean;n integer;ix integer;act jsonb;mine jsonb;cards jsonb;cost integer;profile hub_private.profiles;frame text;theme text;tracks jsonb;
begin
 if u is null or not exists(select 1 from auth.users where id=u) then raise exception 'AUTH_REQUIRED';end if;
 if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>4096 then raise exception 'INVALID_PAYLOAD';end if;
 if p_action='snapshot' then return hub_private.league_snapshot(u);end if;
 if not hub_private.league_allowed(u) then raise exception 'DRAFT_DUEL_DISABLED';end if;
 if p_action not in('queue_join','queue_tick','queue_cancel','ready','reveal','draft_confirm','turn_submit','tick','cancel','banner') then raise exception 'INVALID_ACTION';end if;
 if p_request_id is null then raise exception 'REQUEST_REQUIRED';end if;
 perform pg_advisory_xact_lock(262,hashtext(u::text));
 select * into receipt from hub_private.league_requests where user_id=u and request_id=p_request_id;
 if found then if receipt.action<>p_action or receipt.payload<>p_payload then raise exception 'REQUEST_REUSED';end if;return hub_private.league_snapshot(u);end if;
 if (select count(*) from hub_private.league_requests where user_id=u and created_at>now()-interval '60 seconds')>=600 then raise exception 'RATE_LIMIT';end if;
 if p_action in('queue_join','queue_tick','queue_cancel','ready') then perform pg_advisory_xact_lock(256,1);end if;
 insert into hub_private.profiles(user_id) values(u) on conflict do nothing;
 if p_action='banner' then
  select * into profile from hub_private.profiles where user_id=u for update;
  theme:=coalesce(p_payload->>'theme','dark-silver');frame:=coalesce(p_payload->>'frame','bronze');tracks:=coalesce(p_payload->'trackers',profile.trackers);
  n:=greatest(profile.rp,profile.season_high,coalesce((profile.league_stats->>'highest')::integer,0));
  if theme not in('dark-silver','default-collector','gold-champion','smoky-legendary') or (theme='gold-champion' and n<450) or (theme='smoky-legendary' and n<1000) then raise exception 'BANNER_NOT_EARNED';end if;
  cost:=case frame when 'rookie' then 0 when 'bronze' then 0 when 'silver' then 250 when 'gold' then 450 when 'platinum' then 700 when 'diamond' then 1000 when 'master' then 1400 when 'apex' then 1900 else 2147483647 end;
  if cost>n then raise exception 'FRAME_NOT_EARNED';end if;
  if jsonb_typeof(tracks) is distinct from 'array' or jsonb_array_length(tracks)>3 or (select count(distinct value) from jsonb_array_elements(tracks))<>jsonb_array_length(tracks) or exists(select 1 from jsonb_array_elements_text(tracks) x where x not in('wins','losses','ties','season_high','streak','draft_wins','draft_matches','draft_streak','rp')) then raise exception 'INVALID_TRACKERS';end if;
  update hub_private.profiles set league_banner=jsonb_build_object('theme',theme,'frame',frame,'trackers',tracks,'art',case when theme='smoky-legendary' then 'smoke-ghost' else 'smoke-gold' end) where user_id=u;
 elsif p_action in('queue_join','queue_tick','queue_cancel') then
  delete from hub_private.league_queue where expires_at<=now();
  if p_action='queue_cancel' then delete from hub_private.league_queue where user_id=u;
  elsif not exists(select 1 from hub_private.league_members where user_id=u) then
   if exists(select 1 from hub_private.rooms where u in(host_id,guest_id) and status in('waiting','ready','playing') and expires_at>now()) then raise exception 'ACTIVE_ROOM';end if;
   if p_action='queue_join' then
    if not exists(select 1 from public.user_saves where user_id=u) then raise exception 'SAVE_REQUIRED';end if;
    insert into hub_private.league_queue(user_id,rp) select u,rp from hub_private.profiles where user_id=u on conflict(user_id) do update set expires_at=now()+interval '60 seconds';
   end if;
   update hub_private.league_queue set expires_at=now()+interval '60 seconds' where user_id=u;
   select * into q from hub_private.league_queue where user_id=u;
   if found then
    select * into op from hub_private.league_queue other where other.user_id<>u and other.expires_at>now() and hub_private.league_allowed(other.user_id) and not hub_private.blocked(u,other.user_id)
     and abs(other.rp-q.rp)<=hub_private.league_search_window(extract(epoch from(now()-least(q.joined_at,other.joined_at)))) order by joined_at limit 1 for update;
    if found then
     select id into sid from hub_private.expansions e where id in('sv04.5','swsh12.5','swsh4.5','sv08','sv03') and (select count(*) from hub_private.catalog where set_id=e.id and enabled)>=10 order by random() limit 1;
     if sid is null then raise exception 'CATALOG_UNAVAILABLE';end if;
     insert into hub_private.league_matches(host_id,guest_id,rules) values(op.user_id,u,jsonb_build_object('mode','draft_duel','set_id',sid,'pack_count',1,'draft_version',1,'battle_version',1,'budget',100,'budget_policy','max-base-cheapest-five','rating_mode','server-elo-v1','season','legacy-continuity','cost_a',hub_private.battle_cost(op.user_id,sid,1),'cost_b',hub_private.battle_cost(u,sid,1))) returning id into mid;
     insert into hub_private.league_members(user_id,match_id) values(u,mid),(op.user_id,mid);
     delete from hub_private.league_queue where user_id in(u,op.user_id);perform hub_private.league_signal(u,op.user_id);
    end if;
   end if;
  end if;
 else
  mid:=(p_payload->>'match_id')::uuid;
  select * into m from hub_private.league_matches where id=mid and u in(host_id,guest_id) for update;
  if not found then raise exception 'MATCH_NOT_FOUND';end if;m.guest_id:=coalesce(m.guest_id,m.ai_profile_id);own_a:=m.host_id=u;
  if p_action='cancel' then
   if m.phase='clash' then update hub_private.league_matches set phase='cancelled',finished_at=now(),revision=revision+1 where id=mid;delete from hub_private.league_members where match_id=mid;
   elsif m.phase not in('result','cancelled') then perform hub_private.league_settle(mid,case when own_a then m.guest_id else m.host_id end,'forfeit');end if;
  elsif p_action='ready' then
   if m.phase<>'clash' or m.deadline<=now() then raise exception 'PHASE_CHANGED';end if;
   if hub_private.integer_value(p_payload->'revision',0,2147483647)<>m.revision then raise exception 'STALE_REVISION';end if;
   if m.ai_profile_id is not null then perform hub_private.league_ai_ready(mid);else
   update hub_private.league_matches set ready_a=ready_a or own_a,ready_b=ready_b or not own_a where id=mid returning * into m;
   if m.ready_a and m.ready_b then
    perform 1 from public.user_saves where user_id in(m.host_id,m.guest_id) order by user_id for update;
    sid:=m.rules->>'set_id';m.cards_a:=hub_private.make_pack(sid,1);m.cards_b:=hub_private.make_pack(sid,1);
    -- Both charges/awards roll back together on insufficient funds or invalid pool.
    perform hub_private.league_auto_draft(m.cards_a);perform hub_private.league_auto_draft(m.cards_b);
    perform hub_private.battle_award_mode(m.host_id,m.cards_a,sid,1,true);perform hub_private.battle_award_mode(m.guest_id,m.cards_b,sid,1,true);
    m.cards_a:=hub_private.league_enrich(m.cards_a);m.cards_b:=hub_private.league_enrich(m.cards_b);
    update hub_private.league_matches set cards_a=m.cards_a,cards_b=m.cards_b,phase='opening',revision=revision+1,deadline=now()+interval '90 seconds' where id=mid;
   end if;
   end if;
  elsif p_action='reveal' then
   if m.phase<>'opening' then raise exception 'PHASE_CHANGED';end if;n:=hub_private.integer_value(p_payload->'progress',0,10);
   update hub_private.league_matches set reveal_a=case when own_a then greatest(reveal_a,n) else reveal_a end,reveal_b=case when not own_a then greatest(reveal_b,n) else reveal_b end where id=mid returning * into m;
   if m.reveal_a=10 and m.reveal_b=10 then update hub_private.league_matches set phase='draft',revision=revision+1,deadline=now()+interval '45 seconds' where id=mid;end if;
  elsif p_action='draft_confirm' then
   if m.phase<>'draft' or m.deadline<=now() then raise exception 'PHASE_CHANGED';end if;
   if hub_private.integer_value(p_payload->'revision',0,2147483647)<>m.revision then raise exception 'STALE_REVISION';end if;
   if (own_a and m.draft_a is not null) or (not own_a and m.draft_b is not null) then raise exception 'DRAFT_LOCKED';end if;
   mine:=hub_private.league_draft(case when own_a then m.cards_a else m.cards_b end,p_payload->'indices');
   update hub_private.league_matches set draft_a=case when own_a then p_payload->'indices' else draft_a end,draft_b=case when not own_a then p_payload->'indices' else draft_b end where id=mid returning * into m;
   if m.draft_a is not null and m.draft_b is not null then update hub_private.league_matches set combat=jsonb_build_object('a',hub_private.league_draft(m.cards_a,m.draft_a),'b',hub_private.league_draft(m.cards_b,m.draft_b)),phase='battle',revision=revision+1,deadline=now()+interval '12 seconds' where id=mid;end if;
  elsif p_action='turn_submit' then
   if m.phase<>'battle' or m.deadline<=now() then raise exception 'PHASE_CHANGED';end if;
   if hub_private.integer_value(p_payload->'revision',0,2147483647)<>m.revision or hub_private.integer_value(p_payload->'turn',1,20)<>m.turn then raise exception 'STALE_REVISION';end if;
   if (own_a and m.action_a is not null) or (not own_a and m.action_b is not null) then raise exception 'ACTION_LOCKED';end if;
   act:=p_payload->'action';if jsonb_typeof(act) is distinct from 'object' or act->>'kind' not in('attack','defend','ability','swap') or act->>'kind' is null then raise exception 'INVALID_ACTION';end if;
   mine:=m.combat->case when own_a then 'a' else 'b' end;ix:=(mine->>'active')::integer;
   if act->>'kind'='ability' and ((mine#>>array['squad',ix::text,'uses'])::integer<=0 or (mine#>>array['squad',ix::text,'cooldown'])::integer>0) then raise exception 'ABILITY_UNAVAILABLE';end if;
   if act->>'kind'='swap' then n:=hub_private.integer_value(act->'target',0,4);if n=ix or (mine#>>array['squad',n::text,'hp'])::integer<=0 then raise exception 'INVALID_SWAP';end if;act:=jsonb_build_object('kind','swap','target',n);else act:=jsonb_build_object('kind',act->>'kind');end if;
   update hub_private.league_matches set action_a=case when own_a then act else action_a end,action_b=case when not own_a then act else action_b end where id=mid;perform hub_private.league_resolve(mid);
  elsif p_action='tick' and m.deadline<=now() then
   if m.phase<>'clash' and m.phase not in('result','cancelled') and m.deadline<now()-interval '60 seconds' then perform hub_private.league_settle(mid,null,'abandoned');
   elsif m.phase='clash' then update hub_private.league_matches set phase='cancelled',revision=revision+1,finished_at=now() where id=mid;delete from hub_private.league_members where match_id=mid;
   elsif m.phase='opening' then update hub_private.league_matches set phase='draft',reveal_a=10,reveal_b=10,revision=revision+1,deadline=now()+interval '45 seconds' where id=mid;
   elsif m.phase='draft' then update hub_private.league_matches set combat=jsonb_build_object('a',case when m.draft_a is null then hub_private.league_auto_draft(m.cards_a) else hub_private.league_draft(m.cards_a,m.draft_a) end,'b',case when m.draft_b is null then hub_private.league_auto_draft(m.cards_b) else hub_private.league_draft(m.cards_b,m.draft_b) end),phase='battle',revision=revision+1,deadline=now()+interval '12 seconds' where id=mid;
   elsif m.phase='battle' then perform hub_private.league_resolve(mid);end if;
  end if;
  perform hub_private.league_signal(m.host_id,m.guest_id);
 end if;
 insert into hub_private.league_requests(user_id,request_id,action,payload) values(u,p_request_id,p_action,p_payload);
 -- Revision/phase/slot locks prevent replay even after old receipts expire.
 delete from hub_private.league_requests where user_id=u and request_id in(select request_id from hub_private.league_requests where user_id=u order by created_at desc,request_id offset 1000);
 return hub_private.league_snapshot(u);
end $$;
create or replace function public.league_identity_art(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null or not hub_private.league_allowed(u) then raise exception 'AUTH_REQUIRED';end if;
 if p_user_id<>u and not exists(select 1 from hub_private.league_matches where (host_id=u and coalesce(guest_id,ai_profile_id)=p_user_id) or (host_id=p_user_id and guest_id=u)) then raise exception 'PROFILE_UNAVAILABLE';end if;
 if exists(select 1 from hub_private.league_ai_profiles where id=p_user_id) then return hub_private.league_identity(p_user_id);end if;
 return jsonb_build_object('user_id',p_user_id,'avatar',hub_private.public_profile(p_user_id)->'avatar');
end $$;
-- Pure legal draft selection: at most C(10,5)=252 squads, stats derived once/card.
create or replace function hub_private.league_ai_draft(cards jsonb,skill numeric) returns jsonb language sql volatile set search_path='' as $$
 with stats as materialized (
 select (ordinality-1)::int ix,hub_private.league_stats(value) s from jsonb_array_elements(cards) with ordinality
 ), budget as materialized (select greatest(100,coalesce(sum(cost),0)::int) cap from (select (s->>'cost')::int cost from stats order by cost limit 5) cheapest), candidates as materialized (
 select array[a.ix,b.ix,c.ix,d.ix,e.ix] indices,
 (select sum((s->>'power')::numeric*1.4+(s->>'defense')::numeric*.65+(s->>'speed')::numeric*.35+(s->>'max_hp')::numeric*.23)
   +count(distinct s->>'type')*9*skill+count(distinct s->>'role')*6*skill+count(distinct s->>'ability')*3*skill+case when bool_or(s->>'ability'='heal') then 6*skill else 0 end+sum((s->>'power')::numeric/(s->>'cost')::numeric)*3*skill from stats where ix=any(array[a.ix,b.ix,c.ix,d.ix,e.ix])) score
 from stats a join stats b on b.ix>a.ix join stats c on c.ix>b.ix join stats d on d.ix>c.ix join stats e on e.ix>d.ix
 where (a.s->>'cost')::int+(b.s->>'cost')::int+(c.s->>'cost')::int+(d.s->>'cost')::int+(e.s->>'cost')::int<=(select cap from budget)
 ), selected as (select indices from candidates order by score desc,indices offset floor(random()*greatest(1,(select count(*) from candidates)*(1-least(1,greatest(0,skill)))*.65)) limit 1)
 select jsonb_agg(ix order by (s->>'power')::numeric+(s->>'speed')::numeric*.3+(s->>'max_hp')::numeric*.08 desc,ix)
 from stats,selected where ix=any(indices);
$$;
-- Allowlist only. Decision function receives this object, NEVER a match row.
create or replace function hub_private.league_ai_observation(combat jsonb,side text,turn_number integer,last_turn jsonb) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('own',combat->side,'opponent',combat->case when side='a' then 'b' else 'a' end,'turn',turn_number,'previous',last_turn);
$$;
create or replace function hub_private.league_ai_action(observation jsonb,skill numeric,strategy text) returns jsonb language plpgsql volatile set search_path='' as $$
declare own jsonb:=observation->'own';opp jsonb:=observation->'opponent';a jsonb;enemy jsonb;b jsonb;st jsonb;damage numeric;incoming numeric;score numeric;best numeric;choice jsonb;ability text;idx integer;noise numeric:=greatest(0,1-skill)*18;
begin
 a:=own->'squad'->(own->>'active')::int;enemy:=opp->'squad'->(opp->>'active')::int;st:=a->'stats';ability:=st->>'ability';
 damage:=greatest(4,(st->>'power')::numeric-(enemy#>>'{stats,defense}')::numeric*.7)*hub_private.league_affinity(st->>'type',enemy#>>'{stats,type}');
 incoming:=greatest(4,(enemy#>>'{stats,power}')::numeric-(st->>'defense')::numeric*.7)*hub_private.league_affinity(enemy#>>'{stats,type}',st->>'type');
 best:=damage+case when damage>=(enemy->>'hp')::numeric then 18 else 0 end+random()*noise;choice:='{"kind":"attack"}';
 score:=incoming*.5+case when ability='counter' and (a->>'uses')::int>0 and (a->>'cooldown')::int<=1 and not (a->>'guarded')::boolean then 12 else 0 end+case when strategy='control' then 2 else 0 end+random()*noise;
 raise debug 'League AI candidate score=%',score;
 if score>best then best:=score;choice:='{"kind":"defend"}';end if;
 if (a->>'uses')::int>0 and (a->>'cooldown')::int=0 then
  score:=case ability
   when 'heal' then least(24,(st->>'max_hp')::numeric-(a->>'hp')::numeric)*1.15
   when 'guard' then incoming*.65
   when 'disrupt' then case when (enemy#>>'{stats,speed}')::int>(st->>'speed')::int and (enemy->>'hp')::numeric<damage*2 then 20 else 5 end
   when 'piercing' then damage+(enemy#>>'{stats,defense}')::numeric*.4+4
   when 'blaze' then damage+case when (a->>'hp')::numeric*2<=(st->>'max_hp')::numeric then 12 else 4 end
   when 'counter' then damage+case when (a->>'guarded')::boolean then 14 else 4 end
   when 'quick_strike' then damage+4+case when (a->>'hp')::numeric<=incoming then 12 else 0 end else 0 end;
  score:=score-3*skill+random()*noise;
  if ability in('blaze','piercing','quick_strike','counter') and score>=(enemy->>'hp')::numeric then score:=score+18;end if;
  raise debug 'League AI candidate score=%',score;
 if score>best then best:=score;choice:='{"kind":"ability"}';end if;
 end if;
 for idx in 0..4 loop
  b:=own->'squad'->idx;
  if idx=(own->>'active')::int or (b->>'hp')::int<=0 then continue;end if;
  score:=(greatest(4,(b#>>'{stats,power}')::numeric-(enemy#>>'{stats,defense}')::numeric*.7)*hub_private.league_affinity(b#>>'{stats,type}',enemy#>>'{stats,type}')-damage)*2*skill
   +case when (a->>'hp')::numeric<=incoming and (b->>'hp')::numeric>incoming*2 then 22*skill else 0 end
   +case when hub_private.league_affinity(enemy#>>'{stats,type}',b#>>'{stats,type}')<1 then 8*skill else 0 end-8+random()*noise;
  raise debug 'League AI candidate score=%',score;
 if score>best then best:=score;choice:=jsonb_build_object('kind','swap','target',idx);end if;
 end loop;
 raise debug 'League AI decision skill=%, strategy=%, chosen=%, score=%',skill,strategy,choice,best;
 return choice;
end $$;
create or replace function hub_private.league_ai_ready(mid uuid) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;sid text;
begin
 select * into m from hub_private.league_matches where id=mid for update;
 if m.ai_profile_id is null or m.phase<>'clash' or m.deadline<=now() then raise exception 'PHASE_CHANGED';end if;
 perform 1 from public.user_saves where user_id=m.host_id for update;
 sid:=m.rules->>'set_id';m.cards_a:=hub_private.league_enrich(hub_private.make_pack(sid,1));m.cards_b:=hub_private.league_enrich(hub_private.make_pack(sid,1));
 perform hub_private.league_auto_draft(m.cards_a);perform hub_private.league_auto_draft(m.cards_b);
 -- Human economy path is unchanged. AI gets match-only cards, no save or wallet.
 perform hub_private.battle_award_mode(m.host_id,m.cards_a,sid,1,true);
 update hub_private.league_matches set ready_a=true,ready_b=true,cards_a=m.cards_a,cards_b=m.cards_b,phase='opening',revision=revision+1,deadline=now()+interval '90 seconds' where id=mid;
end $$;
create or replace function hub_private.league_ai_settle(mid uuid,winner uuid,reason text) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;p hub_private.profiles;ai hub_private.league_ai_profiles;d int;bd int;nr int;br int;modifier numeric;s jsonb;r jsonb;
begin
 select * into m from hub_private.league_matches where id=mid for update;
 if m.phase in('result','cancelled') then return;end if;
 if winner is not null and winner<>m.host_id and winner<>m.ai_profile_id then raise exception 'INVALID_WINNER';end if;
 select * into p from hub_private.profiles where user_id=m.host_id for update;
 select * into ai from hub_private.league_ai_profiles where id=m.ai_profile_id for update;
 modifier:=(m.rules->>'ai_rp_modifier')::numeric;
 d:=case when reason='abandoned' then 0 else hub_private.league_rating(p.rp,ai.rp,case when winner is null then .5 when winner=p.user_id then 1 else 0 end) end;
 -- Reduce positive rewards only; losses retain the normal formula (no loss farming).
 if d>0 then d:=round(d*modifier)::int;end if;nr:=greatest(0,p.rp+d);d:=nr-p.rp;
 bd:=case when reason='abandoned' then 0 else hub_private.league_rating(ai.rp,p.rp,case when winner is null then .5 when winner=ai.id then 1 else 0 end) end;br:=greatest(0,ai.rp+bd);bd:=br-ai.rp;
 s:=jsonb_build_object('wins',coalesce((p.league_stats->>'wins')::int,0)+case when winner=p.user_id then 1 else 0 end,'losses',coalesce((p.league_stats->>'losses')::int,0)+case when winner=ai.id then 1 else 0 end,'ties',coalesce((p.league_stats->>'ties')::int,0)+case when winner is null then 1 else 0 end,'streak',case when winner=p.user_id then coalesce((p.league_stats->>'streak')::int,0)+1 else 0 end,'highest',greatest(nr,p.season_high,coalesce((p.league_stats->>'highest')::int,0)));
 update hub_private.profiles set rp=nr,season_high=greatest(season_high,nr),league_stats=s,wins=wins+case when winner=p.user_id then 1 else 0 end,losses=losses+case when winner=ai.id then 1 else 0 end,ties=ties+case when winner is null then 1 else 0 end,streak=case when winner=p.user_id then streak+1 else 0 end where user_id=p.user_id;
 update hub_private.league_ai_profiles set rp=br,highest_rp=greatest(highest_rp,br),wins=wins+case when winner=ai.id then 1 else 0 end,losses=losses+case when winner=p.user_id then 1 else 0 end,ties=ties+case when winner is null then 1 else 0 end,last_match_at=now() where id=ai.id;
 r:=jsonb_build_object(p.user_id::text,jsonb_build_object('before',p.rp,'delta',d,'after',nr),ai.id::text,jsonb_build_object('before',ai.rp,'delta',bd,'after',br),'winner',winner,'reason',reason,'ai_rp_modifier',modifier,'pack_values',jsonb_build_object(p.user_id::text,(select coalesce(sum((c->>'market')::numeric),0) from jsonb_array_elements(m.cards_a) c),ai.id::text,(select coalesce(sum((c->>'market')::numeric),0) from jsonb_array_elements(m.cards_b) c)));
 update hub_private.league_matches set phase='result',finished_at=now(),result=r,revision=revision+1,action_a=null,action_b=null where id=mid;
 insert into hub_private.league_ai_history(match_id,ai_id,human_id,winner,human_delta,ai_delta) values(mid,ai.id,p.user_id,winner,d,bd) on conflict do nothing;
 delete from hub_private.league_members where match_id=mid;
 perform hub_private.log(p.user_id,'draft_duel_result',jsonb_build_object('match',mid,'winner',winner,'delta',d,'reason',reason,'ai_collector',true));
 perform hub_private.league_signal(p.user_id);
end $$;
-- Serialized with the EXISTING queue transaction lock. Called only after a human
-- search, and rechecks human eligibility before committing an AI participant.
create or replace function hub_private.league_ai_try_match(u uuid) returns void language plpgsql set search_path='' as $$
declare cfg hub_private.league_ai_config;q hub_private.league_queue;ai hub_private.league_ai_profiles;sid text;mid uuid;modifier numeric;
begin
 select * into cfg from hub_private.league_ai_config where id;
 if not (cfg.ai_ranked_fallback_enabled or u=any(cfg.qa_users)) or cfg.worker_heartbeat is null or cfg.worker_heartbeat<clock_timestamp()-interval '10 seconds' then return;end if;
 perform pg_advisory_xact_lock(256,1);
 select * into q from hub_private.league_queue where user_id=u and expires_at>now() for update;
 if not found or now()<q.joined_at+make_interval(secs=>cfg.ai_fallback_ms/1000.0) or exists(select 1 from hub_private.league_members where user_id=u) then return;end if;
 if exists(select 1 from hub_private.league_queue other where other.user_id<>u and other.expires_at>now() and hub_private.league_allowed(other.user_id) and not hub_private.blocked(u,other.user_id) and abs(other.rp-q.rp)<=hub_private.league_search_window(extract(epoch from(now()-least(q.joined_at,other.joined_at))))) then return;end if;
 select p.* into ai from hub_private.league_ai_profiles p where enabled
 and (abs(p.rp-q.rp)<=400 or (q.rp>=1900 and p.rp>=1400))
 and (q.rp<1900 or p.rp>=1400)
 order by case when abs(p.rp-q.rp)<=200 then 0 else 1 end,
 case when p.id in(select ai_id from hub_private.league_ai_history where human_id=u order by finished_at desc limit cfg.repeat_opponent_window) then 1 else 0 end,
 abs(p.rp-q.rp),p.last_match_at nulls first,p.id limit 1 for update of p skip locked;
 if not found then return;end if;
 select id into sid from hub_private.expansions e where id in('sv04.5','swsh12.5','swsh4.5','sv08','sv03') and (select count(*) from hub_private.catalog where set_id=e.id and enabled)>=10 order by random() limit 1;
 if sid is null then return;end if;
 modifier:=greatest(.85,least(1,coalesce((cfg.rp_modifiers->>hub_private.league_ai_rank(q.rp))::numeric,1)));
 insert into hub_private.league_matches(host_id,ai_profile_id,rules,ready_b) values(u,ai.id,jsonb_build_object('mode','draft_duel','set_id',sid,'pack_count',1,'draft_version',1,'battle_version',1,'budget',100,'budget_policy','max-base-cheapest-five','rating_mode','server-elo-v1','season','legacy-continuity','cost_a',hub_private.battle_cost(u,sid,1),'cost_b',0,'ai_collector',true,'ai_rp_modifier',modifier,'ai_skill',hub_private.league_ai_skill(ai.rp),'ai_rank',hub_private.league_ai_rank(ai.rp)),true) returning id into mid;
 insert into hub_private.league_members(user_id,match_id) values(u,mid);
 delete from hub_private.league_queue where user_id=u;
 update hub_private.league_ai_profiles set last_match_at=now() where id=ai.id;
 perform hub_private.league_signal(u);
end $$;
create or replace function hub_private.league_ai_schedule() returns trigger language plpgsql set search_path='' as $$
declare r integer;
begin
 if new.ai_profile_id is null then return new;end if;
 if new.phase in('result','cancelled') then new.ai_due_at:=null;return new;end if;
 if tg_op='INSERT' or new.phase is distinct from old.phase or new.turn is distinct from old.turn then
  select rp into r from hub_private.league_ai_profiles where id=new.ai_profile_id;
  new.ai_due_at:=least(new.deadline,clock_timestamp()+case new.phase
   when 'opening' then make_interval(secs=>.5+random()*.9)
   when 'draft' then make_interval(secs=>3+(1-hub_private.league_ai_skill(r))*5+random()*2)
   when 'battle' then hub_private.league_ai_delay(r) else interval '45 seconds' end);
 end if;
 raise debug 'League AI schedule match=%, phase=%, rank=%, due_at=%',new.id,new.phase,hub_private.league_ai_rank(r),new.ai_due_at;
 return new;
end $$;
drop trigger if exists league_ai_schedule on hub_private.league_matches;
create trigger league_ai_schedule before insert or update on hub_private.league_matches for each row execute function hub_private.league_ai_schedule();
create or replace function hub_private.league_ai_validate_action(combat jsonb,act jsonb) returns void language plpgsql immutable set search_path='' as $$
declare squad jsonb:=combat#>'{b,squad}';active integer:=(combat#>>'{b,active}')::int;actor jsonb;target integer;
begin
 if jsonb_typeof(act) is distinct from 'object' or coalesce(act->>'kind','') not in('attack','defend','ability','swap') then raise exception 'INVALID_ACTION';end if;
 actor:=squad->active;
 if actor is null or (actor->>'hp')::int<=0 then raise exception 'INVALID_ACTIVE';end if;
 if act->>'kind'='ability' and ((actor->>'uses')::int<=0 or (actor->>'cooldown')::int>0) then raise exception 'ABILITY_UNAVAILABLE';end if;
 if act->>'kind'='swap' then target:=hub_private.integer_value(act->'target',0,4);if target=active or (squad->target->>'hp')::int<=0 then raise exception 'INVALID_SWAP';end if;end if;
end $$;
create or replace function hub_private.league_ai_step(mid uuid) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;ai hub_private.league_ai_profiles;indices jsonb;act jsonb;obs jsonb;
begin
 select * into m from hub_private.league_matches where id=mid for update;
 if m.ai_profile_id is null or m.phase in('result','cancelled') or m.ai_due_at>clock_timestamp() then return;end if;
 select * into ai from hub_private.league_ai_profiles where id=m.ai_profile_id;
 if m.deadline<=now() then
  if m.phase='clash' then
   update hub_private.league_matches set phase='cancelled',revision=revision+1,finished_at=now() where id=mid;delete from hub_private.league_members where match_id=mid;
  elsif m.phase='opening' then
   update hub_private.league_matches set reveal_a=10,reveal_b=10,phase='draft',revision=revision+1,deadline=now()+interval '45 seconds' where id=mid;
  elsif m.phase='draft' then
   indices:=coalesce(m.draft_b,hub_private.league_ai_draft(m.cards_b,(m.rules->>'ai_skill')::numeric));
   update hub_private.league_matches set combat=jsonb_build_object('a',case when m.draft_a is null then hub_private.league_auto_draft(m.cards_a) else hub_private.league_draft(m.cards_a,m.draft_a) end,'b',hub_private.league_draft(m.cards_b,indices)),phase='battle',draft_b=indices,revision=revision+1,deadline=now()+interval '12 seconds' where id=mid;
  elsif m.phase='battle' then perform hub_private.league_resolve(mid);end if;
 elsif m.phase='opening' then
  update hub_private.league_matches set reveal_b=least(10,reveal_b+1),ai_due_at=least(deadline,clock_timestamp()+make_interval(secs=>case when random()<.12 then 1.2+random()*.8 else .4+random()*.8 end)) where id=mid returning * into m;
  if m.reveal_a=10 and m.reveal_b=10 then update hub_private.league_matches set phase='draft',revision=revision+1,deadline=now()+interval '45 seconds' where id=mid;
  elsif m.reveal_b=10 then update hub_private.league_matches set ai_due_at=deadline where id=mid;end if;
 elsif m.phase='draft' then
  if m.draft_b is null then
   indices:=hub_private.league_ai_draft(m.cards_b,(m.rules->>'ai_skill')::numeric);
   perform hub_private.league_draft(m.cards_b,indices);
   update hub_private.league_matches set draft_b=indices,ai_due_at=deadline where id=mid returning * into m;
  end if;
  if m.draft_a is not null and m.draft_b is not null then
   update hub_private.league_matches set combat=jsonb_build_object('a',hub_private.league_draft(m.cards_a,m.draft_a),'b',hub_private.league_draft(m.cards_b,m.draft_b)),phase='battle',revision=revision+1,deadline=now()+interval '12 seconds' where id=mid;
  end if;
 elsif m.phase='battle' then
  if m.action_b is null then
   obs:=hub_private.league_ai_observation(m.combat,'b',m.turn,m.last_turn);
   act:=hub_private.league_ai_action(obs,(m.rules->>'ai_skill')::numeric,ai.strategy);
   perform hub_private.league_ai_validate_action(m.combat,act);
   update hub_private.league_matches set action_b=act,ai_due_at=deadline where id=mid;
  end if;
  perform hub_private.league_resolve(mid);
 end if;
 perform hub_private.league_signal(m.host_id);
end $$;
-- Run by pg_cron, never by a browser. Bounded work, skip locked rooms, failures
-- isolated per room; existing deadlines still resolve missing actions as Defend.
create or replace function hub_private.league_ai_worker() returns integer language plpgsql set search_path='' as $$
declare mid uuid;n integer:=0;started timestamptz:=clock_timestamp();
begin
 if not pg_try_advisory_xact_lock(263,1) then return 0;end if;
 update hub_private.league_ai_config set worker_heartbeat=clock_timestamp() where id;
 for mid in select id from hub_private.league_matches where ai_profile_id is not null and phase not in('result','cancelled') and ai_due_at<=clock_timestamp() order by ai_due_at limit 100 for update skip locked loop
  begin perform hub_private.league_ai_step(mid);
  exception when others then
   update hub_private.league_matches set ai_errors=ai_errors+1,ai_due_at=clock_timestamp()+interval '1 second' where id=mid;
   -- No sensitive payload logging. SQLSTATE + room UUID are diagnostic only.
   raise warning 'League AI worker room %, SQLSTATE %',mid,sqlstate;
  end;
  n:=n+1;exit when clock_timestamp()-started>interval '500 milliseconds';
 end loop;
 return n;
end $$;
create or replace function public.league_command(p_action text,p_payload jsonb default '{}',p_request_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;u uuid:=auth.uid();already_done boolean;
begin
 if u is null then raise exception 'AUTH_REQUIRED';end if;
 if p_action in('queue_join','queue_tick') then
  -- Same lock order as V262. Cancellation and competing human joins serialize.
  perform pg_advisory_xact_lock(262,hashtext(u::text));
  select exists(select 1 from hub_private.league_requests where user_id=u and request_id=p_request_id) into already_done;
 end if;
 result:=hub_private.league_command_core(p_action,p_payload,p_request_id);
 if p_action in('queue_join','queue_tick') and not already_done and result->'queue'<>'null'::jsonb then
  perform hub_private.league_ai_try_match(u);return hub_private.league_snapshot(u);
 end if;
 return result;
end $$;
-- Preserve existing Hub RPC grants: some deployed wrappers are SECURITY INVOKER.
revoke all on hub_private.league_ai_config,hub_private.league_ai_profiles,hub_private.league_ai_history from public,anon,authenticated;
revoke all on function hub_private.league_ai_rank(integer) from public,anon,authenticated;
revoke all on function hub_private.league_ai_skill(integer) from public,anon,authenticated;
revoke all on function hub_private.league_ai_delay(integer) from public,anon,authenticated;
revoke all on function hub_private.league_search_window(numeric) from public,anon,authenticated;
revoke all on function hub_private.league_command_core(text,jsonb,uuid) from public,anon,authenticated;
revoke all on function hub_private.league_ai_draft(jsonb,numeric) from public,anon,authenticated;
revoke all on function hub_private.league_ai_observation(jsonb,text,integer,jsonb) from public,anon,authenticated;
revoke all on function hub_private.league_ai_action(jsonb,numeric,text) from public,anon,authenticated;
revoke all on function hub_private.league_ai_ready(uuid) from public,anon,authenticated;
revoke all on function hub_private.league_ai_settle(uuid,uuid,text) from public,anon,authenticated;
revoke all on function hub_private.league_ai_try_match(uuid) from public,anon,authenticated;
revoke all on function hub_private.league_ai_schedule() from public,anon,authenticated;
revoke all on function hub_private.league_ai_validate_action(jsonb,jsonb) from public,anon,authenticated;
revoke all on function hub_private.league_ai_step(uuid) from public,anon,authenticated;
revoke all on function hub_private.league_ai_worker() from public,anon,authenticated;
revoke all on function public.league_command(text,jsonb,uuid) from public,anon;
grant execute on function public.league_command(text,jsonb,uuid) to authenticated;
revoke all on function public.league_identity_art(uuid) from public,anon;
grant execute on function public.league_identity_art(uuid) to authenticated;
-- NO public AI enablement, no QA allowlist population, no scheduler installation
-- and no modifications to Stakes or existing saves/RP/rooms on migration.
commit;
