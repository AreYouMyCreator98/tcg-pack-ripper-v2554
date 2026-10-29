import {cardRows,population,gradeEstimate,esc,money} from './model.js';
import {getArtworkUrl} from '../artwork/index.js';
export function installCardInspector(bridge,transactions,win=window,doc=document){
 const modal=doc.createElement('div');modal.id='universalCardInspector';modal.className='collector-modal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Card inspector');doc.body.append(modal);
 let selected=null,context={},token=0,focus=null,review=null,confirm=null,bodyStyle=null,scrollY=0,priceStatus='idle',quote=null,priceRequest=0;
 function close(){priceRequest++;token++;modal.hidden=true;if(bodyStyle!==null){doc.body.style.cssText=bodyStyle;bodyStyle=null;win.scrollTo?.(0,scrollY);}doc.documentElement.classList.remove('collector-modal-open');if(focus?.isConnected)focus.focus({preventScroll:true});}
 function render(){
  const state=bridge.state(),owned=cardRows(state).find(c=>c.id===selected.id),card={...selected,...owned},meta=state.collectorV260?.cards?.[card.id]||{},pin=state.collectorV260?.chases?.some(c=>c.id===card.id),pop=population(state,card.id,card.finish),source=context.source==='bulk'?'bulk':card.binder?'binder':'bulk',count=Number(card[source]||0);
  const estimate=gradeEstimate((state[source==='bulk'?'bulkV64':'binder']?.[card.id]||{}).conditionV161),blocked=bridge.blocked();
  const premium=/special illustration|illustration rare|hyper rare|secret rare|shiny|ultra rare|rainbow|gold rare|rare holo|radiant|vmax|vstar/i.test(String(card.rarity||''));
  const rawEntry=state[source==='bulk'?'bulkV64':'binder']?.[card.id];
  const unsafeRaw=premium&&Number(rawEntry?.market||0)<=.1;
  const unsafeSlab=premium&&context.slab&&Number(context.slab.raw||0)<=.1;
  const action=(name,label,disabled=false)=>`<button class="collector-button" type="button" data-inspector-action="${name}" ${disabled?'disabled':''}>${label}</button>`;
  const buttons=[action('favourite',meta.favourite?'UNFAVOURITE':'FAVOURITE')];if(!context.special)buttons.push(action('chase',pin?'UNPIN CHASE':'PIN CHASE'));
  if((card.binder||0)+(card.bulk||0)+(card.graded||0)>0)buttons.push(action('lock',meta.locked?'UNLOCK':'LOCK'));
  if(count){if(!meta.locked){buttons.push(action('move',source==='bulk'?'MOVE TO BINDER':'MOVE TO BULK',blocked||(source==='bulk'&&bridge.canBinder&&!bridge.canBinder(card))),action('sell','SELL ONE',blocked||unsafeRaw));buttons.push(action('grade','GRADE',blocked||unsafeRaw));if(source==='binder')buttons.push(action('list','LIST FOR SALE',blocked));}}
  if(context.slab&&!meta.locked)buttons.push(action('sellSlab','SELL THIS SLAB',blocked||unsafeSlab));
  if(!context.special)buttons.push(action('retryPrice',priceStatus==='loading'?'CHECKING MARKET…':'CHECK MARKET PRICE',priceStatus==='loading'));
  const details=[['Binder',card.binder||0],['Bulk',card.bulk||0],['Graded',card.graded||0],['At grading',card.grading||0],['Listed / trade escrow',Number(card.listed||0)+Number(card.trade||0)]];
  modal.innerHTML=`<button class="collector-modal-shade" data-inspector-action="close" aria-label="Close inspector"></button><article class="collector-modal-card"><header><div><small>UNIVERSAL CARD INSPECTOR</small><h2>${esc(card.name)}</h2></div><button class="collector-button" data-inspector-action="close" aria-label="Close card inspector">×</button></header><div class="collector-inspector-layout"><div class="collector-light-card" tabindex="0" aria-label="Tilt card under light with drag or arrow keys"><img alt="${esc(card.name)}" decoding="async"><i class="collector-inspection-light"></i>${estimate?.flaws.includes('edges')?'<i class="collector-flaw-edge" aria-hidden="true"></i>':''}${estimate?.flaws.includes('surface')?'<i class="collector-flaw-surface" aria-hidden="true"></i>':''}</div><div><p>${esc(card.set||card.setId||'')} · #${esc(card.number||'—')}<br>${esc(card.rarity||'Card')} · ${esc(card.finish||'Standard variant')}</p>${context.special?`<div class="collector-panel"><b>${context.special.owned?'OWNED · PERMANENT REWARD':'LOCKED REWARD'}</b><p>${esc(context.special.lore)}</p><strong>${esc(context.special.unlock)}</strong><p>${esc(context.special.progress)} · ${esc(context.special.group)}</p><p>Special rewards cannot be sold or traded and do not replace normal Master Set cards.</p></div>`:`<div class="collector-stat"><small>RAW CARD · USD</small><b>${quote?money(quote.amount):priceStatus==='loading'?'Loading price…':'Live price unavailable'}</b><p>${quote?esc(quote.source)+' · '+esc(quote.updated||'Update time unavailable'):'A missing quote is not a ten-cent valuation.'}</p>${quote?`<small>IN-GAME SELL VALUE · RAW</small><b>${money(bridge.price({...card,market:quote.amount}))}</b>`:''}${context.slab?`<small>IN-GAME SLAB ESTIMATE · GRADE ${context.slab.grade}</small><b>${money(bridge.slabValue(context.slab))}</b><p>Game estimate, not a verified graded-card market quote.</p>`:''}</div>`}<p>${context.slab?'Slab grade '+context.slab.grade+' · '+esc(context.slab.cert||'')+'<br>':''}${context.special?'':`${card.qty||0} copies owned · ${owned?'Counts toward your Master Set':'Missing from your collection'}`} </p><dl>${details.map(([label,n])=>`<div><dt>${label}</dt><dd>${n}</dd></div>`).join('')}</dl><p>${meta.locked?'🔒 Locked · ':''}${meta.favourite?'★ Favourite · ':''}${pin?'Pinned chase':''}</p><details><summary>Inspect under light</summary><p>Drag or use arrow keys to move the light. ${estimate?`Likely grade ${estimate.low}–${estimate.high}. Visible wear: ${esc(estimate.flaws.join(', ')||'no obvious flaws')}.`:'Condition becomes available for owned raw cards.'} An estimate is not a guaranteed grade.</p></details><details><summary>Local collection population · ${pop.total}</summary><p>10: ${pop.ten} · 9: ${pop.nine} · 8: ${pop.eight} · Below 8: ${pop.lower}<br>Highest owned grade: ${pop.highest||'—'}</p>${(card.slabs||[]).slice(-10).map(s=>`<p>${esc(s.cert||'Slab')} · ${s.grade}</p>`).join('')}</details><details><summary>Acquisition history</summary>${(card.historyV161||[]).slice(-8).map(h=>`<p>${esc(h.label)} · ${new Date(h.time).toLocaleDateString()}</p>`).join('')||'<p>No earlier acquisition record was saved.</p>'}</details></div></div><div class="collector-actions">${buttons.join('')}</div><div role="status" id="inspectorNotice"></div>${confirm?`<div class="collector-panel" role="alertdialog" aria-label="Review card action"><p>${confirm==='sellSlab'?`Sell this grade ${context.slab.grade} slab for ${money(bridge.slabValue(context.slab))}?`:confirm==='sell'?`Sell one ${esc(card.name)} for ${money(bridge.price(card))}?`:confirm==='grade'?`Submit one card with ${esc(review?.tier||bridge.gradingTier())} service: $${({standard:12,priority:25,express:45})[review?.tier||bridge.gradingTier()]} · ${({standard:5,priority:3,express:1})[review?.tier||bridge.gradingTier()]} packs. Price changes speed only.`:'Move one copy to '+(source==='bulk'?'Binder':'Bulk')+'?'}</p>${action('confirm','CONFIRM')}${action('dismiss','CANCEL')}</div>`:''}</article>`;
  if(!context.special){
   const raw=state.binder?.[card.id]||state.bulkV64?.[card.id],rawValue=bridge.price({...card,market:raw?.market||context.slab?.raw||card.market||card.raw});
   const slabs=(state.gradingV44?.graded||[]).filter(s=>s.id===card.id),slabPicker=slabs.length>1?`<label for="inspectorSlabPicker">YOUR GRADED COPIES</label><select id="inspectorSlabPicker" aria-label="Select graded copy">${slabs.map(s=>`<option value="${esc(s.uid)}" ${s.uid===context.slab?.uid?'selected':''}>Grade ${esc(s.grade)} · ${esc(s.cert||s.uid)}</option>`).join('')}</select>`:'';
   modal.querySelector('.collector-inspector-layout .collector-stat').innerHTML=`<small>MARKET QUOTE · RAW USD</small><b>${quote?money(quote.amount):priceStatus==='loading'?'Checking market…':'Market quote unavailable'}</b><p>${quote?`${quote.cached?'Last verified quote':'Provider quote'}: ${esc(quote.source)} · ${esc(quote.updated||'Update time unavailable')}`:'External pricing is temporarily missing for this card or printing.'}</p><small>${count?'IN-GAME RAW SELL VALUE':'IN-GAME RAW REFERENCE VALUE'}</small><b>${money(rawValue)}</b><p>Game valuation is usable even when the external price feed is offline. Check your amount before confirming.</p>${(unsafeRaw||unsafeSlab)?'<p>⚠ Premium card has only the $0.10 placeholder. Selling and grading pause until the price backup or a labelled game estimate restores a value.</p>':rawValue<=.1&&!quote?'<p>Only the $0.10 game default is saved for this card.</p>':''}${context.slab?`<small>IN-GAME SLAB SELL VALUE · GRADE ${esc(context.slab.grade)}</small><b>${money(bridge.slabValue(context.slab))}</b><p>Grade multiplier estimate, not a verified graded-card market quote.</p>${slabPicker}`:''}`;
   if(raw?.gameEstimateSourceV26410||context.slab?.gameEstimateSourceV26410)modal.querySelector('.collector-inspector-layout .collector-stat').insertAdjacentHTML('beforeend','<p>Rarity-based game estimate. No verified market quote was available for this printing.</p>');
  }
  const image=modal.querySelector('img'),request=++token;image.removeAttribute('src');
  getArtworkUrl(card,'high',{priority:150}).then(url=>{if(request===token&&!modal.hidden)image.src=url;}).catch(()=>{if(request===token){image.alt=card.name+' · artwork unavailable';image.dispatchEvent(new Event('error'));}});
  const light=modal.querySelector('.collector-light-card');let held=false,x=50,y=50;
  const tilt=(nx,ny)=>{x=Math.max(0,Math.min(100,nx));y=Math.max(0,Math.min(100,ny));light.style.setProperty('--light-x',x+'%');light.style.setProperty('--light-y',y+'%');if(!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches)light.style.transform=`perspective(800px) rotateY(${(x-50)/10}deg) rotateX(${(50-y)/10}deg)`;};
  light.addEventListener('pointerdown',event=>{held=true;light.setPointerCapture?.(event.pointerId);});light.addEventListener('pointermove',event=>{if(!held)return;const r=light.getBoundingClientRect();tilt((event.clientX-r.left)/r.width*100,(event.clientY-r.top)/r.height*100);});for(const event of ['pointerup','pointercancel','lostpointercapture'])light.addEventListener(event,()=>{held=false;tilt(50,50);});light.addEventListener('keydown',event=>{if(event.key.startsWith('Arrow')){event.preventDefault();tilt(x+(event.key==='ArrowRight'?10:event.key==='ArrowLeft'?-10:0),y+(event.key==='ArrowDown'?10:event.key==='ArrowUp'?-10:0));}});
  context={...context,source,count};
 }
 function refreshPrice(showLoading=true){
  const pricing=++priceRequest,card={...selected};priceStatus='loading';if(showLoading)render();
  Promise.resolve().then(()=>bridge.refreshMarket?.(card,{useBackupImmediately:!showLoading})).then(value=>{
   if(pricing!==priceRequest||modal.hidden||context.account!==bridge.account())return;
   quote=value||bridge.savedMarketQuote?.(card)||quote;
   priceStatus=value&&!value.cached?'ready':'unavailable';
   if(context.slab){const latest=bridge.state().gradingV44?.graded?.find(s=>s.uid===context.slab.uid);if(latest)context.slab={...latest};}
   if(value&&!value.cached){selected.market=value.amount;if(context.slab)context.slab={...context.slab,raw:value.amount};}
   confirm=null;review=transactions.review();render();
  }).catch(()=>{if(pricing===priceRequest&&!modal.hidden){priceStatus='unavailable';render();}});
 }
 function open(card,options={}){if(!card?.id)return false;if(bodyStyle===null){bodyStyle=doc.body.style.cssText;scrollY=win.scrollY||0;doc.body.style.position='fixed';doc.body.style.top=`-${scrollY}px`;doc.body.style.width='100%';}selected={...card};quote=bridge.savedMarketQuote?.(card)||null;priceStatus=options.special?'idle':'loading';priceRequest++;context={...options,account:bridge.account()};focus=doc.activeElement;confirm=null;review=transactions.review();const actual=bridge.state()[options.source==='bulk'?'bulkV64':'binder']?.[card.id];if(actual&&!actual.conditionV161){bridge.condition(actual);bridge.save();}modal.hidden=false;doc.documentElement.classList.add('collector-modal-open');render();modal.querySelector('article [data-inspector-action="close"]').focus();
 if(!options.special)refreshPrice(false);return true;}
 modal.addEventListener('click',async event=>{
  const button=event.target.closest('[data-inspector-action]');if(!button)return;const a=button.dataset.inspectorAction;
  try{
   if(a==='close')return close();if(context.account!==bridge.account()){close();bridge.toast('The account changed. Reopen this card.');return;}if(a==='dismiss'){confirm=null;return render();}
   if(a==='retryPrice'){if(priceStatus!=='loading')refreshPrice();return;}
   const state=bridge.state(),meta=state.collectorV260.cards[selected.id]||{},source=context.source,c=state[source==='bulk'?'bulkV64':'binder']?.[selected.id];
   if(a==='sellSlab'){confirm=a;review={...transactions.review(),uid:context.slab.uid,unitCents:Math.round(bridge.slabValue(context.slab)*100)};return render();}
   if(a==='sell'||a==='move'||a==='grade'){confirm=a;review={...transactions.review(),cardId:selected.id,source,qty:1,owned:Number(c?.qty||0),unitCents:Math.round(bridge.price(c)*100),tier:bridge.gradingTier()};return render();}
   if(a==='confirm'){
    if(confirm==='grade'){if(bridge.blocked()||meta.locked||bridge.account()!==review.account||Number(c?.qty)!==review.owned)throw Error('Your collection changed. Review grading again.');transactions.transact('grade',review);bridge.refresh();close();win.tcgNavigation.go('collection','grading');return;}
    transactions.transact(confirm,review);if(confirm==='sellSlab'){bridge.refresh();close();return;}confirm=null;review=transactions.review();bridge.refresh();return render();
   }
   if(a==='list'){if(bridge.blocked()||meta.locked)throw Error('This card is currently unavailable.');close();bridge.list(selected.id);return;}
   transactions.transact(a==='chase'?'chase':'flag',{...transactions.review(),cardId:selected.id,card:selected,flag:a==='lock'?'locked':'favourite',value:a==='lock'?!meta.locked:!meta.favourite});render();
  }catch(error){modal.querySelector('#inspectorNotice').textContent=error.message;}
 });
 modal.addEventListener('change',event=>{
  if(event.target.id!=='inspectorSlabPicker')return;
  const slab=(bridge.state().gradingV44?.graded||[]).find(s=>s.id===selected.id&&s.uid===event.target.value);
  if(!slab)return;
  context.slab=slab;confirm=null;review=transactions.review();render();
 });
 win.addEventListener('tcg:market-quote-updated',event=>{
  const data=event.detail||{};
  if(modal.hidden||!selected||data.id!==selected.id||(data.finish&&selected.finish&&data.finish!==selected.finish)||context.account!==bridge.account())return;
  quote=data.quote;priceStatus='ready';selected.market=quote.amount;
  if(context.slab){const latest=bridge.state().gradingV44?.graded?.find(s=>s.uid===context.slab.uid);if(latest)context.slab={...latest};}
  confirm=null;review=transactions.review();render();
 });
 modal.addEventListener('keydown',event=>{if(event.key==='Escape')close();if(event.key==='Tab'){const items=[...modal.querySelectorAll('article button:not(:disabled),summary,[tabindex="0"]')].filter(n=>n.getClientRects().length),first=items[0],last=items.at(-1);if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}}});
 bridge.bindInspector(open);return win.tcgCardInspector={open,close};
}
