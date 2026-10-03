import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGeneratedPack, generatedPackMeta } from '../src/packs/pack-generator.js';

const ten = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, rarity: i === 9 ? 'Ultra Rare' : 'Common' }));

test('pack generator contract requires exactly ten awarded cards', () => {
  assert.equal(validateGeneratedPack(ten).ok, true);
  assert.equal(validateGeneratedPack(ten.slice(0, 9)).ok, false);
});

test('generator metadata is descriptive only', () => {
  const meta = generatedPackMeta({ cards: ten, cashSpent: 8, starterUsed: 0, creditsUsed: 0 });
  assert.equal(meta.valid.ok, true);
  assert.equal(meta.cashSpent, 8);
  assert.equal(meta.hit, true);
});
