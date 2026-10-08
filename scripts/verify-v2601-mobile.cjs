/* Run with the environment's Playwright installation and Chromium.
 * Network services are stubbed: this is a viewport/input regression, not live
 * Supabase certification. Every context uses its own synthetic local save. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.V260_TEST_URL||'http://127.0.0.1:5177/?debug';
const allCatalog=fs.readdirSync('public/catalog').flatMap(name=>JSON.parse(fs.readFileSync('public/catalog/'+name,'utf8')));
const catalog=JSON.parse(fs.readFileSync('supabase/catalog/sv10.json','utf8'));
const commons=catalog.filter(r=>r.tier===0),hit=catalog.find(r=>r.tier>=4).card;
const seed={coins:10000,xp:10000,packs:25,hits:3,binder:{[hit.id]:{...hit,qty:3,market:25,conditionV161:{centering:96,corners:95,edges:94,surface:96}}},bulkV64:Object.fromEntries(commons.slice(0,8).map(r=>[r.id,{...r.card,qty:20}])),shopV84:{rep:10,deals:0,ledger:[]},starterV199:{eligible:false,total:10,remaining:0,used:10,tutorialShown:true,tutorialPending:false},history:[],gradingV44:{submissions:[],graded:[],openedForGrading:0,tierV56:'standard'}};
const sizes=[[360,800]];
const device=process.env.V2601_DEVICE||'samsung';
const userAgent=device==='iphone'?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1':'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const [width,height]of sizes){const context=await browser.newContext({viewport:{width,height},userAgent,isMobile:width<700,hasTouch:width<1000,serviceWorkers:'block',reducedMotion:'reduce'});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const fixture=structuredClone(seed);if(width===1440||process.env.V2601_LARGE){const rows=fs.readdirSync('public/catalog').flatMap(name=>JSON.parse(fs.readFileSync('public/catalog/'+name,'utf8'))).slice(0,2500);fixture.binder=Object.fromEntries(rows.map(c=>[c.id,{...c,qty:2,market:1}]));}
  await page.addInitScript(save=>{if(!localStorage.getItem('tcgRipperSave'))localStorage.setItem('tcgRipperSave',JSON.stringify(save));},fixture);
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();if(url.hostname==='api.tcgdex.net'){const id=decodeURIComponent(url.pathname.split('/').at(-1));let body;if(url.pathname.includes('/sets/')){const p='supabase/catalog/'+id+'.json';const cards=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')).map(r=>r.card):catalog.map(r=>r.card);body={id,cardCount:{official:cards.length,total:cards.length},cards};}else body=(()=>{const c=allCatalog.find(c=>c.id===id);return c?{...c,localId:c.number,image:c.img.replace('/high.webp',''),pricing:{}}:{id,rarity:'Common',pricing:{}};})();return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});}if(/\.(png|webp|jpg)/.test(url.pathname))return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOZkAAAAASUVORK5CYII=','base64')});return route.abort();});
  console.log('START',width,height);await page.goto(base);console.log('DOM loaded');await page.waitForFunction(()=>window.tcgCollector&&!document.documentElement.classList.contains('modern-booting'),{timeout:30000});
  console.log('BOOT ready');await packs(page);assert.deepEqual(errors,[]);await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

async function packs(page){
 const read=()=>page.evaluate(()=>{const s=tcgCollectorBridge.state();return{cash:s.coins,packs:s.packs,copies:[...Object.values(s.binder||{}),...Object.values(s.bulkV64||{})].reduce((n,c)=>n+c.qty,0),owned:[...new Set([...Object.keys(s.binder),...Object.keys(s.bulkV64)])]};});
 const instrument=()=>{window.measure={writes:0,long:[]};const raw=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='tcgRipperSave')measure.writes++;return raw.apply(this,arguments)};new PerformanceObserver(list=>measure.long.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:false});};await page.addInitScript(instrument);await page.evaluate(instrument);
 const cdp=await page.context().newCDPSession(page),runs=[];await cdp.send('Performance.enable');
 // Single pack uses the actual reveal/collect controls, including Fast Reveal.
 await page.locator('#v253FastToggle').click();await page.locator('#studioOpenPack').click();
 await page.waitForFunction(()=>document.getElementById('stage').classList.contains('cardModeV89')||document.getElementById('v128Extract')?.classList.contains('on'));
 if(await page.locator('#studioExtract').isVisible())await page.locator('#studioExtract').click();
 for(let i=0;i<10;i++){
  await page.waitForFunction(()=>document.getElementById('stack').dataset.faceReady==='1'&&!window.v128HeroPlaying&&!window.decisionLock&&Date.now()>=Number(window.v124RareLockUntil||0));
  const index=await page.evaluate(()=>TCG_PACK_LEGACY.snapshot().index);await page.locator('#studioCollect').click();await page.waitForFunction(id=>document.getElementById('v88Summary')||TCG_PACK_LEGACY.snapshot().index!==id,index);
 }
 await page.waitForSelector('.single-results');assert.equal(await page.locator('[data-recap-card]').count(),10);
 const viewports=[];
 for(const [width,height] of [[360,800],[390,844],[393,873],[412,915],[430,932],[768,1024],[1440,900]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  const layout=await page.locator('#v88Summary').evaluate(e=>{const r=e.getBoundingClientRect(),cta=e.querySelector('#v117OpenAnother').getBoundingClientRect();return{scroll:e.scrollHeight,client:e.clientHeight,top:r.top,bottom:r.bottom,cta:cta.bottom};});
  assert.ok(layout.scroll<=layout.client+1,JSON.stringify({width,height,layout}));assert.ok(layout.cta<=height-64);assert.equal(await page.locator('.rip-studio-open').isVisible(),false);viewports.push({width,height,...layout});
 }
 await page.setViewportSize({width:360,height:800});await page.screenshot({path:'/tmp/v2601-single.png'});
 await page.locator('.nav [data-s="binder"]').click();assert.equal(await page.locator('#v88Summary').isVisible(),false);await page.locator('.nav [data-s="rip"]').click();assert.equal(await page.locator('#v88Summary').isVisible(),true);
 await page.locator('[data-result-details]').click();assert.equal(await page.locator('#packResultDetails').isVisible(),true);await page.locator('#packResultDetails article [data-close-details]').click();
 await page.locator('[data-recap-card]').first().click();assert.equal(await page.locator('#universalCardInspector').isVisible(),true);await page.locator('article [data-inspector-action="close"]').click();
 await page.locator('#v117OpenAnother').click();assert.equal(await page.locator('#rip').getAttribute('data-rip-state'),'IDLE');
 const first=await read();
 for(let n=0;n<10;n++){
  await page.locator('[data-count="1"]').click();await page.locator('[data-count="10"]').click();
  await page.waitForTimeout(350);const before=await read();await page.evaluate(()=>{measure.writes=0;measure.long=[];});
  // Dispatching twice synchronously verifies the guard even without browser disabled handling.
  await page.evaluate(()=>{document.getElementById('studioOpenPack').click();document.getElementById('studioOpenPack').click();});
  await page.waitForFunction(()=>window.tcgTenPackTimings&&!window.tcgPackTransaction&&document.getElementById('v88Summary'));
  const after=await read();const progress=await page.evaluate(()=>{const result=tcgCollectorBridge.state().lastPackResultV2601;return{count:tcgCollectorBridge.totals()[result.set.id].owned.size,recap:result.recap.current.count,fresh:result.recap.fresh,cards:result.cards.map(c=>c.id)};});assert.equal(progress.count,progress.recap);assert.equal(progress.fresh.length,new Set(progress.cards.filter(id=>!before.owned.includes(id))).size);assert.equal(after.packs-before.packs,10);assert.equal(before.cash-after.cash,80);assert.equal(after.copies-before.copies,100);
  await page.locator('[data-show-all]').click();assert.equal(await page.locator('.batch-grid [data-recap-card]').count(),100);
  const artIds=await page.locator('.batch-grid [data-card-image]').evaluateAll(es=>es.map(e=>e.dataset.cardImage));assert.deepEqual(artIds,await page.evaluate(()=>TCG_PACK_LEGACY.cards().map(c=>c.id)));
  const metrics=await page.evaluate(()=>({timings:tcgTenPackTimings,writes:measure.writes,long:measure.long,nodes:document.getElementById('v88Summary').querySelectorAll('*').length}));
  assert.ok(metrics.writes<=8,JSON.stringify(metrics));assert.ok(metrics.long.every(ms=>ms<1000),JSON.stringify(metrics));
  await cdp.send('HeapProfiler.collectGarbage');const memory=await cdp.send('Performance.getMetrics');metrics.heap=memory.metrics.find(x=>x.name==='JSHeapUsedSize').value;metrics.listeners=memory.metrics.find(x=>x.name==='JSEventListeners').value;runs.push(metrics);
  if(n===0){await page.evaluate(()=>{dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});await page.reload();await page.waitForFunction(()=>window.tcgCollector&&!document.documentElement.classList.contains('modern-booting'));await page.waitForSelector('.ten-results');assert.deepEqual(await read(),after);}
  await page.locator('#v117OpenAnother').click();assert.equal(await page.locator('#v88Summary').count(),0);
 }
 const last=await read();assert.equal(last.copies-first.copies,1000);assert.equal(first.cash-last.cash,800);
 assert.ok(runs.at(-1).listeners<=runs[1].listeners+2,'listener growth');assert.ok(runs.at(-1).heap<runs[1].heap*1.6,'heap growth');
 // Exercise both non-cash payment routes without changing the generator.
 for(const funding of ['starter','sealed']){
  await page.evaluate(funding=>{const s=tcgCollectorBridge.state(),id=TCG_PACK_LEGACY.selectedSet().id;s.coins=0;s.starterV199={eligible:funding==='starter',remaining:funding==='starter'?10:0,used:funding==='starter'?0:10,total:10,tutorialShown:true,tutorialPending:false};s.sealedV161.packCredits[id]=funding==='sealed'?10:0;tcgCollectorBridge.save();},funding);
  const before=await read();await page.locator('#studioOpenPack').click();await page.waitForFunction(()=>!window.tcgPackTransaction&&!!document.getElementById('v88Summary'));
  const after=await read();assert.equal(after.cash,before.cash);assert.equal(after.packs-before.packs,10);assert.equal(after.copies-before.copies,100);
  const remaining=await page.evaluate(()=>({starter:tcgCollectorBridge.state().starterV199.remaining,credits:tcgCollectorBridge.state().sealedV161.packCredits[TCG_PACK_LEGACY.selectedSet().id]}));assert.equal(remaining[funding==='starter'?'starter':'credits'],0);await page.locator('#v117OpenAnother').click();
 }
 await page.locator('.nav [data-s="binder"]').click();await page.locator('[data-collection-tab="cards"]').click();await page.getByRole('button',{name:'SPECIAL COLLECTION',exact:true}).click();
 const specialImages=page.locator('#specialGridV198 img');assert.ok(await specialImages.count()>0);
 await specialImages.first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#specialGridV198 img')?.naturalWidth>0);
 assert.ok(await specialImages.evaluateAll(es=>es.every(e=>{const src=e.getAttribute('src')||'';return src.startsWith('assets/specials/')||(src.includes('/storage/v1/object/public/card-assets/cards/specials/sp_')&&src.endsWith('/thumb.webp'));})));
 await page.locator('[data-special-filter-v198="prismatic"]').click();await specialImages.first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#specialGridV198 img')?.naturalWidth>0);
 await page.screenshot({path:'/tmp/v2601-specials.png'});
 // Real local WebP decoding for all nineteen paths, then an injected failure.
 const images=await page.evaluate(async()=>Promise.all(specialCardsV198.map(c=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve({id:c.id,width:i.naturalWidth});i.onerror=()=>resolve({id:c.id,width:0});i.src=c.art;}))));assert.ok(images.every(x=>x.width>0));
 await specialImages.first().evaluate(img=>{img.src='assets/specials/sp_missing-fixture.webp';});await page.waitForSelector('.specialCardFrameV198.artwork-unavailable');assert.match(await page.locator('.specialCardFrameV198.artwork-unavailable').innerText(),/ARTWORK UNAVAILABLE/);
 const report={engine:'Chromium',deviceSimulation:device,largeCollection:!!process.env.V2601_LARGE,physicalDevices:false,externalServices:'stubbed',viewports,runs,funding:['cash','starter','sealed'],specials:images};fs.writeFileSync('/tmp/v2601-'+device+(process.env.V2601_LARGE?'-large':'')+'-report.json',JSON.stringify(report,null,2));console.log('V260.1 PASS',JSON.stringify(report));
}
