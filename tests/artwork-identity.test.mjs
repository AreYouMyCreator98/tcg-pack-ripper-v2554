import test from 'node:test';
import assert from 'node:assert/strict';
import { artworkCacheKey, cardIdentity, cleanArtworkSource, isCardBackSource } from '../src/artwork/card-identity.js';

test('artwork cache keeps V239-compatible keys', () => {
  const card = { id: 'sv04.5-91', name: 'Example ex', setId: 'sv04.5', number: '91' };
  assert.equal(artworkCacheKey(card, 'low'), `v239|low|${cardIdentity(card)}`);
});

test('generic card backs are never accepted as front artwork', () => {
  assert.equal(isCardBackSource('https://example.com/pokemon-card-back.png'), true);
  assert.equal(cleanArtworkSource('https://example.com/pokemon-card-back.png'), '');
  assert.equal(isCardBackSource('assets/specials/custom-front.webp'), false);
});
