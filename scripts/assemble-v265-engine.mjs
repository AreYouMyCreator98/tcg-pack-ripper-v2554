// Mechanical copier for the AI-aware V263 RPCs: preserves all auth and match
// handling while upgrading turn timing and server-side move validation.
import {readFile,writeFile} from 'node:fs/promises';

const migration='supabase/migrations/20261030071154_v265_battle_engine.sql';
const prior=await readFile('supabase/migrations/20261009010000_league_ai_fallback.sql','utf8');
let engine=await readFile(migration,'utf8');
if(engine.includes('-- Generated AI-compatible RPC upgrades')){
 engine=engine.split('-- Generated AI-compatible RPC upgrades')[0].trimEnd()+'\n';
}
const takeFunction=(name)=>{
 const start=prior.indexOf(`create or replace function ${name}(`);
 if(start<0)throw Error(`Missing ${name}`);
 const end=prior.indexOf('end $$;',start);
 if(end<0)throw Error(`Unterminated ${name}`);
 return prior.slice(start,end+'end $$;'.length);
};
let core=takeFunction('hub_private.league_command_core').replaceAll("interval '12 seconds'","interval '25 seconds'").replaceAll("'battle_version',1","'battle_version',2");
const validator="if act->>'kind'='swap' then n:=hub_private.integer_value(act->'target',0,4);if n=ix or (mine#>>array['squad',n::text,'hp'])::integer<=0 then raise exception 'INVALID_SWAP';end if;act:=jsonb_build_object('kind','swap','target',n);else act:=jsonb_build_object('kind',act->>'kind');end if;";
const improved=`if act->>'kind'='swap' then
    n:=hub_private.integer_value(act->'target',0,4);
    if n=ix or (mine#>>array['squad',n::text,'hp'])::integer<=0 then raise exception 'INVALID_SWAP';end if;
    act:=jsonb_build_object('kind','swap','target',n);
   elsif act->>'kind'='attack' then
    n:=hub_private.integer_value(coalesce(act->'move','0'::jsonb),0,jsonb_array_length(mine#>array['squad',ix::text,'stats','moves'])-1);
    if coalesce((mine#>>array['squad',ix::text,'energy'])::integer,2)+1 < (mine#>>array['squad',ix::text,'stats','moves',n::text,'energy'])::integer then raise exception 'INSUFFICIENT_ENERGY';end if;
    act:=jsonb_build_object('kind','attack','move',n);
   else
    if act->>'kind'='ability' and mine#>>array['squad',ix::text,'stats','ability']='none' then raise exception 'ABILITY_UNAVAILABLE';end if;
    act:=jsonb_build_object('kind',act->>'kind');
   end if;`;
if(!core.includes(validator))throw Error('RPC validation anchor changed; inspect manually');
core=core.replace(validator,improved);
let aiStep=takeFunction('hub_private.league_ai_step').replaceAll("interval '12 seconds'","interval '25 seconds'");
let aiMatch=takeFunction('hub_private.league_ai_try_match').replaceAll("'battle_version',1","'battle_version',2");
engine+='\n-- Generated AI-compatible RPC upgrades (rebuild via scripts/assemble-v265-engine.mjs)\n';
engine+=`${core}\n${aiStep}\n${aiMatch}\n`;
engine+='revoke all on function hub_private.league_stats(jsonb) from public,anon,authenticated;\n';
engine+='revoke all on function hub_private.league_enrich(jsonb) from public,anon,authenticated;\n';
engine+='revoke all on function hub_private.league_draft(jsonb,jsonb) from public,anon,authenticated;\n';
engine+='revoke all on function hub_private.league_affinity(text,text,text,text) from public,anon,authenticated;\n';
engine+='revoke all on function hub_private.league_resolve(uuid) from public,anon,authenticated;\n';
engine+='revoke all on function hub_private.league_command_core(text,jsonb,uuid) from public,anon,authenticated;\n';
engine+='revoke all on function hub_private.league_ai_step(uuid) from public,anon,authenticated;\ncommit;\n';
engine=engine.replace('revoke all on function hub_private.league_ai_step(uuid) from public,anon,authenticated;\ncommit;','revoke all on function hub_private.league_ai_step(uuid) from public,anon,authenticated;\nrevoke all on function hub_private.league_ai_try_match(uuid) from public,anon,authenticated;\ncommit;');
await writeFile(migration,engine);
console.log('Reassembled AI-safe core, timer and attack validation.');
