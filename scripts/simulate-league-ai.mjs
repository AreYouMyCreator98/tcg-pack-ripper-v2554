// Explicit offline maintenance: runs the production SQL resolver, not a JS clone.
import {aiDatabase,USERS} from '../tests/league-ai-fixture.mjs';import {writeFile,mkdir} from 'node:fs/promises';
const h=await aiDatabase();try{
await h.enable();await h.league(USERS[0],'queue_join');await h.league(USERS[0],'queue_cancel');
// Representative real catalog card metadata. No save/cloud mutation.
const {readFile}=await import('node:fs/promises');await h.db.exec(await readFile(new URL('../supabase/seed-hub-catalog.sql',import.meta.url),'utf8'));
await h.db.exec(`create temporary table ai_sim_results(rank text,game int,winner text,turns int,cost_a int,cost_b int,actions jsonb,advantage int,rp_delta int,draft_ms numeric,decision_ms numeric,resolve_ms numeric);`);
const at=performance.now();
await h.db.exec(`do $$
declare ranks int[]:=array[100,330,550,820,1150,1550,2000];r int;g int;t int;k text;mid uuid;bot uuid:='a1263000-0000-4000-8000-000000000001';
 ca jsonb;cb jsonb;da jsonb;db jsonb;aa jsonb;ab jsonb;combat jsonb;m hub_private.league_matches;acts jsonb;ts timestamptz;dm numeric;am numeric;rm numeric;pair_seed int;sid text;
begin
 for r in select unnest(ranks) loop
 for g in 1..200 loop
  pair_seed:=((r*200+((g-1)/2))%100000);perform setseed(pair_seed/100000.0);
  sid:=case ((g-1)/2)%5 when 0 then 'sv04.5' when 1 then 'swsh12.5' when 2 then 'swsh4.5' when 3 then 'sv08' else 'sv03' end;
  ca:=hub_private.league_enrich(hub_private.make_pack(sid,1));cb:=hub_private.league_enrich(hub_private.make_pack(sid,1));
  ts:=clock_timestamp();da:=hub_private.league_ai_draft(ca,hub_private.league_ai_skill(r));db:=hub_private.league_ai_draft(cb,hub_private.league_ai_skill(r));dm:=extract(epoch from(clock_timestamp()-ts))*500;
  combat:=jsonb_build_object('a',hub_private.league_draft(ca,da),'b',hub_private.league_draft(cb,db));
  if g%2=0 then combat:=jsonb_build_object('a',combat->'b','b',combat->'a');end if;
  update hub_private.profiles set rp=r where user_id='${USERS[0]}';update hub_private.league_ai_profiles set rp=r,highest_rp=greatest(highest_rp,r) where id=bot;
  insert into hub_private.league_matches(host_id,ai_profile_id,phase,rules,combat,cards_a,cards_b,deadline) values('${USERS[0]}',bot,'battle',jsonb_build_object('ai_rp_modifier',1,'ai_skill',hub_private.league_ai_skill(r)),combat,ca,cb,now()+interval '1 day') returning id into mid;
  acts:='{}';am:=0;rm:=0;
  for t in 1..20 loop
   select * into m from hub_private.league_matches where id=mid;
   exit when m.phase='result';
   ts:=clock_timestamp();perform setseed(((pair_seed+t*13+case when g%2=0 then 7919 else 0 end)%100000)/100000.0);
   aa:=hub_private.league_ai_action(hub_private.league_ai_observation(m.combat,'a',t,m.last_turn),hub_private.league_ai_skill(r),'balanced');
   perform setseed(((pair_seed+t*13+case when g%2=1 then 7919 else 0 end)%100000)/100000.0);
   ab:=hub_private.league_ai_action(hub_private.league_ai_observation(m.combat,'b',t,m.last_turn),hub_private.league_ai_skill(r),'balanced');am:=am+extract(epoch from(clock_timestamp()-ts))*500;
   k:=ab->>'kind';acts:=jsonb_set(acts,array[k],to_jsonb(coalesce((acts->>k)::int,0)+1));
   update hub_private.league_matches set action_a=aa,action_b=ab where id=mid;
   ts:=clock_timestamp();perform hub_private.league_resolve(mid);rm:=rm+extract(epoch from(clock_timestamp()-ts))*1000;
  end loop;
  select * into m from hub_private.league_matches where id=mid;
  if m.phase<>'result' then raise exception 'SIMULATION_STUCK';end if;
  insert into ai_sim_results values(hub_private.league_ai_rank(r),g,case when m.result->>'winner'=bot::text then 'ai' when m.result->>'winner' is null then 'draw' else 'reference' end,m.turn-1,(combat#>>'{a,cost}')::int,(combat#>>'{b,cost}')::int,acts,(m.combat#>>'{b,metrics,advantage}')::int,(m.result#>>array[bot::text,'delta'])::int,dm,am/(m.turn-1),rm/(m.turn-1));
 end loop;end loop;
end $$;`);
const rows=(await h.db.query(`select rank,count(*)::int matches,count(*) filter(where winner='ai')::int wins,count(*) filter(where winner='draw')::int draws,round(avg(case winner when 'ai' then 1 when 'draw' then .5 else 0 end)*100,2) score_percent,round(avg(turns),2) average_turns,round(avg(cost_b),2) draft_cost,round(avg(advantage),2) advantage_attacks,sum(rp_delta)::int rp_movement,round(avg(draft_ms),3) draft_ms,round(max(draft_ms),3) draft_max_ms,round(avg(decision_ms),3) decision_ms,round(avg(resolve_ms),3) resolve_ms from ai_sim_results group by rank order by min(game)`)).rows;
const actions=(await h.db.query(`select key action,sum(value::int)::int count from ai_sim_results,jsonb_each_text(actions) group by key order by key`)).rows;
const {createHash}=await import('node:crypto');const migration_sha256=createHash('sha256').update(await readFile(new URL('../supabase/migrations/20261009010000_league_ai_fallback.sql',import.meta.url))).digest('hex');
const result={migration_sha256,generated:new Date().toISOString(),environment:'Local PGlite PostgreSQL WASM; not production server or human skill calibration',matches:1400,reference:'Same-rank heuristic self-play, paired swapped seats with identical packs and per-player decision seeds, representative live catalog metadata, no real players. Win rate measures symmetry, not human difficulty.',elapsed_ms:Math.round(performance.now()-at),ranks:rows,actions};
await mkdir('docs/v263',{recursive:true});await writeFile('docs/v263/simulation-results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await h.close();}
