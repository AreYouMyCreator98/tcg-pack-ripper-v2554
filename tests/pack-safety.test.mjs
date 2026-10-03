import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const core = await readFile(new URL('../public/runtime/core.js', import.meta.url), 'utf8');
const bridge = await readFile(new URL('../public/runtime/pack-bridge.js', import.meta.url), 'utf8');
const reveal = await readFile(new URL('../src/animations/packs/reveal-controller.js', import.meta.url), 'utf8');

test('single pack generator remains exactly ten cards and owns payment', () => {
  assert.match(core, /if\(out\.length!==10\)\{for\(let fill=0;out\.length<10&&fill<10;fill\+\+\)add\(P\.all\);out=out\.slice\(0,10\)\}/);
  assert.match(core, /payForPackV161\(sel\.id\);pulls=out;state\.packs\+\+/);
  assert.doesNotMatch(bridge, /payForPackV161\s*\(/);
});

test('ten-pack batch remains exactly ten calls to the proven pack generator', () => {
  assert.match(core, /for\(let n=0;n<10;n\+\+\)\{let ok=await makePack\(\)/);
  assert.match(core, /flat\.push\(\.\.\.group\)/);
});

test('Reveal All starts at the currently displayed card and never calls payment', () => {
  assert.match(bridge, /const start=Math\.max\(0,Number\(idx\|\|0\)\)/);
  assert.match(bridge, /for\(let i=start;i<pulls\.length;i\+\+\)/);
  assert.doesNotMatch(bridge, /payForPackV161\s*\(/);
});

test('card-specific reveal identity is tied to awarded card id and index', () => {
  assert.match(reveal, /const key = `\$\{card\.id \|\| ''\}\|\$\{detail\.index \?\? ''\}`/);
  assert.match(reveal, /stack\.dataset\.v254CardKey = key/);
  assert.match(reveal, /img\.dataset\.v254CardKey = key/);
});
