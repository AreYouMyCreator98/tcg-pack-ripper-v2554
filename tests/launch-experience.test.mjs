import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync('src/main.js','utf8');
const launch = fs.readFileSync('src/app/launch-screen.js','utf8');
const sw = fs.readFileSync('public/sw.js','utf8');
const html = fs.readFileSync('index.html','utf8');

test('branded launch screen exists before module boot', () => {
  assert.match(html, /id="tcgLaunch"/);
  assert.ok(html.indexOf('id="tcgLaunch"') < html.indexOf('src=".\/src\/main.js?v=2554"'));
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
  assert.match(sw, /0\.255\.4/);
  assert.match(sw, /src\/app\/launch-screen\.js/);
  assert.match(sw, /styles\/pack-v254\.css/);
  assert.match(sw, /styles\/multiplayer-v255\.css/);
});

test('network-first startup recovery cannot wait forever on stale runtime', () => {
  assert.match(main, /REFRESHING GAME FILES/);
  assert.match(main, /Startup exceeded 28 seconds/);
  assert.match(sw, /network-first/i);
  assert.match(sw, /cache: 'no-store'/);
});
