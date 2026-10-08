/* Run with the environment's Playwright installation and Chromium.
 * Network services are stubbed: this is a viewport/input regression, not live
 * Supabase certification. Every context uses its own synthetic local save. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.V260_TEST_URL||'http://127.0.0.1:5187';
const catalog=JSON.parse(fs.readFileSync('supabase/catalog/sv10.json','utf8'));
const commons=catalog.filter(r=>r.tier===0),hit=catalog.find(r=>r.tier>=4).card;
const seed={coins:1000,xp:10000,packs:25,hits:3,binder:{[hit.id]:{...hit,qty:3,market:25,conditionV161:{centering:96,corners:95,edges:94,surface:96}}},bulkV64:Object.fromEntries(commons.slice(0,8).map(r=>[r.id,{...r.card,qty:20}])),shopV84:{rep:10,deals:0,ledger:[]},starterV199:{eligible:false,total:10,remaining:0,used:10,tutorialShown:true,tutorialPending:false},history:[],gradingV44:{submissions:[],graded:[],openedForGrading:0,tierV56:'standard'}};
if(process.env.SEALED_STRESS)seed.binder=Object.fromEntries(Array.from({length:5000},(_,i)=>['stress-'+i,{...hit,id:'stress-'+i,qty:1,market:25}]));
const sizes=process.env.V260_TEST_PACKS?[[390,844]]:[[360,800],[390,844],[393,873],[412,915],[430,932],[768,1024],[1440,900]];

(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const results=[];
try{for(const [width,height] of sizes){const context=await browser.newContext({viewport:{width,height},isMobile:width<700,hasTouch:true,colorScheme:width===412?'dark':'light',serviceWorkers:'block',reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(save=>{if(!localStorage.getItem('tcgRipperSave'))localStorage.setItem('tcgRipperSave',JSON.stringify(save));},seed);
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();if(url.hostname==='api.tcgdex.net'){const id=decodeURIComponent(url.pathname.split('/').at(-1));let body;if(url.pathname.includes('/sets/')){const p='supabase/catalog/'+id+'.json';const cards=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')).map(r=>r.card):catalog.map(r=>r.card);body={id,cardCount:{official:cards.length,total:cards.length},cards};}else body=catalog.find(r=>r.id===id)?.card||{id,rarity:'Common',pricing:{}};return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});}if(/\.(png|webp|jpg)/.test(url.pathname))return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOZkAAAAASUVORK5CYII=','base64')});return route.abort();});

await page.goto(base);await page.waitForFunction(()=>window.tcgSealed&&!document.documentElement.classList.contains('modern-booting'));
const openMs=await page.evaluate(()=>{const t=performance.now();document.querySelector('[data-silver-action="3"]').click();return performance.now()-t;});await page.waitForSelector('#sealedModalV161.show');
assert.equal(await page.locator('.sealedPrismV183').count(),0);assert.ok(await page.locator('.sealed-room').isVisible());
const selected=await page.evaluate(()=>tcgCollectorBridge.selectedSet());assert.equal(await page.locator('#sealedSet').inputValue(),selected);
const key=selected+'|pack';
const before=await page.evaluate(()=>({coins:tcgCollectorBridge.state().coins,inventory:tcgCollectorBridge.state().sealedV161.inventory}));
await page.locator(`[data-buy="${key}"]`).click();await page.locator('#sealedConfirm').evaluate(b=>{b.click();b.click();});await page.waitForFunction(()=>!document.getElementById('sealedInspectModalV179').classList.contains('show'));
const bought=await page.evaluate(key=>({qty:tcgCollectorBridge.state().sealedV161.inventory[key],coins:tcgCollectorBridge.state().coins}),key);assert.equal(bought.qty,(before.inventory[key]||0)+1);assert.ok(bought.coins<before.coins);
await page.locator(`[data-display="${key}"]`).click();assert.equal(await page.evaluate(key=>tcgCollectorBridge.state().sealedV161.display[key],key),1);
await page.emulateMedia({reducedMotion:width===390?'no-preference':'reduce'});await page.locator('.sealed-shelf [data-inspect]').first().click();await page.locator('[data-act="favourite"]').click();assert.equal(await page.locator('[data-act="favourite"]').getAttribute('aria-pressed'),'true');
if(width===390){const r=await page.locator('.sealed-studio').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+30,r.y+r.height/2);assert.ok((await page.locator('.sealed-studio .sealed-photo').getAttribute('style')).includes('rotateY'));await page.locator('.sealed-studio').dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();assert.ok(!(await page.locator('.sealed-studio .sealed-photo').getAttribute('style')).includes('rotateY'));}
await page.locator('input[aria-label="Product zoom"]').fill('1.5');await page.locator('input[aria-label="Product zoom"]').dispatchEvent('input');assert.ok((await page.locator('.sealed-studio .sealed-photo').getAttribute('style')).includes('1.5'));
await page.locator('[data-act="display"]').click();await page.locator('[data-act="open"]').click();assert.ok((await page.locator('.sealed-detail').textContent()).includes('exactly 1'));await page.locator('#sealedConfirm').click();
assert.equal(await page.evaluate(key=>tcgCollectorBridge.state().sealedV161.inventory[key]||0,key),before.inventory[key]||0);
assert.equal(await page.evaluate(set=>tcgCollectorBridge.state().sealedV161.packCredits[set],selected),1);
await page.locator(`[data-buy="${key}"]`).click();await page.locator('#sealedConfirm').click();await page.locator(`[data-inspect="${key}"]`).click();await page.locator('[data-act="sell"]').click();await page.locator('#sealedConfirm').click();
await page.locator(`[data-inspect="${selected}|etb"]`).click();assert.ok((await page.locator('.sealed-detail').textContent()).includes('LEGACY CUSTOM PRODUCT'));assert.equal(await page.locator('.sealed-studio img').getAttribute('src'),'assets/ui/sealed-unavailable.svg');await page.locator('#sealedInspectCloseV179').click();
await page.locator(`[data-inspect="${key}"]`).click();await page.locator('.sealed-studio img').evaluate(img=>{img.dispatchEvent(new Event('error'));});assert.equal(await page.locator('.sealed-studio img').getAttribute('src'),'assets/ui/sealed-unavailable.svg');assert.ok(await page.locator('.sealed-studio .sealed-image-status').isVisible());await page.locator('#sealedInspectCloseV179').click();
const fit=await page.locator('.sealed-room').evaluate(e=>({width:e.getBoundingClientRect().width,scroll:document.getElementById('sealedModalV161').scrollWidth,viewport:innerWidth}));assert.ok(fit.scroll<=width,JSON.stringify(fit));
await page.locator('#sealedModalV161').evaluate(e=>e.scrollTop=0);await page.screenshot({path:'/tmp/sealed-'+width+'.png'});
await page.locator('#sealedCloseV161').click();await page.reload();await page.waitForFunction(()=>window.tcgSealed&&!document.documentElement.classList.contains('modern-booting'));assert.equal(await page.evaluate(set=>tcgCollectorBridge.state().sealedV161.packCredits[set],selected),1);
await page.evaluate(()=>{const b=tcgCollectorBridge;const next=structuredClone(b.state());next.sealedV161={inventory:{},display:{},packCredits:{},history:[]};delete next.collectorV260.sealed;b.account=()=> 'isolated-other-account';b.commit(next);});await page.locator('[data-silver-action="3"]').click();assert.ok((await page.locator('.sealed-stats').textContent()).includes('OWNED 0'));assert.equal(await page.locator('.sealed-shelf article').count(),0);
assert.deepEqual(errors,[]);results.push({width,height,openMs:Math.round(openMs),stressCards:process.env.SEALED_STRESS?5000:0,transactions:true,persistence:true,...fit});await context.close();}
console.log(JSON.stringify(results,null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
