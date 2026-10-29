import { installSealedVault } from './sealed/index.js';
import {loadCardAssetManifest,resolveCardImage} from './artwork/card-assets.js';
import { installSilverShell } from './screens/rip/silver-shell.js';
import { installCollector } from './collector/index.js';
import { installCollectorNavigation } from './app/collector-navigation.js';
import { installQuestShortcut } from './app/quest-shortcut.js';
import { mountUI } from './ui.js';
import { installBulkModule } from './screens/bulk/index.js';
import { configurePlatform } from './platform/mobile.js';
import { loadCriticalRuntime, loadPackRuntime, loadSecondaryRuntime, scheduleSecondaryRuntime } from './app/runtime-loader.js';
import { installNavigationPreload } from './app/navigation-preload.js';
import { installNavigationInput } from './app/navigation-input.js';
import { installSettingsOverlay } from './app/settings-overlay.js';
import { installDiagnostics, bootMark } from './app/diagnostics.js';
import { installHealthCheck } from './app/health-check.js';
import { registerPWA } from './pwa/register.js';
import { installImagePolicy } from './platform/image-policy.js';
import { installScreenTransitions } from './animations/screen-transitions.js';
import { installBinderModule } from './systems/binder.js';
import { installPackModule } from './systems/packs.js';
import { installRankFrameRenderer } from './systems/rank-frame-renderer.js';
import { beginLaunch, setLaunchStage, prewarmFirstFrame, finishLaunch, failLaunch } from './app/launch-screen.js';
import { APP_CONFIG, exposeAppConfig } from './config/app-config.js?v=2645';

const cardManifestReady=loadCardAssetManifest();
window.tcgCardAssets={resolve:resolveCardImage};
beginLaunch();
exposeAppConfig();
installDiagnostics();
installHealthCheck();
configurePlatform();
bootMark('boot-start', { version: APP_CONFIG.version, buildId: APP_CONFIG.buildId });

let bootStage = 'initialising';
let bootFinished = false;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Keep V264.1's bounded startup worker check. V264.2 moved this later and
// regressed Chrome, so the V264.3 fix leaves that ordering untouched.
const pwaRefresh = APP_CONFIG.featureFlags.pwa
  ? registerPWA({ waitForControlMs: 1500 })
  : Promise.resolve(false);

const startupMode = new URLSearchParams(location.search).get('startup');
const liteStartup = startupMode === 'lite';
const directStartup = startupMode === 'direct';
window.__TCG_TRACE__ = new URLSearchParams(location.search).has('trace');
if (window.__TCG_TRACE__) {
  // Opt-in on-device startup breadcrumb. Shows the last completed action even
  // if the main thread hangs and remote developer tools cannot connect.
  const panel = document.createElement('output');
  panel.id = 'tcgStartupTrace';
  panel.setAttribute('aria-label', 'Startup diagnostic');
  Object.assign(panel.style, {
    position: 'fixed', left: '6px', right: '6px', bottom: '12vh', zIndex: '2147483647',
    padding: '8px 10px', borderRadius: '8px', pointerEvents: 'none',
    background: 'rgba(8,13,21,.92)', color: '#d6f8df', font: '12px monospace',
    whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'
  });
  document.body.append(panel);
  const traceStart = performance.now();
  window.TCG_TRACE_MARK = value => {
    const line = `${Math.round(performance.now() - traceStart)}ms ${value}`;
    panel.textContent = `DIAGNOSTIC MODE · SAVE DATA UNCHANGED\n${line}`;
  };
  window.TCG_TRACE_MARK('tracer installed');
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    panel.dataset.heartbeat = String(Math.round(performance.now() - traceStart));
  }, 900);
}

window.addEventListener('tcg:runtime-progress', event => {
  const d = event.detail || {};
  if (d.group !== 'critical') return;
  const total = Math.max(1, Number(d.total || 1));
  const position = d.phase === 'loaded' ? Number(d.index || 0) : Number(d.index || 0) + 0.25;
  const progress = 47 + Math.min(13, (position / total) * 13);
  const file = String(d.path || 'game systems').split('/').pop();
  setLaunchStage('LOADING COLLECTION', progress, `${d.phase === 'loaded' ? 'Loaded' : 'Restoring'} ${file}…`);
});

function showBootFailure(error) {
  console.error('[TCG] Boot failed', error);
  const message = failLaunch(bootStage, error);
  bootMark('boot-failed', { stage: bootStage, message });
}

// Last-resort UI watchdog. This never deletes player data; it simply turns an
// endless splash into an actionable retry screen with the current boot stage.
const bootWatchdog = setTimeout(() => {
  if (bootFinished) return;
  showBootFailure(new Error('Startup exceeded 28 seconds. Tap to retry with refreshed game files.'));
}, 28000);

async function boot() {
  try {
    bootStage = 'loading interface';
    setLaunchStage('BUILDING COLLECTOR ROOM', 18, 'Mounting the game interface…');
    await mountUI();
    installQuestShortcut({load:loadSecondaryRuntime});
    bootMark('ui-mounted');

    bootStage = 'installing interface systems';
    setLaunchStage('WIRING INTERFACE', 32, 'Preparing controls and mobile input…');
    installNavigationPreload();
    installNavigationInput();
    installSettingsOverlay();
    await cardManifestReady;
    installImagePolicy(document);
    installScreenTransitions(document);
    installBinderModule();
    installRankFrameRenderer();

    bootStage = 'refreshing game files';
    setLaunchStage('REFRESHING GAME FILES', 40, 'Checking the latest runtime and clearing stale cache…');
    await Promise.race([pwaRefresh, sleep(1700)]);

    bootStage = 'starting critical game systems';
    setLaunchStage('LOADING COLLECTION', 47, 'Restoring packs, progress and collection systems…');
    await loadCriticalRuntime();
    installBulkModule();
    installCollectorNavigation();
    bootMark('critical-runtime-ready');

    bootStage = 'starting pack engine';
    setLaunchStage('STARTING PACK ENGINE', 63, 'Preparing reveals, pull tracking and pack flow…');
    try {
      await loadPackRuntime();
      installPackModule();
      bootMark('pack-engine-ready');
    } catch (error) {
      console.error('[TCG] Modular pack engine unavailable; using legacy pack flow', error);
      bootMark('pack-engine-failed', { message: String(error?.message || error) });
    }

    // Keep optional Binder/Ranked chunks out of the critical launch path. The
    // Binder and secondary loaders already warm on demand / after app-ready.
    bootStage = 'preparing first frame';
    bootMark('first-frame-start');
    setLaunchStage('POLISHING FIRST FRAME', 89, 'Loading pack art and locking the layout into place…');
    bootMark('first-frame-stage-set');
    if (!directStartup) await prewarmFirstFrame();
    else bootMark('first-frame-warmup-skipped');
    bootStage = 'finishing startup';
    setLaunchStage('FINAL CHECK', 96, 'Everything is almost ready…');
    bootMark('finish-launch-entering');
    await finishLaunch({ skipPaint: directStartup });
    bootFinished = true;
    clearTimeout(bootWatchdog);
    bootMark('pack-room-visible');
    // After the splash is gone, optional work may start. The timer creates a
    // genuine paint boundary; it does not block the boot watchdog or UI.
    setTimeout(() => { bootMark('post-launch-timer-fired'); void installPostLaunchFeatures(); }, 200);
    if ('serviceWorker' in navigator) {
      setTimeout(() => navigator.serviceWorker.controller?.postMessage({ type: 'PRUNE_OLD_CACHES' }), 10000);
    }
  } catch (error) {
    clearTimeout(bootWatchdog);
    showBootFailure(error);
  }
}

boot();

// The collector gallery, sealed shop and modern shell are enhancements, not
// prerequisites for showing the pack room. In particular installCollector()
// can render a large owned-card group synchronously on older mobile profiles.
async function installPostLaunchFeatures() {
  if (!liteStartup) {
    for (const [name, install] of [
      ['collector', installCollector],
      ['sealed-vault', installSealedVault],
      ['silver-shell', installSilverShell]
    ]) {
      // Give Android an opportunity to paint and handle user input between jobs.
      await sleep(40);
      bootMark(`${name}-starting`);
      try { install(); bootMark(`${name}-ready`); }
      catch (error) {
        console.error(`[TCG] ${name} enhancement unavailable`, error);
        bootMark(`${name}-failed`, { message: String(error?.message || error) });
      }
    }
  } else {
    console.info('[TCG] Lite startup diagnostic: optional collector enhancements are paused. Player data is unchanged.');
    bootMark('lite-startup');
  }
  window.dispatchEvent(new CustomEvent('tcg:app-ready', {
    detail: { version: APP_CONFIG.version }
  }));
  bootMark('app-ready');
  if (!liteStartup) scheduleSecondaryRuntime();
}
