const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
const base=process.env.V260_TEST_URL||'http://127.0.0.1:5200';
const sample=fs.readFileSync('public/assets/specials/sp_eevee.webp');
const host='https://ddeuwrnfmdgvizkrjhii.supabase.co/storage/v1/object/public/card-assets/cards/test/';
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
let offline=false;const context=await browser.newContext();await context.route('https://ddeuwrnfmdgvizkrjhii.supabase.co/storage/**',r=>offline?r.abort():r.fulfill({contentType:'image/webp',headers:{'access-control-allow-origin':'*'},body:sample}));const page=await context.newPage();await page.goto(base+'/build-info.json');
await page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;});await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
for(const [tier,limit] of [['thumb',1000],['medium',300],['high',100]]){
 await page.evaluate(async({tier,limit,host})=>{const names=await caches.keys();const name=names.find(n=>n.endsWith('-cards-'+tier))||names.find(n=>n.endsWith('-static')).replace(/-static$/,'-cards-'+tier);const cache=await caches.open(name);for(let n=0;n<limit+3;n++)await cache.put(host+'seed'+n+'/hash/'+tier+'.webp',new Response('seed',{headers:{'content-type':'image/webp'}}));},{tier,limit,host});
 const url=host+'online/hash/'+tier+'.webp';assert.ok(await page.evaluate(async u=>{const img=new Image();img.src=u;await img.decode();return img.naturalWidth;},url));
 await page.waitForFunction(async u=>!!(await caches.match(u)),url);
 assert.equal(await page.evaluate(async u=>(await (await caches.match(u)).arrayBuffer()).byteLength,url),sample.length);
 await page.waitForFunction(async({tier,limit})=>{const n=(await caches.keys()).find(n=>n.endsWith('-cards-'+tier));return (await (await caches.open(n)).keys()).length<=limit;},{tier,limit});
}
const worker=context.serviceWorkers()[0];
await worker.evaluate(()=>{self.__cacheOpen=caches.open.bind(caches);caches.open=async()=>{throw new DOMException('fixture quota','QuotaExceededError');};});
assert.ok(await page.evaluate(async u=>{const i=new Image();i.src=u;await i.decode();return i.naturalWidth;},host+'quota/hash/thumb.webp'));
await worker.evaluate(()=>{caches.open=self.__cacheOpen;delete self.__cacheOpen;});
offline=true;await context.setOffline(true);
for(const tier of ['thumb','medium','high'])assert.equal(await page.evaluate(async u=>(await (await fetch(u)).arrayBuffer()).byteLength,host+'online/hash/'+tier+'.webp'),sample.length);
const fallback=await page.evaluate(async u=>{const r=await fetch(u);return [r.headers.get('content-type'),await r.text()];},host+'uncached/hash/thumb.webp');assert.ok(fallback[0].includes('svg'));assert.ok(fallback[1].includes('ARTWORK UNAVAILABLE'));
console.log('PASS bounded caches 1000/300/100, cached offline art, uncached offline placeholder, quota failure network fallback');await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
