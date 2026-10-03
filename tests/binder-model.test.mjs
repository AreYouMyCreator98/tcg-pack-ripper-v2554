import test from 'node:test';
import assert from 'node:assert/strict';
import { binderEntries, binderStats, filterBinderCards, paginateBinder } from '../src/screens/binder/binder-model.js';

function cards(count) {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => {
    const id = `sv-test-${index + 1}`;
    return [id, { id, name: `Card ${index + 1}`, set: 'Test Set', qty: 1, rarity: index % 5 ? 'Rare' : 'Ultra Rare' }];
  }));
}

test('172 unique Binder cards create 20 nine-slot pages', () => {
  const list = binderEntries(cards(172));
  const page = paginateBinder(list, 19, 9);
  assert.equal(page.totalPages, 20);
  assert.equal(page.page, 19);
  assert.equal(page.cards.length, 1);
});

test('duplicates remain one Binder slot while total quantity stacks', () => {
  const binder = cards(3);
  binder['sv-test-1'].qty = 7;
  const list = binderEntries(binder);
  const stats = binderStats(list);
  assert.equal(stats.unique, 3);
  assert.equal(stats.total, 9);
});

test('filtering/sorting never mutates Binder card records', () => {
  const binder = cards(6);
  const before = structuredClone(binder);
  const list = filterBinderCards(binderEntries(binder), { query: 'Card', set: 'Test Set', tier: c => c.rarity === 'Ultra Rare' ? 3 : 1 });
  assert.equal(list.length, 6);
  assert.deepEqual(binder, before);
});
