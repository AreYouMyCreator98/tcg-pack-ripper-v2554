export const DESTINATIONS = Object.freeze(['rip','collection','hub','profile']);
export const COLLECTION_TABS = Object.freeze(['cards','master','grading','slabs','bulk','sealed']);
const legacy = {rip:'rip',collection:'binder',hub:'earn',profile:'profile'};
const aliases = {binder:'collection',bulk:'collection',earn:'hub',history:'profile'};

export function installCollectorNavigation(win=window,doc=document) {
  if(win.tcgNavigation)return win.tcgNavigation;
  let destination='rip',section='cards';
  const rail=doc.getElementById('collectionTabs');
  function go(target,tab) {
    if(target==='settings'){doc.getElementById('openProfileSettingsV158')?.click();return;}
    if(target==='bulk')tab='bulk';
    target=aliases[target]||target;
    if(!DESTINATIONS.includes(target))return false;
    destination=target;if(tab&&COLLECTION_TABS.includes(tab))section=tab;
    const screen=target==='collection'&&section==='bulk'?'bulk':legacy[target];
    doc.querySelectorAll('.screen').forEach(node=>node.classList.toggle('active',node.id===screen));
    doc.querySelectorAll('.nav [data-s]').forEach(button=>{
      const on=button.dataset.s===legacy[target];button.classList.toggle('active',on);button.setAttribute('aria-current',on?'page':'false');
    });
    rail.hidden=target!=='collection';
    rail.querySelectorAll('[data-collection-tab]').forEach(button=>{const on=button.dataset.collectionTab===section;button.classList.toggle('active',on);button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;});
    doc.documentElement.dataset.destination=target;
    doc.documentElement.classList.toggle('studio-profile-active',target==='profile');
    doc.getElementById('binder')?.querySelectorAll('[data-binder-panel]').forEach(node=>node.classList.toggle('active',node.dataset.binderPanel===({cards:'binder',slabs:'vault'}[section]||section)));
    if(target==='collection'){
      if(section==='cards')win.renderBinder?.();
      if(section==='bulk')win.renderBulkV64?.();
      if(section==='grading')win.renderGradingV44?.();
      if(section==='slabs')win.renderSlabVaultV52?.();
    }
    if(target==='hub')win.tcgTradeHub?.controller.refresh();
    if(target==='profile')win.renderProfile?.();
    win.dispatchEvent(new win.CustomEvent('tcg:navigation',{detail:{destination:target,section}}));
    win.scrollTo?.({top:0,behavior:'instant'});
    return true;
  }
  const click=event=>{
    const nav=event.target.closest?.('.nav [data-s]');if(nav)go(nav.dataset.s);
    const tab=event.target.closest?.('[data-collection-tab]');if(tab)go('collection',tab.dataset.collectionTab);
    if(event.target.closest?.('#collectorSettings'))go('settings');
  };
  doc.addEventListener('click',click);
  rail.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const tabs=[...rail.querySelectorAll('[data-collection-tab]')],i=tabs.indexOf(event.target);if(i<0)return;
    event.preventDefault();const at=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[at].click();tabs[at].focus();
  });
  win.tcgNavigation={go,snapshot:()=>({destination,section})};go('rip');return win.tcgNavigation;
}
