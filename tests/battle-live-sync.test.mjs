import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {database,USERS} from './hub-database.mjs';
const [A,B,C]=USERS;
test('live battle transport coalesces reveals, discloses only confirmed cards and settles once',async()=>{
 const d=await database();try{
 await d.db.exec(await readFile(new URL('../supabase/migrations/20261008010000_battle_live_sync.sql',import.meta.url),'utf8'));
 await d.db.exec(await readFile(new URL('../supabase/migrations/20261008020000_hub_snapshot_timeout.sql',import.meta.url),'utf8'));
 const stream=(u,action,payload={},key=randomUUID())=>d.db.transaction(async tx=>{
  await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[u||'']);await tx.exec('set local role authenticated');
  return (await tx.query('select public.hub_battle_update($1,$2,$3) as result',[action,JSON.stringify(payload),key])).rows[0].result;
 });
 await assert.rejects(stream(null,'snapshot'),/AUTH_REQUIRED/);
 await assert.rejects(stream(A,'listing_buy'),/INVALID_ACTION/);
 const first=await d.call(A,'queue_join');assert.equal(first.battle_stream,true);
 const joined=await d.call(B,'queue_join');let r=joined.rooms.find(r=>r.status==='ready');assert.ok(r,'waiting compatible player matches on join');
 for(const u of [A,B]){const snap=await d.call(u,'snapshot');r=snap.rooms.find(x=>x.id===r.id);await d.call(u,'room_ready',{id:r.id,revision:r.revision,ready:true,save_version:snap.save_version});}
 const before=await d.call(A,'snapshot');const initial=await stream(B,'snapshot');assert.equal(initial.partial,true);assert.equal(initial.inventory,undefined);assert.equal(initial.rooms[0].opponent_cards.length,0);
 await assert.rejects(stream(C,'battle_reveal',{id:r.id,progress:5}),/ROOM_NOT_FOUND/);
 await assert.rejects(stream(A,'battle_reveal',{id:r.id,progress:11}),/INVALID_NUMBER/);
 const key=randomUUID();await stream(A,'battle_reveal',{id:r.id,progress:7},key);
 const other=await stream(B,'snapshot');assert.equal(other.rooms[0].opponent_cards.length,7);assert.equal(other.rooms[0].host_score,null);assert.equal(other.rooms[0].guest_score,null);
 await stream(A,'battle_reveal',{id:r.id,progress:7},key);await stream(A,'battle_reveal',{id:r.id,progress:3});assert.equal((await stream(B,'snapshot')).rooms[0].host_progress,7);
 await assert.rejects(stream(A,'battle_reveal',{id:r.id,progress:8},key),/REQUEST_REUSED/);
 await stream(A,'battle_reveal',{id:r.id,progress:10});const finalKey=randomUUID();const result=await stream(B,'battle_reveal',{id:r.id,progress:10},finalKey);assert.equal(result.rooms[0].status,'completed');
 const retry=await stream(B,'battle_reveal',{id:r.id,progress:10},finalKey);assert.deepEqual(retry.profile,result.profile);
 const after=await d.call(A,'snapshot');assert.equal(after.coins,before.coins);assert.deepEqual(after.inventory,before.inventory);assert.equal(after.rooms[0].opponent_cards.length,10);
 assert.equal((await stream(C,'snapshot')).rooms.length,0);
 }finally{await d.close();}
});

test('light battle snapshots omit large inventory and queue ticks recheck eligibility',async()=>{
 const d=await database();try{
 await d.db.exec(await readFile(new URL('../supabase/migrations/20261008010000_battle_live_sync.sql',import.meta.url),'utf8'));
 await d.db.exec(await readFile(new URL('../supabase/migrations/20261008020000_hub_snapshot_timeout.sql',import.meta.url),'utf8'));
 const stream=u=>d.db.transaction(async tx=>{await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[u]);await tx.exec('set local role authenticated');return (await tx.query("select public.hub_battle_update('queue_tick') as result")).rows[0].result;});
 await d.call(A,'queue_join');await d.call(B,'snapshot');await d.db.query('update hub_private.profiles set rp=1000 where user_id=$1',[B]);await d.call(B,'queue_join');
 assert.equal((await d.call(A,'snapshot')).rooms[0].status,'waiting');
 await d.db.exec("update hub_private.rooms set created_at=now()-interval '2 minutes' where status='waiting'");
 const matched=await stream(A);assert.ok(matched.rooms.some(r=>r.status==='ready'));
 const binder=Object.fromEntries(Array.from({length:2500},(_,id)=>['large-'+id,{id:'large-'+id,name:'Collection card '+id,qty:1,market:2,img:'https://assets.tcgdex.net/en/sv/sv04.5/001/high.webp'}]));
 await d.db.query("update public.user_saves set save_data=jsonb_set(save_data,'{state,binder}',$1) where user_id=$2",[JSON.stringify(binder),A]);
 const full=await d.call(A,'snapshot'),light=await stream(A);const before=JSON.stringify(full).length,after=JSON.stringify(light).length;
 assert.ok(after<before*.1,`${after}/${before}`);assert.equal(light.inventory,undefined);console.log('BATTLE payload bytes',JSON.stringify({full:before,light:after,reduction:Math.round((1-after/before)*100)+'%'}));
 }finally{await d.close();}
});
