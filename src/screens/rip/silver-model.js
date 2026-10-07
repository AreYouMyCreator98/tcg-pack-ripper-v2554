/** Presentation selectors: no inventory or economic mutations. */
export function adjacentUnlocked(sets,current,direction){
 const available=sets.filter(s=>s.unlocked);
 if(!available.length)return null;
 const index=available.findIndex(s=>s.id===current);
 return available[((index<0?0:index)+(direction<0?-1:1)+available.length)%available.length].id;
}
export function seriesLabel(series){return ({sv:'SCARLET & VIOLET',swsh:'SWORD & SHIELD',sm:'SUN & MOON',xy:'XY',bw:'BLACK & WHITE',me:'MEGA EVOLUTION'})[series]||String(series||'POKÉMON TCG').toUpperCase();}
export function selectedProgress(totals,id){const t=totals[id];return t?.total?Math.min(100,t.owned.size/t.total*100).toFixed(1)+'%':'Checklist';}
export function profileImage(snapshot){const src=snapshot?.profile?.avatar;return typeof src==='string'&&/^(data:image\/(png|jpeg|webp);base64,|https?:\/\/|assets\/)/i.test(src)?src:'';}
