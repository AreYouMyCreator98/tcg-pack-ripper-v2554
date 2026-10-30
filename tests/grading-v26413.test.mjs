import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 GRADE_WEIGHTS_V26413,GRADE_TIER_RATES_V26413,
 rollGradingOutcomeV26413,conditionForGradeV26413,applyGradingPityV26413
} from '../src/grading/grade-engine.js';

const round6=n=>Math.round(n*1e6)/1e6;
function finalGrade(condition){
 const vals=Object.values(condition).map(v=>v/10),avg=vals.reduce((a,b)=>a+b)/vals.length,min=Math.min(...vals);
 return Math.max(1,Math.min(10,Math.round(Math.min(avg,min+.5)*2)/2));
}

test('fresh grading odds total 100%: under 8 30%, 8–9.5 55%, 10 10%, Perfect 10 5%',()=>{
 const by={below8:0,from8to95:0,ten:0,perfect10:0};
 for(const entry of GRADE_WEIGHTS_V26413){
  const category=entry.perfect?'perfect10':entry.grade===10?'ten':entry.grade>=8?'from8to95':'below8';
  by[category]+=entry.weight;
 }
 for(const category of Object.keys(by))assert.equal(round6(by[category]),GRADE_TIER_RATES_V26413[category]);
 assert.equal(round6(Object.values(by).reduce((a,b)=>a+b)),1);
 assert.equal(GRADE_WEIGHTS_V26413.filter(x=>x.grade===10).length,2);
});

test('deterministic uniformly spaced rolls produce the exact requested percentages',()=>{
 const count={below8:0,from8to95:0,ten:0,perfect10:0};
 for(let i=0;i<10000;i++){
  const value=(i+.5)/10000;
  const outcome=rollGradingOutcomeV26413((()=>{let first=true;return()=>{if(first){first=false;return value;}return .5;};})());
  const category=outcome.perfect10?'perfect10':outcome.grade===10?'ten':outcome.grade>=8?'from8to95':'below8';
  count[category]++;
  assert.equal(finalGrade(outcome.condition),outcome.grade,'subgrades must match the displayed slab grade');
 }
 assert.deepEqual(count,{below8:3000,from8to95:5500,ten:1000,perfect10:500});
});

test('all grades from 1 through 10 and Perfect 10 have achievable subgrades',()=>{
 for(const tier of GRADE_WEIGHTS_V26413){
  for(const random of [()=>0,()=>.99999999]){
   const condition=conditionForGradeV26413(tier.grade,!!tier.perfect,random);
   assert.deepEqual(Object.keys(condition),['centering','corners','edges','surface']);
   assert.ok(Object.values(condition).every(value=>value>=1&&value<=100));
   assert.equal(finalGrade(condition),tier.grade);
   if(tier.perfect)assert.ok(Object.values(condition).every(value=>value===100));
   else if(tier.grade===10)assert.ok(Object.values(condition).some(value=>value<100),'ordinary 10 must differ from Perfect 10');
  }
 }
});

test('Perfect 10 is a saved distinct flag, not simply any slab graded 10',()=>{
 const normal=rollGradingOutcomeV26413((()=>{let first=true;return()=>{if(first){first=false;return .90;}return .4;};})());
 const perfect=rollGradingOutcomeV26413((()=>{let first=true;return()=>{if(first){first=false;return .99;}return .4;};})());
 assert.equal(normal.grade,10);assert.equal(normal.perfect10,false);
 assert.equal(perfect.grade,10);assert.equal(perfect.perfect10,true);
 assert.deepEqual(Object.values(perfect.condition),[100,100,100,100]);
 assert.deepEqual(structuredClone(perfect),perfect);
});

test('legacy 100-grade pity cannot reroll an existing high result or create false Perfect 10',()=>{
 const normal=rollGradingOutcomeV26413(()=>.1);
 const pity=applyGradingPityV26413(normal,99);
 assert.equal(pity.outcome.grade,9);assert.equal(pity.outcome.perfect10,false);
 assert.equal(pity.nextMisses,0);assert.equal(pity.guaranteed,true);
 const perfection=rollGradingOutcomeV26413(()=>.9999);
 const held=applyGradingPityV26413(perfection,99);
 assert.equal(held.outcome.perfect10,true);assert.equal(held.nextMisses,0);
});

test('grader, return cut, profile badge and offline assets remain wired',()=>{
 const transactions=readFileSync('src/collector/transactions.js','utf8');
 const core=readFileSync('public/runtime/core.js','utf8');
 const profile=readFileSync('src/screens/profile/showcase.js','utf8');
 const overlay=readFileSync('public/ui/overlays.html','utf8');
 const worker=readFileSync('public/sw.js','utf8');
 assert.match(transactions,/gradeOutcomeV26413:rollGradingOutcomeV26413\(\)/);
 assert.match(core,/j\.perfect10V26413=!!result\.outcome\.perfect10/);
 assert.match(core,/returnTimersV26413\.forEach\(clearTimeout\)/);
 assert.match(core,/function perfectChimeV26413\(/);
 assert.match(profile,/PERFECT 10/);
 assert.match(overlay,/vaultReturnArtV26413/);
 for(const path of ['styles/grading-v26413.css','assets/grading/v26413-vault-crest.svg','src/grading/grade-engine.js'])assert.ok(worker.includes(path));
});
