import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {installProfileShowcase} from '../src/screens/profile/showcase.js';

const html=await readFile(new URL('../public/ui/screens/profile.html',import.meta.url),'utf8');
const raw={kind:'raw',id:'raw-1',name:'Groudon',set:'Paradox Rift',rarity:'Illustration rare',card:{id:'raw-1',name:'Groudon',thumb:'assets/groudon.webp'}};
const graded={kind:'slab',id:'graded-1',uid:'slab-1',name:'Mew ex',set:'Paldean Fates',rarity:'Special illustration rare',grade:9.5,card:{id:'graded-1',name:'Mew ex',thumb:'assets/mew.webp'}};

test('profile showcase displays five usable slots and a searchable grade-aware picker',()=>{
 const {window,document}=parseHTML('<html><body>'+html+'</body></html>');
 let slots=Array(5).fill(null),account='local',saves=0;
 const bridge={
  snapshot:()=>({account,blocked:false,showcase:slots.map(c=>c?{kind:c.kind,id:c.id,uid:c.uid,owned:c}:null)}),
  showcaseCandidates:()=>[graded,raw],
  showcaseSlot(index,choice,owner){assert.equal(owner,account);saves++;slots[index]=choice?([graded,raw].find(c=>c.kind===choice.kind&&(c.uid===choice.uid||c.id===choice.id))):null;}
 };
 const ui=installProfileShowcase(window,document,bridge);ui.refresh();
 assert.equal(document.querySelectorAll('#profileShowcaseGrid .profile-showcase-slot').length,5);
 assert.equal(document.querySelectorAll('#profileShowcaseGrid .featured').length,1);
 document.querySelector('[data-showcase-slot="0"]').click();
 assert.equal(document.getElementById('profileShowcasePicker').hidden,false);
 assert.equal(document.querySelectorAll('[data-showcase-choice]').length,2);
 document.querySelector('[data-showcase-filter="slab"]').click();
 assert.equal(document.querySelectorAll('[data-showcase-choice]').length,1);
 document.querySelector('[data-showcase-choice="0"]').click();
 assert.equal(document.getElementById('profileShowcasePicker').hidden,true);
 assert.match(document.querySelector('#profileShowcaseGrid .featured').textContent,/9\.5/);
 document.querySelector('[data-showcase-slot="1"]').click();
 document.querySelector('[data-showcase-filter="raw"]').click();
 assert.equal(document.querySelectorAll('[data-showcase-choice]').length,1);
 document.querySelector('[data-showcase-choice="1"]').click();
 assert.match(document.getElementById('profileShowcaseGrid').textContent,/Groudon/);
 assert.equal(saves,2);
 document.querySelector('[data-showcase-slot="1"]').click();
 document.querySelector('[data-showcase-clear]').click();
 assert.equal(saves,3);
 assert.match(document.getElementById('profileShowcaseGrid').textContent,/Choose from your collection/);
 account='different';slots=Array(5).fill(null);ui.refresh();
 assert.doesNotMatch(document.getElementById('profileShowcaseGrid').textContent,/Mew ex/);
 ui.dispose();
});
