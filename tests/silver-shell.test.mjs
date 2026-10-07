import test from 'node:test';
import assert from 'node:assert/strict';
import {adjacentUnlocked,seriesLabel,selectedProgress,profileImage} from '../src/screens/rip/silver-model.js';
const sets=[{id:'a',unlocked:true},{id:'b',unlocked:false},{id:'c',unlocked:true}];
test('set arrows skip locked sets in both directions and wrap',()=>{assert.equal(adjacentUnlocked(sets,'a',1),'c');assert.equal(adjacentUnlocked(sets,'c',1),'a');assert.equal(adjacentUnlocked(sets,'a',-1),'c');assert.equal(adjacentUnlocked(sets,'c',-1),'a');});
test('arrow never invents an unlocked set',()=>{assert.equal(adjacentUnlocked([{id:'x',unlocked:false}],'x',1),null);assert.equal(adjacentUnlocked([{id:'a',unlocked:true}],'a',1),'a');});
test('series labels reflect the selected era',()=>{assert.equal(seriesLabel('sv'),'SCARLET & VIOLET');assert.equal(seriesLabel('swsh'),'SWORD & SHIELD');assert.equal(seriesLabel('xy'),'XY');});
test('progress reads only the selected set and handles missing totals',()=>{assert.equal(selectedProgress({a:{owned:new Set(['1','2']),total:4}},'a'),'50.0%');assert.equal(selectedProgress({},'b'),'Checklist');});
test('header uses persisted profile image and rejects unsafe URLs',()=>{assert.equal(profileImage({profile:{avatar:'https://example.com/photo.png'}}),'https://example.com/photo.png');assert.equal(profileImage({profile:{avatar:'javascript:alert(1)'}}),'');assert.equal(profileImage({profile:{avatar:''}}),'');});

test('all 32 sets have decodable-format local logos without known broken remote aliases',async()=>{
 const {readFile}=await import('node:fs/promises');
 const sources=JSON.parse(await readFile('docs/v261/ARTWORK-SOURCES.json','utf8'));
 const logos=Object.keys(sources).filter(path=>path.startsWith('assets/set-logos/'));
 assert.equal(logos.length,32);
 for(const path of logos){const bytes=await readFile('public/'+path);assert.ok(bytes.length>100);assert.ok(bytes.subarray(0,4).equals(Buffer.from([137,80,78,71]))||bytes.toString('ascii',0,4)==='RIFF',path);}
});
