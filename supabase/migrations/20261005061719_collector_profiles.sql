begin;
create table hub_private.profile_likes (
 target_id uuid not null references auth.users(id), user_id uuid not null references auth.users(id),
 created_at timestamptz not null default now(), primary key(target_id,user_id), check(target_id<>user_id)
);
create index hub_profile_likes_user on hub_private.profile_likes(user_id);
alter table hub_private.profile_likes enable row level security;
revoke all on hub_private.profile_likes from public,anon,authenticated;

-- Only the established public identity and six catalog cards leave the server.
-- Save contents, balances, email addresses and private messages stay private.
create function hub_private.collector_profile(peer uuid,liked boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); identity jsonb; hits jsonb; relation text;
begin
 if actor is null or not exists(select 1 from auth.users where id=actor) then raise exception 'AUTH_REQUIRED'; end if;
 if peer is null or hub_private.blocked(actor,peer) then raise exception 'PLAYER_UNAVAILABLE'; end if;
 identity:=hub_private.public_profile(peer);
 if identity is null then raise exception 'PLAYER_UNAVAILABLE'; end if;
 if liked is not null then
  if actor=peer then raise exception 'CANNOT_LIKE_SELF'; end if;
  if liked then insert into hub_private.profile_likes(target_id,user_id) values(peer,actor) on conflict do nothing;
  else delete from hub_private.profile_likes where target_id=peer and user_id=actor; end if;
 end if;
 select case when f.accepted then 'accepted' when f.requested_by=actor then 'outgoing' else 'incoming' end into relation
 from hub_private.friendships f where f.low_id=least(actor,peer) and f.high_id=greatest(actor,peer);
 select coalesce(jsonb_agg(x.card order by x.tier desc,x.id),'[]') into hits from (
  select c.id,c.card,c.tier from public.user_saves s
  cross join lateral jsonb_each(case when jsonb_typeof(s.save_data#>'{state,binder}')='object' then s.save_data#>'{state,binder}' else '{}'::jsonb end) b
  join hub_private.catalog c on c.id=coalesce(b.value->>'id',b.key)
  where s.user_id=peer and c.tier>=1 and case when b.value->>'qty' ~ '^[0-9]+$' then (b.value->>'qty')::numeric>0 else false end
  group by c.id,c.card,c.tier order by c.tier desc,c.id limit 6
 ) x;
 return jsonb_build_object('profile',identity,'hits',hits,'friendship',coalesce(relation,'none'),
  'online',(select last_seen>now()-interval '90 seconds' from hub_private.profiles where user_id=peer),
  'likes',(select count(*) from hub_private.profile_likes where target_id=peer),
  'liked',exists(select 1 from hub_private.profile_likes where target_id=peer and user_id=actor));
end $$;
revoke all on function hub_private.collector_profile(uuid,boolean) from public,anon;
grant execute on function hub_private.collector_profile(uuid,boolean) to authenticated;
create function public.hub_collector_profile(p_user_id uuid,p_liked boolean default null) returns jsonb
language sql security invoker set search_path='' as $$select hub_private.collector_profile(p_user_id,p_liked)$$;
revoke all on function public.hub_collector_profile(uuid,boolean) from public,anon;
grant execute on function public.hub_collector_profile(uuid,boolean) to authenticated;
notify pgrst,'reload schema';
commit;
