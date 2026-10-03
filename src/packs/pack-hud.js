import { streakCopy } from './pack-history.js';

function el(id) { return document.getElementById(id); }

export function installPackHUD({ onToggleFast, onRevealAll, onResetSession } = {}) {
  const stage = el('stage');
  const rip = el('rip');
  if (!stage || !rip) return null;
  el('v253PackHUD')?.remove();
  el('v253TenTools')?.remove();

  const hud = document.createElement('div');
  hud.id = 'v253PackHUD';
  hud.className = 'v253PackHUD';
  hud.innerHTML = `
    <button type="button" class="v253Fast" id="v253FastToggle" aria-pressed="false"><span>⚡</span><b>FAST</b></button>
    <div class="v253HudStat"><small>SESSION</small><b id="v253SessionPacks">0 PACKS</b></div>
    <div class="v253HudStat"><small>SIR+</small><b id="v253SirStreak">—</b></div>
    <div class="v253HudStat"><small>GOD</small><b id="v253GodStreak">—</b></div>`;
  rip.appendChild(hud);

  const ten = document.createElement('div');
  ten.id = 'v253TenTools';
  ten.className = 'v253TenTools';
  ten.innerHTML = `<button type="button" id="v253RevealAll"><span>✦</span><b>REVEAL ALL</b><small id="v253RevealRemaining"></small></button>`;
  stage.appendChild(ten);

  el('v253FastToggle')?.addEventListener('click', () => onToggleFast?.());
  el('v253RevealAll')?.addEventListener('click', () => onRevealAll?.());

  function syncHudVisibility() {
    const summaryOpen = !!el('v88Summary');
    const extractOpen = !!document.getElementById('v128Extract')?.classList.contains('on');
    const stageBusy = stage.classList.contains('cardModeV89')
      || stage.classList.contains('v91Cinematic')
      || stage.classList.contains('v114TenRipping');
    const hidden = summaryOpen || extractOpen || stageBusy || !rip.classList.contains('active');
    hud.classList.toggle('v253HudHidden', hidden);
  }

  const stageObserver = new MutationObserver(syncHudVisibility);
  stageObserver.observe(stage, { attributes: true, attributeFilter: ['class'], childList: true });
  const bodyObserver = new MutationObserver(syncHudVisibility);
  bodyObserver.observe(document.body, { childList: true });
  window.addEventListener('tcg:card-reveal-start', syncHudVisibility);
  window.addEventListener('tcg:pack-summary', syncHudVisibility);
  window.addEventListener('tcg:app-ready', syncHudVisibility);
  syncHudVisibility();

  function update(snapshot, fast = false) {
    const s = snapshot?.session || {};
    const p = snapshot?.persistent || {};
    const streaks = streakCopy(p);
    if (el('v253SessionPacks')) el('v253SessionPacks').textContent = `${Number(s.packs || 0)} ${Number(s.packs || 0) === 1 ? 'PACK' : 'PACKS'}`;
    if (el('v253SirStreak')) el('v253SirStreak').textContent = streaks.sir.toUpperCase();
    if (el('v253GodStreak')) el('v253GodStreak').textContent = streaks.god.toUpperCase();
    const fastButton = el('v253FastToggle');
    if (fastButton) { fastButton.classList.toggle('active', !!fast); fastButton.setAttribute('aria-pressed', fast ? 'true' : 'false'); fastButton.querySelector('b').textContent = fast ? 'FAST ON' : 'FAST'; }
  }

  function showRevealAll(remaining) {
    const root = el('v253TenTools'), small = el('v253RevealRemaining');
    if (root) root.classList.toggle('show', Number(remaining) > 1);
    if (small) small.textContent = Number(remaining) > 1 ? `${remaining} TO COLLECT` : '';
  }

  function setRevealAllText(text, armed = false) {
    const b = el('v253RevealAll');
    if (!b) return;
    b.classList.toggle('armed', !!armed);
    const strong = b.querySelector('b');
    if (strong) strong.textContent = text;
  }

  function hideRevealAll() { el('v253TenTools')?.classList.remove('show'); }

  return Object.freeze({ update, showRevealAll, hideRevealAll, setRevealAllText, syncVisibility: syncHudVisibility, reset: () => onResetSession?.() });
}
