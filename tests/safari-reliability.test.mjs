import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {installSettingsOverlay} from '../src/app/settings-overlay.js';
import {installPackHUD} from '../src/packs/pack-hud.js';
import {installNavigationInput} from '../src/app/navigation-input.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const progression=await read('public/runtime/progression.js');
const sessionCode=progression.slice(progression.indexOf('  async function refreshSession(){'),progression.indexOf('  async function getRemote(){'));

test('returning to the browser cannot reconcile or reload in the middle of an opening',async()=>{
 const code=progression.slice(progression.indexOf('  async function reconcile(){'),progression.indexOf('  async function pullInPlace('));
 let reads=0;const ctx=vm.createContext({client:{},recoveryPending:false,hubHold:false,busy:true,refreshSession:async()=>{reads++;return null;}});
 vm.runInContext(code,ctx);await ctx.reconcile();assert.equal(reads,0);
 ctx.busy=false;await ctx.reconcile();assert.equal(reads,1);
});

test('temporary session recovery failure retains account, retries and never clears browser data',async()=>{
 let response={error:new Error('Connection interrupted')},retry,clears=0,reconciles=0;
 const ctx=vm.createContext({client:{auth:{getSession:async()=>response}},user:{id:'A'},sessionState:'ready',sessionRetry:null,recoveryPending:false,clearTimeout:()=>{},setTimeout:fn=>(retry=fn,1),syncUI:()=>{},setPendingEmail:()=>{},localStorage:{getItem:()=>null,removeItem:()=>clears++},reconcile:()=>reconciles++,holdHubTransaction:()=>{}});
 vm.runInContext(sessionCode,ctx);
 assert.equal(await ctx.refreshSession(),null);assert.equal(ctx.user.id,'A');assert.equal(ctx.sessionState,'retry');assert.equal(clears,0);
 response={data:{session:{user:{id:'A'}}}};retry();await new Promise(r=>setImmediate(r));
 assert.equal(ctx.sessionState,'ready');assert.equal(reconciles,1);assert.equal(clears,0);
 response={data:{session:null}};await ctx.refreshSession();assert.equal(ctx.user,null);
});

test('settings locks only background scrolling, fits visual viewport, closes and restores scroll',async()=>{
 const {document,window}=parseHTML('<html><body style="color:red"><button id="opener">Settings</button><section id="settings" class="settingsOverlayV158"><button id="closeSettingsShadeV158"></button><div class="settingsCardV158"><button id="closeProfileSettingsV158">x</button></div></section></body></html>');
 // linkedom does not model CSS priority or focus/scroll layout.
 for(const node of [document.documentElement,document.body])node.style.getPropertyPriority=()=>'';
 const handlers={},positions=[];const win={MutationObserver:window.MutationObserver,scrollX:0,scrollY:420,innerHeight:667,visualViewport:{height:340,offsetTop:55,addEventListener:(n,fn)=>handlers[n]=fn},addEventListener:()=>{},scrollTo:(...p)=>positions.push(p)};
 const api=installSettingsOverlay(document,win),root=document.getElementById('settings');
 root.classList.add('show');api.sync();assert.equal(document.body.style.position,'fixed');assert.equal(document.body.style.top,'-420px');
 assert.equal(root.style.getPropertyValue('--settings-height'),'340px');assert.equal(root.style.getPropertyValue('--settings-top'),'55px');assert.equal(root.getAttribute('aria-hidden'),'false');
 win.visualViewport.height=667;handlers.resize();assert.equal(root.style.getPropertyValue('--settings-height'),'667px');
 document.getElementById('closeProfileSettingsV158').click();assert.equal(root.classList.contains('show'),false);assert.equal(document.body.style.position,'');assert.equal(document.body.style.color,'red');assert.deepEqual(positions,[[0,420]]);
});

test('pending trade action still permits settings dismissal but blocks account/save mutations',()=>{
 const section=progression.slice(progression.indexOf('  async function beginHubTransaction(){'),progression.indexOf('  window.tcgCloudV192='));
 const {document}=parseHTML('<html><body><div class="screen" id="rip"></div><section id="settings"><button id="closeProfileSettingsV158"></button><button id="cloudSyncBtnV190"></button></section></body></html>');
 const events={};document.addEventListener=(name,fn)=>events[name]=fn;
 const ctx=vm.createContext({document,Map,clearTimeout,hubHold:false,syncTimer:null});vm.runInContext(section,ctx);ctx.holdHubTransaction();
 assert.equal(document.getElementById('rip').inert,true);assert.notEqual(document.getElementById('settings').inert,true);
 let blocked=0;const event=id=>({target:document.getElementById(id),preventDefault:()=>blocked++,stopImmediatePropagation:()=>{}});
 events.click(event('closeProfileSettingsV158'));assert.equal(blocked,0);
 events.click(event('cloudSyncBtnV190'));assert.equal(blocked,1);
});

test('touch dismissal works during a pending action, without enabling other settings buttons',()=>{
 const {document}=parseHTML('<html class="hub-transaction-pending"><body><section id="settings" class="studio-settings"><button id="closeProfileSettingsV158"></button><button id="cloudSyncBtnV190"></button></section></body></html>');
 const handlers={};document.addEventListener=(n,fn)=>handlers[n]=fn;
 installNavigationInput(document,{PointerEvent:function(){}});let close=0,sync=0;
 document.getElementById('closeProfileSettingsV158').click=()=>close++;document.getElementById('cloudSyncBtnV190').click=()=>sync++;
 for(const id of ['closeProfileSettingsV158','cloudSyncBtnV190']){const e={target:document.getElementById(id),pointerType:'touch',pointerId:1,clientX:10,clientY:10};handlers.pointerdown(e);handlers.pointerup(e);}
 assert.equal(close,1);assert.equal(sync,0);
});

test('fast controls hide throughout tear, extraction, reveals and summary, returning only when ready',()=>{
 const {document,window}=parseHTML('<html><body><section id="rip" class="active"><div id="stage"></div></section><div id="v128Extract"></div><div id="v128Hero"></div></body></html>');
 const old={document:globalThis.document,window:globalThis.window,MutationObserver:globalThis.MutationObserver};
 Object.assign(globalThis,{document,window,MutationObserver:class {observe(){}}});
 try{
  const api=installPackHUD(),hud=document.getElementById('v253PackHUD'),rip=document.getElementById('rip'),fast=document.getElementById('v253FastToggle');
  assert.equal(hud.hidden,false);
  for(const [id,cls]of [['rip','studio-opening'],['v128Extract','on'],['stage','cardModeV89'],['v128Hero','on']]){document.getElementById(id).classList.add(cls);api.syncVisibility();assert.equal(hud.hidden,true);assert.equal(fast.disabled,true);document.getElementById(id).classList.remove(cls);}
  const summary=document.createElement('div');summary.id='v88Summary';rip.appendChild(summary);api.syncVisibility();assert.equal(hud.hidden,true);
  summary.remove();api.syncVisibility();assert.equal(hud.hidden,false);assert.equal(fast.disabled,false);
  rip.classList.remove('active');api.syncVisibility();assert.equal(hud.hidden,true);
 }finally{Object.assign(globalThis,old);}
});

test('settings is not an inactive screen and the pinned auth client is served locally and precached',async()=>{
 const [html,sw,overlays,sdk]=await Promise.all([read('index.html'),read('public/sw.js'),read('public/ui/overlays.html'),read('public/runtime/supabase.js')]);
 const {document}=parseHTML(overlays);assert.equal(document.getElementById('settings').classList.contains('screen'),false);
 assert.match(html,/src="\.\/runtime\/supabase.js"/);assert.doesNotMatch(html,/cdn.jsdelivr.net/);assert.match(sw,/runtime\/supabase.js/);assert.ok(sdk.length>100000);
});
