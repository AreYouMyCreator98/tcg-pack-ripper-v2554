import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {HubController} from '../src/trade-hub/controller.js';
import {patchMarkup,createArtWarmer} from '../src/trade-hub/render.js';
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
function fixture(rpc){
 const map=new Map(),timers=new Map();let id=0;
 const clock={setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),setInterval:()=>0,clearInterval(){}};
 const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const channel={on:()=>channel,subscribe:()=>channel};
 const c=new HubController({client:{rpc,channel:()=>channel,removeChannel:async()=>{}},clock,storage,uuid:()=>`receipt-${++id}`});
 return {c,map,timers,clock,storage};
}
const room=(progress=0)=>({id:'battle',kind:'battle',status:'playing',host_id:'A',guest_id:'B',host_progress:progress,guest_progress:0,my_cards:Array.from({length:10},(_,i)=>({id:`c${i}`}))});
const snapshot=(progress=0)=>({version:256,user_id:'A',rooms:[room(progress)],profile:{rp:0}});

test('rapid battle presentation is instant while server acknowledges every ordinal in order',async()=>{
 const wait=deferred(),sent=[];let progress=0;
 const f=fixture(async(_,{p_action,p_payload})=>{
   if(p_action==='snapshot')return {data:snapshot(progress)};
   sent.push(p_payload.progress);if(sent.length===1)await wait.promise;
   assert.equal(p_payload.progress,progress+1);progress++;return {data:snapshot(progress)};
 });
 await f.c.setUser({id:'A'});const original=f.c.state.data.rooms[0];
 for(let i=0;i<10;i++)f.c.reveal(original);
 assert.equal(f.c.revealProgress(original),10);assert.equal(progress,0);
 assert.equal(JSON.parse(f.map.get(f.c.revealKey())).battle,10);
 wait.resolve();for(let i=0;i<30&&f.c.revealTask;i++)await tick();
 assert.deepEqual(sent,[1,2,3,4,5,6,7,8,9,10]);assert.equal(f.c.pending,null);assert.equal(f.map.has(f.c.revealKey()),false);await f.c.dispose();
});

test('lost reveal response recovers the same receipt automatically and resumes queued cards',async()=>{
 let first=true,progress=0;const sent=[];
 const f=fixture(async(_,{p_action,p_payload,p_request_id})=>{
   if(p_action==='snapshot')return {data:snapshot(progress)};
   sent.push([p_payload.progress,p_request_id]);progress=Math.max(progress,p_payload.progress);
   if(first){first=false;throw Error('response lost after commit');}return {data:snapshot(progress)};
 });
 await f.c.setUser({id:'A'});const r=f.c.state.data.rooms[0];f.c.reveal(r);f.c.reveal(r);await tick();
 assert.equal(f.c.pending.payload.progress,1);assert.equal(f.c.revealProgress(r),2);
 const retry=[...f.timers.values()].find(t=>t.ms===1000);assert.ok(retry);await retry.fn();await tick();
 assert.deepEqual(sent[0],sent[1]);assert.equal(sent[2][0],2);assert.equal(f.c.pending,null);await f.c.dispose();
});

test('reload resumes stored battle intent and account switch never sends it as another player',async()=>{
 let progress=0;const sent=[];const f=fixture(async(_,{p_action,p_payload})=>{
   if(p_action==='snapshot')return {data:snapshot(progress)};
   sent.push(p_payload.progress);progress=p_payload.progress;return {data:snapshot(progress)};
 });
 f.storage.setItem('tcg-hub-v256-reveals:A',JSON.stringify({battle:3}));
 await f.c.setUser({id:'A'});for(let i=0;i<10&&f.c.revealTask;i++)await tick();
 assert.deepEqual(sent,[1,2,3]);await f.c.setUser({id:'B'});await tick();assert.deepEqual(sent,[1,2,3]);await f.c.dispose();
});

test('recovery stops after three uncertain retries and disposal cancels timers',async()=>{
 let mutations=0;const f=fixture(async(_,{p_action})=>{if(p_action==='snapshot')return {data:snapshot()};mutations++;throw Error('offline');});
 await f.c.setUser({id:'A'});await assert.rejects(f.c.command('profile',{name:'A'}));
 for(const delay of [1000,3000,8000]){const [id,t]=[...f.timers].find(([,t])=>t.ms===delay);f.timers.delete(id);await t.fn();}
 assert.equal(mutations,4);assert.ok(f.c.pending);assert.equal(f.c.recoveryTimer,null);await f.c.dispose();assert.equal(f.timers.size,0);
});

test('read-only browsing and playing do not start economic heartbeats; queues and expiry do',()=>{
 const f=fixture();f.c.state.data=snapshot();assert.equal(f.c.needsHeartbeat(),false);
 f.c.state.data.rooms[0]={...room(),ranked:true,status:'waiting'};assert.equal(f.c.needsHeartbeat(),true);
 f.c.state.data.rooms[0]={...room(),expires_at:'2000-01-01'};assert.equal(f.c.needsHeartbeat(),true);
});

test('snapshot rendering retains decoded artwork, tapped button and expanded identity',()=>{
 const {document}=parseHTML('<div id="root"></div>'),root=document.getElementById('root');
 const markup=n=>`<details><summary>Identity</summary></details><div data-reveal-key="one"><img src="https://example.com/one.webp"><button>Next</button></div><p>${n}</p>`;
 patchMarkup(root,markup(0));const img=root.querySelector('img'),button=root.querySelector('button');root.querySelector('details').setAttribute('open','');
 patchMarkup(root,markup(1));assert.equal(root.querySelector('img'),img);assert.equal(root.querySelector('button'),button);assert.ok(root.querySelector('details').hasAttribute('open'));
 patchMarkup(root,markup(2).replace('data-reveal-key="one"','data-reveal-key="two"'));assert.notEqual(root.querySelector('img'),img);
});

test('hung card warmups have bounded concurrency and release slots after a deadline',()=>{
 const images=[],timers=new Map();let id=0;class Image{constructor(){images.push(this);}}
 const warm=createArtWarmer(Image,{setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id)});
 warm(['a','b','c','d']);assert.equal(images.length,2);[...timers.values()][0]();assert.equal(images.length,3);images[1].onload();assert.equal(images.length,4);
 warm(['a','b','c','d']);assert.equal(images.length,4);
});

test('a hung or failed card image cannot lock collection and a stale callback cannot reveal the next card',async()=>{
 const source=await readFile(new URL('../public/runtime/packs.js',import.meta.url),'utf8');
 const start=source.indexOf(' let faceSerial=0'),end=source.indexOf(' /* Collection saves',start);
 const {document}=parseHTML('<html><body><div id="stack"></div><div id="stage"></div><img id="cardImg"></body></html>');
 const timers=new Map();let id=0,fx=0;const img=document.getElementById('cardImg');
 const ctx=vm.createContext({document,window:{tcgModernRevealActive:true},pulls:[{id:'a',name:'A',thumb:'https://example.com/a'},{id:'b',name:'B',thumb:'https://example.com/b'}],idx:0,v114PackCount:1,showBack:null,setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>fn(),isBulkCardV64:()=>false,preloadWindow(){},updatePeekLayersV76(){},idle(){},sfxV67:()=>fx++});
 vm.runInContext(source.slice(start,end),ctx);ctx.showBack();const oldLoad=img.onload;
 assert.equal(document.getElementById('stack').dataset.faceReady,'0');[...timers.values()][0]();assert.equal(document.getElementById('stack').dataset.faceReady,'1');assert.equal(fx,1);
 ctx.idx=1;ctx.showBack();oldLoad();assert.equal(document.getElementById('stack').dataset.faceReady,'0');img.onerror();assert.equal(document.getElementById('stack').dataset.faceReady,'1');assert.equal(fx,2);
});
