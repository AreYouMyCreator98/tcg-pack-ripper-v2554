import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {database,USERS} from './hub-database.mjs';
const [A,B,C]=USERS;
const fixture=fn=>async()=>{const d=await database();try{await fn(d);}finally{await d.close();}};
async function snap(d,u=A){return d.call(u,'snapshot');}
async function mutate(d,u,action,p={}){const s=await snap(d,u);return d.call(u,action,{...p,save_version:s.save_version});}
async function room(d,kind='trade',ranked=false){
 const a=await d.call(A,ranked?'queue_join':'room_create',{kind,set_id:'sv04.5',pack_count:1});
 const r=a.rooms[0];const b=await d.call(B,ranked?'queue_join':'room_join',ranked?{set_id:'sv04.5'}:{code:r.code});
 return b.rooms[0];
}
async function offers(d){let r=await room(d);let s=await mutate(d,A,'trade_offer',{id:r.id,revision:r.revision,cards:['card-0']});r=s.rooms[0];s=await mutate(d,B,'trade_offer',{id:r.id,revision:r.revision,cards:['card-1']});return s.rooms[0];}
async function ready(d,r,u){r=(await snap(d,u)).rooms.find(x=>x.id===r.id);return mutate(d,u,'room_ready',{id:r.id,revision:r.revision,ready:true});}

test('database enforces authentication, private tables and helper permissions',fixture(async d=>{
 await assert.rejects(d.call(null,'snapshot'),/AUTH_REQUIRED/);
 await d.db.exec('set role authenticated');
 await assert.rejects(d.db.query('select * from hub_private.rooms'),/permission denied/);
 await assert.rejects(d.db.query('select hub_private.finish_battle(gen_random_uuid(),null,\'forged\')'),/permission denied/);
 await d.db.exec('reset role;set role anon');
 await assert.rejects(d.db.query("select public.hub_command('snapshot')"),/permission denied/);
 await d.db.exec('reset role');
}));
test('listing reserves inventory, buyer receives exactly once, cash conserved',fixture(async d=>{
 let a=await mutate(d,A,'listing_create',{card_id:'card-0',price:550});const l=a.listings[0];
 assert.equal(a.inventory[0].qty,2);assert.ok(a.save_version>1);
 const key=randomUUID();const p={id:l.id,price:550};
 const b=await d.call(B,'listing_buy',p,key);const duplicate=await d.call(B,'listing_buy',p,key);
 assert.equal(duplicate.request_id,b.request_id);assert.equal(duplicate.coins,b.coins);assert.equal(b.inventory.find(c=>c.id==='card-0').qty,1);assert.equal(b.coins,9450);
 a=await snap(d,A);assert.equal(a.coins,10550);assert.equal(a.coins+b.coins,20000);
 await assert.rejects(d.call(C,'listing_buy',p),/LISTING_CLOSED/);
 await assert.rejects(d.call(B,'listing_buy',{...p,price:600},key),/REQUEST_REUSED/);
}));
test('listing cancellation returns card once and cannot be stolen',fixture(async d=>{
 const a=await mutate(d,A,'listing_create',{card_id:'card-0',price:100});const id=a.listings[0].id;
 await assert.rejects(d.call(B,'listing_cancel',{id}),/NOT_OWNER/);
 const s=await d.call(A,'listing_cancel',{id});assert.equal(s.inventory[0].qty,3);
 await assert.rejects(d.call(A,'listing_cancel',{id}),/LISTING_CLOSED/);
}));
test('invalid prices and stale saves do not mutate collection',fixture(async d=>{
 for(const price of [null,-1,0,9,10.1,100000001,'100'])await assert.rejects(mutate(d,A,'listing_create',{card_id:'card-0',price}),/INVALID_NUMBER/);
 await assert.rejects(d.call(A,'listing_create',{card_id:'card-0',price:100,save_version:99}),/SAVE_CONFLICT/);
 assert.equal((await snap(d)).inventory[0].qty,3);
}));
test('insufficient balance rolls back purchase and keeps escrow',fixture(async d=>{
 const a=await mutate(d,A,'listing_create',{card_id:'card-0',price:15000});
 await assert.rejects(d.call(B,'listing_buy',{id:a.listings[0].id,price:15000}),/INSUFFICIENT_FUNDS/);
 assert.equal((await snap(d,B)).coins,10000);assert.equal((await snap(d,A)).listings.length,1);
}));
test('trade escrow prevents selling offered cards; failed edits roll back',fixture(async d=>{
 let r=await offers(d);let a=await snap(d,A);assert.equal(a.inventory[0].qty,2);
 await assert.rejects(mutate(d,A,'trade_offer',{id:r.id,revision:r.revision,cards:['missing']}),/CARD_NOT_OWNED/);
 a=await snap(d,A);assert.equal(a.inventory[0].qty,2);assert.equal(a.rooms[0].host_offer.length,1);
 await assert.rejects(mutate(d,A,'trade_offer',{id:r.id,revision:r.revision,cards:['card-0','card-0']}),/INVALID_CARDS/);
 await assert.rejects(mutate(d,C,'trade_offer',{id:r.id,revision:r.revision,cards:[]}),/ROOM_NOT_FOUND/);
}));
test('both confirmations trade atomically and inventory totals remain six',fixture(async d=>{
 let r=await offers(d);await ready(d,r,A);const b=await ready(d,r,B);
 assert.equal(b.rooms[0].status,'completed');const a=await snap(d,A);
 assert.equal(a.inventory.find(c=>c.id==='card-1').qty,1);assert.equal(b.inventory.find(c=>c.id==='card-0').qty,1);
 assert.equal([...a.inventory,...b.inventory].reduce((n,c)=>n+c.qty,0),6);
 assert.equal(a.coins+b.coins,20000);
 await assert.rejects(ready(d,r,B),/ROOM_CLOSED/);
}));
test('changing an offer clears both ready flags; stale review is rejected',fixture(async d=>{
 let r=await offers(d);const a=await ready(d,r,A);r=a.rooms[0];
 const b=await mutate(d,B,'trade_offer',{id:r.id,revision:r.revision,cards:[]});
 assert.equal(b.rooms[0].host_ready,false);assert.equal(b.rooms[0].guest_ready,false);
 await assert.rejects(mutate(d,A,'room_ready',{id:r.id,revision:r.revision,ready:true}),/OFFER_CHANGED/);
}));
test('leaving a trade returns both reserved offers without duplicates',fixture(async d=>{
 const r=await offers(d);await d.call(B,'room_cancel',{id:r.id});
 assert.equal((await snap(d,A)).inventory[0].qty,3);assert.equal((await snap(d,B)).inventory[0].qty,3);
 await assert.rejects(d.call(A,'room_cancel',{id:r.id}),/ROOM_CLOSED/);
}));
test('expired trade returns offers during heartbeat',fixture(async d=>{
 const r=await offers(d);await d.db.query("update hub_private.rooms set expires_at=now()-interval '1 second' where id=$1",[r.id]);
 const s=await d.call(A,'heartbeat');assert.equal(s.rooms[0].status,'expired');assert.equal(s.inventory[0].qty,3);assert.equal((await snap(d,B)).inventory[0].qty,3);
}));
test('waiting rooms reject outsiders even when guest is NULL',fixture(async d=>{
 const a=await d.call(A,'room_create',{kind:'trade'});const r=a.rooms[0];
 await assert.rejects(d.call(C,'room_cancel',{id:r.id}),/ROOM_NOT_FOUND/);
 await assert.rejects(mutate(d,C,'trade_offer',{id:r.id,revision:0,cards:['card-2']}),/ROOM_NOT_FOUND/);
 assert.equal((await snap(d,C)).rooms.length,0);
}));
test('queue pairs once and excludes self, blocked users and private-code joining',fixture(async d=>{
 const a=await d.call(A,'queue_join',{set_id:'sv04.5'});
 await assert.rejects(d.call(A,'queue_join',{set_id:'sv04.5'}),/ACTIVE_ROOM/);
 await assert.rejects(d.call(B,'room_join',{code:a.rooms[0].code}),/ROOM_NOT_FOUND/);
 const b=await d.call(B,'queue_join',{set_id:'sv04.5'});assert.equal(b.rooms[0].id,a.rooms[0].id);
 const c=await d.call(C,'queue_join',{set_id:'sv04.5'});assert.notEqual(c.rooms[0].id,a.rooms[0].id);
}));
test('server generates and awards both packs only at ready gate; opponent cards hidden',fixture(async d=>{
 let r=await room(d,'battle',true);
 await assert.rejects(d.call(A,'battle_reveal',{id:r.id,progress:1}),/BOTH_READY_REQUIRED/);
 const a=await ready(d,r,A);assert.equal(a.rooms[0].my_cards.length,0);
 const b=await ready(d,r,B);r=b.rooms[0];assert.equal(r.status,'playing');assert.equal(r.my_cards.length,10);assert.equal(r.opponent_cards.length,0);assert.equal(r.host_score,null);
 assert.equal(b.coins,10000);const raw=(await d.db.query('select save_data from user_saves where user_id=$1',[B])).rows[0].save_data;
 assert.equal(raw.state.starterV199.remaining,9);assert.equal(raw.state.packs,1);
 await assert.rejects(d.call(A,'battle_set',{id:r.id,set_id:'sv04.5'}),/ROOM_CLOSED/);
 await assert.rejects(d.call(A,'battle_reveal',{id:r.id,progress:10}),/REVEAL_IN_ORDER/);
}));
test('ranked result recorded once; forged scores ignored; reveal recovery safe',fixture(async d=>{
 let r=await room(d,'battle',true);await ready(d,r,A);await ready(d,r,B);
 for(let i=1;i<=10;i++){await d.call(A,'battle_reveal',{id:r.id,progress:i,score:999999999});await d.call(B,'battle_reveal',{id:r.id,progress:i,score:0});}
 const a=await snap(d,A),b=await snap(d,B);r=a.rooms[0];assert.equal(r.status,'completed');assert.equal(r.opponent_cards.length,10);
 const sum=c=>c.reduce((s,x)=>s+[100,300,800,1800,4200,9000][x.tier],0);
 assert.equal(r.host_score,sum(r.my_cards));assert.equal(r.guest_score,sum(r.opponent_cards));
 assert.equal(a.profile.wins+a.profile.losses+a.profile.ties,1);assert.equal(b.profile.wins+b.profile.losses+b.profile.ties,1);
 await assert.rejects(d.call(A,'battle_reveal',{id:r.id,progress:10}),/ROOM_CLOSED/);
 assert.deepEqual((await snap(d,A)).profile,a.profile);
}));
test('started ranked cancellation forfeits; cannot reroll without a loss',fixture(async d=>{
 let r=await room(d,'battle',true);await ready(d,r,A);await ready(d,r,B);
 const a=await d.call(A,'room_cancel',{id:r.id});assert.equal(a.rooms[0].winner_id,B);assert.equal(a.profile.losses,1);assert.equal((await snap(d,B)).profile.wins,1);
}));
test('private battles award cards without changing ranks',fixture(async d=>{
 let r=await room(d,'battle');await ready(d,r,A);await ready(d,r,B);
 await d.call(A,'room_cancel',{id:r.id});assert.equal((await snap(d,A)).profile.losses,0);assert.equal((await snap(d,B)).profile.rp,0);
}));
test('ready gate rolls back both charges if opponent lacks funds',fixture(async d=>{
 await d.db.query("update user_saves set save_data=jsonb_set(jsonb_set(save_data,'{state,starterV199,remaining}','0'),'{state,coins}','0') where user_id=$1",[B]);
 const r=await room(d,'battle');await ready(d,r,A);await assert.rejects(ready(d,r,B),/INSUFFICIENT_FUNDS/);
 const a=await snap(d,A);assert.equal(a.rooms[0].status,'ready');assert.equal(a.rooms[0].my_cards.length,0);
 const raw=(await d.db.query('select save_data from user_saves where user_id=$1',[A])).rows[0].save_data;assert.equal(raw.state.starterV199.remaining,10);
}));
test('changing a private battle set clears the opponent confirmation',fixture(async d=>{
 const r=await room(d,'battle');await ready(d,r,B);
 const a=await d.call(A,'battle_set',{id:r.id,set_id:'sv04.5'});assert.equal(a.rooms[0].host_ready,false);assert.equal(a.rooms[0].guest_ready,false);assert.equal(a.rooms[0].status,'ready');
}));
test('chat validates, limits rate, blocks users, deduplicates and records reports',fixture(async d=>{
 await assert.rejects(d.call(A,'chat_send',{message:''}),/INVALID_MESSAGE/);
 await assert.rejects(d.call(A,'chat_send',{message:'x'.repeat(181)}),/INVALID_MESSAGE/);
 const key=randomUUID(),a=await d.call(A,'chat_send',{message:'Hello collectors'},key);
 await d.call(A,'chat_send',{message:'Hello collectors'},key);assert.equal((await snap(d,B)).chat.length,1);
 await assert.rejects(d.call(A,'chat_send',{message:'spam'}),/CHAT_RATE_LIMIT/);
 await d.call(B,'chat_report',{id:a.chat[0].id,reason:'Test report'});
 const b=await d.call(B,'block',{user_id:A});assert.equal(b.chat.length,0);
 await d.call(B,'unblock',{user_id:A});assert.equal((await snap(d,B)).chat.length,1);
}));
