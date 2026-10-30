// V264.13 — each individual submission receives an independent, saved grade.
// Percentages are per grading submission, regardless of service speed or card ID.
export const GRADE_WEIGHTS_V26413=Object.freeze([
 {grade:1,weight:0.001},{grade:1.5,weight:0.001},{grade:2,weight:0.002},
 {grade:2.5,weight:0.003},{grade:3,weight:0.004},{grade:3.5,weight:0.006},
 {grade:4,weight:0.008},{grade:4.5,weight:0.01},{grade:5,weight:0.015},
 {grade:5.5,weight:0.02},{grade:6,weight:0.03},{grade:6.5,weight:0.04},
 {grade:7,weight:0.06},{grade:7.5,weight:0.10},
 {grade:8,weight:0.20},{grade:8.5,weight:0.15},{grade:9,weight:0.12},
 {grade:9.5,weight:0.08},{grade:10,weight:0.10},
 {grade:10,perfect:true,weight:0.05}
]);

export const GRADE_TIER_RATES_V26413=Object.freeze({below8:0.30,from8to95:0.55,ten:0.10,perfect10:0.05});

export function gradingRandomV26413(){
 const crypto=globalThis.crypto;
 if(crypto?.getRandomValues){const bits=new Uint32Array(1);crypto.getRandomValues(bits);return bits[0]/4294967296;}
 return Math.random();
}

const validRoll=n=>Number.isFinite(n)?Math.max(0,Math.min(1-Number.EPSILON,n)):0.5;
export function conditionForGradeV26413(grade,perfect=false,random=gradingRandomV26413){
 if(perfect)return {centering:100,corners:100,edges:100,surface:100};
 if(grade===10){
  const values=[100,100,99,100];
  const first=Math.floor(validRoll(random())*4);[values[0],values[first]]=[values[first],values[0]];
  return Object.fromEntries(['centering','corners','edges','surface'].map((key,i)=>[key,values[i]]));
 }
 const base=Math.round(grade*10),values=[base-2,base,base+1,base+1];
 // Rotate the four independent assessment categories without changing the grade.
 for(let i=3;i>0;i--){const j=Math.floor(validRoll(random())*(i+1));[values[i],values[j]]=[values[j],values[i]];}
 return Object.fromEntries(['centering','corners','edges','surface'].map((key,i)=>[key,values[i]]));
}

export function rollGradingOutcomeV26413(random=gradingRandomV26413){
 const roll=validRoll(random());let acc=0;
 const selected=GRADE_WEIGHTS_V26413.find((entry,i)=>{acc+=entry.weight;return roll<acc||i===GRADE_WEIGHTS_V26413.length-1;});
 const perfect10=selected.perfect===true;
 return {version:26413,grade:selected.grade,perfect10,condition:conditionForGradeV26413(selected.grade,perfect10,random)};
}

export function applyGradingPityV26413(outcome,misses=0){
 const previous=Math.max(0,Math.floor(Number(misses)||0));
 if(previous>=99&&outcome.grade<9){
  return {outcome:{version:26413,grade:9,perfect10:false,condition:conditionForGradeV26413(9,false)},nextMisses:0,guaranteed:true};
 }
 return {outcome,nextMisses:outcome.grade>=9?0:Math.min(99,previous+1),guaranteed:false};
}
