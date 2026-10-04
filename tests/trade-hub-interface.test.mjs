// DOM event and database integration, without browser automation or a webview.
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {HubController} from '../src/trade-hub/controller.js';
import {HubView} from '../src/trade-hub/view.js';
import {parsePrice,roomCode,rankProgress,safeImage,escapeHtml} from '../src/trade-hub/model.js';
import {database,USERS} from './hub-database.mjs';
const [A,B]=USERS;
async function player(db,uid){
 const {document}=parseHTML('<html><body><div id="root"></div><div id="shops"><button>Local shop</button></div></body></html>');let localSave,view;
 // Linkedom has no checkbox IDL state; model checked controls for DOM events.
 Object.defineProperty(document.createElement('input').constructor.prototype,'checked',{configurable:true,get(){return this.hasAttribute('checked');},set(value){this.toggleAttribute('checked',Boolean(value));}});
 const channel={on:()=>channel,subscribe:()=>channel};
 const client={channel:()=>channel,removeChannel:async()=>{},rpc:async(_,{p_action,p_payload,p_request_id})=>{try{return {data:await db.call(uid,p_action,p_payload,p_request_id)};}catch(e){return {error:{message:e.message,code:e.code}};}}};
 const clock={setTimeout,clearTimeout,setInterval:()=>0,clearInterval:()=>{}};
 const controller=new HubController({client,clock,storage:null,bridge:{begin:async()=>(await db.call(uid,'snapshot')).save_version,finish:async()=>{localSave=(await db.db.query('select save_data from user_saves where user_id=$1',[uid])).rows[0].save_data;}},notify:state=>view.render(state)});
 view=new HubView(document.getElementById('root'),controller,{shops:document.getElementById('shops')});await controller.setUser({id:uid});
 const click=async selector=>{const target=view.root.querySelector(selector);assert.ok(target,'missing '+selector);await view.onClick({target});};
 const tab=async name=>click(`[data-hub-tab="${name}"]`);
 const input=(name,value,checked)=>{const el=view.root.querySelector(`[name="${name}"]`);assert.ok(el,'missing input '+name);if(el.tagName==='SELECT'){for(const option of el.querySelectorAll('option'))option.selected=false;[...el.querySelectorAll('option')].find(option=>option.value===value).selected=true;}else el.value=value;if(checked!==undefined)el.checked=checked;view.onInput({target:el,type:'change'});};
 const submit=async name=>{const target=view.root.querySelector(`[data-hub-form="${name}"]`);assert.ok(target);await view.onSubmit({target,preventDefault(){}});assert.equal(controller.state.error,'',controller.state.error);};
 return {controller,view,document,click,tab,input,submit,get localSave(){return localSave;},close:async()=>{view.dispose();await controller.dispose();}};
}
const fixture=fn=>async()=>{const db=await database();const a=await player(db,A),b=await player(db,B);try{await fn({db,a,b});}finally{await a.close();await b.close();await db.close();}};
test('price, invite, rank boundaries and unsafe image inputs are handled deterministically',()=>{
 assert.equal(parsePrice('12.05'),1205);assert.equal(parsePrice('1000000.00'),100000000);
 for(const x of ['-1','NaN','1e3','.50','0.001','1000000.01',''])assert.throws(()=>parsePrice(x));
 assert.equal(roomCode(' abcd0123 '),'ABCD0123');assert.throws(()=>roomCode('<script>'));
 assert.equal(rankProgress(119).rank.id,'rookie');assert.equal(rankProgress(120).rank.id,'bronze');assert.equal(rankProgress(1900).percent,100);
 assert.equal(safeImage('javascript:alert(1)'),'');assert.equal(safeImage('http://insecure.test/a'),'');assert.equal(escapeHtml('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
});
test('marketplace forms reserve, confirm, purchase and synchronize the actual collection',fixture(async({a,b})=>{
 a.input('card_id','card-0');a.input('price','5.50');await a.submit('listing');assert.equal(a.controller.state.data.inventory[0].qty,2);
 await b.controller.refresh();await b.click('[data-hub-action="buy"]');assert.ok(b.view.root.querySelector('[role="alertdialog"]'));assert.equal(b.controller.state.data.coins,10000);
 await b.click('[data-hub-action="confirm-buy"]');assert.equal(b.controller.state.data.coins,9450);assert.equal(b.localSave.state.binder['card-0'].qty,1);
 await a.controller.refresh();assert.equal(a.controller.state.data.coins,10550);assert.equal(a.controller.state.data.listings.length,0);
}));
test('trade UI resets confirmation on draft edit and completes reviewed exchange',fixture(async({a,b})=>{
 await a.tab('trades');await a.click('[data-hub-action="create"]');const code=a.controller.state.data.rooms[0].code;
 await b.tab('trades');b.input('code',code);await b.submit('join');await a.controller.refresh();
 a.input('offer','card-0',true);assert.equal(a.view.root.querySelector('[data-hub-action="ready"]').disabled,true);await a.submit('offer');
 await b.controller.refresh();b.input('offer','card-1',true);await b.submit('offer');await a.controller.refresh();
 await a.click('[data-hub-action="ready"]');await b.controller.refresh();await b.click('[data-hub-action="ready"]');
 assert.equal(b.controller.state.data.rooms[0].status,'completed');assert.equal(b.localSave.state.binder['card-0'].qty,1);await a.controller.refresh();assert.equal(a.controller.state.data.inventory.find(x=>x.id==='card-1').qty,1);
}));
test('matchmaking, both-ready gate, sequential reveals, result and ranked panel work together',fixture(async({a,b})=>{
 await a.tab('battles');await b.tab('battles');await a.click('[data-hub-action="queue"]');await b.click('[data-hub-action="queue"]');await a.controller.refresh();
 assert.equal(a.view.root.querySelector('[name="room_set"]').disabled,true);
 await a.click('[data-hub-action="ready"]');await b.controller.refresh();await b.click('[data-hub-action="ready"]');await a.controller.refresh();
 assert.equal(a.localSave.state.packs,undefined); // First ready did not charge a pack.
 assert.equal(b.localSave.state.packs,1);assert.equal(a.controller.state.data.rooms[0].opponent_cards.length,0);
 for(let i=0;i<10;i++){await a.click('[data-hub-action="reveal"]');await b.click('[data-hub-action="reveal"]');await new Promise(r=>setTimeout(r,185));}
 for(let i=0;i<100&&(a.controller.state.busy||b.controller.state.busy||a.controller.revealTask||b.controller.revealTask);i++)await new Promise(r=>setTimeout(r,10));
 await a.controller.refresh();assert.ok(a.view.root.querySelector('.hub-result'));await a.tab('ranked');assert.equal(a.view.root.querySelectorAll('.hub-ladder li').length,8);assert.equal(a.controller.state.data.profile.wins+a.controller.state.data.profile.losses+a.controller.state.data.profile.ties,1);
}));
test('chat rendering prevents markup injection; blocking and reporting use the same account',fixture(async({a,b})=>{
 await a.tab('chat');a.input('message','<img src=x onerror=alert(1)>');await a.submit('chat');await b.controller.refresh();await b.tab('chat');
 assert.equal(b.view.root.querySelectorAll('.hub-message img').length,0);assert.match(b.view.root.querySelector('.hub-message p').textContent,/<img/);
 await b.click('[data-hub-action="report"]');b.input('reason','Test abusive message');await b.submit('report');await b.click('[data-hub-action="block"]');assert.equal(b.controller.state.data.chat.length,0);
 await b.click('[data-hub-action="unblock"]');assert.equal(b.controller.state.data.chat.length,1);
}));
test('all tabs, profile form, local shops and sign-out render without losing offline access',fixture(async({a})=>{
 await a.tab('ranked');a.input('name','New Collector');a.input('title','Pack Explorer');a.input('style','ember');a.input('show_record','',false);await a.submit('profile');assert.equal(a.controller.state.data.profile.name,'New Collector');assert.equal(a.controller.state.data.profile.show_record,false);
 for(const tab of ['market','trades','battles','chat','ranked','activity','shops'])await a.tab(tab);
 assert.equal(a.document.getElementById('shops').hidden,false);await a.controller.setUser(null);await a.tab('market');assert.match(a.view.root.textContent,/Sign in through Profile/);await a.tab('shops');assert.equal(a.document.getElementById('shops').hidden,false);
}));

test('earned chat portraits, ranked portrait and live identity editor share saved battle identity',fixture(async({db,a,b})=>{
 const avatar='data:image/png;base64,iVBORw0KGgo=';
 await db.db.query("update user_saves set save_data=save_data || jsonb_build_object('state',(save_data->'state') || $1::jsonb) where user_id=$2",[JSON.stringify({profileV227:{avatarData:avatar},profileFramesV228:{selected:'bronze',owned:{bronze:true}},badges:{first_pull:true}}),A]);
 await db.db.query('update hub_private.profiles set rp=168,wins=5,losses=2,season_high=168,streak=2 where user_id=$1',[A]);
 await a.controller.refresh();await a.tab('ranked');
 assert.equal(a.view.root.querySelector('.hub-rank-portrait .hub-avatar').getAttribute('src'),avatar);
 assert.match(a.view.root.querySelector('.hub-rank-portrait .hub-frame').getAttribute('src'),/bronze/);
 const preview=()=>a.view.root.querySelector('.hub-identity-preview');
 const nameInput=a.view.root.querySelector('[name="name"]');
 a.input('name','Pearl Collector');a.input('title','First five specialist');a.input('style','crystal');
 assert.equal(a.view.root.querySelector('[name="name"]'),nameInput,'preview must not replace the active editor');
 assert.match(preview().textContent,/Pearl Collector/);assert.ok(preview().querySelector('.hub-banner-crystal'));
 a.input('badge','first_pull',true);assert.match(preview().textContent,/first pull/);
 const tracker=(id,checked)=>{const target=a.view.root.querySelector(`[name="tracker"][value="${id}"]`);target.checked=checked;a.view.onInput({target});};
 tracker('wins',false);tracker('losses',true);tracker('ties',true);
 assert.equal(a.view.root.querySelector('[name="tracker"][value="ties"]').checked,false,'fourth tracker cannot be selected');
 assert.match(preview().textContent,/Ranked losses/);
 a.input('show_record','',false);assert.equal(preview().querySelector('.hub-trackers'),null);
 a.input('show_record','',true);await a.submit('profile');
 assert.deepEqual(a.controller.state.data.profile.trackers,['losses','season_high','streak']);
 await a.tab('trades');await a.click('[data-hub-action="create"]');const room=a.controller.state.data.rooms[0];
 await b.tab('trades');b.input('code',room.code);await b.submit('join');await a.controller.refresh();
 const actual=b.view.root.querySelector('.hub-versus .hub-banner').outerHTML;
 await a.tab('ranked');assert.equal(preview().firstElementChild.outerHTML,actual,'preview must be identical to the banner seen by opponents');
 await a.tab('chat');a.input('message','Hello with my earned frame');await a.submit('chat');
 assert.equal(a.view.notice,'');assert.doesNotMatch(a.view.root.textContent,/Action complete/);
 await b.controller.refresh();await b.tab('chat');
 assert.equal(b.view.root.querySelector('.hub-message .hub-avatar').getAttribute('src'),avatar);
 assert.match(b.view.root.querySelector('.hub-message .hub-frame').getAttribute('src'),/bronze/);
 await db.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,profileFramesV228,owned,bronze}','false') where user_id=$1",[A]);
 await b.controller.refresh();assert.equal(b.view.root.querySelector('.hub-message .hub-frame'),null,'unearned frames stay hidden');
}));

test('quiet maintenance leaves chat drafts editable and never renders a saving message',fixture(async({a})=>{
 await a.tab('chat');a.input('message','Draft preserved');
 a.controller.emit({busy:true,background:true,action:'heartbeat'});
 assert.equal(a.view.root.querySelector('.hub-working'),null);
 assert.equal(a.view.root.querySelector('[name="message"]').disabled,false);
 assert.equal(a.view.root.querySelector('[name="message"]').value,'Draft preserved');
 a.controller.emit({busy:true,background:false,action:'chat_send'});
 assert.equal(a.view.root.querySelector('.hub-working').textContent,'Sending message…');
 assert.equal(a.view.root.querySelector('[name="message"]').disabled,true);
 a.controller.emit({busy:false,background:false,action:null});
}));

test('market card picker shows artwork and selects the exact inventory card',fixture(async({a})=>{
 const card=a.controller.state.data.inventory[0];assert.ok(card);card.thumb='https://example.com/card.webp';a.view.render();
 const button=a.view.root.querySelector(`[data-hub-action="pick-card"][data-id="${card.id}"]`);assert.ok(button);assert.ok(button.textContent.includes(card.name));assert.equal(button.querySelector('img').getAttribute('src'),card.thumb);
 await a.click(`[data-hub-action="pick-card"][data-id="${card.id}"]`);assert.equal(a.view.drafts.card_id,card.id);
 assert.equal(a.view.root.querySelector('[name="card_id"]').value,card.id);
 a.view.own=true;a.view.query='hidden';await a.tab('market');await a.controller.refreshTask;assert.equal(a.view.own,false);assert.equal(a.view.query,'');
}));
