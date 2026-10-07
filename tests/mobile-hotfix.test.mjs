import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,stat} from 'node:fs/promises';
import {cardImageMarkup} from '../src/artwork/card-image.js';
const source=await readFile(new URL('../public/runtime/pack-bridge.js',import.meta.url),'utf8');
function fixture({fail=false,full=false}={}){
 const initial={coins:800,packs:20,binder:{},bulkV64:{},xp:0,history:[]},disk=new Map([['tcgRipperSave',JSON.stringify(initial)]]),writes=[],snapshots=[];
 const node={classList:{add(){},remove(){}},textContent:''};let call=0;
 const ctx=vm.createContext({sel:{id:'set'},state:structuredClone(initial),busy:false,v114PackCount:10,pulls:[],v114BatchGroups:Array.from({length:10},()=>[]),idx:0,performance,URLSearchParams,location:{search:'?debug'},console:{debug(){}},setTimeout,JSON,Date,Error,Promise,CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail}},document:{getElementById:()=>node},localStorage:{getItem:k=>disk.get(k)},beginRip(){},canAffordPackV161:()=>true,buildPools:async()=>({all:[{id:'c'}]}),toast(){},tier:()=>1,routeOf:()=> 'bulk',cloneCards:a=>a.map(c=>({...c})),cloneCard:c=>({...c}),selectedSet:()=>({id:'set',name:'Set'}),ownsCardV260:id=>!!ctx.state.bulkV64[id],awardChase(){},emit(){},resetPack(){ctx.pulls=[]},save(){if(ctx.tcgPackTransaction)return;if(full)return;writes.push(structuredClone(ctx.state));disk.set('tcgRipperSave',JSON.stringify(ctx.state))},addToBulkV64(c){ctx.state.bulkV64[c.id]??={qty:0};ctx.state.bulkV64[c.id].qty++},addToBinderV64(){throw Error('wrong route')},v2601RewardPack(){ctx.state.xp+=10;ctx.save()},showPackSummaryV88(){ctx.busy=false}});
 ctx.window=ctx;ctx.dispatchEvent=()=>{};ctx.tcgCollectorBridge={account:()=> 'local'};
 ctx.v114MakeBatch=async()=>{call++;for(let p=0;p<10;p++){ctx.state.coins-=8;ctx.state.packs++;ctx.pulls.push(...Array.from({length:10},(_,i)=>({id:'card-'+p+'-'+i})));ctx.save();snapshots.push(disk.get('tcgRipperSave'));if(fail&&p===3)throw Error('catalog interrupted');await new Promise(r=>setTimeout(r,0));}return true;};
 vm.runInContext(source.slice(source.indexOf('  const legacyBegin=beginRip;'),source.indexOf('  const resetBeforeResults=')),ctx);
 return{ctx,disk,writes,snapshots,initial,calls:()=>call};
}
test('10-pack commits payment, 100 routed cards, XP and result in one durable write',async()=>{
 const f=fixture();assert.equal(await f.ctx.beginRip(),true);assert.equal(f.writes.length,1);const s=f.writes[0];assert.equal(s.coins,720);assert.equal(s.packs,30);assert.equal(s.xp,100);assert.equal(Object.values(s.bulkV64).reduce((n,c)=>n+c.qty,0),100);assert.equal(s.lastPackResultV2601.cards.length,100);assert.ok(f.snapshots.every(s=>s===JSON.stringify(f.initial)));
});
test('rapid 10-pack activation generates only one batch',async()=>{const f=fixture();const first=f.ctx.beginRip();assert.equal(await f.ctx.beginRip(),false);await first;assert.equal(f.calls(),1);assert.equal(f.writes.length,1);});
for(const options of [{fail:true},{full:true}])test('interrupted generation or failed durable save restores uncharged inventory '+JSON.stringify(options),async()=>{const f=fixture(options);assert.equal(await f.ctx.beginRip(),false);assert.deepEqual(JSON.parse(JSON.stringify(f.ctx.state)),f.initial);assert.equal(f.disk.get('tcgRipperSave'),JSON.stringify(f.initial));assert.equal(f.ctx.tcgPackTransaction,null);});
test('unaffordable ten-pack performs no generation or write',async()=>{const f=fixture();f.ctx.canAffordPackV161=()=>false;assert.equal(await f.ctx.beginRip(),false);assert.equal(f.calls(),0);assert.equal(f.writes.length,0);});
test('all nineteen Special sources are real WebP files, using exact case and Pages-relative paths',async()=>{const s=await readFile(new URL('../public/runtime/special-collection.js',import.meta.url),'utf8');const paths=[...s.matchAll(/"art":"([^"]+)"/g)].map(m=>m[1]);assert.equal(paths.length,19);for(const path of paths){const file=new URL('../public/'+path,import.meta.url),bytes=await readFile(file);assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.ok((await stat(file)).size>1000);}assert.match(s,/src=\"\$\{escV198\(window\.tcgCardAssets\?\.resolve\?\.\(card,'thumb'\)\|\|card.art\)\}\"/);assert.doesNotMatch(await readFile(new URL('../public/runtime/packs.js',import.meta.url),'utf8'),/specialGridV198[^\n]*removeAttribute\('src'\)/);});
test('lightweight card image preserves identity, escapes labels, uses thumbnails and exposes fallback',()=>{const html=cardImageMarkup({id:'one',name:'<broken>',thumb:'https://example.com/low.webp',img:'https://example.com/high.webp'});assert.match(html,/data-card-image="one"/);assert.match(html,/low.webp/);assert.match(html,/src="https:\/\/example.com\/low.webp"/);assert.doesNotMatch(html,/<broken>/);assert.match(html,/loading="lazy" decoding="async"/);assert.match(cardImageMarkup({id:'bad',img:'javascript:alert(1)'}),/ARTWORK UNAVAILABLE/);});

test('one ownership snapshot produces identical Master Set counts and percentages for all sets',async()=>{
 const core=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8'),body=core.match(/function masterProgressV58\(set,totals=setTotalsV57\(\)\)\{[^\n]+/)[0];
 let scans=0;const totals={a:{owned:new Set(['1','2']),total:3},b:{owned:new Set(['x']),total:0},c:{owned:new Set(['1','2','3']),total:2}};
 const ctx=vm.createContext({setTotalsV57:()=>{scans++;return totals}});vm.runInContext(body,ctx);
 const direct=['a','b','c'].map(id=>ctx.masterProgressV58({id}));assert.equal(scans,3);scans=0;const shared=ctx.setTotalsV57();const batched=['a','b','c'].map(id=>ctx.masterProgressV58({id},shared));assert.equal(scans,1);assert.deepEqual(batched,direct);
});
