-- Chat identity, live banner stat selection and a fair five-set ranked pool.
-- Additive/backward-compatible API. Existing rooms, saves and receipts are preserved.
alter table hub_private.profiles add column trackers jsonb not null default '["wins","season_high","streak"]'::jsonb
 check(jsonb_typeof(trackers)='array' and jsonb_array_length(trackers)<=3);

create or replace function hub_private.public_profile(u uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('user_id',p.user_id,'name',p.name,'rp',p.rp,'title',p.title,'style',p.style,'badges',p.badges,'show_record',p.show_record,'trackers',p.trackers,
 'stat_values',case when p.show_record then jsonb_build_object('wins',p.wins,'losses',p.losses,'ties',p.ties,'season_high',p.season_high,'streak',p.streak) else '{}'::jsonb end,
 'wins',case when p.show_record then p.wins end,'losses',case when p.show_record then p.losses end,'ties',case when p.show_record then p.ties end,
 'avatar',case when length(s.save_data#>>'{state,profileV227,avatarData}')<200000 and s.save_data#>>'{state,profileV227,avatarData}' ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$' then s.save_data#>>'{state,profileV227,avatarData}' else '' end,
 'frame',case when s.save_data#>>'{state,profileFramesV228,selected}' in('rookie','bronze','silver','gold','platinum','diamond','master','apex') and coalesce((s.save_data#>array['state','profileFramesV228','owned',s.save_data#>>'{state,profileFramesV228,selected}'])::text,'false')='true' then s.save_data#>>'{state,profileFramesV228,selected}' else null end)
 from hub_private.profiles p left join public.user_saves s on s.user_id=p.user_id where p.user_id=u;
$$;

create or replace function hub_private.snapshot(u uuid) returns jsonb language sql stable set search_path='' as $$
 with recent_chat as materialized (
   select c.id,c.user_id,c.message,c.created_at,p.name from hub_private.chat c join hub_private.profiles p on p.user_id=c.user_id
   where not hidden and not hub_private.blocked(u,c.user_id) order by c.id desc limit 60
 )
 select jsonb_build_object('version',256,'user_id',u,'server_time',clock_timestamp(),
 'profile',(select (hub_private.public_profile(u)-'wins'-'losses'-'ties')||(to_jsonb(p)-'muted_until') from hub_private.profiles p where user_id=u),
 'available_badges',coalesce((select jsonb_agg(key) from public.user_saves,jsonb_each(coalesce(save_data#>'{state,badges}','{}')) where user_id=u and value not in('false'::jsonb,'null'::jsonb,'0'::jsonb)),'[]'),
 'save_version',(select save_version from public.user_saves where user_id=u),
 'coins',(select round(coalesce((save_data#>>'{state,coins}')::numeric,0)*100) from public.user_saves where user_id=u),
 'inventory',coalesce((select jsonb_agg(value) from public.user_saves, jsonb_each(coalesce(save_data#>'{state,binder}','{}')) where user_id=u and coalesce((value->>'qty')::integer,0)>0),'[]'),
 'escrow',coalesce((select jsonb_agg(card) from (select card from hub_private.listings where seller_id=u and status='active' union all select value from hub_private.rooms,jsonb_array_elements(case when host_id=u then host_offer else guest_offer end) where u in(host_id,guest_id) and kind='trade' and status in('waiting','ready')) c),'[]'),
 'totals',jsonb_build_object('sales',(select count(*) from hub_private.listings where seller_id=u and status='sold'),'trades',(select count(*) from hub_private.rooms where kind='trade' and status='completed' and u in(host_id,guest_id))),
 'listings',coalesce((select jsonb_agg(to_jsonb(l)||jsonb_build_object('seller_name',p.name)) from (select * from hub_private.listings where id in (select id from hub_private.listings where status='active' and not hub_private.blocked(u,seller_id) order by created_at desc,id limit 200) or (seller_id=u and status='active')) l join hub_private.profiles p on p.user_id=l.seller_id),'[]'),
 'rooms',coalesce((select jsonb_agg(hub_private.room_view(r,u)) from (select * from hub_private.rooms where u in(host_id,guest_id) order by created_at desc limit 20) r),'[]'),
 'chat',coalesce((select jsonb_agg(to_jsonb(c) order by c.id desc) from recent_chat c),'[]'),
 -- Send each avatar once, rather than copying a potentially large photo into every message.
 'chat_profiles',coalesce((select jsonb_object_agg(c.user_id,hub_private.public_profile(c.user_id)) from (select distinct user_id from recent_chat) c),'{}'),
 'blocked',coalesce((select jsonb_agg(blocked_id) from hub_private.blocks where user_id=u),'[]'),
 'leaderboard',coalesce((select jsonb_agg(to_jsonb(p)) from (select user_id,name,rp,case when show_record then wins end as wins,case when show_record then losses end as losses,case when show_record then ties end as ties,season_high from hub_private.profiles order by rp desc,user_id limit 50) p),'[]'),
 'activity',coalesce((select jsonb_agg(to_jsonb(a)) from (select kind,detail,created_at,id from hub_private.activity where user_id=u order by id desc limit 60) a),'[]'),
 'sets',coalesce((select jsonb_agg(s) from (select set_id,min(card->>'set') as name,count(*) as cards from hub_private.catalog where enabled group by set_id having count(*)>=10 and hub_private.set_unlocked(u,set_id)) s),'[]'),
 'ranked_sets',coalesce((select jsonb_agg(jsonb_build_object('set_id',x.id,'name',x.name) order by array_position(array['sv04.5','swsh12.5','swsh4.5','sv08','sv03'],x.id)) from hub_private.expansions x where x.id in('sv04.5','swsh12.5','swsh4.5','sv08','sv03') and (select count(*) from hub_private.catalog c where c.set_id=x.id and c.enabled)>=10),'[]'),
 'online',(select count(*) from hub_private.profiles where last_seen>now()-interval '90 seconds'));
$$;

create or replace function hub_private.battle_award_mode(u uuid,cards jsonb,sid text,n integer,ranked boolean) returns void language plpgsql set search_path='' as $$
declare s jsonb; c jsonb; box jsonb; k text; dest text; credits integer; starter integer; paid integer; best jsonb; group_cards jsonb; xp integer:=0; hits integer:=0; history jsonb; chase_names jsonb;
begin
 s:=hub_private.save_state(u);
 if ranked then
   if sid not in('sv04.5','swsh12.5','swsh4.5','sv08','sv03') then raise exception 'RANKED_SET_LOCKED'; end if;
 elsif not hub_private.set_unlocked(u,sid) then raise exception 'SET_LOCKED'; end if;
 credits:=least(n,greatest(0,coalesce((s#>>array['sealedV161','packCredits',sid])::integer,0)));
 starter:=case when coalesce((s#>>'{starterV199,eligible}')::boolean,false) then least(n,greatest(0,coalesce((s#>>'{starterV199,remaining}')::integer,0))) else 0 end;
 credits:=least(n-starter,credits);
 paid:=(n-credits-starter)*800;
 if round(coalesce((s->>'coins')::numeric,0)*100)<paid then raise exception 'INSUFFICIENT_FUNDS'; end if;
 if credits>0 then s:=jsonb_set(s,array['sealedV161','packCredits',sid],to_jsonb((s#>>array['sealedV161','packCredits',sid])::integer-credits)); end if;
 if starter>0 then
 s:=jsonb_set(s,'{starterV199,remaining}',to_jsonb((s#>>'{starterV199,remaining}')::integer-starter));
 s:=jsonb_set(s,'{starterV199,used}',to_jsonb(coalesce((s#>>'{starterV199,used}')::integer,0)+starter)); end if;
 select chases into chase_names from hub_private.expansions where id=sid;
 s:=jsonb_set(s,'{coins}',to_jsonb((round(coalesce((s->>'coins')::numeric,0)*100)-paid)/100));
 for c in select value from jsonb_array_elements(cards) loop
   k:=c->>'id'; dest:=case when (c->>'tier')::integer>=2 then 'binder' else 'bulkV64' end;
   box:=coalesce(s->dest,'{}');
   box:=jsonb_set(box,array[k],c||jsonb_build_object('qty',coalesce((box#>>array[k,'qty'])::integer,0)+1));
   s:=jsonb_set(s,array[dest],box);
   if (c->>'tier')::integer>=3 and s#>array['chaseBadges',sid] is null and exists(select 1 from jsonb_array_elements_text(coalesce(chase_names,'[]')) name where lower(name)=lower(replace(replace(c->>'name','’',chr(39)),'＆','&'))) then
     s:=jsonb_set(s,'{chaseBadges}',coalesce(s->'chaseBadges','{}')||jsonb_build_object(sid,jsonb_build_object('name',c->>'name','time',floor(extract(epoch from now())*1000)::bigint)));
     xp:=xp+40;
   end if;
 end loop;
 s:=jsonb_set(s,'{packs}',to_jsonb(coalesce((s->>'packs')::integer,0)+n));
 history:=coalesce(s->'history','[]');
 for i in 0..n-1 loop
   select jsonb_agg(value) into group_cards from jsonb_array_elements(cards) with ordinality c(value,pos) where pos between i*10+1 and i*10+10;
   select value into best from jsonb_array_elements(group_cards) order by (value->>'tier')::integer desc limit 1;
   xp:=xp+5+(best->>'tier')::integer*3;
   if (best->>'tier')::integer>=2 then hits:=hits+1; end if;
   history:=jsonb_build_array(jsonb_build_object('set',best->>'set','best',best->>'name','rarity',best->>'rarity','time',floor(extract(epoch from now())*1000)::bigint,'source','battle'))||history;
 end loop;
 select jsonb_agg(value) into history from (select value from jsonb_array_elements(history) limit 40) h;
 s:=jsonb_set(s,'{history}',history);
 s:=jsonb_set(s,'{hits}',to_jsonb(coalesce((s->>'hits')::integer,0)+hits));
 s:=jsonb_set(s,'{xp}',to_jsonb(coalesce((s->>'xp')::numeric,0)+xp));
 perform hub_private.write_state(u,s);
 perform hub_private.log(u,'battle_packs',jsonb_build_object('packs',n,'paid',paid,'credits',credits,'starter',starter));
end $$;

create or replace function hub_private.command(action text,payload jsonb,request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r hub_private.rooms; l hub_private.listings; receipt hub_private.requests;
 c jsonb; s jsonb; ids jsonb; offered jsonb; old_offer jsonb; out_result jsonb; mid bigint;
 rid uuid; target uuid; price integer; n integer; v integer; is_host boolean; ready boolean;
 sid text; join_code text; msg text; winner uuid; hscore integer; gscore integer;
begin
 if u is null or not exists(select 1 from auth.users where id=u) then raise exception 'AUTH_REQUIRED'; end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>16384 then raise exception 'INVALID_PAYLOAD'; end if;
 insert into hub_private.profiles(user_id) values(u) on conflict do nothing;
 if action='snapshot' then return hub_private.snapshot(u); end if;
 if request_id is null then raise exception 'REQUEST_REQUIRED'; end if;
 perform pg_advisory_xact_lock(256,1);
 select * into receipt from hub_private.requests q where q.user_id=u and q.request_id=command.request_id;
 if found then
   if receipt.action<>action or receipt.payload<>payload then raise exception 'REQUEST_REUSED'; end if;
   return hub_private.snapshot(u)||receipt.result;
 end if;
 -- Bound abuse without preventing recovery of a previously successful request.
 if (select count(*) from hub_private.requests where user_id=u and created_at>now()-interval '1 minute')>=90 then raise exception 'RATE_LIMIT'; end if;
 update hub_private.profiles set last_seen=now() where user_id=u;
 -- Lazily expire rooms while preserving every escrowed card. A started battle cannot
 -- be discarded to dodge an unfavorable pack: abandonment is recorded as a result.
 for r in select * from hub_private.rooms where action='heartbeat' and expires_at<now() and status in('waiting','ready','playing') and (u in(host_id,guest_id) or (ranked and status='waiting')) for update loop
   if r.status='playing' then
     winner:=case when r.host_progress>r.guest_progress then r.host_id when r.guest_progress>r.host_progress then r.guest_id else null end;
     perform hub_private.finish_battle(r.id,winner,case when winner is null then 'abandoned' else 'timeout' end);
   else perform hub_private.close_room(r.id,'expired'); end if;
 end loop;
 if action in ('listing_create','trade_offer','room_ready') then
   select save_version into v from public.user_saves where user_id=u for update;
   if v is null then raise exception 'SAVE_REQUIRED'; end if;
   if payload->>'save_version' is null or v<>(payload->>'save_version')::integer then raise exception 'SAVE_CONFLICT'; end if;
 end if;

 if action='heartbeat' then
   update hub_private.rooms set expires_at=now()+interval '60 seconds' where host_id=u and ranked and status='waiting';
 elsif action='profile' then
   msg:=btrim(payload->>'name');
   if msg is null or char_length(msg) not between 2 and 24 or msg~'[[:cntrl:]<>]' then raise exception 'INVALID_NAME'; end if;
   if coalesce(payload->>'style','aurora') not in('aurora','obsidian','gold','neon','crystal','ember') then raise exception 'INVALID_STYLE'; end if;
   update hub_private.profiles set name=msg,title=left(coalesce(nullif(btrim(payload->>'title'),''),'Collector'),28),style=coalesce(payload->>'style','aurora'),show_record=coalesce((payload->>'show_record')::boolean,true) where user_id=u;
   if payload ? 'badges' then
     ids:=payload->'badges';
     if jsonb_typeof(ids)<>'array' or jsonb_array_length(ids)>3 then raise exception 'INVALID_BADGES'; end if;
     s:=hub_private.save_state(u);
     if exists(select 1 from jsonb_array_elements_text(ids) id where coalesce(s#>array['badges',id],'false') in('false'::jsonb,'null'::jsonb,'0'::jsonb)) then raise exception 'BADGE_NOT_EARNED'; end if;
     update hub_private.profiles set badges=ids where user_id=u;
   end if;
   if payload ? 'trackers' then
     ids:=payload->'trackers';
     if jsonb_typeof(ids) is distinct from 'array' then raise exception 'INVALID_TRACKERS'; end if;
     if jsonb_array_length(ids)>3 or exists(select 1 from jsonb_array_elements(ids) id where jsonb_typeof(id)<>'string' or id#>>'{}' not in('wins','losses','ties','season_high','streak'))
       or (select count(distinct value) from jsonb_array_elements_text(ids))<>jsonb_array_length(ids) then raise exception 'INVALID_TRACKERS'; end if;
     update hub_private.profiles set trackers=ids where user_id=u;
   end if;
 elsif action='listing_create' then
   price:=hub_private.integer_value(payload->'price',10,100000000);
   if (select count(*) from hub_private.listings where seller_id=u and status='active')>=30 then raise exception 'LISTING_LIMIT'; end if;
   s:=hub_private.save_state(u); c:=s#>array['binder',payload->>'card_id'];
   if c is null or coalesce((c->>'qty')::integer,0)<1 then raise exception 'CARD_NOT_OWNED'; end if;
   c:=hub_private.safe_card(c); perform hub_private.card_change(u,c,-1);
   insert into hub_private.listings(seller_id,card,price) values(u,c,price) returning id into rid;
   perform hub_private.log(u,'listed',jsonb_build_object('listing',rid,'name',c->>'name','price',price));
 elsif action in('listing_buy','listing_cancel') then
   select * into l from hub_private.listings where id=(payload->>'id')::uuid for update;
   if not found then raise exception 'LISTING_CLOSED'; end if;
   if l.status<>'active' then raise exception 'LISTING_CLOSED'; end if;
   if action='listing_buy' then
     if l.seller_id=u then raise exception 'OWN_LISTING'; end if;
     if hub_private.blocked(u,l.seller_id) then raise exception 'BLOCKED'; end if;
     if hub_private.integer_value(payload->'price',10,100000000)<>l.price then raise exception 'PRICE_CHANGED'; end if;
     perform 1 from public.user_saves where user_id in(u,l.seller_id) order by user_id for update;
     perform hub_private.cash_change(u,-l.price); perform hub_private.cash_change(l.seller_id,l.price); perform hub_private.card_change(u,l.card,1);
     update hub_private.listings set status='sold',buyer_id=u,finished_at=now() where id=l.id;
     perform hub_private.log(u,'bought',jsonb_build_object('listing',l.id,'name',l.card->>'name','price',l.price));
     perform hub_private.log(l.seller_id,'sold',jsonb_build_object('listing',l.id,'name',l.card->>'name','price',l.price));
   else
     if l.seller_id<>u then raise exception 'NOT_OWNER'; end if;
     perform hub_private.card_change(u,l.card,1);
     update hub_private.listings set status='cancelled',finished_at=now() where id=l.id;
     perform hub_private.log(u,'listing_returned',jsonb_build_object('name',l.card->>'name'));
   end if;
 elsif action in('room_create','queue_join','room_join') then
   if exists(select 1 from hub_private.rooms where u in(host_id,guest_id) and status in('waiting','ready','playing')) then raise exception 'ACTIVE_ROOM'; end if;
   if action='room_join' then
     join_code:=upper(btrim(payload->>'code'));
     if join_code is null or join_code!~'^[A-F0-9]{8}$' then raise exception 'ROOM_NOT_FOUND'; end if;
     select * into r from hub_private.rooms where rooms.code=join_code and not ranked and status='waiting' and guest_id is null and host_id<>u and expires_at>now() for update;
     if not found then raise exception 'ROOM_NOT_FOUND'; end if;
     if hub_private.blocked(u,r.host_id) then raise exception 'BLOCKED'; end if;
     update hub_private.rooms set guest_id=u,status='ready',revision=revision+1 where id=r.id returning id into rid;
   else
     sid:=coalesce(payload->>'set_id','sv04.5');
     if action='queue_join' then
       select x.id into sid from hub_private.expansions x
       where x.id in('sv04.5','swsh12.5','swsh4.5','sv08','sv03')
       and (select count(*) from hub_private.catalog c where c.set_id=x.id and c.enabled)>=10
       order by random() limit 1;
       if sid is null then raise exception 'CATALOG_UNAVAILABLE'; end if;
     end if;
     if action='queue_join' or payload->>'kind'='battle' then
       if action<>'queue_join' and not hub_private.set_unlocked(u,sid) then raise exception 'SET_LOCKED'; end if;
       if (select count(*) from hub_private.catalog where set_id=sid and enabled)<10 then raise exception 'CATALOG_UNAVAILABLE'; end if;
     elsif payload->>'kind' is distinct from 'trade' then raise exception 'INVALID_ROOM'; end if;
     if action='queue_join' then
       -- Widen the RP band with wait time; never match a player with themselves.
       select q.* into r from hub_private.rooms q join hub_private.profiles h on h.user_id=q.host_id join hub_private.profiles me on me.user_id=u
       where q.ranked and q.status='waiting' and q.guest_id is null and q.host_id<>u and q.expires_at>now()
       and abs(h.rp-me.rp)<=least(2000,150+floor(extract(epoch from now()-q.created_at)/10)*100)
       and not hub_private.blocked(u,q.host_id) order by q.created_at,q.id limit 1 for update of q;
       if found then
         update hub_private.rooms set guest_id=u,guest_set=r.host_set,status='ready',expires_at=now()+interval '2 minutes',revision=revision+1 where id=r.id returning id into rid;
       end if;
     end if;
     if rid is null then
       n:=case when action='queue_join' then 1 else hub_private.integer_value(coalesce(payload->'pack_count','1'),1,3) end;
       if n not in(1,3) then raise exception 'INVALID_PACK_COUNT'; end if;
       insert into hub_private.rooms(kind,ranked,host_id,host_set,guest_set,pack_count,expires_at)
       values(case when action='queue_join' then 'battle' else payload->>'kind' end,action='queue_join',u,sid,sid,n,now()+case when action='queue_join' then interval '60 seconds' else interval '30 minutes' end) returning id into rid;
     end if;
   end if;
 elsif action in('trade_offer','room_ready','battle_set','battle_reveal','room_cancel') then
   select * into r from hub_private.rooms where id=(payload->>'id')::uuid for update;
   if not found or not (u=r.host_id or u=coalesce(r.guest_id,r.host_id)) then raise exception 'ROOM_NOT_FOUND'; end if;
   if r.status in('completed','cancelled','expired') then raise exception 'ROOM_CLOSED'; end if;
   if r.expires_at<now() and action<>'room_cancel' then raise exception 'ROOM_EXPIRED'; end if;
   is_host:=r.host_id=u; rid:=r.id;
   if action='room_cancel' then
     if r.status='playing' then perform hub_private.finish_battle(r.id,case when is_host then r.guest_id else r.host_id end,'forfeit');
     else perform hub_private.close_room(r.id,'cancelled'); end if;
   elsif action='trade_offer' then
     if r.kind<>'trade' or r.status not in('waiting','ready') then raise exception 'ROOM_CLOSED'; end if;
     if hub_private.integer_value(payload->'revision',0,2147483647)<>r.revision then raise exception 'OFFER_CHANGED'; end if;
     ids:=payload->'cards';
     if ids is null or jsonb_typeof(ids)<>'array' or jsonb_array_length(ids)>6 then raise exception 'MAX_SIX_CARDS'; end if;
     if exists(select 1 from jsonb_array_elements(ids) x where jsonb_typeof(x)<>'string') or (select count(distinct value) from jsonb_array_elements_text(ids))<>jsonb_array_length(ids) then raise exception 'INVALID_CARDS'; end if;
     old_offer:=case when is_host then r.host_offer else r.guest_offer end;
     for c in select value from jsonb_array_elements(old_offer) loop perform hub_private.card_change(u,c,1); end loop;
     offered:='[]';
     for msg in select value from jsonb_array_elements_text(ids) loop
       s:=hub_private.save_state(u); c:=s#>array['binder',msg];
       if c is null or coalesce((c->>'qty')::integer,0)<1 then raise exception 'CARD_NOT_OWNED'; end if;
       c:=hub_private.safe_card(c); perform hub_private.card_change(u,c,-1); offered:=offered||jsonb_build_array(c);
     end loop;
     if is_host then update hub_private.rooms set host_offer=offered where id=r.id;
     else update hub_private.rooms set guest_offer=offered where id=r.id; end if;
     update hub_private.rooms set host_ready=false,guest_ready=false,revision=revision+1 where id=r.id;
   elsif action='battle_set' then
     if r.kind<>'battle' or r.status not in('waiting','ready') then raise exception 'ROOM_CLOSED'; end if;
     if (case when is_host then r.host_ready else r.guest_ready end) then raise exception 'UNREADY_FIRST'; end if;
     sid:=payload->>'set_id';
     if r.ranked and sid is distinct from r.host_set then raise exception 'RANKED_SET_LOCKED'; end if;
     if not r.ranked and not hub_private.set_unlocked(u,sid) then raise exception 'SET_LOCKED'; end if;
     if (select count(*) from hub_private.catalog where set_id=sid and enabled)<10 then raise exception 'CATALOG_UNAVAILABLE'; end if;
     if is_host then update hub_private.rooms set host_set=sid,revision=revision+1 where id=r.id;
     else update hub_private.rooms set guest_set=sid,revision=revision+1 where id=r.id; end if;
     update hub_private.rooms set host_ready=false,guest_ready=false where id=r.id;
   elsif action='room_ready' then
     if r.status<>'ready' or r.guest_id is null then raise exception 'BOTH_READY_REQUIRED'; end if;
     if hub_private.integer_value(payload->'revision',0,2147483647)<>r.revision then raise exception 'OFFER_CHANGED'; end if;
     if jsonb_typeof(payload->'ready') is distinct from 'boolean' then raise exception 'INVALID_READY'; end if;
     ready:=(payload->>'ready')::boolean;
     if r.kind='trade' and ready and (jsonb_array_length(r.host_offer)=0 or jsonb_array_length(r.guest_offer)=0) then raise exception 'BOTH_OFFERS_REQUIRED'; end if;
     if is_host then update hub_private.rooms set host_ready=ready,revision=revision+1 where id=r.id;
     else update hub_private.rooms set guest_ready=ready,revision=revision+1 where id=r.id; end if;
     select * into r from hub_private.rooms where id=rid;
     if r.host_ready and r.guest_ready then
       perform 1 from public.user_saves where user_id in(r.host_id,r.guest_id) order by user_id for update;
       if r.kind='trade' then
         for c in select value from jsonb_array_elements(r.host_offer) loop perform hub_private.card_change(r.guest_id,c,1); end loop;
         for c in select value from jsonb_array_elements(r.guest_offer) loop perform hub_private.card_change(r.host_id,c,1); end loop;
         update hub_private.rooms set status='completed',completed_at=now(),revision=revision+1 where id=r.id;
         perform hub_private.log(r.host_id,'trade_complete',jsonb_build_object('room',r.id,'received',jsonb_array_length(r.guest_offer)));
         perform hub_private.log(r.guest_id,'trade_complete',jsonb_build_object('room',r.id,'received',jsonb_array_length(r.host_offer)));
       else
         r.host_cards:=hub_private.make_pack(r.host_set,r.pack_count); r.guest_cards:=hub_private.make_pack(r.guest_set,r.pack_count);
         perform hub_private.battle_award_mode(r.host_id,r.host_cards,r.host_set,r.pack_count,r.ranked);
         perform hub_private.battle_award_mode(r.guest_id,r.guest_cards,r.guest_set,r.pack_count,r.ranked);
         update hub_private.rooms set host_cards=r.host_cards,guest_cards=r.guest_cards,status='playing',expires_at=now()+interval '10 minutes',revision=revision+1 where id=r.id;
       end if;
     end if;
   else
     if r.kind<>'battle' or r.status<>'playing' then raise exception 'BOTH_READY_REQUIRED'; end if;
     n:=hub_private.integer_value(payload->'progress',1,r.pack_count*10);
     v:=case when is_host then r.host_progress else r.guest_progress end;
     if n>v+1 then raise exception 'REVEAL_IN_ORDER'; end if;
     if n>v then
       if is_host then update hub_private.rooms set host_progress=n,revision=revision+1 where id=r.id;
       else update hub_private.rooms set guest_progress=n,revision=revision+1 where id=r.id; end if;
     end if;
     select * into r from hub_private.rooms where id=rid;
     if r.host_progress=r.pack_count*10 and r.guest_progress=r.pack_count*10 then
       hscore:=hub_private.score(r.host_cards); gscore:=hub_private.score(r.guest_cards);
       winner:=case when hscore>gscore then r.host_id when gscore>hscore then r.guest_id else null end;
       perform hub_private.finish_battle(r.id,winner,'revealed');
     end if;
   end if;
 elsif action='chat_send' then
   msg:=btrim(payload->>'message');
   if msg is null or char_length(msg) not between 1 and 180 or msg~'[[:cntrl:]]' then raise exception 'INVALID_MESSAGE'; end if;
   if exists(select 1 from hub_private.profiles where user_id=u and muted_until>now()) then raise exception 'CHAT_MUTED'; end if;
   if exists(select 1 from hub_private.chat where user_id=u and created_at>now()-interval '2 seconds') or (select count(*) from hub_private.chat where user_id=u and created_at>now()-interval '1 minute')>=15 then raise exception 'CHAT_RATE_LIMIT'; end if;
   insert into hub_private.chat(user_id,message) values(u,msg) returning id into mid;
 elsif action='chat_report' then
   mid:=(payload->>'id')::bigint; msg:=btrim(payload->>'reason');
   if msg is null or char_length(msg) not between 3 and 300 or not exists(select 1 from hub_private.chat where id=mid and user_id<>u) then raise exception 'INVALID_REPORT'; end if;
   insert into hub_private.reports(user_id,message_id,reason) values(u,mid,msg) on conflict do nothing;
 elsif action in('block','unblock') then
   target:=(payload->>'user_id')::uuid;
   if target is null or target=u then raise exception 'INVALID_PLAYER'; end if;
   if action='block' then insert into hub_private.blocks values(u,target) on conflict do nothing;
   else delete from hub_private.blocks where user_id=u and blocked_id=target; end if;
 else raise exception 'UNKNOWN_ACTION'; end if;
 update public.hub_signals set revision=revision+1 where topic='hub';
 out_result:=hub_private.snapshot(u)||jsonb_build_object('request_id',request_id,'room_id',rid);
 insert into hub_private.requests(user_id,request_id,action,payload,result) values(u,request_id,action,payload,jsonb_build_object('request_id',request_id,'room_id',rid));
 return out_result;
end $$;

revoke all on function hub_private.battle_award_mode(uuid,jsonb,text,integer,boolean) from public,anon,authenticated;
