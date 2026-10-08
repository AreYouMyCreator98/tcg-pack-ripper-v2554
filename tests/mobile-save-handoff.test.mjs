import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/runtime/progression.js',import.meta.url),'utf8');
const pushCode=source.slice(source.indexOf('  async function pushNow('),source.indexOf('  function pausePush('));
const reconcileCode=source.slice(source.indexOf('  async function reconcile(){'),source.indexOf('  async function pullInPlace('));
function fixture(){
 const ctx=vm.createContext({console,client:{rpc:async()=>({data:{save_version:2}})},user:{id:'A'},saveOwner:'A',switchBackupOwner:undefined,syncBusy:false,hubHold:false,recoveryPending:false,reconcileBusy:false,localRevision:1,pushPausedUntil:0,cloudVersion:1,isBound:()=>true,storedVersion:()=>1,refreshSession:async()=>({user:{id:'A'}}),snapshot:()=>({state:{binder:{card:{qty:1}}}}),deviceId:'test',setStoredVersion:v=>ctx.cloudVersion=v,setDirty:v=>ctx.dirty=v,setBound:()=>{},localStorage:{setItem(){}},STAMP_KEY:'stamp',syncUI:()=>{},toast:()=>{},setStatus:()=>{},dirty:true});
 vm.runInContext(pushCode,ctx);return ctx;
}
test('progress made during an in-flight save remains pending, then uploads on the next save',async()=>{
 const c=fixture();let done;const gate=new Promise(r=>done=r);c.client.rpc=async()=>{await gate;return {data:{save_version:2}}};
 const upload=c.pushNow();await new Promise(r=>setImmediate(r));c.localRevision++;done();await upload;
 assert.equal(c.dirty,true);assert.equal(c.cloudVersion,2);await c.pushNow();assert.equal(c.dirty,false);
});
test('a late reply from another account cannot clear or version the current account',async()=>{
 const c=fixture();c.client.rpc=async()=>{c.user={id:'B'};return {data:{save_version:99}}};await c.pushNow();assert.equal(c.dirty,true);assert.equal(c.cloudVersion,1);
});
test('a new browser cannot auto-upload local progress before account reconciliation',async()=>{
 const c=fixture();c.isBound=()=>false;let writes=0;c.client.rpc=async()=>{writes++;return {data:{}}};assert.equal(await c.pushNow(),false);assert.equal(writes,0);
});
test('small differences on first login restore the account collection without a reload',async()=>{
 const c=fixture();let restored=0,bound=false;c.isBound=()=>bound;
 Object.assign(c,{state:{binder:{local:{qty:1}}},getRemote:async()=>({save_version:12,save_data:{state:{binder:{cloud:{qty:1}}}}}),readStateKey:()=>null,PRECLOUD_KEY:'pre',clone:x=>structuredClone(x),meaningful:()=>true,materiallyDifferent:()=>false,pullInPlace:async()=>{restored++;bound=true;return true;}});
 vm.runInContext(reconcileCode,c);await c.reconcile();assert.equal(restored,1);assert.equal(c.reconcileBusy,false);
});
test('failed initial restore stays unbound and retries on the next reconciliation',async()=>{
 const c=fixture();let bound=false,reads=0;c.isBound=()=>bound;c.setBound=()=>bound=true;
 Object.assign(c,{state:{},getRemote:async()=>({save_version:12,save_data:{state:{binder:{card:{qty:1}}}}}),readStateKey:()=>null,PRECLOUD_KEY:'pre',clone:x=>structuredClone(x),meaningful:st=>!!st.binder,materiallyDifferent:()=>false,pullInPlace:async()=>{reads++;return false;},console:{error(){}}});
 vm.runInContext(reconcileCode,c);await c.reconcile();await c.reconcile();assert.equal(bound,false);assert.equal(reads,2);
});

test('provisional pack transactions never upload a partial account snapshot',async()=>{
 const c=fixture();let uploads=0;c.client.rpc=async()=>{uploads++;return{data:{save_version:2}}};
 c.tcgPackTransaction={};assert.equal(await c.pushNow(),false);assert.equal(uploads,0);
 c.tcgPackTransaction=null;c.refreshSession=async()=>{c.tcgPackTransaction={};return{user:{id:'A'}}};assert.equal(await c.pushNow(),false);assert.equal(uploads,0);assert.equal(c.syncBusy,false);
});

test('account switch cannot upload the previous collection, even with force and a stored binding',async()=>{
 const c=fixture();c.user={id:'B'};let writes=0;c.client.rpc=async()=>{writes++;return {data:{save_version:50}}};
 assert.equal(await c.pushNow(false,true),false);assert.equal(writes,0);
});
test('account changes during session refresh cannot send an old collection under the new identity',async()=>{
 const c=fixture();let writes=0;c.client.rpc=async()=>{writes++;return {data:{save_version:50}}};c.refreshSession=async()=>{c.user={id:'B'};return{user:c.user}};
 assert.equal(await c.pushNow(false,true),false);assert.equal(writes,0);
});
test('previously bound destination account still restores cloud before any upload',async()=>{
 const c=fixture();let restored=0,archived=0,uploads=0;c.user={id:'B'};c.refreshSession=async()=>({user:c.user});c.isBound=()=>true;
 Object.assign(c,{state:{binder:{qa:{qty:1}}},getRemote:async()=>({save_version:2,save_data:{state:{binder:{original:{qty:5}}}}}),tcgBackupArchiveV262:{preserve:async()=>archived++},pullInPlace:async()=>{restored++;return true}});
 c.client.rpc=async()=>{uploads++;return {data:{save_version:3}}};vm.runInContext(reconcileCode,c);await c.reconcile();assert.equal(restored,1);assert.equal(archived,1);assert.equal(uploads,0);
});
