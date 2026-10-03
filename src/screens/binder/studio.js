export function installBinderStudio(bridge,render,doc=document){
 const root=doc.getElementById('binder');if(!root||root.dataset.studioReady)return;
 root.dataset.studioReady='true';root.classList.add('binder-studio','binder-gallery');
 const controls=['binderRarity','binderOrder','binderDuplicates'];
 for(const id of controls)doc.getElementById(id)?.addEventListener('change',()=>{bridge.setPage(0);render();});
 root.addEventListener('click',event=>{
   const mode=event.target.closest('[data-binder-view]');
   if(mode){const gallery=mode.dataset.binderView==='gallery';root.classList.toggle('binder-gallery',gallery);root.querySelectorAll('[data-binder-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===mode)));render();}
   if(event.target.closest('#binderClearFilters')){doc.getElementById('search').value='';doc.getElementById('setFilter').value='all';doc.getElementById('binderRarity').value='all';doc.getElementById('binderOrder').value='rarity';doc.getElementById('binderDuplicates').checked=false;bridge.setPage(0);render();}
 });
}
