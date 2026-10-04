begin;
select pg_advisory_xact_lock(256,1);
-- Keep all copies and metadata. Special/full-art/shiny ex stay in Binder.
create or replace function hub_private.regular_ex_bulk(s jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare item record; c jsonb; b jsonb; qty numeric; box jsonb:=coalesce(s->'bulkV64','{}'); binder jsonb:=coalesce(s->'binder','{}');
begin
 for item in select key,value from jsonb_each(binder) loop
  c:=item.value;
  if coalesce(c->>'secret','false')='true' or coalesce(c->>'emergency','false')='true' then continue; end if;
  if lower(coalesce(c->>'rarity','')||' '||coalesce(c->>'finish',''))~'shiny|illustration|ultra|full art|secret|hyper|rainbow|gallery' then continue; end if;
  if lower(trim(coalesce(c->>'rarity',''))) !~ '^(double rare|rare holo ex|holo rare ex)$' or coalesce(c->>'name','') !~* '\mex\M' then continue; end if;
  if coalesce(c->>'qty','') !~ '^[0-9]+$' then continue; end if;
  b:=coalesce(box->item.key,'{}');
  if coalesce(b->>'qty','0') !~ '^[0-9]+$' then continue; end if;
  qty:=(c->>'qty')::numeric+coalesce((b->>'qty')::numeric,0);
  if (c->>'qty')::numeric<1 or qty>9007199254740991 then continue; end if;
  box:=jsonb_set(box,array[item.key],c||b||jsonb_build_object('qty',qty));binder:=binder-item.key;
 end loop;
 return jsonb_set(jsonb_set(s,'{binder}',binder),'{bulkV64}',box);
end $$;
-- The trigger also covers battle rewards, returned trades and older clients.
-- It grants no access and executes with the existing caller's privileges.
create or replace function hub_private.route_ex_save() returns trigger language plpgsql set search_path='' as $$
begin
 if jsonb_typeof(new.save_data->'state')='object' then
  new.save_data:=jsonb_set(new.save_data,'{state}',hub_private.regular_ex_bulk(new.save_data->'state'));
 end if;
 return new;
end $$;
revoke all on function hub_private.regular_ex_bulk(jsonb),hub_private.route_ex_save() from public,anon,authenticated;
drop trigger if exists route_regular_ex_save on public.user_saves;
create trigger route_regular_ex_save before insert or update of save_data on public.user_saves for each row execute function hub_private.route_ex_save();
-- Existing saves get a new version only if a card actually changes location.
update public.user_saves set save_data=jsonb_set(save_data,'{state}',hub_private.regular_ex_bulk(save_data->'state')),save_version=save_version+1,updated_at=clock_timestamp()
where save_data->'state' is distinct from hub_private.regular_ex_bulk(save_data->'state');
commit;
