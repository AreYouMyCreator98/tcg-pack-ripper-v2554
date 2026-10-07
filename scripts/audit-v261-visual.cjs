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
const sizes=process.env.V260_TEST_PACKS?[[390,844]]:[[360,800],[390,844],[393,873],[412,915],[430,932],[768,1024],[1440,900]];


(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});const page=await context.newPage();
  await page.addInitScript(save=>{if(!localStorage.getItem('tcgRipperSave'))localStorage.setItem('tcgRipperSave',JSON.stringify(save));},seed);
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();if(url.hostname==='api.tcgdex.net'){const id=decodeURIComponent(url.pathname.split('/').at(-1));let body;if(url.pathname.includes('/sets/')){const p='supabase/catalog/'+id+'.json';const cards=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')).map(r=>r.card):catalog.map(r=>r.card);body={id,cardCount:{official:cards.length,total:cards.length},cards};}else body=catalog.find(r=>r.id===id)?.card||{id,rarity:'Common',pricing:{}};return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});}if(/\.(png|webp|jpg)/.test(url.pathname))return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOZkAAAAASUVORK5CYII=','base64')});return route.abort();});


await page.goto(base);await page.waitForFunction(()=>window.tcgSilverShell&&!document.documentElement.classList.contains('modern-booting'));await page.waitForTimeout(1000);
const report=[];
async function shot(name){await page.waitForTimeout(150);await page.screenshot({path:'/tmp/v261-'+name+'.png'});const light=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(r.width<65||r.height<22||r.top>innerHeight||r.bottom<0||!e.checkVisibility?.())return false;const rgb=s.backgroundColor.match(/[\d.]+/g)?.map(Number);return rgb&&rgb[0]>180&&rgb[1]>180&&rgb[2]>180&&(rgb.length<4||rgb[3]>.3);}).map(e=>({id:e.id,cls:e.className,color:getComputedStyle(e).backgroundColor})));report.push({name,light});}
await shot('rip-final');console.log(await page.locator('#v114Cost').evaluate(e=>({text:e.textContent,style:getComputedStyle(e).cssText,rect:e.getBoundingClientRect().toJSON()})));
for(const tab of ['cards','master','grading','slabs','bulk','sealed']){await page.evaluate(tab=>window.tcgNavigation.go('collection',tab),tab);await shot(tab);}
await page.evaluate(()=>window.tcgNavigation.go('collection','cards'));await page.getByRole('button',{name:'SPECIAL COLLECTION',exact:true}).click();await shot('specials');
await page.evaluate(()=>window.tcgNavigation.go('hub'));await shot('hub');for(const tab of await page.locator('[data-hub-tab]').evaluateAll(es=>es.map(e=>e.dataset.hubTab))){await page.locator('[data-hub-tab="'+tab+'"]').click();await shot('hub-'+tab);}
await page.evaluate(()=>window.tcgNavigation.go('profile'));for(const tab of ['overview','progress','customise','stats']){await page.locator('[data-profile-mode-v160="'+tab+'"]').click();await shot('profile-'+tab);}
await page.locator('#collectorSettings').click();await shot('settings');await page.locator('#closeProfileSettingsV158').click();
await page.evaluate(()=>window.tcgNavigation.go('rip'));
for(const [open,close,name] of [['#openPullRates','#ratesClose','rates'],['#gameClockV170','#gameCalendarCloseV170','calendar'],['#studioChooseSet','#studioCloseSets','set-selector'],['[data-silver-action="1"]','#setChaseCloseV186','chase-guide'],['[data-silver-action="3"]','#sealedCloseV161','sealed-shop']]){await page.locator(open).click();await shot(name);await page.locator(close).click();await page.evaluate(()=>window.tcgNavigation.go('rip'));}
await page.evaluate(()=>window.tcgNavigation.go('collection','cards'));await page.locator('[data-inspect-card]').first().click();await shot('inspector');await page.locator('article [data-inspector-action="close"]').click();
await page.locator('[data-binder-view="book"]').click();await shot('physical-binder');
fs.writeFileSync('/tmp/v261-visual-audit.json',JSON.stringify(report,null,2));await browser.close();})().catch(e=>{console.error(e);process.exitCode=1;});
