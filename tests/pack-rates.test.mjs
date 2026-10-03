import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GOD_PACK_RATE, PACK_RATE_SNAPSHOT, SV_REVERSE_UPGRADES } from '../src/packs/pack-rates.js';

const core = await readFile(new URL('../public/runtime/core.js', import.meta.url), 'utf8');

test('V253 informational rates remain identical to V252 generator constants', () => {
  assert.equal(GOD_PACK_RATE, 0.001);
  assert.match(core, /const GOD_PACK_RATE=0\.001/);
  assert.equal(PACK_RATE_SNAPSHOT.sv.wildcard, 0.012);
  assert.equal(PACK_RATE_SNAPSHOT.swsh.final.holoV, 0.09);
  assert.equal(PACK_RATE_SNAPSHOT.sm.final.ultraRare, 0.075);
  assert.equal(PACK_RATE_SNAPSHOT.xy.wildcard, 0.015);
  assert.equal(SV_REVERSE_UPGRADES.specialIllustrationRare, 0.009);
});
