import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const core=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const bridgeSource=await readFile(new URL('../public/runtime/pack-bridge.js',import.meta.url),'utf8');
const section=(a,b)=>core.slice(core.indexOf(a),core.indexOf(b,core.indexOf(a)));
function generator(){
 const cards=Array.from({length:90},(_,i)=>({id:'test-'+i,name:'Card '+i,rarity:i>75?'Special illustration rare':'Common',tier:i>75?4:0,market:1}));
 const P={all:cards,common:cards.slice(0,30),uncommon:cards.slice(30,50),rare:cards.slice(50,70),big:cards.slice(70)};
 for(const r of ['Illustration rare','Ultra Rare','Special illustration rare','Hyper rare','Double rare','ACE SPEC Rare','Rare Holo','Holo Rare','Secret Rare','Prism Star'])P[r]=cards.slice(70);
 const ctx=vm.createContext({P,sel:{id:'test',name:'Test Set',series:'sv'},state:{coins:80000,packs:0,starterV199:{eligible:false}},pulls:[],GOD_PACK_RATE:.001,Math,Number,Set,Object,Array,console,navigator:{},setTimeout:()=>0,toast:()=>{},resetPack:()=>{},save:()=>{},warmPack:()=>{},tier:c=>c.tier||0,buildPools:async()=>ctx.P,canAffordPackV161:()=>ctx.state.coins>=8,payForPackV161:()=>{ctx.state.coins-=8},addWildcard:()=>false,maybeSubsetHitV187:()=>false});
 vm.runInContext(section('function pick(a)','async function buildPools(')+section('function weighted(groups)','function makeGodPack(')+section('function makeGodPack(','function v114RenderMode()'),ctx);
 return ctx;
}
test('4,000 core pack generations across four eras award ten valid cards and charge exactly once',async()=>{
 const ctx=generator();
 for(const series of ['sv','swsh','sm','xy']){ctx.sel.series=series;for(let i=0;i<1000;i++){assert.equal(await ctx.makePack(),true);assert.equal(ctx.pulls.length,10);assert.ok(ctx.pulls.every(c=>c.id));}}
 assert.equal(ctx.state.packs,4000);assert.equal(ctx.state.coins,48000);
});
test('empty catalog returns without charging or hanging',async()=>{
 const ctx=generator();ctx.P={all:[],common:[],uncommon:[],rare:[],big:[]};assert.equal(await ctx.makePack(),false);assert.equal(ctx.state.coins,80000);assert.equal(ctx.state.packs,0);
});
test('a tiny fallback catalog still finishes with ten awarded cards',async()=>{
 const ctx=generator();ctx.P={all:[{id:'fallback',rarity:'Common'}],common:[],uncommon:[],rare:[],big:[]};assert.equal(await ctx.makePack(),true);assert.equal(ctx.pulls.length,10);
});
test('unaffordable packs do not generate, charge, or increment counters',async()=>{
 const ctx=generator();ctx.state.coins=0;assert.equal(await ctx.makePack(),false);assert.equal(ctx.state.packs,0);assert.equal(ctx.pulls.length,0);
});
for(const failure of ['false','throw'])test('batch '+failure+' restores balances and progress after partial generation',async()=>{
 const state={coins:80,packs:3,starterV199:{remaining:2},sealedV161:{packCredits:{test:2},inventory:{box:1}},gradingV44:{openedForGrading:5},recentHitsV188:['old']};
 const before=JSON.stringify(state);let count=0;
 const ctx=vm.createContext({state,sel:{id:'test'},v114BatchGroups:[],pulls:[],idx:0,canAffordPackV161:()=>true,toast:()=>{},resetPack:()=>{},save:()=>{},warmPack:()=>{},makePack:async()=>{if(++count===4){if(failure==='throw')throw Error('network');return false}state.coins-=8;state.packs++;state.starterV199.remaining=0;state.sealedV161.packCredits.test=0;state.gradingV44.openedForGrading++;state.recentHitsV188=['new'];state.packStatsV253={packsSinceGod:3};ctx.pulls=Array.from({length:10},(_,i)=>({id:String(i)}));return true}});
 vm.runInContext(section('async function v114MakeBatch()','function v114BatchFinish()'),ctx);
 if(failure==='throw')await assert.rejects(ctx.v114MakeBatch(),/network/);else assert.equal(await ctx.v114MakeBatch(),false);
 assert.equal(JSON.stringify(state),before);assert.equal(ctx.pulls.length,0);
});
function bridge(batchFailure=false){
 const events=[],owned=[];
 const ctx=vm.createContext({console:{error:()=>{}},state:{coins:80,packs:0,binder:{},bulkV64:{}},sel:{id:'test'},v114PackCount:10,idx:0,busy:true,pulls:Array.from({length:100},(_,i)=>({id:'card'+i,rarity:i%2?'Common':'Double rare'})),makePack:async()=>true,v114MakeBatch:async()=>true,showBack:()=>{},autoCollectV74:()=>false,decide:()=>{},showPackSummaryV88:()=>{},save:()=>{},tier:()=>0,isBulkCardV64:c=>c.rarity==='Common',awardChase:()=>{},addToBulkV64:c=>owned.push(c.id),addToBinderV64:c=>owned.push(c.id),advance:()=>{ctx.busy=false},queueMicrotask:fn=>fn(),CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail}},beginRip:()=>{}});
 ctx.window=ctx;ctx.dispatchEvent=e=>events.push(e);if(batchFailure)ctx.v114MakeBatch=async()=>{await ctx.makePack();return false};vm.runInContext(bridgeSource,ctx);return {ctx,events,owned};
}
test('Reveal All awards exactly the remaining 73 cards; repeated calls award none',()=>{
 const {ctx,owned}=bridge();ctx.idx=27;const result=ctx.TCG_PACK_LEGACY.collectRemaining();assert.equal(result.collected,73);assert.equal(new Set(owned).size,73);assert.equal(ctx.TCG_PACK_LEGACY.collectRemaining().ok,false);assert.equal(owned.length,73);
});
test('locked decision emits no collection event',()=>{
 const {ctx,events}=bridge();ctx.decisionLock=true;ctx.decide(true);assert.equal(events.filter(e=>e.type==='tcg:card-collected').length,0);
});
test('Reveal All retry after finish failure never duplicates awards',()=>{
 const {ctx,owned}=bridge();ctx.advance=()=>{throw Error('render failed')};assert.equal(ctx.TCG_PACK_LEGACY.collectRemaining().reason,'finish-failed');assert.equal(owned.length,100);ctx.advance=()=>{ctx.busy=false};assert.equal(ctx.TCG_PACK_LEGACY.collectRemaining().ok,true);assert.equal(owned.length,100);
});
test('failed batches do not publish provisional pack-generation events',async()=>{
 const {ctx,events}=bridge(true);events.length=0;assert.equal(await ctx.v114MakeBatch(),false);assert.equal(events.filter(e=>e.type==='tcg:pack-generated').length,0);
});

test('single-card collection waits for artwork and rarity locks, then awards once',()=>{
 const {ctx,owned}=bridge();let ready='0',advanceTimer;
 ctx.document={getElementById:()=>({dataset:{faceReady:ready}})};
 ctx.setTimeout=fn=>{advanceTimer=fn};
 ctx.autoCollectV74=c=>{if(ctx.v74CollectLock)return false;ctx.v74CollectLock=true;owned.push(c.id);return true};
 assert.equal(ctx.TCG_PACK_LEGACY.collectCurrent(),false);ready='1';
 ctx.v128HeroPlaying=true;assert.equal(ctx.TCG_PACK_LEGACY.collectCurrent(),false);ctx.v128HeroPlaying=false;
 ctx.v124RareLockUntil=Date.now()+5000;assert.equal(ctx.TCG_PACK_LEGACY.collectCurrent(),false);ctx.v124RareLockUntil=0;
 assert.equal(ctx.TCG_PACK_LEGACY.collectCurrent(),true);assert.equal(ctx.TCG_PACK_LEGACY.collectCurrent(),false);
 assert.deepEqual(owned,['card0']);advanceTimer();assert.equal(ctx.busy,false);
 assert.equal(ctx.TCG_PACK_LEGACY.collectCurrent(),false);
});
