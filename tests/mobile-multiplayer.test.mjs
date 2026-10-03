import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {installNavigationInput} from '../src/app/navigation-input.js';
import {battleCost} from '../src/trade-hub/model.js';
import {HubView} from '../src/trade-hub/view.js';
import {database,USERS} from './hub-database.mjs';
const [A,B]=USERS;

function navigation(pointer=true){
 const {document,window}=parseHTML('<html><body><nav class="nav"><button data-s="earn"><span>Trade</span></button></nav></body></html>');
 const listeners={};document.addEventListener=(type,fn)=>listeners[type]=fn;document.removeEventListener=()=>{};
 const button=document.querySelector('button'),target=button.querySelector('span');let clicks=0;button.click=()=>clicks++;
 installNavigationInput(document,{PointerEvent:pointer?function(){}:undefined});
 const event=(overrides={})=>({target,pointerType:'touch',pointerId:1,clientX:20,clientY:20,button:0,cancelable:true,preventDefault(){},...overrides});
 return {listeners,button,event,clicks:()=>clicks};
}
test('mobile navigation activates a touch once when its compatibility click is missing',()=>{
 const f=navigation();f.listeners.pointerdown(f.event());f.listeners.pointerup(f.event());assert.equal(f.clicks(),1);
 let suppressed=0;f.listeners.click(f.event({isTrusted:true,stopImmediatePropagation:()=>suppressed++}));assert.equal(suppressed,1);
});
test('navigation does not activate drags, cancelled pointers, mouse down or disabled buttons',()=>{
 const f=navigation();f.listeners.pointerdown(f.event());f.listeners.pointerup(f.event({clientX:60}));
 f.listeners.pointerdown(f.event());f.listeners.pointercancel();f.listeners.pointerup(f.event());
 f.listeners.pointerdown(f.event({pointerType:'mouse'}));f.listeners.pointerup(f.event({pointerType:'mouse'}));
 f.button.disabled=true;f.listeners.pointerdown(f.event());f.listeners.pointerup(f.event());assert.equal(f.clicks(),0);
});
test('touch-only navigation fallback works without PointerEvent support',()=>{
 const f=navigation(false),e=f.event({pointerId:undefined,changedTouches:[{clientX:5,clientY:8}]});f.listeners.touchstart(e);f.listeners.touchend(e);assert.equal(f.clicks(),1);
});
test('battle prices follow starter, set-credit and cash rules including three packs',()=>{
 const d={battle_resources:{starter:1,credits:{a:1}}};assert.equal(battleCost(d,'a',3),800);assert.equal(battleCost(d,'b',3),1600);assert.equal(battleCost(d,'a'),0);assert.equal(battleCost({},'a'),null);
});
const fixture=fn=>async()=>{const d=await database();try{await fn(d);}finally{await d.close();}};
test('both ranked players can confirm the same snapshot without a false offer change',fixture(async d=>{
 await d.call(A,'queue_join');await d.call(B,'queue_join');
 const a=await d.call(A,'snapshot'),b=await d.call(B,'snapshot'),r=a.rooms[0];
 await d.call(A,'room_ready',{id:r.id,revision:r.revision,ready:true,save_version:a.save_version});
 const started=await d.call(B,'room_ready',{id:r.id,revision:r.revision,ready:true,save_version:b.save_version});
 assert.equal(started.rooms[0].status,'playing');assert.equal(started.battle_resources.starter,9);
 assert.equal((await d.call(A,'snapshot')).battle_resources.starter,9);
}));
test('ranked rejects unaffordable entry before creating a room and accepts set credits',fixture(async d=>{
 await d.db.query("update user_saves set save_data=jsonb_set(jsonb_set(save_data,'{state,starterV199,remaining}','0'),'{state,coins}','1') where user_id=$1",[A]);
 await assert.rejects(d.call(A,'queue_join'),/INSUFFICIENT_FUNDS/);assert.equal((await d.call(A,'snapshot')).rooms.length,0);
 await d.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,sealedV161,packCredits}','{\"sv04.5\":1}') where user_id=$1",[A]);
 const s=await d.call(A,'queue_join');assert.equal(s.rooms[0].status,'waiting');assert.equal(s.battle_resources.credits['sv04.5'],1);assert.equal(s.battle_resources.starter,0);
}));
test('waiting players pair on heartbeat after rank range widens; only one room remains live',fixture(async d=>{
 await d.call(A,'snapshot');await d.call(B,'snapshot');await d.db.query('update hub_private.profiles set rp=400 where user_id=$1',[B]);
 const a=await d.call(A,'queue_join'),b=await d.call(B,'queue_join');assert.notEqual(a.rooms[0].id,b.rooms[0].id);
 await d.db.exec("update hub_private.rooms set created_at=now()-interval '40 seconds' where status='waiting'");
 const matched=await d.call(A,'heartbeat'),room=matched.rooms.find(r=>r.status==='ready');assert.ok(room);assert.equal(room.host_id,B);assert.equal(room.guest_id,A);
 const live=(await d.db.query("select count(*)::int as count from hub_private.rooms where status in ('waiting','ready','playing')")).rows[0].count;assert.equal(live,1);
 await d.call(B,'heartbeat');assert.equal((await d.call(B,'snapshot')).rooms.filter(r=>r.status==='ready').length,1);
}));
test('expired queue can be restarted immediately after a mobile suspension',fixture(async d=>{
 await d.call(A,'queue_join');await d.db.exec("update hub_private.rooms set expires_at=now()-interval '1 second'");
 const s=await d.call(A,'queue_join');assert.equal(s.rooms.filter(r=>r.status==='waiting').length,1);assert.equal(s.rooms.filter(r=>r.status==='expired').length,1);
}));
test('matched room and readiness precede setup panels and banners; other tabs announce it',fixture(async d=>{
 await d.call(A,'queue_join');await d.call(B,'queue_join');const data=await d.call(A,'snapshot');
 const {document}=parseHTML('<html><body><div id="root"></div></body></html>');const controller={uid:A,state:{data,status:'connected'},storage:null};const v=new HubView(document.getElementById('root'),controller);v.tab='battles';v.render();
 const html=v.root.innerHTML;assert.ok(html.indexOf('class="hub-room"')<html.indexOf('class="hub-entry-grid"'));assert.ok(html.indexOf('Ready to battle')<html.indexOf('class="hub-versus"'));assert.match(html,/Match found/);
 v.tab='chat';v.render();assert.ok(v.root.querySelector('[data-hub-action="resume-room"]'));v.dispose();
}));
test('insufficient battle balance is visible and cannot send a readiness click',fixture(async d=>{
 const a=await d.call(A,'room_create',{kind:'battle',set_id:'sv04.5',pack_count:1});await d.call(B,'room_join',{code:a.rooms[0].code});
 await d.db.query("update user_saves set save_data=jsonb_set(jsonb_set(save_data,'{state,starterV199,remaining}','0'),'{state,coins}','1') where user_id=$1",[A]);
 const data=await d.call(A,'snapshot'),{document}=parseHTML('<html><body><div id="root"></div></body></html>');const v=new HubView(document.getElementById('root'),{uid:A,state:{data,status:'connected'}});v.tab='battles';v.render();assert.match(v.root.textContent,/You do not have enough/);assert.equal(v.root.querySelector('[data-hub-action="ready"]').disabled,true);v.dispose();
 const r=data.rooms[0];await assert.rejects(d.call(A,'room_ready',{id:r.id,revision:r.revision,ready:true,save_version:data.save_version}),/INSUFFICIENT_FUNDS/);assert.equal((await d.call(A,'snapshot')).rooms[0].host_ready,false);
}));
