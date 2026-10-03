import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { PackSession } from '../src/packs/pack-session.js';
import { createSaveEnvelope, CURRENT_SAVE_SCHEMA } from '../src/state/save-schema.js';
import { migrateSave } from '../src/state/migrations/index.js';
import { summarizePackCards } from '../src/packs/pack-results.js';
test('current saves preserve metadata and future saves cannot be downgraded', () => {
 const save=createSaveEnvelope({coins:80}); assert.equal(migrateSave(save).value,save);
 assert.throws(()=>migrateSave({...save,schemaVersion:CURRENT_SAVE_SCHEMA+1}), /newer/);
});
test('corrupt numeric values cannot poison pack totals or persistent counters', () => {
 const session=new PackSession({packsSinceGod:Infinity,hitStreak:-4,packsSinceSirPlus:'invalid'});
 const cards=Array.from({length:10},(_,i)=>({id:'card'+i,rarity:'Common',market:i%2?Infinity:'invalid'}));
 session.recordPack({cards,cashSpent:Infinity,starterUsed:'invalid',creditsUsed:-1});
 const snapshot=session.snapshot();
 for(const value of Object.values(snapshot.persistent)) assert.ok(Number.isFinite(value)&&value>=0);
 assert.equal(snapshot.session.cashSpent,0); assert.ok(Number.isFinite(snapshot.session.valueGenerated));
 assert.ok(Number.isFinite(summarizePackCards(cards).value));
});
test('service worker activation preserves unrelated origin caches', async () => {
 const handlers={},deleted=[]; let pending;
 const context={self:{addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{} }},caches:{keys:async()=>['other-app-cache','tcg-pack-ripper-old-static','tcg-pack-ripper-0.256.0-1-static'],delete:async key=>deleted.push(key)}};
 vm.runInNewContext(await readFile(new URL('../public/sw.js',import.meta.url),'utf8'),context);
 handlers.activate({waitUntil:value=>pending=value}); await pending;
 assert.deepEqual(deleted,['tcg-pack-ripper-old-static']);
});

test('production hashed bundles load from the precache while offline', async () => {
 const handlers={}; let response;
 const cached={body:'compiled app'};
 const context={URL,location:{origin:'https://game.test'},self:{addEventListener:(name,fn)=>handlers[name]=fn},
  fetch:async()=>{throw Error('offline')},
  caches:{open:async name=>({match:async()=>name.endsWith('-static')?cached:undefined})}};
 vm.runInNewContext(await readFile(new URL('../public/sw.js',import.meta.url),'utf8'),context);
 handlers.fetch({request:{method:'GET',url:'https://game.test/assets/index-abc.js'},respondWith:value=>response=value});
 assert.equal(await response,cached);
});
