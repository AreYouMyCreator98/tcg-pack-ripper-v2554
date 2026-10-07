import {summarizePackCards} from './pack-results.js';
import {revealProfile} from '../animations/packs/reveal-profile.js';
import {cardImageMarkup} from '../artwork/card-image.js';
import {esc,money} from '../collector/model.js';

export function renderCompactRecap(detail,{freshIds=new Set(),previous,current,inspector,bridge,restored=false}={}){
 const cards=detail.cards||[];if(!cards.length)return;
 const root=document.getElementById('rip'),stage=document.getElementById('stage');
 let wrap=document.getElementById('v88Summary');if(!wrap){wrap=document.createElement('section');wrap.id='v88Summary';stage.append(wrap);}
 root.append(wrap);
 const result=summarizePackCards(cards,bridge.route),ten=detail.mode===10;
 const saved=window.tcgCollectorBridge.state().lastPackResultV2601;
 if(restored&&saved?.recap){freshIds=new Set(saved.recap.fresh);previous=saved.recap.previous;current=saved.recap.current;}
 const percent=t=>t?.total?((t.count??t.owned?.size??0)/t.total*100).toFixed(1)+'%':'—';
 if(ten&&saved&&!restored)saved.recap={fresh:[...freshIds],previous,current:current?{count:current.owned.size,total:current.total}:null};
 const stats=[[result.estimatedCards?'EST. PACK VALUE':'PACK VALUE',money(result.value)],['HITS',result.hits],['NEW',freshIds.size],['DUPES',cards.length-freshIds.size],['MASTER SET',percent(previous)+' → '+percent(current)],['GRADE CANDIDATES',cards.filter(c=>Number(c.market)>=5).length]];
 const best=[...cards].sort((a,b)=>Number(b.market||0)-Number(a.market||0))[0];
 const seen=new Set(),items=cards.map((card,index)=>{const fresh=freshIds.has(card.id)&&!seen.has(card.id);seen.add(card.id);return{card,index,fresh,hit:revealProfile(card).hit};});
 let filter=ten&&result.hits?'hits':'all';
 const tile=(item,quality='thumb')=>`<button type="button" class="pack-result-tile" data-recap-card="${item.index}" aria-label="Inspect ${esc(item.card.name)}">${cardImageMarkup(item.card,{quality})}<small>${item.fresh?'NEW · ':''}${esc(item.card.rarity||'Card')}</small></button>`;
 wrap.className='compact-recap collector-smart-recap'+(ten?' ten-results':' single-results');
 wrap.innerHTML=`<header><h2>${ten?'10 PACKS OPENED':'PACK COMPLETE'}</h2><small>${cards.length} CARDS · ${esc(detail.set?.name||'')}</small></header>${ten?'':'<div class="pack-result-grid single-grid">'+items.map(x=>tile(x,'medium')).join('')+'</div>'}<div class="pack-result-best"><small>BEST PULL</small><strong>${esc(best.name)}</strong><b>${money(best.market||.1)}</b></div><div class="pack-result-stats">${stats.map(([label,value])=>`<div><small>${label}</small><b>${value}</b></div>`).join('')}</div><div class="pack-result-actions"><button type="button" data-result-details>DETAILS</button><button type="button" data-result-session>SESSION</button></div><button type="button" id="v117OpenAnother">${ten?'OPEN ANOTHER 10 PACKS':'OPEN ANOTHER PACK'}</button>${ten?`<section class="pack-top-pulls"><small>TOP PULLS</small><div>${items.filter(x=>x.hit).sort((a,b)=>Number(b.card.market)-Number(a.card.market)).slice(0,5).map(x=>tile(x,x.card===best?'high':'medium')).join('')||tile(items.find(x=>x.card===best),'high')}</div></section><div class="pack-result-filters">${['all','hits','new','duplicates'].map(f=>`<button type="button" data-result-filter="${f}">${f.toUpperCase()}</button>`).join('')}</div><button type="button" data-show-all>SHOW ALL ${cards.length} CARDS</button><div class="pack-result-grid batch-grid"></div>`:''}`;
 const paint=()=>{const grid=wrap.querySelector('.batch-grid');if(!grid)return;grid.innerHTML=items.filter(x=>filter==='all'||filter==='hits'&&x.hit||filter==='new'&&x.fresh||filter==='duplicates'&&!x.fresh).map(x=>tile(x)).join('')||'<p>No cards in this filter.</p>';wrap.querySelectorAll('[data-result-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.resultFilter===filter)));};
 paint();
 // One delegated handler, replaced with the result subtree. No per-card listeners.
 wrap.onclick=event=>{const b=event.target.closest('button');if(!b)return;
  if(b.dataset.recapCard!==undefined)return inspector.open(cards[Number(b.dataset.recapCard)],{source:'recap'});
  if(b.id==='v117OpenAnother'){document.getElementById('packResultDetails')?.remove();bridge.reset();return;}
  if(b.dataset.resultFilter){filter=b.dataset.resultFilter;paint();}
  if(b.hasAttribute('data-show-all')){filter='all';paint();wrap.querySelector('.batch-grid').scrollIntoView({block:'start',behavior:'instant'});}
  if(b.hasAttribute('data-result-details')||b.hasAttribute('data-result-session')){
   document.getElementById('packResultDetails')?.remove();const sheet=document.createElement('div');sheet.id='packResultDetails';sheet.className='collector-modal';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label',b.hasAttribute('data-result-session')?'Session statistics':'Pack details');
   const snap=window.TCG_PACKS.session(),s=snap.session,p=snap.persistent;
   const content=b.hasAttribute('data-result-session')?`<h2>This session</h2><p>${s.packs} packs · ${s.hits} hit packs</p><p>Value ${money(s.valueGenerated)} · Spent ${money(s.cashSpent)}</p><p>${p.packsSinceSirPlus} since SIR+ · ${p.packsSinceGod} since God Pack</p><button type="button" data-reset-session>RESET SESSION</button>`:`<h2>Pack details</h2><p>${result.binder} Binder · ${result.bulk} Bulk · ${result.estimatedCards} minimum price estimates</p>${items.map(x=>`<p>${esc(x.card.name)} · ${x.fresh?'NEW':'DUPLICATE'} · ${money(x.card.market||.1)}</p>`).join('')}`;
   sheet.innerHTML='<button class="collector-modal-shade" aria-label="Close details" data-close-details></button><article class="collector-modal-card"><button type="button" data-close-details>CLOSE</button>'+content+'</article>';sheet.onclick=e=>{if(e.target.closest('[data-close-details]')){sheet.remove();b.focus();}if(e.target.closest('[data-reset-session]')){window.TCG_PACKS.resetSession();sheet.remove();b.focus();}};sheet.onkeydown=e=>{if(e.key==='Escape'){sheet.remove();b.focus();}};document.body.append(sheet);sheet.querySelector('article button').focus();
  }
 };
 root.dataset.ripState='COMPLETE';window.dispatchEvent(new CustomEvent('tcg:rip-state',{detail:'COMPLETE'}));wrap.scrollTop=0;
}
