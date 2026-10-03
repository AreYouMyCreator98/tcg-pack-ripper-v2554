import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {filterCards,salePlan,summary} from '../src/screens/bulk/model.js';
import {installBulkModule} from '../src/screens/bulk/index.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const cards=[{id:'a',name:'Abra',set:'Alpha',rarity:'Common',qty:3,market:.1,unitCents:10},{id:'b',name:'Bulbasaur',set:'Beta',rarity:'Rare',qty:1,market:2,unitCents:200},{id:'c',name:'Clefairy',set:'Alpha',rarity:'Common',qty:4,market:.25,unitCents:25}];
async function fixture(){
 const state={coins:10,bulkV64:Object.fromEntries(cards.map(c=>[c.id,{...c}])),binder:{hit:{qty:1}}};let saves=0;
 const context=vm.createContext({state,window:{tcgCloudV192:{user:{id:'A'}},dispatchEvent(){}},document:{getElementById(){return null;}},CustomEvent:class{},sellPrice:c=>c.market,openBulkCardV64(){},renderBulkV64(){},renderSets(){},money:n=>{state.coins+=n;saves++;},console});
 vm.runInContext(await read('public/runtime/bulk-bridge.js'),context);
 return {state,context,bridge:context.window.tcgBulkBridge,saves:()=>saves};
}
test('bulk library combines search, set, rarity and duplicate filters and sorts full stacks',()=>{
 assert.deepEqual(filterCards(cards,{search:'aLPhA',rarity:'Common',duplicates:true,sort:'quantity'}).map(c=>c.id),['c','a']);
 assert.deepEqual(filterCards(cards,{sort:'value'}).map(c=>c.id),['b','c','a']);
 assert.deepEqual(filterCards(cards,{set:'Beta',duplicates:true}),[]);
 assert.deepEqual(summary(cards),{unique:3,copies:8,spares:5,value:330});
});
test('default sale retains one of each and never includes unselected cards',()=>{
 const p=salePlan({account:'A',cards},new Set(['a','b']));assert.equal(p.copies,2);assert.equal(p.total,20);assert.deepEqual(p.lines.map(c=>c.id),['a']);
 assert.equal(salePlan({account:'A',cards},new Set(['b']),false).total,200);
});
test('reviewed spare sale credits exact cents once and leaves Binder unchanged',async()=>{
 const f=await fixture(),p=salePlan(f.bridge.snapshot(),new Set(['a','c']));
 f.bridge.sell(p);assert.equal(f.state.coins,10.95);assert.equal(f.state.bulkV64.a.qty,1);assert.equal(f.state.bulkV64.c.qty,1);assert.equal(f.state.bulkV64.b.qty,1);assert.equal(f.state.binder.hit.qty,1);assert.equal(f.saves(),1);
 assert.throws(()=>f.bridge.sell(p),/changed/);assert.equal(f.saves(),1);
});
test('a changed late line aborts the entire sale before any inventory or cash mutation',async()=>{
 const f=await fixture(),p=salePlan(f.bridge.snapshot(),new Set(['a','c']));f.state.bulkV64.c.qty=3;
 assert.throws(()=>f.bridge.sell(p),/changed/);assert.equal(f.state.bulkV64.a.qty,3);assert.equal(f.state.coins,10);assert.equal(f.saves(),0);
});
test('account changes and cloud transaction holds reject a reviewed sale',async()=>{
 const f=await fixture(),p=salePlan(f.bridge.snapshot(),new Set(['a']));f.context.window.tcgCloudV192.user.id='B';assert.throws(()=>f.bridge.sell(p),/account changed/);
 f.context.window.tcgCloudV192.user.id='A';f.context.window.tcgCloudV192.hubHeld=true;assert.throws(()=>f.bridge.sell(p),/syncing/);assert.equal(f.saves(),0);
});
test('price changes, duplicate lines and corrupted quantities cannot alter a sale',async()=>{
 const f=await fixture(),p=salePlan(f.bridge.snapshot(),new Set(['a']));f.state.bulkV64.a.market=.2;assert.throws(()=>f.bridge.sell(p),/changed/);f.state.bulkV64.a.market=.1;
 assert.throws(()=>f.bridge.sell({...p,lines:[...p.lines,...p.lines],total:p.total*2}),/changed/);
 assert.throws(()=>f.bridge.sell({...p,lines:[{...p.lines[0],qty:-1}]}),/changed/);assert.equal(f.saves(),0);
});
test('explicit full sale removes only chosen bulk entries',async()=>{
 const f=await fixture();f.bridge.sell(salePlan(f.bridge.snapshot(),new Set(['b']),false));assert.equal(f.state.bulkV64.b,undefined);assert.equal(f.state.bulkV64.a.qty,3);assert.equal(f.state.coins,12);
});
test('library renders all collection pages, escapes card text and clears selection across accounts',async()=>{
 const {window,document}=parseHTML('<html><body>'+await read('public/ui/screens/bulk.html')+'</body></html>');
 for(const el of document.querySelectorAll('input,select,button')){if(el.tagName==='SELECT')Object.defineProperty(el,'value',{value:'',writable:true});el.focus=()=>{};}
 let account='A';window.tcgBulkBridge={snapshot:()=>({account,cash:10,cards:Array.from({length:30},(_,i)=>({...cards[0],id:'id'+i,name:i===0?'<img onerror=alert(1)>':'Card '+i})),blocked:false}),inspect(){},sell(){}};
 const view=installBulkModule(window,document);assert.equal(document.querySelectorAll('.bulk-library-card').length,24);assert.equal(document.querySelector('h3 img'),null);
 document.getElementById('bulkMore').click();assert.equal(document.querySelectorAll('.bulk-library-card').length,30);
 document.getElementById('bulkSelectSpares').click();assert.match(document.getElementById('bulkSelectedCount').textContent,/30 card types/);
 account='B';view.refresh();assert.match(document.getElementById('bulkSelectedCount').textContent,/0 card types/);view.dispose();
});
