import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {database,USERS} from './hub-database.mjs';
const [A,B,C]=USERS;
const fixture=fn=>async()=>{const d=await database();try{await fn(d);}finally{await d.close();}};
const snap=(d,u=A)=>d.call(u,'snapshot');
async function command(d,u,action,p={}){return d.call(u,action,{...p,save_version:(await snap(d,u)).save_version});}
async function start(d,ranked=true,n=1){let s=await d.call(A,ranked?'queue_join':'room_create',{kind:'battle',pack_count:n,set_id:'sv04.5'});const code=s.rooms[0].code;s=await d.call(B,ranked?'queue_join':'room_join',ranked?{}:{code});let r=s.rooms[0];s=await command(d,A,'room_ready',{id:r.id,revision:r.revision,ready:true});r=s.rooms[0];return (await command(d,B,'room_ready',{id:r.id,revision:r.revision,ready:true})).rooms[0];}
test('competing purchases commit once and conserve cards and cash',fixture(async d=>{
 const s=await command(d,A,'listing_create',{card_id:'card-0',price:1000});const p={id:s.listings[0].id,price:1000};
 const results=await Promise.allSettled(Array.from({length:16},(_,i)=>d.call(i%2?B:C,'listing_buy',p)));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.ok(results.filter(r=>r.status==='rejected').every(r=>r.reason.message.includes('LISTING_CLOSED')));
 const a=await snap(d,A),b=await snap(d,B),c=await snap(d,C);assert.equal(a.coins+b.coins+c.coins,30000);assert.equal([...a.inventory,...b.inventory,...c.inventory].filter(x=>x.id==='card-0').reduce((n,c)=>n+c.qty,0),3);
}));
test('blocked collectors cannot match, join rooms or buy one another listings',fixture(async d=>{
 await d.call(A,'block',{user_id:B});const a=await d.call(A,'queue_join',{}),b=await d.call(B,'queue_join',{});assert.notEqual(a.rooms[0].id,b.rooms[0].id);
 await d.call(A,'room_cancel',{id:a.rooms[0].id});await d.call(B,'room_cancel',{id:b.rooms[0].id});const trade=await d.call(A,'room_create',{kind:'trade'});await assert.rejects(d.call(B,'room_join',{code:trade.rooms[0].code}),/BLOCKED/);
 const listing=await command(d,A,'listing_create',{card_id:'card-0',price:100});await assert.rejects(d.call(B,'listing_buy',{id:listing.listings[0].id,price:100}),/BLOCKED/);
}));
test('abandoned ranked matches cannot farm tie RP; timeout with progress awards a forfeit',fixture(async d=>{
 let r=await start(d);await d.db.query("update hub_private.rooms set expires_at=now()-interval '1 second' where id=$1",[r.id]);let a=await d.call(A,'heartbeat');assert.equal(a.rooms[0].reason,'abandoned');assert.equal(a.profile.rp,0);assert.equal(a.profile.ties,0);
 r=await start(d);await d.call(B,'battle_reveal',{id:r.id,progress:1});await d.db.query("update hub_private.rooms set expires_at=now()-interval '1 second' where id=$1",[r.id]);a=await d.call(A,'heartbeat');assert.equal(a.rooms[0].winner_id,B);assert.equal(a.profile.losses,1);assert.equal((await snap(d,B)).profile.wins,1);
}));
test('ranked set cannot be changed to a different probability pool',fixture(async d=>{
 const a=await d.call(A,'queue_join',{set_id:'fake'});assert.equal(a.rooms[0].my_set,'sv04.5');await assert.rejects(d.call(A,'battle_set',{id:a.rooms[0].id,set_id:'other'}),/RANKED_SET_LOCKED/);
}));
test('three-pack battles debit starter, credit and cash once and update history',fixture(async d=>{
 await d.db.exec("update user_saves set save_data=jsonb_set(jsonb_set(save_data,'{state,starterV199,remaining}','1'),'{state,sealedV161,packCredits}','{\"sv04.5\":1}')");
 const r=await start(d,false,3);assert.equal(r.my_cards.length,30);const raw=(await d.db.query('select save_data from user_saves where user_id=$1',[B])).rows[0].save_data.state;
 assert.equal(raw.coins,92);assert.equal(raw.starterV199.remaining,0);assert.equal(raw.sealedV161.packCredits['sv04.5'],0);assert.equal(raw.packs,3);assert.equal(raw.history.length,3);assert.ok(raw.xp>=24);assert.equal(Object.values(raw.binder).reduce((n,c)=>n+c.qty,0)+Object.values(raw.bulkV64).reduce((n,c)=>n+c.qty,0),33);
}));
test('profiles honor record privacy, sanitize avatars and reject unearned badges',fixture(async d=>{
 await d.db.query("update user_saves set save_data=jsonb_set(jsonb_set(save_data,'{state,badges}','{\"first\":true}'),'{state,profileV227}','{\"avatarData\":\"data:image/svg+xml;base64,AAAA\"}') where user_id=$1",[A]);
 await assert.rejects(d.call(A,'profile',{name:'Alice',badges:['fake']}),/BADGE_NOT_EARNED/);await d.call(A,'profile',{name:'Alice',show_record:false,badges:['first'],style:'gold'});
 const b=await snap(d,B);assert.equal(b.leaderboard.find(x=>x.user_id===A).wins,null);const a=await d.call(A,'room_create',{kind:'trade'});const r=a.rooms[0];assert.equal(r.host_profile.avatar,'');assert.equal(r.host_profile.wins,null);assert.deepEqual(r.host_profile.badges,['first']);
}));
test('escrow remains part of collection progress and disappears after a sale',fixture(async d=>{
 const a=await command(d,A,'listing_create',{card_id:'card-0',price:100});assert.equal(a.escrow.length,1);await d.call(B,'listing_buy',{id:a.listings[0].id,price:100});const sold=await snap(d,A);assert.equal(sold.escrow.length,0);assert.equal(sold.totals.sales,1);
}));
test('transferred card metadata cannot inject markup into legacy collection screens',fixture(async d=>{
 const malicious={id:'card-0',name:'<img src=x onerror="alert(1)">',img:'javascript:alert(1)',thumb:'https://safe.test/\" onerror=alert(1)',qty:3,market:2,conditionV161:{centering:99,corners:99,edges:99,surface:99},arbitrary:'<script>'};
 await d.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,binder,card-0}',$1) where user_id=$2",[JSON.stringify(malicious),A]);
 const a=await command(d,A,'listing_create',{card_id:'card-0',price:100});const b=await d.call(B,'listing_buy',{id:a.listings[0].id,price:100});const card=b.inventory.find(c=>c.id==='card-0');
 assert.doesNotMatch(card.name,/[<>"'&]/);assert.equal(card.img,'');assert.equal(card.thumb,'');assert.equal(card.arbitrary,undefined);assert.equal(card.conditionV161.centering,99);
}));
test('real 6,889-card seed installs and 100 generated packs use valid catalog identities',fixture(async d=>{
 await d.db.exec('truncate hub_private.catalog');await d.db.exec(await readFile(new URL('../supabase/seed-hub-catalog.sql',import.meta.url),'utf8'));
 assert.equal((await d.db.query('select count(*) as n from hub_private.catalog')).rows[0].n,6889);assert.equal((await snap(d)).sets.length,3);
 assert.equal((await d.db.query("select count(distinct tier) as n from hub_private.catalog where set_id='sv04.5'")).rows[0].n,6);
 for(let i=0;i<100;i++){const pack=(await d.db.query("select hub_private.make_pack('sv04.5',1) as pack")).rows[0].pack;assert.equal(pack.length,10);assert.ok(pack.every(c=>c.id.startsWith('sv04.5-')&&c.name&&!c.name.startsWith('Test')));assert.ok(pack.slice(0,7).every(c=>c.tier===0));}
}));
test('cutover imports escrow without deducting again and disables old commands',fixture(async d=>{
 await d.db.exec(await readFile(new URL('../supabase/seed-hub-catalog.sql',import.meta.url),'utf8'));
 await d.db.exec("create table public.mp_market_listings(id uuid primary key,seller_id uuid,buyer_id uuid,status text,card_id text,card_data jsonb,ask numeric,created_at timestamptz default now());create function public.mp_test_legacy() returns integer language sql as 'select 1';grant execute on function public.mp_test_legacy() to authenticated;");
 const id=randomUUID();await d.db.query("insert into mp_market_listings(id,seller_id,status,card_id,card_data,ask) values($1,$2,'active','legacy-card','{\"id\":\"legacy-card\",\"name\":\"Legacy Card\",\"qty\":1}',5.55)",[id,A]);
 const cutover=await readFile(new URL('../supabase/migrations/20261003082036_trade_hub_v256_cutover.sql',import.meta.url),'utf8');
 await d.db.exec("create table public.mp_battle_rooms(status text,updated_at timestamptz);insert into mp_battle_rooms values('playing',now())");
 await assert.rejects(d.db.exec(cutover),/ACTIVE_LEGACY_SESSIONS/);
 await d.db.exec("update mp_battle_rooms set status='completed'");await d.db.exec(cutover);
 const a=await snap(d,A);assert.equal(a.listings[0].price,555);assert.equal(a.inventory[0].qty,3);await d.call(A,'listing_cancel',{id});assert.equal((await snap(d,A)).inventory.find(c=>c.id==='legacy-card').qty,1);
 await d.db.exec('set role authenticated');await assert.rejects(d.db.query('select public.mp_test_legacy()'),/permission denied/);await d.db.exec('reset role');
}));
test('all 32 sets retain XP and prestige unlock requirements in private battles',fixture(async d=>{
 await d.db.exec(await readFile(new URL('../supabase/seed-hub-catalog.sql',import.meta.url),'utf8'));
 assert.equal((await snap(d,A)).sets.length,3);
 await assert.rejects(d.call(A,'room_create',{kind:'battle',set_id:'sv08',pack_count:1}),/SET_LOCKED/);
 await d.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,xp}','80') where user_id=$1",[A]);assert.ok((await snap(d,A)).sets.some(s=>s.set_id==='sv08'));
 await d.db.query("update user_saves set save_data=jsonb_set(jsonb_set(jsonb_set(save_data,'{state,xp}','100000'),'{state,badges}','{\"elite\":true,\"hit50\":true}'),'{state,chaseBadges}','{\"swsh7\":{\"name\":\"Umbreon VMAX\"}}') where user_id=$1",[A]);
 const s=await snap(d,A);assert.ok(s.sets.some(s=>s.set_id==='sm12'));assert.ok(!s.sets.some(s=>s.set_id==='xy6'));
 assert.equal((await d.db.query('select count(*) as n from hub_private.expansions')).rows[0].n,32);
}));
