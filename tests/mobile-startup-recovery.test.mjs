import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

const html = fs.readFileSync('index.html', 'utf8');
const inline = html.match(/<script>\s*window\.__TCG_BOOT_PHASE__[\s\S]*?<\/script>/)?.[0]
  ?.replace(/^<script>/, '').replace(/<\/script>$/, '');

test('a stalled module shows a recovery button even without the app booting', () => {
  assert.ok(inline, 'a self-contained pre-module recovery script must exist');
  const { window } = parseHTML(html);
  Object.defineProperty(window.document, 'baseURI', { value: 'https://example.test/game/' });
  const timers = [];
  const context = {
    window, document: window.document, performance: { now: () => 0 },
    navigator: { onLine: false }, URL, location: { href: 'https://example.test/game/' },
    setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout: () => {}
  };
  vm.runInNewContext(inline, context);
  assert.equal(timers.length, 1);
  assert.equal(window.document.getElementById('tcgLaunchRetry').hidden, true);
  timers[0]();
  assert.equal(window.document.getElementById('tcgLaunchRetry').hidden, false);
  assert.match(window.document.getElementById('tcgLaunchHint').textContent, /collection is safe/i);
});

test('recovery button refreshes only game caches and app-scoped worker, preserving saves', async () => {
  const { window } = parseHTML(html);
  const touched = [];
  const appScope = 'https://example.test/tcg-pack-ripper-v2554/';
  let complete;
  const repaired = new Promise(resolve => { complete = resolve; });
  Object.defineProperty(window.document, 'baseURI', { value: appScope });
  const context = {
    window, document: window.document, performance: { now: () => 0 }, URL, Date,
    navigator: {
      onLine: true,
      serviceWorker: {
        getRegistration: async scope => { touched.push(['worker-lookup', scope]); return { scope: appScope, unregister: async () => { touched.push(['unregister']); } }; }
      }
    },
    caches: {
      keys: async () => ['tcg-pack-ripper-old-static', 'unrelated-app-cache', 'tcg-pack-ripper-old-media'],
      delete: async key => { touched.push(['delete', key]); return true; }
    },
    location: {
      href: appScope + '?a=1',
      replace: url => { touched.push(['replace', url]); complete(); }
    },
    setTimeout: () => 1, clearTimeout: () => {}
  };
  window.caches = context.caches;
  vm.runInNewContext(inline, context);
  void window.TCG_BOOT_RECOVERY.repair();
  await repaired;
  assert.deepEqual(touched.filter(([op]) => op === 'delete').map(([, key]) => key).sort(),
    ['tcg-pack-ripper-old-media', 'tcg-pack-ripper-old-static']);
  assert.ok(touched.some(([op, scope]) => op === 'worker-lookup' && scope === appScope));
  assert.ok(touched.some(([op]) => op === 'unregister'));
  assert.ok(touched.some(([op, url]) => op === 'replace' && url.includes('boot-refresh=') && url.includes('a=1')));
  assert.doesNotMatch(inline, /localStorage\.|indexedDB\.|\.clear\(/);
});

test('first-frame and exit animations have a time limit on throttled Android WebViews', async () => {
  const { window } = parseHTML('<html><body><div id="tcgLaunch"></div><div id="pack"></div><div id="v114PackMode"></div><div id="gameClockV170"></div><nav class="nav"></nav></body></html>');
  const old = { window: globalThis.window, document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame };
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.requestAnimationFrame = () => 1; // Never scheduled, as when a PWA is backgrounded.
  try {
    const launch = await import('../src/app/launch-screen.js?frozen-frames');
    const start = performance.now();
    await launch.prewarmFirstFrame();
    await launch.finishLaunch();
    assert.ok(performance.now() - start < 1400, 'startup must not depend on requestAnimationFrame ever firing');
    assert.equal(window.document.getElementById('tcgLaunch'), null);
  } finally {
    Object.assign(globalThis, old);
  }
});

test('service worker precaches only offline shell after the game is interactive', () => {
  const worker = fs.readFileSync('public/sw.js', 'utf8');
  const main = fs.readFileSync('src/main.js', 'utf8');
  assert.match(worker, /Math\.min\(2, INSTALL_SHELL\.length\)/);
  assert.match(worker, /const INSTALL_SHELL = \[/);
  assert.doesNotMatch(worker, /const url = CORE\[next\+\+\]/);
  assert.match(worker, /PRUNE_OLD_CACHES/);
  assert.match(main, /PRUNE_OLD_CACHES/);
  assert.ok(main.indexOf('await finishLaunch({ skipPaint: directStartup })') < main.indexOf('PRUNE_OLD_CACHES'));
  assert.match(main, /setTimeout\(refresh, 8000\)/);
  assert.ok(main.lastIndexOf('refreshWorkerAfterStartup()') > main.indexOf('await finishLaunch({ skipPaint: directStartup })'));
  assert.doesNotMatch(worker.match(/self\.addEventListener\('activate',[\s\S]*?\n\}\);/)?.[0] || '', /caches\.delete/);
});

test('89 percent no longer blocks on optional collection and secondary runtime', () => {
  const main = fs.readFileSync('src/main.js', 'utf8');
  const criticalBoot = main.slice(main.indexOf('async function boot()'), main.indexOf('\nboot();'));
  const visible = criticalBoot.indexOf('await finishLaunch({ skipPaint: directStartup })');
  const background = criticalBoot.indexOf('installPostLaunchFeatures()');
  assert.ok(visible >= 0 && background > visible);
  assert.doesNotMatch(criticalBoot, /await loadSecondaryRuntime\(|await loadBinderRuntime\(|await installCollector\(/);
  assert.match(main, /\['collector', installCollector\]/);
  assert.ok(main.indexOf("['silver-shell', installSilverShell]") < main.indexOf("['collector', installCollector]"));
  assert.match(main, /const liteStartup = startupMode === 'lite'/);
  assert.match(main, /const directStartup = startupMode === 'direct'/);
  assert.match(main, /searchParams\.get\('effects'\) === 'off'/);
});

test('new expansion catalogs are loaded on demand instead of congesting install precache', () => {
  const worker = fs.readFileSync('public/sw.js', 'utf8');
  const generator = fs.readFileSync('scripts/build-precache.mjs', 'utf8');
  assert.doesNotMatch(worker, /CORE\.push\(\.\.\.\[/);
  assert.doesNotMatch(generator, /newSets\.flatMap|\.\.\.extras/);
  assert.match(fs.readFileSync('public/runtime/core.js', 'utf8'), /id:'base1'/);
});
