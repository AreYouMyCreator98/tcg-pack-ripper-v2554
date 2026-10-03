import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const legacy = fs.readFileSync('public/runtime/multiplayer.js','utf8');
const arena = fs.readFileSync('public/runtime/multiplayer-v255.js','utf8');
const core = fs.readFileSync('public/runtime/core.js','utf8');
const reveal = fs.readFileSync('src/animations/packs/reveal-profile.js','utf8');
const css = fs.readFileSync('public/styles/multiplayer-v255.css','utf8');

test('battle scoring recognizes Holo Rare VMAX and name fallbacks',()=>{
  assert.match(legacy,/holo rare vmax/);
  assert.match(legacy,/battleTierV2553/);
  assert.match(core,/holo rare vmax/);
  assert.match(reveal,/holo rare vmax/);
  assert.match(reveal,/\\bvmax\\b/);
});

test('battle top hit no longer resolves by duplicate id lookup',()=>{
  assert.match(legacy,/topIndex/);
  assert.doesNotMatch(legacy,/top\?clean\.find\(x=>x\.id===top\.id\)/);
});

test('battle generation restores global state and retries safely',()=>{
  assert.match(legacy,/generateBattlePackV2553/);
  assert.match(legacy,/finally\{sel=prev\.sel;pulls=prev\.pulls;idx=prev\.idx;busy=prev\.busy\}/);
  assert.match(legacy,/attempt<2/);
});

test('iOS set selection has direct touch/pointer path without full rerender',()=>{
  assert.match(arena,/commitBattleSetV2553/);
  assert.match(arena,/setGestureStartV2553/);
  assert.match(arena,/touchend/);
  assert.match(css,/touch-action:pan-x/);
});

test('match found renders before profile network hydration',()=>{
  const append = arena.indexOf('document.body.appendChild(o)');
  const fetch = arena.indexOf('fetchProfiles([r.host_id,r.guest_id],{force:true}).then', append);
  assert.ok(append >= 0 && fetch > append);
  assert.match(arena,/MATCH FOUND/);
});

test('mobile battle rip has touch fallback',()=>{
  assert.match(arena,/mobileRipFallbackV2553/);
  assert.match(legacy,/touchmove/);
  assert.match(legacy,/dx>76/);
});
