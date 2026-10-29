import {readFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../public/catalog/market-prices-usd.json',import.meta.url),'utf8'));
if(data.schema!==1||!data.cards||typeof data.cards!=='object')throw Error('Invalid price snapshot schema');
const ids=Object.keys(data.cards);
if(ids.length<500||data.coverage?.pricedCards!==ids.length)throw Error('Verified price backup lost too many entries');
for(const [id,p] of Object.entries(data.cards)){
 if(!/^[a-z0-9.]+-[a-z0-9]+$/i.test(id)||p?.unit!=='USD'||!p.updated||!Number.isFinite(Date.parse(p.updated)))throw Error('Invalid source identity: '+id);
 const kinds=['normal','reverse-holofoil','holofoil','reverse','holo'];
 if(!kinds.some(k=>Number.isFinite(p[k]?.marketPrice)&&p[k].marketPrice>0))throw Error('Unquoted source identity: '+id);
}
if(data.cards['sv04.5-232']?.holofoil?.marketPrice<=1)throw Error('Mew ex SIR price is missing from the backup');
console.log(`Verified USD quote backup OK (${ids.length} premium cards)`);
