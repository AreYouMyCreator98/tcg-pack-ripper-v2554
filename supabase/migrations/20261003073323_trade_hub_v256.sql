-- Trade Hub V256. Additive schema; no player saves, legacy rooms or listings are deleted.
-- Install before serving V256. All online mutations go through one authenticated command.
create schema if not exists hub_private;
revoke all on schema hub_private from public, anon;
grant usage on schema hub_private to authenticated;

create table hub_private.profiles (
  user_id uuid primary key references auth.users(id), name text not null default 'Collector',
  rp integer not null default 0 check(rp>=0), wins integer not null default 0,
  losses integer not null default 0, ties integer not null default 0,
  streak integer not null default 0, season_high integer not null default 0,
  title text not null default 'Collector', style text not null default 'aurora',
  show_record boolean not null default true, badges jsonb not null default '[]', last_seen timestamptz not null default now(),
  muted_until timestamptz, created_at timestamptz not null default now()
);
-- Preserve the deployed ranked ladder at cutover, then stop trusting legacy rank writes.
insert into hub_private.profiles(user_id,name,rp,wins,losses,ties,streak,season_high)
select user_id,display_name,greatest(0,ranked_rp::integer),ranked_wins,ranked_losses,
ranked_ties,ranked_streak,greatest(0,ranked_season_high::integer) from public.mp_profiles
on conflict do nothing;
update hub_private.profiles p set title=coalesce(to_jsonb(old)->>'banner_title','Collector'),
 style=case when to_jsonb(old)->>'banner_style' in('aurora','obsidian','gold','neon','crystal','ember') then to_jsonb(old)->>'banner_style' else 'aurora' end,
 show_record=coalesce((to_jsonb(old)->>'banner_show_record')::boolean,true),
 badges=case when jsonb_typeof(to_jsonb(old)->'banner_badges')='array' then to_jsonb(old)->'banner_badges' else '[]'::jsonb end
from public.mp_profiles old where old.user_id=p.user_id;

create table hub_private.listings (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references auth.users(id),
 buyer_id uuid references auth.users(id), card jsonb not null, price integer not null check(price between 10 and 100000000),
 status text not null default 'active' check(status in ('active','sold','cancelled')),
 created_at timestamptz not null default now(), finished_at timestamptz
);
create index hub_listings_active on hub_private.listings(created_at desc,id) where status='active';
create index hub_listings_seller on hub_private.listings(seller_id,created_at desc);
create index hub_listings_buyer on hub_private.listings(buyer_id) where buyer_id is not null;
create table hub_private.rooms (
 id uuid primary key default gen_random_uuid(), code text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
 kind text not null check(kind in ('trade','battle')), ranked boolean not null default false,
 host_id uuid not null references auth.users(id), guest_id uuid references auth.users(id),
 status text not null default 'waiting' check(status in ('waiting','ready','playing','completed','cancelled','expired')),
 revision integer not null default 0, host_ready boolean not null default false, guest_ready boolean not null default false,
 host_offer jsonb not null default '[]', guest_offer jsonb not null default '[]',
 host_set text not null default 'sv04.5', guest_set text not null default 'sv04.5', pack_count integer not null default 1 check(pack_count in(1,3)),
 host_cards jsonb not null default '[]', guest_cards jsonb not null default '[]',
 host_progress integer not null default 0, guest_progress integer not null default 0,
 host_score integer, guest_score integer, host_delta integer, guest_delta integer,
 winner_id uuid references auth.users(id), reason text, created_at timestamptz not null default now(),
 expires_at timestamptz not null default(now()+interval '30 minutes'), completed_at timestamptz,
 check(guest_id is null or guest_id<>host_id)
);
create index hub_rooms_host on hub_private.rooms(host_id,created_at desc);
create index hub_rooms_guest on hub_private.rooms(guest_id,created_at desc);
create index hub_rooms_queue on hub_private.rooms(created_at) where ranked and status='waiting';
create table hub_private.expansions(id text primary key,name text not null,requirements jsonb not null default '{"xp":0}',chases jsonb not null default '[]');
create table hub_private.catalog (
 id text primary key, set_id text not null, card jsonb not null,
 tier integer not null check(tier between 0 and 5), enabled boolean not null default true
);
create index hub_catalog_set_tier on hub_private.catalog(set_id,tier) where enabled;
create table hub_private.chat (
 id bigint generated always as identity primary key, user_id uuid not null references auth.users(id),
 message text not null check(char_length(message) between 1 and 180), created_at timestamptz not null default now(), hidden boolean not null default false
);
create index hub_chat_user_time on hub_private.chat(user_id,created_at desc);
create table hub_private.blocks(user_id uuid references auth.users(id),blocked_id uuid references auth.users(id),primary key(user_id,blocked_id),check(user_id<>blocked_id));
create index hub_blocks_target on hub_private.blocks(blocked_id);
create table hub_private.reports(user_id uuid references auth.users(id),message_id bigint references hub_private.chat(id),reason text not null,created_at timestamptz not null default now(),primary key(user_id,message_id));
create index hub_reports_message on hub_private.reports(message_id);
create table hub_private.requests(user_id uuid references auth.users(id),request_id uuid not null,action text not null,payload jsonb not null,result jsonb not null,created_at timestamptz not null default now(),primary key(user_id,request_id));
create table hub_private.activity(id bigint generated always as identity primary key,user_id uuid not null references auth.users(id),kind text not null,detail jsonb not null,created_at timestamptz not null default now());
create index hub_activity_user on hub_private.activity(user_id,id desc);
create index hub_profiles_rank on hub_private.profiles(rp desc,user_id);
create table public.hub_signals(topic text primary key,revision bigint not null default 0);
insert into public.hub_signals(topic) values('hub');
alter table public.hub_signals enable row level security;
create policy hub_signal_read on public.hub_signals for select to authenticated using(true);
grant select on public.hub_signals to authenticated;
revoke all on public.hub_signals from anon;
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
   alter publication supabase_realtime add table public.hub_signals;
 end if;
end $$;

create function hub_private.integer_value(v jsonb,lo integer,hi integer) returns integer
language plpgsql immutable set search_path='' as $$
declare n numeric;
begin
 if v is null or jsonb_typeof(v)<>'number' then raise exception 'INVALID_NUMBER'; end if;
 n:=v::text::numeric;
 if n<>trunc(n) or n<lo or n>hi then raise exception 'INVALID_NUMBER'; end if;
 return n::integer;
end $$;

create function hub_private.save_state(u uuid) returns jsonb language plpgsql set search_path='' as $$
declare s jsonb;
begin
 select save_data->'state' into s from public.user_saves where user_id=u for update;
 if s is null or jsonb_typeof(s)<>'object' then raise exception 'SAVE_REQUIRED'; end if;
 return s;
end $$;
create function hub_private.write_state(u uuid,s jsonb) returns void language sql set search_path='' as $$
 update public.user_saves set save_data=jsonb_set(jsonb_set(save_data,'{state}',s),'{saved_at}',to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint)),save_version=save_version+1,updated_at=clock_timestamp() where user_id=u;
$$;
-- Cards cross into older collection renderers as well as the escaped Hub UI.
-- Keep only known metadata and neutralize markup before transferring ownership.
create function hub_private.safe_card(c jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare out_card jsonb:='{}'; k text; v text; n numeric; condition jsonb:='{}'; history jsonb:='[]'; item jsonb;
begin
 if coalesce(c->>'id','')!~'^[A-Za-z0-9._-]{1,120}$' or c->>'id' in('__proto__','constructor','prototype') then raise exception 'INVALID_CARD'; end if;
 out_card:=jsonb_build_object('id',c->>'id','qty',1,'secret',coalesce(c->'secret'='true'::jsonb,false));
 foreach k in array array['name','set','setId','number','rarity','finish'] loop
   v:=left(regexp_replace(coalesce(c->>k,''),'[[:cntrl:]]',' ','g'),120);
   out_card:=out_card||jsonb_build_object(k,translate(v,'<>&'||chr(34)||chr(39)||chr(96),'‹›＆”’ˋ'));
 end loop;
 foreach k in array array['img','thumb'] loop
   v:=coalesce(c->>k,'');
   out_card:=out_card||jsonb_build_object(k,case when v~'^https://[A-Za-z0-9.-]+/[A-Za-z0-9_./%?=+&-]+$' and length(v)<2048 then v else '' end);
 end loop;
 n:=case when jsonb_typeof(c->'market')='number' then (c->>'market')::numeric else 0.1 end;
 out_card:=out_card||jsonb_build_object('market',greatest(0.1,least(1000000,n)));
 if jsonb_typeof(c->'tier')='number' then out_card:=out_card||jsonb_build_object('tier',greatest(0,least(5,(c->>'tier')::integer))); end if;
 foreach k in array array['centering','corners','edges','surface'] loop
   if jsonb_typeof(c#>array['conditionV161',k])='number' then condition:=condition||jsonb_build_object(k,greatest(0,least(100,(c#>>array['conditionV161',k])::numeric))); end if;
 end loop;
 if condition<>'{}'::jsonb then out_card:=out_card||jsonb_build_object('conditionV161',condition); end if;
 if jsonb_typeof(c->'historyV161')='array' then
   for item in select value from jsonb_array_elements(c->'historyV161') limit 20 loop
     if jsonb_typeof(item->'time')='number' then
       history:=history||jsonb_build_array(jsonb_build_object('time',greatest(0,least(9000000000000000,(item->>'time')::numeric)),'label',translate(left(coalesce(item->>'label','Collection transfer'),120),'<>&'||chr(34)||chr(39)||chr(96),'‹›＆”’ˋ')));
     end if;
   end loop;
   out_card:=out_card||jsonb_build_object('historyV161',history);
 end if;
 return out_card;
end $$;
create function hub_private.card_change(u uuid,c jsonb,delta integer) returns void language plpgsql set search_path='' as $$
declare s jsonb; box jsonb; old jsonb; n integer; k text:=c->>'id';
begin
 if k is null or length(k)>120 or k in ('__proto__','constructor','prototype') then raise exception 'INVALID_CARD'; end if;
 s:=hub_private.save_state(u); box:=coalesce(s->'binder','{}'); old:=box->k;
 n:=coalesce((old->>'qty')::integer,0)+delta;
 if n<0 then raise exception 'CARD_NOT_OWNED'; end if;
 if n=0 then box:=box-k;
 else box:=jsonb_set(box,array[k],jsonb_set(coalesce(old,c),'{qty}',to_jsonb(n))); end if;
 s:=jsonb_set(s,'{binder}',box); perform hub_private.write_state(u,s);
end $$;
create function hub_private.cash_change(u uuid,delta integer) returns void language plpgsql set search_path='' as $$
declare s jsonb; n numeric;
begin
 s:=hub_private.save_state(u); n:=round(coalesce((s->>'coins')::numeric,0)*100)+delta;
 if n<0 then raise exception 'INSUFFICIENT_FUNDS'; end if;
 if n>100000000000 or n='NaN'::numeric then raise exception 'INVALID_BALANCE'; end if;
 perform hub_private.write_state(u,jsonb_set(s,'{coins}',to_jsonb(n/100)));
end $$;
create function hub_private.log(u uuid,k text,d jsonb) returns void language sql set search_path='' as $$
 insert into hub_private.activity(user_id,kind,detail) values(u,k,d);
$$;
create function hub_private.blocked(a uuid,b uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from hub_private.blocks where (user_id=a and blocked_id=b) or (user_id=b and blocked_id=a));
$$;

create function hub_private.set_unlocked(u uuid,sid text) returns boolean language plpgsql stable set search_path='' as $$
declare s jsonb; req jsonb; h jsonb; badge text;
begin
 select requirements into req from hub_private.expansions where id=sid;
 if req is null then return false; end if;
 select save_data->'state' into s from public.user_saves where user_id=u;
 if coalesce((s->>'xp')::numeric,0)<coalesce((req->>'xp')::numeric,0) then return false; end if;
 for badge in select jsonb_array_elements_text(coalesce(req->'badges','[]')) loop
   if coalesce(s#>array['badges',badge],'false') in('false'::jsonb,'null'::jsonb,'0'::jsonb) then return false; end if;
 end loop;
 for h in select value from jsonb_array_elements(coalesce(req->'hits','[]')) loop
   if lower(replace(coalesce(s#>>array['chaseBadges',h->>'setId','name'],''),'’',chr(39)))=lower(h->>'card') then continue; end if;
   if not exists(select 1 from (
      select value as card from jsonb_each(coalesce(s->'binder','{}')) where coalesce((value->>'qty')::integer,0)>0
      union all select card from hub_private.listings where seller_id=u and status='active'
      union all select value from hub_private.rooms,jsonb_array_elements(case when host_id=u then host_offer else guest_offer end) where u in(host_id,guest_id) and kind='trade' and status in('waiting','ready')
   ) owned where lower(replace(card->>'name','’',chr(39)))=lower(h->>'card') and (card->>'setId'=h->>'setId' or card->>'set'=(select name from hub_private.expansions where id=h->>'setId'))) then return false; end if;
 end loop;
 return true;
end $$;
create function hub_private.public_profile(u uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('user_id',p.user_id,'name',p.name,'rp',p.rp,'title',p.title,'style',p.style,'badges',p.badges,'show_record',p.show_record,
 'wins',case when p.show_record then p.wins end,'losses',case when p.show_record then p.losses end,'ties',case when p.show_record then p.ties end,
 'avatar',case when length(s.save_data#>>'{state,profileV227,avatarData}')<200000 and s.save_data#>>'{state,profileV227,avatarData}' ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$' then s.save_data#>>'{state,profileV227,avatarData}' else '' end,
 'frame',case when s.save_data#>>'{state,profileFramesV228,selected}' in('rookie','bronze','silver','gold','platinum','diamond','master','apex') and coalesce((s.save_data#>array['state','profileFramesV228','owned',s.save_data#>>'{state,profileFramesV228,selected}'])::text,'false')='true' then s.save_data#>>'{state,profileFramesV228,selected}' else null end)
 from hub_private.profiles p left join public.user_saves s on s.user_id=p.user_id where p.user_id=u;
$$;
create function hub_private.room_view(r hub_private.rooms,u uuid) returns jsonb language sql stable set search_path='' as $$
 select (to_jsonb(r)-'host_cards'-'guest_cards'-'host_score'-'guest_score'-'host_set'-'guest_set') || jsonb_build_object(
 'host_name',(select name from hub_private.profiles where user_id=r.host_id),
 'guest_name',(select name from hub_private.profiles where user_id=r.guest_id),
 'host_profile',case when r.status in('waiting','ready','playing') then hub_private.public_profile(r.host_id) else hub_private.public_profile(r.host_id)-'avatar' end,'guest_profile',case when r.status in('waiting','ready','playing') then hub_private.public_profile(r.guest_id) else hub_private.public_profile(r.guest_id)-'avatar' end,
 'my_set',case when r.host_id=u then r.host_set else r.guest_set end,
 'my_cards',case when r.host_id=u then r.host_cards else r.guest_cards end,
 'opponent_cards',case when r.status='completed' then case when r.host_id=u then r.guest_cards else r.host_cards end else '[]'::jsonb end,
 'host_score',case when r.status='completed' then r.host_score end,
 'guest_score',case when r.status='completed' then r.guest_score end,
 'opponent_set',case when r.status='completed' then case when r.host_id=u then r.guest_set else r.host_set end end);
$$;
create function hub_private.snapshot(u uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('version',256,'user_id',u,'server_time',clock_timestamp(),
 'profile',(select to_jsonb(p)-'muted_until' from hub_private.profiles p where user_id=u),
 'available_badges',coalesce((select jsonb_agg(key) from public.user_saves,jsonb_each(coalesce(save_data#>'{state,badges}','{}')) where user_id=u and value not in('false'::jsonb,'null'::jsonb,'0'::jsonb)),'[]'),
 'save_version',(select save_version from public.user_saves where user_id=u),
 'coins',(select round(coalesce((save_data#>>'{state,coins}')::numeric,0)*100) from public.user_saves where user_id=u),
 'inventory',coalesce((select jsonb_agg(value) from public.user_saves, jsonb_each(coalesce(save_data#>'{state,binder}','{}')) where user_id=u and coalesce((value->>'qty')::integer,0)>0),'[]'),
 'escrow',coalesce((select jsonb_agg(card) from (select card from hub_private.listings where seller_id=u and status='active' union all select value from hub_private.rooms,jsonb_array_elements(case when host_id=u then host_offer else guest_offer end) where u in(host_id,guest_id) and kind='trade' and status in('waiting','ready')) c),'[]'),
 'totals',jsonb_build_object('sales',(select count(*) from hub_private.listings where seller_id=u and status='sold'),'trades',(select count(*) from hub_private.rooms where kind='trade' and status='completed' and u in(host_id,guest_id))),
 'listings',coalesce((select jsonb_agg(to_jsonb(l)||jsonb_build_object('seller_name',p.name)) from (select * from hub_private.listings where id in (select id from hub_private.listings where status='active' and not hub_private.blocked(u,seller_id) order by created_at desc,id limit 200) or (seller_id=u and status='active')) l join hub_private.profiles p on p.user_id=l.seller_id),'[]'),
 'rooms',coalesce((select jsonb_agg(hub_private.room_view(r,u)) from (select * from hub_private.rooms where u in(host_id,guest_id) order by created_at desc limit 20) r),'[]'),
 'chat',coalesce((select jsonb_agg(to_jsonb(c)) from (select c.id,c.user_id,c.message,c.created_at,p.name from hub_private.chat c join hub_private.profiles p on p.user_id=c.user_id where not hidden and not hub_private.blocked(u,c.user_id) order by c.id desc limit 60) c),'[]'),
 'blocked',coalesce((select jsonb_agg(blocked_id) from hub_private.blocks where user_id=u),'[]'),
 'leaderboard',coalesce((select jsonb_agg(to_jsonb(p)) from (select user_id,name,rp,case when show_record then wins end as wins,case when show_record then losses end as losses,case when show_record then ties end as ties,season_high from hub_private.profiles order by rp desc,user_id limit 50) p),'[]'),
 'activity',coalesce((select jsonb_agg(to_jsonb(a)) from (select kind,detail,created_at,id from hub_private.activity where user_id=u order by id desc limit 60) a),'[]'),
 'sets',coalesce((select jsonb_agg(s) from (select set_id,min(card->>'set') as name,count(*) as cards from hub_private.catalog where enabled group by set_id having count(*)>=10 and hub_private.set_unlocked(u,set_id)) s),'[]'),
 'online',(select count(*) from hub_private.profiles where last_seen>now()-interval '90 seconds'));
$$;

create function hub_private.make_pack(s text,n integer) returns jsonb language plpgsql set search_path='' as $$
declare out_cards jsonb:='[]'; c jsonb; target integer; roll double precision;
begin
 if (select count(*) from hub_private.catalog where enabled and set_id=s)<10 then raise exception 'CATALOG_UNAVAILABLE'; end if;
 for i in 1..(10*n) loop
   roll:=random();
   target:=case when i%10 between 1 and 7 then 0 when i%10 in(8,9) then 1 when roll<0.005 then 5 when roll<0.03 then 4 when roll<0.12 then 3 when roll<0.35 then 2 else 1 end;
   select hub_private.safe_card(card)||jsonb_build_object('tier',tier) into c from hub_private.catalog where enabled and set_id=s order by abs(tier-target),random() limit 1;
   out_cards:=out_cards||jsonb_build_array(c);
 end loop;
 return out_cards;
end $$;
create function hub_private.battle_award(u uuid,cards jsonb,sid text,n integer) returns void language plpgsql set search_path='' as $$
declare s jsonb; c jsonb; box jsonb; k text; dest text; credits integer; starter integer; paid integer; best jsonb; group_cards jsonb; xp integer:=0; hits integer:=0; history jsonb; chase_names jsonb;
begin
 s:=hub_private.save_state(u);
 if not hub_private.set_unlocked(u,sid) then raise exception 'SET_LOCKED'; end if;
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
-- Commands serialize against other hub commands. Save rows are additionally locked in
-- UUID order to coordinate with the game's existing optimistic cloud-save writer.
-- This favors correctness for a small community; partition locks before large-scale use.
create function hub_private.command(action text,payload jsonb,request_id uuid) returns jsonb
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
     if action='queue_join' then sid:='sv04.5'; end if;
     if action='queue_join' or payload->>'kind'='battle' then
       if not hub_private.set_unlocked(u,sid) then raise exception 'SET_LOCKED'; end if;
       if (select count(*) from hub_private.catalog where set_id=sid and enabled)<10 then raise exception 'CATALOG_UNAVAILABLE'; end if;
     elsif payload->>'kind' is distinct from 'trade' then raise exception 'INVALID_ROOM'; end if;
     if action='queue_join' then
       -- Widen the RP band with wait time; never match a player with themselves.
       select q.* into r from hub_private.rooms q join hub_private.profiles h on h.user_id=q.host_id join hub_private.profiles me on me.user_id=u
       where q.ranked and q.status='waiting' and q.guest_id is null and q.host_id<>u and q.expires_at>now()
       and abs(h.rp-me.rp)<=least(2000,150+floor(extract(epoch from now()-q.created_at)/10)*100)
       and not hub_private.blocked(u,q.host_id) order by q.created_at,q.id limit 1 for update of q;
       if found then
         update hub_private.rooms set guest_id=u,guest_set=sid,status='ready',expires_at=now()+interval '2 minutes',revision=revision+1 where id=r.id returning id into rid;
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
     if r.ranked and sid is distinct from 'sv04.5' then raise exception 'RANKED_SET_LOCKED'; end if;
     if not hub_private.set_unlocked(u,sid) then raise exception 'SET_LOCKED'; end if;
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
         perform hub_private.battle_award(r.host_id,r.host_cards,r.host_set,r.pack_count);
         perform hub_private.battle_award(r.guest_id,r.guest_cards,r.guest_set,r.pack_count);
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

-- Only the dispatcher is callable. Helpers have no ambient access from API roles.
revoke all on all tables in schema hub_private from public,anon,authenticated;
revoke all on all sequences in schema hub_private from public,anon,authenticated;
revoke all on all functions in schema hub_private from public,anon,authenticated;
grant execute on function hub_private.command(text,jsonb,uuid) to authenticated;
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='hub_private' loop
 execute format('alter table hub_private.%I enable row level security',t.tablename); end loop;
end $$;
create function public.hub_command(p_action text,p_payload jsonb default '{}',p_request_id uuid default null)
returns jsonb language sql security invoker set search_path='' as $$
 select hub_private.command(p_action,p_payload,p_request_id);
$$;
revoke all on function public.hub_command(text,jsonb,uuid) from public,anon;
grant execute on function public.hub_command(text,jsonb,uuid) to authenticated;
create function hub_private.score(cards jsonb) returns integer language sql immutable set search_path='' as $$
 select coalesce(sum((array[100,300,800,1800,4200,9000])[1+(c->>'tier')::integer]),0)::integer from jsonb_array_elements(cards)c;
$$;
create function hub_private.finish_battle(rid uuid,winner uuid,why text) returns void language plpgsql set search_path='' as $$
declare r hub_private.rooms; p hub_private.profiles; d integer; newrp integer;
begin
 select * into r from hub_private.rooms where id=rid for update;
 if r.status<>'playing' then return; end if;
 update hub_private.rooms set status='completed',winner_id=winner,reason=why,completed_at=now(),revision=revision+1,host_score=hub_private.score(host_cards),guest_score=hub_private.score(guest_cards) where id=rid;
 for p in select * from hub_private.profiles where user_id in(r.host_id,r.guest_id) order by user_id for update loop
   d:=0;
   if r.ranked and why<>'abandoned' then
     d:=case when winner is null then 8 when winner=p.user_id then 30+least(12,p.streak*3) else case when p.rp<250 then -6 when p.rp<700 then -9 else -12 end end;
     newrp:=greatest(0,p.rp+d); d:=newrp-p.rp;
     update hub_private.profiles set rp=newrp,wins=wins+case when winner=p.user_id then 1 else 0 end,
       losses=losses+case when winner is not null and winner<>p.user_id then 1 else 0 end,
       ties=ties+case when winner is null then 1 else 0 end,
       streak=case when winner=p.user_id then streak+1 else 0 end,season_high=greatest(season_high,newrp) where user_id=p.user_id;
   end if;
   if p.user_id=r.host_id then update hub_private.rooms set host_delta=d where id=rid;
   else update hub_private.rooms set guest_delta=d where id=rid; end if;
   perform hub_private.log(p.user_id,'battle_result',jsonb_build_object('room',rid,'ranked',r.ranked,'delta',d,'result',case when winner is null then 'tie' when winner=p.user_id then 'win' else 'loss' end,'reason',why));
 end loop;
end $$;
create function hub_private.close_room(rid uuid,why text) returns void language plpgsql set search_path='' as $$
declare r hub_private.rooms; c jsonb;
begin
 select * into r from hub_private.rooms where id=rid for update;
 if r.status in('completed','cancelled','expired') then return; end if;
 if r.kind='trade' then
   perform 1 from public.user_saves where user_id in(r.host_id,r.guest_id) order by user_id for update;
   for c in select value from jsonb_array_elements(r.host_offer) loop perform hub_private.card_change(r.host_id,c,1); end loop;
   for c in select value from jsonb_array_elements(r.guest_offer) loop perform hub_private.card_change(r.guest_id,c,1); end loop;
 end if;
 update hub_private.rooms set status=why,host_offer='[]',guest_offer='[]',host_ready=false,guest_ready=false,revision=revision+1,completed_at=now() where id=rid;
end $$;

revoke all on all functions in schema hub_private from public,anon,authenticated;
grant execute on function hub_private.command(text,jsonb,uuid) to authenticated;
