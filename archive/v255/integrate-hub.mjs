import {readFile,writeFile,readdir} from 'node:fs/promises';
const read=p=>readFile(p,'utf8');
const change=async(p,fn)=>writeFile(p,fn(await read(p)));
// Preserve daily rewards and profile editing, not the old online hub or its wrappers.
const old=await read('public/runtime/multiplayer.js');
let rewards=old.slice(old.indexOf('/* ===== original script 61'),old.indexOf('/* ===== original script 62'));
const start=rewards.indexOf(' function processBattle('),end=rewards.indexOf(' function dailyState()',start);
rewards=rewards.slice(0,start)+' function processBattle(){return null;}\n'+rewards.slice(end);
const enhancer=rewards.indexOf(' window.tcgBattleEnhanceV221=');
const exports=rewards.indexOf(' window.tcgRankedV221=',enhancer);
if(enhancer>=0&&exports>=0)rewards=rewards.slice(0,enhancer)+rewards.slice(exports);
let profile=old.slice(old.indexOf('/* ===== original script 67'),old.indexOf('/* ===== original script 69'));
profile=profile.replaceAll('window.tcgMultiplayerV218?.client','window.__tcgSupabaseClient');
await writeFile('public/runtime/profile-extras.js','// Profile and daily reward compatibility; Trade Hub lives in src/trade-hub.\n'+rewards+profile);
await writeFile('public/runtime/hub-bridge.js',`// Narrow bridge to the collection state. No online decisions are made here.
window.tcgHubBridge={applyRank(p){if(!p)return;state.rankedV221=Object.assign(state.rankedV221||{history:[],processed:{}},{rp:p.rp,wins:p.wins,losses:p.losses,ties:p.ties,streak:p.streak,seasonHigh:p.season_high});try{window.tcgProfileV227?.renderIdentity?.()}catch{}}};
`);
await change('src/config/runtime-manifest.js',s=>s.replace(/export const secondaryRuntime = \[[\s\S]*?\];/,`export const secondaryRuntime = [
  'runtime/profile-extras.js',
  'runtime/rank-frames.js',
  'runtime/hub-bridge.js'
];`));
await change('src/app/runtime-loader.js',s=>s.replace("return loadGroup('secondary', secondaryRuntime, 14000);","return loadGroup('secondary', secondaryRuntime, 14000).then(async () => {\n    const { installTradeHub } = await import('../trade-hub/index.js');\n    installTradeHub();\n    return true;\n  });"));
await change('index.html',s=>s.replace('<link rel="stylesheet" href="./styles/multiplayer-v255.css?v=2553">','<link rel="stylesheet" href="./styles/trade-hub.css">'));
// Extend the existing cloud client with a scoped transaction barrier. Background saves
// cannot overwrite a transaction while its response is being reconciled.
await change('public/runtime/progression.js',s=>{
 s=s.replace('let client=null,user=null,syncTimer=null,syncBusy=false,authBusy=false,pushPausedUntil=0,cloudVersion=null,recoveryPending=false;','let client=null,user=null,syncTimer=null,syncBusy=false,authBusy=false,pushPausedUntil=0,cloudVersion=null,recoveryPending=false;\n  let hubHold=false;');
 s=s.replace('if(!client||syncBusy)return false;if(recoveryPending','if(!client||syncBusy||hubHold)return false;if(recoveryPending');
 s=s.replace('function queuePush(){if(!user||!client||recoveryPending)return;','function queuePush(){if(!user||!client||recoveryPending)return;if(hubHold){setDirty(true);return;}');
 const marker='  window.tcgCloudV192={';
 const at=s.indexOf(marker); if(at<0)throw new Error('Cloud bridge anchor missing');
 s=s.slice(0,at)+`  async function beginHubTransaction(){
    if(!user||recoveryPending)throw new Error('AUTH_REQUIRED');
    if(hubHold){if(!await pullInPlace(false))throw new Error('SYNC_REQUIRED');hubHold=false;}
    const deadline=Date.now()+8000;
    while(syncBusy&&Date.now()<deadline)await new Promise(r=>setTimeout(r,50));
    if(syncBusy||!await pushNow(false,true))throw new Error('SYNC_REQUIRED');
    hubHold=true;clearTimeout(syncTimer);syncTimer=null;
    document.documentElement.classList.add('hub-transaction-pending');
    return cloudVersion??storedVersion();
  }
  function holdHubTransaction(){hubHold=true;clearTimeout(syncTimer);syncTimer=null;document.documentElement.classList.add('hub-transaction-pending');}
  async function finishHubTransaction(){
    if(!hubHold)return;
    if(!await pullInPlace(false))throw Object.assign(new Error('Collection sync is pending. Reconnect before continuing.'),{uncertain:true});
    hubHold=false;document.documentElement.classList.remove('hub-transaction-pending');
  }
`+s.slice(at);
 s=s.replace(marker,marker+'beginHubTransaction,holdHubTransaction,finishHubTransaction,');return s;
});
await change('public/styles/trade-hub.css',s=>s+`\n/* Prevent collection mutations outside the hub during its short cloud transaction. */
.hub-transaction-pending .nav,.hub-transaction-pending .screen:not(#earn){pointer-events:none!important}
`);
// Harden helper ACLs after all functions have been created.
await change('supabase/migrations/20261003073323_trade_hub_v256.sql',s=>s+'\nrevoke all on all functions in schema hub_private from public,anon,authenticated;\ngrant execute on function hub_private.command(text,jsonb,uuid) to authenticated;\n');
const pkg=JSON.parse(await read('package.json'));pkg.version='0.256.0';pkg.scripts['test:hub']='node --test tests/trade-hub*.test.mjs';await writeFile('package.json',JSON.stringify(pkg,null,2)+'\n');
await change('src/config/app-config.js',s=>s.replaceAll('0.255.4','0.256.0').replaceAll('v2554-system-reliability-1','v256-trade-hub-1').replaceAll('tcg-v2554-1','tcg-v256-1').replace('multiplayerArenaV255: true','multiplayerArenaV255: false').replace('globalChatV255: true','globalChatV255: false,\n    tradeHubV256: true'));
await writeFile('VERSION','0.256.0\n');
await change('src/main.js',s=>s.replace('app-config.js?v=2554','app-config.js?v=256'));
await change('public/sw.js',s=>s.replaceAll('0.255.4-1','0.256.0-1').replace("'./styles/multiplayer-v255.css'","'./styles/trade-hub.css'").replace("'./runtime/multiplayer.js'","'./runtime/profile-extras.js','./runtime/hub-bridge.js'").replace(",'./runtime/ranked.js','./runtime/multiplayer-v255.js'",'').replace("'./src/main.js'","'./src/main.js','./src/trade-hub/index.js','./src/trade-hub/model.js','./src/trade-hub/controller.js','./src/trade-hub/view.js','./src/data/ranks.js'"));
await change('scripts/validate-project.mjs',s=>s.replace("'public/runtime/multiplayer.js','public/runtime/ranked.js'","'public/runtime/profile-extras.js','src/trade-hub/index.js'").replace("'multiplayer','ranked',","'profile-extras','hub-bridge',"));
console.log('Trade Hub integration complete.');
