export const cents = n => Math.round(Math.max(0,Number(n)||0)*100);
export const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
export function migrateCollector(state,now=Date.now()){
 if(state.collectorV260?.version>=1)return false;
 const rep=Math.max(0,Number(state.shopV84?.rep)||0);
 state.collectorV260={...state.collectorV260,version:1,migratedAt:now,cards:state.collectorV260?.cards||{},chases:state.collectorV260?.chases||[],receipts:{},masterRewards:{},journal:[],contracts:{},stats:{},revision:0,
 legacy:{shopRep:rep,jobs:structuredClone(state.jobs||{}),miniStats:structuredClone(state.miniStats||{}),career:structuredClone(state.jobCareer||{}),cardShowUnlocked:rep>=5,xpGranted:Math.min(2000,Math.floor(rep)*20)}};
 state.xp=(Number(state.xp)||0)+state.collectorV260.legacy.xpGranted;
 if(rep>=10){state.badges={...state.badges,legacy_dealer:true};state.collectorV260.legacy.title='Legacy Dealer';}
 return true;
}
export function cardRows(state){
 const rows=new Map();
 const add=(card,source,qty=1)=>{if(!card?.id||!(qty>0))return;let row=rows.get(card.id);if(!row){row={...card,id:card.id,qty:0,binder:0,bulk:0,graded:0,grading:0,listed:0,trade:0,slabs:[],...state.collectorV260?.cards?.[card.id]};rows.set(card.id,row);}row[source]+=qty;row.qty+=qty;if(source==='graded')row.slabs.push(card);};
 for(const [id,c]of Object.entries(state.binder||{}))add({...c,id},'binder',Number(c.qty));
 for(const [id,c]of Object.entries(state.bulkV64||{}))add({...c,id},'bulk',Number(c.qty));
 for(const c of state.gradingV44?.graded||[])add(c,'graded');
 for(const c of state.gradingV44?.submissions||[])add(c,'grading');
 for(const c of state.marketV57?.listings||[])add(c.slab||c.card||c,'listed',Number(c.qty)||1);
 for(const c of state.hubEscrowV256||[])add(c.card||c,c.kind==='trade'?'trade':'listed',Number(c.qty)||1);
 return [...rows.values()];
}
export function filterCards(rows,{query='',filter='all',sort='value',set='all',chases=[]}={}){
 const q=query.trim().toLowerCase();
 return rows.filter(c=>(set==='all'||c.setId===set)&&[c.id,c.name,c.set,c.number,c.rarity,c.finish,c.market,c.qty,c.slabs?.map(s=>s.grade).join(' ')].join(' ').toLowerCase().includes(q))
 .filter(c=>({all:true,new:!!c.discoveredAt&&Date.now()-c.discoveredAt<86400000,favourites:!!c.favourite,chases:chases.some(x=>x.id===c.id),duplicates:c.qty>1,value:Number(c.market)>=10,grade:Number(c.market)>=5&&(c.binder+c.bulk)>0,listed:c.listed>0,locked:!!c.locked})[filter]??true)
 .sort((a,b)=>({name:()=>String(a.name).localeCompare(b.name),set:()=>String(a.set).localeCompare(b.set),value:()=>Number(b.market||b.raw||0)-Number(a.market||a.raw||0),quantity:()=>b.qty-a.qty,rarity:()=>String(a.rarity).localeCompare(b.rarity),newest:()=>Number(b.discoveredAt||0)-Number(a.discoveredAt||0),need:()=>a.qty-b.qty}[sort]||(()=>0))()||String(a.name).localeCompare(String(b.name)));
}
export function collectionValue(state,price=c=>Number(c.market||c.raw||0),slabValue=c=>Number(c.raw||0),sealed=0,setId=null){
 let raw=0,graded=0;const accept=c=>!setId||c?.setId===setId;const addRaw=(c,q=1)=>{if(accept(c))raw+=price(c)*q;};
 for(const box of [state.binder,state.bulkV64])for(const c of Object.values(box||{}))addRaw(c,Number(c.qty)||0);
 for(const c of state.gradingV44?.submissions||[])addRaw(c);
 for(const c of state.gradingV44?.graded||[])if(accept(c))graded+=slabValue(c);
 for(const l of state.marketV57?.listings||[]){if(l.slab){if(accept(l.slab))graded+=slabValue(l.slab);}else addRaw(l.card||l,Number(l.qty)||1);}
 for(const c of state.hubEscrowV256||[])addRaw(c.card||c,Number(c.qty)||1);
 return {raw,graded,sealed,total:raw+graded+sealed};
}
export function population(state,id,finish){const slabs=(state.gradingV44?.graded||[]).filter(c=>c.id===id&&(!finish||c.finish===finish));return{total:slabs.length,ten:slabs.filter(c=>c.grade>=10).length,nine:slabs.filter(c=>c.grade>=9&&c.grade<10).length,eight:slabs.filter(c=>c.grade>=8&&c.grade<9).length,lower:slabs.filter(c=>c.grade<8).length,highest:Math.max(0,...slabs.map(c=>Number(c.grade)||0))};}
export function gradeEstimate(condition){const v=Object.values(condition||{}).filter(Number.isFinite);if(v.length!==4)return null;const low=Math.min(...v)/10;return{low:Math.max(1,Math.floor(low)-1),high:Math.min(10,Math.ceil(low)+1),flaws:Object.entries(condition).filter(([,n])=>n<90).map(([key])=>key)};}
export function journal(state,event){const c=state.collectorV260;if(!c||c.journal.some(x=>x.id===event.id))return;c.journal.unshift({time:Date.now(),...event});c.journal=c.journal.slice(0,200);}
