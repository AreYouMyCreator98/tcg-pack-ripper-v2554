import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {database,USERS} from './hub-database.mjs';

const ids=['base1','base2','base3','base5','neo1','sv08.5','sv10.5b','sv10.5w','me05','30th'];
const core=readFileSync('public/runtime/core.js','utf8');
const slice=(start,end)=>core.slice(core.indexOf(start),core.indexOf(end,core.indexOf(start)));
const sets=vm.runInNewContext(slice('const SETS=','const CHASE_CARDS')+';SETS');
const load=id=>JSON.parse(readFileSync(`public/catalog/${id}.json`,'utf8'));

test('V264 adds exactly ten new sets with offline checklists and sufficient rarities for ten-card packs',()=>{
 assert.equal(sets.length,42);
 assert.deepEqual(Array.from(sets.slice(-10),s=>s.id),['me05','sv10.5b','sv10.5w','sv08.5','base2','base3','base5','neo1','30th','base1']);
 for(const id of ids){
   const set=sets.find(s=>s.id===id),cards=load(id),rarities=new Set(cards.map(c=>c.rarity));
   assert.ok(set);
   assert.ok(cards.length>=60,id);
   assert.ok(cards.filter(c=>c.rarity==='Common').length>=6,id);
   // 30th Celebration intentionally has no Uncommon rarity; its booster uses
   // additional Commons for those slots rather than inventing missing cards.
   if(id!=='30th')assert.ok(cards.filter(c=>c.rarity==='Uncommon').length>=3,id);
   assert.ok(rarities.has('Rare'),id);
   assert.ok(cards.every(c=>c.setId===id&&c.img.includes('assets.tcgdex.net')&&c.market>=.1),id);
   assert.equal(new Set(cards.map(c=>c.id)).size,cards.length,id);
 }
});

test('first-edition stamp provenance and anniversary subset stay attached to correct parent set',()=>{
 const base=load('base1');
 assert.equal(base.length,102);
 assert.ok(base.every(c=>c.firstEdition===true&&c.edition==='1st Edition'));
 assert.equal(base.find(c=>c.name==='Charizard')?.rarity,'Rare Holo');
 const anniversary=load('30th');
 assert.equal(anniversary.length,188);
 const classic=anniversary.filter(c=>c._subsetId==='30th-c'&&c._parentSetId==='30th');
 assert.equal(classic.length,30);
 assert.ok(classic.every(c=>c._historicalArtId&&c._historicalArtNote&&c.img.includes('/en/')&&!c.img.includes('/30th-c/')));
 assert.equal(new Set(anniversary.map(c=>c.id)).size,188);
});

test('prestige unlocks are permanent and award the initial Base Set pack once',()=>{
 const code=[slice('const SETS=','const CHASE_CARDS='),slice('const MEGA_SET_REQUIREMENTS=','function badgeDef('),slice('function setRequirementState(','function showSetRequirements('),slice('function xpFloor(','function updateProgressUI(')].join('\n');
 const state={xp:192080,packs:1000,rankedV221:{rp:1050,seasonHigh:1050},setUnlocksV259:[]};
 const totals=Object.fromEntries(sets.slice(0,5).map(s=>[s.id,{total:25,owned:new Set(Array.from({length:25},(_,i)=>`${s.id}-${i}`))}]));
 const ctx=vm.createContext({state,localStorage:{setItem(){}},setTotalsV57:()=>totals,hasCollectedHit:()=>true,BADGE_DEFS:[]});
 vm.runInContext(code+'\nglobalThis.setsV264=SETS;',ctx);
 const base=ctx.setsV264.find(s=>s.id==='base1'),anniversary=ctx.setsV264.find(s=>s.id==='30th');
 assert.equal(ctx.setUnlocked(base),true);
 assert.equal(state.sealedV161.packCredits.base1,1);
 assert.equal(ctx.setUnlocked(base),true);
 assert.equal(state.sealedV161.packCredits.base1,1);
 assert.equal(ctx.setUnlocked(anniversary),true);
 state.rankedV221={rp:0,seasonHigh:0};state.packs=0;state.xp=0;
 assert.equal(ctx.setUnlocked(base),true);
 assert.equal(ctx.setUnlocked(anniversary),true);
});

test('multiplayer expansion seed only upserts new set/card data without changing player saves',()=>{
 const sql=readFileSync('supabase/seed-v264-sets.sql','utf8');
 assert.match(sql,/insert into hub_private\.expansions/);
 assert.match(sql,/insert into hub_private\.catalog/);
 assert.doesNotMatch(sql,/\b(delete|truncate|update\s+public\.user_saves|drop\s+table)\b/i);
 assert.equal((sql.match(/assets\.tcgdex\.net/g)||[]).length,2510);
});

test('server prestige lock enforces Diamond, Level 50, packs and five actually owned Master Sets',async()=>{
 const fixture=await database();
 try{
   await fixture.db.exec(readFileSync('supabase/migrations/20261029000000_v264_prestige_set_unlocks.sql','utf8'));
   await fixture.db.exec(`insert into hub_private.expansions(id,name,requirements) values
     ('30th','Anniversary','{"xp":0,"rankRP":1000}'),
     ('base1','Base Set','{"xp":0,"rankRP":1000,"collectorLevel":50,"packs":1000,"masterSets":5}');
     insert into hub_private.catalog(id,set_id,card,tier)
     select 'full-'||g,'master-'||(1+(g-1)/10),jsonb_build_object('id','full-'||g),0 from generate_series(1,50) g;`);
   const id=USERS[0],state={xp:192080,packs:1000,setUnlocksV259:[],binder:Object.fromEntries(Array.from({length:50},(_,i)=>['full-'+(i+1),{id:'full-'+(i+1),qty:1}]))};
   await fixture.db.query('update public.user_saves set save_data=jsonb_build_object(\'state\',$1::jsonb) where user_id=$2',[JSON.stringify(state),id]);
   await fixture.db.query('insert into hub_private.profiles(user_id,season_high) values($1,$2)',[id,950]);
   const unlocked=async sid=>(await fixture.db.query('select hub_private.set_unlocked($1,$2) as yes',[id,sid])).rows[0].yes;
   assert.equal(await unlocked('30th'),false);
   await fixture.db.query('update hub_private.profiles set season_high=1000 where user_id=$1',[id]);
   assert.equal(await unlocked('30th'),true);
   assert.equal(await unlocked('base1'),true);
   state.binder['full-50'].qty=0;
   await fixture.db.query('update public.user_saves set save_data=jsonb_build_object(\'state\',$1::jsonb) where user_id=$2',[JSON.stringify(state),id]);
   assert.equal(await unlocked('base1'),false,'selling the only copy removes Master Set completion');
   state.binder['full-50'].qty=1;state.packs=999;
   await fixture.db.query('update public.user_saves set save_data=jsonb_build_object(\'state\',$1::jsonb) where user_id=$2',[JSON.stringify(state),id]);
   assert.equal(await unlocked('base1'),false);
 }finally{await fixture.close();}
});
