let cleanupPresentation = () => {};
let reducedMotion = false;
let bootObserver = null;
let lastProgress = 0;

function launchEl(id) { return document.getElementById(id); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function timeout(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function suppressAchievementBurst() {
  if (!window.__TCG_BOOT_PHASE__) return;
  const burst = document.getElementById('v163UnlockBurst');
  if (!burst) return;
  if (burst.classList.contains('show')) burst.classList.remove('show');
  burst.style.setProperty('display', 'none', 'important');
  burst.dataset.bootSuppressed = '1';
}

export function beginLaunch() {
  window.__TCG_BOOT_PHASE__ = true;
  lastProgress = 0;
  cleanupPresentation();
  const root = launchEl('tcgLaunch');
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem('tcgPrefsV160') || '{}'); } catch (_) {}
  reducedMotion = !!prefs.reducedMotion || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (root) {
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
    root.dataset.quality = reducedMotion ? 'low' : prefs.cinematicFull === false ? 'medium' : 'high';
  }
  let frame = 0;
  const move = event => {
    if (reducedMotion || prefs.packTilt === false || root?.dataset.quality !== 'high' || event.pointerType !== 'mouse' || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      root?.style.setProperty('--px', `${(event.clientX / window.innerWidth - .5) * 6}px`);
      root?.style.setProperty('--py', `${(event.clientY / window.innerHeight - .5) * 4}px`);
    });
  };
  root?.addEventListener('pointermove', move);
  const failedImage = event => { if (event.target.tagName === 'IMG') event.target.style.visibility = 'hidden'; };
  root?.addEventListener('error', failedImage, true);
  cleanupPresentation = () => {
    if (frame) cancelAnimationFrame(frame);
    root?.removeEventListener('pointermove', move);
    root?.removeEventListener('error', failedImage, true);
  };
  suppressAchievementBurst();
  if (!bootObserver) {
    bootObserver = new MutationObserver(() => suppressAchievementBurst());
    bootObserver.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }
  return document.getElementById('tcgLaunch');
}

export function setLaunchStage(label, progress, hint) {
  const root = launchEl('tcgLaunch');
  if (!root) return;
  lastProgress = Math.max(lastProgress, Math.min(100, Number(progress) || 0));
  const stage = launchEl('tcgLaunchStage');
  const pct = launchEl('tcgLaunchPct');
  const bar = launchEl('tcgLaunchBar');
  const hintEl = launchEl('tcgLaunchHint');
  const messages = {
    'BUILDING COLLECTOR ROOM': ['PREPARING PACK ROOM', 'Making room for your next discovery.'],
    'WIRING INTERFACE': ['PREPARING COLLECTION', 'Preparing your collector controls.'],
    'REFRESHING GAME FILES': ['CHECKING COLLECTION CACHE', 'Getting your collector room ready.'],
    'LOADING COLLECTION': ['RESTORING COLLECTION', 'Bringing your collection together.'],
    'STARTING PACK ENGINE': ['PREPARING PACK ROOM', 'Your next pull is waiting.'],
    'WARMING COLLECTION': ['WARMING COLLECTION', 'Preparing your collector shelves.'],
    'POLISHING FIRST FRAME': ['LOADING PACK ART', 'Setting the stage for your next pack.'],
    'FINAL CHECK': ['FINALISING EXPERIENCE', 'Almost ready, collector.']
  };
  const message = messages[label];
  if (stage) stage.textContent = window.navigator?.onLine === false && label !== 'STARTUP PROBLEM' ? 'OFFLINE COLLECTION MODE' : (message?.[0] || String(label || 'LOADING').toUpperCase());
  launchEl('tcgLaunchMeter')?.setAttribute('aria-valuenow', String(Math.round(lastProgress)));
  if (pct) pct.textContent = `${Math.round(lastProgress)}%`;
  if (bar) bar.style.width = `${lastProgress}%`;
  if (hintEl) hintEl.textContent = message?.[1] || hint || 'Your next discovery awaits.';
}

function imageReady(img) {
  if (!img?.src) return Promise.resolve();
  if (img.complete && img.naturalWidth) return img.decode?.().catch(() => {}) || Promise.resolve();
  return new Promise(resolve => {
    const done = () => resolve();
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
}

export async function prewarmFirstFrame() {
  const mustExist = ['pack', 'v114PackMode', 'gameClockV170'];
  const started = performance.now();
  while (performance.now() - started < 1800) {
    if (mustExist.every(id => document.getElementById(id)) && document.querySelector('.nav')) break;
    await sleep(35);
  }

  const fontPromise = document.fonts?.ready || Promise.resolve();
  const images = [
    document.getElementById('packArt'),
    ...Array.from(document.querySelectorAll('#sets .set.selected img,#sets .set img')).slice(0, 5)
  ].filter(Boolean);
  await Promise.race([
    Promise.allSettled([fontPromise, ...images.map(imageReady)]),
    timeout(1400)
  ]);
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export async function finishLaunch() {
  setLaunchStage('COLLECTION READY', 100, 'Welcome back, collector.');
  const elapsed = performance.now() - Number(window.__TCG_BOOT_STARTED__ || 0);
  cleanupPresentation();

  // Any unlock generated by save migration/reconciliation during boot is data
  // reconciliation, not a new player event. Clear only the visual burst.
  const burst = document.getElementById('v163UnlockBurst');
  if (burst) {
    if (burst.classList.contains('show')) burst.classList.remove('show');
    burst.style.removeProperty('display');
    burst.textContent = '';
    delete burst.dataset.bootSuppressed;
  }

  document.documentElement.classList.remove('modern-booting');
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const root = launchEl('tcgLaunch');
  root?.setAttribute('aria-busy', 'false');
  root?.classList.add('v2541Leaving');
  const exitMs = reducedMotion || elapsed < 1000 ? 120 : 360;
  if (root) root.style.transitionDuration = `${exitMs}ms`;
  await sleep(exitMs);
  root?.remove();
  window.__TCG_BOOT_PHASE__ = false;
  bootObserver?.disconnect();
  bootObserver = null;
}

export function failLaunch(stage, error) {
  const root = launchEl('tcgLaunch');
  root?.classList.add('failed');
  const message = String(error?.message || error || 'Unknown startup error');
  cleanupPresentation();
  setLaunchStage('STARTUP PROBLEM', lastProgress, 'Your collection is safe. Please retry startup.');
  root?.setAttribute('aria-busy', 'false');
  const retry = launchEl('tcgLaunchRetry');
  if (retry) { retry.hidden = false; retry.onclick = () => location.reload(); }
  bootObserver?.disconnect();
  bootObserver = null;
  return message;
}
