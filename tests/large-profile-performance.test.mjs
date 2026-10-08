import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const core=readFileSync('public/runtime/core.js','utf8'),bridge=readFileSync('public/runtime/profile-bridge.js','utf8');
const hitCode=core.slice(core.indexOf('function collectedHitIndexV262'),core.indexOf('const requirementAuditCache'));
const scopeCode=bridge.slice(bridge.indexOf(' let collectionReads=null;'),bridge.indexOf(' const previous=renderProfile;'));
test('indexed chase ownership equals existing scan for large, legacy, escrow and historical collections',()=>{
 const state={binder:Object.fromEntries(Array.from({length:5000},(_,i)=>['c'+i,{id:'c'+i,setId:'a',name:'Card '+i,qty:1}])),hubEscrowV256:[{set:'Set B',name:'Farfetch’d ＆ Friend'}],chaseBadges:{b:{name:'Remembered Hit'}}};
 state.binder.legacy={set:'Set A',name:'Legacy Card',qty:0};const ctx=vm.createContext({state,SETS:[{id:'a',name:'Set A'},{id:'b',name:'Set B'}]});vm.runInContext(hitCode,ctx);const index=ctx.collectedHitIndexV262();
 for(const h of [{setId:'a',card:'Card 4999'},{setId:'a',card:'Legacy Card'},{setId:'b',card:"Farfetch'd & Friend"},{setId:'b',card:'Remembered Hit'},{setId:'a',card:'Missing'},{setId:'unknown',card:'Card 1'}])assert.equal(ctx.hasCollectedHit(h,index),ctx.hasCollectedHit(h),JSON.stringify(h));
 delete state.binder.c4999;assert.equal(ctx.hasCollectedHit({setId:'a',card:'Card 4999'},ctx.collectedHitIndexV262()),false);
});
test('Profile shares collection reads only during one synchronous render, including exception cleanup',()=>{
 const calls={hit:0,index:0,total:0,max:0,master:0};let value=7;
 const ctx=vm.createContext({hasCollectedHit:()=>{calls.hit++;return value>0;},collectedHitIndexV262:()=>{calls.index++;return {};},binderTotal:()=>{calls.total++;return value;},maxCardValue:()=>{calls.max++;return value;},setTotalsV57:()=>{calls.master++;return {a:{owned:new Set([value])}};}});vm.runInContext(scopeCode,ctx);
 const read=()=>{ctx.hasCollectedHit({setId:'a',card:'A'});ctx.binderTotal();ctx.maxCardValue();ctx.setTotalsV57();};ctx.withCollectionReads(()=>{for(let i=0;i<100;i++)read();ctx.withCollectionReads(read);});assert.deepEqual(calls,{hit:1,index:1,total:1,max:1,master:1});
 value=8;assert.equal(ctx.binderTotal(),8);ctx.withCollectionReads(()=>assert.equal(ctx.binderTotal(),8));assert.equal(calls.total,3);
 assert.throws(()=>ctx.withCollectionReads(()=>{read();throw Error('render failed');}),/render failed/);value=9;assert.equal(ctx.binderTotal(),9);
});
test('boolean set access skips impossible XP scans but retains unlocked sets and migration evaluation',()=>{
 const code=core.split('\n').find(l=>l.startsWith('function setUnlocked('));let scans=0;const state={xp:0,setUnlocksV259:['retained']};const ctx=vm.createContext({state,MEGA_SET_REQUIREMENTS:{premium:{xp:100}},xpFloor:lv=>(lv-1)**2*80,setRequirementState:()=>{scans++;return {done:true};}});vm.runInContext(code,ctx);
 assert.equal(ctx.setUnlocked({id:'retained',unlock:20}),true);assert.equal(ctx.setUnlocked({id:'premium'}),false);assert.equal(scans,0);
 state.xp=150;assert.equal(ctx.setUnlocked({id:'premium'}),true);assert.equal(scans,1);delete state.setUnlocksV259;ctx.setUnlocked({id:'premium'});assert.equal(scans,2);
});
test('identical Hub snapshots do not rerender Profile; actual rank or escrow changes still do',()=>{
 let renders=0,identity=0;const state={};const ctx=vm.createContext({window:{tcgProfileV227:{renderIdentity:()=>identity++}},document:{querySelector:()=>({})},state,renderProfile:()=>renders++});vm.runInContext(readFileSync('public/runtime/hub-bridge.js','utf8'),ctx);
 const profile={name:'QA',rp:6,wins:2,losses:1,ties:0,streak:1,season_high:20},data={escrow:[],totals:{}};
 ctx.window.tcgHubBridge.applyRank(profile,data);for(let i=0;i<50;i++)ctx.window.tcgHubBridge.applyRank({...profile},{escrow:[],totals:{}});assert.equal(renders,1);assert.equal(identity,1);
 ctx.window.tcgHubBridge.applyRank({...profile,rp:26},data);assert.equal(renders,2);ctx.window.tcgHubBridge.applyRank({...profile,rp:26},{...data,escrow:[{id:'card'}]});assert.equal(renders,3);
});
