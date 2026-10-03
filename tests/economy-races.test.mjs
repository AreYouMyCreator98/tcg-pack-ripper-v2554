import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const sale=source.slice(source.indexOf('const binderSaleLocksV2554'),source.indexOf('function renderHist()'));
function fixture(){let ready;const wait=new Promise(r=>ready=r);const ctx=vm.createContext({state:{coins:80,binder:{a:{id:'a',qty:1,market:12}}},selectedBinderCard:'a',hydrateCard:()=>wait,sellPrice:c=>c.market,save:()=>{},toast:()=>{},closeBinderCard:()=>{},renderBinder:()=>{}});vm.runInContext(sale,ctx);return {ctx,ready};}
test('double-tapping Sell pays once and never makes inventory negative',async()=>{const {ctx,ready}=fixture();const first=ctx.sellBinder(false),second=ctx.sellBinder(false);ready();assert.deepEqual(await Promise.all([first,second]),[true,false]);assert.equal(ctx.state.coins,92);assert.equal(ctx.state.binder.a,undefined);});
test('card removed during price hydration cannot be sold again',async()=>{const {ctx,ready}=fixture();const pending=ctx.sellBinder(true);delete ctx.state.binder.a;ready();assert.equal(await pending,false);assert.equal(ctx.state.coins,80);});
test('invalid market values do not corrupt currency',async()=>{const {ctx,ready}=fixture();ctx.state.binder.a.market=Infinity;const pending=ctx.sellBinder(true);ready();assert.equal(await pending,false);assert.equal(ctx.state.coins,80);assert.equal(ctx.state.binder.a.qty,1);});
test('failed hydration releases the sale lock for a later retry',async()=>{const {ctx,ready}=fixture();ctx.hydrateCard=async()=>{throw Error('offline')};assert.equal(await ctx.sellBinder(false),false);ctx.hydrateCard=async()=>{};assert.equal(await ctx.sellBinder(false),true);assert.equal(ctx.state.coins,92);});
