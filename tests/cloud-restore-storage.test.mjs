import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/runtime/progression.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('  async function pullInPlace('),source.indexOf('  function ensurePasswordRecoveryUI('));
function fixture(){
 const old={coins:100,binder:{old:{qty:1}}},next={coins:92,binder:{old:{qty:1},new:{qty:1}}},writes=new Map();
 const c=vm.createContext({client:{},recoveryPending:false,user:{id:'A'},localRevision:1,hubHold:true,busy:false,state:old,version:1,dirty:true,
 console:{error(){}},refreshSession:async()=>({user:{id:'A'}}),getRemote:async()=>({save_version:2,save_data:{state:next,prefs:{music:true},audio:{volume:1},selectedSetId:'sv04.5'}}),
 clone:structuredClone,localStorage:{setItem:(k,v)=>writes.set(k,v)},setBound(){},setStoredVersion:v=>c.version=v,setDirty:v=>c.dirty=v,pausePush(){},STAMP_KEY:'stamp',syncUI(){},document:{getElementById:()=>null}});
 vm.runInContext(code,c);return {c,old,next,writes};
}
test('primary save quota failure retains live inventory, dirty flag and acknowledged version',async()=>{
 const {c,old}=fixture();c.localStorage.setItem=()=>{throw Object.assign(new Error('quota'),{name:'QuotaExceededError'})};
 assert.equal(await c.pullInPlace(),false);assert.equal(c.state,old);assert.equal(c.version,1);assert.equal(c.dirty,true);assert.match(c.pullInPlace.lastFailure,/storage is full/);assert.equal(c.hubHold,true);
});
test('optional preferences and timestamp quota failures do not block a persisted cloud restore',async()=>{
 const {c,next,writes}=fixture();c.localStorage.setItem=(k,v)=>{if(k!=='tcgRipperSave')throw Object.assign(new Error('quota'),{name:'QuotaExceededError'});writes.set(k,v)};
 assert.equal(await c.pullInPlace(),true);assert.equal(c.state.coins,next.coins);assert.deepEqual(c.state.binder,next.binder);assert.equal(c.version,2);assert.equal(c.dirty,false);assert.equal(c.pullInPlace.lastFailure,'');assert.equal(JSON.parse(writes.get('tcgRipperSave')).coins,92);
});
test('restore distinguishes changing local progress and never overwrites it',async()=>{
 const {c,old,writes}=fixture();const remote=c.getRemote;c.getRemote=async()=>{c.localRevision++;return remote()};
 assert.equal(await c.pullInPlace(),false);assert.equal(c.state,old);assert.equal(writes.size,0);assert.match(c.pullInPlace.lastFailure,/Local progress changed/);
});
test('network failure retains receipt hold and retry clears the diagnostic after success',async()=>{
 const {c}=fixture();const remote=c.getRemote;c.getRemote=async()=>{throw new Error('fetch failed')};
 assert.equal(await c.pullInPlace(),false);assert.match(c.pullInPlace.lastFailure,/could not be restored/);assert.equal(c.hubHold,true);
 c.getRemote=remote;assert.equal(await c.pullInPlace(),true);assert.equal(c.pullInPlace.lastFailure,'');assert.equal(c.version,2);
});
