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

test('committed listings appear while the collection restore is still finishing',async()=>{
 const restore=deferred();const f=fixture(async(_,{p_action})=>({data:{...data(),listings:p_action==='listing_create'?[{id:'new'}]:[]}}));
 f.c.bridge={begin:async()=>1,finish:()=>restore.promise};await f.c.setUser({id:'A'});
 const action=f.c.command('listing_create',{card_id:'machamp',price:100});await tick();
 assert.equal(f.c.state.data.listings[0].id,'new');assert.equal(f.c.state.busy,true);
 restore.resolve();await action;assert.equal(f.c.pending,null);await f.c.dispose();
});
test('realtime signals during an existing fetch coalesce into a fresh follow-up',async()=>{
 const wait=deferred();let calls=0;const f=fixture(async()=>++calls===2?wait.promise:{data:{...data(),listings:calls>2?[{id:'new'}]:[]}});
 await f.c.setUser({id:'A'});const first=f.c.refresh();f.c.requestRefresh();f.c.requestRefresh();
 wait.resolve({data:data()});await first;await tick();assert.equal(calls,3);assert.equal(f.c.state.data.listings[0].id,'new');await f.c.dispose();
});
test('legacy raw listing submits to the shared market without removing local cards',async()=>{
 const {readFile}=await import('node:fs/promises'),{runInNewContext}=await import('node:vm');
 const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
 const body=source.slice(source.indexOf('async function createListingV57(){'),source.indexOf('\n}',source.indexOf('async function createListingV57(){'))+2);
 const card={id:'machamp',qty:2},submit={disabled:false},sent=[];
 const ctx={marketPickV57:card,state:{binder:{machamp:card}},document:{getElementById:id=>id==='marketCreateV57'?submit:{value:'12.50'}},window:{tcgTradeHub:{listCard:async(...args)=>sent.push(args)}},toast:()=>{}};
 runInNewContext(body,ctx);await ctx.createListingV57();assert.deepEqual(sent,[['machamp','12.50']]);assert.equal(card.qty,2);assert.equal(submit.disabled,false);
 ctx.window.tcgTradeHub.listCard=async()=>{throw Error('offline');};await ctx.createListingV57();assert.equal(card.qty,2);assert.equal(submit.disabled,false);
});

test('public listings keep updating while a slow collection restore is in progress',async()=>{
 const restore=deferred();let calls=0;const f=fixture(async()=>({data:{...data(),listings:[{id:String(++calls)}]}}));f.c.bridge={sync:()=>restore.promise};
 await f.c.setUser({id:'A'});await f.c.refresh();assert.equal(f.c.state.data.listings[0].id,'2');
 restore.resolve();await f.c.dispose();
});
test('a snapshot started before purchase completion cannot restore a sold listing',async()=>{
 const pending=deferred(),stale=deferred();let snapshots=0;
 const f=fixture(async(_,{p_action})=>p_action==='snapshot'?(++snapshots===1?{data:data()}:stale.promise):pending.promise);
 await f.c.setUser({id:'A'});const purchase=f.c.command('listing_buy',{id:'x'});await tick();const poll=f.c.refresh();
 pending.resolve({data:{...data(),listings:[]}});await purchase;stale.resolve({data:{...data(),listings:[{id:'x'}]}});await poll;
 assert.equal(f.c.state.data.listings.length,0);await f.c.dispose();
});

test('suspending drops stale snapshots and returning reconnects without reload',async()=>{
 const old=deferred();let calls=0,visible=true;const f=fixture(async()=>++calls===2?old.promise:{data:{...data(),listings:[{id:String(calls)}]}});f.c.bridge={visible:()=>visible};
 await f.c.setUser({id:'A'});const poll=f.c.refresh();visible=false;f.c.suspend();visible=true;await f.c.resume();assert.equal(f.c.state.data.listings[0].id,'3');
 old.reject(new TypeError('Failed to fetch'));await poll;assert.equal(f.c.state.error,'');assert.equal(f.c.state.status,'connected');await f.c.dispose();
});

test('battle reveals bypass slow collection sync and coalesce rapid taps with server capability',async()=>{
 const wait=deferred(),calls=[],room={id:'r',kind:'battle',status:'playing',host_id:'A',host_progress:0,my_cards:Array.from({length:10},(_,id)=>({id}))};
 const f=fixture(async(name,{p_action,p_payload})=>{calls.push({name,p_action,p_payload});if(p_action==='snapshot')return {data:{...data(),battle_stream:true,rooms:[room]}};return {data:{...data(),partial:true,battle_stream:true,rooms:[{...room,host_progress:p_payload.progress}]}};});
 await f.c.setUser({id:'A'});f.c.syncTask=wait.promise;
 for(let i=0;i<10;i++)f.c.reveal(f.c.state.data.rooms[0]);
 await tick();await tick();
 const reveals=calls.filter(c=>c.p_action==='battle_reveal');assert.ok(reveals.length<=2);assert.equal(reveals.at(-1).p_payload.progress,10);assert.ok(reveals.every(c=>c.name==='hub_battle_update'));assert.equal(f.c.serverProgress(f.c.state.data.rooms[0]),10);
 wait.resolve();await f.c.dispose();
});

test('waiting ranked queue rechecks matching at three seconds without a collection flush',async()=>{
 const calls=[],f=fixture(async(name,{p_action})=>{calls.push({name,p_action});return {data:{...data(),battle_stream:true,rooms:[{id:'q',kind:'battle',ranked:true,status:'waiting'}]}};});
 await f.c.setUser({id:'A'});f.c.bridge.begin=()=>{throw Error('Queue must not flush collection');};
 const poll=[...f.intervals.values()][0];for(let i=0;i<4;i++){poll();await tick();}
 assert.equal(calls.filter(c=>c.p_action==='queue_tick').length,1);assert.equal(calls.find(c=>c.p_action==='queue_tick').name,'hub_battle_update');await f.c.dispose();
});

test('snapshot timeouts back off automatic polling and realtime without blocking explicit reconnect',async()=>{
 let calls=0,fail=true;const f=fixture(async()=>{calls++;if(fail)return {error:{code:'57014',message:'canceling statement due to statement timeout'}};return {data:data()};});
 await f.c.setUser({id:'A'});assert.equal(f.c.state.status,'offline');const before=calls;
 for(let i=0;i<40;i++){[...f.intervals.values()][0]();f.c.requestRefresh();}await tick();assert.equal(calls,before);
 fail=false;await f.c.resume();assert.equal(f.c.state.status,'connected');assert.equal(f.c.snapshotFailures,0);await f.c.dispose();
});
