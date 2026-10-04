import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {database,USERS} from './hub-database.mjs';
const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function isRegularExV260('),source.indexOf('function isBulkCardV64('));
const ctx=vm.createContext({});vm.runInContext(code,ctx);
const card=(rarity,extra={})=>({id:'ex',name:'Charizard ex',rarity,qty:2,market:8,...extra});
test('only regular ex moves; special, full-art, shiny and unrelated double-rares stay',()=>{
 for(const r of ['Double rare','Rare Holo ex','Holo Rare ex'])assert.equal(ctx.isRegularExV260(card(r)),true);
 for(const c of [card('Ultra Rare'),card('Special illustration rare'),card('Double rare',{secret:true}),card('Double rare',{finish:'Shiny'}),card('Double rare',{name:'Pikachu V'}),card('Card')])assert.equal(ctx.isRegularExV260(c),false);
});
test('routing sums copies, preserves metadata and binder customisations, and is idempotent',()=>{
 const s={binder:{ex:card('Double rare',{condition:{grade:9}}),special:card('Ultra Rare',{id:'special'})},bulkV64:{ex:card('Double rare',{qty:3})},binderOwned:['pearl'],binderTheme:'pearl',xp:100};
 assert.equal(ctx.routeRegularExV260(s),true);assert.equal(s.bulkV64.ex.qty,5);assert.equal(s.bulkV64.ex.condition.grade,9);assert.ok(s.binder.special);assert.deepEqual(s.binderOwned,['pearl']);assert.equal(s.xp,100);assert.equal(ctx.routeRegularExV260(s),false);
});
test('database migration preserves all copies and specials, and routes subsequent server rewards',async()=>{
 const db=await database();try{
 const initial={binder:{ex:card('Double rare'),special:card('Special illustration rare',{id:'special'})},bulkV64:{ex:card('Double rare',{qty:4})},binderOwned:['pearl'],coins:100,xp:500};
 await db.db.query('update user_saves set save_data=$1 where user_id=$2',[JSON.stringify({state:initial}),USERS[0]]);
 const sql=await readFile(new URL('../supabase/migrations/20261004044053_regular_ex_bulk.sql',import.meta.url),'utf8');await db.db.exec(sql);
 const read=async()=>(await db.db.query('select save_data,save_version from user_saves where user_id=$1',[USERS[0]])).rows[0];
 const after=await read();assert.equal(after.save_data.state.bulkV64.ex.qty,6);assert.deepEqual(after.save_data.state.binder.special,initial.binder.special);assert.deepEqual(after.save_data.state.binderOwned,['pearl']);assert.equal(after.save_data.state.coins,100);
 await db.db.exec(sql);assert.deepEqual(await read(),after);
 await db.db.query('select hub_private.card_change($1,$2,1)',[USERS[0],JSON.stringify(card('Double rare'))]);assert.equal((await read()).save_data.state.bulkV64.ex.qty,7);
 await db.call(USERS[0],'profile',{name:'Collector'});
 }finally{await db.close()}
});
test('cached official catalogues bypass network waits while live card prices still fetch',async()=>{
 const network=[],cached={ok:true,marker:'cached'};
 const c=vm.createContext({caches:{open:async()=>({match:async()=>cached})},setTimeout,clearTimeout,AbortController,fetch:async url=>{network.push(url);return {ok:true}}});
 vm.runInContext(source.slice(source.indexOf('async function fetchWithTimeout('),source.indexOf('async function getSet(')),c);
 assert.equal(await c.fetchWithTimeout('https://api.tcgdex.net/v2/en/sets/sv01'),cached);
 assert.equal(await c.fetchWithTimeout('https://api.tcgdex.net/v2/en/cards?set.id=eq:sv01'),cached);
 await c.fetchWithTimeout('https://api.tcgdex.net/v2/en/cards/sv01-1');assert.equal(network.length,1);
});

