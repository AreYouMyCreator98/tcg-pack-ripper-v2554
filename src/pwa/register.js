import { APP_CONFIG } from '../config/app-config.js';

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function waitForState(worker, wanted = 'activated', timeoutMs = 1400) {
  if (!worker || worker.state === wanted) return Promise.resolve(true);
  return Promise.race([
    new Promise(resolve => {
      const onState = () => {
        if (worker.state === wanted || worker.state === 'redundant') {
          worker.removeEventListener('statechange', onState);
          resolve(worker.state === wanted);
        }
      };
      worker.addEventListener('statechange', onState);
    }),
    sleep(timeoutMs).then(() => false)
  ]);
}

function waitForControllerChange(timeoutMs = 1200) {
  return Promise.race([
    new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(true), { once: true })),
    sleep(timeoutMs).then(() => false)
  ]);
}

export async function registerPWA({ waitForControlMs = 1400 } = {}) {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const before = navigator.serviceWorker.controller;
    const registration = await navigator.serviceWorker.register(
      `./sw.js?v=${encodeURIComponent(APP_CONFIG.buildId)}`,
      { scope: './', updateViaCache: 'none' }
    );

    // Check for a new worker immediately. Waiting until after app-ready can deadlock
    // a stale worker with a newer HTML/module shell during startup.
    try { await registration.update(); } catch (_) {}

    const candidate = registration.installing || registration.waiting;
    if (candidate) await waitForState(candidate, 'activated', waitForControlMs);
    if (before && navigator.serviceWorker.controller === before && candidate) {
      await waitForControllerChange(Math.min(1200, waitForControlMs));
    }

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent('tcg:update-ready', { detail: { version: APP_CONFIG.version } }));
        }
      });
    });
    return true;
  } catch (err) {
    console.warn('[TCG] Service worker registration failed', err);
    return false;
  }
}
