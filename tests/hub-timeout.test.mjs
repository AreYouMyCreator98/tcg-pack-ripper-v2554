import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {performance} from 'node:perf_hooks';import {database,USERS} from './hub-database.mjs';
const [A,B]=USERS;
const migration=file=>readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8');
test('full catalogue/large save query evaluates unlocks after aggregation; all player data survive',async()=>{
 const d=await database();try{
 await d.db.exec(await migration('20261008010000_battle_live_sync.sql'));
 const binder=Object.fromEntries(Array.from({length:5000},(_,i)=>['large-'+i,{id:'large-'+i,name:'Owned card '+i,qty:2,market:1,setId:'sv04.5',img:'https://assets.tcgdex.net/en/sv/sv04.5/001/high.webp',history:Array(10).fill({day:10,value:1})}]));
 await d.db.query("update public.user_saves set save_data=jsonb_set(save_data,'{state,binder}',$1) where user_id=$2",[JSON.stringify(binder),A]);
 await d.db.exec(`insert into hub_private.expansions(id,name) select 'load-'||i,'Set '||i from generate_series(1,32) i;
 insert into hub_private.catalog(id,set_id,card,tier) select 'load-'||i,'load-'||(1+i%32),jsonb_build_object('id','load-'||i,'set','Set '||(1+i%32)),0 from generate_series(1,6889)i;
 insert into hub_private.rooms(kind,host_id,guest_id,status,created_at) select 'battle','${A}','${B}','completed',now()-i*interval '1 hour' from generate_series(1,2000)i;analyze;`);
 const beforeData=(await d.db.query('select user_id,save_data,save_version from public.user_saves order by user_id')).rows;
 let start=performance.now();const before=await d.call(A,'snapshot');const beforeMs=performance.now()-start;
 await d.db.exec(await migration('20261008020000_hub_snapshot_timeout.sql'));
 start=performance.now();const after=await d.call(A,'snapshot');const afterMs=performance.now()-start;
 assert.deepEqual(after.inventory,before.inventory);assert.equal(after.coins,before.coins);assert.deepEqual(after.sets,before.sets);assert.deepEqual((await d.db.query('select user_id,save_data,save_version from public.user_saves order by user_id')).rows,beforeData);
 const q=`with grouped as materialized(select set_id,min(card->>'set') name,count(*) cards from hub_private.catalog where enabled group by set_id having count(*)>=10) select * from grouped where hub_private.set_unlocked('${A}',set_id)`;
 const plan=JSON.stringify((await d.db.query('explain (format json) '+q)).rows);assert.match(plan,/CTE Scan/);
 const def=(await d.db.query("select pg_get_functiondef('hub_private.snapshot_full(uuid)'::regprocedure) as d")).rows[0].d;assert.match(def,/grouped as materialized/);
 const api=(await d.db.query("select pg_get_functiondef('public.hub_command(text,jsonb,uuid)'::regprocedure) as d")).rows[0].d;assert.ok(api.indexOf("if p_action='snapshot'")<api.indexOf('perform pg_advisory_xact_lock'));
 await assert.rejects(d.call(A,'deposit_stake',{stake:25}),/STAKES_NOT_ENABLED/);
 const fast=()=>d.db.transaction(async tx=>{await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[A]);await tx.exec('set local role authenticated');return (await tx.query("select public.hub_battle_update('snapshot') as r")).rows[0].r;});
 const ticks=[];for(let i=0;i<20;i++){start=performance.now();const r=await fast();ticks.push(performance.now()-start);assert.equal(r.rooms.length,1);assert.equal(r.inventory,undefined);assert.equal(r.sets,undefined);assert.equal(r.chat,undefined);}
 assert.equal((await d.db.query('select count(*)::integer n from hub_private.rooms')).rows[0].n,2000);
 console.log('HOTFIX STRESS',JSON.stringify({cards:5000,catalogue:6909,history:2000,beforeMs:Math.round(beforeMs),afterMs:Math.round(afterMs),battleMedianMs:Math.round(ticks.sort((a,b)=>a-b)[10]),battleMaxMs:Math.round(Math.max(...ticks))}));
 }finally{await d.close();}
});

test('receipt window index bounds scans without dropping recovery history',async()=>{
 const d=await database();try{
 await d.db.exec(`insert into hub_private.requests(user_id,request_id,action,payload,result,created_at)
 select '${A}',gen_random_uuid(),'heartbeat','{}','{}',now()-interval '1 day' from generate_series(1,20000);analyze;`);
 const q=`select count(*) from hub_private.requests where user_id='${A}' and created_at>now()-interval '1 minute'`;
 const before=JSON.stringify((await d.db.query('explain (analyze,format json) '+q)).rows);
 const sql=(await migration('20261008020001_hub_request_window_index.sql')).replace('create index concurrently','create index');await d.db.exec(sql);await d.db.exec('analyze hub_private.requests');
 const after=JSON.stringify((await d.db.query('explain (analyze,format json) '+q)).rows);
 assert.match(before,/20000/);assert.match(after,/hub_requests_user_created/);assert.equal((await d.db.query('select count(*)::integer n from hub_private.requests')).rows[0].n,20000);
 }finally{await d.close();}
});

test('hotfix accepts the known pre-V260 invoker without replacing its security contract',async()=>{
 const d=await database();try{
 await d.db.exec(await migration('20261008010000_battle_live_sync.sql'));
 await d.db.exec(`create or replace function public.hub_command(p_action text,p_payload jsonb default '{}',p_request_id uuid default null)
 returns jsonb language sql security invoker set search_path='' as $$ select hub_private.command(p_action,p_payload,p_request_id); $$;
 grant execute on function hub_private.command(text,jsonb,uuid) to authenticated;`);
 await d.db.exec(await migration('20261008020000_hub_snapshot_timeout.sql'));
 assert.equal((await d.call(A,'snapshot')).battle_sync_version,2);
 const mode=(await d.db.query("select prosecdef from pg_proc where oid='public.hub_command(text,jsonb,uuid)'::regprocedure")).rows[0].prosecdef;assert.equal(mode,false);
 }finally{await d.close();}
});
