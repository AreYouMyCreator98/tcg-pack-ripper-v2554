import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/runtime/progression.js',import.meta.url),'utf8');
const code=source.slice(0,source.indexOf('/* ===== original script 19'));
function fixture(){
 const local=new Map(),disk=new Map();let limit=150,abort=false,corrupt=false,beforeComplete=()=>{};
 const db={close(){},transaction(_,mode){const tx={error:Error('archive unavailable'),abort(){tx.onabort?.()},objectStore(){return {get(id){const q={};setImmediate(()=>{q.result=corrupt?'wrong':disk.get(id);tx.oncomplete?.()});return q},put(value,id){const q={};setImmediate(()=>{if(abort){tx.onabort?.();return}disk.set(id,value);beforeComplete();q.result=id;tx.oncomplete?.()});return q}}}};return tx}};
 const c=vm.createContext({setTimeout,clearTimeout,crypto:{randomUUID},indexedDB:{open(){const q={result:db};setImmediate(()=>q.onsuccess());return q}},localStorage:{getItem:k=>local.get(k)??null,setItem(k,v){const size=[...local].reduce((n,[key,x])=>n+(key===k?0:x.length),v.length);if(size>limit)throw Object.assign(Error('full'),{name:'QuotaExceededError'});local.set(k,v)}}});
 vm.runInContext(code,c);return {api:c.tcgBackupArchiveV262,local,disk,set limit(x){limit=x},set abort(x){abort=x},set corrupt(x){corrupt=x},set beforeComplete(x){beforeComplete=x}};
}
test('quota recovery archives and verifies backup, retaining auth and receipt keys',async()=>{
 const f=fixture();f.limit=400;const backup='x'.repeat(180);f.local.set('tcgRipperBackupsV163',backup);f.local.set('tcgRipperSave','old');f.local.set('auth','token');f.local.set('tcg-hub-v256-pending:A','receipt');
 await f.api.writePrimary('n'.repeat(230));assert.equal(f.local.get('tcgRipperSave').length,230);assert.equal(await f.api.read('tcgRipperBackupsV163'),backup);assert.equal(f.local.get('auth'),'token');assert.equal(f.local.get('tcg-hub-v256-pending:A'),'receipt');
});
test('failed or corrupt archive never replaces the original backup or save',async()=>{
 for(const fault of ['abort','corrupt']){const f=fixture();f.local.set('tcgRipperBackupsV163','x'.repeat(120));f.local.set('tcgRipperSave','old');f[fault]=true;await assert.rejects(f.api.writePrimary('new'.repeat(30)));assert.equal(f.local.get('tcgRipperBackupsV163'),'x'.repeat(120));assert.equal(f.local.get('tcgRipperSave'),'old');}
});
test('concurrent backup replacement and account changes are preserved',async()=>{
 const f=fixture();f.local.set('tcgRipperBackupsV163','original');f.beforeComplete=()=>f.local.set('tcgRipperBackupsV163','newer');assert.equal(await f.api.move('tcgRipperBackupsV163'),false);assert.equal(f.local.get('tcgRipperBackupsV163'),'newer');await assert.rejects(f.api.writePrimary('new',()=>false),/changed/);
});
test('active save and pending receipts cannot be archived; ordinary writes need no archive',async()=>{
 const f=fixture();f.local.set('tcgRipperSave','old');assert.equal(await f.api.move('tcgRipperSave'),false);assert.equal(await f.api.move('tcg-hub-v256-pending:A'),false);await f.api.writePrimary('new');assert.equal(f.disk.size,0);
});
