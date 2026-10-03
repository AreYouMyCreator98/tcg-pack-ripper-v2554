const REQUIRED_IDS = Object.freeze([
  'rip', 'binder', 'bulk', 'earn', 'profile',
  'binderGrid', 'packArt', 'coins', 'packs', 'hits'
]);

export function runHealthCheck() {
  const missing = REQUIRED_IDS.filter(id => !document.getElementById(id));
  const navTargets = [...document.querySelectorAll('.nav [data-s]')].map(el => el.dataset.s);
  const requiredNav = ['rip', 'binder', 'bulk', 'earn', 'profile'];
  const missingNav = requiredNav.filter(id => !navTargets.includes(id));
  const result = Object.freeze({
    ok: missing.length === 0 && missingNav.length === 0,
    missing,
    missingNav,
    at: Date.now(),
    version: window.TCG_VERSION || 'unknown'
  });
  window.dispatchEvent(new CustomEvent('tcg:health', { detail: result }));
  return result;
}

export function installHealthCheck() {
  window.TCG_HEALTH = { run: runHealthCheck, last: null };
  window.addEventListener('tcg:app-ready', () => {
    const result = runHealthCheck();
    window.TCG_HEALTH.last = result;
    if (!result.ok) console.warn('[TCG] UI health check failed', result);
  });
}
