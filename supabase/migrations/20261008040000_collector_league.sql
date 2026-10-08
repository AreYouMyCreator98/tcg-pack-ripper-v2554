-- V262 REVIEW REQUIRED. Additive internal QA only; OFF by default.
-- No existing save, room, inventory, RP or cosmetic selections are reset.
begin;
set local lock_timeout='3s';
create table if not exists hub_private.league_config(id boolean primary key default true check(id),enabled boolean not null default false,qa_users uuid[] not null default '{}');
insert into hub_private.league_config(id) values(true) on conflict do nothing;
create table if not exists hub_private.league_matches(
 id uuid primary key default gen_random_uuid(),host_id uuid not null references auth.users,guest_id uuid not null references auth.users,
 phase text not null default 'clash' check(phase in('clash','opening','draft','battle','result','cancelled')),
 rules jsonb not null,revision integer not null default 0,turn integer not null default 1,
 ready_a boolean not null default false,ready_b boolean not null default false,
 cards_a jsonb not null default '[]',cards_b jsonb not null default '[]',reveal_a integer not null default 0,reveal_b integer not null default 0,
 draft_a jsonb,draft_b jsonb,combat jsonb,action_a jsonb,action_b jsonb,last_turn jsonb not null default '{}',result jsonb,
 idle_a integer not null default 0,idle_b integer not null default 0,
 deadline timestamptz not null default(now()+interval '45 seconds'),created_at timestamptz not null default now(),finished_at timestamptz,
 check(host_id<>guest_id));
create table if not exists hub_private.league_members(user_id uuid primary key references auth.users,match_id uuid not null references hub_private.league_matches);
create table if not exists hub_private.league_queue(user_id uuid primary key references auth.users,rp integer not null,joined_at timestamptz not null default now(),expires_at timestamptz not null default(now()+interval '60 seconds'));
create table if not exists hub_private.league_requests(user_id uuid references auth.users,request_id uuid,action text not null,payload jsonb not null,created_at timestamptz not null default now(),primary key(user_id,request_id));
-- New-table access paths, justified by latest-match and ordered bounded queue queries.
create index if not exists league_host_history on hub_private.league_matches(host_id,created_at desc);
create index if not exists league_guest_history on hub_private.league_matches(guest_id,created_at desc);
create index if not exists league_queue_age on hub_private.league_queue(joined_at);
create index if not exists league_request_window on hub_private.league_requests(user_id,created_at desc,request_id);
create index if not exists league_queue_expiry on hub_private.league_queue(expires_at);
alter table hub_private.profiles add column if not exists league_stats jsonb not null default '{"wins":0,"losses":0,"ties":0,"streak":0,"highest":0}';
alter table hub_private.profiles add column if not exists league_banner jsonb not null default '{}';
create table if not exists public.league_signals(user_id uuid primary key references auth.users,revision bigint not null default 0);
alter table public.league_signals enable row level security;
drop policy if exists league_signal_self on public.league_signals;
create policy league_signal_self on public.league_signals for select to authenticated using(user_id=auth.uid());
grant select on public.league_signals to authenticated;
revoke all on hub_private.league_config,hub_private.league_matches,hub_private.league_members,hub_private.league_queue,hub_private.league_requests from public,anon,authenticated;
do $$begin if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='league_signals') then alter publication supabase_realtime add table public.league_signals; end if;end $$;
create or replace function hub_private.league_allowed(u uuid) returns boolean language sql stable set search_path='' as $$ select coalesce((select enabled or u=any(qa_users) from hub_private.league_config where id),false); $$;
create or replace function hub_private.league_hash(id text) returns integer language plpgsql immutable set search_path='' as $$declare n bigint:=0;i integer;begin for i in 1..length(id) loop n:=(n*31+ascii(substr(id,i,1)))%1000003;end loop;return n::integer;end $$;
create or replace function hub_private.league_stats(c jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare h integer:=hub_private.league_hash(c->>'id');t integer:=greatest(0,least(5,coalesce((c->>'tier')::integer,0)));r integer:=h%5;ty text:=lower(coalesce(c#>>'{types,0}',c->>'type',''));types text[]:=array['fire','water','grass','lightning','fighting','psychic','darkness','metal','colorless'];hp integer:=0;is_source boolean;
begin
 is_source:=ty=any(types);if not is_source then ty:=types[h%9+1];end if;
 if c->>'hp' ~ '^\d{1,4}$' then hp:=least(8,(c->>'hp')::integer/50);end if;
 return jsonb_build_object('power',25+h%7+least(3,t)+case when r=0 then 4 else 0 end,'defense',8+(h>>2)%5+case when r=1 then 5 else 0 end,'speed',12+(h>>3)%9+case when r=3 then 6 else 0 end,'max_hp',82+(h>>4)%17+hp+case when r=1 then 14 else 0 end,
 'ability',(array['blaze','guard','quick_strike','heal','piercing','counter','disrupt'])[h%7+1],'cost',case when c->>'rarity' ilike '%uncommon%' then 12 else (array[10,16,20,24,28,30])[t+1] end,'type',ty,'type_source',case when is_source then 'source' else 'derived-affinity' end,'role',(array['attacker','tank','support','speed','control'])[r+1]);
end $$;
create or replace function hub_private.league_affinity(a text,b text) returns numeric language sql immutable set search_path='' as $$
 select case when '{"fire":"grass","grass":"water","water":"fire","lightning":"water","fighting":"lightning","psychic":"fighting","darkness":"psychic","metal":"darkness"}'::jsonb->>a=b then 1.2 when '{"fire":"grass","grass":"water","water":"fire","lightning":"water","fighting":"lightning","psychic":"fighting","darkness":"psychic","metal":"darkness"}'::jsonb->>b=a then .85 else 1 end;
$$;
-- A high-rarity/God Pack must always admit at least one legal squad, without rerolling.
create or replace function hub_private.league_enrich(cards jsonb) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(p.value||jsonb_strip_nulls(jsonb_build_object('types',c.card->'types','type',c.card->'type','hp',c.card->'hp')) order by p.ordinality),'[]')
 from jsonb_array_elements(cards) with ordinality p left join hub_private.catalog c on c.id=p.value->>'id';
$$;
create or replace function hub_private.league_budget(cards jsonb) returns integer language sql immutable set search_path='' as $$
 select greatest(100,coalesce(sum(cost),0)::integer) from (select (hub_private.league_stats(value)->>'cost')::integer cost from jsonb_array_elements(cards) order by cost limit 5) cheapest;
$$;
create or replace function hub_private.league_draft(cards jsonb,indices jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare squad jsonb:='[]';ix integer;cost integer:=0;c jsonb;st jsonb;
begin
 if jsonb_typeof(indices) is distinct from 'array' or jsonb_array_length(indices)<>5 then raise exception 'DRAFT_FIVE_REQUIRED';end if;
 if (select count(distinct value) from jsonb_array_elements(indices))<>5 then raise exception 'DRAFT_DUPLICATE';end if;
 for c in select value from jsonb_array_elements(indices) loop
  ix:=hub_private.integer_value(c,0,jsonb_array_length(cards)-1);st:=hub_private.league_stats(cards->ix);cost:=cost+(st->>'cost')::integer;
  squad:=squad||jsonb_build_array(jsonb_build_object('slot',ix,'card',cards->ix,'stats',st,'hp',(st->>'max_hp')::integer,'uses',2,'cooldown',0,'guarded',false,'slowed',false));
 end loop;
 if cost>hub_private.league_budget(cards) then raise exception 'DRAFT_OVER_BUDGET';end if;
 return jsonb_build_object('squad',squad,'active',0,'kos',0,'cost',cost,'metrics',jsonb_build_object('damage',0,'blocked',0,'advantage',0,'swaps',0,'ability',0));
end $$;
create or replace function hub_private.league_auto_draft(cards jsonb) returns jsonb language sql immutable set search_path='' as $$
 select hub_private.league_draft(cards,(select jsonb_agg(ix) from (select ordinality-1 as ix from jsonb_array_elements(cards) with ordinality order by (hub_private.league_stats(value)->>'cost')::integer,ordinality limit 5) x));
$$;
create or replace function hub_private.league_rating(rp integer,opp integer,result numeric) returns integer language sql immutable set search_path='' as $$
 select case when result=.5 then 0 when result=1 then greatest(12,least(28,round(40*(1-1/(1+power(10::numeric,(opp-rp)::numeric/400))))::integer)) else -greatest(10,least(24,round(40/(1+power(10::numeric,(opp-rp)::numeric/400)))::integer)) end;
$$;
create or replace function hub_private.league_identity(u uuid) returns jsonb language sql stable set search_path='' as $$
 select hub_private.public_profile_brief(u)||jsonb_build_object('banner',league_banner,'highest',case when show_record then greatest(season_high,rp,coalesce((league_stats->>'highest')::integer,0)) else null end,
 'league_stats',case when show_record then league_stats else '{}'::jsonb end) from hub_private.profiles where user_id=u;
$$;
-- Preserve existing public identity/privacy and append the equipped competitive look.
create or replace function hub_private.public_profile(u uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('user_id',p.user_id,'name',p.name,'rp',p.rp,'title',p.title,'style',p.style,'badges',p.badges,'show_record',p.show_record,'trackers',p.trackers,
 'stat_values',case when p.show_record then jsonb_build_object('wins',p.wins,'losses',p.losses,'ties',p.ties,'season_high',p.season_high,'streak',p.streak) else '{}'::jsonb end,
 'wins',case when p.show_record then p.wins end,'losses',case when p.show_record then p.losses end,'ties',case when p.show_record then p.ties end,
 'league_banner',p.league_banner,'league_stats',case when p.show_record then p.league_stats else '{}'::jsonb end,
 'avatar',case when length(s.save_data#>>'{state,profileV227,avatarData}')<200000 and s.save_data#>>'{state,profileV227,avatarData}' ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$' then s.save_data#>>'{state,profileV227,avatarData}' else '' end,
 'frame',case when s.save_data#>>'{state,profileFramesV228,selected}' in('rookie','bronze','silver','gold','platinum','diamond','master','apex') and coalesce((s.save_data#>array['state','profileFramesV228','owned',s.save_data#>>'{state,profileFramesV228,selected}'])::text,'false')='true' then s.save_data#>>'{state,profileFramesV228,selected}' else null end)
 from hub_private.profiles p left join public.user_saves s on s.user_id=p.user_id where p.user_id=u;
$$;
create or replace function hub_private.league_signal(a uuid,b uuid default null) returns void language sql set search_path='' as $$
 insert into public.league_signals(user_id,revision) select id,1 from (values(a),(b)) x(id) where id is not null on conflict(user_id) do update set revision=league_signals.revision+1;
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
 own_a:=m.host_id=u;mycards:=case when own_a then m.cards_a else m.cards_b end;oppcards:=case when own_a then m.cards_b else m.cards_a end;
 select coalesce(jsonb_agg(value order by ordinality),'[]') into their from jsonb_array_elements(oppcards) with ordinality where ordinality<=case when own_a then m.reveal_b else m.reveal_a end;
 return out_data||jsonb_build_object('match',jsonb_build_object('id',m.id,'phase',m.phase,'rules',m.rules-'cost_a'-'cost_b','pack_cost',m.rules->case when own_a then 'cost_a' else 'cost_b' end,'revision',m.revision,'turn',m.turn,'deadline',m.deadline,'host_id',m.host_id,'guest_id',m.guest_id,
 'host_profile',hub_private.league_identity(m.host_id),'guest_profile',hub_private.league_identity(m.guest_id),
 'my_ready',case when own_a then m.ready_a else m.ready_b end,'opponent_ready',case when own_a then m.ready_b else m.ready_a end,
 'cards',case when m.phase in('opening','draft') then mycards else '[]'::jsonb end,'opponent_cards',case when m.phase='opening' then their else '[]'::jsonb end,
 'my_progress',case when own_a then m.reveal_a else m.reveal_b end,'opponent_progress',case when own_a then m.reveal_b else m.reveal_a end,
 'my_draft',case when own_a then m.draft_a else m.draft_b end,'opponent_drafted',case when own_a then m.draft_b is not null else m.draft_a is not null end,
 'combat',case when m.phase in('battle','result') then m.combat else null end,
 'action_locked',case when own_a then m.action_a is not null else m.action_b is not null end,'opponent_locked',case when own_a then m.action_b is not null else m.action_a is not null end,'last_turn',m.last_turn,'result',m.result));
end $$;
create or replace function hub_private.league_settle(mid uuid,winner uuid,reason text) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;p hub_private.profiles;ar integer;br integer;d integer;nr integer;s jsonb;settlement jsonb:='{}';
begin
 select * into m from hub_private.league_matches where id=mid for update;if m.phase in('result','cancelled') then return;end if;
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
create or replace function hub_private.league_resolve(mid uuid) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;state jsonb;side text;other text;actor jsonb;enemy jsonb;act jsonb;enemy_act jsonb;ix integer;jx integer;dmg integer;raw integer;hp integer;ability text;order_a integer;order_b integer;first_side text;events jsonb:='[]';a_hp integer;b_hp integer;winner uuid;target integer;ready_to_resolve boolean;
begin
 select * into m from hub_private.league_matches where id=mid for update;if m.phase<>'battle' then return;end if;
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
create or replace function public.league_identity_art(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null or not hub_private.league_allowed(u) then raise exception 'AUTH_REQUIRED';end if;
 if p_user_id<>u and not exists(select 1 from hub_private.league_matches where (host_id=u and guest_id=p_user_id) or (host_id=p_user_id and guest_id=u)) then raise exception 'PROFILE_UNAVAILABLE';end if;
 return jsonb_build_object('user_id',p_user_id,'avatar',hub_private.public_profile(p_user_id)->'avatar');
end $$;
revoke all on function public.league_identity_art(uuid) from public,anon;
grant execute on function public.league_identity_art(uuid) to authenticated;
create or replace function public.league_command(p_action text,p_payload jsonb default '{}',p_request_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
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
     and abs(other.rp-q.rp)<=least(800,100+floor(extract(epoch from(now()-least(q.joined_at,other.joined_at)))/10)::integer*100) order by joined_at limit 1 for update;
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
  if not found then raise exception 'MATCH_NOT_FOUND';end if;own_a:=m.host_id=u;
  if p_action='cancel' then
   if m.phase='clash' then update hub_private.league_matches set phase='cancelled',finished_at=now(),revision=revision+1 where id=mid;delete from hub_private.league_members where match_id=mid;
   elsif m.phase not in('result','cancelled') then perform hub_private.league_settle(mid,case when own_a then m.guest_id else m.host_id end,'forfeit');end if;
  elsif p_action='ready' then
   if m.phase<>'clash' or m.deadline<=now() then raise exception 'PHASE_CHANGED';end if;
   if hub_private.integer_value(p_payload->'revision',0,2147483647)<>m.revision then raise exception 'STALE_REVISION';end if;
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
create or replace function hub_private.league_legacy_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status in('waiting','ready','playing') and (tg_op='INSERT' or (old.guest_id is distinct from new.guest_id)) and (exists(select 1 from hub_private.league_members where user_id in(new.host_id,new.guest_id)) or exists(select 1 from hub_private.league_queue where user_id in(new.host_id,new.guest_id) and expires_at>now())) then raise exception 'ACTIVE_DRAFT_DUEL';end if;return new;
end $$;
drop trigger if exists league_exclusive_room on hub_private.rooms;
create trigger league_exclusive_room before insert or update on hub_private.rooms for each row execute function hub_private.league_legacy_guard();
revoke all on function public.league_command(text,jsonb,uuid) from public,anon;
grant execute on function public.league_command(text,jsonb,uuid) to authenticated;
do $$declare f record;begin for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on p.pronamespace=n.oid where n.nspname='hub_private' and p.proname like 'league_%' loop execute format('revoke all on function %s from public,anon,authenticated',f.signature);end loop;end $$;
commit;
