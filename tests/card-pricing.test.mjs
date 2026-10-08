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
const bridgeSource=await readFile(new URL('../public/runtime/collector-bridge.js',import.meta.url),'utf8');
function bridgeFixture(){const state={binder:{},bulkV64:{},gradingV44:{graded:[{id:'sv04.5-234',raw:.1,grade:9.5,cert:'retained'}],submissions:[]}};let finish;const gate=new Promise(r=>finish=r),ctx=vm.createContext({window:{},state,detailCache:{},hydrateCard:async card=>{await gate;ctx.detailCache[card.id]={id:card.id,pricing:{tcgplayer:{unit:'USD',holofoil:{marketPrice:256.74}}}}},marketQuoteFromDetail:c.marketQuoteFromDetail});vm.runInContext(bridgeSource,ctx);const bridge=ctx.window.tcgCollectorBridge;let account='A',saves=0;bridge.account=()=>account;bridge.blocked=()=>false;bridge.save=()=>saves++;return{ctx,state,bridge,finish,setAccount:x=>account=x,get saves(){return saves}}}
test('on-demand quote repairs raw slab valuation without changing grade, certificate or ownership',async()=>{const f=bridgeFixture(),p=f.bridge.refreshMarket({id:'sv04.5-234',finish:'Hit Foil'});f.finish();await p;assert.equal(f.state.gradingV44.graded[0].raw,256.74);assert.equal(f.state.gradingV44.graded[0].grade,9.5);assert.equal(f.state.gradingV44.graded[0].cert,'retained');assert.equal(f.state.gradingV44.graded.length,1);assert.equal(f.saves,1)});
test('late price replies cannot modify a switched account or replaced save',async()=>{for(const change of ['account','state']){const f=bridgeFixture(),p=f.bridge.refreshMarket({id:'sv04.5-234',finish:'Hit Foil'});if(change==='account')f.setAccount('B');else f.ctx.state={};f.finish();assert.equal(await p,null);assert.equal(f.state.gradingV44.graded[0].raw,.1);assert.equal(f.saves,0)}});
