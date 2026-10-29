import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const core=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const c=vm.createContext({});vm.runInContext(core.slice(core.indexOf('function marketQuoteFromDetail('),core.indexOf('async function hydrateCard')),c);
test('Charizard holofoil USD quote is parsed without applying the game fluctuation',()=>{
 const q=c.marketQuoteFromDetail({pricing:{tcgplayer:{unit:'USD',updated:'2026-10-07',holofoil:{marketPrice:256.74}},cardmarket:{unit:'EUR',trend:242.2}}},'Hit Foil');assert.equal(q.amount,256.74);assert.equal(q.currency,'USD');
});
test('missing prices and EUR-only data are not presented as dollar market quotes',()=>{
 assert.equal(c.marketQuoteFromDetail({}),null);assert.equal(c.marketQuoteFromDetail({pricing:{cardmarket:{unit:'EUR',trend:242.2}}}),null);assert.equal(c.marketQuoteFromDetail({pricing:{tcgplayer:{unit:'EUR',normal:{marketPrice:99}}}}),null);
});
test('reverse foil pricing stays separate and invalid amounts do not mask valid quotes',()=>{
 const x={pricing:{tcgplayer:{normal:{marketPrice:1},holofoil:{marketPrice:3},'reverse-holofoil':{marketPrice:0,midPrice:2}}}};assert.equal(c.marketQuoteFromDetail(x,'Reverse Holo').amount,2);assert.equal(c.marketQuoteFromDetail(x,'Holo').amount,3);delete x.pricing.tcgplayer['reverse-holofoil'];assert.equal(c.marketQuoteFromDetail(x,'Reverse Holo'),null);
});
test('the official holo and reverse aliases are accepted without using a wrong printing',()=>{
 const detail={pricing:{tcgplayer:{unit:'USD',normal:{marketPrice:1},holo:{marketPrice:324.63},reverse:{marketPrice:2}}}};
 assert.equal(c.marketQuoteFromDetail(detail,'Holo / Rare+').amount,324.63);
 assert.equal(c.marketQuoteFromDetail(detail,'Reverse Holo').amount,2);
 assert.equal(c.marketQuoteFromDetail({pricing:{tcgplayer:{unit:'USD',normal:{marketPrice:1}}}},'Holo'),null);
});
const bridgeSource=await readFile(new URL('../public/runtime/collector-bridge.js',import.meta.url),'utf8');
function bridgeFixture(){const state={binder:{},bulkV64:{},gradingV44:{graded:[{id:'sv04.5-234',raw:.1,grade:9.5,cert:'retained'}],submissions:[]}};let finish;const gate=new Promise(r=>finish=r),ctx=vm.createContext({window:{},state,detailCache:{},hydrateCard:async card=>{await gate;ctx.detailCache[card.id]={id:card.id,pricing:{tcgplayer:{unit:'USD',holofoil:{marketPrice:256.74}}}}},marketQuoteFromDetail:c.marketQuoteFromDetail});vm.runInContext(bridgeSource,ctx);const bridge=ctx.window.tcgCollectorBridge;let account='A',saves=0;bridge.account=()=>account;bridge.blocked=()=>false;bridge.save=()=>saves++;return{ctx,state,bridge,finish,setAccount:x=>account=x,get saves(){return saves}}}
test('on-demand quote repairs raw slab valuation without changing grade, certificate or ownership',async()=>{const f=bridgeFixture(),p=f.bridge.refreshMarket({id:'sv04.5-234',finish:'Hit Foil'});f.finish();await p;assert.equal(f.state.gradingV44.graded[0].raw,256.74);assert.equal(f.state.gradingV44.graded[0].grade,9.5);assert.equal(f.state.gradingV44.graded[0].cert,'retained');assert.equal(f.state.gradingV44.graded.length,1);assert.equal(f.saves,1)});
test('checking the price fetches current market data even after artwork cached an older quote',async()=>{
 const f=bridgeFixture();f.ctx.detailCache['sv04.5-234']={id:'sv04.5-234',pricing:{tcgplayer:{unit:'USD',holofoil:{marketPrice:100}}}};
 const p=f.bridge.refreshMarket({id:'sv04.5-234',finish:'Hit Foil'});f.finish();
 assert.equal((await p).amount,256.74);
 assert.equal(f.state.gradingV44.graded[0].raw,256.74);
});
test('late price replies cannot modify a switched account or replaced save',async()=>{for(const change of ['account','state']){const f=bridgeFixture(),p=f.bridge.refreshMarket({id:'sv04.5-234',finish:'Hit Foil'});if(change==='account')f.setAccount('B');else f.ctx.state={};f.finish();assert.equal(await p,null);assert.equal(f.state.gradingV44.graded[0].raw,.1);assert.equal(f.saves,0)}});
test('saved USD market quote remains visible while pricing is offline, without mutating the slab',async()=>{
 const f=bridgeFixture(),slab=f.state.gradingV44.graded[0];slab.marketQuoteV262={amount:256.74,currency:'USD',source:'TCGplayer via TCGdex',updated:'2026-10-14'};
 f.ctx.hydrateCard=async()=>{};
 const p=f.bridge.refreshMarket({id:slab.id,finish:'Holo'});
 const value=await p;assert.equal(value.amount,256.74);assert.equal(value.cached,true);
 assert.equal(slab.raw,.1);assert.equal(f.saves,0);
});
test('same-origin verified backup repairs Mew ex 232 penny-valued slabs while keeping grades and ownership',async()=>{
 const mew={id:'sv04.5-232',name:'Mew ex',finish:'Holo / Rare+',raw:.1,grade:9.5,uid:'mew-cert',cert:'VG-123'};
 const existing={id:'sv04.5-234',raw:240,grade:10,uid:'another-cert'};
 const state={binder:{},bulkV64:{},gradingV44:{graded:[mew,existing],submissions:[]}},backup={schema:1,cards:{'sv04.5-232':{unit:'USD',updated:'2026-10-14T22:55:10Z',holofoil:{marketPrice:863.85}}}};
 const ctx=vm.createContext({window:{},document:{baseURI:'https://example.test/game/'},URL,fetch:async()=>({ok:true,json:async()=>backup}),state,detailCache:{},hydrateCard:async()=>{},marketQuoteFromDetail:c.marketQuoteFromDetail});
 vm.runInContext(bridgeSource,ctx);const bridge=ctx.window.tcgCollectorBridge;
 let saves=0,renders=0;bridge.account=()=> 'account-1';bridge.blocked=()=>false;bridge.save=()=>saves++;bridge.refresh=()=>renders++;
 assert.equal(await bridge.restoreMissingPrices(),1);
 assert.equal(mew.raw,863.85);assert.equal(mew.grade,9.5);assert.equal(mew.uid,'mew-cert');assert.equal(mew.cert,'VG-123');
 assert.equal(state.gradingV44.graded.length,2);assert.equal(existing.raw,240);assert.equal(saves,1);assert.equal(renders,1);
 assert.equal((await bridge.refreshMarket(mew)).amount,863.85);
 assert.equal(saves,1);
});
test('verified fallback is visible immediately while a slow live refresh continues in background',async()=>{
 const f=bridgeFixture(),slab=f.state.gradingV44.graded[0];slab.raw=.1;
 f.ctx.document={baseURI:'https://example.test/game/'};f.ctx.URL=URL;
 f.ctx.fetch=async()=>({ok:true,json:async()=>({schema:1,cards:{'sv04.5-234':{unit:'USD',updated:'2026-10-14',holofoil:{marketPrice:250}}}})});
 const quote=await f.bridge.refreshMarket({id:slab.id,finish:'Hit Foil'},{useBackupImmediately:true});
 assert.equal(quote.amount,250);assert.equal(quote.cached,true);assert.equal(slab.raw,250);
 f.finish();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(slab.raw,256.74);
});
test('premium cards without any provider quote get a clearly flagged non-penny game estimate',async()=>{
 const rare={id:'not-quoted-232',rarity:'Special illustration rare',finish:'Holo',raw:.1,grade:9.5,uid:'no-quote'},vintage={id:'base1-4',rarity:'Rare Holo',edition:'1st Edition',firstEdition:true,raw:.1,grade:9.5,uid:'vintage'};
 const state={binder:{},bulkV64:{},gradingV44:{graded:[rare,vintage],submissions:[]}};
 const ctx=vm.createContext({window:{},document:{baseURI:'https://example.test/game/'},URL,fetch:async()=>({ok:true,json:async()=>({schema:1,cards:{}})}),state,detailCache:{},hydrateCard:async()=>{},marketQuoteFromDetail:c.marketQuoteFromDetail});
 vm.runInContext(bridgeSource,ctx);const bridge=ctx.window.tcgCollectorBridge;let saves=0;bridge.account=()=> 'a';bridge.blocked=()=>false;bridge.save=()=>saves++;bridge.refresh=()=>{};
 assert.equal(await bridge.restoreMissingPrices(),1);assert.equal(rare.raw,26);assert.equal(rare.grade,9.5);
 assert.equal(rare.gameEstimateSourceV26410,'Rarity-based game value');assert.equal(rare.marketQuoteV262,undefined);
 assert.equal(vintage.raw,.1);assert.equal(saves,1);
});
