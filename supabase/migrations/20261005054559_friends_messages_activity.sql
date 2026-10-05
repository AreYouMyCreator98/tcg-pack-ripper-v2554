-- Social data stays in the private schema. The authenticated endpoint checks
-- ownership/friendship on every operation; raw tables are never exposed.
begin;
create table hub_private.friendships (
 low_id uuid references auth.users(id), high_id uuid references auth.users(id),
 requested_by uuid not null references auth.users(id), accepted boolean not null default false,
 created_at timestamptz not null default now(), primary key(low_id,high_id),
 check(low_id<high_id), check(requested_by in(low_id,high_id))
);
create index hub_friends_high on hub_private.friendships(high_id);
create table hub_private.direct_messages (
 id bigint generated always as identity primary key,
 sender_id uuid not null references auth.users(id), recipient_id uuid not null references auth.users(id),
 body text not null check(char_length(body) between 1 and 500),
 created_at timestamptz not null default now(), read_at timestamptz,
 check(sender_id<>recipient_id)
);
create index hub_dm_pair on hub_private.direct_messages(least(sender_id,recipient_id),greatest(sender_id,recipient_id),id desc);
create index hub_dm_unread on hub_private.direct_messages(recipient_id,sender_id,id) where read_at is null;
create index hub_dm_rate on hub_private.direct_messages(sender_id,created_at desc);
create table hub_private.social_requests (
 user_id uuid references auth.users(id), request_id uuid, action text not null,
 payload jsonb not null, result jsonb not null, created_at timestamptz not null default now(),
 primary key(user_id,request_id)
);
create index hub_social_rate on hub_private.social_requests(user_id,created_at desc);
alter table hub_private.friendships enable row level security;
alter table hub_private.direct_messages enable row level security;
alter table hub_private.social_requests enable row level security;
revoke all on hub_private.friendships,hub_private.direct_messages,hub_private.social_requests from public,anon,authenticated;
insert into public.hub_signals(topic) values('social') on conflict do nothing;

-- Deliberately narrow definer boundary, following the existing Hub command API.
-- auth.uid is the actor; payload can only identify the other participant.
create function hub_private.social_command(action text,payload jsonb,request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); peer uuid; lo uuid; hi uuid; f hub_private.friendships;
 receipt hub_private.social_requests; result jsonb; msg text; mid bigint; term text;
begin
 if u is null or not exists(select 1 from auth.users where id=u) then raise exception 'AUTH_REQUIRED'; end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>8192 then raise exception 'INVALID_PAYLOAD'; end if;
 insert into hub_private.profiles(user_id) values(u) on conflict do nothing;
 if action='ping' then
   update hub_private.profiles set last_seen=now() where user_id=u and last_seen<now()-interval '20 seconds';
   return jsonb_build_object('ok',true);
 elsif action='snapshot' then
   return jsonb_build_object('friends',coalesce((select jsonb_agg(to_jsonb(x) order by x.accepted desc,x.name,x.user_id) from (
     select p.user_id,p.name,p.rp,p.last_seen,p.last_seen>now()-interval '90 seconds' as online,sf.accepted,sf.requested_by,
       (select count(*) from hub_private.direct_messages m where m.recipient_id=u and m.sender_id=p.user_id and m.read_at is null) as unread
     from hub_private.friendships sf join hub_private.profiles p on p.user_id=case when sf.low_id=u then sf.high_id else sf.low_id end
     where u in(sf.low_id,sf.high_id) and not hub_private.blocked(u,p.user_id)
   ) x),'[]'), 'blocked',coalesce((select jsonb_agg(jsonb_build_object('user_id',b.blocked_id,'name',p.name)) from hub_private.blocks b join hub_private.profiles p on p.user_id=b.blocked_id where b.user_id=u),'[]'));
 elsif action='search' then
   term:=btrim(coalesce(payload->>'query',''));
   if char_length(term)<2 or char_length(term)>60 then return jsonb_build_object('players','[]'::jsonb); end if;
   return jsonb_build_object('players',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select p.user_id,p.name,p.rp from hub_private.profiles p where p.user_id<>u and not hub_private.blocked(u,p.user_id)
    and (strpos(lower(p.name),lower(term))>0 or p.user_id::text=term) order by p.name,p.user_id limit 20
   ) x),'[]'));
 end if;
 peer:=(payload->>'user_id')::uuid;
 if peer is null or peer=u or not exists(select 1 from hub_private.profiles where user_id=peer) then raise exception 'PLAYER_UNAVAILABLE'; end if;
 lo:=least(u,peer); hi:=greatest(u,peer);
 select * into f from hub_private.friendships where low_id=lo and high_id=hi;
 if action in('thread','read') then
   if not coalesce(f.accepted,false) or hub_private.blocked(u,peer) then raise exception 'FRIENDS_REQUIRED'; end if;
   if action='read' then
     update hub_private.direct_messages set read_at=now() where recipient_id=u and sender_id=peer and read_at is null and id<=coalesce((payload->>'through')::bigint,0);
     return jsonb_build_object('ok',true);
   end if;
   return jsonb_build_object('messages',coalesce((select jsonb_agg(to_jsonb(x) order by x.id) from (
     select id,sender_id,recipient_id,body,created_at from hub_private.direct_messages
     where least(sender_id,recipient_id)=lo and greatest(sender_id,recipient_id)=hi
       and (payload->>'before' is null or id<(payload->>'before')::bigint) order by id desc limit 60
   ) x),'[]'));
 end if;
 if action not in('request','accept','remove','block','unblock','send') then raise exception 'INVALID_ACTION'; end if;
 if request_id is null then raise exception 'REQUEST_REQUIRED'; end if;
 perform pg_advisory_xact_lock(256,2);
 select * into receipt from hub_private.social_requests r where r.user_id=u and r.request_id=social_command.request_id;
 if found then
   if receipt.action<>action or receipt.payload<>payload then raise exception 'REQUEST_REUSED'; end if;
   return receipt.result;
 end if;
 if (select count(*) from hub_private.social_requests where user_id=u and created_at>now()-interval '1 minute')>=40 then raise exception 'SOCIAL_RATE_LIMIT'; end if;
 select * into f from hub_private.friendships where low_id=lo and high_id=hi;
 if action not in('remove','block','unblock') and hub_private.blocked(u,peer) then raise exception 'BLOCKED'; end if;
 if action='request' then
   if not exists(select 1 from hub_private.friendships where low_id=lo and high_id=hi) then
     if (select count(*) from hub_private.friendships where u in(low_id,high_id))>=100 or (select count(*) from hub_private.friendships where peer in(low_id,high_id))>=100 then raise exception 'FRIEND_LIMIT'; end if;
     insert into hub_private.friendships(low_id,high_id,requested_by) values(lo,hi,u);
   end if;
 elsif action='accept' then
   if f.requested_by is null or f.requested_by=u then raise exception 'REQUEST_NOT_FOUND'; end if;
   update hub_private.friendships set accepted=true where low_id=lo and high_id=hi;
 elsif action='remove' then
   delete from hub_private.friendships where low_id=lo and high_id=hi;
 elsif action='block' then
   insert into hub_private.blocks(user_id,blocked_id) values(u,peer) on conflict do nothing;
   delete from hub_private.friendships where low_id=lo and high_id=hi;
 elsif action='unblock' then
   delete from hub_private.blocks where user_id=u and blocked_id=peer;
 elsif action='send' then
   if not coalesce(f.accepted,false) then raise exception 'FRIENDS_REQUIRED'; end if;
   msg:=btrim(coalesce(payload->>'message',''));
   if char_length(msg) not between 1 and 500 then raise exception 'INVALID_MESSAGE'; end if;
   if (select count(*) from hub_private.direct_messages where sender_id=u and created_at>now()-interval '1 minute')>=10 then raise exception 'SOCIAL_RATE_LIMIT'; end if;
   insert into hub_private.direct_messages(sender_id,recipient_id,body) values(u,peer,msg) returning id into mid;
 end if;
 result:=jsonb_build_object('ok',true,'request_id',request_id,'message_id',mid);
 insert into hub_private.social_requests values(u,request_id,action,payload,result,now());
 update public.hub_signals set revision=revision+1 where topic='social';
 return result;
end $$;
revoke all on function hub_private.social_command(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function hub_private.social_command(text,jsonb,uuid) to authenticated;
create function public.hub_social(p_action text,p_payload jsonb default '{}',p_request_id uuid default null) returns jsonb
language sql security invoker set search_path='' as $$select hub_private.social_command(p_action,p_payload,p_request_id);$$;
revoke all on function public.hub_social(text,jsonb,uuid) from public,anon;
grant execute on function public.hub_social(text,jsonb,uuid) to authenticated;

-- Capture names at the transaction, so later profile renames do not rewrite history.
create function hub_private.activity_counterparty() returns trigger language plpgsql set search_path='' as $$
declare other_id uuid; other_name text;
begin
 if new.kind in('bought','sold') and new.detail->>'listing' is not null then
   select case when new.kind='bought' then seller_id else buyer_id end into other_id from hub_private.listings where id=(new.detail->>'listing')::uuid;
   select name into other_name from hub_private.profiles where user_id=other_id;
   if other_id is not null then new.detail:=new.detail||jsonb_build_object('counterparty_id',other_id,'counterparty_name',coalesce(other_name,'Collector')); end if;
 end if;
 return new;
end $$;
revoke all on function hub_private.activity_counterparty() from public,anon,authenticated;
create trigger activity_counterparty before insert on hub_private.activity for each row execute function hub_private.activity_counterparty();
update hub_private.activity a set detail=a.detail||jsonb_build_object('counterparty_id',p.user_id,'counterparty_name',p.name)
from hub_private.listings l join hub_private.profiles p on p.user_id in(l.seller_id,l.buyer_id)
where a.kind in('bought','sold') and a.detail->>'listing'=l.id::text and p.user_id=case when a.kind='bought' then l.seller_id else l.buyer_id end and not a.detail ? 'counterparty_name';
commit;
