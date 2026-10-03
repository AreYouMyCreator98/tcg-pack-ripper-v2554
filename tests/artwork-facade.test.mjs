import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const artwork = await readFile(new URL('../src/artwork/index.js', import.meta.url), 'utf8');
const binder = await readFile(new URL('../src/systems/binder.js', import.meta.url), 'utf8');
const renderer = await readFile(new URL('../src/screens/binder/binder-renderer.js', import.meta.url), 'utf8');

test('Binder artwork is a real source module, not a legacy runtime facade', () => {
  assert.match(artwork, /getArtworkUrl/);
  assert.match(renderer, /from '..\/..\/artwork\/index\.js'/);
  assert.doesNotMatch(binder, /tcgBinderArtV239|tcgBinderArtV241/);
  assert.doesNotMatch(artwork, /loadSecondaryRuntime/);
});
