const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.V260_TEST_URL||'http://127.0.0.1:5187';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
 try{for(const [width,height] of [[360,800],[390,844],[393,873],[412,915],[430,932],[768,1024],[1440,900],[844,390]]){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});const page=await context.newPage();
 // Hold the real boot, exercising the actual static loader/module deterministically.
 await page.route('**/src/main.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.goto(base);await page.evaluate(async()=>{window.loader=await import('./src/app/launch-screen.js');loader.beginLaunch();loader.setLaunchStage('POLISHING FIRST FRAME',89,'internal.js');});
 await page.waitForTimeout(1100);
 const state=await page.evaluate(()=>({packs:[...document.querySelectorAll('.cinePack img')].map(e=>({ok:e.complete&&e.naturalWidth>0,rect:e.getBoundingClientRect().toJSON()})),footer:document.querySelector('.cineFooter').getBoundingClientRect().toJSON(),bleed:getComputedStyle(document.querySelector('#app-root')).visibility,hint:document.querySelector('#tcgLaunchHint').textContent}));
 assert.equal(state.bleed,'hidden');assert.ok(!state.hint.includes('.js'));for(const p of state.packs){assert.ok(p.ok);assert.ok(p.rect.left>=0&&p.rect.right<=width&&p.rect.bottom<=height,JSON.stringify({width,height,...p}));}
 assert.ok(state.footer.bottom<=height);assert.ok(state.footer.top>=0);
 if(width===390)await page.screenshot({path:'/tmp/cinematic-loader.png'});
 await page.evaluate(()=>{loader.setLaunchStage('LOADING COLLECTION',47);});assert.equal(await page.locator('#tcgLaunchPct').textContent(),'89%');
 await context.setOffline(true);await page.evaluate(()=>loader.setLaunchStage('FINAL CHECK',96));assert.equal(await page.locator('#tcgLaunchStage').textContent(),'OFFLINE COLLECTION MODE');
 await page.evaluate(()=>{document.querySelector('.cineCenter img').dispatchEvent(new Event('error'));});assert.equal(await page.locator('.cineCenter img').evaluate(e=>e.style.visibility),'hidden');
 const duration=await page.evaluate(async()=>{const t=performance.now();await loader.finishLaunch();return performance.now()-t;});assert.ok(duration<700);assert.equal(await page.locator('#tcgLaunch').count(),0);assert.equal(await page.evaluate(()=>window.__TCG_BOOT_PHASE__),false);
 results.push({width,height,exitMs:Math.round(duration)});await context.close();
 }
 const page=await browser.newPage({reducedMotion:'reduce'});await page.route('**/src/main.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));await page.goto(base);await page.evaluate(async()=>{window.loader=await import('./src/app/launch-screen.js');loader.beginLaunch();});assert.equal(await page.locator('#tcgLaunch').getAttribute('data-motion'),'reduced');assert.equal(await page.locator('.smokeFront').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.evaluate(()=>loader.failLaunch('secret-stage',new Error('raw-debug')));assert.ok(await page.locator('#tcgLaunchRetry').isVisible());assert.ok(!(await page.locator('#tcgLaunchHint').textContent()).includes('raw-debug'));
 await page.evaluate(()=>{window.__TCG_BOOT_STARTED__=performance.now();});
 const warmExit=await page.evaluate(async()=>{const t=performance.now();await loader.finishLaunch();return performance.now()-t;});assert.ok(warmExit<300);
 console.log(JSON.stringify({warmExitMs:Math.round(warmExit),viewports:results,reducedMotion:true,retry:true,offline:true,failedImage:true,monotonicProgress:true},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
