import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createTransactions} from '../src/collector/transactions.js';
import {migrateCollector} from '../src/collector/model.js';
const globalDOM=parseHTML('<html><body></body></html>');
globalThis.window=globalDOM.window;
globalThis.Event=globalDOM.window.Event;
globalThis.CustomEvent=globalDOM.window.CustomEvent;
const {installCardInspector}=await import('../src/collector/inspector.js');

function setup(){
 const {window,document}=parseHTML('<html><body></body></html>');
 window.scrollTo=()=>{};window.matchMedia=()=>({matches:true});
 let state={coins:10,binder:{raw:{id:'raw',name:'Example Holo',finish:'Holo',qty:1,market:18.75}},bulkV64:{},gradingV44:{graded:[{id:'rare',name:'Rare Slab',finish:'Holo',grade:9.5,uid:'slab-1',cert:'VG-1',raw:310},{id:'rare',name:'Rare Slab',finish:'Holo',grade:10,uid:'slab-2',cert:'VG-2',raw:310}],submissions:[]}};
 migrateCollector(state,1000);
 const bridge={state:()=>state,account:()=> 'account-a',blocked:()=>false,save(){},commit:next=>{state=next;},refreshMarket:async()=>null,savedMarketQuote:()=>null,condition:()=>({centering:95,edges:94,corners:96,surface:92}),price:c=>Math.max(.1,Number(c?.market)||.1),slabValue:c=>Math.round(Number(c.raw||.1)*(c.grade>=10?4.8:3.2)*100)/100,gradingTier:()=> 'standard',bindInspector(){},refresh(){},canBinder:()=>true};
 const transactions=createTransactions(bridge,{id:(()=>{let n=0;return()=>`test-${++n}`;})()});
 const inspector=installCardInspector(bridge,transactions,window,document);
 const click=action=>{const button=document.querySelector(`[data-inspector-action="${action}"]`);assert.ok(button,`missing ${action}`);assert.equal(button.hasAttribute('disabled'),false,`${action} should be usable`);button.dispatchEvent(new window.Event('click',{bubbles:true}));};
 return {bridge,inspector,document,click,state:()=>state,window};
}

test('a missing external market quote never disables an owned raw card sale',async()=>{
 const f=setup();f.inspector.open(f.state().binder.raw,{source:'binder'});
 await Promise.resolve();await Promise.resolve();
 assert.match(f.document.querySelector('#universalCardInspector').textContent,/IN-GAME RAW SELL VALUE/);
 assert.match(f.document.querySelector('#universalCardInspector').textContent,/18\.75/);
 f.click('sell');f.click('confirm');
 assert.equal(f.state().binder.raw,undefined);
 assert.equal(f.state().coins,28.75);
});

test('a graded-only collection card can sell its selected slab without a live price',async()=>{
 const f=setup(),slab=f.state().gradingV44.graded[0];f.inspector.open(slab,{source:'slab',slab});
 await Promise.resolve();await Promise.resolve();
 assert.match(f.document.querySelector('#universalCardInspector').textContent,/IN-GAME SLAB SELL VALUE/);
 assert.equal(f.document.getElementById('inspectorSlabPicker').options.length,2);
 f.click('sellSlab');f.click('confirm');
 assert.equal(f.state().gradingV44.graded.length,1);
 assert.equal(f.state().gradingV44.graded[0].uid,'slab-2');
 assert.equal(f.state().coins,1002);
});

test('choosing a different graded copy sells that certificate only',async()=>{
 const f=setup(),slab=f.state().gradingV44.graded[0];f.inspector.open(slab,{source:'slab',slab});
 const picker=f.document.getElementById('inspectorSlabPicker');picker.querySelector('[selected]')?.removeAttribute('selected');picker.querySelector('option[value="slab-2"]').setAttribute('selected','');picker.dispatchEvent(new f.window.Event('change',{bubbles:true}));
 f.click('sellSlab');f.click('confirm');
 assert.equal(f.state().gradingV44.graded.length,1);
 assert.equal(f.state().gradingV44.graded[0].uid,'slab-1');
 assert.equal(f.state().coins,1498);
});
