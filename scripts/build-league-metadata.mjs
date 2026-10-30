// Refresh print-accurate Ranked metadata from the same TCGdex card IDs as our artwork.
// Usage: node scripts/build-league-metadata.mjs [migration-path]
// This tool is intentionally build-time only: no third-party API is needed in a match.
import {readFile,writeFile} from 'node:fs/promises';

const sets=['sv04.5','swsh12.5','swsh4.5','sv08','sv03'];
const destination=process.argv[2];
if(!destination)throw Error('Pass the existing Supabase migration file path.');
const cards=(await Promise.all(sets.map(async id=>JSON.parse(await readFile(`supabase/catalog/${id}.json`,'utf8'))))).flat();
const escapeSql=value=>value.replaceAll("'","''");
const output=new Array(cards.length);let cursor=0,done=0,failures=[];
async function worker(){
 while(cursor<cards.length){
  const i=cursor++,card=cards[i];
  try{
   let item;
   for(let retry=0;retry<3;retry++){
    const response=await fetch(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(card.id)}`,{signal:AbortSignal.timeout(14000)});
    if(response.ok){item=await response.json();break;}
    if(response.status!==429&&response.status<500)break;
    await new Promise(resolve=>setTimeout(resolve,750*(retry+1)));
   }
   if(!item)throw Error('API did not return card');
   if(item.category==='Pokemon'){
    const detail={hp:Number(item.hp)||null,types:item.types||[],attacks:(item.attacks||[]).slice(0,3).map(a=>({name:a.name||'Attack',damage:a.damage||'',cost:a.cost||[],effect:a.effect||''})),abilities:(item.abilities||[]).slice(0,2).map(a=>({name:a.name||'Ability',effect:a.effect||''})),weaknesses:item.weaknesses||[],resistances:item.resistances||[]};
    output[i]=`update hub_private.catalog set card=card || '${escapeSql(JSON.stringify(detail))}'::jsonb where id='${escapeSql(card.id)}';`;
   }
  }catch(error){failures.push(`${card.id}: ${String(error)}`)}
  done++;if(done%100===0)process.stdout.write(`Metadata ${done}/${cards.length}; failures ${failures.length}\n`);
 }
}
await Promise.all(Array.from({length:12},worker));
const sql=['-- Verified TCGdex per-print battle data; game economy/art/collection quantities are unchanged.',...output.filter(Boolean),''];
if(failures.length>0){process.stderr.write(failures.slice(0,15).join('\n')+'\n');throw Error(`${failures.length} card lookups failed; migration not written.`)}
await writeFile(destination,sql.join('\n'));
console.log(`Wrote ${output.filter(Boolean).length} Pokémon metadata rows to ${destination}`);
