-- V264: honor the special, permanent unlock paths for new prestige sets.
-- Retains all earlier XP, badge and named-card requirements verbatim.
-- No existing saved profile, card, balance, or set-unlock record is changed.
create or replace function hub_private.set_unlocked(u uuid,sid text)
returns boolean language plpgsql stable set search_path='' as $$
declare
 s jsonb; req jsonb; h jsonb; badge text;
 peak_rank integer; required_master_sets integer; completed_master_sets integer;
begin
 select requirements into req from hub_private.expansions where id=sid;
 if req is null then return false; end if;
 select save_data->'state' into s from public.user_saves where user_id=u;
 if jsonb_typeof(s->'setUnlocksV259')='array' and (s->'setUnlocksV259') ? sid then return true; end if;
 if coalesce((s->>'xp')::numeric,0)<coalesce((req->>'xp')::numeric,0) then return false; end if;
 for badge in select jsonb_array_elements_text(coalesce(req->'badges','[]'::jsonb)) loop
   if coalesce(s#>array['badges',badge],'false'::jsonb) in ('false'::jsonb,'null'::jsonb,'0'::jsonb) then return false; end if;
 end loop;
 for h in select value from jsonb_array_elements(coalesce(req->'hits','[]'::jsonb)) loop
   if lower(replace(coalesce(s#>>array['chaseBadges',h->>'setId','name'],''),'’',chr(39)))=lower(h->>'card') then continue; end if;
   if not exists(select 1 from (
      select value as card from jsonb_each(coalesce(s->'binder','{}'::jsonb)) where coalesce((value->>'qty')::integer,0)>0
      union all select card from hub_private.listings where seller_id=u and status='active'
      union all select value from hub_private.rooms,jsonb_array_elements(case when host_id=u then host_offer else guest_offer end) where u in(host_id,guest_id) and kind='trade' and status in('waiting','ready')
   ) owned where lower(replace(card->>'name','’',chr(39)))=lower(h->>'card') and (card->>'setId'=h->>'setId' or card->>'set'=(select name from hub_private.expansions where id=h->>'setId'))) then return false; end if;
 end loop;

 -- Rank comes from the authoritative ranked profile (including historical peak).
 if req ? 'rankRP' then
   select greatest(coalesce(p.rp,0),coalesce(p.season_high,0)) into peak_rank from hub_private.profiles p where p.user_id=u;
   if coalesce(peak_rank,0)<(req->>'rankRP')::integer then return false; end if;
 end if;
 if req ? 'collectorLevel' and coalesce((s->>'xp')::numeric,0)<power(greatest(0,(req->>'collectorLevel')::integer-1),2)*80 then return false; end if;
 if req ? 'packs' and coalesce((s->>'packs')::integer,0)<(req->>'packs')::integer then return false; end if;

 required_master_sets:=coalesce((req->>'masterSets')::integer,0);
 if required_master_sets>0 then
   -- A collection includes Binder, Bulk Tub, graded and submitted cards,
   -- active listings and escrow. Selling a copy removes it from progress.
   with owned as (
     select coalesce(value->>'id',key) as id from jsonb_each(coalesce(s->'binder','{}'::jsonb)) where coalesce((value->>'qty')::integer,0)>0
     union select coalesce(value->>'id',key) from jsonb_each(coalesce(s->'bulkV64','{}'::jsonb)) where coalesce((value->>'qty')::integer,0)>0
     union select value->>'id' from jsonb_array_elements(coalesce(s#>'{gradingV44,submissions}','[]'::jsonb))
     union select value->>'id' from jsonb_array_elements(coalesce(s#>'{gradingV44,graded}','[]'::jsonb))
     union select coalesce(value#>>'{slab,id}',value#>>'{card,id}',value->>'id') from jsonb_array_elements(coalesce(s#>'{marketV57,listings}','[]'::jsonb))
     union select value->>'id' from jsonb_array_elements(coalesce(s->'hubEscrowV256','[]'::jsonb))
     union select card->>'id' from hub_private.listings where seller_id=u and status='active'
   ), completed as (
     select c.set_id from hub_private.catalog c
     left join owned o on o.id=c.id
     where c.enabled and c.set_id not in ('base1','30th')
     group by c.set_id
     having count(*)>=10 and count(*)=count(o.id)
   )
   select count(*) into completed_master_sets from completed;
   if completed_master_sets<required_master_sets then return false; end if;
 end if;
 return true;
end $$;
