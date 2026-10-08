import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {parseHTML} from 'linkedom';
import {cardImageCandidates,resolveCardImage,setCardAssetManifest,cardFromImageSource,imageQualityForElement,applyCardImage,advanceCardImage,CARD_PLACEHOLDER} from '../src/artwork/card-assets.js';
const urls={thumb:'https://example.supabase.co/storage/v1/object/public/card-assets/cards/sv01/sv01-1/hash/thumb.webp',medium:'https://example.supabase.co/medium.webp',high:'https://example.supabase.co/high.webp'};
const card=Object.freeze({id:'sv01-1',setId:'sv01',img:'https://assets.tcgdex.net/en/sv/sv01/1/high.webp',thumb:'https://assets.tcgdex.net/en/sv/sv01/1/low.webp'});
test('mirror tier preferences preserve immutable card state and source fallback',()=>{
 setCardAssetManifest({version:1,cards:{[card.id]:{set:'sv01',...urls}}});
 const snapshot=JSON.stringify(card);assert.deepEqual(cardImageCandidates(card,'high'),[urls.high,card.img,CARD_PLACEHOLDER]);assert.equal(resolveCardImage(card,'low'),urls.thumb);assert.equal(resolveCardImage(card,'medium'),urls.medium);assert.equal(JSON.stringify(card),snapshot);
 setCardAssetManifest({version:1,cards:{}});assert.equal(resolveCardImage(card,'high'),card.img);
});
test('custom override precedes mirror; local Specials never go through TCGdex',()=>{
 const special={id:'sp_eevee',art:'assets/specials/sp_eevee.webp',artworkOverride:{high:'assets/custom/eevee.webp'}};
 setCardAssetManifest({version:1,cards:{sp_eevee:{set:'specials',...urls}}});
 assert.deepEqual(cardImageCandidates(special,'high'),['assets/custom/eevee.webp',urls.high,special.art,CARD_PLACEHOLDER]);
 setCardAssetManifest({version:1,cards:{}});assert.equal(resolveCardImage(special),special.art);
 assert.equal(resolveCardImage({id:'unknown',img:'javascript:alert(1)'}),CARD_PLACEHOLDER);
});
test('invalid manifest never exposes unsafe sources',()=>{assert.throws(()=>setCardAssetManifest({version:1,cards:{x:{set:'x',thumb:'javascript:alert(1)'}}}));});
test('recognizes actual card URLs only; leaves packs/profile art untouched',()=>{
 assert.equal(cardFromImageSource(card.img).id,card.id);assert.equal(cardFromImageSource('assets/specials/sp_eevee.webp').id,'sp_eevee');
 for(const s of ['assets/packs/sv01.webp','https://assets.tcgdex.net/en/sv/sv01/logo.png','assets/avatar.png'])assert.equal(cardFromImageSource(s),null);
});
test('all tiers are selected by display context; batch cards never inherit high from modal parents',()=>{
 const {document}=parseHTML('<main><section class="collector-modal"><div class="batch-grid"><img id="batch"></div><img id="inspector"></section><div class="pack-top-pulls"><img id="hit"></div><div class="gradeReturnStage"><img id="grade"></div><div class="collector-grid"><img id="collection"></div></main>');
 for(const [id,q] of [['batch','thumb'],['inspector','high'],['hit','medium'],['grade','high'],['collection','thumb']])assert.equal(imageQualityForElement(document.getElementById(id)),q);
});
test('failed mirror advances to source then deliberate placeholder once, with node-local identity',()=>{
 setCardAssetManifest({version:1,cards:{[card.id]:{set:'sv01',...urls}}});
 const {document}=parseHTML('<img>'),img=document.querySelector('img');applyCardImage(img,card,'high');assert.equal(img.src,urls.high);assert.equal(advanceCardImage(img),true);assert.equal(img.src,card.img);advanceCardImage(img);assert.equal(img.src,CARD_PLACEHOLDER);assert.equal(advanceCardImage(img),false);
 setCardAssetManifest({version:1,cards:{}});
});
test('dry run uses only registered catalogue and does not modify manifest',()=>{
 const before=readFileSync('public/card-assets.json','utf8');const p=spawnSync('python3',['scripts/cards/pipeline.py','sync','--dry-run','--set','sv04.5'],{encoding:'utf8'});assert.equal(p.status,0,p.stderr);const report=JSON.parse(p.stdout);assert.equal(report.playableSets,32);assert.equal(report.uniqueCards,6908);assert.equal(report.selected,245);assert.equal(readFileSync('public/card-assets.json','utf8'),before);
 const bad=spawnSync('python3',['scripts/cards/pipeline.py','sync','--dry-run','--set','pitch-black'],{encoding:'utf8'});assert.notEqual(bad.status,0);
});
test('runtime manifest contains only complete public mirrored records from current cards',()=>{
 const m=JSON.parse(readFileSync('public/card-assets.json'));setCardAssetManifest(m);assert.equal(m.version,1);
 const script=readFileSync('scripts/build-precache.mjs','utf8');assert.match(script,/card-unavailable/);assert.doesNotMatch(script,/cards\/.*high.webp/);
});
test('importer validates images, resumes conversion, repairs corrupted tiers and keeps dry-run read-only',()=>{
 const result=spawnSync('python3',['-m','unittest','discover','-s','scripts/cards/tests'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
});

test('shared frames and frameless tiles each expose exactly one card identity',async()=>{
 const {cardImageMarkup}=await import('../src/artwork/card-image.js');
 for(const frameless of [true,false]){
  const {document}=parseHTML('<html><body>'+cardImageMarkup(card,{frameless})+'</body></html>');
  assert.equal(document.querySelectorAll('[data-card-image]').length,1);
  assert.equal(document.querySelector('img').dataset.cardQuality,'thumb');
 }
});

test('legacy source URLs retain subset identities from the mirror manifest',()=>{
 const subset=JSON.parse(readFileSync('public/catalog/swsh12.5.json','utf8')).find(c=>c.id.startsWith('swsh12.5gg-'));
 assert.ok(subset);
 setCardAssetManifest({version:1,cards:{[subset.id]:{set:subset.setId,fallback:subset.img,...urls}}});
 for(const source of [subset.img,subset.thumb+'?_art_retry=1']){
  const resolved=cardFromImageSource(source);assert.equal(resolved.id,subset.id);assert.equal(resolveCardImage(resolved),urls.thumb);
 }
 setCardAssetManifest({version:1,cards:{}});
});
