const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const base=process.env.V260_PREVIEW_URL||'http://127.0.0.1:5185';
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[],accountRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',request=>{if(/supabase\.co\/(auth|rest|realtime)\//.test(request.url()))accountRequests.push(request.url());});
  await page.addInitScript(()=>{Object.defineProperty(Crypto.prototype,'randomUUID',{value:undefined,configurable:true});if(!localStorage.getItem('tcgRipperSave'))localStorage.setItem('tcgRipperSave',JSON.stringify({coins:999,packs:99,proof:'production-sentinel'}));});
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();if(url.hostname==='api.tcgdex.net'){const id=url.pathname.split('/').at(-1),path='public/catalog/'+id+'.json';return route.fulfill({contentType:'application/json',body:JSON.stringify(fs.existsSync(path)?{id,cards:JSON.parse(fs.readFileSync(path,'utf8'))}:{id,rarity:'Common'})});}return route.abort();});
  await page.goto(base);
  await page.waitForFunction(()=>window.tcgCollector&&!document.documentElement.classList.contains('modern-booting'));
  const state=await page.evaluate(()=>({preview:window.TCG_PREVIEW,configured:Object.keys(window.TCG_CLOUD_CONFIG).length,health:window.TCG_HEALTH.last.ok,original:JSON.parse(localStorage.getItem('tcgRipperSave')),previewSave:JSON.parse(localStorage.getItem('tcgPreviewV261_tcgRipperSave'))}));
  await page.evaluate(()=>{const tx=window.tcgCollector.transactions;tx.transact('chase',{...tx.review(),card:{id:'sv10-001',name:'Preview chase',setId:'sv10'}});});
  assert.equal(state.preview,true);assert.equal(state.configured,0);assert.equal(state.health,true);assert.equal(state.original.proof,'production-sentinel');assert.equal(state.original.coins,999);assert.equal(state.previewSave.coins,80);assert.equal(state.previewSave.packs,0);
  assert.equal(await page.evaluate(async()=>{try{await fetch('https://ddeuwrnfmdgvizkrjhii.supabase.co/rest/v1/user_saves',{method:'POST',body:'{}'});return false;}catch{return true;}}),true);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.tcgCollector&&!document.documentElement.classList.contains('modern-booting'));
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tcgRipperSave')).coins),999);
  assert.deepEqual(accountRequests,[]);assert.deepEqual(errors,[]);
  console.log('PASS: preview boot, healthy UI, separate save, production sentinel unchanged, no account requests, blocked cloud write, service-worker offline reload. Chromium simulation only.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
