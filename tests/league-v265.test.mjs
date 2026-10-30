import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {database,USERS} from './hub-database.mjs';
import {aiDatabase} from './league-ai-fixture.mjs';
import {battleStats} from '../src/league/rules.js';

const migrations=['20261008010000_battle_live_sync.sql','20261008020000_hub_snapshot_timeout.sql','20261008040000_collector_league.sql','20261009010000_league_ai_fallback.sql','20261030070756_v265_card_accurate_battles.sql','20261030071154_v265_battle_engine.sql'];
const fetchSql=async file=>readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8');
const pikachu={id:'sv04.5-019',name:'Pikachu',tier:0,rarity:'Common',hp:70,types:['Lightning'],attacks:[{name:'Pika Bolt',damage:'30',cost:['Lightning'],effect:'A concentrated electric attack.'},{name:'Thunder',damage:'90',cost:['Lightning','Lightning','Colorless'],effect:'This Pokémon also does 10 damage to itself.'}],weaknesses:[{type:'Fighting',value:'×2'}],resistances:[]};
const pidgey={id:'sv04.5-021',name:'Pidgey',tier:0,rarity:'Common',hp:70,types:['Colorless'],attacks:[{name:'Peck',damage:'20',cost:['Colorless']}],weaknesses:[{type:'Lightning',value:'×2'}],resistances:[]};

test('V265 server is AI-compatible, printed cards match client, and attack choice changes damage',async()=>{
 const h=await database();
 try{
  for(const m of migrations)await h.db.exec(await fetchSql(m));
  for(const card of [pikachu,pidgey,{id:'trainer-1',tier:3,rarity:'Rare'}]){
   const actual=(await h.db.query('select hub_private.league_stats($1) v',[card])).rows[0].v;
   assert.deepEqual(actual,battleStats(card));
  }
  assert.equal(battleStats(pikachu).type,'lightning');
  assert.equal(battleStats(pidgey).max_hp,70);
  const cards=[pikachu,pikachu,pikachu,pikachu,pikachu];
  const x=(await h.db.query('select hub_private.league_draft($1,$2) v',[cards,[0,1,2,3,4]])).rows[0].v;
  assert.equal(x.squad[0].hp,70);
  assert.equal(x.squad[0].energy,2);
  const a=(await h.db.query('select hub_private.league_draft($1,$2) v',[[pidgey,pidgey,pidgey,pidgey,pidgey],[0,1,2,3,4]])).rows[0].v;
  const ai=(await h.db.query("select hub_private.league_ai_action($1,1,'balanced') as v",[{own:x,opponent:a,turn:1,previous:{}}])).rows[0].v;
  assert.ok(['attack','defend','swap','ability'].includes(ai.kind));
  await h.db.query('select hub_private.league_ai_validate_action($1,$2)',[{a:x,b:x},{kind:'attack',move:1}]);
  await assert.rejects(h.db.query('select hub_private.league_ai_validate_action($1,$2)',[{a:x,b:x},{kind:'attack',move:99}]),/out of range|INVALID|VALUE|integer/i);
  const newMatch=async(move)=>{
   const result=await h.db.query("insert into hub_private.league_matches(host_id,guest_id,phase,rules,combat,action_a,action_b) values($1,$2,'battle','{}',$3,$4,$5) returning id",[USERS[0],USERS[1],{a:x,b:a},{kind:'attack',move},{kind:'defend'}]);
   const id=result.rows[0].id;
   await h.db.query('select hub_private.league_resolve($1)',[id]);
   return (await h.db.query('select combat,last_turn from hub_private.league_matches where id=$1',[id])).rows[0];
  };
  const quick=await newMatch(0),heavy=await newMatch(1);
  assert.equal(quick.last_turn.events.find(e=>e.kind==='attack').damage,30,'printed 30 x weakness 2 x defend .5');
  assert.equal(heavy.last_turn.events.find(e=>e.kind==='attack').damage,70,'higher printed attack causes KO');
  assert.equal(heavy.combat.b.kos,1);
  assert.equal(quick.combat.b.kos,0);
 }finally{await h.close();}
});

test('V265 ranked AI follows the same new battle rules, preserves ranked settlement',async()=>{
 const h=await aiDatabase();
 try{
  await h.db.exec(await fetchSql('20261030071154_v265_battle_engine.sql'));
  await h.enable();let s=await h.matchAI(),id=s.match.id;
  s=await h.league(USERS[0],'ready',{match_id:id,revision:s.match.revision});
  await h.league(USERS[0],'reveal',{match_id:id,progress:10});
  for(let i=0;i<12;i++)await h.due(id);
  s=await h.league(USERS[0],'snapshot');assert.equal(s.match.phase,'draft');
  const indices=s.match.cards.map((c,i)=>({i,cost:battleStats(c).cost})).sort((a,b)=>a.cost-b.cost).slice(0,5).map(x=>x.i);
  s=await h.league(USERS[0],'draft_confirm',{match_id:id,revision:s.match.revision,indices});
  await h.due(id);s=await h.league(USERS[0],'snapshot');assert.equal(s.match.phase,'battle');
  assert.ok(s.match.combat.a.squad[0].stats.moves.length>0);
  for(let turn=0;turn<20&&s.match.phase==='battle';turn++){
   await h.due(id);s=await h.league(USERS[0],'snapshot');
   assert.equal(s.match.opponent_locked,true,'AI submits its own validated action');
   const active=s.match.combat.a.squad[s.match.combat.a.active];
   const move=active.stats.moves.findIndex(v=>v.energy<=Math.min(4,active.energy+1));
   const action=move>=0?{kind:'attack',move}:{kind:'defend'};
   s=await h.league(USERS[0],'turn_submit',{match_id:id,revision:s.match.revision,turn:s.match.turn,action});
  }
  assert.equal(s.match.phase,'result');
  assert.ok(s.match.result[USERS[0]]);
  assert.equal((await h.db.query('select count(*)::integer n from hub_private.league_ai_history')).rows[0].n,1);
 }finally{await h.close();}
});
