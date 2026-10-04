-- Retain every existing set unlock before increasing future XP thresholds.
-- Only progression metadata changes; ownership, balances, cards and XP are untouched.
begin;
select pg_advisory_xact_lock(256,1);
do $$
declare account record; unlocked jsonb;
begin
 for account in select user_id,save_data->'state' as state from public.user_saves for update loop
   if jsonb_typeof(account.state->'setUnlocksV259')='array' then continue; end if;
   select coalesce(jsonb_agg(id order by id),'[]'::jsonb) into unlocked from hub_private.expansions where hub_private.set_unlocked(account.user_id,id);
   perform hub_private.write_state(account.user_id,jsonb_set(account.state,'{setUnlocksV259}',unlocked));
 end loop;
end $$;
update hub_private.expansions set requirements=jsonb_set(requirements,'{xp}',to_jsonb(ceil(coalesce((requirements->>'xp')::numeric,0)*1.5)));
create or replace function hub_private.set_unlocked(u uuid,sid text) returns boolean language plpgsql stable set search_path='' as $$
declare s jsonb; req jsonb; h jsonb; badge text;
begin
 select requirements into req from hub_private.expansions where id=sid;
 if req is null then return false; end if;
 select save_data->'state' into s from public.user_saves where user_id=u;
 if jsonb_typeof(s->'setUnlocksV259')='array' and (s->'setUnlocksV259') ? sid then return true; end if;
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
commit;
