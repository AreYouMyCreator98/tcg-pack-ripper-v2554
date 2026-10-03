// Public metadata only. Review and apply the generated seed after the schema migration.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const definitions=vm.runInNewContext(source.slice(source.indexOf('const SETS='),source.indexOf('function isChaseCard('))+source.slice(source.indexOf('const MEGA_SET_REQUIREMENTS='),source.indexOf('function badgeDef('))+';({sets:SETS,mega:MEGA_SET_REQUIREMENTS,chases:CHASE_CARDS})');
const requested=process.argv.slice(2);
const sets=requested.includes('--all')?definitions.sets.map(s=>s.id):requested.length?requested:['sv04.5','swsh12.5','swsh4.5'];
const dir=new URL('../supabase/catalog/',import.meta.url);await mkdir(dir,{recursive:true});
async function get(path){
 for(let attempt=0;attempt<3;attempt++)try{const r=await fetch('https://api.tcgdex.net/v2/en/'+path,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`${path}: ${r.status}`);return await r.json();}catch(e){if(attempt===2)throw e;await new Promise(r=>setTimeout(r,500*(attempt+1)));}
}
async function detail(c,set){
 try{return await get('cards/'+encodeURIComponent(c.id));}catch(error){
  // Read only the literal rarity field from the official database; never execute it.
  const folder={sv:'Scarlet & Violet',swsh:'Sword & Shield',sm:'Sun & Moon',xy:'XY'}[definitions.sets.find(s=>s.id===set.id)?.series];
  const url='https://raw.githubusercontent.com/tcgdex/cards-database/master/data/'+[folder,set.name,c.localId+'.ts'].map(encodeURIComponent).join('/');
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw error;
  const text=await response.text();const match=text.match(/\brarity:\s*("(?:[^"\\]|\\.)*")/);if(!match)throw error;
  return {...c,rarity:JSON.parse(match[1]),metadataSource:url};
 }
}
function tier(c){const x=`${c.rarity||''} ${c.name||''}`.toLowerCase();if(/hyper|secret|rainbow|gold rare/.test(x))return 5;if(/special illustration|shiny ultra/.test(x))return 4;if(/illustration|shiny rare|rare shiny|ultra rare|amazing|radiant|trainer gallery|galarian gallery|\bvmax\b|\bvstar\b/.test(x))return 3;if(/double rare|ace spec|\bex\b|\bgx\b|(?:^|\s)v(?:$|\s)/.test(x))return 2;if(/rare|holo|reverse/.test(x))return 1;return 0;}
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
let all=[];
for(const sid of sets){
 const file=new URL(encodeURIComponent(sid)+'.json',dir);let cards;
 try{cards=JSON.parse(await readFile(file,'utf8'));}catch{
  const set=await get('sets/'+encodeURIComponent(sid));const pending=set.cards.filter(c=>c.image);cards=[];
  await Promise.all(Array.from({length:8},async()=>{while(pending.length){const c=await detail(pending.shift(),set);if(!c.image||!c.rarity)throw Error('Incomplete card '+c.id);const prices=c.pricing?.tcgplayer||{};const price=prices.holofoil?.marketPrice??prices.normal?.marketPrice??c.pricing?.cardmarket?.trend??.1;cards.push({id:c.id,set_id:sid,tier:tier(c),metadataSource:c.metadataSource||'https://api.tcgdex.net/v2/en/cards/'+c.id,card:{id:c.id,name:c.name,number:c.localId,set:definitions.sets.find(s=>s.id===sid)?.name||set.name,setId:sid,rarity:c.rarity,img:c.image+'/high.webp',thumb:c.image+'/low.webp',market:Math.max(.1,Math.round(Number(price)*100)/100),qty:1}});}}));
  cards.sort((a,b)=>a.id.localeCompare(b.id));await writeFile(file,JSON.stringify(cards,null,2)+'\n');
 }
 if(cards.length<10||cards.some(c=>!c.card.id||!Number.isFinite(c.card.market)))throw Error('Invalid catalog '+sid);
 console.log(sid,cards.length,'cards; tiers',Array.from({length:6},(_,t)=>cards.filter(c=>c.tier===t).length).join('/'));all.push(...cards);
}
const expansions=definitions.sets.filter(s=>sets.includes(s.id)).map(s=>({id:s.id,name:s.name,requirements:{xp:Math.max(0,(s.unlock-1)**2*80),...definitions.mega[s.id]},chases:definitions.chases[s.id]||[]}));
const sql='-- Reviewed TCGdex public metadata. Generated '+new Date().toISOString()+'.\n-- No player data is changed. Run after the Trade Hub schema migration.\nbegin;\ninsert into hub_private.expansions(id,name,requirements,chases) values\n'+expansions.map(s=>`(${quote(s.id)},${quote(s.name)},${quote(JSON.stringify(s.requirements))}::jsonb,${quote(JSON.stringify(s.chases))}::jsonb)`).join(',\n')+'\non conflict(id) do update set name=excluded.name,requirements=excluded.requirements,chases=excluded.chases;\ninsert into hub_private.catalog(id,set_id,card,tier) values\n'+all.map(c=>`(${quote(c.id)},${quote(c.set_id)},${quote(JSON.stringify(c.card))}::jsonb,${c.tier})`).join(',\n')+'\non conflict(id) do update set set_id=excluded.set_id,card=excluded.card,tier=excluded.tier;\ncommit;\n';
await writeFile(new URL('../supabase/seed-hub-catalog.sql',import.meta.url),sql);console.log('Catalog seed ready:',all.length,'cards');
