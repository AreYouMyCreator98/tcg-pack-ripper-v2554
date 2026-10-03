import { criticalRuntime, binderRuntime, packRuntime, secondaryRuntime } from '../config/runtime-manifest.js';
import { APP_CONFIG } from '../config/app-config.js';
import { withTimeout } from '../utils/async.js';

const loaded = new Map();
const completed = new Set();
const groupPromises = new Map();

function runtimeUrl(path, attempt = 0) {
  const url = new URL(path, document.baseURI);
  url.searchParams.set('v', APP_CONFIG.buildId);
  if (attempt) url.searchParams.set('retry', String(attempt));
  return url.href;
}

function injectClassicScript(path, attempt) {
  let tag;
  let settled = false;
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
    tag = document.createElement('script');
    tag.src = runtimeUrl(path, attempt);
    tag.async = false;
    tag.dataset.runtimeChunk = path;
    tag.dataset.runtimeAttempt = String(attempt + 1);
    tag.onload = () => {
      if (settled) return;
      settled = true;
      resolve(path);
    };
    tag.onerror = () => {
      if (settled) return;
      settled = true;
      tag.remove();
      reject(new Error(`Failed to load ${path} (attempt ${attempt + 1})`));
    };
    document.body.appendChild(tag);
  });

  return {
    promise,
    cancel(reason = 'cancelled') {
      if (settled) return;
      settled = true;
      if (tag) {
        tag.onload = null;
        tag.onerror = null;
        tag.remove();
      }
      rejectPromise?.(new Error(`${path} ${reason}`));
    }
  };
}

async function loadWithRetry(path, timeoutMs) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const task = injectClassicScript(path, attempt);
    try {
      return await withTimeout(task.promise, timeoutMs, `runtime ${path}`);
    } catch (error) {
      task.cancel('timed out');
      // Prevent a rejected cancelled promise from surfacing after the timeout race.
      task.promise.catch(() => {});
      lastError = error;
      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 180));
    }
  }
  throw lastError || new Error(`Failed to load ${path}`);
}

export function loadClassicScript(path, timeoutMs = 12000) {
  if (loaded.has(path)) return loaded.get(path);
  const promise = loadWithRetry(path, timeoutMs).then(value => { completed.add(path); return value; }).catch(error => {
    loaded.delete(path);
    throw error;
  });
  loaded.set(path, promise);
  return promise;
}

async function loadSequence(paths, timeoutMs, group) {
  for (let index = 0; index < paths.length; index++) {
    const path = paths[index];
    window.dispatchEvent(new CustomEvent('tcg:runtime-progress', {
      detail: { group, path, index, total: paths.length, phase: 'loading' }
    }));
    await loadClassicScript(path, timeoutMs);
    window.dispatchEvent(new CustomEvent('tcg:runtime-progress', {
      detail: { group, path, index: index + 1, total: paths.length, phase: 'loaded' }
    }));
  }
}

function loadGroup(name, paths, timeoutMs) {
  if (!groupPromises.has(name)) {
    const promise = loadSequence(paths, timeoutMs, name)
      .then(() => {
        window.dispatchEvent(new CustomEvent(`tcg:${name}-ready`));
        return true;
      })
      .catch(error => {
        groupPromises.delete(name);
        window.dispatchEvent(new CustomEvent(`tcg:${name}-failed`, {
          detail: { message: String(error?.message || error) }
        }));
        throw error;
      });
    groupPromises.set(name, promise);
  }
  return groupPromises.get(name);
}

export async function loadCriticalRuntime() {
  // Critical chunks are local static files. If one cannot load twice within ~11s,
  // fail with the exact filename rather than pinning the splash indefinitely.
  await loadSequence(criticalRuntime, 5500, 'critical');
  window.dispatchEvent(new CustomEvent('tcg:critical-ready'));
}

export function loadBinderRuntime() {
  return loadGroup('binder-runtime', binderRuntime, 9000);
}

export function loadPackRuntime() {
  return loadGroup('pack-runtime', packRuntime, 9000);
}

export function loadSecondaryRuntime() {
  return loadGroup('secondary', secondaryRuntime, 14000).then(async () => {
    const { installTradeHub } = await import('../trade-hub/index.js');
    installTradeHub();
    const { installProfileStudio } = await import('../screens/profile/index.js');
    installProfileStudio();
    return true;
  });
}

export function scheduleSecondaryRuntime() {
  const run = () => loadSecondaryRuntime().catch(error => console.error('[TCG] Secondary runtime failed', error));
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1800 });
  else setTimeout(run, 650);
}

export function isRuntimeLoaded(path) { return completed.has(path); }
export function runtimeLoadState() { return Object.freeze([...completed]); }
