import {filterCards,summary,salePlan,money,escape as e} from './model.js';

export function installBulkModule(win=window,doc=document) {
  if(win.tcgBulkView)return win.tcgBulkView;
  const root=doc.getElementById('bulk'),bridge=win.tcgBulkBridge;
  if(!root||!bridge)return;
  const $=id=>doc.getElementById(id),selected=new Set();
  let data=null,limit=24,mode='library',plan=null,returnFocus=null;
  const filters=()=>({search:$('bulkSearch').value,set:$('bulkSet').value,rarity:$('bulkRarity').value,sort:$('bulkOrder').value,duplicates:$('bulkDuplicates').checked});
  const notice=message=>{$('bulkNotice').textContent=message;};
  function options(id,values){const el=$(id),current=el.value;el.innerHTML='<option value="">All '+(id==='bulkSet'?'sets':'rarities')+'</option>'+[...new Set(values)].sort().map(v=>`<option value="${e(v)}">${e(v)}</option>`).join('');el.value=values.includes(current)?current:'';}
  function render(){
    const next=bridge.snapshot();if(data&&data.account!==next.account){selected.clear();closeSale();}
    data=next;for(const id of selected)if(!data.cards.some(c=>c.id===id))selected.delete(id);
    const s=summary(data.cards);$('bulkCopies').textContent=s.copies.toLocaleString();$('bulkUnique').textContent=s.unique.toLocaleString();$('bulkSpares').textContent=s.spares.toLocaleString();$('bulkLibraryValue').textContent=money(s.value);
    options('bulkSet',data.cards.map(c=>c.set));options('bulkRarity',data.cards.map(c=>c.rarity));
    renderCards();
  }
  function renderCards(){
    const cards=filterCards(data.cards,filters()),shown=cards.slice(0,limit);
    $('bulkResultCount').textContent=`${cards.length} card type${cards.length===1?'':'s'}${cards.length>limit?` · showing ${shown.length}`:''}`;
    $('bulkCardGrid').innerHTML=shown.map(c=>`<article class="bulk-library-card${selected.has(c.id)?' selected':''}"><label class="bulk-select"><input type="checkbox" data-bulk-select="${e(c.id)}" aria-label="Select ${e(c.name)}" ${selected.has(c.id)?'checked':''}><span>×${c.qty}</span></label><button class="bulk-art" data-bulk-inspect="${e(c.id)}" aria-label="Inspect ${e(c.name)}"><img loading="lazy" decoding="async" src="${e(/^(https?:|data:image\/|\.?\.?\/)/.test(c.thumb||c.img||'')?(c.thumb||c.img):'./icons/icon-192.png')}" alt="${e(c.name)}"></button><small>${e(c.set)}</small><h3>${e(c.name)}</h3><p>${e(c.rarity)}</p><footer><strong>${money(c.unitCents*c.qty)}</strong><span>${money(c.unitCents)} each</span></footer></article>`).join('')||`<div class="bulk-library-empty"><span aria-hidden="true">◇</span><h3>${data.cards.length?'No cards match':'Room for your next discovery'}</h3><p>${data.cards.length?'Try another search or clear the filters.':'Commons, uncommons, regular Pokémon ex and extras arrive here as you open packs.'}</p><button type="button" data-bulk-action="${data.cards.length?'reset':'rip'}">${data.cards.length?'Show all cards':'Open packs'}</button></div>`;
    $('bulkMore').hidden=shown.length>=cards.length;
    $('bulkSelectedCount').textContent=`${selected.size} card type${selected.size===1?'':'s'} selected`;
    const preview=salePlan(data,selected,$('bulkKeepOne').checked);
    $('bulkSelectionValue').textContent=`${preview.copies} copies · ${money(preview.total)}`;
    $('bulkReview').disabled=!preview.copies||data.blocked;
    $('bulkSelectVisible').disabled=!shown.length;
    $('bulkSelectSpares').disabled=!cards.some(c=>c.qty>1);
    $('bulkClearSelection').disabled=!selected.size;
  }
  function closeSale(){const wasOpen=!$('bulkSaleDialog').hidden;$('bulkSaleDialog').hidden=true;plan=null;if(wasOpen&&returnFocus?.isConnected)returnFocus.focus();}
  function review(all=false){
    render();const ids=all?new Set(data.cards.map(c=>c.id)):selected;
    plan=salePlan(data,ids,$('bulkKeepOne').checked);
    if(!plan.copies){notice('No spare copies to sell. Turn off “Keep one of each” only if you want to sell your last copies.');return;}
    returnFocus=doc.activeElement;
    $('bulkSaleSummary').textContent=`${plan.copies} copies from ${plan.lines.length} card type${plan.lines.length===1?'':'s'} · ${money(plan.total)}`;
    $('bulkSalePolicy').textContent=plan.keepOne?'One copy of every selected card stays in your tub.':'You are selling every bulk copy of these selected cards. Master Set progress may decrease.';
    $('bulkSaleLines').innerHTML=plan.lines.map(c=>`<li><span>${e(c.name)} ×${c.qty}</span><strong>${money(c.qty*c.unitCents)}</strong></li>`).join('');
    $('bulkSaleError').textContent='';$('bulkConfirmSale').disabled=false;$('bulkSaleDialog').hidden=false;$('bulkCancelSale').focus();
  }
  function input(event){
    if(event.target.matches('#bulkSearch,#bulkSet,#bulkRarity,#bulkOrder,#bulkDuplicates')){limit=24;renderCards();}
    if(event.target.id==='bulkKeepOne')renderCards();
    if(event.target.matches('[data-bulk-select]')){const id=event.target.dataset.bulkSelect;event.target.checked?selected.add(id):selected.delete(id);const focusId=id;renderCards();root.querySelector(`[data-bulk-select="${win.CSS?.escape?win.CSS.escape(focusId):focusId.replace(/["\\]/g,'\\$&')}"]`)?.focus();}
  }
  function click(event){
    const inspect=event.target.closest('[data-bulk-inspect]');if(inspect){bridge.inspect(inspect.dataset.bulkInspect);return;}
    const btn=event.target.closest('[data-bulk-action]');if(!btn)return;
    const action=btn.dataset.bulkAction;
    if(action==='library'||action==='tub'){mode=action;$('bulkLibrary').hidden=mode!=='library';$('bulkPhysical').hidden=mode!=='tub';root.querySelectorAll('[data-bulk-action="library"],[data-bulk-action="tub"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bulkAction===mode)));return;}
    if(action==='reset'){for(const id of ['bulkSearch','bulkSet','bulkRarity'])$(id).value='';$('bulkDuplicates').checked=false;limit=24;renderCards();}
    if(action==='rip')doc.querySelector('.nav [data-s="rip"]')?.click();
    if(action==='visible'||action==='spares'){const cards=filterCards(data.cards,filters());for(const c of action==='visible'?cards.slice(0,limit):cards.filter(c=>c.qty>1))selected.add(c.id);renderCards();}
    if(action==='clear'){selected.clear();renderCards();}
    if(action==='more'){limit+=24;renderCards();}
    if(action==='review')review();
    if(action==='cancel-sale')closeSale();
    if(action==='confirm-sale'&&plan){
      const accepted=plan;plan=null; // A repeated click cannot execute the sale twice.
      try{const result=bridge.sell(accepted);closeSale();selected.clear();render();notice(`Sold ${result.copies} copies for ${money(result.total)}. ${accepted.keepOne?'One of each stays in your tub.':''}`);}
      catch(error){$('bulkSaleError').textContent=error.message;$('bulkConfirmSale').disabled=true;}
    }
  }
  const dialog=$('bulkSaleDialog');
  const keydown=event=>{if(dialog.hidden)return;if(event.key==='Escape'){event.preventDefault();closeSale();}if(event.key==='Tab'){const first=$('bulkCancelSale'),last=$('bulkConfirmSale');if(last.disabled){event.preventDefault();first.focus();}else if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}}};
  const update=()=>{if(root.classList.contains('active'))render();};
  root.addEventListener('input',input);root.addEventListener('change',input);root.addEventListener('click',click);root.addEventListener('keydown',keydown);
  $('sellBulkTubV64').onclick=()=>review(true);
  const observer=new win.MutationObserver(update);observer.observe(root,{attributes:true,attributeFilter:['class']});
  win.addEventListener('tcg:bulk-updated',update);render();
  return win.tcgBulkView={refresh:render,dispose(){observer.disconnect();root.removeEventListener('input',input);root.removeEventListener('change',input);root.removeEventListener('click',click);root.removeEventListener('keydown',keydown);win.removeEventListener('tcg:bulk-updated',update);delete win.tcgBulkView;}};
}
