import {cents} from './model.js';
export function contractDay(state,now=Date.now()){
 const anchor=Number(state.gameClockV170?.anchorReal)||now,length=Math.max(60000,Number(state.gameClockV170?.dayLengthMs)||3600000);
 return Math.max(state.collectorV260?.lastDay||0,Math.max(0,Math.floor((now-anchor)/length)));
}
export function generateContracts(state,day){
 // Freeze offers once per rotation. Requirements never exceed the eligible stock
 // at generation, and keep one copy of every identity by default.
 const cards=Object.entries(state.bulkV64||{}).filter(([id,c])=>Number(c.qty)>1&&!state.collectorV260?.cards?.[id]?.locked);
 if(!cards.length)return [];
 const select=(list,cap)=>{let left=cap;return list.flatMap(([id,c])=>{const qty=Math.min(left,Math.max(0,c.qty-1));left-=qty;return qty?[{id,qty}]:[];});};
 const offered=(id,title,category,lines,expires)=>{const market=lines.reduce((n,l)=>n+cents(state.bulkV64[l.id].market||.1)*l.qty,0);return{id,title,category,day,expires,lines,cashCents:Math.round(market*1.15)+100,xp:Math.min(180,lines.reduce((n,l)=>n+l.qty,0)*4)};};
 const sorted=[...cards].sort(([a],[b])=>a.localeCompare(b));
 const sets=[...new Set(sorted.map(([,c])=>c.setId||c.set))],chosen=sets[day%sets.length];
 return [offered(`daily:${day}`,'Local Card Shop','DAILY',select(sorted,40),day+1),offered(`set:${day}`,'Set Builder · '+chosen,'DAILY',select(sorted.filter(([,c])=>(c.setId||c.set)===chosen),15),day+1),offered(`weekly:${Math.floor(day/7)}`,'Event Organiser','WEEKLY',select(sorted,100),(Math.floor(day/7)+1)*7)];
}
export function refreshContracts(state,day){const data=state.collectorV260;data.lastDay=Math.max(day,data.lastDay||0);data.contracts??={};for(const [id,c]of Object.entries(data.contracts))if(c.expires<=day)delete data.contracts[id];if(data.contractRotation!==day){for(const offer of generateContracts(state,day))if(!data.contracts[offer.id])data.contracts[offer.id]=offer;data.contractRotation=day;}return Object.values(data.contracts);}
