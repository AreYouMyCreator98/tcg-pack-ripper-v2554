/* Offline responsive battle UI QA. No account, wallet, or live Ranked state. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.LEAGUE_TEST_URL||'http://127.0.0.1:5187';
const styles=[...fs.readFileSync('index.html','utf8').matchAll(/<link[^>]+href="(\.\/styles\/[^\"]+)"[^>]*>/g)].map(m=>m[0].replace('./styles/','/styles/')).join('');

(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const [width,height] of [[360,800],[390,844],[430,932],[768,1024]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<700,hasTouch:true,colorScheme:'dark',reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(base+'/league-v265-test',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html class="theme-v261"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles+'<style>body{margin:0;background:#101214;color:white;font:16px Arial}*{box-sizing:border-box}.collector-nav-test{position:fixed;z-index:10;bottom:0;left:0;width:100%;height:65px;background:#222;border:1px solid #999;pointer-events:none}</style><section id="collectorLeague"></section><div class="collector-nav-test">Bottom navigation preview</div>'}));
  await page.goto(base+'/league-v265-test');
  await page.evaluate(async()=>{
   const {LeagueView}=await import('/src/league/view.js'),{battleStats}=await import('/src/league/rules.js');
   const mk=(id,name,type,weakness)=>({id,name,tier:0,rarity:'Common',hp:120,types:[type],weaknesses:[{type:weakness,value:'×2'}],attacks:[{name:'Quick Jab',damage:'30',cost:[type],effect:'Deal steady damage.'},{name:'Finishing Blow',damage:'90',cost:[type,type,'Colorless'],effect:'A powerful blow that costs more energy.'}],abilities:[{name:'Energy Shield',effect:'Prevent damage to this Pokémon.'}],thumb:'assets/ui/card-unavailable.svg'});
   const player=mk('p','Pikachu','Lightning','Fighting'),enemy=mk('e','Pidgey','Colorless','Lightning');
   const fighter=card=>({card,stats:battleStats(card),hp:120,energy:2,uses:2,cooldown:0,guarded:false});
   const squad=Array.from({length:5},(_,i)=>fighter({...player,id:'p-'+i}));
   const profile={user_id:'a',name:'QA Collector',rp:600,league_banner:{}};
   const controller={state:{phase:'BATTLE',data:{enabled:true,user_id:'a',profile,match:{id:'fixture',phase:'battle',revision:2,turn:1,host_id:'a',guest_id:'b',deadline:new Date(Date.now()+25000).toISOString(),combat:{a:{squad,active:0,kos:0},b:{squad:[fighter(enemy),...squad.slice(1)],active:0,kos:0}},last_turn:{}}}},art:new Map(),offset:0,revealTarget:0,matchCommand:async(action,payload)=>window.commands.push({action,payload}),command:async()=>{},emit:()=>{}};
   window.commands=[];window.testController=controller;window.testView=new LeagueView(document.getElementById('collectorLeague'),controller);testView.render();
  });
  assert.equal(await page.locator('.league-duel-arena').count(),1);
  assert.equal(await page.locator('.league-hp-panel').count(),2);
  await page.locator('[data-league="fight-menu"]').click();
  assert.equal(await page.locator('.league-duel-moves button').count(),2);
  assert.ok((await page.locator('.league-duel-moves').innerText()).includes('Finishing Blow'));
  await page.locator('[data-league="move-choice"][data-index="1"]').click();
  assert.deepEqual(await page.evaluate(()=>commands[0].payload.action),{kind:'attack',move:1});
  await page.locator('[data-league="ability-menu"]').click();
  assert.ok((await page.locator('.league-duel-ability').innerText()).includes('Energy Shield'));
  await page.locator('[data-league="back-moves"]').click();
  await page.locator('[data-league="swap-menu"]').click();
  await page.locator('[data-league="swap-target"][data-index="3"]').click();
  assert.deepEqual(await page.evaluate(()=>commands[1].payload.action),{kind:'swap',target:3});
  const metrics=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('.league-duel button')].filter(b=>!b.disabled).map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})),arenaHeight:document.querySelector('.league-duel-arena').getBoundingClientRect().height}));
  assert.ok(metrics.scrollWidth<=width+1,JSON.stringify(metrics));
  assert.ok(metrics.buttons.every(b=>b.width>=44&&b.height>=44),JSON.stringify(metrics));
  if(width===390)await page.screenshot({path:'/tmp/v265-ranked-battle-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log(width,height,'responsive battle OK',metrics.arenaHeight);
  await page.evaluate(()=>testView.dispose());await context.close();
 }}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
