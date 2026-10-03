(()=>{
  if (window.tcgBinderLegacyBridgeV252) return;
  const original = {
    renderBinder: typeof renderBinder === 'function' ? renderBinder : null,
    openBinderCard: typeof openBinderCard === 'function' ? openBinderCard : null
  };
  const safeCall = (fn, ...args) => {
    try { return typeof fn === 'function' ? fn(...args) : undefined; }
    catch (error) { console.warn('[TCG] Binder bridge call failed', error); return undefined; }
  };
  window.tcgBinderLegacyBridgeV252 = {
    version: 'V252',
    pageSize: typeof CARDS_PER_PAGE === 'number' ? CARDS_PER_PAGE : 9,
    getState: () => state,
    getBinderMap: () => state?.binder || {},
    getCard: id => state?.binder?.[id] || null,
    filteredCards: () => safeCall(binderCards) || [],
    getPage: () => Number(binderPageNo || 0),
    setPage: value => { binderPageNo = Math.max(0, Number(value || 0)); return binderPageNo; },
    setSelected: id => { selectedBinderCard = id || null; return selectedBinderCard; },
    getSelected: () => selectedBinderCard || null,
    applyTheme: () => safeCall(applyBinderTheme),
    renderShelf: () => safeCall(window.renderBinderShelfV147),
    effectClass: card => safeCall(effectClass, card) || '',
    tier: card => Number(safeCall(tier, card) || 0),
    hydrateCard: card => safeCall(hydrateCard, card),
    sellPrice: card => Number(safeCall(sellPrice, card) || 0),
    save: () => safeCall(save),
    syncGrade: () => safeCall(window.syncGradeLaunchV147),
    closeInspector: () => safeCall(closeBinderCard),
    playInspectFx(card) {
      try {
        const level = Number(tier(card) || 0);
        if (level >= 2) {
          safeCall(hitSound, Math.min(5, level));
          navigator.vibrate?.(level >= 4 ? [18,25,35] : [12,18,22]);
        } else if (effectClass(card)) safeCall(holoSound);
      } catch {}
    },
    bindRenderer(fn) {
      if (typeof fn !== 'function') return false;
      renderBinder = fn;
      window.renderBinder = fn;
      return true;
    },
    bindInspector(fn) {
      if (typeof fn !== 'function') return false;
      openBinderCard = fn;
      window.openBinderCard = fn;
      return true;
    },
    original
  };
})();
