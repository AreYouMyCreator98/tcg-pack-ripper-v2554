import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bridge = await readFile(new URL('../public/runtime/binder-bridge.js', import.meta.url), 'utf8');
const renderer = await readFile(new URL('../src/screens/binder/binder-renderer.js', import.meta.url), 'utf8');
const inspector = await readFile(new URL('../src/screens/binder/binder-inspector.js', import.meta.url), 'utf8');

test('legacy Binder dependency is isolated behind one bridge', () => {
  assert.match(bridge, /tcgBinderLegacyBridgeV252/);
  assert.match(bridge, /bindRenderer/);
  assert.match(bridge, /bindInspector/);
  assert.doesNotMatch(renderer, /\bstate\b/);
  assert.doesNotMatch(inspector, /\bstate\b/);
});

test('artwork failures cannot delete Binder ownership', () => {
  assert.doesNotMatch(renderer, /delete\s+.*binder|\.qty\s*[-+]=/);
  assert.doesNotMatch(inspector, /delete\s+.*binder|\.qty\s*[-+]=/);
});
