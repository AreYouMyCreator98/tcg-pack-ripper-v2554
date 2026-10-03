import { artworkRepairReport, artworkStatus, repairFailedArtwork, clearFailureForCard } from '../../artwork/index.js';
import { binderBridgeNow } from './binder-bridge.js';

let installed = false;

function ensureStatusElement() {
  let host = document.getElementById('binderArtworkStatusV252');
  if (host) return host;
  const anchor = document.querySelector('#binder .binderShelfHeaderV147');
  if (!anchor) return null;
  host = document.createElement('div');
  host.id = 'binderArtworkStatusV252';
  host.className = 'binderArtworkStatusV252';
  host.innerHTML = '<span><b>Artwork cache ready</b><small id="binderArtworkMetaV252">Local-first card fronts</small></span><button type="button" id="binderArtworkRepairV252" hidden>REPAIR</button><button type="button" id="binderArtworkDeleteV254" hidden>REMOVE BROKEN</button><button type="button" id="binderArtworkReportV252" hidden>REPORT</button>';
  anchor.insertAdjacentElement('afterend', host);
  const danger = host.querySelector('#binderArtworkDeleteV254');
  if (danger) {
    danger.style.background = '#35214f';
    danger.style.whiteSpace = 'nowrap';
  }
  return host;
}

function lowFailureIds() {
  return [...new Set(
    artworkRepairReport().failures
      .filter(item => item?.size === 'low' && item?.card?.id)
      .map(item => String(item.card.id))
  )];
}

function binderKeyForId(map, id) {
  if (map?.[id]) return id;
  return Object.keys(map || {}).find(key => String(map[key]?.id || '') === String(id || '')) || '';
}

function renderStatus(extra = '') {
  const host = ensureStatusElement();
  if (!host) return;
  const status = artworkStatus();
  const brokenIds = lowFailureIds();
  const meta = host.querySelector('#binderArtworkMetaV252');
  const repair = host.querySelector('#binderArtworkRepairV252');
  const remove = host.querySelector('#binderArtworkDeleteV254');
  const report = host.querySelector('#binderArtworkReportV252');
  const busy = status.running + status.queued + status.inflight;
  if (meta) meta.textContent = extra || (brokenIds.length
    ? `${brokenIds.length} Binder card${brokenIds.length === 1 ? '' : 's'} have broken artwork`
    : busy ? `Caching artwork • ${busy} queued/active` : 'All visible artwork uses the local-first cache');
  if (repair) repair.hidden = brokenIds.length === 0;
  if (remove) remove.hidden = brokenIds.length === 0;
  if (report) report.hidden = status.failed === 0;
}

function removeKnownBrokenCards() {
  const bridge = binderBridgeNow();
  if (!bridge) return 0;
  const map = bridge.getBinderMap();
  const ids = lowFailureIds();
  const entries = ids.map(id => {
    const key = binderKeyForId(map, id);
    return key ? { key, card: map[key] } : null;
  }).filter(Boolean);
  if (!entries.length) return 0;
  const totalCopies = entries.reduce((sum, item) => sum + Math.max(1, Number(item.card?.qty || 1)), 0);
  const ok = window.confirm(
    `Permanently remove ${entries.length} broken-artwork card${entries.length === 1 ? '' : 's'} (${totalCopies} total cop${totalCopies === 1 ? 'y' : 'ies'}) from this Binder?\n\n` +
    `This lowers collection/Master Set progress and cannot be undone. They must be pulled, bought or traded again to return.`
  );
  if (!ok) return 0;
  for (const { key, card } of entries) {
    delete map[key];
    clearFailureForCard(card);
  }
  try { bridge.save?.(); } catch {}
  try { window.v213FlushSave?.(); } catch {}
  try { window.renderSets?.(); } catch {}
  window.dispatchEvent(new CustomEvent('tcg:binder-broken-cards-removed', {
    detail: { unique: entries.length, totalCopies }
  }));
  try { window.toast?.(`${entries.length} broken card${entries.length === 1 ? '' : 's'} permanently removed.`); } catch {}
  setTimeout(() => {
    window.renderBinder?.(false);
    renderStatus();
  }, 0);
  return entries.length;
}

export function installBinderArtworkStatus(getCards) {
  if (installed) return;
  installed = true;
  const host = ensureStatusElement();
  host?.querySelector('#binderArtworkRepairV252')?.addEventListener('click', async () => {
    renderStatus('Retrying unresolved artwork only…');
    await repairFailedArtwork(getCards?.() || []);
    renderStatus();
    window.renderBinder?.(false);
  });
  host?.querySelector('#binderArtworkDeleteV254')?.addEventListener('click', () => {
    removeKnownBrokenCards();
  });
  host?.querySelector('#binderArtworkReportV252')?.addEventListener('click', async () => {
    const report = JSON.stringify(artworkRepairReport(), null, 2);
    try {
      await navigator.clipboard.writeText(report);
      renderStatus('Repair report copied');
    } catch {
      console.info('[TCG] Binder artwork report', report);
      renderStatus('Repair report written to console');
    }
  });
  window.addEventListener('tcg:artwork-status', () => renderStatus());
  window.addEventListener('tcg:binder-card-removed', () => renderStatus());
  renderStatus();
}

export { renderStatus as updateBinderArtworkStatus, removeKnownBrokenCards };
