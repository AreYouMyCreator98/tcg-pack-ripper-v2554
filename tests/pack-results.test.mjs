import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizePackCards, bestCard } from '../src/packs/pack-results.js';

test('recap flags missing, invalid, and minimum fallback prices as estimates', () => {
  const result = summarizePackCards([{market:0}, {market:NaN}, {market:0.1}, {market:4}]);
  assert.equal(result.estimatedCards, 3);
  assert.ok(Math.abs(result.value - 4.3) < 1e-9);
  assert.equal(summarizePackCards([{market:4}]).estimatedCards, 0);
});

const cards = [
  { id: 'a', rarity: 'Common', market: .1 },
  { id: 'b', rarity: 'Double rare', market: 2 },
  { id: 'c', rarity: 'Special illustration rare', market: 45 },
  { id: 'd', rarity: 'Rare', market: .25 }
];

test('pack recap reports binder, bulk, hit and value totals', () => {
  const result = summarizePackCards(cards, c => ['a','d'].includes(c.id) ? 'bulk' : 'binder');
  assert.equal(result.cards, 4);
  assert.equal(result.bulk, 2);
  assert.equal(result.binder, 2);
  assert.equal(result.hits, 2);
  assert.equal(result.sirPlus, 1);
  assert.equal(result.value, 47.35);
});

test('best pull prioritises rarity tier before market value', () => {
  assert.equal(bestCard(cards).id, 'c');
});
