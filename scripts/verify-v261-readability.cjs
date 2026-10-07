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

// Real computed contrast regression for the native dialog that previously sat
// outside the theme scope. External services are fixtures, never live saves.
function luminance(c) { const v=c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2]; }
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const report=[];
 try {for(const mode of ['light','dark','auto-dark','forced-colors']) {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',colorScheme:mode==='light'?'light':'dark',forcedColors:mode==='forced-colors'?'active':'none',reducedMotion:'reduce'});
 const page=await context.newPage();
 if(mode==='auto-dark')await (await context.newCDPSession(page)).send('Emulation.setAutoDarkModeOverride',{enabled:true});
  await page.addInitScript(save=>{if(!localStorage.getItem('tcgRipperSave'))localStorage.setItem('tcgRipperSave',JSON.stringify(save));},seed);
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();if(url.hostname==='api.tcgdex.net'){const id=decodeURIComponent(url.pathname.split('/').at(-1));let body;if(url.pathname.includes('/sets/')){const p='supabase/catalog/'+id+'.json';const cards=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')).map(r=>r.card):catalog.map(r=>r.card);body={id,cardCount:{official:cards.length,total:cards.length},cards};}else body=catalog.find(r=>r.id===id)?.card||{id,rarity:'Common',pricing:{}};return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});}if(/\.(png|webp|jpg)/.test(url.pathname))return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOZkAAAAASUVORK5CYII=','base64')});return route.abort();});
 await page.goto(base);await page.waitForFunction(()=>window.tcgSilverShell&&!document.documentElement.classList.contains('modern-booting'));
 assert.equal(await page.locator('meta[name="color-scheme"]').getAttribute('content'),'only dark');
 if(mode!=='forced-colors')assert.match(await page.locator('html').evaluate(e=>getComputedStyle(e).colorScheme),/only dark|dark only/);
 for(const destination of ['collection','hub','profile','rip']){
   await page.evaluate(d=>window.tcgNavigation.go(d),destination);
   assert.ok(await page.locator('.screen.active').isVisible());
 }
 await page.locator('[data-silver-action="0"]').click();
 const rows=await page.locator('.silver-info').evaluate(dialog=>{
  const rgb=s=>s.match(/[\d.]+/g).map(Number);
  return [...dialog.querySelectorAll('h2,b,p,button')].map(e=>{
   const cs=getComputedStyle(e);return {text:e.textContent.trim().slice(0,60),fg:rgb(cs.color),bg:rgb(getComputedStyle(e.tagName==='BUTTON'?e:dialog).backgroundColor),opacity:cs.opacity};
  });
 });
 for(const row of rows){assert.equal(row.opacity,'1',row.text);assert.ok(contrast(row.fg,row.bg)>=4.5,mode+' '+JSON.stringify(row));}
 await page.screenshot({path:'/tmp/v261-readability-'+mode+'.png'});
 await page.locator('.silver-info form button').click();assert.equal(await page.locator('.silver-info').isVisible(),false);
 report.push({mode,textNodes:rows.length,minContrast:Math.min(...rows.map(r=>contrast(r.fg,r.bg)))});
 await context.close();
 }
 fs.writeFileSync('/tmp/v261-readability.json',JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
