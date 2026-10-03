export function installTenPackController({ bridge, hud } = {}) {
  let remaining = 0;
  let armedUntil = 0;
  let resetTimer = 0;

  function resetButton() {
    armedUntil = 0;
    clearTimeout(resetTimer);
    hud?.setRevealAllText('REVEAL ALL', false);
  }

  window.addEventListener('tcg:card-reveal', event => {
    const d = event.detail || {};
    if (Number(d.mode) !== 10) { remaining = 0; hud?.hideRevealAll(); return; }
    remaining = Math.max(0, Number(d.total || 0) - Number(d.index || 0));
    hud?.showRevealAll(remaining);
    resetButton();
  });
  window.addEventListener('tcg:pack-summary', () => { remaining = 0; hud?.hideRevealAll(); resetButton(); });

  function revealAll() {
    if (remaining <= 1) return;
    const now = Date.now();
    if (now >= armedUntil) {
      armedUntil = now + 2200;
      hud?.setRevealAllText(`TAP AGAIN · ${remaining}`, true);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(resetButton, 2300);
      return;
    }
    const result = bridge.collectRemaining();
    if (!result?.ok) {
      hud?.setRevealAllText(result?.reason === 'locked' ? 'WAIT FOR HIT' : 'TRY AGAIN', true);
      setTimeout(resetButton, 900);
      return;
    }
    remaining = 0;
    hud?.hideRevealAll();
    resetButton();
  }

  return Object.freeze({ revealAll, remaining: () => remaining });
}
