import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
import {lookOf,restoreLook,pageSlice} from '../src/screens/profile/model.js';
import {installProfileStudio} from '../src/screens/profile/index.js';
const html=await readFile(new URL('../public/ui/screens/profile.html',import.meta.url),'utf8');
const code=await readFile(new URL('../public/runtime/profile-bridge.js',import.meta.url),'utf8');
const turn=()=>new Promise(r=>setTimeout(r,0));
test('a cosmetic-only new player retains identity and presets without losing starter eligibility',async()=>{
 const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
 const part=source.slice(source.indexOf('function hasMeaningfulProgressV200'),source.indexOf('let sel=SETS.find'));
 const old={profileFramesV228:{owned:{rookie:true},selected:'rookie'},profileV227:{name:'Pearl',avatarData:'photo'},profileStudioV257:{account:'local',looks:[{style:'gold'}]}};
 const result=vm.runInNewContext(part+';({state,newGameV199})',{old});
 assert.equal(result.state.profileFramesV228.selected,'rookie');assert.equal(result.newGameV199,true);assert.equal(result.state.profileV227.name,'Pearl');assert.equal(result.state.profileStudioV257.looks[0].style,'gold');assert.equal(result.state.starterV199.remaining,10);assert.equal(result.state.coins,80);
});
function bridgeFixture(){
 const {window:domWindow,document}=parseHTML('<html><body><img id="profileAvatarImgV227"></body></html>');
 const window={dispatchEvent(){}};
 const state={profileV227:{name:'Alice',avatarData:''},xp:0,coins:100,badges:{first:true},rankedV221:{rp:150,wins:2}};
 const cloud={user:null},calls=[];let saves=0;
 window.tcgCloudV192=cloud;window.tcgRankedV221={currentRank:()=>({id:'bronze'})};window.tcgProfileV227={renderIdentity(){}};
 vm.runInNewContext(code,{window,document,state,BADGE_DEFS:[['first','First pack']],levelFromXP:()=>1,save(){saves++;},renderProfile(){},MutationObserver:domWindow.MutationObserver,CustomEvent:domWindow.CustomEvent});
 return {api:window.tcgProfileStudioBridge,state,cloud,window,calls,saves:()=>saves};
}
test('profile cosmetics strip authority fields and restore only earned badges',()=>{
 const p=lookOf({style:'bad',rp:99999,wins:99999,title:'Tester',badges:['first','first','locked'],trackers:[]});
 assert.equal(p.style,'aurora');assert.equal(p.rp,undefined);assert.deepEqual(p.trackers,[]);
 assert.deepEqual(restoreLook(p,['first']).badges,['first']);
 assert.deepEqual(pageSlice(32,20,6),{page:5,pages:6,start:30,end:32});
});
test('equipping and presets preserve collection data and reject unearned or duplicate badges',async()=>{
 const f=bridgeFixture(),look=lookOf({title:'Vault Keeper',style:'gold',badges:['first']});
 await f.api.equip({...look,rp:999999},'local');f.api.saveLook(2,look,'local');
 assert.equal(f.state.coins,100);assert.equal(f.state.rankedV221.rp,150);assert.equal(f.api.snapshot().looks[2].style,'gold');
 assert.equal(f.api.snapshot().profile.title,'Vault Keeper');
 await assert.rejects(f.api.equip({...look,badges:['locked']},'local'),/earned/);
 await assert.rejects(f.api.equip({...look,badges:['first','first']},'local'),/different/);
 assert.throws(()=>f.api.saveLook(4,look,'local'),/slot/);
 assert.equal(f.saves(),2);
});
test('profile changes obey cloud barriers and account ownership',async()=>{
 const f=bridgeFixture(),look=lookOf();f.cloud.hubHeld=true;
 await assert.rejects(f.api.equip(look,'local'),/syncing/);assert.throws(()=>f.api.saveLook(0,look,'local'),/syncing/);
 f.cloud.hubHeld=false;f.cloud.user={id:'other'};
 await assert.rejects(f.api.equip(look,'local'),/account changed/);
 await assert.rejects(f.api.equip(look,'other'),/Connect/);assert.equal(f.saves(),0);
});
test('public identity uses the existing command and never writes after an account switch',async()=>{
 const f=bridgeFixture();f.cloud.user={id:'alice'};
 let release;f.window.tcgTradeHub={controller:{uid:'alice',state:{data:{profile:{name:'Alice'},available_badges:['first']}},command:async(action,payload)=>{f.calls.push({action,payload});await new Promise(r=>release=r);return {profile:{name:'Alice'}};}}};
 const promise=f.api.equip({...lookOf(),wins:999},'alice');f.cloud.user={id:'bob'};release();
 await assert.rejects(promise,/account changed/);assert.equal(f.saves(),0);assert.equal(f.calls[0].action,'profile');assert.equal(f.calls[0].payload.wins,undefined);
});
test('a failed public identity command leaves saved cosmetics untouched',async()=>{
 const f=bridgeFixture();f.cloud.user={id:'alice'};f.window.tcgTradeHub={controller:{uid:'alice',state:{data:{profile:{name:'Alice'},available_badges:[]}},command:async()=>{throw new Error('Offline');}}};
 await assert.rejects(f.api.equip(lookOf(),'alice'),/Offline/);assert.equal(f.state.profileStudioV257,undefined);assert.equal(f.saves(),0);
});
test('avatars enforce type, size and save ownership and reset remains visible',()=>{
 const f=bridgeFixture();assert.throws(()=>f.api.avatar('javascript:alert(1)','local'),/supported/);
 f.api.avatar('data:image/png;base64,AAAA','local');assert.equal(f.api.snapshot().profile.avatar,'data:image/png;base64,AAAA');
 f.state.profileV227.avatarData='';assert.equal(f.api.snapshot().profile.avatar,'');
});
test('profile retains every original render target and keeps all five panels in the shell',()=>{
 const {document}=parseHTML(html),panels=[...document.querySelectorAll('[role=tabpanel]')];assert.equal(panels.length,5);
 for(const p of panels)assert.equal(p.parentElement.className,'profileShellV158');
 for(const id of ['profileRank','profileLevel','xpFill','xpText','collectorLevelBadgeV158','profileAvatarBtnV227','profileAvatarInputV227','profileAvatarChooseV227','profileAvatarResetV227','profileNameInputV227','profileSaveNameV227','careerGrid','showcase','badges','badgeCount','achievementCount','achPercent','achPoints','achievementGrid','unlockRoad','profileRoadCountV158','profileSetsUnlockedV158','chaseCount','profileMastersV158','chaseBadges','openProfileSettingsV158'])assert.ok(document.getElementById(id),id);
 const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);assert.equal(ids.length,new Set(ids).size);
});
test('profile navigation, paged achievements and drafts survive background refresh',async()=>{
 const {window,document}=parseHTML('<html><body>'+html+'</body></html>');
 // linkedom has no native select.value setter; emulate the browser form contract.
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(v){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.value===v);}});
 let snapshot={account:'local',profile:{name:'Alice',rp:120,...lookOf()},badges:[{id:'first',name:'First pack'}],looks:[],level:1},saved;
 window.tcgProfileStudioBridge={snapshot:()=>snapshot,refresh:()=>snapshot,equip:async(d)=>{saved=d;snapshot={...snapshot,profile:{...snapshot.profile,...d}};},saveLook(){}};
 document.getElementById('achievementGrid').innerHTML=Array.from({length:20},(_,i)=>`<div><b>Goal ${i}</b><button data-v163-pin="goal${i}">Pin</button></div>`).join('');
 const ui=installProfileStudio(window,document);
 assert.equal(document.querySelectorAll('#achievementGrid>[hidden]').length,14);
 const pager=document.querySelector('[aria-label="Achievements pages"]');pager.querySelector('[data-page="1"]').click();assert.match(pager.textContent,/7–12 of 20/);
 document.querySelector('[data-profile-mode-v160="customise"]').click();assert.equal(document.getElementById('profile-panel-customise').getAttribute('aria-hidden'),'false');
 document.querySelector('[data-studio-style="gold"]').click();assert.match(document.getElementById('profileDraftState').textContent,/not equipped/);
 ui.refresh();assert.match(document.getElementById('profileBannerPreview').innerHTML,/hub-banner-gold/);
 document.getElementById('profileEquip').click();await turn();assert.equal(saved.style,'gold');assert.equal(document.getElementById('profileDraftState').textContent,'Equipped');
 snapshot={...snapshot,account:'other',profile:{name:'Bob',...lookOf()}};ui.refresh();assert.match(document.getElementById('profileBannerPreview').textContent,/Bob/);assert.equal(document.getElementById('profileEquip').disabled,true);
 ui.dispose();
});
