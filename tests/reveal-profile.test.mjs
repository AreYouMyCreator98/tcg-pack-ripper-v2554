import test from 'node:test';
import assert from 'node:assert/strict';
import { revealProfile, revealTier } from '../src/animations/packs/reveal-profile.js';

test('reveal intensity follows existing rarity tiers', () => {
  assert.equal(revealTier({ rarity: 'Common' }), 0);
  assert.equal(revealTier({ rarity: 'Double rare' }), 2);
  assert.equal(revealTier({ rarity: 'Illustration rare' }), 3);
  assert.equal(revealTier({ rarity: 'Special illustration rare' }), 4);
  assert.equal(revealTier({ rarity: 'Hyper rare' }), 5);
});

test('God Pack finish overrides reveal intensity without changing tier', () => {
  const profile = revealProfile({ rarity: 'Double rare', finish: '🌟 GOD PACK' });
  assert.equal(profile.tier, 2);
  assert.equal(profile.god, true);
  assert.equal(profile.intensity, 'god');
});
