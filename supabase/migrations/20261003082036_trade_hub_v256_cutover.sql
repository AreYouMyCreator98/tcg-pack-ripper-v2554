-- Apply only during a coordinated frontend cutover, after schema and catalog seed.
-- Keeps legacy records for audit. Never apply while continuing to serve V255.
do $$ declare f record; begin
 perform pg_advisory_xact_lock(256,1);
 if not exists(select 1 from hub_private.catalog where set_id='sv04.5' and enabled group by set_id having count(distinct tier)=6) then raise exception 'INSTALL_BATTLE_CATALOG_FIRST'; end if;
 if to_regclass('public.mp_battle_rooms') is not null then
   if exists(select 1 from public.mp_battle_rooms where status not in('completed','cancelled','expired') and updated_at>now()-interval '30 minutes') then raise exception 'ACTIVE_LEGACY_SESSIONS'; end if;
 end if;
 if to_regclass('public.mp_trade_rooms') is not null then
   if exists(select 1 from public.mp_trade_rooms where status not in('completed','cancelled','expired') and updated_at>now()-interval '30 minutes') then raise exception 'ACTIVE_LEGACY_SESSIONS'; end if;
 end if;
 if to_regclass('public.mp_market_listings') is not null then
   lock table public.mp_market_listings in access exclusive mode;
   lock table public.user_saves in share row exclusive mode;
   if exists(select 1 from public.mp_market_listings l left join public.user_saves s on s.user_id=l.seller_id left join public.user_saves b on b.user_id=l.buyer_id where l.status='sold' and (s.save_data#>array['state','mpMarketReceiptsV219','seller',l.id::text] is null or b.save_data#>array['state','mpMarketReceiptsV219','buyer',l.id::text] is null)) then
     raise exception 'LEGACY_MARKET_RECONCILIATION_REQUIRED';
   end if;
   if exists(select 1 from public.mp_market_listings where status='active' and (ask<0.10 or ask>1000000 or card_data->>'id' is distinct from card_id)) then raise exception 'LEGACY_LISTING_REVIEW_REQUIRED'; end if;
   insert into hub_private.listings(id,seller_id,card,price,created_at)
   select id,seller_id,hub_private.safe_card(card_data),round(ask*100)::integer,created_at from public.mp_market_listings where status='active'
   on conflict(id) do nothing;
 end if;
 -- Capture ranks as they stand at the actual cutover, not at schema installation.
 insert into hub_private.profiles(user_id,name,rp,wins,losses,ties,streak,season_high)
 select user_id,display_name,greatest(0,ranked_rp::integer),ranked_wins,ranked_losses,ranked_ties,ranked_streak,greatest(0,ranked_season_high::integer) from public.mp_profiles
 on conflict(user_id) do update set rp=excluded.rp,wins=excluded.wins,losses=excluded.losses,ties=excluded.ties,streak=excluded.streak,season_high=excluded.season_high;
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and left(p.proname,3)='mp_' loop
   execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 end loop;
 for f in select tablename from pg_tables where schemaname='public' and left(tablename,3)='mp_' loop
   execute format('revoke insert,update,delete,truncate,references,trigger on table public.%I from public,anon,authenticated',f.tablename);
 end loop;
 -- Old trade offers were references, not escrow. Keep their records without
 -- returning copies that are already in the Binder. Old battles remain archived.
end $$;
