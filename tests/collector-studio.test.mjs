import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { cinematicProfile } from '../src/animations/packs/cinematic-profile.js';
import { filterBinderCards } from '../src/screens/binder/binder-model.js';
import { installBinderStudio } from '../src/screens/binder/studio.js';
import { installRevealController } from '../src/animations/packs/reveal-controller.js';
import { installRipStudio } from '../src/screens/rip/index.js';

test('holo has a quiet sheen and higher rarities escalate with bounded mobile effects',()=>{
 const rarities=['Common','Rare Holo','Double Rare','Ultra Rare','Special Illustration Rare','Hyper Rare'];
 const p=rarities.map(rarity=>cinematicProfile({rarity},{compact:true}));
 assert.equal(p[1].bolts,0); assert.equal(p[1].particles,0);
 assert.ok(p[2].bolts>0); assert.ok(p[5].bolts>p[2].bolts);
 for(const fx of [...p,cinematicProfile({finish:'God Pack'},{compact:true})]){
  assert.ok(fx.particles<=24);assert.ok(fx.duration<=2200);assert.ok(fx.rings<=3);
 }
});
test('fast and reduced motion suppress expensive effects without changing card classification',()=>{
 for(const options of [{fast:true},{reduced:true}]){
  const p=cinematicProfile({rarity:'Hyper Rare'},options);
  assert.equal(p.effect,'apex');assert.equal(p.bolts,0);assert.equal(p.rings,0);assert.equal(p.particles,0);assert.equal(p.quiet,true);
 }
});
test('gallery search, rarity, duplicates and ordering preserve every saved field',()=>{
 const cards=[{id:'a',name:'Zebra',number:'012',set:'Base',qty:3,rarity:'Common',tier:0,market:1,custom:{graded:true}},{id:'b',name:'Alpha',number:'210',set:'New',qty:1,rarity:'Hyper Rare',tier:5,market:20}];
 const before=structuredClone(cards),tier=c=>c.tier;
 assert.deepEqual(filterBinderCards(cards,{query:'012'}).map(c=>c.id),['a']);
 assert.deepEqual(filterBinderCards(cards,{query:'hyper'}).map(c=>c.id),['b']);
 assert.deepEqual(filterBinderCards(cards,{duplicates:true}).map(c=>c.id),['a']);
 assert.deepEqual(filterBinderCards(cards,{rarity:'chase',tier}).map(c=>c.id),['b']);
 assert.deepEqual(filterBinderCards(cards,{sort:'value'}).map(c=>c.id),['b','a']);
 assert.deepEqual(filterBinderCards(cards,{sort:'copies'}).map(c=>c.id),['a','b']);
 assert.deepEqual(cards,before);
});
test('gallery and physical view switches never write inventory or owned binders',async()=>{
 const {document,window}=parseHTML(await readFile(new URL('../public/ui/screens/binder.html',import.meta.url),'utf8'));
 const saved={binder:{a:{id:'a',qty:7}},binders:['midnight','pearl'],theme:'pearl'},before=structuredClone(saved);let rendered=0;
 const bridge={setPage(){},save(){throw Error('view changes must not save')}};
 installBinderStudio(bridge,()=>rendered++,document);
 document.querySelector('[data-binder-view=book]').dispatchEvent(new window.Event('click',{bubbles:true}));
 assert.equal(document.getElementById('binder').classList.contains('binder-gallery'),false);
 document.querySelector('[data-binder-view=gallery]').dispatchEvent(new window.Event('click',{bubbles:true}));
 assert.equal(document.getElementById('binder').classList.contains('binder-gallery'),true);
 assert.equal(rendered,2);assert.deepEqual(saved,before);
});
test('reveal waits for decoded artwork and cancels queued effects on the next card',()=>{
 const {document,window}=parseHTML('<html><body><div id="stack" data-face-ready="0"></div><img id="cardImg"><div id="v128Hero"></div></body></html>');
 const old={document:globalThis.document,CustomEvent:globalThis.CustomEvent};
 globalThis.document=document;globalThis.CustomEvent=class extends Event{constructor(name,options){super(name);this.detail=options.detail}};
 let frames=new Map(),id=0;
 const target=new EventTarget();Object.assign(target,{innerWidth:390,matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:i=>frames.delete(i)});
 const emit=(name,detail)=>{const event=new Event(name);Object.defineProperty(event,'detail',{value:detail});target.dispatchEvent(event)};
 try{
  const api=installRevealController(target);
  emit('tcg:card-reveal',{card:{id:'one',rarity:'Hyper Rare'},index:0});
  assert.equal(document.querySelector('#v254RevealFX').classList.contains('v254-active'),false);
  emit('tcg:card-reveal-start',{});assert.equal(frames.size,0);
  document.getElementById('stack').dataset.faceReady='1';
  emit('tcg:card-reveal',{card:{id:'two',rarity:'Rare Holo'},index:1});
  const [key,fn]=[...frames.entries()][0];frames.delete(key);fn();
  assert.equal(document.getElementById('v254RevealFX').dataset.v254Effect,'holo');
  assert.equal(document.querySelectorAll('.v254FxBolts i').length,0);
  api.clear();assert.equal(document.querySelector('#v254RevealFX').classList.contains('v254-active'),false);
 }finally{globalThis.document=old.document;globalThis.CustomEvent=old.CustomEvent;}
});

test('tap extraction finishes exactly once and opening actions respect busy and cloud guards',async()=>{
 const html=await readFile(new URL('../public/ui/screens/rip.html',import.meta.url),'utf8');
 const {document,window}=parseHTML(`<html><body>${html}<div id="v128Extract" class="on" data-token="7"><div class="v128Cards"></div></div></body></html>`);
 let begins=0,finishes=[];const snapshot={set:{name:'Test',series:'sv'},mode:1,busy:false,starterRemaining:1,credits:0};
 const target=new EventTarget();Object.assign(target,{MutationObserver:window.MutationObserver,finishRip:token=>finishes.push(token),TCG_PACK_LEGACY:{snapshot:()=>snapshot,begin:()=>{begins++}},tcgCloudV192:{hubHeld:false}});
 installRipStudio(target,document);
 const button=document.getElementById('studioExtract');
 for(const name of ['pointerdown','pointerup']){const event=new window.Event(name);event.clientX=40;event.clientY=50;button.dispatchEvent(event);}
 button.click();await new Promise(resolve=>setTimeout(resolve,650));assert.deepEqual(finishes,[7]);
 const open=document.getElementById('studioOpenPack');
 snapshot.busy=true;open.click();assert.equal(begins,0);
 snapshot.busy=false;target.tcgCloudV192.hubHeld=true;open.click();assert.equal(begins,0);
 target.tcgCloudV192.hubHeld=false;open.click();open.click();assert.equal(begins,1);
});
