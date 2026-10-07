/* Run with the environment's Playwright installation and Chromium.
 * Network services are stubbed: this is a viewport/input regression, not live
 * Supabase certification. Every context uses its own synthetic local save. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.V260_TEST_URL||'http://127.0.0.1:5174';
const catalog=JSON.parse(fs.readFileSync('supabase/catalog/sv10.json','utf8'));
const commons=catalog.filter(r=>r.tier===0),hit=catalog.find(r=>r.tier>=4).card;
const seed={coins:1000,xp:10000,packs:25,hits:3,binder:{[hit.id]:{...hit,qty:3,market:25,conditionV161:{centering:96,corners:95,edges:94,surface:96}}},bulkV64:Object.fromEntries(commons.slice(0,8).map(r=>[r.id,{...r.card,qty:20}])),shopV84:{rep:10,deals:0,ledger:[]},starterV199:{eligible:false,total:10,remaining:0,used:10,tutorialShown:true,tutorialPending:false},history:[],gradingV44:{submissions:[],graded:[],openedForGrading:0,tierV56:'standard'}};
const sizes=process.env.V260_TEST_PACKS?[[390,844]]:[[360,800],[390,844],[393,873],[412,915],[430,932],[768,1024],[1440,900]];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const results=[];
 try{for(const [width,height]of sizes){const context=await browser.newContext({viewport:{width,height},isMobile:width<700,hasTouch:width<1000,serviceWorkers:'block',reducedMotion:'reduce'});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const fixture=structuredClone(seed);if(width===1440){const rows=fs.readdirSync('public/catalog').flatMap(name=>JSON.parse(fs.readFileSync('public/catalog/'+name,'utf8'))).slice(0,2500);fixture.binder=Object.fromEntries(rows.map(c=>[c.id,{...c,qty:2,market:1}]));}
  await page.addInitScript(save=>{if(!localStorage.getItem('tcgRipperSave'))localStorage.setItem('tcgRipperSave',JSON.stringify(save));},fixture);
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();if(url.hostname==='api.tcgdex.net'){const id=decodeURIComponent(url.pathname.split('/').at(-1));let body;if(url.pathname.includes('/sets/')){const p='supabase/catalog/'+id+'.json';const cards=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')).map(r=>r.card):catalog.map(r=>r.card);body={id,cardCount:{official:cards.length,total:cards.length},cards};}else body=catalog.find(r=>r.id===id)?.card||{id,rarity:'Common',pricing:{}};return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});}if(/\.(png|webp|jpg)/.test(url.pathname))return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOZkAAAAASUVORK5CYII=','base64')});return route.abort();});
  console.log('START',width,height);await page.goto(base);console.log('DOM loaded');await page.waitForFunction(()=>window.tcgCollector&&!document.documentElement.classList.contains('modern-booting'),{timeout:30000});
  console.log('BOOT ready');if(process.env.V260_TEST_PACKS){await packs(page);await district(page);}assert.equal(await page.locator('.nav button').count(),4);const nav=await page.locator('.nav').boundingBox();assert.ok(nav.y+nav.height<=height+1);
  for(const target of ['binder','earn','profile','rip']){console.log('NAV',target);await page.locator(`.nav [data-s="${target}"]`).click();assert.equal(await page.locator('.screen.active').getAttribute('id'),target);}
  console.log('SETTINGS');await page.locator('#collectorSettings').click();assert.ok(await page.locator('#settings').evaluate(el=>el.classList.contains('show')));await page.locator('#closeProfileSettingsV158').click();
  await page.locator('.nav [data-s="binder"]').click();await page.locator('[data-collection-tab="cards"]').click();assert.ok(await page.locator('#collectorGallery img').count()<=36);assert.equal(await page.locator('#binder .binderModeTabsV147').isVisible(),false);await page.locator('[data-binder-view="book"]').click();assert.equal(await page.locator('#binder').evaluate(el=>el.classList.contains('binder-gallery')),false);await page.locator('[data-binder-view="gallery"]').click();await page.locator('[data-inspect-card]').first().click();await page.locator('[data-inspector-action="favourite"]').click();await page.locator('[data-inspector-action="chase"]').click();await page.locator('article [data-inspector-action="close"]').click();await page.reload();await page.waitForFunction(()=>window.tcgCollector&&!document.documentElement.classList.contains('modern-booting'));assert.equal(await page.evaluate(()=>window.tcgCollectorBridge.state().collectorV260.chases.length),1);
  await page.locator('.nav [data-s="binder"]').click();await page.locator('[data-collection-tab="bulk"]').click();assert.equal(await page.locator('.screen.active').getAttribute('id'),'bulk');
  await page.locator('[data-collection-tab="grading"]').click();assert.ok(await page.locator('[data-binder-panel="grading"]').evaluate(el=>el.classList.contains('active')));
  await page.locator('[data-collection-tab="slabs"]').click();await page.locator('[data-collection-tab="sealed"]').click();await page.locator('#collectorOpenSealed').click();assert.ok(await page.locator('#sealedModalV161').evaluate(el=>el.classList.contains('show')));await page.evaluate(()=>document.getElementById('sealedModalV161').classList.remove('show'));
  await page.locator('[data-collection-tab="master"]').click();await page.locator('[data-master-set="sv10"]').click();await page.waitForSelector('[data-checklist-card]');assert.ok(await page.locator('[data-checklist-card]').count()<=36);
  await page.locator('.nav [data-s="profile"]').click();assert.equal(await page.locator('.profileModeTabsV158 button').count(),4);
  for(const mode of ['overview','progress','customise','stats']){await page.locator(`[data-profile-mode-v160="${mode}"]`).click();assert.ok(await page.locator(`[data-profile-panel-v160="${mode}"]`).evaluate(el=>el.classList.contains('active')));}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'horizontal overflow at '+width);
  if(width===390){await page.locator('.nav [data-s="binder"]').click();await page.locator('[data-collection-tab="cards"]').click();await page.screenshot({path:'/tmp/v260-mobile-collection.png'});}
  if(width===390){const rotated=await page.evaluate(()=>{const s=window.tcgCollectorBridge.state(),before=s.collectorV260.featured.day;s.gameClockV170.anchorReal-=3600000;dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));return s.collectorV260.featured.day>before;});assert.equal(rotated,true);}
  assert.deepEqual(errors,[]);results.push({width,height,passed:true});console.log('PASS',width+'x'+height);await context.close();
 }
 fs.writeFileSync(process.env.V260_TEST_PACKS?'/tmp/v260-gameplay-results.json':'/tmp/v260-browser-results.json',JSON.stringify({engine:'Chromium',externalServices:'stubbed',physicalDevices:false,results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

async function packs(page){
 await page.locator('.nav [data-s="binder"]').click();await page.locator('[data-inspect-card]').first().click();await page.locator('[data-inspector-action="grade"]').click();await page.locator('[data-inspector-action="confirm"]').click();assert.equal(await page.evaluate(()=>window.tcgCollectorBridge.state().gradingV44.submissions.length),1);await page.locator('.nav [data-s="rip"]').click();
 const before=await page.evaluate(()=>{const s=window.tcgCollectorBridge.state();return {packs:s.packs,cash:s.coins,copies:[...Object.values(s.binder),...Object.values(s.bulkV64)].reduce((n,c)=>n+c.qty,0)};});
 await page.locator('#v253FastToggle').click();
 for(const count of [1,10]){
  console.log('PACK scenario',count);await page.locator(`[data-count="${count}"]`).click();await page.locator('#studioOpenPack').click();
  if(count===10){await page.waitForSelector('.ten-results');await page.locator('[data-show-all]').click();assert.equal(await page.locator('.batch-grid [data-recap-card]').count(),100);await page.locator('#v117OpenAnother').click();continue;}
  await page.waitForFunction(expected=>window.TCG_PACK_LEGACY.cards().length===expected,count*10,{timeout:45000});
  await page.waitForFunction(()=>document.getElementById('stage').classList.contains('cardModeV89')||document.getElementById('v128Extract')?.classList.contains('on'));
  if(await page.locator('#studioExtract').isVisible())await page.locator('#studioExtract').click();
  await page.waitForFunction(()=>document.getElementById('stage').classList.contains('cardModeV89'));
  if(count===1){for(let i=0;i<10;i++){
   await page.waitForFunction(()=>document.getElementById('stack').dataset.faceReady==='1'&&!window.v128HeroPlaying&&!window.decisionLock&&Date.now()>=Number(window.v124RareLockUntil||0));
   const current=await page.evaluate(()=>window.TCG_PACK_LEGACY.snapshot().index);
   await page.locator('#studioCollect').click();
   await page.waitForFunction(id=>document.getElementById('v88Summary')||window.TCG_PACK_LEGACY.snapshot().index!==id,current);
  }}
  await page.waitForSelector('.collector-smart-recap');assert.equal(await page.locator('[data-recap-card]').count(),count*10);
  await page.locator('#v117OpenAnother').click();
 }
 const after=await page.evaluate(()=>{const s=window.tcgCollectorBridge.state();return {packs:s.packs,cash:s.coins,copies:[...Object.values(s.binder),...Object.values(s.bulkV64)].reduce((n,c)=>n+c.qty,0)};});
 assert.equal(after.packs-before.packs,11);assert.equal(after.copies-before.copies,110);assert.equal(before.cash-after.cash,88);console.log('PACK PASS: 1 + 10, 110 retained cards, $88 paid once');
}

async function district(page){
 await page.locator('.nav [data-s="binder"]').click();await page.locator('[data-collection-tab="grading"]').click();await page.locator('[data-grade-uid]').first().click();assert.equal(await page.evaluate(()=>window.tcgCollectorBridge.state().gradingV44.graded.length),1);await page.locator('#returnSkipV53').click();await page.locator('#gradeRevealV48 button').filter({hasText:'KEEP IN VAULT'}).click();console.log('GRADING PASS: submission, pack wait, return, slab');
 await page.locator('.nav [data-s="earn"]').click();await page.locator('[data-hub-tab="shops"]').click();await page.locator('[data-contract]:not(:disabled)').first().click();await page.locator('[data-contract-confirm]').click();assert.equal(await page.evaluate(()=>window.tcgCollectorBridge.state().collectorV260.stats.contracts),1);
 await page.locator('#counter84').click();await page.locator('[data-inspect85]').first().click();assert.equal(await page.locator('#universalCardInspector').isVisible(),true);await page.locator('article [data-inspector-action="close"]').click();await page.locator('[data-pct85="1"]').click();await page.locator('#makeOffer85').click();await page.locator('#counterDone85').click();assert.equal(await page.evaluate(()=>window.tcgCollectorBridge.state().collectorV260.district.used.walkin),true);
 await page.locator('#lots84').click();await page.locator('[data-lot="0"]').click();await page.locator('#openLot87').click();await page.locator('#openBinder87').click();await page.locator('#openBinder87').click();await page.locator('#shopDone84').click();assert.equal(await page.evaluate(()=>window.tcgCollectorBridge.state().collectorV260.district.used['auction:0']),true);
 await page.locator('#binderBuy84').click();await page.locator('#binderTake84').click();await page.locator('#shopDone84').click();assert.equal(await page.evaluate(()=>window.tcgCollectorBridge.state().collectorV260.district.used.mystery),true);console.log('DISTRICT PASS: contract, walk-in, auction, mystery collection');await page.locator('.nav [data-s="rip"]').click();
}
