export const quantity = value => Number.isSafeInteger(Number(value)) && Number(value)>0 ? Number(value) : 0;
export const money = cents => '$'+(Number(cents||0)/100).toFixed(2);
export const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function filterCards(cards,{search='',set='',rarity='',duplicates=false,sort='name'}={}) {
  const query=search.trim().toLowerCase();
  return cards.filter(c=>quantity(c.qty)>0&&(!set||c.set===set)&&(!rarity||c.rarity===rarity)&&(!duplicates||quantity(c.qty)>1)&&(!query||[c.name,c.number,c.set,c.rarity].join(' ').toLowerCase().includes(query))).sort((a,b)=>{
    const delta=sort==='quantity'?b.qty-a.qty:sort==='value'?b.unitCents*b.qty-a.unitCents*a.qty:0;
    return delta||String(a.name).localeCompare(String(b.name))||String(a.id).localeCompare(String(b.id));
  });
}
export function summary(cards) {
  return cards.reduce((s,c)=>({unique:s.unique+1,copies:s.copies+quantity(c.qty),spares:s.spares+Math.max(0,quantity(c.qty)-1),value:s.value+quantity(c.qty)*c.unitCents}),{unique:0,copies:0,spares:0,value:0});
}
export function salePlan(snapshot,selected,keepOne=true) {
  const lines=snapshot.cards.filter(c=>selected.has(c.id)).map(c=>({id:c.id,name:c.name,owned:quantity(c.qty),qty:Math.max(0,quantity(c.qty)-(keepOne?1:0)),unitCents:c.unitCents})).filter(c=>c.qty>0);
  return {account:snapshot.account,keepOne,lines,copies:lines.reduce((n,c)=>n+c.qty,0),total:lines.reduce((n,c)=>n+c.qty*c.unitCents,0)};
}
