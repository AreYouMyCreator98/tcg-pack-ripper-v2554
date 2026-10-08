// Explicit live CDN smoke; never part of ordinary CI or a full catalogue download.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.V260_TEST_URL||'http://127.0.0.1:5201';
const manifest=JSON.parse(fs.readFileSync('public/card-assets.json','utf8'));
const picks=['sv04.5','xy12','specials'].map(set=>Object.entries(manifest.cards).find(([,c])=>c.set===set));
assert.ok(picks.every(Boolean),'Upload modern, historical and custom pilots first');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage();await page.goto(base+'/build-info.json');const results=[];
 for(const [id,c] of picks)for(const tier of ['thumb','medium','high']){
  const result=await page.evaluate(async({url})=>{const start=performance.now();const r=await fetch(url,{cache:'reload'});if(!r.ok)throw Error('Artwork HTTP '+r.status);const blob=await r.blob();const img=new Image(),object=URL.createObjectURL(blob);img.src=object;await img.decode();const result={ms:Math.round(performance.now()-start),bytes:blob.size,width:img.naturalWidth,height:img.naturalHeight,type:blob.type};URL.revokeObjectURL(object);return result;},{url:c[tier]});
  assert.equal(result.bytes,c.bytes[tier]);assert.equal(result.type,'image/webp');assert.ok(result.width<=({thumb:240,medium:600,high:1200}[tier]));results.push({id,tier,...result});
 }
 fs.writeFileSync('/tmp/live-card-assets-report.json',JSON.stringify(results,null,2));console.log('PASS live modern/historical/custom artwork: all 9 tiers fetched and decoded',JSON.stringify(results));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
