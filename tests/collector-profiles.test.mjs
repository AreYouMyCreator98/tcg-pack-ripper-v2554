import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {database,USERS} from './hub-database.mjs';
import {collectorLink,CollectorProfile} from '../src/trade-hub/collector-profile.js';

test('collector profiles limit public data and make likes idempotent and private',async()=>{
 const f=await database(),[a,b]=USERS;
 try{
  for(const name of ['20261005054559_friends_messages_activity.sql','20261005061719_collector_profiles.sql'])await f.db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
  await f.call(a,'snapshot');await f.call(b,'snapshot');
  await f.db.query("update public.user_saves set save_data=jsonb_set(save_data,'{state,binder}', $2) where user_id=$1",[b,JSON.stringify({'catalog-5':{id:'catalog-5',qty:1}})]);
  const call=(uid,liked=null)=>f.db.transaction(async tx=>{await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[uid||'']);await tx.exec('set local role authenticated');return (await tx.query('select public.hub_collector_profile($1,$2) as result',[b,liked])).rows[0].result;});
  let result=await call(a,true);assert.equal(result.likes,1);assert.equal((await call(a,true)).likes,1);assert.equal(result.hits[0].id,'catalog-5');assert.equal(result.profile.coins,undefined);assert.equal(result.save_data,undefined);
  assert.equal((await call(a,false)).likes,0);await assert.rejects(call(b,true),/CANNOT_LIKE_SELF/);await assert.rejects(call(null),/AUTH_REQUIRED/);
  await f.db.query('update hub_private.profiles set show_record=false where user_id=$1',[b]);assert.deepEqual((await call(a)).profile.stat_values,{});
  await f.db.query('insert into hub_private.blocks(user_id,blocked_id) values($1,$2)',[b,a]);await assert.rejects(call(a),/PLAYER_UNAVAILABLE/);
  await assert.rejects(f.db.transaction(async tx=>{await tx.exec('set local role authenticated');return tx.query('select * from hub_private.profile_likes');}),/permission denied/);
 }finally{await f.close();}
});

test('collector links escape names and a closed profile discards delayed responses',async()=>{
 assert.match(collectorLink('id','<script>'),/&lt;script&gt;/);
 let finish;const view={controller:{uid:'me',client:{rpc:()=>new Promise(resolve=>finish=resolve)}},render(){},root:{querySelector(){return null;}}};
 const p=new CollectorProfile(view,()=>'',()=>''),opening=p.open('them');p.close();finish({data:{profile:{name:'Old user'}}});await opening;assert.equal(p.data,null);assert.equal(p.id,null);
});
