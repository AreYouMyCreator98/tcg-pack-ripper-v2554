import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const files = [
  'ui/chrome.html', 'ui/screens/rip.html', 'ui/screens/binder.html',
  'ui/screens/bulk.html', 'ui/screens/trade.html', 'ui/screens/profile.html',
  'ui/overlays.html'
];
const html = (await Promise.all(files.map(f => readFile(join(root, f), 'utf8')))).join('\n');

const requiredIds = [
  'rip','binder','bulk','earn','profile','binderGrid','packArt','coins','packs','hits',
  'cardModal','inspectImg','binderStat'
];

test('essential UI contract survives modular extraction', () => {
  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  for (const target of ['rip','binder','bulk','earn','profile']) {
    assert.match(html, new RegExp(`data-s=["']${target}["']`), `missing nav target ${target}`);
  }
});
