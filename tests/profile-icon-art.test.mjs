import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {ACHIEVEMENT_ART,BADGE_ART,achievementIconFor,badgeIconFor,badgeLabelFor,collectorIconUrl,installProfileIconArt} from '../src/screens/profile/icon-art.js';
import {banner} from '../src/trade-hub/view.js';

const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const badgeBlock=source.split('const BADGE_DEFS=[')[1].split('function totalJobs()')[0];
const achievementBlock=source.split('const ACHIEVEMENTS=[')[1].split('function updateBadges()')[0];
const badgeNames=[...badgeBlock.matchAll(/\['[^']+','([^']+)'/g)].map(m=>m[1]);
const achievementNames=[...achievementBlock.matchAll(/\['a\d\d','([^']+)'/g)].map(m=>m[1]);
const extension=await readFile(new URL('../public/runtime/progression.js',import.meta.url),'utf8');
const extraBadgeBlock=extension.split('const EXTRA_BADGES_V163=[')[1].split('EXTRA_BADGES_V163.forEach')[0];
const extraAchievementBlock=extension.split('const EXTRA_ACHIEVEMENTS_V163=[')[1].split('EXTRA_ACHIEVEMENTS_V163.forEach')[0];
const extraBadgeNames=[...extraBadgeBlock.matchAll(/\['[^']+','([^']+)'/g)].map(m=>m[1]);
const extraAchievementNames=[...extraAchievementBlock.matchAll(/\['a\d+','([^']+)'/g)].map(m=>m[1]);

test('every achievement and core badge has matching generated art without changing reward definitions',async()=>{
 assert.equal(achievementNames.length,59);assert.equal(extraAchievementNames.length,50);
 assert.equal(badgeNames.length,15);assert.equal(extraBadgeNames.length,20);
 assert.deepEqual(Object.keys(ACHIEVEMENT_ART).sort(),[...achievementNames,...extraAchievementNames].sort());
 assert.deepEqual(Object.keys(BADGE_ART).sort(),[...badgeNames,...extraBadgeNames].sort());
 const arts=new Set([...Object.values(ACHIEVEMENT_ART),...Object.values(BADGE_ART)].map(v=>v.art));
 for(const art of arts){
   assert.match(collectorIconUrl(art),/^assets\/icons\/collector\/[a-z]+\.png$/);
   const file=new URL(`../public/${collectorIconUrl(art)}`,import.meta.url);
   assert.ok((await stat(file)).size>1000,`${art} should have an image`);
 }
 assert.equal(achievementIconFor('Cardboard Legend').art,'pack');
 assert.equal(badgeIconFor('CHASE LORD').tier,4);
 assert.equal(badgeIconFor('hit100').art,'chase');
 assert.equal(badgeLabelFor('packMythV163'),'PACK MYTH');
});

test('profile artwork replaces emojis for earned and locked rewards and survives rerenders',async()=>{
 const {window,document}=parseHTML(`<html><head><base href="https://example.test/tcg-pack-ripper-v2554/"></head><body><main id="profile"><div id="badges"><div class="badge earned"><i>🎴</i><b>FIRST RIP</b></div><div class="badge lockedBadge"><i>◆</i><b>TCG ICON</b></div></div><div id="achievementGrid"><div class="achievement done"><div class="achIcon">🎴</div><div><b>First Tear</b></div></div><div class="achievement"><div class="achIcon">◆</div><div><b>Dream Card</b></div></div></div><div id="v163Milestones"><div class="v163Milestone"><i>◆</i><div><b>Perfect Vault</b></div></div></div><div id="v163Recent"><div class="v163Milestone"><i>🎴</i></div></div><div id="v163Daily"><div class="v163DailyRow"><div><b>✨ HIT HUNT</b></div></div></div><span class="rewardBinderIconV197">📘</span></main></body></html>`);
 const art=installProfileIconArt(document,window);
 const badges=[...document.querySelectorAll('.badge')],achievements=[...document.querySelectorAll('.achievement')];
 assert.match(badges[0].querySelector('img').src,/collector\/pack\.png$/);
 assert.match(badges[1].querySelector('img').src,/collector\/level\.png$/);
 assert.equal(badges[1].dataset.customIconTier,'4');
 assert.match(achievements[0].querySelector('img').src,/collector\/pack\.png$/);
 assert.match(achievements[1].querySelector('img').src,/collector\/chase\.png$/);
 assert.match(document.querySelector('.rewardBinderIconV197 img').src,/collector\/binder\.png$/);
 assert.match(document.querySelector('#v163Milestones i img').src,/collector\/slab\.png$/);
 assert.match(document.querySelector('#v163Recent i img').src,/collector\/pack\.png$/);
 assert.match(document.querySelector('#v163Daily b img').src,/collector\/hit\.png$/);
 const firstImg=achievements[0].querySelector('img');art.refresh();assert.equal(achievements[0].querySelector('img'),firstImg);
 document.querySelector('#achievementGrid').innerHTML='<div class="achievement done"><div class="achIcon">💎</div><b>Monster Pull</b></div>';
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.match(document.querySelector('.achievement .achIcon img').src,/collector\/chase\.png$/);
 art.dispose();
});

test('collector banners show original badge emblems instead of generic star glyphs',()=>{
 const markup=banner({name:'Angus',title:'Collector',rp:120,badges:['first','icon'],show_record:false});
 assert.equal((markup.match(/collector-banner-badge-icon/g)||[]).length,2);
 assert.doesNotMatch(markup,/✦/);
 assert.match(markup,/collector\/level\.png/);
 assert.match(markup,/collector\/pack\.png/);
});
