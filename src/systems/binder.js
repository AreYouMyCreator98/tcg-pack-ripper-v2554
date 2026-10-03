import { loadBinderRuntime } from '../app/runtime-loader.js';
import { activateBinderScreen, binderScreenReady } from '../screens/binder/index.js';
import { artworkStatus, artworkRepairReport, repairFailedArtwork } from '../artwork/index.js';
import { currentBinderCards } from '../screens/binder/binder-renderer.js';

let installed = false;
let warmPromise = null;

function binderIsActive() {
  return document.getElementById('binder')?.classList.contains('active');
}

function warmBinderRuntime() {
  if (!warmPromise) {
    warmPromise = loadBinderRuntime()
      .then(() => activateBinderScreen())
      .catch(error => {
        warmPromise = null;
        throw error;
      });
  }
  return warmPromise;
}

export function installBinderModule() {
  if (installed) return;
  installed = true;

  // Core's legacy renderer references this symbol on image errors. Keep a safe
  // no-op immediately, then replace it with the V252 implementation when ready.
  window.repairBinderImage = window.repairBinderImage || (() => false);

  const navButton = document.querySelector('.nav [data-s="binder"]');
  navButton?.addEventListener('pointerdown', () => warmBinderRuntime().catch(() => {}), { passive: true });
  navButton?.addEventListener('click', () => {
    setTimeout(() => {
      warmBinderRuntime()
        .then(() => {
          if (binderIsActive()) window.renderBinder?.(false);
        })
        .catch(error => console.error('[TCG] Binder module failed', error));
    }, 0);
  });

  // The bridge is tiny. Warm it after critical boot so Binder is normally fully
  // modular before the player's first tap, without delaying Rip Packs startup.
  window.addEventListener('tcg:app-ready', () => {
    const run = () => warmBinderRuntime().catch(() => {});
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2400 });
    else setTimeout(run, 700);
  }, { once: true });
}

export async function openBinder() {
  await warmBinderRuntime();
  document.querySelector('.nav [data-s="binder"]')?.click();
  window.renderBinder?.(false);
  return true;
}

export async function repairBinderArtwork() {
  await warmBinderRuntime();
  return repairFailedArtwork(currentBinderCards());
}

export function getBinderArtworkStatus() {
  return artworkStatus();
}

export function getBinderArtworkReport() {
  return artworkRepairReport();
}

export { binderScreenReady };
