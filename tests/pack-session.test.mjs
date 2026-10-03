import test from 'node:test';
import assert from 'node:assert/strict';
import { PackSession } from '../src/packs/pack-session.js';

function pack(rarity = 'Common', finish = '') {
  return Array.from({ length: 10 }, (_, i) => ({ id: `${rarity}-${i}`, rarity: i === 9 ? rarity : 'Common', market: i === 9 ? 10 : .1, finish: i === 9 ? finish : '' }));
}

test('session tracks hit streaks without changing pack outcomes', () => {
  const s = new PackSession({ packsSinceSirPlus: 4, packsSinceGod: 12 });
  s.recordPack({ cards: pack('Double rare'), cashSpent: 8 });
  s.recordPack({ cards: pack('Special illustration rare'), cashSpent: 8 });
  const x = s.snapshot();
  assert.equal(x.session.packs, 2);
  assert.equal(x.session.hits, 2);
  assert.equal(x.session.sirPlusPacks, 1);
  assert.equal(x.session.cashSpent, 16);
  assert.equal(x.persistent.packsSinceSirPlus, 0);
  assert.equal(x.persistent.hitStreak, 2);
});

test('God Pack counter resets only when generated pack is marked God Pack', () => {
  const s = new PackSession({ packsSinceGod: 99 });
  s.recordPack({ cards: pack('Double rare', '🌟 GOD PACK'), godPack: true });
  const x = s.snapshot();
  assert.equal(x.persistent.packsSinceGod, 0);
  assert.equal(x.persistent.lifetimeGodPacks, 1);
});

test('collection tracking counts new ownership separately from copies', () => {
  const s = new PackSession();
  s.recordCollection({ route: 'binder', wasNew: true });
  s.recordCollection({ route: 'binder', wasNew: false });
  s.recordCollection({ route: 'bulk', wasNew: true });
  const x = s.snapshot().session;
  assert.equal(x.collected, 3);
  assert.equal(x.uniqueAdded, 2);
  assert.equal(x.binderAdded, 2);
  assert.equal(x.bulkAdded, 1);
});


test('session best pull never downgrades rarity tier for a higher market price', () => {
  const s = new PackSession();
  const chase = pack('Special illustration rare');
  chase[9].market = 20;
  const lower = pack('Double rare');
  lower[9].market = 500;
  s.recordPack({ cards: chase });
  s.recordPack({ cards: lower });
  const best = s.snapshot().session.best;
  assert.equal(best.rarity, 'Special illustration rare');
  assert.equal(best.tier, 4);
});

test('session value can reconcile generation-time placeholders to final resolved value', () => {
  const s = new PackSession();
  const placeholder = Array.from({ length: 10 }, (_, i) => ({ id: `p-${i}`, rarity: 'Common', market: .1 }));
  s.recordPack({ cards: placeholder, cashSpent: 8 });
  assert.ok(Math.abs(s.snapshot().session.valueGenerated - 1) < 1e-9);
  s.reconcileOpeningValue(1, 12.34);
  assert.equal(s.snapshot().session.valueGenerated, 12.34);
});
