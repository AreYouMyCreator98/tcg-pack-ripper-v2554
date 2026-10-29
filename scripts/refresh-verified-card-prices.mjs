/**
 * TCGplayer USD quote backup for premium cards. The browser still requests
 * TCGdex directly; this same-origin file is a last-verified fallback when
 * phones cannot reach that third-party endpoint.
 *
 *   NODE_USE_ENV_PROXY=1 node scripts/refresh-verified-card-prices.mjs --all
 *   node scripts/refresh-verified-card-prices.mjs       # daily 1/7 rotation
 */
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const catalogDir=join(root,'public/catalog');
const output=join(catalogDir,'market-prices-usd.json');
const premium=/special illustration|illustration rare|ultra rare|hyper rare|secret rare|shiny|rainbow|gold|trainer gallery|galarian gallery|rare holo|radiant|vmax|vstar|black white rare|rare plus/i;
const variants=['normal','reverse-holofoil','holofoil','reverse','holo'];
const number=v=>Number.isFinite(Number(v))&&Number(v)>0&&Number(v)<100000?Math.round(Number(v)*100)/100:null;
const hash=id=>[...id].reduce((h,c)=>(Math.imul(31,h)+c.charCodeAt(0))>>>0,0);

export async function refreshPrices({all=false,now=Date.now(),fetchCard=fetch}={}){
 let existing={schema:1,cards:{}};
 try{existing=JSON.parse(await readFile(output,'utf8'));}catch{}
 if(existing?.schema!==1||!existing.cards||typeof existing.cards!=='object')existing={schema:1,cards:{}};
 const files=(await readdir(catalogDir)).filter(f=>f.endsWith('.json')&&!f.includes('market-prices')).sort();
 const candidates=new Set();
 for(const filename of files){
  const rows=JSON.parse(await readFile(join(catalogDir,filename),'utf8'));
  for(const card of rows){if(card?.id&&/^[a-z0-9.]+-[a-z0-9]+$/i.test(card.id)&&premium.test(String(card.rarity||'')))candidates.add(card.id);}
 }
 const slice=Math.floor(now/86400000)%7;
 const ids=[...candidates].sort().filter(id=>all||hash(id)%7===slice);
 let next=0,priced=0,unpriced=0,errors=0;
 async function worker(){
  while(next<ids.length){
   const id=ids[next++];
   try{
    const response=await fetchCard('https://api.tcgdex.net/v2/en/cards/'+encodeURIComponent(id),{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error('HTTP '+response.status);
    const card=await response.json(),p=card?.pricing?.tcgplayer;
    if(card?.id!==id||p?.unit!=='USD'){unpriced++;continue;}
    const record={unit:'USD',updated:typeof p.updated==='string'?p.updated:null};
    for(const kind of variants){const value=number(p[kind]?.marketPrice);if(value!==null)record[kind]={marketPrice:value};}
    if(Object.keys(record).length<=2){unpriced++;continue;}
    existing.cards[id]=record;priced++;
   }catch(error){errors++;if(all&&next%100===0)console.warn('Price fetch retry needed at '+id+': '+error.message);}
  }
 }
 await Promise.all(Array.from({length:6},worker));
 existing.schema=1;existing.generatedAt=new Date(now).toISOString();existing.source='TCGplayer USD via TCGdex';
 existing.coverage={premiumCandidates:candidates.size,pricedCards:Object.keys(existing.cards).length};
 existing.cards=Object.fromEntries(Object.entries(existing.cards).sort(([a],[b])=>a.localeCompare(b)));
 await writeFile(output,JSON.stringify(existing)+'\n');
 console.log(`Price backup: checked ${ids.length}/${candidates.size}, updated ${priced}, missing ${unpriced}, request errors ${errors}, total verified ${existing.coverage.pricedCards}`);
 if(errors>ids.length/3)throw Error('Too many price-provider errors; refusing to publish an unhealthy refresh.');
 if(all&&priced<Math.min(10,Math.floor(ids.length*.05)))throw Error('Too few verified quotes; refusing to treat this as a healthy full refresh.');
 return {checked:ids.length,priced,unpriced,errors,total:existing.coverage.pricedCards};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 await refreshPrices({all:process.argv.includes('--all')});
}
