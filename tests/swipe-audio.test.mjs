import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const base=fileURLToPath(new URL('../',import.meta.url));
const core=readFileSync(`${base}public/runtime/core.js`,'utf8');

function extractFunction(name,args){
 const start=core.indexOf(`function ${name}(`);
 assert.ok(start>=0,`${name} exists in the pack runtime`);
 const bodyStart=core.indexOf('{',start);
 let depth=0,end=bodyStart;
 for(;end<core.length;end++){
  if(core[end]==='{')depth++;
  if(core[end]==='}'&&--depth===0)break;
 }
 return new Function(...args,core.slice(bodyStart+1,end));
}

const swipeRate=extractFunction('v266SwipeRate',['speed']);
const swipeSpeed=extractFunction('v266SwipeMeasuredSpeed',['d','distance','releaseSpeed','performance']);

test('slower finger swipes yield longer, softer audio than quick flicks',()=>{
 const slow=swipeRate(.16),normal=swipeRate(.85),fast=swipeRate(2.3);
 assert.ok(slow.rate<normal.rate&&normal.rate<fast.rate);
 assert.ok(slow.intensity<normal.intensity&&normal.intensity<fast.intensity);
 assert.ok(slow.rate>=.6&&fast.rate<=1.9);
 assert.equal(swipeRate(0).rate,swipeRate(.12).rate);
 assert.equal(swipeRate(999).rate,swipeRate(3).rate);
});

test('release speed accounts for the overall gesture, not only its last frame',()=>{
 const now={now:()=>500};
 const pausedAtEnd={t:100,speed:.45,peakSpeed:2};
 const fast=swipeSpeed(pausedAtEnd,190,0,now);
 const slow=swipeSpeed({t:100,speed:.1,peakSpeed:.2},95,0,now);
 assert.ok(fast>slow);
 assert.ok(fast>=.9);
 assert.ok(slow>.08);
});

test('all four supplied-sound variants are bundled for mobile playback',()=>{
 assert.match(core,/v266PlaySwipeAudio\(v266SwipeMeasuredSpeed\(d,dist,velocity\)\)/);
 assert.match(core,/audioV67\.sfxOn/);
 for(let n=1;n<=4;n++){
  const file=`${base}public/assets/audio/ui/card-swipe-${String(n).padStart(2,'0')}.m4a`;
  assert.ok(statSync(file).size>2000,`sample ${n} contains recorded audio`);
  assert.equal(readFileSync(file).toString('ascii',4,8),'ftyp');
 }
});
