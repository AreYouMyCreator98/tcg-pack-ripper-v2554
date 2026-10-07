/* Run with the environment's Playwright installation and Chromium.
 * Network services are stubbed: this is a viewport/input regression, not live
 * Supabase certification. Every context uses its own synthetic local save. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.V260_TEST_URL||'http://127.0.0.1:5184';
const catalog=JSON.parse(fs.readFileSync('supabase/catalog/sv10.json','utf8'));
const commons=catalog.filter(r=>r.tier===0),hit=catalog.find(r=>r.tier>=4).card;
const seed={coins:1000,xp:10000,packs:25,hits:3,binder:{[hit.id]:{...hit,qty:3,market:25,conditionV161:{centering:96,corners:95,edges:94,surface:96}}},bulkV64:Object.fromEntries(commons.slice(0,8).map(r=>[r.id,{...r.card,qty:20}])),shopV84:{rep:10,deals:0,ledger:[]},starterV199:{eligible:false,total:10,remaining:0,used:10,tutorialShown:true,tutorialPending:false},history:[],gradingV44:{submissions:[],graded:[],openedForGrading:0,tierV56:'standard'}};

// Test-only remote mirror fixture. This does not certify a real Storage upload.
const sample=fs.readFileSync('public/assets/specials/sp_eevee.webp');
const mirror='https://ddeuwrnfmdgvizkrjhii.supabase.co/storage/v1/object/public/card-assets/cards/';
const all=fs.readdirSync('public/catalog').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync('public/catalog/'+f)));
const custom=JSON.parse(fs.readFileSync('public/runtime/special-collection.js','utf8').split('const SPECIAL_CARDS_V198=')[1].split(';')[0]);
const manifest={version:1,cards:Object.fromEntries([...all,...custom].map(c=>[c.id,{set:c.setId||'specials',fallback:c.img||c.art,...Object.fromEntries(['thumb','medium','high'].map(q=>[q,mirror+(c.setId||'specials')+'/'+c.id+'/testhash/'+q+'.webp']))}]))};
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});const page=await context.newPage();const requests=[];page.on('request',r=>{if(r.url().startsWith(mirror))requests.push(r.url());});
  await page.addInitScript(save=>{if(!localStorage.getItem('tcgRipperSave'))localStorage.setItem('tcgRipperSave',JSON.stringify(save));},seed);
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.pathname==='/card-assets.json')return route.fulfill({contentType:'application/json',body:JSON.stringify(manifest)});if(url.origin===new URL(base).origin)return route.continue();if(url.pathname.includes('/storage/v1/object/public/card-assets/'))return route.fulfill({contentType:'image/webp',headers:{'access-control-allow-origin':'*'},body:sample});if(url.hostname==='api.tcgdex.net'){const id=decodeURIComponent(url.pathname.split('/').at(-1));let body;if(url.pathname.includes('/sets/')){const p='supabase/catalog/'+id+'.json';const cards=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')).map(r=>r.card):catalog.map(r=>r.card);body={id,cardCount:{official:cards.length,total:cards.length},cards};}else body=catalog.find(r=>r.id===id)?.card||{id,rarity:'Common',pricing:{}};return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});}if(/\.(png|webp|jpg)/.test(url.pathname))return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOZkAAAAASUVORK5CYII=','base64')});return route.abort();});
await page.goto(base);await page.waitForFunction(()=>window.tcgSilverShell&&!document.documentElement.classList.contains('modern-booting'));
await page.evaluate(()=>window.tcgNavigation.go('collection','cards'));await page.waitForSelector('[data-inspect-card] img');
const first=page.locator('[data-inspect-card] img').first();await first.waitFor();
assert.ok((await first.getAttribute('src')).endsWith('/thumb.webp'));
await page.locator('[data-inspect-card]').first().click();await page.waitForFunction(()=>document.querySelector('.collector-light-card img')?.src.startsWith('blob:'));
assert.ok(requests.some(u=>u.endsWith('/high.webp')),'inspector requests high');
await page.locator('article [data-inspector-action="close"]').click();
assert.equal(await page.evaluate(()=>localStorage.getItem('tcgRipperSave').includes('/storage/v1/object/public/card-assets/')),false,'presentation URLs never enter player save');
await first.evaluate(e=>e.dispatchEvent(new Event('error')));assert.ok((await first.getAttribute('src')).includes('assets.tcgdex.net'),'failed mirror advances to source');
await page.getByRole('button',{name:'SPECIAL COLLECTION',exact:true}).click();await page.waitForSelector('.specialCardFrameV198 img');
assert.ok((await page.locator('.specialCardFrameV198 img').first().getAttribute('src')).endsWith('/thumb.webp'));
await page.locator('.specialCardFrameV198 img').first().evaluate(e=>e.dispatchEvent(new Event('error')));
assert.ok((await page.locator('.specialCardFrameV198 img').first().getAttribute('src')).includes('assets/specials/'),'custom falls back locally');
console.log('PASS mirrored collection thumb, inspector high, source fallback, custom fallback, save independence');
await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
