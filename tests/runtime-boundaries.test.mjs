import test from 'node:test';
import assert from 'node:assert/strict';
import { criticalRuntime, binderRuntime, packRuntime, secondaryRuntime } from '../src/config/runtime-manifest.js';

test('optional systems never gate startup', () => {
  assert.equal(criticalRuntime.includes('runtime/artwork.js'), false);
  assert.equal(criticalRuntime.includes('runtime/multiplayer.js'), false);
  assert.equal(criticalRuntime.includes('runtime/ranked.js'), false);
  assert.equal(secondaryRuntime.includes('runtime/artwork.js'), false);
  assert.equal(binderRuntime.includes('runtime/binder-bridge.js'), true);
  assert.deepEqual(packRuntime, ['runtime/pack-bridge.js']);
  assert.equal(criticalRuntime.includes('runtime/pack-bridge.js'), false);
});

test('critical runtime order remains compatible with legacy globals', () => {
  assert.deepEqual(criticalRuntime, [
    'runtime/core.js',
    'runtime/progression.js',
    'runtime/special-collection.js',
    'runtime/packs.js'
  ]);
});
