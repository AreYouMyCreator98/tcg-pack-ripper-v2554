import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync('src/main.js','utf8');
const launch = fs.readFileSync('src/app/launch-screen.js','utf8');
const sw = fs.readFileSync('public/sw.js','utf8');
const html = fs.readFileSync('index.html','utf8');

test('branded launch screen exists before module boot', () => {
  assert.match(html, /id="tcgLaunch"/);
  assert.ok(html.indexOf('id="tcgLaunch"') < html.indexOf('src=".\/src\/main.js?v=2600"'));
});

test('boot suppresses achievement visuals until ready', () => {
  assert.match(launch, /v163UnlockBurst/);
  assert.match(launch, /__TCG_BOOT_PHASE__/);
});

test('first frame is prewarmed before launch completes', () => {
  assert.match(main, /prewarmFirstFrame/);
  assert.ok(main.indexOf('prewarmFirstFrame') < main.indexOf('finishLaunch'));
});

test('service worker cache and launch module are current', () => {
  assert.match(sw, /0\.260\.0/);
  assert.match(sw, /src\/app\/launch-screen\.js/);
  assert.match(sw, /styles\/pack-v254\.css/);
  assert.match(sw, /styles\/trade-hub\.css/);
});

test('network-first startup recovery cannot wait forever on stale runtime', () => {
  assert.match(main, /REFRESHING GAME FILES/);
  assert.match(main, /Startup exceeded 28 seconds/);
  assert.match(sw, /network-first/i);
  assert.match(sw, /cache: 'no-store'/);
});

// Chromium reports an attribute mutation even for removing an absent class.
// A boot observer must therefore avoid writing its own observed class repeatedly.
test('achievement suppression is idempotent under repeated boot observation', async () => {
  const {parseHTML}=await import('linkedom');
  const {window}=parseHTML('<html><body><div id="v163UnlockBurst" class="show"></div></body></html>');
  const prior={window:globalThis.window,document:globalThis.document,MutationObserver:globalThis.MutationObserver};
  let callback,removals=0;
  globalThis.window=window;globalThis.document=window.document;
  globalThis.MutationObserver=class {constructor(fn){callback=fn;}observe(){}disconnect(){}};
  const el=window.document.getElementById('v163UnlockBurst'),remove=el.classList.remove.bind(el.classList);
  el.classList.remove=(...args)=>{removals++;remove(...args);};
  try {const module=await import('../src/app/launch-screen.js');module.beginLaunch();for(let i=0;i<10;i++)callback();assert.equal(removals,1);}
  finally {Object.assign(globalThis,prior);}
});
