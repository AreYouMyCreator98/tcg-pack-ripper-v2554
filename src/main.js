import { mountUI } from './ui.js';
import { configurePlatform } from './platform/mobile.js';
import { loadCriticalRuntime, loadPackRuntime, loadBinderRuntime, loadSecondaryRuntime, scheduleSecondaryRuntime } from './app/runtime-loader.js';
import { installNavigationPreload } from './app/navigation-preload.js';
import { installDiagnostics, bootMark } from './app/diagnostics.js';
import { installHealthCheck } from './app/health-check.js';
import { registerPWA } from './pwa/register.js';
import { installImagePolicy } from './platform/image-policy.js';
import { installScreenTransitions } from './animations/screen-transitions.js';
import { installBinderModule } from './systems/binder.js';
import { installPackModule } from './systems/packs.js';
import { installRankFrameRenderer } from './systems/rank-frame-renderer.js';
import { beginLaunch, setLaunchStage, prewarmFirstFrame, finishLaunch, failLaunch } from './app/launch-screen.js';
import { APP_CONFIG, exposeAppConfig } from './config/app-config.js?v=256';

beginLaunch();
exposeAppConfig();
installDiagnostics();
installHealthCheck();
configurePlatform();
bootMark('boot-start', { version: APP_CONFIG.version, buildId: APP_CONFIG.buildId });

let bootStage = 'initialising';
let bootFinished = false;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Register/update the worker at the START of boot. A stale worker must not be able
// to block the very boot that would otherwise install its replacement.
const pwaRefresh = APP_CONFIG.featureFlags.pwa
  ? registerPWA({ waitForControlMs: 1500 })
  : Promise.resolve(false);

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
    bootMark('ui-mounted');

    bootStage = 'installing interface systems';
    setLaunchStage('WIRING INTERFACE', 32, 'Preparing controls and mobile input…');
    installNavigationPreload();
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

    bootStage = 'warming collection systems';
    setLaunchStage('WARMING COLLECTION', 76, 'Preloading Binder, ranked and multiplayer systems…');
    const warmOptional = Promise.allSettled([
      loadBinderRuntime(),
      loadSecondaryRuntime()
    ]);

    bootStage = 'preparing first frame';
    setLaunchStage('POLISHING FIRST FRAME', 89, 'Loading pack art and locking the layout into place…');
    await Promise.allSettled([
      prewarmFirstFrame(),
      Promise.race([warmOptional, sleep(2200)])
    ]);

    bootStage = 'finishing startup';
    setLaunchStage('FINAL CHECK', 96, 'Everything is almost ready…');

    window.dispatchEvent(new CustomEvent('tcg:app-ready', {
      detail: { version: APP_CONFIG.version }
    }));
    bootMark('app-ready');

    scheduleSecondaryRuntime();
    await finishLaunch();
    bootFinished = true;
    clearTimeout(bootWatchdog);
  } catch (error) {
    clearTimeout(bootWatchdog);
    showBootFailure(error);
  }
}

boot();
