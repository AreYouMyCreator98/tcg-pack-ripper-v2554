import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {database,USERS} from './hub-database.mjs';
const [A,B]=USERS;
const fixture=fn=>async()=>{const d=await database();try{await fn(d);}finally{await d.close();}};
const firstFive=['sv04.5','swsh12.5','swsh4.5','sv08','sv03'];
async function ready(d,u,r){const s=await d.call(u,'snapshot');return d.call(u,'room_ready',{id:r.id,revision:r.revision,ready:true,save_version:s.save_version});}

test('each of the first five real sets completes a ranked match with equal pools and retained cards',fixture(async d=>{
 await d.db.exec('truncate hub_private.catalog');await d.db.exec(await readFile(new URL('../supabase/seed-hub-catalog.sql',import.meta.url),'utf8'));
 assert.deepEqual((await d.call(A,'snapshot')).ranked_sets.map(s=>s.set_id),firstFive);
 // Force each eligible pool in turn. Re-enable the other pools before the guest
 // joins: matchmaking must keep the host's selected pool, not the guest's draw.
 for(const sid of firstFive){
   await d.db.query('update hub_private.catalog set enabled=(set_id=$1)',[sid]);
   const host=await d.call(A,'queue_join',{set_id:'outside-ranked-pool'});let r=host.rooms[0];assert.equal(r.my_set,sid);
   await d.db.exec('update hub_private.catalog set enabled=true');
   const guest=await d.call(B,'queue_join',{set_id:'sv09'});r=guest.rooms[0];assert.equal(r.my_set,sid);
   await assert.rejects(d.call(A,'battle_set',{id:r.id,set_id:firstFive.find(x=>x!==sid)}),/RANKED_SET_LOCKED/);
   r=(await ready(d,A,r)).rooms[0];r=(await ready(d,B,r)).rooms[0];assert.equal(r.status,'playing');
   const a=(await d.call(A,'snapshot')).rooms[0];
   const pool=new Set((await d.db.query('select id from hub_private.catalog where set_id=$1',[sid])).rows.map(c=>c.id));
   for(const cards of [a.my_cards,r.my_cards]){assert.equal(cards.length,10);assert.ok(cards.every(c=>c.setId===sid&&pool.has(c.id)));}
   assert.equal(r.opponent_cards.length,0);
   for(let progress=1;progress<=10;progress++){await d.call(A,'battle_reveal',{id:r.id,progress});await d.call(B,'battle_reveal',{id:r.id,progress});}
   assert.equal((await d.call(A,'snapshot')).rooms[0].status,'completed');
 }
 for(const uid of [A,B]){
   const s=await d.call(uid,'snapshot'),raw=(await d.db.query('select save_data from user_saves where user_id=$1',[uid])).rows[0].save_data.state;
   assert.equal(s.profile.wins+s.profile.losses+s.profile.ties,5);assert.equal(raw.packs,5);assert.equal(raw.starterV199.remaining,5);
   assert.equal(Object.values(raw.binder).concat(Object.values(raw.bulkV64)).reduce((n,c)=>n+c.qty,0),53);
 }
 // Ranked rewards legitimately earn random XP, which can reach sv08's 80 XP
 // requirement. Restore a below-threshold fixture to test access isolation.
 await d.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,xp}','0'::jsonb) where user_id=$1",[A]);
 assert.ok(!(await d.call(A,'snapshot')).sets.some(s=>s.set_id==='sv08'));
 // Ranked access alone must not unlock the collection or private rooms.
 await assert.rejects(d.call(A,'room_create',{kind:'battle',set_id:'sv08',pack_count:1}),/SET_LOCKED/);
}));

test('identity trackers reject forged values and preserve privacy and older clients',fixture(async d=>{
 await d.call(A,'profile',{name:'Alice',trackers:['wins','streak'],wins:9000,stat_values:{wins:9000}});
 const s=await d.call(A,'snapshot');assert.equal(s.profile.wins,0);assert.equal(s.profile.stat_values.wins,0);
 for(const trackers of [null,{},['wins','wins'],['coins'],[1],['wins','losses','ties','streak']]){
   await assert.rejects(d.call(A,'profile',{name:'Forged',trackers}),/INVALID_TRACKERS/);
   assert.equal((await d.call(A,'snapshot')).profile.name,'Alice','invalid profile must roll back the entire change');
 }
 await d.call(A,'profile',{name:'Alice',show_record:false});
 const r=(await d.call(A,'room_create',{kind:'trade'})).rooms[0];
 assert.deepEqual(r.host_profile.trackers,['wins','streak']);assert.equal(r.host_profile.wins,null);assert.deepEqual(r.host_profile.stat_values,{});
 await d.call(A,'chat_send',{message:'Private record'});const message={profile:(await d.call(B,'snapshot')).chat_profiles[A]};
 assert.equal(message.profile.wins,null);assert.deepEqual(message.profile.stat_values,{});
 const empty=await d.call(A,'profile',{name:'Alice',trackers:[]});assert.deepEqual(empty.profile.trackers,[]);
 await d.db.transaction(async tx=>{await tx.exec('set local role authenticated');await assert.rejects(tx.query('select hub_private.battle_award_mode($1,\'[]\',\'sv04.5\',1,true)',[A]),/permission denied/);});
}));

test('new identity data remains backward compatible with existing room and chat snapshots',fixture(async d=>{
 const avatar='data:image/png;base64,iVBORw0KGgo=';
 await d.db.query("update user_saves set save_data=jsonb_set(save_data,'{state,profileV227}',$1) where user_id=$2",[JSON.stringify({avatarData:avatar}),A]);
 await d.call(A,'profile',{name:'Alice'});await d.call(A,'chat_send',{message:'Hello'});
 const s=await d.call(B,'snapshot');assert.equal(s.chat[0].name,'Alice');assert.equal(s.chat_profiles[A].avatar,avatar);assert.equal(s.chat_profiles[A].frame,null);
 await d.db.query("insert into hub_private.chat(user_id,message) values($1,'Another message')",[A]);
 const multiple=await d.call(B,'snapshot');assert.equal(multiple.chat.length,2);assert.equal(Object.keys(multiple.chat_profiles).length,1);assert.equal(multiple.chat[0].profile,undefined);
 await d.call(B,'block',{user_id:A});const blocked=await d.call(B,'snapshot');assert.deepEqual(blocked.chat,[]);assert.deepEqual(blocked.chat_profiles,{});
}));
