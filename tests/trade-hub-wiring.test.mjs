import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {installTradeHub} from '../src/trade-hub/index.js';
import {criticalRuntime,secondaryRuntime} from '../src/config/runtime-manifest.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('new hub replaces every old online runtime and is available offline through the cache',async()=>{
 const runtime=[...criticalRuntime,...secondaryRuntime];for(const old of ['runtime/multiplayer.js','runtime/ranked.js','runtime/multiplayer-v255.js'])assert.ok(!runtime.includes(old));
 assert.ok(runtime.includes('runtime/profile-extras.js'));assert.ok(runtime.includes('runtime/hub-bridge.js'));
 const [sw,index,loader]=await Promise.all([read('public/sw.js'),read('index.html'),read('src/app/runtime-loader.js')]);
 for(const part of ['index','controller','model','view'])assert.ok(sw.includes(`src/trade-hub/${part}.js`));assert.match(index,/styles\/trade-hub.css/);assert.match(loader,/installTradeHub\(\)/);
});
test('hub install is idempotent and offline shops remain available',()=>{
 const {window,document}=parseHTML('<html><body><section id="earn"><div class="exchangeV154">Shop</div></section></body></html>');
 const hub=installTradeHub(window,document);assert.equal(installTradeHub(window,document),hub);assert.equal(document.querySelectorAll('#tradeHub').length,1);hub.view.tab='shops';hub.view.render();assert.equal(document.querySelector('.exchangeV154').hidden,false);hub.dispose();
});
test('cloud transaction holds keyboard and background collection operations until a verified pull',async()=>{
 const source=await read('public/runtime/progression.js');const section=source.slice(source.indexOf('  async function beginHubTransaction(){'),source.indexOf('  window.tcgCloudV192='));
 const {document}=parseHTML('<html><body><nav class="nav"></nav><section class="screen" id="rip"></section><section class="screen" id="earn"><div id="tradeHub"><button>Retry</button></div><div class="exchangeV154"></div></section></body></html>');
 const events={};document.addEventListener=(name,fn)=>events[name]=fn;let canPull=false,pushes=0;
 const ctx=vm.createContext({document,Map,Date,Number,Promise,Error,Object,clearTimeout,setTimeout,user:{id:'A'},recoveryPending:false,syncBusy:false,hubHold:false,syncTimer:null,busy:false,cloudVersion:7,storedVersion:()=>7,isDirty:()=>false,pushNow:async()=>{pushes++;return true;},pullInPlace:async()=>canPull});
 vm.runInContext(section,ctx);assert.equal(await ctx.beginHubTransaction(),7);assert.equal(pushes,1);assert.equal(ctx.hubHold,true);assert.equal(document.querySelector('#rip').inert,true);
 let stopped=0;events.keydown({target:document.querySelector('#rip'),preventDefault:()=>stopped++,stopImmediatePropagation:()=>stopped++});assert.equal(stopped,2);
 assert.notEqual(document.querySelector('.nav').inert,true);events.click({target:document.querySelector('.nav'),preventDefault:()=>stopped++,stopImmediatePropagation:()=>stopped++});assert.equal(stopped,2,'navigation stays available while collection controls remain protected');
 await assert.rejects(ctx.finishHubTransaction(),/pending/);assert.equal(ctx.hubHold,true);assert.equal(document.querySelector('#rip').inert,true);
 canPull=true;await ctx.finishHubTransaction();assert.equal(ctx.hubHold,false);assert.equal(document.documentElement.classList.contains('hub-transaction-pending'),false);
});
test('failed pre-transaction sync releases interaction and a playing pack cannot be interrupted',async()=>{
 const source=await read('public/runtime/progression.js');const section=source.slice(source.indexOf('  async function beginHubTransaction(){'),source.indexOf('  window.tcgCloudV192='));
 const {document}=parseHTML('<html><body><nav class="nav"></nav></body></html>');const ctx=vm.createContext({document,Map,Date,Number,Promise,Error,Object,clearTimeout,setTimeout,user:{id:'A'},recoveryPending:false,syncBusy:false,hubHold:false,syncTimer:null,busy:true,cloudVersion:7,storedVersion:()=>7,pushNow:async()=>false,pullInPlace:async()=>true});vm.runInContext(section,ctx);
 await assert.rejects(ctx.beginHubTransaction(),/Finish opening/);ctx.busy=false;await assert.rejects(ctx.beginHubTransaction(),/SYNC_REQUIRED/);assert.equal(document.documentElement.classList.contains('hub-transaction-pending'),false);
});
test('collection bridge preserves rank tiers and counts reserved cards in master progress',async()=>{
 const core=await read('public/runtime/core.js');const section=core.slice(core.indexOf('function setTotalsV57(){'),core.indexOf('function masterProgressV58('));
 const state={binder:{},bulkV64:{},hubEscrowV256:[{id:'card',setId:'sv04.5',qty:1}]};const ctx=vm.createContext({state,SETS:[{id:'sv04.5',name:'Test'}],cache:{},masterResolveSetV62:c=>c.setId});vm.runInContext(section,ctx);assert.equal(ctx.setTotalsV57()['sv04.5'].owned.size,1);
 const bridge=await read('public/runtime/hub-bridge.js');ctx.window={};vm.runInContext(bridge,ctx);ctx.window.tcgHubBridge.applyRank({name:'Collector',rp:700,wins:3,losses:2,ties:1,streak:2,season_high:1000},{escrow:[],totals:{sales:2,trades:4}});assert.equal(state.rankedV221.rp,700);assert.equal(state.rankedV221.seasonHigh,1000);assert.equal(state.hubTotalsV256.trades,4);assert.equal(ctx.setTotalsV57()['sv04.5'].owned.size,0);
});
test('startup session restoration holds a saved financial receipt before autosync',async()=>{
 const source=await read('public/runtime/progression.js');const section=source.slice(source.indexOf('  async function refreshSession(){'),source.indexOf('  async function getRemote(){'));
 let holds=0;const ctx=vm.createContext({sessionState:'restoring',sessionRetry:null,clearTimeout,setTimeout,client:{auth:{getSession:async()=>({data:{session:{user:{id:'A'}}}})}},user:null,setPendingEmail:()=>{},syncUI:()=>{},localStorage:{getItem:key=>key.endsWith(':A')?JSON.stringify({action:'listing_buy',id:'saved-request'}):null},holdHubTransaction:()=>holds++,JSON});vm.runInContext(section,ctx);await ctx.refreshSession();assert.equal(holds,1);assert.equal(ctx.user.id,'A');
});
