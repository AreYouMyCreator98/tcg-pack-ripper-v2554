-- Read only. Resolve all findings before the cutover migration.
select 'sold_receipt_missing' as issue,l.id,l.seller_id,l.buyer_id
from public.mp_market_listings l
left join public.user_saves s on s.user_id=l.seller_id
left join public.user_saves b on b.user_id=l.buyer_id
where l.status='sold' and
 (s.save_data#>array['state','mpMarketReceiptsV219','seller',l.id::text] is null
 or b.save_data#>array['state','mpMarketReceiptsV219','buyer',l.id::text] is null);
select 'listing_review' as issue,id,ask,card_id from public.mp_market_listings
where status='active' and (ask<0.1 or ask>1000000 or card_data->>'id' is distinct from card_id);
select 'unfinished_legacy_battle' as issue,id,status from public.mp_battle_rooms
where status not in('completed','cancelled','expired');
select 'unfinished_legacy_trade' as issue,id,status from public.mp_trade_rooms
where status not in('completed','cancelled','expired');
