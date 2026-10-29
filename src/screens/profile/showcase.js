import {cardImageMarkup} from '../../artwork/card-image.js';
import {esc} from '../../collector/model.js';

const key=choice=>choice?.kind==='slab'?`slab:${choice.uid}`:`${choice?.kind}:${choice?.id}`;
const grade=card=>Number(card.grade||0).toFixed(1);

export function installProfileShowcase(win=window,doc=document,bridge=win.tcgProfileStudioBridge){
 const root=doc.getElementById('profileCardShowcase'),grid=doc.getElementById('profileShowcaseGrid'),picker=doc.getElementById('profileShowcasePicker');
 if(!root||!grid||!picker||!bridge)return {refresh(){},dispose(){}};
 // Keep the mobile picker outside the animated tab panel so the fixed overlay
 // is never clipped or hidden by a panel transition.
 root.closest('#profile')?.append(picker);
 const $=id=>doc.getElementById(id);
 let snapshot=null,signature='',slot=null,all=[],filter='all',query='',shown=36,returnFocus=null;
 const status=text=>{$('profileShowcaseStatus').textContent=text;};
 function renderSlots(data=bridge.snapshot()){
   snapshot=data;
   const next=JSON.stringify([data.account,data.blocked,(data.showcase||[]).map(s=>s&&[s.kind,s.id,s.uid,s.owned?.name,s.owned?.grade,s.owned?.card?.thumb,s.owned?.card?.img,s.owned?.card?.qty])]);
   if(next===signature)return;signature=next;
   grid.innerHTML=Array.from({length:5},(_,i)=>{
     const saved=data.showcase?.[i],owned=saved?.owned,featured=i===0;
     const label=featured?'FEATURED CARD':`SLOT ${i+1}`;
     const content=owned?`${cardImageMarkup(owned.card,{quality:featured?'high':'thumb'})}${owned.kind==='slab'?`<span class="profile-showcase-grade">${grade(owned)}</span>`:''}`:`<span class="profile-showcase-vacant"><span aria-hidden="true">✦</span><b>${saved?'Card no longer owned':'Add a card'}</b></span>`;
     return `<article class="profile-showcase-slot ${featured?'featured':''} ${owned?'filled':''}"><div class="profile-showcase-label">${label}</div><div class="profile-showcase-art">${content}</div><div class="profile-showcase-meta"><b>${esc(owned?.name||'Your next favourite')}</b><small>${owned?esc(owned.set||'Collection')+(owned.kind==='slab'?` · GRADE ${grade(owned)}`:owned.kind==='special'?' · SPECIAL REWARD':' · RAW CARD'):saved?'Sold or moved out of your vault':'Choose from your collection'}</small></div><button type="button" data-showcase-slot="${i}" ${data.blocked?'disabled':''}>${owned?'Change card':'Choose card'}</button></article>`;
   }).join('');
 }
 function matches(c){
   if(filter!=='all'&&c.kind!==filter)return false;
   const haystack=[c.name,c.set,c.id,c.rarity,c.card.finish,c.kind==='slab'?'graded slab '+grade(c):c.kind==='special'?'special reward':'raw card'].join(' ').toLowerCase();
   return query.toLowerCase().trim().split(/\s+/).every(part=>haystack.includes(part));
 }
 function renderResults(){
   if(slot===null)return;
   const matchesAll=all.filter(matches),visible=matchesAll.slice(0,shown);
   const occupied=new Set((bridge.snapshot().showcase||[]).map((c,i)=>i===slot?'':key(c)));
   $('profileShowcasePickerTitle').textContent=slot===0?'Choose your featured card':`Choose card for slot ${slot+1}`;
   $('profileShowcaseResultsInfo').textContent=`${matchesAll.length} matching owned ${matchesAll.length===1?'card':'cards'} · showing ${visible.length}`;
   $('profileShowcaseResults').innerHTML=visible.map(c=>{
     const i=all.indexOf(c),taken=occupied.has(key(c));
     return `<button type="button" data-showcase-choice="${i}" ${taken?'disabled':''}>${cardImageMarkup(c.card)}<span class="profile-showcase-result-copy"><b>${esc(c.name)}</b><small>${esc(c.set||'Collection')} · ${esc(c.rarity||'Card')}</small><em>${c.kind==='slab'?'GRADED · '+grade(c):c.kind==='special'?'SPECIAL REWARD':'RAW CARD'}${taken?' · ON DISPLAY':''}</em></span>${c.kind==='slab'?`<strong class="profile-showcase-result-grade">${grade(c)}</strong>`:''}</button>`;
   }).join('')||'<p class="profile-showcase-empty">No matching owned cards. Try another search or filter.</p>';
   $('profileShowcaseMore').hidden=shown>=matchesAll.length;
   picker.querySelectorAll('[data-showcase-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.showcaseFilter===filter)));
   picker.querySelector('[data-showcase-clear]').disabled=!bridge.snapshot().showcase?.[slot];
 }
 function open(which){
   if(!Number.isInteger(which)||which<0||which>4)return;
   snapshot=bridge.snapshot();if(snapshot.blocked){status('Your collection is syncing. Wait a moment to change your display.');return;}
   slot=which;all=bridge.showcaseCandidates();filter='all';query='';shown=36;returnFocus=doc.activeElement;
   $('profileShowcaseSearch').value='';picker.hidden=false;renderResults();$('profileShowcaseSearch').focus();
 }
 function dismiss(){picker.hidden=true;slot=null;all=[];returnFocus?.focus?.({preventScroll:true});}
 function choose(choice){
   if(slot===null)return;
   const current=slot,owner=snapshot.account;
   try{bridge.showcaseSlot(current,choice,owner);signature='';renderSlots();dismiss();status(choice?`Slot ${current+1} saved to your profile.`:`Slot ${current+1} cleared.`);}
   catch(error){$('profileShowcaseResultsInfo').textContent=error.message||'Could not save this card.';}
 }
 function click(event){
   const button=event.target.closest('button,[data-showcase-dismiss]');if(!button)return;
   if(button.dataset.showcaseSlot!==undefined){open(Number(button.dataset.showcaseSlot));return;}
   if(button.dataset.showcaseDismiss!==undefined){dismiss();return;}
   if(button.dataset.showcaseFilter){filter=button.dataset.showcaseFilter;shown=36;renderResults();return;}
   if(button.dataset.showcaseChoice!==undefined){const candidate=all[Number(button.dataset.showcaseChoice)];if(candidate)choose(candidate.kind==='slab'?{kind:'slab',uid:candidate.uid}:{kind:candidate.kind,id:candidate.id});return;}
   if(button.dataset.showcaseClear!==undefined){choose(null);return;}
   if(button.id==='profileShowcaseMore'){shown+=36;renderResults();}
 }
 function input(event){if(event.target.id==='profileShowcaseSearch'){query=event.target.value;shown=36;renderResults();}}
 function keyboard(event){if(event.key==='Escape'&&!picker.hidden){event.preventDefault();dismiss();}}
 root.addEventListener('click',click);picker.addEventListener('click',click);picker.addEventListener('input',input);picker.addEventListener('keydown',keyboard);
 return {refresh:renderSlots,dispose(){root.removeEventListener('click',click);picker.removeEventListener('click',click);picker.removeEventListener('input',input);picker.removeEventListener('keydown',keyboard);}};
}
