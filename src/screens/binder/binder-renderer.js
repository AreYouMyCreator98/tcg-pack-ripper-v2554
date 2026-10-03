import {
  getArtworkUrl,
  peekArtworkUrl,
  prefetchCards,
  prepareCollectionInBackground,
  clearFailureForCard
} from '../../artwork/index.js';
import { binderEntries, binderStats, filterBinderCards, paginateBinder } from './binder-model.js';
import { binderBridgeNow } from './binder-bridge.js';
import { updateBinderArtworkStatus } from './binder-status.js';

let renderToken = 0;

function ensureRemovalStyles() {
  if (document.getElementById('v254BinderRemovalStyles')) return;
  const style = document.createElement('style');
  style.id = 'v254BinderRemovalStyles';
  style.textContent = `
    #binder .v254ArtFailurePanel{position:absolute;inset:5px;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:7px;border-radius:9px;background:linear-gradient(145deg,rgba(111,72,220,.97),rgba(83,52,185,.98));box-shadow:inset 0 1px rgba(255,255,255,.2);text-align:center;color:#fff}
    #binder .v254ArtFailurePanel>b{font:950 9px/1.15 system-ui;letter-spacing:.6px}
    #binder .v254ArtFailurePanel>span{font:750 7px/1.25 system-ui;opacity:.84}
    #binder .v254ArtFailureActions{display:grid;grid-template-columns:1fr 1fr;gap:4px;width:100%;margin-top:2px}
    #binder .v254ArtFailureActions button{min-width:0;border:1px solid rgba(255,255,255,.24);border-radius:7px;padding:6px 3px;background:rgba(255,255,255,.14);color:#fff;font:900 6.5px/1 system-ui;letter-spacing:.35px}
    #binder .v254ArtFailureActions button.v254RemoveBrokenCard{background:rgba(31,19,52,.52);border-color:rgba(255,255,255,.18)}
  `;
  document.head.appendChild(style);
}

function filterControls() {
  return {
    query: document.getElementById('search')?.value || '',
    set: document.getElementById('setFilter')?.value || 'all'
  };
}

export function currentBinderCards() {
  const bridge = binderBridgeNow();
  if (!bridge) return [];
  return filterBinderCards(binderEntries(bridge.getBinderMap()), {
    ...filterControls(),
    tier: bridge.tier
  });
}

function binderKeyForCard(map, card) {
  if (!map || !card) return '';
  if (card.id && map[card.id]) return card.id;
  return Object.keys(map).find(key => String(map[key]?.id || '') === String(card.id || '')) || '';
}

function flushRemoval(bridge, card, qty) {
  try { bridge.save?.(); } catch {}
  try { window.v213FlushSave?.(); } catch {}
  try { window.renderSets?.(); } catch {}
  window.dispatchEvent(new CustomEvent('tcg:binder-card-removed', {
    detail: { id: card?.id || '', name: card?.name || 'Card', qty: Number(qty || 0), reason: 'broken-artwork' }
  }));
}

export function permanentlyRemoveBinderCard(card, { confirmRemoval = true } = {}) {
  const bridge = binderBridgeNow();
  if (!bridge || !card) return false;
  const map = bridge.getBinderMap();
  const key = binderKeyForCard(map, card);
  if (!key) return false;
  const owned = map[key];
  const qty = Math.max(1, Number(owned?.qty || card.qty || 1));
  if (confirmRemoval) {
    const copy = qty > 1 ? ` and all ${qty} copies` : '';
    const ok = window.confirm(
      `Permanently remove ${owned?.name || card.name || 'this card'}${copy} from the Binder?\n\n` +
      `This lowers collection/Master Set progress and cannot be undone. The card must be pulled, bought or traded again to return.`
    );
    if (!ok) return false;
  }
  delete map[key];
  clearFailureForCard(owned || card);
  flushRemoval(bridge, owned || card, qty);
  try { window.toast?.(`${owned?.name || card.name || 'Card'} removed from Binder.`); } catch {}
  queueMicrotask(() => renderBinderPage(false));
  return true;
}

function makeSlot(card, bridge) {
  const slot = document.createElement('div');
  slot.dataset.cardId = card.id;
  const fx = bridge.effectClass(card);
  slot.className = `slot v252ArtPending${fx ? ` cardFx ${fx}` : ''}`;

  const img = document.createElement('img');
  img.className = 'binderArtV252';
  img.alt = card.name || 'Card';
  img.decoding = 'async';
  img.loading = 'eager';
  if ('fetchPriority' in img) img.fetchPriority = 'high';

  const stars = document.createElement('span');
  stars.className = 'rarity-stars';
  stars.setAttribute('aria-hidden', 'true');

  const qty = document.createElement('span');
  qty.className = 'qty';
  qty.textContent = `${Math.max(1, Number(card.qty || 1))}x`;

  slot.append(img, stars, qty);
  slot.addEventListener('click', () => window.openBinderCard?.(card.id));
  return { slot, img };
}

function showSlotFailure(slot, img, card) {
  if (!slot.isConnected) return;
  ensureRemovalStyles();
  slot.classList.remove('v252ArtPending', 'v252ArtReady');
  slot.classList.add('v252ArtFailed');

  let panel = slot.querySelector('.v254ArtFailurePanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'v254ArtFailurePanel';
    panel.innerHTML = `
      <b>ARTWORK UNAVAILABLE</b>
      <span>Retry it or permanently remove this card.</span>
      <div class="v254ArtFailureActions">
        <button type="button" class="v254RetryBrokenCard">TRY AGAIN</button>
        <button type="button" class="v254RemoveBrokenCard">REMOVE</button>
      </div>`;
    panel.addEventListener('click', event => event.stopPropagation());

    const retry = panel.querySelector('.v254RetryBrokenCard');
    retry.addEventListener('click', async event => {
      event.stopPropagation();
      retry.disabled = true;
      slot.classList.add('v252ArtPending');
      try {
        const url = await getArtworkUrl(card, 'low', { force: true, priority: 130 });
        if (!img.isConnected) return;
        img.src = url;
        slot.classList.remove('v252ArtFailed', 'v252ArtPending');
        slot.classList.add('v252ArtReady');
        panel.remove();
      } catch {
        slot.classList.remove('v252ArtPending');
        retry.disabled = false;
      }
    });

    panel.querySelector('.v254RemoveBrokenCard').addEventListener('click', event => {
      event.stopPropagation();
      permanentlyRemoveBinderCard(card);
    });
    slot.appendChild(panel);
  }
}

async function hydrateVisibleSlot(slot, img, card, token) {
  try {
    let url = await peekArtworkUrl(card, 'low');
    if (!url) url = await getArtworkUrl(card, 'low', { priority: 120 });
    if (token !== renderToken || !img.isConnected) return;
    img.src = url;
    slot.querySelector('.v254ArtFailurePanel')?.remove();
    slot.classList.remove('v252ArtPending', 'v252ArtFailed');
    slot.classList.add('v252ArtReady');
  } catch {
    if (token === renderToken) showSlotFailure(slot, img, card);
  }
}

function prefetchAround(cards, page, pageSize) {
  const previous = cards.slice(Math.max(0, (page - 1) * pageSize), Math.max(0, page * pageSize));
  const next = cards.slice((page + 1) * pageSize, (page + 2) * pageSize);
  const run = () => {
    prefetchCards([...next, ...previous], { priority: 55 }).catch(() => {});
    prepareCollectionInBackground(cards).catch(() => {});
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 900 });
  else setTimeout(run, 250);
}

export function renderBinderPage(anim = false) {
  const bridge = binderBridgeNow();
  if (!bridge) return false;
  if (document.getElementById('rip')?.classList.contains('active') && !document.getElementById('binder')?.classList.contains('active')) return false;

  const token = ++renderToken;
  bridge.applyTheme();
  bridge.renderShelf();
  const cards = currentBinderCards();
  const stats = binderStats(cards);
  const pagination = paginateBinder(cards, bridge.getPage(), bridge.pageSize);
  bridge.setPage(pagination.page);

  const stat = document.getElementById('binderStat');
  if (stat) stat.textContent = `${stats.unique} unique • ${stats.total} total cards`;
  const label = document.getElementById('pageLabel');
  if (label) label.textContent = `Page ${pagination.page + 1} / ${pagination.totalPages}`;
  const previous = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  if (previous) previous.disabled = pagination.page === 0;
  if (next) next.disabled = pagination.page >= pagination.totalPages - 1;

  const grid = document.getElementById('binderGrid');
  if (!grid) return false;
  grid.replaceChildren();
  for (const card of pagination.cards) {
    const { slot, img } = makeSlot(card, bridge);
    grid.appendChild(slot);
    hydrateVisibleSlot(slot, img, card, token);
  }
  for (let index = pagination.cards.length; index < bridge.pageSize; index++) {
    const empty = document.createElement('div');
    empty.className = 'slot emptySlot';
    empty.style.opacity = '.12';
    grid.appendChild(empty);
  }

  if (anim) {
    grid.classList.remove('page-arrive-next', 'page-arrive-prev');
    void grid.offsetWidth;
    grid.classList.add(anim === 'prev' ? 'page-arrive-prev' : 'page-arrive-next');
    setTimeout(() => grid.classList.remove('page-arrive-next', 'page-arrive-prev'), 620);
  }

  prefetchAround(cards, pagination.page, bridge.pageSize);
  updateBinderArtworkStatus();
  return true;
}
