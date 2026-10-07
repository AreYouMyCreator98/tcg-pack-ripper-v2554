/* Bulk mutations share the existing collection, save and cloud barriers. */
(()=>{
  if(window.tcgBulkBridge)return;
  const account=()=>window.tcgCloudV192?.user?.id||'local';
  const blocked=()=>!!(window.tcgCloudV192?.hubHeld||window.tcgCloudV192?.recoveryPending||document.getElementById('bulk')?.inert);
  const unit=c=>Math.round(sellPrice(c)*100);
  const announce=()=>window.dispatchEvent(new CustomEvent('tcg:bulk-updated'));
  window.tcgBulkBridge={
    snapshot(){return {account:account(),cash:Number(state.coins||0),blocked:blocked(),cards:Object.entries(state.bulkV64||{}).filter(([,c])=>c&&Number.isSafeInteger(Number(c.qty))&&Number(c.qty)>0).map(([id,c])=>({...c,id,qty:Number(c.qty),set:c.set||'Unknown set',rarity:c.rarity||'Unclassified',unitCents:Number.isFinite(unit(c))?unit(c):0}))};},
    inspect(id){if(!blocked())openBulkCardV64(id);},
    sell(plan){
      if(window.tcgCollector?.transactions){const tx=window.tcgCollector.transactions;return tx.transact('bulkSale',{...tx.review(),...plan});}
      if(blocked())throw new Error('Your collection is syncing. Try again when it finishes.');
      if(!plan||plan.account!==account())throw new Error('The account changed. Review the sale again.');
      if(!Array.isArray(plan.lines)||!plan.lines.length)throw new Error('No cards are selected for sale.');
      let total=0;const seen=new Set();
      // Check every line before changing anything: a cloud pull or another action
      // must never turn a reviewed sale into a sale of different cards.
      for(const line of plan.lines){
        const c=state.bulkV64?.[line.id];
        if(seen.has(line.id)||!c||!Number.isSafeInteger(line.qty)||line.qty<1||line.qty>Number(c.qty)||Number(c.qty)!==line.owned||unit(c)!==line.unitCents||!Number.isSafeInteger(line.unitCents)||line.unitCents<1||(plan.keepOne&&line.qty>=Number(c.qty)))throw new Error('Your bulk cards changed. Review the sale again.');
        seen.add(line.id);total+=line.qty*line.unitCents;
      }
      if(!Number.isSafeInteger(total)||total!==plan.total)throw new Error('The sale total changed. Review it again.');
      for(const line of plan.lines){const c=state.bulkV64[line.id];c.qty=Number(c.qty)-line.qty;if(!c.qty)delete state.bulkV64[line.id];}
      money(total/100);
      for(const fn of [renderBulkV64,renderSets,typeof renderMasterV57==='function'?renderMasterV57:null])try{fn?.();}catch(error){console.warn('[TCG] Bulk display refresh',error);}
      return {copies:plan.lines.reduce((n,c)=>n+c.qty,0),total};
    }
  };
  const original=renderBulkV64;
  renderBulkV64=function(){const result=original.apply(this,arguments);announce();return result;};
  // A keyboard user can inspect the same loose cards as a touch-and-hold user.
  document.getElementById('bulkTubV64')?.addEventListener('keydown',e=>{const card=e.target.closest('[data-bulk-id]');if(card&&['Enter',' '].includes(e.key)){e.preventDefault();window.tcgBulkBridge.inspect(card.dataset.bulkId);}});
  const modal=document.getElementById('bulkInspectV64');let inspectorFocus=null;
  if(modal){
    new MutationObserver(()=>{if(modal.classList.contains('show')){inspectorFocus=document.activeElement;document.getElementById('bulkCloseV64')?.focus();}else if(inspectorFocus?.isConnected)inspectorFocus.focus();}).observe(modal,{attributes:true,attributeFilter:['class']});
    modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeBulkCardV64();}if(e.key==='Tab'){const first=document.getElementById('bulkCloseV64'),last=document.getElementById('bulkMoveBinderV64');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  }
})();
