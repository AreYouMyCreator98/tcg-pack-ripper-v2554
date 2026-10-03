import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {installNavigationInput} from '../src/app/navigation-input.js';

function fixture(pointer=true){
 const {document}=parseHTML('<html><body><nav class="nav"><button data-s="profile">Profile</button></nav><section id="profile" class="profile-studio"><button role="tab"><span>Customise</span></button><details><summary>Daily challenges <span>Three goals</span></summary><input><select><option>Badge</option></select></details></section><section id="settings" class="studio-settings"><button>Close</button></section><button id="outside">Unrelated</button></body></html>');
 const handlers={};document.addEventListener=(name,fn)=>handlers[name]=fn;document.removeEventListener=name=>delete handlers[name];
 const dispose=installNavigationInput(document,{PointerEvent:pointer?function(){}:undefined});
 const fire=(name,target,extra={})=>{const e={target,pointerType:'touch',pointerId:1,clientX:30,clientY:40,button:0,isPrimary:true,cancelable:true,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};handlers[name](e);return e;};
 const tap=target=>{fire(pointer?'pointerdown':'touchstart',target);return fire(pointer?'pointerup':'touchend',target);};
 return {document,handlers,fire,tap,dispose};
}
test('Profile tabs and nested summary text activate when Samsung omits the compatibility click',()=>{
 const f=fixture(),tab=f.document.querySelector('[role=tab]'),summary=f.document.querySelector('summary');let tabs=0,toggles=0;
 tab.addEventListener('click',()=>tabs++);summary.addEventListener('click',()=>toggles++);
 f.tap(tab.querySelector('span'));f.tap(summary.querySelector('span'));
 assert.equal(tabs,1);assert.equal(toggles,1);
 const duplicate=f.fire('click',summary.querySelector('span'),{isTrusted:true});assert.equal(duplicate.stopped,true);
 const keyboard=f.fire('click',summary,{isTrusted:true,detail:0});assert.equal(keyboard.stopped,undefined);
});
test('Profile swipes that return to their start, cancelled taps and multi-touch never activate',()=>{
 const f=fixture(),tab=f.document.querySelector('[role=tab]');let clicks=0;tab.addEventListener('click',()=>clicks++);
 f.fire('pointerdown',tab);f.fire('pointermove',tab,{clientY:90});f.fire('pointerup',tab);
 f.fire('pointerdown',tab);f.fire('pointercancel',tab);f.fire('pointerup',tab);
 f.fire('pointerdown',tab);f.fire('pointerdown',tab,{isPrimary:false,pointerId:2});f.fire('pointerup',tab);
 assert.equal(clicks,0);
});
test('Profile tap handling respects disabled, inert and cloud transaction barriers',()=>{
 const f=fixture(),tab=f.document.querySelector('[role=tab]');let clicks=0;tab.addEventListener('click',()=>clicks++);
 tab.disabled=true;f.tap(tab);tab.disabled=false;
 tab.parentElement.setAttribute('inert','');f.tap(tab);tab.parentElement.removeAttribute('inert');
 f.fire('pointerdown',tab);f.document.documentElement.classList.add('hub-transaction-pending');f.fire('pointerup',tab);
 assert.equal(clicks,0);
 const nav=f.document.querySelector('.nav button');nav.addEventListener('click',()=>clicks++);f.tap(nav);assert.equal(clicks,1);
});
test('Native inputs, selects, unrelated buttons and mouse events retain native handling',()=>{
 const f=fixture();let clicks=0;
 for(const el of f.document.querySelectorAll('input,select,#outside')){el.addEventListener('click',()=>clicks++);assert.equal(f.tap(el).prevented,undefined);}
 const tab=f.document.querySelector('[role=tab]');tab.addEventListener('click',()=>clicks++);f.fire('pointerdown',tab,{pointerType:'mouse'});f.fire('pointerup',tab,{pointerType:'mouse'});assert.equal(clicks,0);
});
test('Touch-only settings fallback activates once and removes listeners when disposed',()=>{
 const f=fixture(false),button=f.document.querySelector('#settings button');let clicks=0;button.addEventListener('click',()=>clicks++);
 f.fire('touchstart',button,{pointerId:undefined,touches:[{clientX:10,clientY:20}],changedTouches:[{clientX:10,clientY:20}]});
 f.fire('touchend',button,{pointerId:undefined,changedTouches:[{clientX:10,clientY:20}]});assert.equal(clicks,1);
 f.dispose();assert.equal(Object.keys(f.handlers).length,0);
});
