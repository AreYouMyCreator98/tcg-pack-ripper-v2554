import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('secondary runtime remains non-blocking after app ready', () => {
  const ready = main.indexOf('tcg:app-ready');
  const secondary = main.indexOf('scheduleSecondaryRuntime()');
  assert.ok(ready >= 0 && secondary > ready);
});

test('Binder module is installed before critical runtime starts', () => {
  const binder = main.indexOf('installBinderModule()');
  const critical = main.indexOf('await loadCriticalRuntime()');
  assert.ok(binder >= 0 && critical > binder);
});

test('rank-frame image renderer replaces the old artwork-runtime dependency', () => {
  assert.match(main, /installRankFrameRenderer\(\)/);
});

test('modular pack engine is additive and cannot gate legacy startup', () => {
  const critical = main.indexOf('await loadCriticalRuntime()');
  const pack = main.indexOf('await loadPackRuntime()');
  const ready = main.indexOf('tcg:app-ready');
  assert.ok(critical >= 0 && pack > critical && ready > pack);
  assert.match(main, /Modular pack engine unavailable; using legacy pack flow/);
});
