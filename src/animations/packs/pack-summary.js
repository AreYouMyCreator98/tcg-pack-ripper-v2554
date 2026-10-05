import { summarizePackCards } from '../../packs/pack-results.js';
import { paymentLabel } from '../../packs/pack-costs.js';

function money(n) { return `$${Number(n || 0).toFixed(2)}`; }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

export function renderV253Summary(detail, { bridge, session, onResetSession } = {}) {
  const wrap = document.getElementById('v88Summary');
  if (!wrap || !detail?.cards?.length) return;
  wrap.querySelector('.v253Recap')?.remove();
  wrap.classList.add('v253SummaryActive');
  const result = summarizePackCards(detail.cards, card => bridge.route(card));
  const snap = session.snapshot();
  const s = snap.session, p = snap.persistent;
  const best = result.best || detail.best || {};
  const recentPayment = window.__tcgV253LastPayment || {};
  const xpStat = [...wrap.querySelectorAll('.v88Stats b')].find(node => /\bXP\b/i.test(node.textContent || ''));
  const xpMatch = String(xpStat?.textContent || '').match(/XP\s*\+?\s*(\d+)/i);
  const xpText = xpMatch ? `+${xpMatch[1]}` : '—';
  const rarity = result.rarity.slice(0, 5).map(x => `<span><b>${x.count}×</b>${esc(x.rarity)}</span>`).join('');

  const panel = document.createElement('section');
  panel.className = 'v253Recap';
  panel.innerHTML = `
    <div class="v253RecapBest">
      <div class="v253BestArt">${best.thumb || best.img ? `<img src="${esc(best.thumb || best.img)}" alt="">` : '<span>✦</span>'}</div>
      <div><small>BEST PULL</small><b>${esc(best.name || 'Pack complete')}</b><span>${esc(best.rarity || '')}${best.market ? ` · ${money(best.market)}` : ''}</span></div>
    </div>
    <div class="v253RecapGrid">
      <div><small>${result.estimatedCards ? 'ESTIMATED PACK VALUE' : 'PACK VALUE'}</small><b>${money(result.value)}</b></div>
      <div><small>HITS</small><b>${result.hits}</b></div>
      <div><small>BINDER / BULK</small><b>${result.binder} / ${result.bulk}</b></div>
      <div><small>PAID</small><b>${esc(paymentLabel(recentPayment))}</b></div>
    </div>
    <div class="v253RecapMini"><span>⚡ XP <b>${esc(xpText)}</b></span><span>✦ ${result.cards} CARDS</span></div>
    <div class="v253RarityBreakdown">${rarity}</div>
    ${result.estimatedCards ? `<p class="v253PriceNote">${result.estimatedCards} cards use the $0.10 minimum estimate. Open a card to refresh its price.</p>` : ''}
    <div class="v253SessionRecap">
      <div><small>THIS SESSION</small><b>${s.packs} PACKS · ${s.hits} HIT PACKS · ${s.uniqueAdded} NEW</b></div>
      <div><small>VALUE / CASH</small><b>${money(s.valueGenerated)} / ${money(s.cashSpent)}</b></div>
      <div><small>STREAKS</small><b>${p.packsSinceSirPlus} SINCE SIR+ · ${p.packsSinceGod} SINCE GOD</b></div>
    </div>
    <button type="button" class="v253ResetSession">RESET SESSION STATS</button>`;
  const openAnother = wrap.querySelector('#v117OpenAnother');
  // Portal the existing summary to the viewport: transformed pack ancestors
  // otherwise clip fixed elements on mobile. Keep the original reset handler.
  if (wrap.parentElement !== document.body) {
    document.body.appendChild(wrap);
    document.body.classList.add('collector-recap-open');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Pack results');
    wrap.addEventListener('keydown', event => {
      if(event.key==='Escape'){event.preventDefault();openAnother?.click();}
      if(event.key==='Tab'){
        const controls=[...wrap.querySelectorAll('button:not(:disabled)')];
        const first=controls[0],last=controls.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    });
    const cleanup = new MutationObserver(() => {
      if(wrap.isConnected)return;
      document.body.classList.remove('collector-recap-open');cleanup.disconnect();
      document.getElementById('studioOpenPack')?.focus({preventScroll:true});
    });
    cleanup.observe(document.body,{childList:true});
  }
  wrap.insertBefore(panel, openAnother || null);
  panel.querySelector('.v253ResetSession')?.addEventListener('click', () => onResetSession?.());
  requestAnimationFrame(() => { if(wrap.isConnected)openAnother?.focus({preventScroll:true}); });
}
