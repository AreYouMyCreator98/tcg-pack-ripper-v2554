import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {database,USERS} from './hub-database.mjs';
const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const requirement=source.slice(source.indexOf('function setRequirementState('),source.indexOf('function showSetRequirements('));
const migration=await readFile(new URL('../supabase/migrations/20261004000033_set_xp_progression_150.sql',import.meta.url),'utf8');
function local(state){
 const ctx=vm.createContext({state,SETS:[{id:'free',unlock:1},{id:'next',unlock:2},{id:'later',unlock:3},{id:'mega',unlock:38}],MEGA_SET_REQUIREMENTS:{mega:{xp:83655,badges:['icon'],hits:[{setId:'free',card:'Hit'}]}},xpFloor:n=>(n-1)**2*80,badgeDef:()=>['icon','Icon','Earn icon',()=>false],hasCollectedHit:()=>false,localStorage:{setItem(){}}});
 vm.runInContext(requirement,ctx);return ctx;
}
test('new set XP thresholds are 1.5x, rounded up, without changing earned XP',()=>{
 const ctx=local({xp:119,setUnlocksV259:[]});assert.equal(ctx.setRequirementState(ctx.SETS[0]).done,true);
 assert.equal(ctx.setRequirementState(ctx.SETS[1]).done,false);assert.equal(ctx.setRequirementState(ctx.SETS[1]).items[0].target,120);
 ctx.state.xp=120;assert.equal(ctx.setRequirementState(ctx.SETS[1]).done,true);assert.equal(ctx.setRequirementState(ctx.SETS[2]).items[0].target,480);
 assert.equal(ctx.setRequirementState(ctx.SETS[3]).items[0].target,125483);assert.equal(ctx.state.xp,120);
});
test('existing unlocked sets remain available and migration cannot grant future sets',()=>{
 const state={xp:80,binder:{card:{qty:7}},binderOwned:['classic','pearl']},ctx=local(state);
 assert.equal(ctx.setRequirementState(ctx.SETS[1]).done,true);assert.equal(ctx.setRequirementState(ctx.SETS[2]).done,false);
 state.xp=320;assert.equal(ctx.setRequirementState(ctx.SETS[2]).done,false);assert.deepEqual(state.binder,{card:{qty:7}});assert.deepEqual(state.binderOwned,['classic','pearl']);
 assert.deepEqual([...state.setUnlocksV259],['free','next']);
});
test('server and client agree on retained unlocks and new thresholds; saves keep all card data',async()=>{
 const db=await database();try{
   await db.db.exec("insert into hub_private.expansions(id,name,requirements) values('next','Next','{\"xp\":80}'),('later','Later','{\"xp\":320}')");
   await db.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,xp}','80') where user_id=$1",[USERS[0]]);
   const before=(await db.db.query('select save_data from user_saves where user_id=$1',[USERS[0]])).rows[0].save_data;
   await db.db.exec(migration);
   const after=(await db.db.query('select save_data from user_saves where user_id=$1',[USERS[0]])).rows[0].save_data;
   assert.ok(after.state.setUnlocksV259.includes('next'));const copy=structuredClone(after.state);delete copy.setUnlocksV259;assert.deepEqual(copy,before.state);
   assert.equal((await db.db.query("select hub_private.set_unlocked($1,'next') as unlocked",[USERS[0]])).rows[0].unlocked,true);
   for(const [xp,expected]of [[119,false],[120,true]]){
     await db.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,xp}',$1::jsonb) where user_id=$2",[String(xp),USERS[1]]);
     assert.equal((await db.db.query("select hub_private.set_unlocked($1,'next') as unlocked",[USERS[1]])).rows[0].unlocked,expected);
   }
   assert.equal((await db.db.query("select requirements->>'xp' as xp from hub_private.expansions where id='later'")).rows[0].xp,'480');
 }finally{await db.close();}
});
