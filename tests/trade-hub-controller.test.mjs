import test from 'node:test';
import assert from 'node:assert/strict';
import {HubController} from '../src/trade-hub/controller.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
const tick=()=>new Promise(r=>setImmediate(r));
function fixture(rpc){
 const map=new Map(),intervals=new Map();let next=0,channels=0,removed=0;
 const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const clock={setTimeout,clearTimeout,setInterval:(fn)=>{const id=++next;intervals.set(id,fn);return id;},clearInterval:id=>intervals.delete(id)};
 const client={rpc,channel:()=>{channels++;const c={on:()=>c,subscribe:()=>c};return c;},removeChannel:async()=>{removed++;}};
 const c=new HubController({client,storage,clock,timeout:100,uuid:()=> 'request-1'});
 return {c,map,intervals,storage,client,clock,counts:()=>({channels,removed})};
}
const data=(uid='A',coins=100)=>({version:256,user_id:uid,coins,profile:{rp:0}});

test('a matched opponent is visible before a slow collection synchronization finishes',async()=>{
 const wait=deferred();const f=fixture(async()=>({data:{...data(),rooms:[{id:'match',status:'ready'}]}}));f.c.bridge={sync:()=>wait.promise};
 const connecting=f.c.setUser({id:'A'});await tick();assert.equal(f.c.state.data.rooms[0].status,'ready');wait.resolve();await connecting;await f.c.dispose();
});
test('duplicate auth events create one subscription and timers are cleaned up',async()=>{
 const f=fixture(async()=>({data:data()}));await Promise.all([f.c.setUser({id:'A'}),f.c.setUser({id:'A'})]);
 assert.equal(f.counts().channels,1);assert.equal(f.intervals.size,2);await f.c.dispose();assert.equal(f.intervals.size,0);assert.equal(f.counts().removed,1);
});
test('account switch rejects old responses and isolates pending receipts',async()=>{
 const wait=deferred();let calls=0;const f=fixture(async()=>++calls===1?wait.promise:{data:data('B')});
 const first=f.c.setUser({id:'A'});await tick();await f.c.setUser({id:'B'});wait.resolve({data:data('A')});await first;
 assert.equal(f.c.state.data.user_id,'B');assert.equal(f.counts().channels,1);await f.c.dispose();
});
test('a stale poll cannot overwrite a successful mutation',async()=>{
 const wait=deferred();let calls=0;const f=fixture(async(_,{p_action})=>p_action==='snapshot'?(++calls===1?{data:data()}:wait.promise):{data:data('A',50)});
 await f.c.setUser({id:'A'});const poll=f.c.refresh();const command=f.c.command('profile',{name:'Name'});wait.resolve({data:data('A',100)});await Promise.all([poll,command]);
 assert.equal(f.c.state.data.coins,50);await f.c.dispose();
});
test('persist-before-send, single operation and duplicate-click protection',async()=>{
 const wait=deferred();const f=fixture(async(_,{p_action,p_request_id})=>{if(p_action==='snapshot')return {data:data()};assert.equal(JSON.parse(f.map.get('tcg-hub-v256-pending:A')).id,p_request_id);return wait.promise;});
 await f.c.setUser({id:'A'});const first=f.c.command('listing_buy',{id:'listing'});await tick();await assert.rejects(f.c.command('listing_buy',{id:'listing'}),/still finishing/);
 wait.resolve({data:data()});await first;assert.equal(f.map.size,0);await f.c.dispose();
});
test('lost response retains receipt and recovery reuses identical payload without flushing save',async()=>{
 let sent=[],first=true,begins=0,holds=0,finishes=0;const f=fixture(async(_,{p_action,p_payload,p_request_id})=>{if(p_action==='snapshot')return {data:data()};sent.push({p_action,p_payload,p_request_id});if(first){first=false;throw Error('network lost');}return {data:data()};});
 f.c.bridge={begin:async()=>{begins++;return 7;},hold:()=>{holds++;},finish:async()=>{finishes++;}};
 await f.c.setUser({id:'A'});await assert.rejects(f.c.command('listing_create',{card_id:'card',price:100}),/network lost/);
 assert.ok(f.c.pending);assert.equal(finishes,0);await f.c.retry();assert.deepEqual(sent[0],sent[1]);assert.equal(begins,1);assert.equal(holds,1);assert.equal(finishes,1);assert.equal(f.c.pending,null);await f.c.dispose();
});
test('database rejection clears pending operation and restores collection sync',async()=>{
 let finishes=0;const f=fixture(async(_,{p_action})=>p_action==='snapshot'?{data:data()}:{error:{code:'P0001',message:'LISTING_CLOSED'}});f.c.bridge={begin:async()=>1,finish:async()=>{finishes++;}};
 await f.c.setUser({id:'A'});await assert.rejects(f.c.command('listing_buy',{}),/LISTING_CLOSED/);assert.equal(f.c.pending,null);assert.equal(finishes,1);assert.equal(f.c.state.busy,false);await f.c.dispose();
});
test('reload recovery holds inventory before polling, and timeout remains recoverable',async()=>{
 const f=fixture(async(_,{p_action})=>p_action==='snapshot'?{data:data()}:new Promise(()=>{}));let held=false;
 f.storage.setItem('tcg-hub-v256-pending:A',JSON.stringify({action:'listing_buy',payload:{id:'x'},id:'old-id'}));f.c.bridge={hold:()=>{held=true;}};
 await f.c.setUser({id:'A'});assert.equal(held,true);assert.equal(f.c.pending.id,'old-id');await assert.rejects(f.c.retry(),/timed out/);assert.equal(f.c.pending.id,'old-id');await f.c.dispose();
});
test('account change during save flush cannot write receipt under another account',async()=>{
 const hold=deferred();const f=fixture(async()=>({data:data()}));f.c.bridge={begin:()=>hold.promise};await f.c.setUser({id:'A'});
 const cmd=f.c.command('listing_create',{});await tick();await f.c.setUser({id:'B'});hold.resolve(1);await cmd;assert.equal(f.map.size,0);assert.equal(f.c.pending,null);await f.c.dispose();
});
test('blocked local storage prevents sending a financial request',async()=>{
 let mutations=0;const f=fixture(async(_,{p_action})=>{if(p_action!=='snapshot')mutations++;return {data:data()};});await f.c.setUser({id:'A'});
 f.storage.setItem=()=>{throw Error('storage full');};await assert.rejects(f.c.command('listing_buy',{}),/storage full/);assert.equal(mutations,0);await f.c.dispose();
});

test('foreground command waits behind quiet heartbeat without losing its recovery receipt',async()=>{
 const heartbeat=deferred(),sent=[];let begins=0,finishes=0;
 const f=fixture(async(_,{p_action})=>{sent.push(p_action);return p_action==='heartbeat'?heartbeat.promise:{data:data()};});
 f.c.bridge={begin:async()=>{begins++;return 1;},finish:async()=>{finishes++;}};
 await f.c.setUser({id:'A'});const background=f.c.command('heartbeat',{}, {quiet:true});await tick();
 assert.equal(f.c.state.background,true);assert.equal(f.c.pending.action,'heartbeat');
 const foreground=f.c.command('chat_send',{message:'hello'});await tick();assert.equal(sent.includes('chat_send'),false);
 heartbeat.resolve({data:data()});await Promise.all([background,foreground]);
 assert.deepEqual(sent,['snapshot','heartbeat','chat_send']);assert.equal(begins,1);assert.equal(finishes,1);assert.equal(f.c.pending,null);assert.equal(f.c.state.background,false);await f.c.dispose();
});

test('quiet heartbeat failure remains recoverable and a queued action cannot overtake it',async()=>{
 const heartbeat=deferred();const f=fixture(async(_,{p_action})=>p_action==='heartbeat'?heartbeat.promise:{data:data()});
 await f.c.setUser({id:'A'});const background=f.c.command('heartbeat',{}, {quiet:true});await tick();
 const foreground=f.c.command('profile',{name:'Alice'});const rejection=assert.rejects(foreground,/pending action/);
 heartbeat.reject(Error('Connection interrupted'));await background;await rejection;
 assert.equal(f.c.pending.action,'heartbeat');assert.equal(f.c.state.status,'recovering');assert.equal(f.c.state.busy,false);await f.c.dispose();
});

test('account switch cancels an action queued behind maintenance',async()=>{
 const heartbeat=deferred();let sentProfile=false;const f=fixture(async(_,{p_action})=>{if(p_action==='profile')sentProfile=true;return p_action==='heartbeat'?heartbeat.promise:{data:data()};});
 await f.c.setUser({id:'A'});const background=f.c.command('heartbeat',{}, {quiet:true});await tick();
 const foreground=f.c.command('profile',{name:'Alice'});const rejection=assert.rejects(foreground,/Account changed/);
 await f.c.setUser({id:'B'});heartbeat.resolve({data:data()});await background;await rejection;
 assert.equal(sentProfile,false);assert.equal(f.c.uid,'B');await f.c.dispose();
});
