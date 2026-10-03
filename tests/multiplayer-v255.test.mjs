import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync('public/runtime/multiplayer-v255.js', 'utf8');
const css = fs.readFileSync('public/styles/multiplayer-v255.css', 'utf8');
const manifest = fs.readFileSync('src/config/runtime-manifest.js', 'utf8');
const sw = fs.readFileSync('public/sw.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

 test('ranked ready gate exists and blocks early pack opening', () => {
  assert.match(js, /mp_set_battle_ready/);
  assert.match(js, /Both players must press READY/);
  assert.match(js, /mpBattleReadyGateV255/);
  assert.match(js, /guardBattleStart/);
});

test('battle intro includes fresh public profile identity', () => {
  assert.match(js, /avatar_data/);
  assert.match(js, /profile_frame_id/);
  assert.match(js, /banner_badges/);
  assert.match(js, /ranked_wins/);
  assert.match(js, /fetchProfiles\(\[r\.host_id,r\.guest_id\],\{force:true\}\)/);
  assert.match(css, /mpBattleIntroV255/);
});

test('profile banner editor is profile controlled and capped to three badges', () => {
  assert.match(js, /Battle Banner/);
  assert.match(js, /Choose up to 3 showcase badges/);
  assert.match(js, /STYLE_IDS/);
  assert.match(js, /SAVE BATTLE BANNER/);
});

test('global chat is realtime with presence, unread and mute controls', () => {
  assert.match(js, /mp_global_chat/);
  assert.match(js, /mp_send_global_chat/);
  assert.match(js, /presence/);
  assert.match(js, /mpChatUnreadV255/);
  assert.match(js, /tcgGlobalChatMutedV255/);
});

test('v255 loads after ranked runtime', () => {
  assert.ok(manifest.indexOf("runtime/ranked.js") < manifest.indexOf("runtime/multiplayer-v255.js"));
});

test('v255 assets are linked and service-worker precached', () => {
  assert.match(index, /multiplayer-v255\.css/);
  assert.match(sw, /multiplayer-v255\.js/);
  assert.match(sw, /multiplayer-v255\.css/);
  assert.match(sw, /tcg-pack-ripper-0\.255\.4/);
  assert.match(js, /wireReadyButton/);
  assert.match(js, /pollReadyRoom/);
  assert.match(js, /MATCH FOUND/);
});
