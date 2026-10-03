import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { packRuntime } from '../src/config/runtime-manifest.js';

const bridge = await readFile(new URL('../public/runtime/pack-bridge.js', import.meta.url), 'utf8');
const engine = await readFile(new URL('../src/packs/pack-engine.js', import.meta.url), 'utf8');
const generator = await readFile(new URL('../src/packs/pack-generator.js', import.meta.url), 'utf8');

test('pack orchestration is isolated behind a tiny compatibility bridge', () => {
  assert.deepEqual(packRuntime, ['runtime/pack-bridge.js']);
  assert.match(bridge, /TCG_PACK_LEGACY/);
  assert.match(engine, /TCG_PACKS/);
  assert.doesNotMatch(engine, /state\.binder|state\.bulkV64|\bmakePack\s*=/);
  assert.doesNotMatch(generator, /Math\.random/);
});

test('Reveal All routes only from current index onward and uses existing route functions', () => {
  assert.match(bridge, /for\(let i=start;i<pulls\.length;i\+\+\)/);
  assert.match(bridge, /addToBulkV64\(c\)/);
  assert.match(bridge, /addToBinderV64\(c\)/);
  assert.match(bridge, /idx=Math\.max\(0,pulls\.length-1\)/);
});
