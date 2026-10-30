-- V265. Printed-card tactical battles; no save data, collection history or RP resets.
begin;
set local lock_timeout='3s';

create or replace function hub_private.league_stats(c jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare t integer:=greatest(0,least(5,coalesce(nullif(c->>'tier','')::integer,0)));ty text:=lower(coalesce(c#>>'{types,0}',c->>'type',''));types text[]:=array['fire','water','grass','lightning','fighting','psychic','darkness','metal','colorless'];
hp integer:=90;source boolean;ability_text text:=left(coalesce(c#>>'{abilities,0,effect}',''),550);ability_name text:=coalesce(c#>>'{abilities,0,name}','');ability_kind text;weak text:=lower(coalesce(c#>>'{weaknesses,0,type}',''));resist text:=lower(coalesce(c#>>'{resistances,0,type}',''));moves jsonb:='[]';a jsonb;d text;damage integer;energy integer;power integer;role text;
begin
 source:=ty=any(types);if not source then ty:='colorless';end if;
 if c->>'hp' ~ '^\d{2,3}$' and (c->>'hp')::integer between 30 and 500 then hp:=(c->>'hp')::integer;end if;
 for a in select value from jsonb_array_elements(case when jsonb_typeof(c->'attacks')='array' then c->'attacks' else '[]'::jsonb end) limit 3 loop
  d:=substring(coalesce(a->>'damage','') from '^\s*(\d{1,4})');damage:=case when d is not null then least(400,d::integer) else 0 end;
  energy:=case when jsonb_typeof(a->'cost')='array' then least(4,jsonb_array_length(a->'cost')) else 0 end;
  moves:=moves||jsonb_build_array(jsonb_build_object('name',left(coalesce(nullif(a->>'name',''),'Attack'),60),'damage',case when damage=0 then 10 else damage end,'energy',energy,'effect',left(coalesce(a->>'effect',''),550),'printed',true));
 end loop;
 if jsonb_array_length(moves)=0 then moves:=jsonb_build_array(jsonb_build_object('name','Collector Strike','damage',28,'energy',1,'effect','Standard League move. No printed attack metadata available for this card.','printed',false));end if;
 power:=(moves#>>'{0,damage}')::integer+least(3,t);
 ability_kind:=case when jsonb_array_length(case when jsonb_typeof(c->'abilities')='array' then c->'abilities' else '[]'::jsonb end)=0 then 'none' when ability_text~*'heal|remove [0-9]+ damage' then 'heal' when ability_text~*'prevent|protect|reduce damage|shield' then 'guard' else 'focus' end;
 role:=case when ability_kind='heal' then 'support' when hp>=180 then 'tank' when ty='lightning' then 'speed' else 'attacker' end;
 return jsonb_build_object('power',power,'defense',0,'speed',case when ty='lightning' then 24 else 20 end,'max_hp',hp,'ability',ability_kind,'ability_name',ability_name,'ability_text',ability_text,
 'cost',case when c->>'rarity' ilike '%uncommon%' then 12 else (array[10,16,20,24,28,30])[t+1] end,'type',ty,'type_source',case when source then 'source' else 'neutral' end,'role',role,'moves',moves,'weakness',case when weak=any(types) then weak else '' end,'resistance',case when resist=any(types) then resist else '' end);
end $$;

-- AI chooses from the same visible moves/energy as a human. The server never
-- reads the human's hidden action when scoring the AI's options.
create or replace function hub_private.league_ai_action(observation jsonb,skill numeric,strategy text) returns jsonb language plpgsql volatile set search_path='' as $$
declare own jsonb:=observation->'own';op jsonb:=observation->'opponent';a jsonb;enemy jsonb;candidate jsonb;move jsonb;score numeric;best numeric:=-999;choice jsonb:='{"kind":"defend"}';ix integer;mi integer;available integer;damage numeric;incoming numeric:=0;noise numeric:=greatest(0,1-skill)*12;mult numeric;
begin
 a:=own->'squad'->(own->>'active')::integer;enemy:=op->'squad'->(op->>'active')::integer;
 available:=least(4,coalesce((a->>'energy')::integer,2)+1);
 for mi in 0..greatest(0,jsonb_array_length(coalesce(a#>'{stats,moves}','[]'::jsonb))-1) loop
  move:=a#>array['stats','moves',mi::text];if move is null or (move->>'energy')::integer>available then continue;end if;
  mult:=hub_private.league_affinity(a#>>'{stats,type}',enemy#>>'{stats,type}',coalesce(enemy#>>'{stats,weakness}',''),coalesce(enemy#>>'{stats,resistance}',''));
  damage:=coalesce((move->>'damage')::numeric,28)*mult;
  score:=damage+case when damage>=(enemy->>'hp')::numeric then 45 else 0 end-(move->>'energy')::numeric*3+random()*noise;
  if strategy='aggressive' then score:=score+8;end if;
  if score>best then best:=score;choice:=jsonb_build_object('kind','attack','move',mi);end if;
 end loop;
 incoming:=coalesce((enemy#>>'{stats,moves,0,damage}')::numeric,28)*hub_private.league_affinity(enemy#>>'{stats,type}',a#>>'{stats,type}',coalesce(a#>>'{stats,weakness}',''),coalesce(a#>>'{stats,resistance}',''));
 score:=incoming*.5+case when (a->>'hp')::numeric<=incoming then 25 else 0 end+case when strategy='control' then 8 else 0 end+random()*noise;
 if score>best then best:=score;choice:='{"kind":"defend"}';end if;
 if (a->>'uses')::integer>0 and (a->>'cooldown')::integer=0 and a#>>'{stats,ability}'<>'none' then
  score:=case a#>>'{stats,ability}' when 'heal' then least(30,(a#>>'{stats,max_hp}')::numeric-(a->>'hp')::numeric)*1.3 when 'guard' then incoming*.7 else case when available<=2 then 35 else 5 end end+random()*noise;
  if score>best then best:=score;choice:='{"kind":"ability"}';end if;
 end if;
 for ix in 0..4 loop
  if ix=(own->>'active')::integer then continue;end if;
  candidate:=own->'squad'->ix;if (candidate->>'hp')::integer<=0 then continue;end if;
  mult:=hub_private.league_affinity(candidate#>>'{stats,type}',enemy#>>'{stats,type}',coalesce(enemy#>>'{stats,weakness}',''),coalesce(enemy#>>'{stats,resistance}',''));
  damage:=coalesce((candidate#>>'{stats,moves,0,damage}')::numeric,28)*mult;
  score:=damage*.6+case when (a->>'hp')::numeric<incoming and (candidate->>'hp')::numeric>incoming then 22 else 0 end+case when strategy='control' then 6 else 0 end-16+random()*noise;
  if score>best then best:=score;choice:=jsonb_build_object('kind','swap','target',ix);end if;
 end loop;
 return choice;
end $$;

create or replace function hub_private.league_ai_validate_action(combat jsonb,act jsonb) returns void language plpgsql immutable set search_path='' as $$
declare squad jsonb:=combat#>'{b,squad}';active integer:=(combat#>>'{b,active}')::integer;actor jsonb;target integer;mi integer;
begin
 if jsonb_typeof(act) is distinct from 'object' or coalesce(act->>'kind','') not in('attack','defend','ability','swap') then raise exception 'INVALID_ACTION';end if;
 actor:=squad->active;if actor is null or (actor->>'hp')::integer<=0 then raise exception 'INVALID_ACTIVE';end if;
 if act->>'kind'='ability' and ((actor->>'uses')::integer<=0 or (actor->>'cooldown')::integer>0 or actor#>>'{stats,ability}'='none') then raise exception 'ABILITY_UNAVAILABLE';end if;
 if act->>'kind'='swap' then target:=hub_private.integer_value(act->'target',0,4);if target=active or (squad->target->>'hp')::integer<=0 then raise exception 'INVALID_SWAP';end if;end if;
 if act->>'kind'='attack' then
  mi:=hub_private.integer_value(coalesce(act->'move','0'::jsonb),0,jsonb_array_length(actor#>'{stats,moves}')-1);
  if least(4,coalesce((actor->>'energy')::integer,2)+1)<(actor#>>array['stats','moves',mi::text,'energy'])::integer then raise exception 'INSUFFICIENT_ENERGY';end if;
 end if;
end $$;

create or replace function hub_private.league_enrich(cards jsonb) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(p.value||jsonb_strip_nulls(jsonb_build_object('types',c.card->'types','type',c.card->'type','hp',c.card->'hp','attacks',c.card->'attacks','abilities',c.card->'abilities','weaknesses',c.card->'weaknesses','resistances',c.card->'resistances')) order by p.ordinality),'[]')
 from jsonb_array_elements(cards) with ordinality p left join hub_private.catalog c on c.id=p.value->>'id';
$$;

create or replace function hub_private.league_draft(cards jsonb,indices jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare squad jsonb:='[]';ix integer;total integer:=0;c jsonb;st jsonb;
begin
 if jsonb_typeof(indices) is distinct from 'array' or jsonb_array_length(indices)<>5 then raise exception 'DRAFT_FIVE_REQUIRED';end if;
 if (select count(distinct value) from jsonb_array_elements(indices))<>5 then raise exception 'DRAFT_DUPLICATE';end if;
 for c in select value from jsonb_array_elements(indices) loop
  ix:=hub_private.integer_value(c,0,jsonb_array_length(cards)-1);st:=hub_private.league_stats(cards->ix);total:=total+(st->>'cost')::integer;
  squad:=squad||jsonb_build_array(jsonb_build_object('slot',ix,'card',cards->ix,'stats',st,'hp',(st->>'max_hp')::integer,'energy',2,'uses',2,'cooldown',0,'guarded',false,'slowed',false));
 end loop;
 if total>hub_private.league_budget(cards) then raise exception 'DRAFT_OVER_BUDGET';end if;
 return jsonb_build_object('squad',squad,'active',0,'kos',0,'cost',total,'metrics',jsonb_build_object('damage',0,'blocked',0,'advantage',0,'swaps',0,'ability',0));
end $$;

create or replace function hub_private.league_affinity(a text,b text,weak text,resist text) returns numeric language sql immutable set search_path='' as $$
 select case when a=weak and weak<>'' then 2 when a=resist and resist<>'' then .5 else hub_private.league_affinity(a,b) end;
$$;

-- All actions resolve in a single locked transaction. No client-supplied damage,
-- stats, energy, HP, type or target effects are ever trusted.
create or replace function hub_private.league_resolve(mid uuid) returns void language plpgsql set search_path='' as $$
declare m hub_private.league_matches;state jsonb;side text;other text;act jsonb;actor jsonb;enemy jsonb;attack jsonb;ix integer;jx integer;slot integer;energy integer;needed integer;raw integer;damage integer;hp integer;healed integer;mult numeric;first_side text;order_a integer;order_b integer;events jsonb:='[]';a_hp integer;b_hp integer;winner uuid;target integer;ability_kind text;
begin
 select * into m from hub_private.league_matches where id=mid for update;m.guest_id:=coalesce(m.guest_id,m.ai_profile_id);if m.phase<>'battle' then return;end if;
 if (m.action_a is null or m.action_b is null) and now()<m.deadline then return;end if;
 if now()>m.deadline+interval '60 seconds' and m.action_a is null and m.action_b is null then perform hub_private.league_settle(mid,null,'abandoned');return;end if;
 m.idle_a:=case when m.action_a is null then m.idle_a+1 else 0 end;m.idle_b:=case when m.action_b is null then m.idle_b+1 else 0 end;
 if m.idle_a>=3 or m.idle_b>=3 then perform hub_private.league_settle(mid,case when m.idle_a>=3 and m.idle_b>=3 then null when m.idle_a>=3 then m.guest_id else m.host_id end,'idle');return;end if;
 m.action_a:=coalesce(m.action_a,'{"kind":"defend"}');m.action_b:=coalesce(m.action_b,'{"kind":"defend"}');state:=m.combat;
 order_a:=coalesce((state#>>array['a','squad',state#>>'{a,active}','stats','speed'])::integer,20);
 order_b:=coalesce((state#>>array['b','squad',state#>>'{b,active}','stats','speed'])::integer,20);
 first_side:=case when order_a>order_b or (order_a=order_b and m.turn%2=1) then 'a' else 'b' end;
 foreach side in array array['a','b'] loop
  act:=case when side='a' then m.action_a else m.action_b end;
  for slot in 0..4 loop
   actor:=state#>array[side,'squad',slot::text];
   actor:=actor||jsonb_build_object('guarded',false,'cooldown',greatest(0,coalesce((actor->>'cooldown')::integer,0)-1));
   if slot=(state#>>array[side,'active'])::integer and (actor->>'hp')::integer>0 then
    actor:=actor||jsonb_build_object('energy',least(4,coalesce((actor->>'energy')::integer,2)+1));
   end if;
   state:=jsonb_set(state,array[side,'squad',slot::text],actor);
  end loop;
  if act->>'kind'='swap' then
   state:=jsonb_set(state,array[side,'active'],act->'target');
   state:=jsonb_set(state,array[side,'metrics','swaps'],to_jsonb((state#>>array[side,'metrics','swaps'])::integer+1));
   events:=events||jsonb_build_array(jsonb_build_object('side',side,'kind','swap','target',(act->>'target')::integer));
  end if;
  ix:=(state#>>array[side,'active'])::integer;actor:=state#>array[side,'squad',ix::text];ability_kind:=coalesce(actor#>>'{stats,ability}','none');
  if act->>'kind'='defend' then actor:=actor||jsonb_build_object('guarded',true);events:=events||jsonb_build_array(jsonb_build_object('side',side,'kind','defend'));end if;
  if act->>'kind'='ability' then
   actor:=actor||jsonb_build_object('uses',greatest(0,(actor->>'uses')::integer-1),'cooldown',2);
   if ability_kind='heal' then
    hp:=least((actor#>>'{stats,max_hp}')::integer,(actor->>'hp')::integer+30);healed:=hp-(actor->>'hp')::integer;
    actor:=actor||jsonb_build_object('hp',hp);
    state:=jsonb_set(state,array[side,'metrics','ability'],to_jsonb((state#>>array[side,'metrics','ability'])::integer+healed));
   elsif ability_kind='guard' then actor:=actor||jsonb_build_object('guarded',true);
   else actor:=actor||jsonb_build_object('energy',least(4,coalesce((actor->>'energy')::integer,2)+2));end if;
   events:=events||jsonb_build_array(jsonb_build_object('side',side,'kind','ability','ability',ability_kind));
  end if;
  state:=jsonb_set(state,array[side,'squad',ix::text],actor);
 end loop;
 foreach side in array array[first_side,case when first_side='a' then 'b' else 'a' end] loop
  other:=case when side='a' then 'b' else 'a' end;
  act:=case when side='a' then m.action_a else m.action_b end;
  if act->>'kind'<>'attack' then continue;end if;
  ix:=(state#>>array[side,'active'])::integer;jx:=(state#>>array[other,'active'])::integer;
  actor:=state#>array[side,'squad',ix::text];enemy:=state#>array[other,'squad',jx::text];
  if (actor->>'hp')::integer<=0 or (enemy->>'hp')::integer<=0 then continue;end if;
  attack:=actor#>array['stats','moves',coalesce(act->>'move','0')];
  raw:=coalesce((attack->>'damage')::integer,28);needed:=coalesce((attack->>'energy')::integer,1);energy:=coalesce((actor->>'energy')::integer,3);
  if energy<needed then events:=events||jsonb_build_array(jsonb_build_object('side',side,'kind','no_energy'));continue;end if;
  actor:=actor||jsonb_build_object('energy',energy-needed);state:=jsonb_set(state,array[side,'squad',ix::text],actor);
  -- Genome Hacking and similar copy moves borrow the opponent's printed strength.
  if coalesce(attack->>'effect','') ~* 'choose 1 of your opponent.*attacks and use it' then
   select greatest(10,coalesce(max((value->>'damage')::integer),10)) into raw from jsonb_array_elements(coalesce(enemy#>'{stats,moves}','[]'::jsonb));
  end if;
  mult:=hub_private.league_affinity(actor#>>'{stats,type}',enemy#>>'{stats,type}',coalesce(enemy#>>'{stats,weakness}',''),coalesce(enemy#>>'{stats,resistance}',''));
  raw:=greatest(1,round(raw*mult)::integer);
  damage:=case when coalesce((enemy->>'guarded')::boolean,false) then greatest(1,round(raw*.5)::integer) else raw end;
  state:=jsonb_set(state,array[other,'metrics','blocked'],to_jsonb((state#>>array[other,'metrics','blocked'])::integer+raw-damage));
  damage:=least(damage,(enemy->>'hp')::integer);hp:=(enemy->>'hp')::integer-damage;
  enemy:=enemy||jsonb_build_object('hp',hp);state:=jsonb_set(state,array[other,'squad',jx::text],enemy);
  state:=jsonb_set(state,array[side,'metrics','damage'],to_jsonb((state#>>array[side,'metrics','damage'])::integer+damage));
  if mult>1 then state:=jsonb_set(state,array[side,'metrics','advantage'],to_jsonb((state#>>array[side,'metrics','advantage'])::integer+1));end if;
  events:=events||jsonb_build_array(jsonb_build_object('side',side,'kind','attack','name',coalesce(attack->>'name','Collector Strike'),'damage',damage,'ko',hp=0,'type_multiplier',mult,'energy',needed));
  if hp=0 then state:=jsonb_set(state,array[other,'kos'],to_jsonb((state#>>array[other,'kos'])::integer+1));end if;
 end loop;
 foreach side in array array['a','b'] loop
  if (state#>>array[side,'squad',state#>>array[side,'active'],'hp'])::integer<=0 then
   target:=null;
   select (ordinality-1)::integer into target from jsonb_array_elements(state#>array[side,'squad']) with ordinality where (value->>'hp')::integer>0 order by ordinality limit 1;
   if target is not null then state:=jsonb_set(state,array[side,'active'],to_jsonb(target));end if;
  end if;
 end loop;
 update hub_private.league_matches set combat=state,last_turn=jsonb_build_object('turn',m.turn,'a',m.action_a,'b',m.action_b,'events',events),turn=turn+1,revision=revision+1,action_a=null,action_b=null,idle_a=m.idle_a,idle_b=m.idle_b,deadline=now()+interval '25 seconds' where id=mid;
 if (state#>>'{a,kos}')::integer>=3 or (state#>>'{b,kos}')::integer>=3 then
  winner:=case when (state#>>'{a,kos}')::integer>=3 then m.guest_id else m.host_id end;perform hub_private.league_settle(mid,winner,'knockouts');
 elsif m.turn>=20 then
  select sum((value->>'hp')::integer) into a_hp from jsonb_array_elements(state#>'{a,squad}');
  select sum((value->>'hp')::integer) into b_hp from jsonb_array_elements(state#>'{b,squad}');
  a_hp:=(3-(state#>>'{a,kos}')::integer)*1000+a_hp;b_hp:=(3-(state#>>'{b,kos}')::integer)*1000+b_hp;
  perform hub_private.league_settle(mid,case when a_hp=b_hp then null when a_hp>b_hp then m.host_id else m.guest_id end,'turn_limit');
 end if;
 perform hub_private.league_signal(m.host_id,m.guest_id);
end $$;

-- Generated AI-compatible RPC upgrades (rebuild via scripts/assemble-v265-engine.mjs)
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
     insert into hub_private.league_matches(host_id,guest_id,rules) values(op.user_id,u,jsonb_build_object('mode','draft_duel','set_id',sid,'pack_count',1,'draft_version',1,'battle_version',2,'budget',100,'budget_policy','max-base-cheapest-five','rating_mode','server-elo-v1','season','legacy-continuity','cost_a',hub_private.battle_cost(op.user_id,sid,1),'cost_b',hub_private.battle_cost(u,sid,1))) returning id into mid;
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
   if m.draft_a is not null and m.draft_b is not null then update hub_private.league_matches set combat=jsonb_build_object('a',hub_private.league_draft(m.cards_a,m.draft_a),'b',hub_private.league_draft(m.cards_b,m.draft_b)),phase='battle',revision=revision+1,deadline=now()+interval '25 seconds' where id=mid;end if;
  elsif p_action='turn_submit' then
   if m.phase<>'battle' or m.deadline<=now() then raise exception 'PHASE_CHANGED';end if;
   if hub_private.integer_value(p_payload->'revision',0,2147483647)<>m.revision or hub_private.integer_value(p_payload->'turn',1,20)<>m.turn then raise exception 'STALE_REVISION';end if;
   if (own_a and m.action_a is not null) or (not own_a and m.action_b is not null) then raise exception 'ACTION_LOCKED';end if;
   act:=p_payload->'action';if jsonb_typeof(act) is distinct from 'object' or act->>'kind' not in('attack','defend','ability','swap') or act->>'kind' is null then raise exception 'INVALID_ACTION';end if;
   mine:=m.combat->case when own_a then 'a' else 'b' end;ix:=(mine->>'active')::integer;
   if act->>'kind'='ability' and ((mine#>>array['squad',ix::text,'uses'])::integer<=0 or (mine#>>array['squad',ix::text,'cooldown'])::integer>0) then raise exception 'ABILITY_UNAVAILABLE';end if;
   if act->>'kind'='swap' then
    n:=hub_private.integer_value(act->'target',0,4);
    if n=ix or (mine#>>array['squad',n::text,'hp'])::integer<=0 then raise exception 'INVALID_SWAP';end if;
    act:=jsonb_build_object('kind','swap','target',n);
   elsif act->>'kind'='attack' then
    n:=hub_private.integer_value(coalesce(act->'move','0'::jsonb),0,jsonb_array_length(mine#>array['squad',ix::text,'stats','moves'])-1);
    if coalesce((mine#>>array['squad',ix::text,'energy'])::integer,2)+1 < (mine#>>array['squad',ix::text,'stats','moves',n::text,'energy'])::integer then raise exception 'INSUFFICIENT_ENERGY';end if;
    act:=jsonb_build_object('kind','attack','move',n);
   else
    if act->>'kind'='ability' and mine#>>array['squad',ix::text,'stats','ability']='none' then raise exception 'ABILITY_UNAVAILABLE';end if;
    act:=jsonb_build_object('kind',act->>'kind');
   end if;
   update hub_private.league_matches set action_a=case when own_a then act else action_a end,action_b=case when not own_a then act else action_b end where id=mid;perform hub_private.league_resolve(mid);
  elsif p_action='tick' and m.deadline<=now() then
   if m.phase<>'clash' and m.phase not in('result','cancelled') and m.deadline<now()-interval '60 seconds' then perform hub_private.league_settle(mid,null,'abandoned');
   elsif m.phase='clash' then update hub_private.league_matches set phase='cancelled',revision=revision+1,finished_at=now() where id=mid;delete from hub_private.league_members where match_id=mid;
   elsif m.phase='opening' then update hub_private.league_matches set phase='draft',reveal_a=10,reveal_b=10,revision=revision+1,deadline=now()+interval '45 seconds' where id=mid;
   elsif m.phase='draft' then update hub_private.league_matches set combat=jsonb_build_object('a',case when m.draft_a is null then hub_private.league_auto_draft(m.cards_a) else hub_private.league_draft(m.cards_a,m.draft_a) end,'b',case when m.draft_b is null then hub_private.league_auto_draft(m.cards_b) else hub_private.league_draft(m.cards_b,m.draft_b) end),phase='battle',revision=revision+1,deadline=now()+interval '25 seconds' where id=mid;
   elsif m.phase='battle' then perform hub_private.league_resolve(mid);end if;
  end if;
  perform hub_private.league_signal(m.host_id,m.guest_id);
 end if;
 insert into hub_private.league_requests(user_id,request_id,action,payload) values(u,p_request_id,p_action,p_payload);
 -- Revision/phase/slot locks prevent replay even after old receipts expire.
 delete from hub_private.league_requests where user_id=u and request_id in(select request_id from hub_private.league_requests where user_id=u order by created_at desc,request_id offset 1000);
 return hub_private.league_snapshot(u);
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
   update hub_private.league_matches set combat=jsonb_build_object('a',case when m.draft_a is null then hub_private.league_auto_draft(m.cards_a) else hub_private.league_draft(m.cards_a,m.draft_a) end,'b',hub_private.league_draft(m.cards_b,indices)),phase='battle',draft_b=indices,revision=revision+1,deadline=now()+interval '25 seconds' where id=mid;
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
   update hub_private.league_matches set combat=jsonb_build_object('a',hub_private.league_draft(m.cards_a,m.draft_a),'b',hub_private.league_draft(m.cards_b,m.draft_b)),phase='battle',revision=revision+1,deadline=now()+interval '25 seconds' where id=mid;
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
 insert into hub_private.league_matches(host_id,ai_profile_id,rules,ready_b) values(u,ai.id,jsonb_build_object('mode','draft_duel','set_id',sid,'pack_count',1,'draft_version',1,'battle_version',2,'budget',100,'budget_policy','max-base-cheapest-five','rating_mode','server-elo-v1','season','legacy-continuity','cost_a',hub_private.battle_cost(u,sid,1),'cost_b',0,'ai_collector',true,'ai_rp_modifier',modifier,'ai_skill',hub_private.league_ai_skill(ai.rp),'ai_rank',hub_private.league_ai_rank(ai.rp)),true) returning id into mid;
 insert into hub_private.league_members(user_id,match_id) values(u,mid);
 delete from hub_private.league_queue where user_id=u;
 update hub_private.league_ai_profiles set last_match_at=now() where id=ai.id;
 perform hub_private.league_signal(u);
end $$;
revoke all on function hub_private.league_stats(jsonb) from public,anon,authenticated;
revoke all on function hub_private.league_enrich(jsonb) from public,anon,authenticated;
revoke all on function hub_private.league_draft(jsonb,jsonb) from public,anon,authenticated;
revoke all on function hub_private.league_affinity(text,text,text,text) from public,anon,authenticated;
revoke all on function hub_private.league_resolve(uuid) from public,anon,authenticated;
revoke all on function hub_private.league_command_core(text,jsonb,uuid) from public,anon,authenticated;
revoke all on function hub_private.league_ai_step(uuid) from public,anon,authenticated;
revoke all on function hub_private.league_ai_try_match(uuid) from public,anon,authenticated;
commit;
