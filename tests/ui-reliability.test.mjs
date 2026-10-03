import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const core=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
test('Binder taps keep their card target; horizontal swipes capture the page',()=>{
 const handlers={},captures=[];const page={addEventListener:(name,fn)=>handlers[name]=fn,setPointerCapture:id=>captures.push(id)};
 const start=core.indexOf("page.addEventListener('pointerdown'");const end=core.indexOf("page.addEventListener('pointerup'",start);
 vm.runInNewContext('let sx=null,sy=null,pid=null;'+core.slice(start,end),{page});
 handlers.pointerdown({pointerId:1,clientX:20,clientY:30});assert.deepEqual(captures,[]);
 handlers.pointermove({pointerId:1,clientX:22,clientY:34});assert.deepEqual(captures,[]);
 handlers.pointermove({pointerId:1,clientX:60,clientY:32});assert.deepEqual(captures,[1]);
});
test('legacy artwork 404 preserves the card and its quantity',async()=>{
 const fn=core.slice(core.indexOf('async function repairBinderImage('),core.indexOf('function migrateBinderImages('));
 const card={id:'a',name:'A',qty:3},slot={innerHTML:''},img={dataset:{},closest:()=>slot};
 const ctx=vm.createContext({state:{binder:{a:card}},fetch:async()=>({status:404}),save:()=>{},renderBinder:()=>{}});vm.runInContext(fn,ctx);await ctx.repairBinderImage(img,'a');assert.equal(ctx.state.binder.a,card);assert.equal(card.qty,3);assert.match(slot.innerHTML,/art unavailable/);
});
