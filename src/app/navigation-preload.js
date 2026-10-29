import { loadSecondaryRuntime } from './runtime-loader.js';

export function installNavigationPreload() {
  const preload = () => loadSecondaryRuntime().catch(error => {
    console.warn('[TCG] Optional Hub/Profile scripts unavailable', error);
  });
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest?.('.nav [data-s]');
    if (!button) return;
    const target = button.dataset.s;
    // Binder has its own tiny runtime group and is warmed by the Binder module.
    if (target === 'earn' || target === 'profile' || target === 'settings') {
      preload();
    }
  }, { capture: true, passive: true });
  // Also cover programmatic navigation and the new collector navigation rail.
  // This lets Android defer optional scripts until the player actually needs
  // Hub/Profile, while preserving all those features once visited.
  window.addEventListener('tcg:navigation', event => {
    if (['hub', 'profile'].includes(event.detail?.destination)) preload();
  });
}
