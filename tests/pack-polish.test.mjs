import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const hud = await readFile(new URL('../src/packs/pack-hud.js', import.meta.url), 'utf8');
const engine = await readFile(new URL('../src/packs/pack-engine.js', import.meta.url), 'utf8');
const summary = await readFile(new URL('../src/animations/packs/pack-summary.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/styles/pack-v253.css', import.meta.url), 'utf8');

test('live HUD is mounted to Rip screen instead of hidden at top of stage', () => {
  assert.match(hud, /const rip = el\('rip'\)/);
  assert.match(hud, /rip\.appendChild\(hud\)/);
  assert.doesNotMatch(hud, /stage\.appendChild\(hud\)/);
  assert.match(css, /#rip\.active #v253PackHUD\{top:190px/);
});

test('Reveal All copy describes uncollected cards accurately', () => {
  assert.match(hud, /`\$\{remaining\} TO COLLECT`/);
  assert.doesNotMatch(hud, /CARDS LEFT/);
});

test('session value reconciles final resolved opening value before recap renders', () => {
  const reconcile = engine.indexOf('session.reconcileOpeningValue(openingGeneratedValue, resolvedOpeningValue)');
  const render = engine.indexOf('renderV253Summary(detail');
  assert.ok(reconcile >= 0 && render > reconcile);
  assert.match(engine, /openingGeneratedValue = 0/);
});

test('mobile summary hides duplicate legacy stats and demotes reset action', () => {
  assert.match(summary, /wrap\.classList\.add\('v253SummaryActive'\)/);
  assert.match(css, /#rip #v88Summary\.v253SummaryActive \.v88Stats\{display:none!important\}/);
  assert.match(css, /#rip #v88Summary\.v253SummaryActive \.v253ResetSession/);
  assert.match(css, /body:has\(#rip #v88Summary\.v253SummaryActive\) \.nav\{opacity:0!important/);
});


test('V253.2 collector HUD is one bottom glass pill and hides during card activity', () => {
  assert.match(hud, /function syncHudVisibility\(\)/);
  assert.match(hud, /stage\.classList\.contains\('cardModeV89'\)/);
  assert.match(hud, /hud\.classList\.toggle\('v253HudHidden', hidden\)/);
  assert.match(css, /#rip\.active #v253PackHUD\{[\s\S]*bottom:max\(142px/);
  assert.match(css, /grid-template-columns:auto repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /background:rgba\(255,255,255,.88\)/);
  assert.match(css, /#rip\.active #v253PackHUD\.v253HudHidden/);
});

test('V253.2 completed opening starts with card fan and scrolls to Open Another', () => {
  assert.match(summary, /wrap\.scrollTop = 0/);
  assert.match(css, /#rip #v88Summary\.v253SummaryActive \.v88Fan\{[\s\S]*order:0!important/);
  assert.match(css, /#rip #v88Summary\.v253SummaryActive \.v253Recap\{[\s\S]*order:1!important/);
  assert.match(css, /#rip #v88Summary\.v253SummaryActive #v117OpenAnother\{[\s\S]*order:2!important/);
});

test('Android extraction compositor keeps pulled cards behind the pack wrapper', () => {
  assert.match(css, /#v128Extract\{[\s\S]*isolation:isolate!important/);
  assert.match(css, /#v128Extract \.v128Wrapper\{[\s\S]*z-index:30!important/);
  assert.match(css, /#v128Extract \.v128Cards\{[\s\S]*z-index:20!important/);
  assert.match(css, /html\[data-platform="android"\] #v128Extract \.v128Wrapper/);
});
