// Generate a non-destructive upsert for V264's ten expansion definitions.
// Re-run after import-v264-sets.mjs. No remote credentials are needed.
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const ids=['base1','base2','base3','base5','neo1','sv08.5','sv10.5b','sv10.5w','me05','30th'];
const source=await readFile(new URL('public/runtime/core.js',root),'utf8');
const definitions=vm.runInNewContext(source.slice(source.indexOf('const SETS='),source.indexOf('function isChaseCard('))+source.slice(source.indexOf('const MEGA_SET_REQUIREMENTS='),source.indexOf('function badgeDef('))+';({sets:SETS,mega:MEGA_SET_REQUIREMENTS,chases:CHASE_CARDS})');
const quoted=v=>"'"+String(v).replaceAll("'","''")+"'";
const xpFloor=lv=>Math.max(0,(lv-1)**2*80);
const sets=definitions.sets.filter(s=>ids.includes(s.id));
if(sets.length!==10)throw Error('Missing a V264 expansion definition');
const expansions=sets.map(s=>({id:s.id,name:s.name,requirements:{...definitions.mega[s.id],xp:Math.ceil((definitions.mega[s.id]?.xp??xpFloor(s.unlock))*1.5)},chases:definitions.chases[s.id]||[]}));
const cards=(await Promise.all(ids.map(async id=>JSON.parse(await readFile(new URL('supabase/catalog/'+id+'.json',root),'utf8'))))).flat();
if(cards.length!==1255||new Set(cards.map(c=>c.id)).size!==1255)throw Error('Unexpected card catalog');
const sql=[
  '-- V264: ten new expansions and 1,255 authentic card definitions.',
  '-- Only UPSERTS expansion/catalog rows. Does not touch auth, user saves, wallets or existing cards.',
  'begin;',
  'insert into hub_private.expansions(id,name,requirements,chases) values',
  expansions.map(s=>`(${quoted(s.id)},${quoted(s.name)},${quoted(JSON.stringify(s.requirements))}::jsonb,${quoted(JSON.stringify(s.chases))}::jsonb)`).join(',\n'),
  'on conflict(id) do update set name=excluded.name, requirements=excluded.requirements, chases=excluded.chases;',
  'insert into hub_private.catalog(id,set_id,card,tier) values',
  cards.map(c=>`(${quoted(c.id)},${quoted(c.set_id)},${quoted(JSON.stringify(c.card))}::jsonb,${c.tier})`).join(',\n'),
  'on conflict(id) do update set set_id=excluded.set_id, card=excluded.card, tier=excluded.tier;',
  'commit;',''
].join('\n');
await writeFile(new URL('supabase/seed-v264-sets.sql',root),sql);
console.log('Generated seed for',sets.length,'expansions and',cards.length,'cards, bytes',sql.length);
