import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
import {database,USERS} from './hub-database.mjs';
import {Social} from '../src/trade-hub/social.js';
import {activityTitle} from '../src/trade-hub/model.js';
import {installQuestShortcut} from '../src/app/quest-shortcut.js';
const [A,B,C]=USERS;
const migration=await readFile(new URL('../supabase/migrations/20261005054559_friends_messages_activity.sql',import.meta.url),'utf8');
async function setup(){
 const db=await database();try{await db.db.exec(migration);}catch(e){console.error(e.message);await db.close();throw e;}for(const uid of USERS)await db.call(uid,'snapshot');
 await db.db.query('update hub_private.profiles set name=case user_id when $1 then $4 when $2 then $5 when $3 then $6 else name end',[A,B,C,'Pearl','Nova','Other']);
 const call=(uid,action,payload={},request=randomUUID())=>db.db.transaction(async tx=>{
  await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[uid||'']);await tx.exec('set local role authenticated');
  return (await tx.query('select public.hub_social($1,$2,$3) as result',[action,JSON.stringify(payload),request])).rows[0].result;
 });return {db,call,close:()=>db.close()};
}
test('friends require recipient acceptance and messages remain private, ordered and retry-safe',async()=>{
 const f=await setup();try{
  assert.equal((await f.call(A,'search',{query:'Nova'})).players[0].user_id,B);
  await assert.rejects(f.call(A,'send',{user_id:B,message:'Before friendship'}),/FRIENDS_REQUIRED/);
  await f.call(A,'request',{user_id:B});await assert.rejects(f.call(A,'accept',{user_id:B}),/REQUEST_NOT_FOUND/);
  assert.equal((await f.call(B,'snapshot')).friends[0].requested_by,A);await f.call(B,'accept',{user_id:A});
  const id=randomUUID(),payload={user_id:B,message:'<img src=x onerror=bad()> Hello'};
  await f.call(A,'send',payload,id);await f.call(A,'send',payload,id);
  assert.equal((await f.call(B,'snapshot')).friends[0].unread,1);
  const thread=await f.call(B,'thread',{user_id:A});assert.equal(thread.messages.length,1);assert.equal(thread.messages[0].body,payload.message);
  await assert.rejects(f.call(C,'thread',{user_id:A,sender_id:B}),/FRIENDS_REQUIRED/);
  await assert.rejects(f.call(C,'read',{user_id:A,through:999999}),/FRIENDS_REQUIRED/);
  await assert.rejects(f.call(A,'send',{...payload,message:'Changed'},id),/REQUEST_REUSED/);
  await f.call(B,'read',{user_id:A,through:thread.messages[0].id});assert.equal((await f.call(B,'snapshot')).friends[0].unread,0);
  await f.call(B,'block',{user_id:A});await assert.rejects(f.call(A,'send',{user_id:B,message:'Blocked'}),/BLOCKED/);
  assert.equal((await f.call(A,'snapshot')).friends.length,0);assert.equal((await f.call(B,'snapshot')).blocked[0].user_id,A);
  await f.call(B,'unblock',{user_id:A});await assert.rejects(f.call(A,'send',{user_id:B,message:'Still not friends'}),/FRIENDS_REQUIRED/);
  await assert.rejects(f.call(null,'snapshot'),/AUTH_REQUIRED/);
  await assert.rejects(f.db.db.transaction(async tx=>{await tx.exec('set local role authenticated');return tx.query('select * from hub_private.direct_messages');}),/permission denied/);
 }finally{await f.close();}
});
test('presence expires, ping refreshes it, and message rate/size limits apply',async()=>{
 const f=await setup();try{
  await f.call(A,'request',{user_id:B});await f.call(B,'accept',{user_id:A});
  await f.db.db.query("update hub_private.profiles set last_seen=now()-interval '2 minutes' where user_id=$1",[B]);
  assert.equal((await f.call(A,'snapshot')).friends[0].online,false);await f.call(B,'ping');assert.equal((await f.call(A,'snapshot')).friends[0].online,true);
  await assert.rejects(f.call(A,'send',{user_id:B,message:' '.repeat(4)}),/INVALID_MESSAGE/);
  await assert.rejects(f.call(A,'send',{user_id:B,message:'x'.repeat(501)}),/INVALID_MESSAGE/);
  for(let i=0;i<10;i++)await f.call(A,'send',{user_id:B,message:String(i)});
  await assert.rejects(f.call(A,'send',{user_id:B,message:'too many'}),/SOCIAL_RATE_LIMIT/);
  const latest=(await f.call(B,'thread',{user_id:A})).messages;
  assert.equal((await f.call(B,'thread',{user_id:A,before:latest[4].id})).messages.length,4);
  await f.call(B,'remove',{user_id:A});assert.equal((await f.call(A,'snapshot')).friends.length,0);
 }finally{await f.close();}
});
test('purchase activity records the other collector without changing card or cash transactions',async()=>{
 const f=await setup();try{
  await f.db.call(A,'listing_create',{card_id:'card-0',price:100,save_version:1});
  const listing=(await f.db.call(B,'snapshot')).listings[0];await f.db.call(B,'listing_buy',{id:listing.id,price:100});
  const buyer=(await f.db.call(B,'snapshot')).activity.find(a=>a.kind==='bought'),seller=(await f.db.call(A,'snapshot')).activity.find(a=>a.kind==='sold');
  assert.equal(activityTitle(buyer),'BOUGHT FROM Pearl');assert.equal(activityTitle(seller),'SOLD TO Nova');
  assert.equal((await f.db.call(A,'snapshot')).coins,10100);assert.equal((await f.db.call(B,'snapshot')).coins,9900);
 }finally{await f.close();}
});
test('social markup escapes messages and collector names and separates account state',async()=>{
 const social=new Social({client:{rpc:async()=>({data:{friends:[],blocked:[]}}),removeChannel:()=>{}},clock:{clearInterval(){},setTimeout,clearTimeout},storage:null});
 social.uid=A;social.peer=B;social.data={friends:[{user_id:B,name:'<script>bad()</script>',accepted:true,online:true,rp:10}],blocked:[]};
 social.messages=[{id:1,sender_id:B,body:'<img src=x onerror=bad()>',created_at:new Date().toISOString()}];
 const {document}=parseHTML(social.markup());assert.equal(document.querySelector('script'),null);assert.equal(document.querySelector('img'),null);assert.match(document.textContent||document.toString(),/Online/);
 await social.setUser(null);assert.equal(social.messages.length,0);assert.equal(social.peer,null);
});
test('daily claim grants exactly $80 once and retains streak pack credits',async()=>{
 const source=await readFile(new URL('../public/runtime/profile-extras.js',import.meta.url),'utf8');
 const from=source.indexOf(' function dailyRewardPreview'),end=source.indexOf(' function profilePanels');
 for(const streak of [0,3,6]){
  const state={coins:10},ds={streak,lastClaimDay:'yesterday',history:[]};
  const context={state,window:{},dailyState:()=>ds,yesterdayKey:()=> 'yesterday',dayKey:()=> 'today',availableBattleSets:()=>[{id:'test',name:'Test'}],SETS:[],addXP(){},save(){}};
  vm.runInNewContext(source.slice(from,end),context);assert.equal(context.claimDaily(),true);assert.equal(state.coins,90);assert.equal(ds.streak,streak+1);
  assert.equal(state.sealedV161.packCredits.test,[1,1,1,2,2,2,3][streak]);assert.equal(context.claimDaily(),false);assert.equal(state.coins,90);
 }
});
test('Quests waits for Profile to load, opens challenges and does not claim rewards',async()=>{
 const {document}=parseHTML('<button id="openQuests">Quests</button><nav class="nav"><button data-s="profile">Profile</button></nav><details><summary>Challenges</summary><div id="profileChallengesSlot"></div></details>');let loaded=false,navigated=false;
 document.querySelector('[data-s]').addEventListener('click',()=>{assert.equal(loaded,true);navigated=true;});
 installQuestShortcut({doc:document,win:{tcgProfileStudio:{switchTab:mode=>assert.equal(mode,'overview')}},load:async()=>{loaded=true;}});
 document.getElementById('openQuests').click();await new Promise(r=>setImmediate(r));assert.equal(navigated,true);assert.equal(document.querySelector('details').open,true);assert.equal(document.getElementById('openQuests').disabled,false);
});
